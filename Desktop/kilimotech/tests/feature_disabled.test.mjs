/* Minimal test to assert disabled features return feature_disabled */
const BASE = process.env.BASE_URL || 'http://localhost:3000';

async function postJson(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body || {})
  });
  let json = null;
  try { json = await res.json(); } catch {}
  return { status: res.status, json };
}

(async () => {
  const checks = [];
  checks.push(['chat', await postJson('/api/chat', { farmerId: '00000000-0000-0000-0000-000000000000', message: 'Hi' })]);
  checks.push(['diagnosis', await postJson('/api/disease-diagnosis', { imageUrl: 'http://example.com/x.jpg' })]);
  checks.push(['plant-diagnosis', await postJson('/api/gemini/plant-diagnosis', { imageBase64: 'AA==', imageMimeType: 'image/jpeg' })]);

  let failed = 0;
  for (const [name, res] of checks) {
    const ok = res.status === 410 && res.json && res.json.feature_disabled === true;
    if (!ok) {
      console.error(`[FAIL] ${name}:`, res.status, res.json);
      failed++;
    } else {
      console.log(`[OK] ${name} disabled`);
    }
  }
  process.exit(failed === 0 ? 0 : 1);
})();
