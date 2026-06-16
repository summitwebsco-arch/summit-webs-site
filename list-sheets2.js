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
  meta.data.sheets.forEach(s => console.log(s.properties.title, '| index:', s.properties.index, '| sheetId:', s.properties.sheetId, '| rows:', s.properties.gridProperties.rowCount, '| cols:', s.properties.gridProperties.columnCount));
}

main().catch(e => console.error(e.message));
