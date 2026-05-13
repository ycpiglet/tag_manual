# TASK-003 | UI/UX Designer

상태: 완료
담당: UI/UX Designer
생성일: 2026-05-13

---

## 목표

`public/index.html`의 모든 로컬 리소스 경로가
"nginx root = 프로젝트 루트" 설정 하에서 정상 동작하는지 확인한다.
코드를 수정하지 않는 것을 원칙으로 하되, 실제로 404가 발생하는 경로가 있으면 수정한다.

## 확인할 항목

### 이미지 경로 (`../src/assets/` 패턴)

index.html에서 발견된 주요 경로들:
- `../src/assets/images/logos/logo_keti.jpg`
- `../src/assets/images/logos/logo_rubberneck.png`
- `../src/assets/images/robots/gaemi/robot_outdoor_gaemi.png`
- `../src/assets/images/robots/gocart180/robot_gocart180.png`
- `../src/assets/images/robots/spot/robot_spot.jpg`
- (그 외 robots/ 하위 이미지들)
- `../src/assets/images/profiles/` 패턴 (담당자 사진)

각 파일이 실제로 `src/assets/` 경로에 존재하는지 확인.
존재하지 않는 파일 → onerror 폴백이 있는지 index.html에서 확인.
폴백 없는데 파일도 없으면 → Lead Engineer에게 보고.

### 데이터 파일 경로 (`data/*.csv`)

`public/data/` 에 있는 파일들이 fetch 경로와 일치하는지 확인.

### 매뉴얼 경로

`docs/manuals/robots/*.md` 파일들이 실제로 존재하는지 확인.
`DOCS_ROOT_BASES = ['../docs/','./docs/','docs/','/docs/']` 폴백 로직이 있으므로
서버 루트 기준 `/docs/manuals/` 이 접근 가능하면 됨.

## 입력

- `public/index.html`
- `src/assets/` 디렉토리 구조
- `docs/manuals/` 디렉토리 구조

## 출력

이 파일의 완료 기록 섹션에:
- 누락된 파일 목록 (있으면)
- onerror 폴백 처리 여부
- 수정이 필요한 경우에만 수정한 내용
- "이상 없음" 또는 "X개 이슈 발견, Y개 수정"

## 완료 기준

- 모든 이미지 경로에 대해: 파일 존재 OR onerror 폴백 확인
- 누락 파일 중 폴백 없는 항목이 있으면 Lead Engineer에 보고
- index.html 수정이 있었다면 변경 내용 명시

## 완료 기록

```
완료일: 2026-05-13
결과: 이상 없음 — 코드 수정 불필요
변경 파일: 없음
검증 내용:
  - ../src/assets/images/ 참조 15개 전수 확인: 모두 파일 존재 (OK 15/15)
  - profiles/: profile_hk_kim.jpg, profile_jj_lee.jpg, profile_sh_hong.JPG, profile_yc_jung.jpg 존재
  - robots/: doosan, gaemi(indoor/outdoor), gocart180, mtomtech(door/elevator),
             piper, rby1, spot, vision60 모두 존재
  - logos/: logo_keti.jpg, logo_rubberneck.png 존재
  - GydTech/Novatek/COBOT 등 ROBOT_IMAGE_MAP에 없는 로봇: onerror 폴백 처리됨 (정상)
  - profile_sh_hong.JPG: 대문자 확장자, index.html 참조와 파일명 일치하므로 정상
이슈: 없음
인수 사항: 없음
```
