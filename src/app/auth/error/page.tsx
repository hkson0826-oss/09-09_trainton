import Link from "next/link";

export default async function AuthErrorPage(
  props: PageProps<"/auth/error">,
) {
  const params = await props.searchParams;
  const raw = params.error;
  const code = typeof raw === "string" ? raw : "unknown";

  return (
    <main className="auth-error">
      <p className="brand">Trainton</p>
      <h1>로그인에 문제가 발생했습니다</h1>
      <p>
        카카오 로그인 또는 콜백 처리 중 오류가 발생했습니다. 설정을 확인한 뒤
        다시 시도해 주세요.
      </p>
      <p className="error-code">오류 코드: {code}</p>
      <Link href="/" className="text-link">
        로그인 화면으로 돌아가기
      </Link>
    </main>
  );
}
