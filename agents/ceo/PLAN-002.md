# PLAN-002 — 내부 네트워크 배포 완성

작성일: 2026-05-13
작성자: CEO
참조: PLAN-001 완료, CYCLE-001 REVIEW
상태: 확정

---

## 목표

배포된 서비스를 실제 팀원이 내부 네트워크에서 접근 가능한 상태로 만든다.
git 이력도 깔끔하게 정리한다.

## 성공 기준

- [ ] `http://{서버IP}:8080/` 접속 시 앱이 바로 열림 (URL에 /public/index.html 불필요)
- [ ] 같은 네트워크의 다른 PC에서 브라우저로 접근 가능
- [ ] feature/deploy가 main에 머지됨
- [ ] git 이력이 깔끔함 (pre-existing 변경 포함)

## 제약

- public/index.html 코드 수정 없음 유지
- HTTPS, 외부 도메인, 인증 변경은 이번 사이클 범위 밖
- 서버 방화벽/포트 설정은 환경에 따라 달라질 수 있음

## 우선순위

1. git 정리 (미커밋 파일 커밋 + pre-existing 변경 처리 + main 머지)
2. nginx에 / → /public/index.html 리다이렉트 추가
3. 내부 IP 접근 확인
4. deploy.sh 업데이트

## 불포함

- HTTPS / 인증서
- 외부 도메인
- BTC-001 모바일 대응
- BTC-002 인증 시스템 변경

## 승인

CEO 승인: ✅ 2026-05-13
