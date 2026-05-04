# tag_manual

매뉴얼용 UI 작업을 시작할 수 있도록 기본 디렉토리 구조를 구성했습니다.

## 디렉토리 구조

```text
.
├── docs/
│   ├── guides/          # 운영/작성 가이드 문서
│   └── specs/           # 화면/기능 명세 문서
├── public/
│   ├── docs/            # 빌드 결과물에서 정적 문서로 직접 서빙할 파일
│   └── images/          # 빌드 없이 바로 노출할 정적 이미지
├── scripts/             # 데이터 변환, 배포 보조 스크립트
└── src/
    ├── api/             # 백엔드 연동 API 함수
    ├── assets/
    │   ├── fonts/       # 폰트 리소스
    │   └── images/
    │       ├── headshots/ # 증명사진/인물 이미지
    │       ├── icons/     # 아이콘
    │       └── logos/     # 로고
    ├── components/      # 재사용 UI 컴포넌트
    ├── hooks/           # 커스텀 훅
    ├── pages/           # 페이지 단위 컴포넌트
    ├── styles/          # 전역 스타일/테마
    └── utils/           # 공통 유틸리티
```

## 이미지 리소스 배치 가이드

- 로고 파일: `src/assets/images/logos/`
- 증명사진 파일: `src/assets/images/headshots/`
- 빌드 없이 직접 노출이 필요하면: `public/images/`

> 현재 저장소에서 `로고_KETI.jpg`, `증명사진_정윤철.jpg` 파일은 확인되지 않았습니다.
> 로컬에만 있는 상태라면 위 경로로 이동 후 커밋/푸시해 주세요.
