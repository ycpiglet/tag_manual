# CYCLE-001 — 프로토타입 배포

작성일: 2026-05-13
작성자: Lead Engineer
참조: agents/ceo/PLAN-001.md
상태: 진행 중

---

## 현황 요약 (인수인계용)

누구든 이 파일을 읽으면 현재 상태를 즉시 파악할 수 있어야 한다.

### 프로젝트 핵심 사실

- 배포 대상: `/home/keti-itp-01/dev/tag_manual/public/index.html` (6081줄 단일 HTML)
- 의존성: CDN(marked.js, highlight.js, Pretendard 폰트) + 로컬 파일
- 로컬 파일 경로 구조:
  - 이미지: `../src/assets/images/` (public/ 기준 상대경로 → 프로젝트 루트 필요)
  - 데이터: `data/*.csv`, `data/*.json` (public/ 내부)
  - 매뉴얼: `../docs/manuals/` (자동 폴백 로직 내장)
  - 벤더 문서: `../docs/vendor_docs/`
- **nginx root는 프로젝트 루트(`/home/keti-itp-01/dev/tag_manual`)로 설정해야 함**
- 접근 URL: `http://{server}/public/` 또는 `http://{server}/public/index.html`

### 태스크 상태

| ID | 담당 | 내용 | 상태 |
|----|------|------|------|
| TASK-001 | Backend Engineer | nginx.conf + Dockerfile + docker-compose.yml | 대기 |
| TASK-002 | CI/CD Engineer | git 정리 + .gitignore + deploy.sh | 대기 |
| TASK-003 | UI/UX Designer | 경로 이슈 최종 확인 | 대기 |
| TASK-004 | QA | 테스트 체크리스트 작성 + 배포 후 검증 | 대기 |
| TASK-005 | Beta Tester | 탐색 테스트 | TASK-001 완료 후 |

### 의존성

```
TASK-001 (Backend)  ←── 시작 가능
TASK-002 (CI/CD)    ←── 시작 가능 (TASK-001 완료 후 커밋 단계만 대기)
TASK-003 (UI/UX)    ←── 시작 가능
TASK-004 (QA 체크리스트) ←── 시작 가능 / 검증은 TASK-001 완료 후
TASK-005 (Beta)     ←── TASK-001 완료 후 서버 기동 시 시작
```

## PLAN 단계 기록

- CEO와 합의 완료: 코드 변경 없이 nginx로 프로젝트 루트 서빙
- 핵심 결정: `../src/assets/` 경로 때문에 nginx root = 프로젝트 루트

## REVIEW (사이클 완료 후 작성)

_미완료_

## COMPOUND 후보 (발견 시 기록)

_없음_
