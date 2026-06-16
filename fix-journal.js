const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  keyFile: './credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const SHEET_ID = '1QAiTe-C6OU9-IQloQchp-8EKEiW8vNcWzt34Ikx93bs';

const HEADERS = [
  'Trade #', 'Date', 'Time', 'Symbol', 'Trade Side',
  'Entry Price', 'Stop Loss', 'Take Profit', 'Exit Price',
  'Risk/Reward', 'Result', 'P&L (R)', 'Notes / Reason', 'Photo Link'
];

const JUNK = ['Column 1', 'Column 2', 'Column 3'];

function isRowEmpty(row) {
  // A row is "empty" if the only non-blank value is a trade number in column 0
  const meaningful = row.slice(1).filter(cell => cell && cell.toString().trim() !== '');
  return meaningful.length === 0;
}

function cleanRow(row) {
  // Remove junk values and pad to 14 columns
  return Array.from({ length: 14 }, (_, i) => {
    const val = row[i] || '';
    return JUNK.includes(val) ? '' : val;
  });
}

async function fixTab(sheets, tabName, sheetId) {
  console.log(`\nFixing: ${tabName}`);

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${tabName}!A1:Z500`,
  });

  const rows = res.data.values || [];
  if (rows.length === 0) { console.log('  Nothing to fix.'); return; }

  const header = rows[0];
  const dataRows = rows.slice(1);

  // Keep only non-empty rows, cleaned of junk
  const cleanedData = dataRows
    .filter(row => !isRowEmpty(row))
    .map(row => cleanRow(row));

  console.log(`  ${dataRows.length} rows found → ${cleanedData.length} non-empty rows kept`);

  // Clear everything and rewrite
  await sheets.spreadsheets.values.clear({
    spreadsheetId: SHEET_ID,
    range: `${tabName}!A:Z`,
  });

  const newRows = [HEADERS, ...cleanedData];

  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${tabName}!A1`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: newRows },
  });

  // Re-add R/R and P&L formulas for each data row
  const formulaData = [];
  for (let r = 0; r < cleanedData.length; r++) {
    const row = r + 2; // 1-indexed + skip header
    // Only add formula if R/R column (index 9) is blank (not manually entered)
    if (!cleanedData[r][9]) {
      formulaData.push({
        range: `${tabName}!J${row}`,
        values: [[`=IF(AND(F${row}<>"",G${row}<>"",H${row}<>""),IF(E${row}="Buy",(H${row}-F${row})/(F${row}-G${row}),(F${row}-H${row})/(G${row}-F${row})),"")`]],
      });
    }
    if (!cleanedData[r][11]) {
      formulaData.push({
        range: `${tabName}!L${row}`,
        values: [[`=IF(AND(F${row}<>"",G${row}<>"",I${row}<>""),IF(E${row}="Buy",(I${row}-F${row})/(F${row}-G${row}),(F${row}-I${row})/(G${row}-F${row})),"")`]],
      });
    }
  }

  if (formulaData.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: { valueInputOption: 'USER_ENTERED', data: formulaData },
    });
  }

  // Reformat header row
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      requests: [
        {
          repeatCell: {
            range: { sheetId, startRowIndex: 0, endRowIndex: 1 },
            cell: {
              userEnteredFormat: {
                textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } },
                backgroundColor: { red: 0.13, green: 0.13, blue: 0.13 },
                horizontalAlignment: 'CENTER',
              },
            },
            fields: 'userEnteredFormat(textFormat,backgroundColor,horizontalAlignment)',
          },
        },
        {
          updateSheetProperties: {
            properties: { sheetId, gridProperties: { frozenRowCount: 1 } },
            fields: 'gridProperties.frozenRowCount',
          },
        },
      ],
    },
  });

  console.log(`  Done.`);
}

async function main() {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  const tabMap = {};
  meta.data.sheets.forEach(s => { tabMap[s.properties.title] = s.properties.sheetId; });

  for (const tab of ['Backtesting', 'Forward Testing', 'Live Account']) {
    await fixTab(sheets, tab, tabMap[tab]);
  }

  console.log('\nAll done. Sheet is cleaned up.');
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
