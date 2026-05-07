# Rubberneck 사용자 매뉴얼

## 개요

Rubberneck는 STAR TEAM 로봇 원격 관제 플랫폼이다. 현장 로봇의 영상, 연결 상태, 원격 조작 상태를 확인하고 운영자가 수동 제어 모드로 전환할 때 사용한다.

## 기동 절차

1. Rubberneck 계정으로 로그인한다.  
2. 로봇 목록에서 대상 로봇을 선택한다.  
3. 카메라 영상 수신 상태를 확인한다.  
4. 상태 LED가 녹색인지 확인한다.  
5. 원격 제어 모드를 ON으로 전환한다.

## 점검 체크리스트

- Rubberneck 계정 권한 확인
- TOM-Rubberneck 연결 상태 확인
- AND 데몬 상태 확인
- WebSocket heartbeat 간격 확인
- 영상 지연 확인

## 개발자 확인 항목

- WebSocket / WebRTC 연결 상태 확인
- AND / GERRI 프로세스 로그 확인
- TOM 서비스 재시작 후 heartbeat 확인
- 네트워크 인터페이스와 방화벽 정책 확인
