const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  keyFile: './credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const SHEET_ID = '1QAiTe-C6OU9-IQloQchp-8EKEiW8vNcWzt34Ikx93bs';

async function main() {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const tabs = ['Backtesting', 'Forward Testing', 'Live Account'];
  for (const tab of tabs) {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${tab}!A1:Z20`,
    });
    console.log(`\n=== ${tab} ===`);
    (res.data.values || []).forEach((row, i) => console.log(`Row ${i+1}:`, JSON.stringify(row)));
  }
}

main().catch(e => console.error(e.message));
