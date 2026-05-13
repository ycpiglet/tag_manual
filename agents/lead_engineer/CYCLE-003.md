# CYCLE-003 — Vercel 배포 준비

작성일: 2026-05-13
작성자: Lead Engineer
참조: agents/ceo/PLAN-003.md
상태: 진행 중

---

## 현황 요약 (인수인계용)

### 직전 사이클 결과

- CYCLE-001: Docker + nginx 로컬 배포 완료
- CYCLE-002: 내부망 접근 + URL 리다이렉트 완료, BTC-005 발견
- 배포 전략 변경: Docker(내부망) → **Vercel(우선)**, Docker는 로컬 개발용 유지

### 현재 파일 상태

- `vercel.json`: 사용자가 직접 생성. `/` → `/public/index.html` rewrite + 헤더 설정
- `.vercelignore`: **없음** → BTC-005 Vercel 버전 대응을 위해 생성 필요
- `nginx.conf`, `Dockerfile`, `docker-compose.yml`: 로컬용으로 유지
- git: main 브랜치 최신 (fba722e)

### BTC-005 Vercel 위험도

| 파일/경로 | Docker(내부망) | Vercel(공개) |
|-----------|---------------|-------------|
| `agents/` 문서들 | 낮음 | **높음** |
| `.git/config` | 낮음 | Vercel 플랫폼이 차단 (자동) |
| `deploy.sh` | 낮음 | **높음** |
| `CLAUDE.md` | 낮음 | **높음** |
| `nginx.conf` | 낮음 | 중간 |

---

## 이번 사이클 태스크

| ID | 담당 | 내용 | 상태 | 의존성 |
|----|------|------|------|--------|
| TASK-009 | Backend | `.vercelignore` 생성 + `vercel.json` 검토 | 대기 | 없음 |
| TASK-010 | CI/CD | feature 브랜치 + commit + PR + main 머지 | 대기 | TASK-009 완료 후 |
| TASK-011 | QA | vercel.json rewrite 로직 검증 + .vercelignore 파일 목록 확인 | 대기 | TASK-009 완료 후 |

### 의존성

```
TASK-009 (Backend) ←── 즉시 시작
    ↓
TASK-010 (CI/CD) + TASK-011 (QA) ←── 병렬 시작 가능
```

---

## PLAN 단계 기록

- `.vercelignore`에 포함할 대상: `agents/`, `CLAUDE.md`, `deploy.sh`, `nginx.conf`, `Dockerfile`, `docker-compose.yml`, `.dockerignore`, `scripts/`
- `vercel.json`은 사용자가 이미 작성. rewrite 방식(URL 유지)으로 nginx의 301 redirect보다 UX 개선됨.
- Docker 설정은 건드리지 않는다. 로컬 개발용으로 독립적으로 유지.
- BTC-004(GPS): Vercel HTTPS로 자동 해결 예정. QA가 배포 후 확인.

---

## REVIEW (사이클 완료 후 작성)

_미완료_

## COMPOUND

_없음_
