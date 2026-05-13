import { createClient } from '@supabase/supabase-js';

// SUPABASE_SERVICE_ROLE_KEY 환경변수 필요 (절대 하드코딩 금지)
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://xkkbgjvywtbwyaoyvwmq.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SERVICE_ROLE_KEY) { console.error('SUPABASE_SERVICE_ROLE_KEY 환경변수 필요'); process.exit(1); }

const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const buckets = [
  { id: 'manuals',     name: 'manuals',     public: true },
  { id: 'vendor-docs', name: 'vendor-docs', public: true },
  { id: 'images',      name: 'images',      public: true },
];

for (const b of buckets) {
  const { error } = await sb.storage.createBucket(b.id, { public: b.public });
  if (error && error.message.includes('already exists')) {
    console.log(`  [bucket] ${b.id} 이미 존재 — skip`);
  } else if (error) {
    console.error(`  [bucket] ${b.id} 생성 실패:`, error.message);
  } else {
    console.log(`  [bucket] ✓ ${b.id} 생성 완료 (public: ${b.public})`);
  }
}
