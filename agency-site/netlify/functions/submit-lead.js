const https  = require('https');
const crypto = require('crypto');

// ── Google Sheets helpers ──────────────────────────────────────────────────

function base64url(buf) {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

async function getSheetsToken() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key   = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
  const now   = Math.floor(Date.now() / 1000);

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

// ── Gmail helpers ──────────────────────────────────────────────────────────

async function getGmailToken() {
  const body = [
    `client_id=${encodeURIComponent(process.env.GMAIL_CLIENT_ID || '')}`,
    `client_secret=${encodeURIComponent(process.env.GMAIL_CLIENT_SECRET || '')}`,
    `refresh_token=${encodeURIComponent(process.env.GMAIL_REFRESH_TOKEN || '')}`,
    `grant_type=refresh_token`,
  ].join('&');

  return new Promise((resolve, reject) => {
    const req = https.request({
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

function sendEmail(token, to, subject, text) {
  const raw = [
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=utf-8',
    '',
    text,
  ].join('\r\n');

  const encoded = Buffer.from(raw).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  const body    = JSON.stringify({ raw: encoded });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'gmail.googleapis.com',
      path:     '/gmail/v1/users/me/messages/send',
      method:   'POST',
      headers:  { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
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
      data.city    ? `City: ${data.city}`    : '',
      data.website ? `Site: ${data.website}` : '',
      data.notes   ? `Notes: ${data.notes}`  : '',
    ].filter(Boolean).join(' | ');

    // 1. Add to Google Sheets
    const sheetsToken = await getSheetsToken();
    await sheetsAppend(sheetsToken, sheetId, 'Leads!A:G', [[
      data.business || '',
      data.name     || '',
      data.email    || '',
      data.phone    || '',
      'New',
      today,
      notes,
    ]]);

    // 2. Email notification to owner (silently skip if Gmail not configured)
    if (process.env.GMAIL_CLIENT_ID && process.env.GMAIL_CLIENT_SECRET && process.env.GMAIL_REFRESH_TOKEN) {
      try {
        const gmailToken = await getGmailToken();
        const subject    = `New lead — ${data.business || 'Unknown'} (${data.buildPackage || 'Unknown plan'})`;
        const body       = [
          `New lead from your website:`,
          ``,
          `Business:   ${data.business || '—'}`,
          `Name:       ${data.name     || '—'}`,
          `Email:      ${data.email    || '—'}`,
          `Phone:      ${data.phone    || '—'}`,
          `City:       ${data.city     || '—'}`,
          ``,
          `Build:      ${data.buildPackage || '—'}`,
          `Care plan:  ${data.carePlan     || '—'}`,
          data.website ? `Website:    ${data.website}` : '',
          data.notes   ? `Notes:      ${data.notes}`   : '',
        ].filter(l => l !== undefined).join('\n');

        await sendEmail(gmailToken, 'summitwebsco@gmail.com', subject, body);
      } catch (emailErr) {
        console.error('Email notification failed:', emailErr);
      }
    }

    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
  } catch (err) {
    console.error('submit-lead error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
