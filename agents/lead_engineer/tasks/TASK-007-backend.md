# TASK-007 | Backend Engineer

상태: 완료
담당: Backend Engineer
생성일: 2026-05-13
참조: CYCLE-002

---

## 목표

`http://{IP}:8080/` 접속 시 앱이 바로 열리도록 nginx 리다이렉트를 추가한다.

## 현재 상태

- `http://localhost:8080/public/index.html` 로 직접 경로 입력 필요
- `/` 접속 시 nginx 기본 404 반환

## 작업 내용

`nginx.conf`에 리다이렉트 location 추가:

```nginx
# / 접속 시 앱으로 리다이렉트
location = / {
    return 301 /public/index.html;
}
```

기존 `location /` 블록 위에 추가할 것.
(= 연산자로 정확히 / 경로만 매칭, 나머지 정적 파일 서빙에 영향 없음)

## 완료 기준

- `curl -I http://localhost:8080/` 응답이 `301 → /public/index.html`
- `curl -L http://localhost:8080/` 응답이 index.html 내용 (200)
- 기존 리소스 경로(`/src/assets/`, `/docs/`) 영향 없음

## 완료 기록 (작업 후 이 섹션을 채울 것)

```
완료일:
결과:
변경 파일:
이슈:
인수 사항:
```

## 완료 기록

```
완료일: 2026-05-13
결과: nginx.conf에 absolute_redirect off + location = / 리다이렉트 추가
변경 파일: nginx.conf
검증:
  curl -sI http://localhost:8080/  → 301 Location: /public/index.html (상대경로)
  curl -sL http://localhost:8080/  → 200 http://localhost:8080/public/index.html
  기존 경로 (/public/index.html, /src/assets/, /docs/) 영향 없음 확인
이슈:
  최초 return 301 /public/index.html 적용 후 Location이 포트를 빠뜨린
  절대 URL(http://localhost/public/index.html)로 응답되는 문제 발생.
  absolute_redirect off 추가로 해결.
인수 사항:
  - nginx.conf 변경 시 반드시 docker compose up -d --build 필요 (재시작만으로는 미적용)
```
