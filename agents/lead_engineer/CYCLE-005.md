# CYCLE-005 — 반응형 + 보안 + Admin CRUD 확장

작성일: 2026-05-18
작성자: Lead Engineer
상태: 진행 중

---

## 현황 요약 (인수인계용)

### 직전 사이클 결과 (CYCLE-004)

- Admin CRUD: 담당자/협력업체 담당자 완료 (PR #5)
- Python 툴체인 완비
- Vercel 배포 정상화 (outputDirectory 수정)

### 이번 사이클에서 한 일

1. **Admin CRUD 확장 (TASK-013) — 로봇 / 협력업체 회사**
   - Admin 탭 2개 추가: '로봇 관리', '업체 관리'
   - `loadSupabaseData()`에서 robots 테이블 로드 → `ALL_ROBOTS` 병합
   - PR #6 squash merge 완료

2. **E2E 테스트 수정 (TASK-014)**
   - `test_dark_mode_toggle`: 셀렉터 `.theme-toggle`, 어서션 `documentElement.getAttribute('data-theme')`
   - PR #7 squash merge 완료

3. **모바일 기초 대응 (BTC-001)**
   - `min-width:1040px` 제거
   - `@media(max-width:768px)`: 사이드바 position:fixed 오버레이 + 햄버거 버튼
   - PR #8 squash merge 완료

4. **로그인 비밀번호 표시 (BTC-002)**
   - `#lpw` 입력란에 눈 아이콘 버튼 추가
   - PR #9 squash merge 완료

5. **로그인 계정 힌트 제거 (BTC-007)**
   - 로그인 화면 하단 `admin/admin`, `itp_user/1234` 계정 힌트 제거
   - 보안 요청에 따라 제거 (실 운영 환경 노출 방지)

---

## 현재 파일 상태 (2026-05-18 기준)

| 파일 | 상태 |
|------|------|
| `public/index.html` | main 최신. 로봇/회사 Admin CRUD + 모바일 햄버거 + 비밀번호 토글 포함 |
| `scripts/test_e2e.py` | dark_mode_toggle 수정 완료 — 전체 PASS 예상 |
| `vercel.json` | 정상 유지 |

---

## 다음 사이클 후보 (우선순위 순)

| 우선순위 | 항목 | 예상 규모 | 비고 |
|----------|------|-----------|------|
| 1 | **전체 반응형 (모바일/태블릿)** | 중간 (4~5h) | 13개 탭 × 42개 grid 수정 필요. 아래 세부 내용 참고. |
| 2 | BTC-004 GPS HTTPS 확인 | 소 | Vercel 배포 후 실제 확인만 필요 |
| 3 | robots Supabase 마이그레이션 | 소 | `python scripts/migrate.py robots` 실행 필요 (`.env` 준비 필요) |

---

## [예정] 전체 반응형 작업 범위 — TASK-015

**목표**: 스마트폰(360px~)과 태블릿(768px~)에서 모든 탭이 깨지지 않고 동작

### 난이도별 분류

#### 쉬움 — CSS @media 추가만 (약 30분)
- 홈 통계 4열 그리드 → 768px: 2열, 480px: 1열
- `form-row` (1fr 1fr) → 768px: 1열로 스택
- `.info-cards-grid` (2열) → 480px: 1열
- 로그인 박스 — 이미 처리됨 (92vw)

#### 중간 — 구조 변경 필요 (약 1.5h)
- **매뉴얼 뷰어** (`185px 1fr` 고정 2분할): 모바일에서 목차를 오버레이 토글 버튼으로 전환
- **Q&A 목록** (7열 고정 grid): 모바일에서 가로 스크롤 래퍼 추가 or 일부 열 숨김

#### 어려움 — JS 렌더링 인라인 스타일 리팩토링 (약 2h)
- Admin 사용자/연락처/로봇/회사 테이블: JS `innerHTML`에 `grid-template-columns` 하드코딩됨
  → CSS 클래스 분리 후 `@media`로 제어
- Admin CRUD 폼: `grid-template-columns:1fr 1fr` 인라인 스타일 → 클래스화

### 처리 전략 (합의 필요)
- Admin 패널은 `overflow-x:auto` 래퍼로 "가로 스크롤" 처리 → 전체 2~3h로 단축 가능
- 또는 Admin은 데스크탑 전용으로 유지하고 나머지 탭만 반응형 처리

---

## 미처리 이슈

| ID | 내용 | 상태 |
|----|------|------|
| BTC-003 | 새로고침 후 세션 유지 | 의도된 동작 — 현장 운영자 편의. 현재 유지. |
| BTC-004 | GPS HTTP 미작동 | Vercel HTTPS로 자동 해결 예상 — 미확인 |
| BTC-005 | 내부 파일 노출 (Docker 로컬) | Vercel은 해결, Docker 로컬 환경은 유지 |

---

## 핵심 기술 메모

- 모바일 사이드바: `#sidebar.mobile-open` 클래스 + `#sidebar-overlay` 오버레이 패턴 확립됨
- dark-theme: `document.documentElement.getAttribute('data-theme')` 변화 감지 (body.className 아님)
- Admin 테이블 렌더링: `renderUsersAdmin()`, `renderContactsAdmin()`, `renderRobotsAdmin()` 등 JS 함수에서 innerHTML로 그리드 직접 생성
