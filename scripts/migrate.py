"""
Supabase 데이터 마이그레이션 — Python 구현
scripts/migrate.mjs 의 Python 대체 구현

사용법:
  python scripts/migrate.py                    # 전체
  python scripts/migrate.py users             # 사용자만
  python scripts/migrate.py contacts robots   # 여러 테이블

필요 환경변수 (.env):
  SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
"""

import csv
import os
import sys
from pathlib import Path
from dotenv import load_dotenv
import sentry_sdk
from supabase import create_client, Client

load_dotenv()

# ── Sentry 초기화 ───────────────────────────────────────────────
if dsn := os.getenv("SENTRY_DSN"):
    sentry_sdk.init(dsn=dsn, environment="migration")

# ── Supabase 클라이언트 (service role) ──────────────────────────
def get_admin_client() -> Client:
    url = os.environ["SUPABASE_URL"]
    key = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
    return create_client(url, key)


DATA_DIR = Path(__file__).parent.parent / "public" / "data"

# CSV 파일명 → Supabase 테이블명 매핑
TABLE_MAP: dict[str, str] = {
    "robots":           "robots",
    "contacts":         "contacts",
    "partners":         "partners",
    "partner_companies":"partner_companies",
    "sites":            "sites",
    "qa":               "qa_posts",
    "faq":              "faq",
    "glossary":         "glossary",
    "changelog":        "changelog",
    "vendor_docs":      "vendor_docs",
}


def read_csv(name: str) -> list[dict]:
    path = DATA_DIR / f"{name}.csv"
    if not path.exists():
        print(f"  ⚠  {path} 없음 — 건너뜀")
        return []
    with open(path, encoding="utf-8-sig") as f:
        return list(csv.DictReader(f))


def upsert(sb: Client, table: str, rows: list[dict]) -> None:
    if not rows:
        return
    # None으로 변환 (빈 문자열 → null)
    cleaned = [{k: (v if v != "" else None) for k, v in row.items()} for row in rows]
    result = sb.table(table).upsert(cleaned).execute()
    print(f"  ✓  {table}: {len(cleaned)}행 upsert")


def migrate_target(sb: Client, target: str) -> None:
    print(f"\n[{target}]")
    if target == "users":
        print("  ℹ  사용자 마이그레이션은 Supabase Dashboard에서 직접 수행하세요.")
        print("     (auth.users는 service role API로 직접 접근 불가)")
        return
    table = TABLE_MAP.get(target)
    if not table:
        print(f"  ✗  알 수 없는 대상: {target}")
        return
    rows = read_csv(target)
    upsert(sb, table, rows)


def main() -> None:
    targets = sys.argv[1:] or list(TABLE_MAP.keys())
    print(f"마이그레이션 대상: {targets}")

    sb = get_admin_client()
    for t in targets:
        try:
            migrate_target(sb, t)
        except Exception as e:
            sentry_sdk.capture_exception(e)
            print(f"  ✗  {t} 실패: {e}")

    print("\n완료")


if __name__ == "__main__":
    main()
