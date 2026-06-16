const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  keyFile: './credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const SHEET_ID = '1QAiTe-C6OU9-IQloQchp-8EKEiW8vNcWzt34Ikx93bs';

function dropdown(values) {
  return {
    condition: {
      type: 'ONE_OF_LIST',
      values: values.map(v => ({ userEnteredValue: v })),
    },
    strict: true,
    showCustomUi: true,
  };
}

function setValidation(sheetId, colIndex, values, numRows = 200) {
  return {
    setDataValidation: {
      range: {
        sheetId,
        startRowIndex: 1,       // skip header
        endRowIndex: numRows,
        startColumnIndex: colIndex,
        endColumnIndex: colIndex + 1,
      },
      rule: dropdown(values),
    },
  };
}

async function main() {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });

  const requests = [];

  for (const sheet of meta.data.sheets) {
    const name = sheet.properties.title;
    if (!['Backtesting', 'Forward Testing', 'Live Account'].includes(name)) continue;

    const sheetId = sheet.properties.sheetId;
    console.log(`Adding dropdowns to: ${name}`);

    // Col E (index 4) — Trade Side
    requests.push(setValidation(sheetId, 4, ['Buy', 'Sell']));

    // Col K (index 10) — Result
    requests.push(setValidation(sheetId, 10, ['Win', 'Loss', 'Break Even']));

    // Col M (index 12) — Notes / Reason
    requests.push(setValidation(sheetId, 12, [
      'Wrong Timing',
      'Wrong Direction',
      'Overtraded',
      'FOMO',
      'Moved Stop Loss',
      'No Setup',
      'NA',
    ]));
  }

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: { requests },
  });

  console.log('\nDropdowns added to all 3 tabs.');
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
