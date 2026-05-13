# CYCLE-001 — 프로토타입 배포

작성일: 2026-05-13
작성자: Lead Engineer
참조: agents/ceo/PLAN-001.md
상태: 완료

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
| TASK-001 | Backend Engineer | nginx.conf + Dockerfile + docker-compose.yml | ✅ 완료 |
| TASK-002 | CI/CD Engineer | git 정리 + .gitignore + deploy.sh | ✅ 완료 |
| TASK-003 | UI/UX Designer | 경로 이슈 최종 확인 | ✅ 완료 |
| TASK-004 | QA | 테스트 체크리스트 작성 + 배포 후 검증 | ✅ 완료 |
| TASK-005 | Beta Tester | 탐색 테스트 | ✅ 완료 |

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

## REVIEW

완료일: 2026-05-13

**완료된 작업:** TASK-001~005 전부 완료
**미완료 작업:** 없음
**목표 달성 여부:** 달성

**핵심 성과:**
- Docker + nginx로 프로토타입 코드 변경 없이 배포 성공
- nginx root = 프로젝트 루트로 설정 → `../src/assets/` 경로 문제 해결
- 전 리소스 HTTP 200 확인 (이미지 15, 매뉴얼 15, PDF 39)
- feature/deploy 브랜치 커밋 완료 (fc9a4b6)

**이월 사항 (CYCLE-002로):**
- 미커밋 파일: BTC-001~004, TASK-002~005 완료기록, BTC INDEX
- pre-existing 변경 미처리: public/final.html 삭제, public/index.html 수정
- feature/deploy → main 머지 미완료
- 접근 URL이 `/public/index.html`로 길고 직관적이지 않음
- 내부 네트워크 IP 접근 미확인

**CEO 보고:**
- CYCLE-001 목표 달성, 다음 사이클 목표 수신
- Beta Tester BTC-001~004: CEO 판단으로 BTC-001~004 모두 현재 허용 (일부 다음 사이클 재검토)

## COMPOUND

없음 (첫 사이클, 반복 패턴 미발생)
