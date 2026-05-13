/**
 * Playwright 브라우저 테스트
 *
 * 사용법:
 *   node scripts/test_browser.mjs
 *   node scripts/test_browser.mjs https://tagmanual.vercel.app  (URL 지정)
 *   node scripts/test_browser.mjs --login admin admin            (로그인 테스트)
 */

import { chromium } from 'playwright';

const URL   = process.argv.find(a => a.startsWith('http')) || 'https://tagmanual.vercel.app';
const loginFlag = process.argv.includes('--login');
const loginUser = loginFlag ? process.argv[process.argv.indexOf('--login') + 1] : 'admin';
const loginPass = loginFlag ? process.argv[process.argv.indexOf('--login') + 2] : 'admin';

const BOLD  = '\x1b[1m';
const RED   = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELL  = '\x1b[33m';
const RESET = '\x1b[0m';

function ok(msg)   { console.log(`${GREEN}✓${RESET} ${msg}`); }
function fail(msg) { console.log(`${RED}✗${RESET} ${BOLD}${msg}${RESET}`); }
function warn(msg) { console.log(`${YELL}!${RESET} ${msg}`); }
function info(msg) { console.log(`  ${msg}`); }

async function run() {
  console.log(`\n${BOLD}=== Playwright 브라우저 테스트 ===${RESET}`);
  console.log(`URL: ${URL}\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // 콘솔 로그 / 에러 수집
  const consoleErrors = [];
  const consoleLogs   = [];
  page.on('console', msg => {
    const text = msg.text();
    if (msg.type() === 'error') consoleErrors.push(text);
    else consoleLogs.push(`[${msg.type()}] ${text}`);
  });
  page.on('pageerror', err => consoleErrors.push(`[PageError] ${err.message}`));

  // ── 1. 페이지 로드 ─────────────────────────────────────
  console.log(`${BOLD}[1] 페이지 로드${RESET}`);
  try {
    const res = await page.goto(URL, { waitUntil: 'networkidle', timeout: 15000 });
    ok(`HTTP ${res.status()}`);
  } catch (e) {
    fail(`페이지 로드 실패: ${e.message}`);
    await browser.close();
    return;
  }

  // ── 2. JS 초기화 에러 확인 ─────────────────────────────
  console.log(`\n${BOLD}[2] JS 초기화 에러${RESET}`);
  if (consoleErrors.length === 0) {
    ok('콘솔 에러 없음');
  } else {
    consoleErrors.forEach(e => fail(e));
  }

  // ── 3. 핵심 요소 존재 확인 ─────────────────────────────
  console.log(`\n${BOLD}[3] 핵심 DOM 요소${RESET}`);
  const checks = [
    ['#login-overlay', '로그인 오버레이'],
    ['#lid',           '아이디 입력창'],
    ['#lpw',           '비밀번호 입력창'],
    ['.login-btn',     '로그인 버튼'],
    ['#lerr',          '에러 메시지 영역'],
  ];
  for (const [sel, label] of checks) {
    const el = await page.$(sel);
    el ? ok(label) : fail(`${label} (${sel}) 없음`);
  }

  // ── 4. doLogin 함수 정의 여부 ──────────────────────────
  console.log(`\n${BOLD}[4] JS 함수 정의 확인${RESET}`);
  const fns = ['doLogin', 'doLogout', 't', 'initApp', 'submitQa'];
  for (const fn of fns) {
    const defined = await page.evaluate(name => typeof window[name] === 'function', fn);
    defined ? ok(`${fn}()`) : fail(`${fn}() 미정의`);
  }

  // ── 5. Supabase 클라이언트 초기화 ─────────────────────
  console.log(`\n${BOLD}[5] Supabase 클라이언트${RESET}`);
  // sb는 const로 선언돼 window에 없지만, supabase 글로벌과 createClient로 확인
  const sbOk = await page.evaluate(() =>
    typeof supabase !== 'undefined' && typeof supabase.createClient === 'function'
  );
  sbOk ? ok('supabase.createClient 사용 가능') : fail('Supabase CDN 로드 실패');

  // ── 6. 로그인 테스트 ───────────────────────────────────
  console.log(`\n${BOLD}[6] 로그인 테스트 (${loginUser} / ${loginPass.replace(/./g,'*')})\n${RESET}`);
  consoleErrors.length = 0; // 리셋

  await page.fill('#lid', loginUser);
  await page.fill('#lpw', loginPass);
  await page.click('.login-btn');

  // 로그인 완료 또는 에러 대기 (최대 15초)
  try {
    await Promise.race([
      page.waitForSelector('#topbar', { state: 'visible', timeout: 15000 }),
      page.waitForFunction(() => {
        const el = document.getElementById('lerr');
        return el && el.style.display !== 'none' &&
               el.textContent.length > 2 && el.textContent !== '로그인 중...';
      }, { timeout: 15000 }),
    ]);
  } catch {}

  const topbarVisible = await page.isVisible('#topbar');
  const loginVisible  = await page.isVisible('#login-overlay');
  const errText       = await page.$eval('#lerr', el => el.textContent).catch(() => '');

  if (topbarVisible && !loginVisible) {
    ok('로그인 성공 — 메인 화면 진입');
    const uname = await page.$eval('#uname', el => el.textContent).catch(() => '');
    info(`표시 이름: ${uname}`);
  } else if (errText && errText.length > 2) {
    fail(`로그인 실패 — 에러 메시지: "${errText}"`);
  } else {
    fail('로그인 결과 불명 (타임아웃)');
  }

  if (consoleErrors.length > 0) {
    warn('로그인 중 콘솔 에러:');
    consoleErrors.forEach(e => info(e));
  }

  // ── 7. 결과 요약 ───────────────────────────────────────
  await browser.close();
  console.log(`\n${BOLD}=== 완료 ===${RESET}\n`);
}

run().catch(e => { console.error('테스트 실행 실패:', e.message); process.exit(1); });
