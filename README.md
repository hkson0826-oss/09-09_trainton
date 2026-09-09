# BE_trainton

광고를 보면 데이터가 바로 충전되는 Trainton MVP 백엔드/웹 저장소입니다.

## 현재 구현

- Next.js App Router + TypeScript
- Supabase Auth SSR (`@supabase/ssr`)
- **Kakao 로그인만** 연결 (Google은 미포함)
- 로그인 랜딩 → OAuth 콜백 → `/dashboard`
- 최초 로그인 시 `profiles` / `data_accounts` 생성
- `GET /api/me` 본인 정보 조회

설정 방법: [docs/auth-kakao.md](docs/auth-kakao.md)

## 로컬 실행

```bash
cp .env.example .env.local
# Supabase/Kakao 값 입력 후
npm install
npm run dev
```

Kakao 콘솔과 Supabase Provider 설정이 끝나기 전에는
`NEXT_PUBLIC_KAKAO_AUTH_ENABLED=false`로 두고 **설정 대기** 상태를 유지하세요.
