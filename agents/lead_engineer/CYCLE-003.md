# CYCLE-003 — Vercel 배포 준비

작성일: 2026-05-13
작성자: Lead Engineer
참조: agents/ceo/PLAN-003.md
상태: 완료

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

### 완료 현황

| ID | 담당 | 결과 |
|----|------|------|
| TASK-009 | Backend | 완료. `.vercelignore` 생성. `vercel.json` 검토 후 수정 불필요 판정. |
| TASK-010 | CI/CD | 완료. PR #2 squash merge → main (df445f4). |
| TASK-011 | QA | 완료. 전체 통과. |

### 주요 발견 사항

1. **SSH 전환 필요**: `gh auth status`는 정상이지만 HTTPS git push 실패. git remote를 SSH URL로 변경해 해결. 이후 모든 push는 SSH 사용.

2. **squash merge + 로컬 미push = 히스토리 분기**: 로컬 8개 커밋이 원격에 없는 상태에서 PR squash merge하면 local/remote main이 분기됨. squash commit이 feature 브랜치 전체를 포함하므로 `git reset --hard origin/main`으로 해결. 향후 커밋은 push를 먼저 하거나, PR 전 로컬 main을 remote와 동기화해야 함.

3. **vercel.json rewrite**: nginx의 301 redirect와 달리 URL이 `/`로 유지됨. 사용자 입장에서 더 자연스러운 UX.

4. **BTC-004 자동 해결 예상**: Vercel 배포 시 HTTPS 기본 제공으로 GPS 기능 활성화 예정.

### 미처리/다음 사이클 고려사항

- Vercel 실제 배포 실행 (vercel CLI 또는 GitHub 연동)
- 배포 후 BTC-004(GPS) 동작 확인
- BTC-001, 002, 003 수정 여부 판단
- TASK-010 완료기록 커밋 (현재 uncommitted)

## COMPOUND

### COMPOUND-001

날짜: 2026-05-13
발견한 패턴: 로컬 커밋을 원격에 push하지 않은 상태에서 PR을 만들고 merge하면 local/remote main 히스토리가 분기됨.
근본 원인: HTTPS push 실패로 인해 로컬 커밋들이 원격에 없었고, feature 브랜치만 push됨.
개선 조치: feature 브랜치 생성 전 항상 `git push origin main`으로 로컬 main을 원격과 동기화. HTTPS 안 되면 SSH로 즉시 전환.
적용 대상: CI/CD Engineer
상태: 적용 완료
