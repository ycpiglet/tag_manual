# TASK-004 | QA

상태: 완료
담당: QA
생성일: 2026-05-13

---

## 목표

배포된 앱의 모든 핵심 기능이 프로토타입과 동일하게 동작하는지 검증한다.

## 1단계: 즉시 시작 — 테스트 체크리스트 작성

TASK-001 완료 전에 아래 항목을 기반으로 상세 체크리스트를 이 파일에 추가한다.

## 2단계: TASK-001 + TASK-002 완료 후 — 실제 검증

```bash
# 서버 기동 방법 (docker 없을 경우 python fallback)
cd /home/keti-itp-01/dev/tag_manual
docker-compose up -d
# 또는
cd public && python3 -m http.server 8080
```

접근 URL: `http://localhost:8080/public/index.html`

## 테스트 항목

### 인증
- [ ] admin / admin 로그인 → 관리자 메뉴 표시
- [ ] itp_user / 1234 로그인 → 직원 메뉴 표시
- [ ] viewer / view 로그인 → 읽기 전용 메뉴 표시
- [ ] 잘못된 비밀번호 → 에러 메시지 표시

### 화면 로딩
- [ ] 로그인 화면: KETI 로고 표시 (또는 폴백 텍스트)
- [ ] 전체 현황 탭: 사이트 목록 표시
- [ ] 로봇 카드: 이미지 표시 (또는 플레이스홀더)
- [ ] 사이드바 네비게이션 동작

### 매뉴얼 탭
- [ ] 로봇 선택 시 매뉴얼 Markdown 렌더링
- [ ] 코드 블록 하이라이팅
- [ ] 콜아웃(NOTE/WARNING/IMPORTANT/TIP) 표시
- [ ] 접힘/펼침(:::details) 동작

### UI 기능
- [ ] 다크모드 토글 → 재로드 후에도 유지
- [ ] 언어 전환 (한국어/영어)
- [ ] PDF 내보내기 버튼 클릭 (팝업 표시 여부)

### 리소스 로딩 (브라우저 DevTools Network 탭)
- [ ] 404 에러가 없거나, 있다면 onerror 폴백으로 처리됨
- [ ] CSS/JS CDN 로드 성공

## 버그 기록 위치

발견 시: `agents/qa/BUG-{번호}.md` 생성 후 CYCLE-001.md에 보고

## 완료 기준

- 위 항목 중 Critical/High 항목 없음
- 체크리스트 전체 확인 완료
- 통과/보류 판정 기록

## 완료 기록

```
완료일: 2026-05-13
서버: http://localhost:8080/public/index.html (Docker, tag_manual-web-1)

HTTP 검증 결과:
  핵심 경로:
    200  /public/index.html
    200  /src/assets/images/logos/logo_keti.jpg
    200  /src/assets/images/logos/logo_rubberneck.png
    200  /src/assets/images/logos/logo_itp.png
    200  /public/data/robots.csv
    200  /public/data/contacts.json
    200  /public/data/sites.csv

  매뉴얼 (15/15 OK):
    200  /docs/manuals/gocart180/user_manual.md
    200  /docs/manuals/spot/user_manual.md
    200  /docs/manuals/gaemi/ilgaemi/user_manual.md
    200  /docs/manuals/gaemi/jipgaemi/user_manual.md
    200  /docs/manuals/rby1/user_manual.md
    200  /docs/manuals/piper/user_manual.md
    200  /docs/manuals/vision60/user_manual.md
    200  /docs/manuals/mtomtech/elevator/user_manual.md
    200  /docs/manuals/mtomtech/door/user_manual.md
    200  /docs/manuals/novatek/user_manual.md
    200  /docs/manuals/cobot/user_manual.md
    200  /docs/manuals/orderpicking/user_manual.md
    200  /docs/manuals/gydtech/user_manual.md
    200  /docs/manuals/rubberneck/user_manual.md
    200  /docs/manuals/solar/user_manual.md

  vendor PDF (gocart180: 6개, spot: 12개, doosan: 3개 = 21개 확인):
    모두 200 (RB-Y1 공백 포함 파일명은 URL인코딩 시 200 확인)

브라우저 기능 테스트 항목 (HTTP 자동화 범위 외):
  → T6 Beta Tester가 실제 브라우저 탐색으로 검증

버그: 없음 (HTTP 레벨)
판정: 통과 (HTTP 레벨 검증 기준)
인수 사항:
  - 브라우저 기능 검증(로그인, 렌더링, 다크모드 등)은 T6 Beta Tester 담당
  - RB-Y1 PDF 파일명에 공백 포함 → 브라우저에서 자동 인코딩되므로 실사용 무관
```
