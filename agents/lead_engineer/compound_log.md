# Compound Log

반복 실수, 비효율, 패턴을 기록하고 개선 조치를 추적합니다.
새로운 에이전트가 합류하거나 작업을 이어받을 때 반드시 읽어야 하는 파일입니다.

---

## 사용 방법

새로운 Compound 항목은 아래 형식으로 이 파일에 추가합니다:

```
### COMPOUND-{번호}
날짜: YYYY-MM-DD
발견한 패턴: 무슨 실수/비효율이 반복됐는가
근본 원인: 왜 반복됐는가
개선 조치: 앞으로 어떻게 바꿀 것인가
적용 대상: 어떤 역할/작업에 적용되는가
상태: 적용 완료 / 적용 중 / 대기
```

---

## 기록

### COMPOUND-001

날짜: 2026-05-13
발견한 패턴: 로컬 커밋을 원격에 push하지 않은 상태에서 PR을 만들고 squash merge하면 local/remote main 히스토리가 분기됨.
근본 원인: HTTPS push 실패로 로컬 커밋들이 원격에 없었고, feature 브랜치만 push됨. PR squash가 그 상태의 remote main 위에 얹혀 분기 발생.
개선 조치: feature 브랜치 생성 전 반드시 `git push origin main`으로 로컬 main을 원격과 동기화. HTTPS push 실패 시 SSH URL로 즉시 전환 (`git remote set-url origin git@github.com:ycpiglet/tag_manual.git`).
적용 대상: CI/CD Engineer
상태: 적용 완료
