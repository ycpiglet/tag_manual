# STAR TEAM — 로봇 원격 관제 시스템

KETI 지능로보틱스연구센터 STAR TEAM의 이기종 로봇 운영 매뉴얼 및 원격 관제 웹 인터페이스.

> **배포 형태**: 단일 HTML 파일 (`public/index_apple.html`)  
> **서버 불필요**: 브라우저에서 직접 열거나 정적 서버로 서빙

---

## 빠른 시작

```bash
# 정적 서버로 실행 (권장)
cd public
python3 -m http.server 8080
# → http://localhost:8080/index_apple.html

# 또는 파일 직접 열기 (일부 기능 제한)
open public/index_apple.html
```

**기본 계정**

| 역할 | ID | PW |
|------|----|----|
| 관리자 | `admin` | `admin` |
| 직원 | `itp_user` | `1234` |
| 일반 | `viewer` | `view` |

---

## 주요 기능

- **전체 현황** — 사이트별 로봇 상태 실시간 모니터링 (온라인/경고/오프라인)
- **운영 매뉴얼** — 로봇별 사용자/개발자 매뉴얼 (Markdown 렌더링, 코드 하이라이팅, 토글/콜아웃)
- **수동 제어** — Rubberneck 원격 조작 연동
- **담당자 연락망** — STAR TEAM 및 사이트별 담당자
- **협력업체** — 로봇 제조사 및 플랫폼 벤더 연락처
- **다크 모드** — 시스템 연동 토글, `localStorage` 유지

---

## 프로젝트 구조

```
.
├── public/
│   ├── index_apple.html    ← 메인 파일 (모든 UI + 로직 포함)
│   └── index.html          ← 레거시 버전
├── docs/
│   ├── design/             ← 브랜드별 디자인 시스템 명세 (DESIGN.md)
│   └── manuals/            ← 로봇별 운영 매뉴얼 Markdown
│       ├── gocart180/
│       │   ├── user_manual.md
│       │   └── developer_manual.md
│       ├── spot/
│       │   └── manual_spot.md
│       └── ...             ← 로봇별 디렉토리
└── src/
    └── assets/
        ├── fonts/          ← 오프라인용 폰트 (Pretendard, IBM Plex Mono)
        └── images/
            ├── logos/      ← 로고_KETI.jpg, 로고_Rubberneck.png
            ├── headshots/  ← 증명사진_*.jpg
            └── robots/     ← 로봇별 이미지
                ├── gocart180/
                ├── spot/
                ├── gaemi/
                └── ...
```

---

## 매뉴얼 파일 관리

### 파일 위치 규칙

```
docs/manuals/{로봇폴더}/user_manual.md        # 현장 운영자용
docs/manuals/{로봇폴더}/developer_manual.md   # 개발자용 (선택)
docs/manuals/{로봇폴더}/manual_{name}.md      # 단일 매뉴얼
```

### 매뉴얼 추가 절차

1. `docs/manuals/{robot}/user_manual.md` 작성
2. `index_apple.html` 내 `MANUAL_MD_BY_KEY`에 항목 추가
3. user/dev 분리가 필요한 경우 `split: true` 설정
4. 오프라인 지원이 필요한 경우 `EMBEDDED_MANUALS`에 내용 임베드

### 지원하는 Markdown 확장 문법

```markdown
> [!NOTE] 파란 정보 박스
> [!WARNING] 노란 경고 박스
> [!IMPORTANT] 빨간 중요 박스
> [!TIP] 초록 팁 박스

:::details 접을 수 있는 섹션 제목
내용
:::
```

---

## 이미지 리소스 규칙

| 유형 | 경로 | 형식 |
|------|------|------|
| 로봇 사진 | `src/assets/images/robots/{robot}/로봇_{Name}.{ext}` | PNG (투명배경 권장) / JPG |
| 담당자 증명사진 | `src/assets/images/headshots/증명사진_{이름}.jpg` | JPG |
| 로고 | `src/assets/images/logos/로고_{Name}.{ext}` | PNG / JPG |

> 흰 배경 이미지는 `mix-blend-mode: multiply`로 자동 처리됩니다.  
> 투명 배경 PNG가 가장 깔끔하게 표시됩니다.

---

## 외부 의존성

모두 CDN 로드 (인터넷 연결 필요). 오프라인 대응은 `src/assets/` 자체 호스팅으로 전환.

| 라이브러리 | 용도 | 라이선스 |
|-----------|------|---------|
| Pretendard Variable | 본문 폰트 (한글+영문) | SIL OFL |
| IBM Plex Mono | 코드/수치 폰트 | SIL OFL |
| marked.js | Markdown 파싱 | MIT |
| highlight.js | 코드 문법 강조 | BSD-3 |
| html2pdf.js | PDF 내보내기 | MIT |

---

## 운영 사이트

| 사이트 | 위치 | 로봇 |
|--------|------|------|
| 인천 청라 로봇랜드 | 로보타워 1·20·22F + R&D센터 1·5F | GoCart180, 일개미, 집개미, Novatek, SPOT, RB-Y1, 오더피킹 |
| 서울 강남 로봇플러스 | KETI STAR TEAM 테스트필드 | 자이드모바일, COBOT, PiPER |
| 강원 영월 빛드림본부 | 한국남부발전 | SPOT, Vision60 |

---

## 문의

- STAR TEAM: `star_support@keti.re.kr`
- Rubberneck: `ngocpq@keti.re.kr` (Dr. Phung)
- SOLAR: `pkqwaszx@keti.re.kr` (김형겸)
