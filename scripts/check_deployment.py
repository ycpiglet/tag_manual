"""
Vercel 배포 상태 확인 — Python (Vercel REST API)

사용법:
  python scripts/check_deployment.py            # 최신 배포 상태
  python scripts/check_deployment.py --wait     # 배포 완료까지 대기

필요 환경변수 (.env):
  VERCEL_TOKEN, VERCEL_PROJECT_ID
"""

import os
import sys
import time
import requests
from dotenv import load_dotenv
import sentry_sdk

load_dotenv()

if dsn := os.getenv("SENTRY_DSN"):
    sentry_sdk.init(dsn=dsn, environment="ci")

VERCEL_TOKEN      = os.environ["VERCEL_TOKEN"]
VERCEL_PROJECT_ID = os.getenv("VERCEL_PROJECT_ID", "prj_AUz1WUiFZ7RnwjfFoSgnYOpCh9uC")
API_BASE          = "https://api.vercel.com"

HEADERS = {"Authorization": f"Bearer {VERCEL_TOKEN}"}


def get_latest_deployment() -> dict:
    resp = requests.get(
        f"{API_BASE}/v6/deployments",
        headers=HEADERS,
        params={"projectId": VERCEL_PROJECT_ID, "limit": 1},
        timeout=10,
    )
    resp.raise_for_status()
    deployments = resp.json().get("deployments", [])
    if not deployments:
        raise RuntimeError("배포 이력 없음")
    return deployments[0]


def get_deployment_detail(deployment_id: str) -> dict:
    resp = requests.get(
        f"{API_BASE}/v13/deployments/{deployment_id}",
        headers=HEADERS,
        timeout=10,
    )
    resp.raise_for_status()
    return resp.json()


def print_status(dep: dict) -> None:
    state   = dep.get("readyState") or dep.get("state", "?")
    url     = dep.get("url", "?")
    created = dep.get("createdAt", 0)
    emoji   = {"READY": "✅", "ERROR": "❌", "BUILDING": "🔨", "QUEUED": "⏳"}.get(state, "❓")
    print(f"  {emoji}  상태: {state}")
    print(f"  🌐  URL: https://{url}")
    print(f"  🕐  생성: {created}")


def wait_for_ready(deployment_id: str, timeout: int = 120) -> bool:
    print(f"  배포 완료 대기 중 (최대 {timeout}초)...")
    start = time.time()
    while time.time() - start < timeout:
        dep = get_deployment_detail(deployment_id)
        state = dep.get("readyState") or dep.get("state", "")
        print(f"    → {state}")
        if state == "READY":
            return True
        if state == "ERROR":
            return False
        time.sleep(5)
    return False


def main() -> None:
    wait = "--wait" in sys.argv

    print("\n=== Vercel 배포 상태 확인 ===")
    try:
        dep = get_latest_deployment()
        dep_id = dep["uid"]
        print(f"  배포 ID: {dep_id}")
        print_status(dep)

        if wait:
            ok = wait_for_ready(dep_id)
            if ok:
                print("\n✅ 배포 완료")
            else:
                print("\n❌ 배포 실패 또는 타임아웃")
                sys.exit(1)

    except Exception as e:
        sentry_sdk.capture_exception(e)
        print(f"  ✗  오류: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
