# PLAN-001 — 프로토타입 배포

작성일: 2026-05-13
작성자: CEO
상태: 확정

---

## 목표

`public/index.html` 프로토타입을 이 Linux 서버에서 브라우저로 접근 가능하게 배포한다.
코드 변경 없이 현재 프로토타입의 디자인과 기능을 그대로 서빙하는 것이 목적이다.

## 성공 기준

- [ ] 브라우저에서 URL로 접근 시 로그인 화면이 정상 표시됨
- [ ] 로그인 3계정(admin/itp_user/viewer) 모두 동작
- [ ] 로봇 이미지, KETI 로고, Rubberneck 로고가 화면에 표시됨
- [ ] 매뉴얼 탭에서 Markdown이 렌더링됨
- [ ] 다크모드 토글 동작
- [ ] PDF/문서 뷰어 동작

## 제약

- public/index.html 코드를 수정하지 않는다 (이미 완성된 프로토타입)
- 새 기능을 추가하지 않는다
- HTTP로 먼저 동작하게 한다 (HTTPS는 다음 사이클)
- 배포 대상: 현재 Linux 서버 (로컬 또는 내부 네트워크 접근)

## 기술적 전제 (Lead Engineer 분석 결과 반영)

index.html이 `../src/assets/` 경로로 이미지를 참조하므로
nginx의 root는 `public/`이 아닌 **프로젝트 루트**(`/home/keti-itp-01/dev/tag_manual`)여야 한다.
접근 URL: `http://{server}/public/` 또는 `http://{server}/public/index.html`

## 우선순위

1. nginx 설정 + Docker 구성 (서버 기반)
2. 경로 이슈 최종 확인
3. git 정리 + 배포 스크립트
4. 배포 후 기능 검증

## 불포함 (이번 사이클에서 하지 않을 것)

- HTTPS / 인증서 설정
- 도메인 연결
- 외부 인터넷 배포 (클라우드 호스팅)
- 기존 코드 리팩토링
- 새 기능 추가

## 승인

CEO 승인: ✅ 2026-05-13
