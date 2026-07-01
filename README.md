# gov

정부지원금 AI 추천 SaaS — **GrantFinder**

## 기능

- 기업마당 공공 API 실시간 연동
- OpenRouter **무료 모델** 기반 AI 맞춤 추천 (실패 모델 자동 제외)
- 북마크 · 마감 알림 · 기업 프로필

## 환경변수

`.env.local` 파일을 생성하고 `.env.example`을 참고하세요.

```bash
cp .env.example .env.local
```

## 실행

```bash
npm install
npm run dev
```

기본 포트: **60003** — http://localhost:60003

## 기술 스택

- Next.js 15 · TypeScript · Tailwind CSS
- 기업마당 API · OpenRouter API
