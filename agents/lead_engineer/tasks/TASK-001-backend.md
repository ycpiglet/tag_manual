# TASK-001 | Backend Engineer

상태: 완료
담당: Backend Engineer
생성일: 2026-05-13

---

## 목표

`public/index.html`을 포함한 프로젝트 전체를 서빙하는
nginx 설정과 Docker 구성을 작성한다.

## 필수 배경 지식

index.html이 `../src/assets/images/` 경로로 이미지를 참조한다.
따라서 nginx의 document root는 `public/`이 **아니라** 프로젝트 루트여야 한다.

- nginx root: `/home/keti-itp-01/dev/tag_manual`
- 접근 URL: `http://localhost/public/` 또는 `http://localhost/public/index.html`
- 포트: 8080 (80은 권한 문제 가능)

## 입력

- 프로젝트 구조:
  ```
  /home/keti-itp-01/dev/tag_manual/
  ├── public/
  │   ├── index.html      ← 메인 앱
  │   ├── data/           ← CSV/JSON
  │   ├── docs/           ← (없으면 ../docs/ fallback 사용)
  │   └── images/
  ├── src/
  │   └── assets/
  │       ├── fonts/
  │       └── images/     ← 로봇/로고/담당자 이미지
  └── docs/
      ├── manuals/        ← 로봇 매뉴얼 .md
      └── vendor_docs/    ← PDF 문서
  ```

## 출력 (생성할 파일)

프로젝트 루트에:
1. `nginx.conf` — nginx 설정
2. `Dockerfile` — nginx 이미지 기반 컨테이너
3. `docker-compose.yml` — 로컬 실행용

## 완료 기준

- 세 파일이 프로젝트 루트에 존재한다
- `docker-compose up` 실행 후 `http://localhost:8080/public/index.html` 접근 시 로그인 화면이 표시되어야 한다 (nginx 로그 기준 200 OK)
- `../src/assets/images/logos/logo_keti.jpg` 요청 시 404가 나지 않아야 한다

## 완료 기록

```
완료일: 2026-05-13
결과: nginx.conf, Dockerfile, docker-compose.yml, .dockerignore 생성
변경 파일:
  - nginx.conf         (신규)
  - Dockerfile         (신규)
  - docker-compose.yml (신규)
  - .dockerignore      (신규)
이슈: 없음
검증:
  - http://localhost:8080/public/index.html         → 200 OK
  - http://localhost:8080/src/assets/images/logos/logo_keti.jpg → 200 OK
  - http://localhost:8080/docs/manuals/gocart180/user_manual.md → 200 OK
  - 컨테이너: tag_manual-web-1 (running)
인수 사항:
  - nginx root = 프로젝트 루트(/home/keti-itp-01/dev/tag_manual)
  - docker-compose.yml의 volumes로 파일 변경 시 재빌드 불필요
  - 포트: host 8080 → container 80
  - 현재 컨테이너 실행 중 (docker compose down으로 중지)
```
