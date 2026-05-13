# TASK-007 | Backend Engineer

상태: 대기
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
