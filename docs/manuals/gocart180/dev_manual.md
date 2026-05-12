# GoCart180 소프트웨어 운영 매뉴얼

> **대상**: KETI 로봇 운영자 및 개발자  
> **범위**: TOM AND GERRI 프레임워크, Rubberneck 원격 조작, SOLAR 모니터링  
> **기준 코드**: `tom_and_gerri` 저장소 (`~/dev/tom_and_gerri/`)

---

## 목차

1. [시스템 구조](#1-시스템-구조)
2. [시작 및 종료](#2-시작-및-종료)
3. [Rubberneck 조작법](#3-rubberneck-조작법)
4. [로봇 상태 흐름](#4-로봇-상태-흐름)
5. [SOLAR 모니터링](#5-solar-모니터링)
6. [로봇 식별 및 설정](#6-로봇-식별-및-설정)
7. [트러블슈팅](#7-트러블슈팅)

---

## 1. 시스템 구조

```
[Rubberneck 브라우저]
        │ WebRTC (KetiRTC 시그널링)
        ▼
  [AND - Adaptive Network Daemon]     ← 미디어 스트림 + 명령 수신
        │ pubsub ("receive_message")
        ▼
  [BaseController]                    ← /joy 파싱, 버튼 디바운싱
        │ 메서드 호출
        ▼
  [SubController]                     ← WebSocket, RCS 프로토콜
        │ ws://192.168.100.10x:10900
        ▼
  [GoCart180 RCS]                     ← 로봇 하드웨어
        │ feedback (0.1s 주기)
        ▼
  [SOLAR 서버]  ←  SubController가 상태 주기적으로 push
  (124.56.25.89:10086)
```

### 컴포넌트 역할 요약

| 컴포넌트 | 역할 | 위치 |
|----------|------|------|
| **AND** (Adaptive Network Daemon) | Rubberneck WebRTC 연결, 미디어/명령 중계 | NUC 로컬 |
| **BaseController** | pubsub 메시지 수신, `/joy` 파싱, 버튼 디바운싱 | NUC 로컬 |
| **SubController** | RCS WebSocket 통신, 로그인/조이스틱/상태 | NUC 로컬 |
| **RCS** (Rocon Client Service) | 로봇 하드웨어 제어 API | 로봇 내부 `:10900` |
| **Rubberneck** | 브라우저 기반 원격 조작 UI | 원격 클라이언트 |
| **KetiRTC** | WebRTC 시그널링 서버 | 외부 서버 |
| **SOLAR** | 로봇 상태 모니터링 서버 | `124.56.25.89:10086` |
| **FMS / Balcony** | 플릿 관제 (Job 생성/관리) | AWS 원격 서버 |

> ⚠️ **FMS는 로컬 NUC에서 동작하지 않음.** AWS 원격 서버에서 실행됨.

---

## 2. 시작 및 종료

### 2.1 프로그램 실행

```bash
cd ~/dev/tom_and_gerri
source .venv/bin/activate

# 실행 (hostname 자동 감지로 로봇 설정 결정)
python -m gerri.tag_gocart.robot.gocart180_robot
```

> hostname이 `tom-gocart-itp-02` 형식이면 자동으로 해당 로봇 프리셋 적용됨  
> hostname 형식 불일치 시 기본값 `SD_02` 사용 (경고 로그 출력)

### 2.2 실행 시 자동 수행되는 동작

1. **BaseController** 초기화 → pubsub 구독 등록
2. **SubController** 초기화 → 전용 이벤트 루프 스레드 시작
3. `sub_controller.login_sync()` → RCS WebSocket 연결 + 로그인 (최대 5회 재시도)
4. 로그인 성공 → `set_feedback(interval=0.1s)` → 로봇 상태 수신 시작
5. **AND** 초기화 → KetiRTC 연결, 카메라/오디오 스트리밍 시작
6. **SOLAR** 클라이언트 → 별도 스레드에서 상태 push 시작
7. 조작 대기 상태 진입

### 2.3 정상 기동 로그 확인

```
INFO | Preset SD_02 detected from hostname
INFO | SubController initialized (URI: ws://192.168.100.102:10900)
INFO | WebSocket connected
INFO | Login successful (attempt 1/5)
INFO | AND connected
INFO | SOLAR started
INFO | Waiting for connection...
```

`Waiting for connection...` 이후 Rubberneck에서 접속 가능.

### 2.4 종료

`Ctrl+C` → 정상 종료 시퀀스:
1. `BaseController.disconnect()` → `SubController.disconnect()`
2. 조이스틱 활성화 상태면 자동으로 `disable_joystick()` 먼저 실행
3. `logout()` → WebSocket 종료

---

## 3. Rubberneck 조작법

### 3.1 Rubberneck 접속

1. 브라우저에서 Rubberneck 주소 접속
2. 해당 로봇 ID 선택하여 연결
3. 연결 후 카메라 영상 확인
4. 키보드 단축키로 로봇 제어

> Rubberneck 브라우저 창에 **포커스가 있어야** 키보드 입력이 동작함

---

### 3.2 키보드 단축키 전체 목록

| 키 | 기능 | 전제 조건 | 상세 |
|----|------|----------|------|
| **Q** | 로그인 / 로그아웃 토글 | - | 로그인 상태면 logout, 아니면 login |
| **R** | 조이스틱 모드 On/Off 토글 | 로그인 필요 | 조이스틱 활성 상태면 off, 아니면 on |
| **Z** | 조이스틱 강제 활성화 | 로그인 필요 | 이미 켜져 있어도 무시 |
| **C** | 조이스틱 강제 비활성화 | - | 조이스틱 off + 속도 0으로 리셋 |
| **Space** | 현재 포즈(위치) 출력 | - | NUC 터미널 로그에 출력 |
| **E** | 로그 모드 순환 | - | OFF → SOLAR → RAW JSON → OFF |
| **W** | 전진 | 조이스틱 ON | LEFT_Y 양수 |
| **S** | 후진 | 조이스틱 ON | LEFT_Y 음수 |
| **A** | 좌회전 | 조이스틱 ON | LEFT_X 음수 |
| **D** | 우회전 | 조이스틱 ON | LEFT_X 양수 |

> **버튼 디바운싱**: Q/R/Z/C/Space/E는 **0.5초** 이내 중복 입력 무시됨

---

### 3.3 이동 조작 상세

#### Dead Man's Switch 동작

조이스틱 명령 전송 주기: **0.1초**  
마지막 입력으로부터 **0.2초** 경과 시 자동으로 속도 0 리셋 → 키 손을 떼면 정지.

#### 속도 제한

| 항목 | 값 |
|------|-----|
| 최대 선속도 | 0.5 m/s |
| 최대 각속도 | 0.5 rad/s |
| 입력 범위 | -1.0 ~ 1.0 (비율) |

WASD 입력은 `±1.0` 비율로 전달되어 `max_speed` 범위 내에서 동작.

#### 정상 이동 순서

```
1. Q          → 로그인 확인 (로그에서 "Login successful" 확인)
2. R 또는 Z   → 조이스틱 활성화 (로그에서 "Joystick enabled (token: ...)" 확인)
3. WASD       → 이동 (Rubberneck 창 포커스 유지 필수)
4. C 또는 R   → 조이스틱 비활성화
```

---

### 3.4 로그 모드 (E 키)

E 키를 누를 때마다 순환:

```
OFF → SOLAR → RAW JSON → OFF → ...
```

| 모드 | 출력 내용 |
|------|-----------|
| `OFF` | 기본 상태, 추가 로그 없음 |
| `SOLAR` | SOLAR 서버로 전송되는 상태 데이터 출력 |
| `RAW JSON` | RCS로부터 수신한 raw WebSocket 메시지 전체 출력 |

디버깅 시 `RAW JSON` 모드로 RCS 응답 확인 가능.

---

## 4. 로봇 상태 흐름

### 4.1 상태 플래그 구조

SubController 내부에 3개의 독립 상태 플래그가 있음:

```
is_connected      WebSocket 연결 여부 (ws://...:10900)
is_logged_in      RCS 인증 완료 여부
is_joystick_active  Virtual Joystick 토큰 보유 여부
```

의존 관계:

```
is_connected
    └── is_logged_in (연결 없으면 로그인 불가)
            └── is_joystick_active (로그인 없으면 조이스틱 불가)
```

### 4.2 조이스틱 모드 내부 동작

활성화 시 3개의 루프가 백그라운드에서 동작:

```
_receiver_loop    WebSocket 메시지 수신 (항상 동작)
_health_loop      VJ 토큰 헬스체크 전송 (0.5s 주기)
_sending_loop     속도 명령 전송 (0.1s 주기)
```

조이스틱 비활성화 시 health/sending 루프 취소 → `VirtualJoystickFinish` 전송 → 토큰 해제.

### 4.3 RobotStatus 필드

SOLAR 및 내부 상태 추적에 사용되는 주요 필드:

| 필드 | 의미 |
|------|------|
| `gocart180_worker_status` | `"idle"` / `"busy"` |
| `robot_state.mode` | `"MODE_AUTO"` / `"MODE_TELEOP"` |
| `robot_state.operating_state` | `["FORWARD"]`, `["LEFT_TURN"]` 등 |
| `pose.pose_2d` | x, y, theta (미터, 라디안) |
| `battery_state.percentage` | 배터리 잔량 (%) |
| `battery_state.now_charging` | 충전 중 여부 |
| `nav_state.goal` | 현재 Job ID |

`idle → busy` 전환 시 `start_episode` pubsub 이벤트 발행.  
`busy → idle` 전환 시 `end_episode` pubsub 이벤트 발행.

---

## 5. SOLAR 모니터링

### 5.1 연결 정보

| 항목 | 값 |
|------|-----|
| 서버 주소 | `124.56.25.89:10086` |
| 로봇 ID | `ICTP` (고정) |
| 전송 방식 | WebSocket, 주기적 push |

### 5.2 전송 데이터

SubController가 RCS feedback 수신할 때마다 갱신 후 SOLAR로 push:

```python
{
    "robot_id", "robot_type", "robot_state",
    "pose", "velocity", "battery_state",
    "joint_state", "path_plan", "sensor",
    "map", "nav_state", "current_floor",
    "gocart180_worker_status"
}
```

### 5.3 현장 좌표계 랜드마크 (ICTP 기준)

| 층 | 랜드마크 | 좌표 (x, y) |
|----|----------|-------------|
| 1F | 우측 구석 기둥 | (21.23, -1.68) |
| 1F | 중앙 입구 오른쪽 구석 | (2.139, -34.46) |
| 1F | 쪽문 | (-27.83, -7.95) |
| 5F | 가운데 기둥 | (-5.21, 2.82) |
| 5F | 안쪽 기둥 | (9.74, -4.94) |
| 5F | 바깥쪽 기둥 | (10.12, 10.59) |

---

## 6. 로봇 식별 및 설정

### 6.1 프리셋 - IP 매핑

| 프리셋 | IP | RCS 엔드포인트 | 로봇 ID |
|--------|-----|---------------|---------|
| `SD_01` | `192.168.100.101` | `ws://...:10900` | `gocart180_sd_01` |
| `SD_02` | `192.168.100.102` | `ws://...:10900` | `gocart180_sd_02` |
| `LT_01` | `192.168.100.103` | `ws://...:10900` | `gocart180_lt_01` |
| `LT_02` | `192.168.100.104` | `ws://...:10900` | `gocart180_lt_02` |

### 6.2 hostname 자동 감지 규칙

hostname 마지막 두 파트로 프리셋 결정:

```
tom-gocart-itp-02  →  parts[-2]="itp", parts[-1]="02"
                   →  preset_key="ITP_02"  ← 현재 없음, 기본값으로 fallback
```

> ⚠️ **현재 hostname 형식 `tom-gocart-itp-xx`는 프리셋 키 `SD_xx`/`LT_xx`와 불일치**  
> 감지 실패 시 경고 로그 후 `SD_02`로 fallback.  
> 정확한 자동 감지를 원하면 `GoCart180Preset`에 `ITP_01~04` 프리셋 추가 또는 hostname 형식 수정 필요.

### 6.3 프리셋 강제 지정 (임시 방편)

`gocart180_config.py` 하단에서 주석 처리된 라인 활용:

```python
# 자동 감지 (기본)
GOCART_PRESET: GoCart180Preset = GoCart180Preset.get_current_preset()

# 강제 지정 (필요 시 주석 변경)
# GOCART_PRESET: GoCart180Preset = GoCart180Preset.LT_01
```

### 6.4 설정 자체 확인

```bash
python -m gerri.tag_gocart.robot.gocart180_config
```

```
==================================================
GoCart180 Configuration
==================================================
  Preset:   SD_02
  Robot ID: gocart180_sd_02
  URI:      ws://192.168.100.102:10900
==================================================
```

---

## 7. 트러블슈팅

<details>
<summary>로그인 실패 (5회 재시도 후 종료)</summary>

**로그:**
```
WARNING | Login attempt 1/5 failed: ...
ERROR   | Login failed after 5 attempts. URI: ws://..., ID: ...
```

**원인 및 조치:**

| 원인 | 확인 방법 | 조치 |
|------|-----------|------|
| 로봇 전원 꺼짐 | 로봇 LED 확인 | 전원 켜기 → Start 버튼 |
| NUC-로봇 네트워크 단절 | `ping 192.168.100.10x` | 네트워크 케이블/Wi-Fi 확인 |
| 잘못된 프리셋 IP | 로그의 URI 확인 | `gocart180_config.py` 프리셋 확인 |
| RCS 미구동 | 로봇에 SSH 접속 후 RCS 서비스 확인 | 유진로봇 지원팀 연락 |

</details>

<details>
<summary>조이스틱 활성화 실패 ("Failed to get joystick token")</summary>

**로그:**
```
ERROR | Enable joystick failed: ...
ERROR | Failed to get joystick token
```

**원인 및 조치:**

1. 로그인 상태 확인: Q 키로 logout → login 재시도
2. 다른 클라이언트가 이미 조이스틱 점유 중일 수 있음 → 다른 Rubberneck 세션 종료
3. RCS 내부 오류: C 키로 강제 disable 후 Z 키로 재시도
4. 그래도 안 되면: 프로그램 재시작

</details>

<details>
<summary>WASD 입력 시 로봇이 움직이지 않음</summary>

**체크리스트 순서:**

1. Rubberneck 브라우저 창에 **포커스**가 있는지 확인 (다른 창 클릭 후 복귀 시 포커스 빠짐)
2. **로그인** 상태 확인: 터미널에서 `INFO | Login successful` 출력 여부
3. **조이스틱 활성화** 확인: R 또는 Z 눌러 `INFO | Joystick enabled (token: ...)` 확인
4. 로봇 하드웨어 브레이크 스위치 `ON` 확인 ([GoCart180 운영 매뉴얼] 참조)
5. 로봇 Joystick 스위치 `Manual` 모드 확인

</details>

<details>
<summary>Rubberneck 영상이 안 나옴 (WebRTC 연결 실패)</summary>

**원인 및 조치:**

1. AND 미기동 확인: 터미널에서 `INFO | AND connected` 출력 여부
2. 카메라 장치 확인:
   ```bash
   ls /dev/video*
   # front_camera: source=0, rear_camera: source=2
   ```
3. KetiRTC 시그널링 서버 연결 확인 (외부 인터넷 필요)
4. Rubberneck에서 로봇 ID가 올바른지 확인 (`ROBOT_INFO["id"]` 값과 일치해야 함)
5. `systemd` 서비스 경로 확인: 이전에 `and_gerri` 경로 지정된 서비스가 있으면 재설정 필요  
   ```bash
   systemctl status gocart180
   # ExecStart 경로가 tom_and_gerri 가리키는지 확인
   # 아니면 setup_gocart180.sh 재실행 필요
   ```

</details>

<details>
<summary>SOLAR 서버 연결 실패</summary>

**로그:**
```
ERROR | SOLAR error: ...
```

**조치:**
- SOLAR 오류는 **로봇 제어에 영향 없음** (별도 데몬 스레드)
- 네트워크 상태 확인: `ping 124.56.25.89`
- 서버 포트 확인: `nc -zv 124.56.25.89 10086`
- SOLAR 없이도 Rubberneck 조작은 정상 동작

</details>

<details>
<summary>hostname 감지 실패 / 잘못된 프리셋으로 시작됨</summary>

**로그:**
```
WARNING | No preset 'ITP_02' from hostname 'tom-gocart-itp-02'. Using default: SD_02
```

**단기 조치:** `gocart180_config.py`에서 프리셋 강제 지정

```python
GOCART_PRESET: GoCart180Preset = GoCart180Preset.SD_02  # 원하는 프리셋으로 변경
```

**근본 조치 (둘 중 하나):**
- hostname을 `tom-gocart-sd-02` 형식으로 변경 (`set_hostname.sh` 스크립트 사용)
- 또는 `GoCart180Preset`에 `ITP_01~04` 프리셋 추가

</details>

<details>
<summary>stale __pycache__ 로 인한 임포트 오류</summary>

**증상:** `ImportError`, `AttributeError` 등이 소스 변경 후 발생

```bash
# tom_and_gerri 전체 pycache 제거
find ~/dev/tom_and_gerri -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null
find ~/dev/tom_and_gerri -name "*.pyc" -delete 2>/dev/null
```

다른 머신에서 소스 복사 후 또는 `git pull` 후 발생하면 반드시 실행.

</details>

---

## 부록: 내부 통신 흐름 요약

### Rubberneck 키 입력 → 로봇 이동

```
키보드 입력 (WASD)
    → Rubberneck이 /joy 메시지 생성
    → WebRTC DataChannel → AND
    → pub.sendMessage("receive_message", message={topic: "/joy", value: {axes: [...], buttons: [...]}})
    → BaseController.receive_message()
    → _handle_joy() → _process_axes()
    → SubController.set_velocity(linear, angular)
    → _sending_loop()가 0.1s마다 VirtualJoystickEvent → WebSocket → RCS
    → 로봇 이동
```

### RCS → SOLAR

```
로봇 하드웨어
    → RCS feedback (0.1s 주기)
    → WebSocket → SubController._receiver_loop()
    → _process_message() → _update_robot_status()
    → RobotStatus 갱신
    → SOLAR 클라이언트가 status_provider_callback() 호출 → push
```

---

*작성 기준: `gocart180_robot.py`, `gocart180_base_controller.py`, `gocart180_sub_controller.py`, `gocart180_config.py`*
