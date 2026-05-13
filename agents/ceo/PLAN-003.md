# PLAN-003 — Vercel 배포 준비

작성일: 2026-05-13
작성자: CEO
참조: CYCLE-002 완료, vercel.json 생성됨, BTC-005
상태: 확정

---

## 상황 인식

CYCLE-001, 002를 통해 Docker + nginx 로컬 배포가 완성됐다.
사용자가 vercel.json을 직접 생성했고 Vercel을 현재 배포 목표로 확정했다.
미래에 전용 서버를 쓸 수 있지만, 지금은 Vercel이 우선이다.

이 전환이 만드는 두 가지 변화를 반드시 처리해야 한다:

### 변화 1: BTC-005가 공개 위협으로 격상

Docker(내부망) 환경에서는 BTC-005(내부 파일 HTTP 노출)가 낮은 위험이었다.
Vercel에 배포하면 `agents/`, `deploy.sh`, `CLAUDE.md`, `nginx.conf` 등이
**공개 인터넷에서 누구나 접근 가능**해진다. 반드시 차단해야 한다.

해결책: `.vercelignore` 파일로 배포에서 제외.

### 변화 2: BTC-004(GPS)가 자동 해결됨

Vercel은 HTTPS를 기본 제공한다.
geolocation API는 HTTPS에서 동작하므로 GPS 기능이 작동하게 된다.

---

## 목표

Vercel에 배포 가능한 상태를 만든다.

## 성공 기준

- [ ] `.vercelignore`가 있어서 `agents/`, `CLAUDE.md`, `deploy.sh`, `nginx.conf`, `Dockerfile` 등이 Vercel 배포에서 제외됨
- [ ] `vercel.json`이 올바르게 작동함 (`/` → `/public/index.html` rewrite)
- [ ] main 브랜치에 Vercel 관련 파일이 모두 커밋됨
- [ ] Docker 로컬 환경은 그대로 유지됨

## 제약

- `public/index.html` 코드 수정 없음
- Docker/nginx 설정 변경 없음 (로컬 개발용으로 그대로 유지)
- BTC-001, 002, 003은 이번 사이클 범위 밖 (별도 판단 필요)

## 불포함

- Vercel CLI 설치 또는 실제 배포 실행 (환경 의존)
- 커스텀 도메인 설정
- 환경변수 관리

## 우선순위

1. `.vercelignore` 생성 (BTC-005 Vercel 차단)
2. `vercel.json` 검토 및 보완 필요 시 수정
3. git 커밋 + main merge

## 승인

CEO 승인: ✅ 2026-05-13
