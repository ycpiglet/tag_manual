import pg from 'pg';
import dns from 'dns';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(join(__dirname, '../supabase/schema.sql'), 'utf8');

const DB_URL = process.env.DB_URL;
if (!DB_URL) { console.error('DB_URL 환경 변수 필요'); process.exit(1); }

// IPv4 강제 resolve
const url = new URL(DB_URL);
const host = await new Promise((res, rej) =>
  dns.lookup(url.hostname, { family: 4 }, (err, addr) => err ? rej(err) : res(addr))
);

const client = new pg.Client({
  host, port: parseInt(url.port) || 5432,
  user: url.username, password: decodeURIComponent(url.password),
  database: url.pathname.slice(1),
  ssl: { rejectUnauthorized: false }
});

async function main() {
  console.log('=== Supabase 스키마 적용 중... ===');
  await client.connect();
  // 주석과 빈 줄 제거 후 세미콜론 기준으로 구문 분리
  const statements = sql
    .replace(/--.*$/gm, '')
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 5);

  let ok = 0, skip = 0;
  for (const stmt of statements) {
    try {
      await client.query(stmt);
      ok++;
    } catch (e) {
      if (e.message.includes('already exists') || e.message.includes('duplicate')) {
        skip++;
      } else {
        console.warn('  경고:', e.message.slice(0, 100));
      }
    }
  }
  console.log(`완료: ${ok}개 성공, ${skip}개 이미 존재 (skip)`);
  await client.end();
}

main().catch(e => { console.error(e); process.exit(1); });
