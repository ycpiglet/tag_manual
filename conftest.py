"""
pytest 공통 설정 — STAR TEAM Robot Manual

제공 픽스처:
  - supabase_client  : Supabase Python 클라이언트 (anon key)
  - sb_admin         : Supabase 관리자 클라이언트 (service role key)
  - base_url         : 테스트 대상 URL (.env BASE_URL 또는 --base-url 옵션)

Sentry:
  SENTRY_DSN 환경변수가 있으면 테스트 실행 중 발생하는 예외를 Sentry로 전송합니다.
"""

import os
import pytest
import sentry_sdk
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

# ── Sentry 초기화 ───────────────────────────────────────────────
_sentry_dsn = os.getenv("SENTRY_DSN")
if _sentry_dsn:
    sentry_sdk.init(
        dsn=_sentry_dsn,
        environment=os.getenv("SENTRY_ENVIRONMENT", "test"),
        traces_sample_rate=0.0,   # 성능 트레이싱 비활성 (테스트 환경)
    )


# ── Playwright 기본 URL ─────────────────────────────────────────
# pytest-playwright 이 --base-url 옵션을 이미 제공함.
# pytest.ini 또는 --base-url CLI 옵션으로 지정.
# .env의 BASE_URL은 pytest.ini addopts 에서 참조하거나 CLI로 전달.


# ── Supabase 클라이언트 ─────────────────────────────────────────
@pytest.fixture(scope="session")
def supabase_client() -> Client:
    """Anon key 클라이언트 — 일반 읽기/쓰기 (RLS 적용)."""
    url = os.environ["SUPABASE_URL"]
    key = os.environ["SUPABASE_KEY"]
    return create_client(url, key)


@pytest.fixture(scope="session")
def sb_admin() -> Client:
    """Service role 클라이언트 — RLS 우회, 마이그레이션/검증 전용."""
    url = os.environ["SUPABASE_URL"]
    key = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
    return create_client(url, key)


# ── Playwright: 로그인된 페이지 ────────────────────────────────
@pytest.fixture
def logged_in_page(page, base_url):
    """admin 계정으로 로그인된 Playwright page 픽스처."""
    page.goto(base_url)
    page.wait_for_selector("#lid", timeout=10_000)
    page.fill("#lid", "admin")
    page.fill("#lpw", "admin")
    page.click(".login-btn")
    # 로그인 오버레이가 사라지면 로그인 성공
    page.wait_for_selector("#login-overlay", state="hidden", timeout=20_000)
    page.wait_for_load_state("networkidle", timeout=20_000)
    return page
