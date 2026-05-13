/**
 * STAR TEAM Supabase Migration Script
 *
 * 필요한 환경 변수:
 *   SUPABASE_SERVICE_ROLE_KEY  — Supabase Dashboard → Settings → API → service_role key
 *
 * 실행:
 *   npm install @supabase/supabase-js
 *   SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/migrate.mjs
 *
 * 주의: service_role key는 RLS를 우회합니다. 절대 브라우저/클라이언트에 노출하지 마세요.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, dirname, extname, basename, relative } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const SUPABASE_URL = 'https://xkkbgjvywtbwyaoyvwmq.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_KEY) {
  console.error('[migrate] SUPABASE_SERVICE_ROLE_KEY 환경 변수가 필요합니다.');
  console.error('  SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/migrate.mjs');
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// ─── CSV Parser ───────────────────────────────────────────────────────────────
function parseCsv(text) {
  text = String(text || '').replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const rows = []; let row = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i], nx = text[i + 1];
    if (q) {
      if (ch === '"' && nx === '"') { cell += '"'; i++; }
      else if (ch === '"') q = false;
      else cell += ch;
    } else {
      if (ch === '"') q = true;
      else if (ch === ',') { row.push(cell); cell = ''; }
      else if (ch === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
      else cell += ch;
    }
  }
  if (cell.length || row.length) { row.push(cell); rows.push(row); }
  if (!rows.length) return [];
  const head = rows.shift().map(h => h.trim());
  return rows
    .filter(r => r.some(v => String(v || '').trim()))
    .map(r => Object.fromEntries(head.map((h, i) => [h, (r[i] || '').trim()])));
}

function readCsv(filename) {
  const p = join(ROOT, 'public', 'data', filename);
  return parseCsv(readFileSync(p, 'utf8'));
}

// ─── Upsert helper ────────────────────────────────────────────────────────────
async function upsert(table, rows, onConflict) {
  if (!rows.length) { console.log(`  [${table}] 삽입할 데이터 없음`); return; }
  const { error } = await sb.from(table).upsert(rows, { onConflict });
  if (error) console.error(`  [${table}] 오류:`, error.message);
  else console.log(`  [${table}] ${rows.length}개 upsert 완료`);
}

// ─── Storage upload ───────────────────────────────────────────────────────────
async function uploadFile(bucket, storagePath, localPath) {
  try {
    const content = readFileSync(localPath);
    const mime = localPath.endsWith('.pdf') ? 'application/pdf'
      : localPath.endsWith('.md') ? 'text/plain'
      : localPath.endsWith('.png') ? 'image/png'
      : localPath.endsWith('.jpg') || localPath.endsWith('.JPG') || localPath.endsWith('.jpeg') ? 'image/jpeg'
      : 'application/octet-stream';
    const { error } = await sb.storage.from(bucket).upload(storagePath, content, {
      contentType: mime, upsert: true
    });
    if (error) console.warn(`    [storage/${bucket}] ${storagePath}: ${error.message}`);
    else console.log(`    [storage/${bucket}] ✓ ${storagePath}`);
  } catch (e) {
    console.warn(`    [storage/${bucket}] ${storagePath} 읽기 실패: ${e.message}`);
  }
}

function walkDir(dir, base = dir) {
  const result = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) result.push(...walkDir(full, base));
    else result.push({ full, rel: relative(base, full).replace(/\\/g, '/') });
  }
  return result;
}

// ─── 1. Users ─────────────────────────────────────────────────────────────────
async function migrateUsers() {
  console.log('\n[1/9] 사용자 마이그레이션...');
  const USERS = [
    { username:'admin',    full_name:'관리자',      email:'admin@keti.re.kr',    password:'admin',    role:'admin',  sites:['incheon','suwon','yeongwol'] },
    { username:'itp_user', full_name:'ITP 사용자',  email:'itp@itp.or.kr',       password:'1234',     role:'user',   sites:['incheon'] },
    { username:'star_sw',  full_name:'STAR팀 SW',   email:'star@keti.re.kr',     password:'star1234', role:'staff',  sites:['incheon','suwon','yeongwol'] },
    { username:'viewer',   full_name:'뷰어 계정',    email:'viewer@keti.re.kr',   password:'view',     role:'user',   sites:['incheon'] },
    { username:'gangnam',  full_name:'강남 계정',    email:'gangnam@keti.re.kr',  password:'1234',     role:'user',   sites:['suwon'] },
    { username:'yeongwol', full_name:'영월 계정',    email:'yeongwol@keti.re.kr', password:'1234',     role:'user',   sites:['yeongwol'] },
  ];

  for (const u of USERS) {
    // Create auth user
    const { data: authData, error: authErr } = await sb.auth.admin.createUser({
      email: u.email, password: u.password,
      email_confirm: true,
      user_metadata: { username: u.username, full_name: u.full_name }
    });
    if (authErr) {
      if (authErr.message.includes('already been registered')) {
        console.log(`  [users] ${u.username} (${u.email}) 이미 존재 — profile만 upsert`);
        // Try to get existing user by email
        const { data: list } = await sb.auth.admin.listUsers();
        const existing = list?.users?.find(x => x.email === u.email);
        if (existing) {
          await sb.from('user_profiles').upsert({
            id: existing.id, username: u.username, full_name: u.full_name,
            email: u.email, role: u.role, sites: u.sites, status: 'active'
          }, { onConflict: 'id' });
        }
        continue;
      }
      console.error(`  [users] ${u.username} 생성 실패:`, authErr.message);
      continue;
    }
    // Insert profile
    const { error: profErr } = await sb.from('user_profiles').upsert({
      id: authData.user.id, username: u.username, full_name: u.full_name,
      email: u.email, role: u.role, sites: u.sites, status: 'active'
    }, { onConflict: 'id' });
    if (profErr) console.error(`  [users] ${u.username} profile 오류:`, profErr.message);
    else console.log(`  [users] ✓ ${u.username} (${u.role})`);
  }
}

// ─── 2. Contacts ──────────────────────────────────────────────────────────────
async function migrateContacts() {
  console.log('\n[2/9] 담당자 마이그레이션...');
  const rows = readCsv('contacts.csv');
  const data = rows.map((r, i) => ({
    id: r.id || `contact-${i}`,
    group_name: r.group,
    site_key: r.site_key || 'all',
    site_label: r.site_label || '',
    organization: r.organization || '',
    full_name: r.name,
    position: r.position || '',
    role_tags: r.roles || '',
    email: r.email || '',
    mobile: r.mobile || '',
    office_phone: r.office_phone || '',
    photo_url: r.photo || null,
    is_senior: (r.position || '').includes('총괄'),
    sort_order: i
  }));
  await upsert('contacts', data, 'id');
}

// ─── 3. Partner Companies ─────────────────────────────────────────────────────
async function migratePartnerCompanies() {
  console.log('\n[3/9] 협력업체 마이그레이션...');
  const rows = readCsv('partner_companies.csv');
  const data = rows.map(r => ({
    company_key: r.key,
    label_ko: r.label,
    label_en: r.labelEn || '',
    address: r.address || '주소 확인 필요',
    website: r.website || '#',
    color_code: '#8e8e93',
    description: r.desc || '',
    systems: r.systems || ''
  }));
  await upsert('partner_companies', data, 'company_key');
}

// ─── 4. Partner Contacts ──────────────────────────────────────────────────────
async function migratePartnerContacts() {
  console.log('\n[4/9] 협력업체 담당자 마이그레이션...');
  const rows = readCsv('partners.csv');
  // Extract color from partners.csv and update partner_companies
  const colorMap = {};
  rows.forEach(r => { if (r.company_key && r.color && !colorMap[r.company_key]) colorMap[r.company_key] = r.color; });
  for (const [key, color] of Object.entries(colorMap)) {
    await sb.from('partner_companies').update({ color_code: color }).eq('company_key', key);
  }
  const data = rows
    .filter(r => r.name && r.company_key)
    .map((r, i) => ({
      company_key: r.company_key,
      full_name: r.name,
      position: r.position || '',
      department: r.department || '',
      role_tags: r.role_tags || '',
      email: r.email || '',
      mobile: r.mobile || '',
      landline: r.landline || '',
      fax: r.fax || '',
      sort_order: i
    }));
  await upsert('partner_contacts', data, 'id');
}

// ─── 5. Q&A Posts ─────────────────────────────────────────────────────────────
async function migrateQaPosts() {
  console.log('\n[5/9] Q&A 마이그레이션...');
  const rows = readCsv('qa.csv');
  const data = rows.map(r => ({
    id: parseInt(r.id, 10),
    title: r.title,
    author: r.author || '',
    date_posted: r.date || new Date().toISOString().slice(0, 10),
    status: r.status || 'wait',
    view_count: parseInt(r.views, 10) || 0,
    is_secret: r.secret === 'TRUE' || r.secret === 'true',
    robot_type: r.robot || '',
    site_label: r.site || '전체',
    question_type: r.type || '기타',
    body: r.body || '',
    answer: r.answer || null,
    owner_username: r.ownerId || ''
  }));
  await upsert('qa_posts', data, 'id');
}

// ─── 6. FAQ ───────────────────────────────────────────────────────────────────
async function migrateFaq() {
  console.log('\n[6/9] FAQ 마이그레이션...');
  const rows = readCsv('faq.csv');
  const data = rows.map((r, i) => ({
    category: r.cat,
    question: r.q,
    answer: r.a,
    sort_order: i
  }));
  await upsert('faq', data, 'id');
}

// ─── 7. Glossary ──────────────────────────────────────────────────────────────
async function migrateGlossary() {
  console.log('\n[7/9] 용어사전 마이그레이션...');
  const rows = readCsv('glossary.csv');
  const data = rows.map((r, i) => ({
    term: r.term,
    term_en: r.en || '',
    category: r.cat,
    definition: r.def || '',
    related_terms: r.related || '',
    sort_order: i
  }));
  await upsert('glossary', data, 'id');
}

// ─── 8. Changelog ─────────────────────────────────────────────────────────────
async function migrateChangelog() {
  console.log('\n[8/9] 변경 이력 마이그레이션...');
  const rows = readCsv('changelog.csv');
  const data = rows.map((r, i) => ({
    version: r.version,
    release_date: r.date || '',
    change_type: r.type || '',
    description: r.text || '',
    sort_order: i
  }));
  await upsert('changelog', data, 'id');
}

// ─── 9. Vendor Docs ───────────────────────────────────────────────────────────
async function migrateVendorDocs() {
  console.log('\n[9/9] 벤더 문서 마이그레이션...');
  const rows = readCsv('vendor_docs.csv');
  // Map document names to actual PDF files
  const pdfDir = join(ROOT, 'public', 'docs', 'vendor_docs');
  const pdfFiles = walkDir(pdfDir);

  // Build fuzzy match: normalize name for comparison
  const normalize = s => s.toLowerCase().replace(/[\s_\-\.]/g, '');

  const data = rows.map((r, i) => {
    // Try to find matching PDF file
    const docNorm = normalize(r.name);
    const match = pdfFiles.find(f => {
      const fileNorm = normalize(basename(f.rel, extname(f.rel)));
      return fileNorm.includes(docNorm.slice(0, 10)) || docNorm.includes(fileNorm.slice(0, 10));
    });
    return {
      vendor_group: r.vendorGroup,
      robot_name: r.robot || '',
      document_name: r.name,
      storage_path: match ? match.rel : null,
      document_type: r.type || 'manual',
      doc_date: r.date || '—'
    };
  });
  await upsert('vendor_docs', data, 'id');
}

// ─── Storage: Manuals (.md) ───────────────────────────────────────────────────
async function uploadManuals() {
  console.log('\n[Storage] 매뉴얼 .md 업로드...');
  const manualsDir = join(ROOT, 'public', 'docs', 'manuals');
  const files = walkDir(manualsDir);
  for (const { full, rel } of files) {
    if (extname(full) === '.md') await uploadFile('manuals', rel, full);
  }
}

// ─── Storage: Vendor PDFs ─────────────────────────────────────────────────────
async function uploadVendorDocs() {
  console.log('\n[Storage] 벤더 PDF 업로드...');
  const vendorDir = join(ROOT, 'public', 'docs', 'vendor_docs');
  const files = walkDir(vendorDir);
  for (const { full, rel } of files) {
    if (extname(full).toLowerCase() === '.pdf') await uploadFile('vendor-docs', rel, full);
  }
}

// ─── Storage: Images ─────────────────────────────────────────────────────────
async function uploadImages() {
  console.log('\n[Storage] 이미지 업로드...');
  const imgDir = join(ROOT, 'src', 'assets', 'images');
  const files = walkDir(imgDir);
  for (const { full, rel } of files) {
    const ext = extname(full).toLowerCase();
    if (['.png', '.jpg', '.jpeg'].includes(ext)) await uploadFile('images', rel, full);
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('=== STAR TEAM Supabase 마이그레이션 시작 ===');
  console.log('URL:', SUPABASE_URL);

  const args = process.argv.slice(2);
  const runAll = args.length === 0;
  const run = name => runAll || args.includes(name);

  if (run('users'))       await migrateUsers();
  if (run('contacts'))    await migrateContacts();
  if (run('companies'))   await migratePartnerCompanies();
  if (run('partners'))    await migratePartnerContacts();
  if (run('qa'))          await migrateQaPosts();
  if (run('faq'))         await migrateFaq();
  if (run('glossary'))    await migrateGlossary();
  if (run('changelog'))   await migrateChangelog();
  if (run('vendor_docs')) await migrateVendorDocs();
  if (run('manuals'))     await uploadManuals();
  if (run('vendor_files')) await uploadVendorDocs();
  if (run('images'))      await uploadImages();

  console.log('\n=== 완료 ===');
}

main().catch(e => { console.error(e); process.exit(1); });
