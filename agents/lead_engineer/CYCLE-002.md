# CYCLE-002 — 내부 네트워크 배포 완성

작성일: 2026-05-13
작성자: Lead Engineer
참조: agents/ceo/PLAN-002.md
상태: 완료

---

## 현황 요약 (인수인계용)

### 지금 이 순간 서버 상태

- Docker 컨테이너 실행 중: `tag_manual-web-1`
- 접근 URL: `http://localhost:8080/public/index.html`
- git 브랜치: `feature/deploy` (main 미머지)
- 미커밋 변경: BTC-001~004, TASK 완료기록, INDEX.md

### CYCLE-001에서 넘어온 미처리 사항

| 항목 | 내용 |
|------|------|
| 미커밋 파일 | agents/ 하위 완료기록들, BTC-001~004 |
| pre-existing 변경 | public/final.html 삭제, public/index.html 수정 |
| 브랜치 | feature/deploy → main 미머지 |
| URL | /public/index.html 경로가 길고 불편 |

### 이번 사이클 태스크

| ID | 담당 | 내용 | 상태 | 의존성 |
|----|------|------|------|--------|
| TASK-006 | CI/CD | 미커밋 파일 커밋 + pre-existing 변경 처리 + PR 생성 + main 머지 | 대기 | 없음 |
| TASK-007 | Backend | nginx.conf에 / → /public/index.html 리다이렉트 추가 | 대기 | 없음 |
| TASK-008 | QA | 내부 네트워크 IP 접근 확인 + 리다이렉트 동작 검증 | 대기 | TASK-007 완료 후 |

### 의존성

```
TASK-006 (CI/CD)  ←── 즉시 시작
TASK-007 (Backend) ←── 즉시 시작
TASK-008 (QA)      ←── TASK-007 완료 후
```

## PLAN 단계 기록

- CEO 목표: 내부 네트워크 접근 + URL 단순화 + git 정리
- URL 단순화 방법: nginx `location / { return 301 /public/index.html; }` 추가
- pre-existing 변경(public/final.html 삭제, public/index.html 수정)은
  별도 커밋으로 처리. 내용이 이미 완성된 프로토타입이므로 `feat: update prototype` 커밋

## REVIEW (사이클 완료 후 작성)

### 완료 현황

| ID | 담당 | 결과 |
|----|------|------|
| TASK-006 | CI/CD | 완료. 4개 커밋 생성 후 feature/deploy → main 머지 (38c1938) |
| TASK-007 | Backend | 완료. nginx absolute_redirect off + 301 리다이렉트 추가 |
| TASK-008 | QA | 완료. 전체 통과. 내부 IP 192.168.100.114, 192.168.0.6 확인 |

### 주요 발견 사항

1. **absolute_redirect off 필수**: nginx는 기본적으로 301 Location을 절대 URL로 반환 (`http://localhost/...`). 이때 서버 내부 포트(80)를 사용해 외부 포트(8080)가 소실됨. `absolute_redirect off`로 상대경로 Location 응답하도록 수정.

2. **내부 네트워크 접근 확인**: 포트 8080이 0.0.0.0에 바인딩되어 외부 접근 가능. 내부 IP는 `192.168.100.114`, `192.168.0.6` 두 개. 방화벽 규칙은 별도 확인 필요하나 서버 측 포트는 열려 있음.

3. **git 브랜치 정리**: feature/deploy 브랜치 main 머지 완료. 브랜치 삭제는 미처리(선택사항).

### 미처리/다음 사이클 고려사항

- feature/deploy 브랜치 삭제 (git branch -d feature/deploy)
- TASK-006/007/008 완료기록 커밋 (현재 uncommitted)
- BTC-001 (mobile min-width) 수정 여부 결정: 현재 실사용 환경이 PC 위주이므로 낮은 우선순위
- BTC-002 (로그인 정보 소스 노출): 보안 검토 필요
- BTC-003 (localStorage 세션 공유 PC 위험): 운영 정책 결정 필요

## COMPOUND

_없음_
