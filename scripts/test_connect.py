"""
Supabase 연결 테스트 — Python
scripts/test_connect.mjs 의 Python 대체 구현

사용법:
  python scripts/test_connect.py

필요 환경변수 (.env):
  SUPABASE_URL, SUPABASE_KEY
  SUPABASE_SERVICE_ROLE_KEY (선택 — 관리자 테스트)
"""

import os
from dotenv import load_dotenv
import sentry_sdk
from supabase import create_client

load_dotenv()

if dsn := os.getenv("SENTRY_DSN"):
    sentry_sdk.init(dsn=dsn, environment="test")

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_KEY"]


def ok(msg):  print(f"\033[32m✓\033[0m {msg}")
def fail(msg):print(f"\033[31m✗\033[0m {msg}")
def info(msg):print(f"  {msg}")


def test_anon_connection():
    print("\n[1] anon key 연결 테스트")
    try:
        sb = create_client(SUPABASE_URL, SUPABASE_KEY)
        result = sb.table("user_profiles").select("id").limit(1).execute()
        ok(f"user_profiles 조회 성공 ({len(result.data)}행)")
        return True
    except Exception as e:
        fail(f"anon 연결 실패: {e}")
        sentry_sdk.capture_exception(e)
        return False


def test_admin_connection():
    print("\n[2] service role 연결 테스트")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not key:
        info("SUPABASE_SERVICE_ROLE_KEY 없음 — 건너뜀")
        return True
    try:
        sb = create_client(SUPABASE_URL, key)
        result = sb.table("user_profiles").select("username, role").execute()
        ok(f"관리자 조회 성공 ({len(result.data)}명)")
        for u in result.data[:3]:
            info(f"  {u.get('username')} [{u.get('role')}]")
        return True
    except Exception as e:
        fail(f"관리자 연결 실패: {e}")
        sentry_sdk.capture_exception(e)
        return False


def test_tables_exist():
    print("\n[3] 테이블 존재 확인")
    tables = ["user_profiles", "access_logs", "qa_posts"]
    sb = create_client(SUPABASE_URL, SUPABASE_KEY)
    all_ok = True
    for t in tables:
        try:
            sb.table(t).select("*").limit(0).execute()
            ok(t)
        except Exception as e:
            fail(f"{t}: {e}")
            all_ok = False
    return all_ok


def main():
    print("=== Supabase 연결 테스트 ===")
    results = [
        test_anon_connection(),
        test_admin_connection(),
        test_tables_exist(),
    ]
    passed = sum(results)
    print(f"\n결과: {passed}/{len(results)} 통과")
    if passed < len(results):
        raise SystemExit(1)


if __name__ == "__main__":
    main()
