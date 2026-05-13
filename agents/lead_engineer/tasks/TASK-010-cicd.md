# TASK-010 | CI/CD

상태: TASK-009 완료 후 시작
담당: CI/CD Engineer
생성일: 2026-05-13
참조: CYCLE-003

---

## 목표

TASK-009에서 생성된 파일들을 feature 브랜치에 커밋하고 main에 머지한다.
vercel.json도 아직 커밋되지 않았다면 함께 처리한다.

## 작업 순서

```
1. git status 확인 — 미커밋 파일 파악
2. feature/TASK-009-vercel 브랜치 생성
3. vercel.json + .vercelignore + TASK-009 완료기록 + CYCLE-003 파일 커밋
4. git push
5. gh pr create
6. gh pr merge --squash --delete-branch
```

### 브랜치 생성

```bash
git checkout main && git pull origin main
git checkout -b feature/TASK-009-vercel
```

### 커밋 대상 파일

- `vercel.json` (사용자가 생성한 파일, 아직 미커밋이면 포함)
- `.vercelignore` (TASK-009에서 생성)
- `agents/lead_engineer/tasks/TASK-009-backend.md` (완료 기록 포함 후)
- `agents/lead_engineer/tasks/TASK-010-cicd.md` (이 파일)
- `agents/lead_engineer/tasks/TASK-011-qa.md`
- `agents/lead_engineer/CYCLE-003.md`
- `agents/ceo/PLAN-003.md`

### 커밋 메시지

```
feat: add Vercel deployment config and .vercelignore

- vercel.json: rewrite / → /public/index.html, cache headers
- .vercelignore: exclude agents/, CLAUDE.md, deploy.sh, nginx.conf, Dockerfile
```

## 완료 기준

- feature/TASK-009-vercel 브랜치가 main에 머지됨
- vercel.json, .vercelignore가 main에 존재함

## 완료 기록 (작업 후 이 섹션을 채울 것)

```
완료일:
결과:
커밋 해시:
PR 번호:
이슈:
인수 사항:
```
