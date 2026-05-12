# Rubberneck 매뉴얼

## 개요

Rubberneck은 KETI의 TOM AND GERRI 프레임워크에서 사용하는 **WebRTC 시그널링 서버**다. 로봇(TOM)과 오퍼레이터(PC) 간의 P2P WebRTC 연결을 중개하고, COTURN 릴레이 서버도 함께 제공한다.

```
오퍼레이터 (PC)
    │
    │ WebSocket (시그널링)
    ▼
Rubberneck 서버 (rubberneck.kr)
    │
    │ WebSocket (시그널링)
    ▼
  로봇 (TOM / Jetson)
    │
    └─── WebRTC P2P 연결 수립 후 직접 통신
         (COTURN이 NAT 통과 릴레이 담당)
```

---

## 접속 정보

| 항목 | 값 |
|---|---|
| 서비스 URL | `https://rubberneck.kr` |
| COTURN 호스트 | `rubberneck.kr` |
| 로컬 서버 URL | `http://localhost` |
| 로컬 COTURN 호스트 | `localhost` |

---

## 계정 종류

Rubberneck에는 두 종류의 접속 주체가 있다.

### Robot 계정

- 로봇 하드웨어가 Rubberneck에 등록될 때 발급되는 계정
- **API Key** 방식으로 인증 (비밀번호 방식도 지원)
- `My Pages > Robots`에서 등록 및 API Key 확인

### User(Operator) 계정

- 오퍼레이터(PC)가 로봇에 접속할 때 사용하는 일반 사용자 계정
- **ID / Password** 방식으로 인증
- `https://rubberneck.kr`에서 회원가입

---

## 로봇 등록 및 API Key 발급

1. `https://rubberneck.kr` 로그인
2. 좌측 사이드바: `My Pages > Robots`
3. `+ New Robot` 클릭 후 아래 항목 입력

| 필드 | 설명 | 예시 |
|---|---|---|
| Robot ID | 코드에서 참조할 고유 식별자 | `hello_universe` |
| Name | 표시용 이름 | `hello_universe_robot` |
| Organizations | 소속 조직 | `Default` |
| Robot Type | 로봇 분류 | `unknown`, `mobile`, `manipulator` |
| Password | 비밀번호 인증 방식 사용 시 설정 | |

4. 등록 후 로봇 행의 **펜(✏️) 버튼** 클릭 → `API Key` 필드에서 키 복사

> API Key와 Password 중 하나만 사용한다. API Key가 설정되어 있으면 Password는 무시된다.

---

## 환경 변수 설정 (`.env` 방식)

`helloworld_robot.env` 예시:

```bash
# Rubberneck 서버 (공개 서버)
RUBBERNECK_URL=https://rubberneck.kr
RUBBERNECK_COTURN_HOST=rubberneck.kr

# 로봇 식별
RUBBERNECK_ROBOT_GROUP_ID=robot_hello_world

# 인증: API Key 방식 (권장)
RUBBERNECK_ROBOT_API_KEY=e6b1f433d536ad654d963a64d59e105d

# 인증: Password 방식 (API Key 미사용 시)
# RUBBERNECK_ROBOT_PASSWORD=123
```

로컬 서버를 사용할 때:

```bash
RUBBERNECK_URL=http://localhost
RUBBERNECK_COTURN_HOST=localhost
```

---

## 로봇 측 설정 (`ROBOT_INFO`)

`hello_universe_robot_config.py`:

```python
ROBOT_INFO = {
    "id": "hello_universe",       # Rubberneck에 등록한 Robot ID
    "model": "gerri",             # 로봇 모델 (ur5e, gocart180, m1509 등)
    "category": "sample",         # 로봇 종류 (mobile, manipulator 등)
    "api_key": "53ff4e1f43cd...", # Rubberneck에서 발급받은 API Key
}
```

비밀번호 방식을 쓸 경우 `api_key` 대신:

