const { google } = require('googleapis');

function getSheets() {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const sheetId = process.env.GOOGLE_SHEETS_ID;
  if (!sheetId || !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
    console.error('Missing required env vars');
    return { statusCode: 200, headers, body: JSON.stringify({ success: true, note: 'env not configured' }) };
  }

  try {
    const data = JSON.parse(event.body || '{}');
    const today = new Date().toISOString().split('T')[0];

    const notes = [
      `Build: ${data.buildPackage || ''}`,
      `Care: ${data.carePlan || ''}`,
      data.city    ? `City: ${data.city}`       : '',
      data.path    ? `Path: ${data.path}`        : '',
      data.website ? `Website: ${data.website}`  : '',
      data.notes   ? `Notes: ${data.notes}`      : '',
    ].filter(Boolean).join(' | ');

    const sheets = getSheets();
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'Leads!A:G',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          data.business    || '',
          data.name        || '',
          data.email       || '',
          data.phone       || '',
          'New',
          today,
          notes,
        ]],
      },
    });

    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
  } catch (err) {
    console.error('submit-lead error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
