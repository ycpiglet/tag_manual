# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

---

## Multi-Agent Architecture

이 프로젝트는 멀티 에이전트 하네스로 운영됩니다. 각 에이전트는 명확한 역할과 책임을 가지며, 정해진 커뮤니케이션 구조와 작업 루프를 따릅니다.

### 에이전트 구조

```
CEO
 └─ Lead Engineer
      ├─ UI/UX Designer     (프론트엔드 개발 + 사용자 경험 설계)
      ├─ Backend Engineer    (서버 + DB + 인프라)
      ├─ CI/CD Engineer      (git 관리 + 배포 파이프라인 + 변경 이력)
      ├─ QA                  (품질 검증 + 기술적 테스트)
      └─ Beta Tester         (사용자 관점 탐색 + 에러 케이스 발견)
```

### 역할 요약

| 에이전트 | 디렉토리 | 핵심 역할 |
|----------|----------|-----------|
| CEO | `agents/ceo/` | 비전, 의사결정, 방향 유지, 최종 승인 |
| Lead Engineer | `agents/lead_engineer/` | Plan 수립, 업무 분장, Review, Compound |
| UI/UX Designer | `agents/uiux_designer/` | 프론트엔드 구현, 사용성/접근성 설계 |
| Backend Engineer | `agents/backend_engineer/` | API, DB, 인증, 배포 인프라 |
| CI/CD Engineer | `agents/cicd_engineer/` | git 관리, 브랜치, PR, 배포 파이프라인 |
| QA | `agents/qa/` | 기술적 테스트, 버그 리포트, 품질 게이트 |
| Beta Tester | `agents/beta_tester/` | 일반 사용자 시뮬레이션, 에러 케이스 발견 |

각 역할의 세부 책임과 형식은 해당 디렉토리의 `SKILL.md`를 참고합니다.

---

## 작업 루프: Plan → Work → Review → Compound

모든 작업은 이 루프를 반복하며 진행됩니다.

```
┌─────────────────────────────────────────────────┐
│  PLAN    CEO + Lead Engineer가 목표와 범위 확정  │
│    ↓                                             │
│  WORK    팀원이 작업 수행 + 완료 기록 작성       │
│    ↓                                             │
│  REVIEW  Lead Engineer가 결과 검토 + 방향 점검  │
│    ↓                                             │
│  COMPOUND 반복 실수/비효율 → 프로세스 개선       │
│    ↓                                             │
│  PLAN (다음 사이클)                              │
└─────────────────────────────────────────────────┘
```

- Plan 없이 Work를 시작하지 않습니다.
- 사이클 중간에 범위를 늘리지 않습니다.
- 같은 실수가 두 번 발생하면 반드시 Compound로 기록하고 프로세스를 바꿉니다.

---

## 전체 에이전트 공통 프로토콜

### 1. 작업 시작 시 (모든 에이전트 필수)

작업을 시작하기 전, 가장 먼저 다음 파일을 읽습니다:
1. 이 파일 (`CLAUDE.md`)
2. 자신의 `SKILL.md`
3. `agents/lead_engineer/compound_log.md` (최신 Compound 사항)
4. 마지막 REVIEW 기록 (Lead Engineer가 유지)

이 4개를 읽으면 현재 상황을 파악하고 작업을 시작할 수 있어야 합니다.

### 2. 작업 완료 기록 (모든 에이전트 필수)

모든 작업 완료 후 반드시 기록합니다. 기록 없이 완료 처리하지 않습니다.

```
[작업 완료 기록]
작업 ID: TASK-{번호}
담당자: 역할명
완료일: YYYY-MM-DD
결과: 무엇을 만들었는가 (파일명, 기능명)
변경 파일: 주요 파일 목록
이슈: 작업 중 발생한 문제 (없으면 "없음")
인수 사항: 이어받는 사람이 알아야 할 것
```

### 3. 인수인계 원칙

언제든지 다른 에이전트가 같은 역할을 맡아도 작업을 이어받을 수 있어야 합니다.

- 현재 무엇이 완료됐는지
- 현재 무엇이 진행 중인지
- 다음에 무엇을 해야 하는지
- 어떤 결정이 이미 내려졌고 왜 내려졌는지

이 4가지가 기록에서 즉시 파악되어야 합니다.

### 4. Beta Tester → QA 흐름

