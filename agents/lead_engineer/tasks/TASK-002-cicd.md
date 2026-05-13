# TASK-002 | CI/CD Engineer

상태: 대기
담당: CI/CD Engineer
생성일: 2026-05-13

---

## 목표

git 저장소를 배포 준비 상태로 정리하고, 배포 스크립트를 작성한다.

## 입력

- 현재 git 상태 (main 브랜치, clean)
- TASK-001에서 생성될 파일: nginx.conf, Dockerfile, docker-compose.yml

## 작업 내용

### 1단계: 즉시 시작 가능

- 현재 git 상태 확인 (`git status`, `git log --oneline -5`)
- `.gitignore` 점검:
  - `agents/` 디렉토리를 git에서 추적할지 결정 (추적 권장: 작업 기록 보존)
  - 추가해야 할 항목: `.env`, `*.log`, `__pycache__/`, `.DS_Store`
- `deploy.sh` 작성 (Docker 기반 배포 스크립트 초안)

### 2단계: TASK-001 완료 후

- nginx.conf, Dockerfile, docker-compose.yml 커밋
- 브랜치: `feature/deploy` 생성 후 커밋
- 커밋 메시지 형식: `ci: add nginx/docker deployment configuration`

## 출력 (생성할 파일)

1. `deploy.sh` — 배포 실행 스크립트
2. `.gitignore` — 업데이트 (이미 있으면 항목 추가)

## deploy.sh 내용 (최소)

```bash
#!/bin/bash
# STAR TEAM 배포 스크립트
set -e
docker-compose down 2>/dev/null || true
docker-compose up -d --build
echo "배포 완료: http://localhost:8080/public/index.html"
```

## 완료 기준

- deploy.sh가 프로젝트 루트에 존재하고 실행 권한 있음 (`chmod +x`)
- TASK-001 완료 후: nginx.conf, Dockerfile, docker-compose.yml이 커밋됨
- `git log --oneline -3`으로 커밋 내역 확인 가능

## 완료 기록 (작업 후 이 섹션을 채울 것)

```
완료일:
결과:
변경 파일:
이슈:
인수 사항:
```
