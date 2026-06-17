const https  = require('https');
const crypto = require('crypto');

// ── Google Sheets via REST (no googleapis package needed) ──────────────────

function base64url(buf) {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

async function getAccessToken() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key   = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');

  const now = Math.floor(Date.now() / 1000);
  const header  = base64url(Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })));
  const payload = base64url(Buffer.from(JSON.stringify({
    iss: email,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  })));

  const sign = crypto.createSign('RSA-SHA256');
  sign.update(`${header}.${payload}`);
  const sig = base64url(sign.sign(key));
  const jwt = `${header}.${payload}.${sig}`;

  return new Promise((resolve, reject) => {
    const body = `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`;
    const req  = https.request({
      hostname: 'oauth2.googleapis.com',
      path:     '/token',
      method:   'POST',
      headers:  { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': body.length },
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data).access_token); }
        catch (e) { reject(e); }
      });
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
      hostname: 'sheets.googleapis.com',
      path,
      method:  'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── Handler ────────────────────────────────────────────────────────────────

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'POST')   return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  const sheetId = process.env.GOOGLE_SHEETS_ID;
  if (!sheetId || !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
    return { statusCode: 200, headers, body: JSON.stringify({ success: true, note: 'env not configured' }) };
  }

  try {
    const data  = JSON.parse(event.body || '{}');
    const today = new Date().toISOString().split('T')[0];

    const notes = [
      `Build: ${data.buildPackage || ''}`,
      `Care: ${data.carePlan || ''}`,
      data.city    ? `City: ${data.city}`      : '',
      data.path    ? `Path: ${data.path}`      : '',
      data.website ? `Site: ${data.website}`   : '',
      data.notes   ? `Notes: ${data.notes}`    : '',
    ].filter(Boolean).join(' | ');

    const token = await getAccessToken();
    await sheetsAppend(token, sheetId, 'Leads!A:G', [[
      data.business || '',
      data.name     || '',
      data.email    || '',
      data.phone    || '',
      'New',
      today,
      notes,
    ]]);

    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
  } catch (err) {
    console.error('submit-lead error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
