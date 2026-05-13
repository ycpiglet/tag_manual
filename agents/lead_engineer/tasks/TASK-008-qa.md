# TASK-008 | QA

상태: TASK-007 완료 후 시작
담당: QA
생성일: 2026-05-13
참조: CYCLE-002

---

## 목표

리다이렉트 동작과 내부 네트워크 접근 가능 여부를 검증한다.

## 테스트 항목

### 리다이렉트 검증

```bash
# 301 리다이렉트 확인
curl -I http://localhost:8080/
# 기대: HTTP/1.1 301, Location: /public/index.html

# 최종 도달 확인
curl -L -o /dev/null -w "%{http_code} %{url_effective}" http://localhost:8080/
# 기대: 200 http://localhost:8080/public/index.html
```

### 기존 리소스 영향 없음 확인

```bash
curl -o /dev/null -w "%{http_code}" http://localhost:8080/src/assets/images/logos/logo_keti.jpg
# 기대: 200
curl -o /dev/null -w "%{http_code}" http://localhost:8080/public/index.html
# 기대: 200
```

### 내부 네트워크 접근 확인

```bash
# 서버 IP 확인
hostname -I

# 같은 네트워크에서 접근 가능한지 확인
# (방화벽 포트 8080 허용 여부 체크)
ss -tlnp | grep 8080
```

## 완료 기준

- 301 리다이렉트 동작 확인
- 기존 경로 영향 없음 확인
- 서버 IP 확인 및 포트 접근 가능 여부 판단

## 완료 기록 (작업 후 이 섹션을 채울 것)

```
완료일:
결과:
서버 IP:
포트 8080 외부 접근 가능 여부:
이슈:
인수 사항:
```
