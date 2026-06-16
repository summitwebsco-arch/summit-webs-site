const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  keyFile: './credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const SHEET_ID = '197qkXcwXKHJ0jvAHTYa7LIEJxOedGKl7XwQfboDjzoc';

async function main() {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  console.log('Title:', meta.data.properties.title);
  console.log('Tabs:');
  meta.data.sheets.forEach(s => console.log(' -', s.properties.title, '| sheetId:', s.properties.sheetId));

  for (const sheet of meta.data.sheets) {
    const name = sheet.properties.title;
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${name}!A1:Z30`,
    });
    console.log(`\n=== ${name} ===`);
    (res.data.values || []).forEach((r, i) => console.log(`Row ${i+1}:`, JSON.stringify(r)));
  }
}

main().catch(e => console.error(e.message));
