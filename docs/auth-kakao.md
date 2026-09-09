# Kakao 로그인 설정 체크리스트

이 문서는 MVP 1번(로그인)에서 **Kakao만** 연결하기 위한 운영 설정입니다. Google은 이번 범위에서 제외합니다.

## 1. Supabase 프로젝트

1. Supabase 프로젝트를 생성합니다.
2. Project Settings → API에서 Project URL과 publishable/anon key를 복사합니다.
3. `.env.local`에 다음을 넣습니다.

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
NEXT_PUBLIC_KAKAO_AUTH_ENABLED=false
```

4. `supabase/migrations/202609090001_auth_profiles.sql`을 SQL Editor에서 실행합니다.

## 2. Kakao Developers

공식 가이드: https://developers.kakao.com/docs/latest/ko/kakaologin/common  
Supabase Kakao 가이드: https://supabase.com/docs/guides/auth/social-login/auth-kakao

1. Kakao Developers에서 앱을 생성합니다.
2. REST API 키 = Supabase Kakao `client_id`
3. Kakao Login Client Secret을 활성화하고 값을 복사합니다. (`client_secret`)
4. Redirect URI에 Supabase 콜백을 등록합니다.

```text
https://<PROJECT_REF>.supabase.co/auth/v1/callback
```

로컬 Supabase CLI를 쓰는 경우:

```text
http://localhost:54321/auth/v1/callback
```

5. Product Settings → Kakao Login → 사용 설정을 ON으로 둡니다.
6. 동의 항목: `profile_nickname`, `profile_image` (이메일이 필요 없으면 `account_email` 생략 가능)

## 3. Supabase Auth Provider

1. Authentication → Providers → Kakao를 Enabled로 켭니다.
2. Client ID / Client Secret을 입력합니다.
3. 이메일을 받지 않는다면 “Allow users without an email”을 켭니다.
4. Authentication → URL Configuration에서 Redirect URLs에 앱 콜백을 추가합니다.

```text
http://localhost:3000/auth/callback
https://YOUR_PRODUCTION_DOMAIN/auth/callback
```

Site URL도 로컬/배포 환경에 맞게 구분합니다.

## 4. 앱에서 Kakao 활성화

설정이 끝난 뒤에만:

```bash
NEXT_PUBLIC_KAKAO_AUTH_ENABLED=true
```

그 전에는 로그인 버튼이 **설정 대기**로 표시되며, 가짜 성공 버튼을 노출하지 않습니다.

## 5. 동작 확인

1. `/`에서 카카오 로그인
2. 동의 후 `/auth/callback` → `/dashboard`
3. 새로고침해도 세션 유지
4. 로그아웃 시 랜딩으로 이동하고 개인 잔액 UI가 사라짐
5. `GET /api/me`는 로그인 상태에서만 본인 정보 반환

## 검증 기록

| 항목 | 상태 |
| --- | --- |
| Kakao OAuth 실제 계정 로그인 | 설정 대기 (자격 증명 필요) |
| Google 로그인 | 이번 PR 범위 제외 |
| 프로필/data_accounts 생성 | 트리거 + `ensure_own_data_account()` (잔액 INSERT는 서버 전용 0행만) |
| 세션 만료/취소 문구 | 구현됨 |
