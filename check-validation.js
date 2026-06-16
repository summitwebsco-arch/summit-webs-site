const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  keyFile: './credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const SHEET_ID = '1QAiTe-C6OU9-IQloQchp-8EKEiW8vNcWzt34Ikx93bs';

async function main() {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const meta = await sheets.spreadsheets.get({
    spreadsheetId: SHEET_ID,
    includeGridData: true,
    ranges: ['Backtesting!A1:N2', 'Forward Testing!A1:N2', 'Live Account!A1:N2'],
  });

  for (const sheet of meta.data.sheets) {
    console.log(`\n=== ${sheet.properties.title} ===`);
    const rows = sheet.data?.[0]?.rowData || [];
    rows.forEach((row, ri) => {
      (row.values || []).forEach((cell, ci) => {
        if (cell.dataValidation) {
          console.log(`  Col ${ci} (${String.fromCharCode(65+ci)}): ${JSON.stringify(cell.dataValidation)}`);
        }
      });
    });
  }
}

main().catch(e => console.error(e.message));
