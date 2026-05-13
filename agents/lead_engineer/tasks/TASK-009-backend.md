# TASK-009 | Backend

상태: 대기
담당: Backend Engineer
생성일: 2026-05-13
참조: CYCLE-003, agents/ceo/PLAN-003.md

---

## 목표

`.vercelignore`를 생성해 내부 개발 파일이 Vercel 배포에서 제외되도록 한다.
`vercel.json`을 검토해 문제가 있으면 수정한다.

## 작업 내용

### 1. vercel.json 검토

`vercel.json`을 읽고 다음을 확인한다:
- `/` rewrite가 `/public/index.html`을 올바르게 가리키는가
- `.md` 파일 Content-Type 헤더가 설정되어 있는가
- 캐시 헤더가 nginx.conf와 동등한가
- 문제가 없으면 그대로 둔다. 수정이 필요한 경우만 변경한다.

### 2. .vercelignore 생성

프로젝트 루트에 `.vercelignore` 파일을 생성한다.
제외 대상:

```
agents/
CLAUDE.md
deploy.sh
nginx.conf
Dockerfile
docker-compose.yml
.dockerignore
scripts/
```

`.vercelignore`는 `.gitignore`와 같은 문법을 사용한다.
이 파일에 나열된 경로는 Vercel 배포 번들에 포함되지 않아 HTTP로 접근 불가능해진다.

### 3. 확인 사항

- `public/` 디렉토리는 `.vercelignore`에 넣지 않는다 (앱 파일)
- `src/` 디렉토리는 `.vercelignore`에 넣지 않는다 (이미지 등 리소스)
- `docs/` 디렉토리는 `.vercelignore`에 넣지 않는다 (매뉴얼 마크다운)

## 완료 기준

- `.vercelignore` 파일이 프로젝트 루트에 존재함
- `agents/`, `CLAUDE.md`, `deploy.sh`, `nginx.conf`, `Dockerfile`이 제외 목록에 포함됨
- `public/`, `src/`, `docs/`는 제외 목록에 없음

## 완료 기록 (작업 후 이 섹션을 채울 것)

```
완료일: 2026-05-13
결과: .vercelignore 생성 완료. vercel.json 검토 결과 수정 불필요.
변경 파일: .vercelignore (신규)
이슈: 없음
인수 사항:
  - vercel.json: rewrite 방식(URL 유지). nginx의 301 redirect와 달리 브라우저 URL이 /로 유지됨.
  - .vercelignore 제외 목록: agents/, CLAUDE.md, deploy.sh, nginx.conf, Dockerfile, docker-compose.yml, .dockerignore, scripts/
  - public/, src/, docs/는 포함(제외 안 함) — 앱 동작에 필요
  - Docker 설정은 변경 없음. 로컬 개발은 기존대로 ./deploy.sh
```