```
Beta Tester: BTC-{번호} 케이스 발견 → agents/beta_tester/test_cases/ 에 저장
QA: BTC 케이스를 BUG-{번호} 기술 리포트로 변환
CI/CD: 수정 후 해당 케이스 회귀 테스트에 포함
```

---

## Python 툴체인

이 프로젝트의 스크립트와 테스트는 Python 우선으로 운영합니다.

### 설치

```bash
pip install -r requirements.txt
python -m playwright install chromium
cp .env.example .env   # 실제 값 채우기
```

### 핵심 툴

| 도구 | Python 패키지 | 용도 |
|------|--------------|------|
| Supabase | `supabase` | DB 조회/마이그레이션 |
| Playwright | `playwright` + `pytest-playwright` | E2E 브라우저 테스트 |
| Sentry | `sentry-sdk` | 스크립트 에러 모니터링 |
| Vercel | `requests` (REST API) | 배포 상태 확인 |

### 주요 스크립트

| 파일 | 실행 | 용도 |
|------|------|------|
| `scripts/test_e2e.py` | `pytest scripts/test_e2e.py -v` | E2E 테스트 |
| `scripts/migrate.py` | `python scripts/migrate.py` | Supabase 마이그레이션 |
| `scripts/test_connect.py` | `python scripts/test_connect.py` | DB 연결 테스트 |
| `scripts/check_deployment.py` | `python scripts/check_deployment.py` | Vercel 배포 상태 |

### 환경변수 (.env)

```
SUPABASE_URL, SUPABASE_KEY          # 공개 (anon)
SUPABASE_SERVICE_ROLE_KEY           # 비공개 — 절대 커밋 금지
SENTRY_DSN                          # 공개 가능
VERCEL_TOKEN, VERCEL_PROJECT_ID     # 비공개
BASE_URL                            # 테스트 대상 URL
```

---

## Git 워크플로 (모든 에이전트 필수 준수)

**절대 규칙: `main` 브랜치에 직접 commit하거나 local merge하지 않는다.**

모든 코드 변경은 아래 흐름을 반드시 따릅니다:

```
1. 브랜치 생성 (main 기반)
   git checkout main && git pull origin main
   git checkout -b feature/TASK-{번호}-{설명}

2. 작업 + commit (브랜치 위에서)
   git add <파일>
   git commit -m "feat(scope): 설명"

3. 원격에 push
   git push -u origin feature/TASK-{번호}-{설명}

4. PR 생성 (gh CLI 사용)
   gh pr create --base main --title "..." --body "..."

5. PR merge (gh CLI 사용, CI/CD Engineer 담당)
   gh pr merge <PR번호> --squash --delete-branch
```

### 브랜치 명명 규칙

| 상황 | 브랜치명 |
|------|----------|
| 기능 개발 | `feature/TASK-{번호}-{짧은설명}` |
| 버그 수정 | `fix/BUG-{번호}-{짧은설명}` |
| 긴급 수정 | `hotfix/{짧은설명}` |

### 역할 분담

- **코드 작성 에이전트** (UI/UX, Backend): 브랜치 생성 → commit → push → PR 생성까지 담당
- **CI/CD Engineer**: PR 리뷰 확인 → `gh pr merge` 실행 → 배포 이력 기록

### 금지 사항

- `git push origin main` 직접 push 금지
- `git merge` local merge 후 push 금지
- PR 없이 main에 반영 금지

---

## 코드 작성 원칙

### 기존 코드 우선

- 새 파일/함수/컴포넌트를 만들기 전에 기존 것을 재사용할 수 있는지 먼저 확인합니다.
- 기존에 동작하는 기능은 건드리지 않습니다.
- 리팩토링은 "지금 이 변경을 하지 않으면 다음 작업이 불가능하다"는 명확한 이유가 있을 때만 합니다.

### 하지 말아야 할 것

- 아직 필요하지 않은 확장성을 위한 추상화
- 한 번만 쓰이는 코드의 일반화
- "나중에 필요할 것 같아서" 추가하는 기능
- 요청하지 않은 인접 코드 정리
- 기존 함수/컴포넌트를 더 좋은 구조로 교체 (작동 중인 경우)

### 변경 범위 판단

변경이 올바른지 확인하는 질문: **"이 줄의 변경이 현재 TASK의 완료 기준과 직접 연결되는가?"**
연결되지 않으면 변경하지 않습니다.

---

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** 같은 실수가 반복되지 않고, 누구든 기록을 읽고 작업을 이어받을 수 있으며, 변경된 모든 줄이 현재 목표와 직접 연결됩니다.