```python
ROBOT_INFO = {
    "id": "hello_universe",
    "model": "gerri",
    "category": "sample",
    "password": "123",
}
```

---

## 오퍼레이터 측 설정 (`OPERATOR_INFO`)

`hello_universe_config.py`:

```python
OPERATOR_INFO = {
    "id": "salmon",         # rubberneck.kr 계정 ID
    "password": "keti1234", # rubberneck.kr 계정 비밀번호
}
```

---

## 채널 구조

하나의 로봇은 복수의 채널을 독립적으로 운영한다. 각 채널은 별도의 WebRTC 피어 커넥션으로 관리된다.

| 채널 | Robot ID 패턴 | 용도 |
|---|---|---|
| Command | `{robot_group_id}_command` | 제어 명령 송수신 |
| Video | `{robot_group_id}_camera` | 영상 스트리밍 |
| Audio | `{robot_group_id}_audio` | 음성 스트리밍 |

예시 (`RUBBERNECK_ROBOT_GROUP_ID=robot_hello_world`):
- Command 채널 ID: `robot_hello_world_command`
- Camera 채널 ID: `robot_hello_world_camera`

---

## 코드에서 연결하는 방법

### 로봇 측 (ketirtc 직접 사용)

```python
from ketirtc.robot.webrtc.rubberneck_robot_client import RubberneckRobotClientWebsocket

signalling_server = RubberneckRobotClientWebsocket(
    robot_client_id="robot_hello_world_command",
    signalling_server_url="https://rubberneck.kr",
    coturn_host="rubberneck.kr",
    api_key="53ff4e1f43cd143d685ba797600537cb",
    password=None,
    is_control_channel=True,
    camera=None,
    microphone=None,
)
```

### 로봇 측 (TOM AND GERRI 프레임워크)

`ROBOT_INFO`를 `hello_universe_robot_config.py`에 채운 후 `hello_universe_robot.py`를 실행하면 프레임워크가 자동으로 연결한다.

```bash
source venv/bin/activate
python hello_universe_robot.py
```

### 오퍼레이터 측 (TOM AND GERRI 프레임워크)

`OPERATOR_INFO`를 `hello_universe_config.py`에 채운 후:

```bash
source venv/bin/activate
python hello_universe_operator.py
```

> 로봇 측을 먼저 실행해야 오퍼레이터가 접속할 수 있다.

---

## 실행 순서 요약

```
1. rubberneck.kr 에서 로봇 등록 → API Key 복사
2. ROBOT_INFO에 id, api_key 설정
3. OPERATOR_INFO에 id, password 설정
4. 로봇 측 실행 (Jetson/TOM)
5. 오퍼레이터 측 실행 (PC)
6. Rubberneck 시그널링 → WebRTC P2P 연결 수립
```

---

## 연결 상태 확인

`rubberneck.kr > My Pages > Robots`에서 로봇의 STATUS 컬럼이 `offline` → `online`으로 바뀌면 연결 성공이다. Last Login 시각도 갱신된다.

---

## 트러블슈팅

| 증상 | 원인 | 조치 |
|---|---|---|
| 로봇이 계속 `offline` | API Key 또는 Robot ID 불일치 | `ROBOT_INFO.id`가 Rubberneck에 등록한 Robot ID와 정확히 일치하는지 확인 |
| 오퍼레이터 연결 실패 | OPERATOR_INFO 인증 오류 | rubberneck.kr 로그인 ID/PW 재확인 |
| WebRTC 연결 수립 실패 | NAT/방화벽 문제 | COTURN 호스트 설정 확인, 포트 3478(UDP) 개방 여부 확인 |
| 영상/음성 없이 명령만 작동 | 채널 미실행 | camera/audio 채널의 `connect()` 호출 여부 확인 |
| 로컬 서버 사용 시 연결 안 됨 | URL 스키마 오류 | 로컬은 `http://localhost` (https 아님) |
