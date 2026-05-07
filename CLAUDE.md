# CLAUDE.md — AI 코딩 지침서

이 파일은 Claude(AI 코딩 어시스턴트)가 이 프로젝트에서 작업할 때 참조하는 규칙과 맥락입니다.
새 대화를 시작할 때 이 파일을 첨부하면 맥락 없이 바로 이어서 작업할 수 있습니다.

---

## 프로젝트 정체성

**STAR TEAM 로봇 원격 관제 시스템** — KETI 지능로보틱스연구센터.  
이기종 로봇(GoCart180, SPOT, RB-Y1 등) 운영 매뉴얼 + 상태 모니터링 + Rubberneck 원격 조작 UI.

**사용자**: 현장 운영자, 개발자, 관리자 (3단계 권한).  
**환경**: 실험실 인트라넷 + 오프라인 가능 필요.

---

## 아키텍처 결정 (변경하지 말 것)

### 단일 HTML 파일
메인 파일은 `public/index_apple.html` 하나. React, Vue, 번들러 도입 금지.  
이유: 서버 없이 파일 더블클릭으로 실행되어야 하고, 배포가 파일 복사로 끝나야 한다.

### 외부 리소스는 CDN → 필요시 로컬 복사
CDN 우선, 오프라인 대응이 필요할 때만 `src/assets/libs/`에 복사.  
새 라이브러리 추가 시 먼저 물어볼 것 (파일 크기 증가).

### 매뉴얼은 임베드 우선
`fetch()`는 `file://` 프로토콜에서 차단됨. 새 매뉴얼 파일 추가 시 `EMBEDDED_MANUALS`에 내용을 직접 임베드해야 한다. fetch는 웹서버 환경 fallback용.

---

## 디자인 시스템 (Apple 스타일)

### 색상 토큰 (CSS 변수, 절대 인라인 hex 사용 금지)
```css
--bg: #f5f5f7          /* 배경 */
--surface: #ffffff      /* 카드/패널 */
--accent: #0071e3       /* Apple Blue, 모든 CTA */
--accent-light: rgba(0,113,227,.08)
--text: #1d1d1f
--text-muted: #6e6e73
--border: rgba(0,0,0,.1)
```

### 다크모드
`[data-theme="dark"]` 선택자로 변수 오버라이드. `localStorage`에 `'theme'` 키로 저장.

### 타이포그래피
```
본문: 'Pretendard Variable', -apple-system, ... (--sans)
코드: 'IBM Plex Mono', 'SF Mono', ... (--mono)
기본 font-size: 13.5px
```

### 간격/반경
```css
--r-sm: 8px   --r: 12px   --r-lg: 18px   --r-xl: 24px
버튼(pill): border-radius: 980px
```

### 금지
- 인라인 `style="color: #2563eb"` 같은 하드코딩 → 반드시 CSS 변수 사용
- `box-shadow` 남발 (Apple은 그림자 최소화)
- 파란색 그라디언트 배경 (로그인 등에 이미 제거됨)
- `!important` 남용

---

## 핵심 데이터 구조

### 로봇 이미지 매핑
```javascript
const ROBOT_IMAGES = {
  'GoCart': '../src/assets/images/robots/gocart180/로봇_GoCart180.png',
  'SPOT':   '../src/assets/images/robots/spot/로봇_SPOT.jpg',
  // ...
};
function robotImageFor(name) { /* 이름 포함 여부로 매핑 */ }
```
새 로봇 이미지 추가 시: `ROBOT_IMAGES` 객체 + `robotImageFor()` 함수 두 곳 모두 수정.

### 매뉴얼 경로 매핑
```javascript
const MANUAL_MD_BASE = '../docs/manuals/';
const MANUAL_MD_BY_KEY = {
  'robots/gocart.md': { folder: 'gocart180', split: true },  // split=user/dev 분리
  'robots/spot.md':   { folder: 'spot', file: 'manual_spot.md' },
  // ...
};
```
`split: true`이면 `manualMode`에 따라 `user_manual.md` / `developer_manual.md` 자동 분기.

### 임베드 매뉴얼
```javascript
const EMBEDDED_MANUALS = {
  'gocart180/user_manual.md': "마크다운 내용...",
  'gocart180/developer_manual.md': "마크다운 내용...",
};
```
파일 내용을 `JSON.stringify()`로 이스케이프해서 추가. 키는 `MANUAL_MD_BY_KEY`가 반환하는 경로와 일치해야 함.

### 로봇 데이터 구조
```javascript
{
  id: 'gc_lt1',
  name: 'GoCart180 LT #1',
  cat: 'amr',           // amr | quadruped | manipulator | arm | m2m
  type: 'AMR',          // 표시용 문자열
  floor: '1F',
  power: 'online',      // online | warning | offline
  rn: 'online',         // Rubberneck 상태
  solar: 'online',      // SOLAR 상태
  mdFile: 'robots/gocart.md',  // MANUAL_MD_BY_KEY 키
  startup: [...],       // 시동 절차
  checklist: [...],     // 점검 항목
  ctrl: [...],          // 제어 방법
  specs: {},            // IP, SDK 등
}
```

