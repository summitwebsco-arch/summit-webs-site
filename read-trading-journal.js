const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  keyFile: './credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const SHEET_ID = '1QAiTe-C6OU9-IQloQchp-8EKEiW8vNcWzt34Ikx93bs';
const TABS = ['Backtesting', 'Forward Testing', 'Live Account'];
const ROWS_TO_READ = 30;

async function readSheet() {
  try {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    // First, get spreadsheet metadata
    const metaRes = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
    console.log('=== SPREADSHEET METADATA ===');
    console.log('Sheet title:', metaRes.data.properties.title);
    console.log('Available tabs:');
    metaRes.data.sheets.forEach(s => {
      console.log(`  - "${s.properties.title}" (ID: ${s.properties.sheetId})`);
    });
    console.log('\n');

    // Read data from each tab
    for (const tabName of TABS) {
      console.log(`\n${'='.repeat(80)}`);
      console.log(`TAB: "${tabName}"`);
      console.log(`${'='.repeat(80)}\n`);

      // Read values from the tab - read up to row 31 (header + 30 data rows)
      const range = `${tabName}!A1:Z31`;
      const res = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: range,
      });

      const values = res.data.values || [];
      
      if (values.length === 0) {
        console.log('(No data found in this tab)\n');
        continue;
      }

      // Print all available rows
      console.log(`Total rows retrieved: ${values.length}`);
      console.log(`Columns detected: ${Math.max(...values.map(r => r.length))}\n`);
      
      // Print headers
      const headers = values[0] || [];
      console.log('HEADERS:');
      headers.forEach((h, i) => {
        console.log(`  [${i}] "${h}"`);
      });
      console.log('\n');

      // Print data rows
      console.log('DATA ROWS:');
      for (let i = 1; i < values.length; i++) {
        const row = values[i];
        console.log(`\nRow ${i}:`);
        headers.forEach((header, colIdx) => {
          const value = row[colIdx] || '(empty)';
          console.log(`  ${header}: ${value}`);
        });
      }
    }

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

readSheet();
