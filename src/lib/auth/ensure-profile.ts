import type { SupabaseClient, User } from "@supabase/supabase-js";

export type Profile = {
  user_id: string;
  display_name: string | null;
  created_at: string;
};

function resolveDisplayName(user: User): string | null {
  const metadata = user.user_metadata ?? {};
  const candidates = [
    metadata.full_name,
    metadata.name,
    metadata.nickname,
    metadata.preferred_username,
    user.email?.split("@")[0],
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim().length > 0) {
      return candidate.trim().slice(0, 80);
    }
  }

  return null;
}

/**
 * Create a minimal profile once per auth user. Safe to call repeatedly.
 * Ownership is always taken from the verified auth user, never from client input.
 */
export async function ensureProfile(
  supabase: SupabaseClient,
  user: User,
): Promise<Profile | null> {
  const { data: existing, error: existingError } = await supabase
    .from("profiles")
    .select("user_id, display_name, created_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingError) {
    console.error("ensureProfile select failed", {
      code: existingError.code,
      message: existingError.message,
    });
  }

  let profile = existing;

  if (!profile) {
    const displayName = resolveDisplayName(user);
    const { data, error } = await supabase
      .from("profiles")
      .insert({
        user_id: user.id,
        display_name: displayName,
      })
      .select("user_id, display_name, created_at")
      .single();

    if (error) {
      // Concurrent first-login requests may race on the unique user_id.
      if (error.code === "23505") {
        const { data: raced } = await supabase
          .from("profiles")
          .select("user_id, display_name, created_at")
          .eq("user_id", user.id)
          .maybeSingle();
        profile = raced;
      } else {
        console.error("ensureProfile insert failed", {
          code: error.code,
          message: error.message,
        });
        return null;
      }
    } else {
      profile = data;
    }
  }

  const { error: dataAccountError } = await supabase.from("data_accounts").upsert(
    {
      user_id: user.id,
      balance_mb: 0,
      total_charged_mb: 0,
      version: 0,
    },
    {
      onConflict: "user_id",
      ignoreDuplicates: true,
    },
  );

  if (dataAccountError) {
    console.error("ensure data_accounts failed", {
      code: dataAccountError.code,
      message: dataAccountError.message,
    });
  }

  return profile;
}
