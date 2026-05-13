"""
E2E 브라우저 테스트 — Python Playwright + pytest
scripts/test_browser.mjs 의 Python 대체 구현

실행:
  pytest scripts/test_e2e.py -v
  pytest scripts/test_e2e.py -v --base-url https://tag-manual.vercel.app
  pytest scripts/test_e2e.py -v -k "login"    # 특정 테스트만
"""

import re
import pytest
from playwright.sync_api import Page, expect


# ────────────────────────────────────────────────────────────────
# 1. 페이지 로드 & 기본 구조
# ────────────────────────────────────────────────────────────────

def test_page_loads(page: Page, base_url: str):
    """앱 URL 접속 시 200 응답 및 타이틀 확인."""
    response = page.goto(base_url)
    assert response.status == 200
    expect(page).to_have_title(re.compile(r"STAR TEAM|Robot Operations Manual", re.I))


def test_login_form_visible(page: Page, base_url: str):
    """로그인 폼 요소가 모두 표시되는지 확인."""
    page.goto(base_url)
    expect(page.locator("#lid")).to_be_visible()
    expect(page.locator("#lpw")).to_be_visible()
    expect(page.locator(".login-btn")).to_be_visible()


def test_no_js_errors_on_load(page: Page, base_url: str):
    """페이지 로드 시 콘솔 에러 없음."""
    errors = []
    page.on("console", lambda msg: errors.append(msg.text) if msg.type == "error" else None)
    page.goto(base_url)
    page.wait_for_load_state("networkidle")
    # Sentry/CDN 관련 외부 리소스 에러는 제외
    critical = [e for e in errors if not any(skip in e for skip in ["sentry", "cdn", "favicon"])]
    assert critical == [], f"콘솔 에러 발생: {critical}"


# ────────────────────────────────────────────────────────────────
# 2. 로그인
# ────────────────────────────────────────────────────────────────

@pytest.mark.parametrize("user,pw,expect_success", [
    ("admin",    "admin", True),
    ("itp_user", "1234",  True),
    ("viewer",   "view",  True),
    ("wrong",    "wrong", False),
    ("",         "",      False),
])
def test_login(page: Page, base_url: str, user: str, pw: str, expect_success: bool):
    """다양한 자격증명으로 로그인 시도."""
    page.goto(base_url)
    page.fill("#lid", user)
    page.fill("#lpw", pw)
    page.click(".login-btn")

    if expect_success:
        # 대시보드 진입 확인 (로그인 오버레이 사라짐)
        page.wait_for_selector("#login-overlay", state="hidden", timeout=10_000)
    else:
        # 에러 메시지 또는 폼 유지 확인
        page.wait_for_timeout(1_000)
        assert page.locator("#login-overlay").is_visible(), "실패한 로그인인데 로그인 화면이 사라짐"


# ────────────────────────────────────────────────────────────────
# 3. 로그인 후 핵심 기능
# ────────────────────────────────────────────────────────────────

def test_robot_cards_visible(logged_in_page: Page):
    """로봇 카드가 DOM에 1개 이상 존재하는지 확인."""
    cards = logged_in_page.locator(".rcard")
    count = cards.count()
    assert count > 0, "로봇 카드 0개 — DOM에 없음"


def test_robot_images_load(logged_in_page: Page):
    """로봇 이미지가 깨지지 않고 로드되는지 확인 (BTC-006 회귀)."""
    images = logged_in_page.locator(".rcard img, .rcard-img")
    count = images.count()
    broken = []
    for i in range(min(count, 10)):   # 최대 10개 샘플
        img = images.nth(i)
        natural_width = img.evaluate("el => el.naturalWidth")
        if natural_width == 0:
            src = img.get_attribute("src") or "(no src)"
            broken.append(src)
    assert broken == [], f"깨진 이미지: {broken}"


def test_dark_mode_toggle(logged_in_page: Page):
    """다크 모드 토글이 동작하는지 확인."""
    page = logged_in_page
    # 토글 버튼 찾기
    toggle = page.locator("[id*='dark'], [class*='dark-toggle'], [aria-label*='dark'], [title*='dark']").first
    if not toggle.is_visible():
        pytest.skip("다크 모드 토글 버튼을 찾을 수 없음")

    body_before = page.evaluate("document.body.className")
    toggle.click()
    page.wait_for_timeout(300)
    body_after = page.evaluate("document.body.className")
    assert body_before != body_after, "토글 후 body 클래스 변화 없음"


def test_logout(logged_in_page: Page):
    """로그아웃 함수 호출 후 로그인 폼 복귀 확인."""
    page = logged_in_page
    page.evaluate("doLogout()")
    page.wait_for_timeout(500)
    # 로그인 입력 필드가 다시 입력 가능하면 로그아웃 성공
    expect(page.locator("#lid")).to_be_editable(timeout=5_000)


# ────────────────────────────────────────────────────────────────
# 4. 이미지 접근성 (Vercel outputDirectory 검증)
# ────────────────────────────────────────────────────────────────

def test_static_image_accessible(page: Page, base_url: str):
    """로봇 이미지 파일이 HTTP 200으로 직접 접근 가능한지 확인 (BTC-006)."""
    img_url = f"{base_url}/src/assets/images/logos/logo_keti.jpg"
    response = page.request.get(img_url)
    assert response.status == 200, f"{img_url} → {response.status} (이미지 경로 접근 실패)"


def test_manual_markdown_accessible(page: Page, base_url: str):
    """매뉴얼 마크다운 파일이 HTTP 200으로 접근 가능한지 확인."""
    md_url = f"{base_url}/docs/manuals/spot/user_manual.md"
    response = page.request.get(md_url)
    assert response.status == 200, f"{md_url} → {response.status}"
