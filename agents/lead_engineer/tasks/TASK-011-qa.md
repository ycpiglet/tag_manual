# TASK-011 | QA

상태: TASK-009 완료 후 시작
담당: QA
생성일: 2026-05-13
참조: CYCLE-003

---

## 목표

`.vercelignore`와 `vercel.json`이 올바르게 구성됐는지 로컬에서 검증한다.

## 테스트 항목

### 1. .vercelignore 파일 목록 검증

```bash
# .vercelignore 존재 확인
cat .vercelignore

# 제외 대상 파일이 실제로 존재하는지 확인 (배포 전 참조용)
ls agents/ CLAUDE.md deploy.sh nginx.conf Dockerfile docker-compose.yml
```

기대: 모두 존재. 이 파일들이 .vercelignore에 나열되어 있으면 Vercel 배포 시 제외됨.

### 2. vercel.json rewrite 로직 검증

```bash
cat vercel.json
```

확인 항목:
- `rewrites`: `source: "/"` → `destination: "/public/index.html"` 존재 여부
- `.md` 파일에 `Content-Type: text/plain; charset=utf-8` 헤더 설정 여부
- `html/csv/json` 파일에 `Cache-Control: no-cache` 설정 여부

### 3. 앱 핵심 경로 접근 확인 (Docker로 로컬 검증)

```bash
# Docker가 실행 중이어야 함 (./deploy.sh)
curl -o /dev/null -w "/ redirect: %{http_code}\n" http://localhost:8080/
curl -o /dev/null -w "/public/index.html: %{http_code}\n" http://localhost:8080/public/index.html
curl -o /dev/null -w "/docs/manuals/spot: %{http_code}\n" http://localhost:8080/docs/manuals/spot/user_manual.md
curl -o /dev/null -w "/src/assets 이미지: %{http_code}\n" http://localhost:8080/src/assets/images/logos/logo_keti.jpg
```

기대: 모두 200 (또는 / → 301)

### 4. BTC-004 Vercel 자동 해결 메모

Vercel HTTPS 기본 제공 → geolocation API 사용 가능.
배포 후 실 환경에서 확인 필요. 현재 로컬 테스트로는 검증 불가.

## 완료 기준

- `.vercelignore`에 필수 제외 파일 모두 포함됨 확인
- `vercel.json` 구조 이상 없음 확인
- Docker 로컬 기본 경로 200 응답 확인

## 완료 기록 (작업 후 이 섹션을 채울 것)

```
완료일: 2026-05-13
결과: 전체 통과
이슈: 없음
인수 사항:
  - .vercelignore: 8개 제외 항목 모두 확인
  - vercel.json: rewrite 1개 + headers 3개 정상
  - Docker 로컬: / 301, /public/index.html 200, 매뉴얼 200, 이미지 200
  - BTC-004(GPS): Vercel HTTPS 환경에서 해결 예정. 배포 후 실 확인 필요.
```
