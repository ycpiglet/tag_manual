# CYCLE-004 — Python 툴체인 + Vercel 이미지 수정 + Admin CRUD

작성일: 2026-05-13
작성자: Lead Engineer
상태: 완료 (다음 사이클 대기)

---

## 현황 요약 (인수인계용)

### 직전 사이클 결과

- CYCLE-003 완료: Vercel 배포 준비 (.vercelignore, vercel.json, QA 통과)
- main 브랜치 최신 상태로 정리됨

### 이번 사이클에서 한 일

1. **Vercel 이미지 미로딩 수정 (BTC-006)**
   - 원인: Vercel이 `public/` 디렉토리를 outputDirectory로 자동 인식 → `src/assets/images/` 경로 404
   - 수정: `vercel.json`에 `"outputDirectory": "."` 추가
   - PR #3 squash merge 완료

2. **스크린샷 자기검증 기능 추가**
   - `agents/beta_tester/SKILL.md`, `agents/qa/SKILL.md`에 headless Chrome 스크린샷 절차 추가
   - 명령어: `google-chrome --headless --disable-gpu --screenshot=path.png --window-size=1440,900 URL`
   - 저장 위치: `agents/qa/screenshots/`, `agents/beta_tester/screenshots/`

3. **Python 툴체인 도입**
   - `requirements.txt`: pytest, pytest-playwright, playwright, supabase, python-dotenv, sentry-sdk, requests
   - `.env.example`: 전체 환경변수 목록 (SERVICE_ROLE_KEY, VERCEL_TOKEN 등 비공개 표기)
   - `conftest.py`: pytest fixtures (page, logged_in_page, supabase_client, sb_admin)
   - `pytest.ini`: testpaths, addopts (--browser chromium --base-url http://localhost:8080)
   - `scripts/test_e2e.py`: 14개 E2E 테스트 (13 passed, 1 skipped)
   - `scripts/migrate.py`: CSV → Supabase 테이블 마이그레이션 (migrate.mjs 대체)
   - `scripts/test_connect.py`: Supabase 연결/테이블 존재 확인
   - `scripts/check_deployment.py`: Vercel REST API 배포 상태 확인 (`--wait` 플래그 지원)
   - CLAUDE.md, 각 에이전트 SKILL.md에 Python 툴체인 섹션 추가

4. **Admin CRUD (TASK-012) — 담당자 / 협력업체 담당자**
   - Admin 탭 2개 추가: '담당자 관리', '협력업체 관리'
   - 담당자 카드에 admin 전용 수정/삭제 버튼
   - Supabase contacts / partner_contacts 직접 insert/update/delete
   - PR #5 squash merge 완료

5. **보안 수정**
   - `scripts/create_buckets.mjs`에서 하드코딩된 SERVICE_ROLE_KEY 제거 → 환경변수로 대체
   - GitHub Push Protection에 의해 차단 → 수정 후 재push

---

## 현재 파일 상태 (2026-05-13 기준)

| 파일 | 상태 |
|------|------|
| `public/index.html` | main 최신. Admin CRUD 포함. 6229줄 → ~6740줄 |
| `vercel.json` | `outputDirectory: "."` 포함. Vercel 정상 배포 중 |
| `.vercelignore` | agents/, CLAUDE.md, scripts/ 등 차단 |
| `requirements.txt` | Python 의존성 완비 |
| `conftest.py` / `pytest.ini` | E2E 테스트 설정 완비 |
| `scripts/test_e2e.py` | 13 passed, 1 skipped (dark_mode) |
| `scripts/migrate.py` | CSV→Supabase, Python 구현 |
| `scripts/check_deployment.py` | Vercel 배포 상태 확인 |
| `supabase/schema.sql` | 전체 테이블 + RLS 정책 포함 |

---

## 다음 사이클 후보 (우선순위 순)

| 우선순위 | 항목 | 비고 |
|----------|------|------|
| 1 | 로봇(robots) Admin CRUD | ALL_ROBOTS 하드코딩 → Supabase 마이그레이션 선행 필요 |
| 2 | 협력업체 회사(partner_companies) CRUD | 주소/URL/색상 편집 |
| 3 | dark_mode_toggle E2E 테스트 수정 | 현재 skipped — 실제 selector 확인 필요 |
| 4 | BTC-001 (모바일 가로 스크롤) | UI/UX 담당 |
| 5 | BTC-002/003 (비밀번호 노출/세션 유지) | Lead Engineer 판단 필요 |

---

## 미처리 이슈

| ID | 내용 | 상태 |
|----|------|------|
| BTC-001 | 화면 좁히면 가로 스크롤 | 미수정 |
| BTC-002 | 로그인 비밀번호 노출 | 미수정 (Lead 판단) |
| BTC-003 | 새로고침 후 세션 유지 | 미수정 (Lead 판단) |
| BTC-004 | GPS HTTP 미작동 | Vercel HTTPS로 자동 해결 예상 — 미확인 |
| BTC-005 | 내부 파일 노출 (Docker) | Vercel은 해결, Docker 로컬은 유지 |

---

## 핵심 기술 메모

- `sb.from('contacts').insert/update/delete` — admin RLS 필요 (anon key로는 write 불가)
- contacts.id는 TEXT PK, insert 시 `crypto.randomUUID()` 사용
- STAR/ITP 객체에 `_id` 필드 추가됨 — 없으면 Supabase 미로드 상태 (CSV fallback)
- robots CRUD 구현 전 `scripts/migrate.py`로 ALL_ROBOTS 데이터를 Supabase에 먼저 업로드해야 함