---

## 코딩 원칙

### 변경 범위
- 요청한 것만 수정. 인접한 코드, 주석, 포맷팅 건드리지 않기.
- 내 변경으로 생긴 미사용 변수/함수만 정리. 기존 dead code는 언급만.

### JavaScript
- `const` / `let` 사용 (`var` 금지)
- 함수 선언은 `function` 키워드 (단, 콜백/인라인은 화살표 함수)
- 수정 후 반드시 `new Function(jsCode)` syntax check 실시

### CSS
- CSS 변수 사용 필수. 하드코딩 hex 금지.
- 다크모드 오버라이드는 `[data-theme="dark"] .class { }` 패턴 유지
- 이미지 카드: `mix-blend-mode: multiply` + `background: #fff` (라이트모드)

### str_replace 원칙
- 교체 문자열이 파일 내에서 유일(unique)한지 확인 후 실행
- 여러 곳을 바꿀 때는 각각 별도 str_replace 호출
- 대규모 삽입은 python 스크립트 활용 (역슬래시 이스케이프 문제 방지)

### 검증
매 수정 후:
```bash
node -e "
const fs=require('fs');
const html=fs.readFileSync('public/index_apple.html','utf8');
const scripts=html.match(/<script(?! src)[^>]*>([\s\S]*?)<\/script>/g)||[];
const last=scripts[scripts.length-1].replace(/<\/?script[^>]*>/g,'');
try{new Function(last);console.log('JS OK');}catch(e){console.log('Error:',e.message);}
"
```

---

## 현재 탭 목록

| 탭 ID | 이름 | 설명 |
|-------|------|------|
| `home` | 홈/소개 | 시스템 개요, 배치 현황 |
| `status` | 전체 현황 | 사이트별 로봇 상태 카드 |
| `manual` | 운영 매뉴얼 | Markdown 렌더링 매뉴얼 |
| `control` | 수동 제어 | 로봇별 제어 버튼 |
| `rubberneck` | Rubberneck | 외부 링크 리다이렉트 |
| `solar` | SOLAR | Fleet 관리 플랫폼 |
| `qa` | 문의/지원 | Q&A 게시판 |
| `contact` | 담당자 연락망 | STAR TEAM 연락처 |
| `partners` | 협력업체 | 제조사/벤더 연락처 |
| `admin` | 관리자 | 사용자 관리 (admin 전용) |

---

## 현재 사용자 계정 구조
```javascript
USERS_DB = [
  { id: 'admin',    role: 'admin',  sites: ['incheon','suwon','yeongwol'] },
  { id: 'itp_user', role: 'staff',  sites: ['incheon'] },
  { id: 'viewer',   role: 'user',   sites: ['incheon'] },
  // ...
]
```
`AUTH_KEY = 'star_team_uid'` (`localStorage`)

---

## 자주 실수하는 것들

1. **`MANUAL_MD_BASE` 경로**: `'../docs/manuals/'` (public/ 기준 상대경로)
2. **이미지 경로**: `'../src/assets/images/...'` (public/ 기준)
3. **다크모드 이미지**: 다크모드에서는 `mix-blend-mode: normal` + `background: #2c2c2e`로 오버라이드
4. **`function initApp()`**: 파일 하단에 있음. 삽입 시 함수 선언 앞에 넣을 것
5. **PDF 내보내기**: Claude 프리뷰/file:// 에서는 download 차단됨 → `window.print()` fallback 정상
6. **`<details>` 토글**: `renderMarkdown()`이 `:::details` 구문을 파싱. marked.parse() 직접 호출 금지

---

## 작업 요청 시 유용한 패턴

### 새 로봇 추가
1. `src/assets/images/robots/{folder}/` 에 이미지 배치
2. `ROBOT_IMAGES` + `robotImageFor()` 업데이트
3. `ALL_ROBOTS` 해당 사이트 배열에 로봇 객체 추가
4. `MANUAL_MD_BY_KEY` 에 mdFile 매핑 추가
5. 매뉴얼 md 작성 후 `EMBEDDED_MANUALS` 임베드

### 새 탭 추가
1. 사이드바 `nav-item` 추가 (`sw('탭ID', this)`)
2. `<div class="tab-panel" id="tab-탭ID">` HTML 추가
3. 필요시 `buildXxx()` 함수 작성 + `initApp()` 에서 호출

### 디자인 수정
DESIGN.md 파일들이 `docs/design/{brand}/DESIGN.md`에 있음.  
특정 브랜드 스타일로 작업 시 해당 파일을 첨부하거나 내용을 요청.  
현재 기준: **Apple** 스타일.
