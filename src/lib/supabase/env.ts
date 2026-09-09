function firstDefined(...values: Array<string | undefined>): string | undefined {
  return values.find((value) => value && value.trim().length > 0);
}

export function getSupabaseUrl(): string | undefined {
  return firstDefined(process.env.NEXT_PUBLIC_SUPABASE_URL);
}

export function getSupabasePublishableKey(): string | undefined {
  return firstDefined(
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabasePublishableKey());
}

export function requireSupabaseEnv(): {
  url: string;
  publishableKey: string;
} {
  const url = getSupabaseUrl();
  const publishableKey = getSupabasePublishableKey();

  if (!url || !publishableKey) {
    throw new Error(
      "Supabase env is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or ANON_KEY).",
    );
  }

  return { url, publishableKey };
}
