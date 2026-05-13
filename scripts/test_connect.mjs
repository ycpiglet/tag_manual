import pg from 'pg';

const PASSWORD = '!@Alslakaqk24#';
const PROJECT = 'xkkbgjvywtbwyaoyvwmq';

const configs = [
  { host: `aws-0-us-east-1.pooler.supabase.com`,      port: 6543, user: `postgres.${PROJECT}` },
  { host: `aws-0-us-west-1.pooler.supabase.com`,      port: 6543, user: `postgres.${PROJECT}` },
  { host: `aws-0-eu-central-1.pooler.supabase.com`,   port: 6543, user: `postgres.${PROJECT}` },
  { host: `aws-0-eu-west-1.pooler.supabase.com`,      port: 6543, user: `postgres.${PROJECT}` },
  { host: `aws-0-ap-southeast-1.pooler.supabase.com`, port: 6543, user: `postgres.${PROJECT}` },
  { host: `aws-0-ap-northeast-1.pooler.supabase.com`, port: 6543, user: `postgres.${PROJECT}` },
  { host: `aws-0-us-east-1.pooler.supabase.com`,      port: 5432, user: `postgres.${PROJECT}` },
];

for (const cfg of configs) {
  const c = new pg.Client({ ...cfg, password: PASSWORD, database: 'postgres', ssl: { rejectUnauthorized: false } });
  try {
    await c.connect();
    const res = await c.query('SELECT 1');
    console.log(`✓ ${cfg.host}:${cfg.port} 연결 성공!`);
    await c.end();
    process.exit(0);
  } catch (e) {
    console.log(`✗ ${cfg.host}:${cfg.port} - ${e.message.slice(0, 80)}`);
    try { await c.end(); } catch {}
  }
}
console.log('모든 연결 실패');
