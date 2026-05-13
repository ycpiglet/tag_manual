#!/bin/bash
# STAR TEAM 배포 스크립트
# 사용: ./deploy.sh
# 접근: http://localhost:8080/public/index.html

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "[1/3] 기존 컨테이너 중지..."
docker compose down 2>/dev/null || true

echo "[2/3] 빌드 및 기동..."
docker compose up -d --build

echo "[3/3] 상태 확인..."
sleep 2
docker compose ps

echo ""
echo "배포 완료"
echo "접속 URL: http://localhost:8080/public/index.html"
