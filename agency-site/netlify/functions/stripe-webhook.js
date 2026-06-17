const https  = require('https');
const crypto = require('crypto');

// ── Stripe signature verification (no stripe package needed) ───────────────

function verifyStripeSignature(payload, header, secret) {
  const parts     = header.split(',').reduce((acc, p) => { const [k, v] = p.split('='); acc[k] = v; return acc; }, {});
  const timestamp = parts['t'];
  const sig       = parts['v1'];
  const signed    = `${timestamp}.${payload}`;
  const expected  = crypto.createHmac('sha256', secret).update(signed).digest('hex');
  return expected === sig;
}

// ── Google Sheets helpers (same as submit-lead, no googleapis) ─────────────

function base64url(buf) {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

async function getAccessToken() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key   = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
  const now   = Math.floor(Date.now() / 1000);

  const header  = base64url(Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })));
  const payload = base64url(Buffer.from(JSON.stringify({
    iss: email, scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token', exp: now + 3600, iat: now,
  })));

  const sign = crypto.createSign('RSA-SHA256');
  sign.update(`${header}.${payload}`);
  const jwt = `${header}.${payload}.${base64url(sign.sign(key))}`;

  return new Promise((resolve, reject) => {
    const body = `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`;
    const req  = https.request({
      hostname: 'oauth2.googleapis.com', path: '/token', method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': body.length },
    }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d).access_token); } catch(e) { reject(e); } });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function sheetsGet(token, sheetId, range) {
  return new Promise((resolve, reject) => {
    const path = `/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(range)}`;
    const req  = https.request({
      hostname: 'sheets.googleapis.com', path, method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch(e) { reject(e); } });
    });
    req.on('error', reject);
    req.end();
  });
}

function sheetsUpdate(token, sheetId, range, values) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ values });
    const path = `/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`;
    const req  = https.request({
      hostname: 'sheets.googleapis.com', path, method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(d));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function sheetsAppend(token, sheetId, range, values) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ values });
    const path = `/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`;
    const req  = https.request({
      hostname: 'sheets.googleapis.com', path, method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(d));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── Handler ────────────────────────────────────────────────────────────────

exports.handler = async (event) => {
  const sig    = event.headers['stripe-signature'];
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret || !sig || !verifyStripeSignature(event.body, sig, secret)) {
    return { statusCode: 400, body: 'Webhook signature invalid' };
  }

  let stripeEvent;
  try { stripeEvent = JSON.parse(event.body); }
  catch { return { statusCode: 400, body: 'Invalid JSON' }; }

  if (stripeEvent.type !== 'checkout.session.completed') {
    return { statusCode: 200, body: JSON.stringify({ received: true }) };
  }

  const session = stripeEvent.data.object;
  const email   = (session.customer_details?.email || session.customer_email || '').toLowerCase();
  const ref     = session.client_reference_id || '';
  const [carePlan, carePrice, buildPlan] = decodeURIComponent(ref).split('|');

  const sheetId = process.env.GOOGLE_SHEETS_ID;
  if (!sheetId || !email) return { statusCode: 200, body: JSON.stringify({ received: true }) };

  try {
    const token   = await getAccessToken();
    const today   = new Date().toISOString().split('T')[0];
    const result  = await sheetsGet(token, sheetId, 'Leads!A:G');
    const rows    = result.values || [];

    let leadRowIndex = -1;
    let leadData     = null;

    for (let i = 1; i < rows.length; i++) {
      if ((rows[i][2] || '').toLowerCase() === email) {
        leadRowIndex = i + 1;
        leadData     = rows[i];
        break;
      }
    }

    if (leadRowIndex > 0) {
      await sheetsUpdate(token, sheetId, `Leads!E${leadRowIndex}:F${leadRowIndex}`, [['Won', today]]);
    }

    const businessName = leadData?.[0] || session.customer_details?.name || email;
    const contactName  = leadData?.[1] || session.customer_details?.name || '';

    await sheetsAppend(token, sheetId, 'Clients!A:E', [[
      businessName,
      contactName,
      carePlan  || 'Essential',
      carePrice || '50',
      'Active',
    ]]);

    console.log(`New client: ${businessName} — ${buildPlan} + ${carePlan}`);
  } catch (err) {
    console.error('Sheets update error:', err);
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) };
};
