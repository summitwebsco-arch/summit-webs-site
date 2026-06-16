const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  keyFile: './credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const SHEET_ID = '1QAiTe-C6OU9-IQloQchp-8EKEiW8vNcWzt34Ikx93bs';

const NEW_HEADERS = [
  'Trade #', 'Date', 'Time', 'Symbol', 'Trade Side',
  'Entry Price', 'Stop Loss', 'Take Profit', 'Exit Price',
  'Risk/Reward', 'Result', 'P&L (R)', 'Notes / Reason', 'Photo Link'
];

// Old column indices (0-based): Trade#=0, Side=1, Win/Loss=2, Reason=3, R/R=4, Photo=5
function migrateRow(oldRow, rowIndex) {
  return [
    oldRow[0] || rowIndex,   // Trade #
    '',                       // Date (blank — user fills in)
    '',                       // Time (blank)
    '',                       // Symbol (blank)
    oldRow[1] || '',          // Trade Side
    '',                       // Entry Price
    '',                       // Stop Loss
    '',                       // Take Profit
    '',                       // Exit Price
    '',                       // Risk/Reward (formula will go here)
    oldRow[2] || '',          // Result (old Win/Loss)
    '',                       // P&L (R) (formula will go here)
    oldRow[3] || '',          // Notes / Reason (old Reason for Loss)
    oldRow[5] || '',          // Photo Link (old Photo)
  ];
}

async function rebuildTab(sheets, tabName, sheetId) {
  console.log(`\nRebuilding tab: ${tabName}`);

  // Read existing data
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${tabName}!A1:F200`,
  });
  const rows = res.data.values || [];
  const dataRows = rows.slice(1); // skip old header row
  console.log(`  Found ${dataRows.length} existing data rows`);

  // Clear the sheet
  await sheets.spreadsheets.values.clear({
    spreadsheetId: SHEET_ID,
    range: `${tabName}!A:Z`,
  });

  // Write new headers
  const newRows = [NEW_HEADERS];

  // Migrate existing data rows
  dataRows.forEach((row, i) => {
    if (row.some(cell => cell && cell.toString().trim())) {
      newRows.push(migrateRow(row, i + 1));
    }
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${tabName}!A1`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: newRows },
  });

  // Add R/R formula: =(Take Profit - Entry) / (Entry - Stop Loss) for Buy trades
  // Column indices: Entry=F(6), SL=G(7), TP=H(8), Exit=I(9), R/R=J(10), Result=K(11), P&L=L(12)
  const formulaRequests = [];
  for (let r = 1; r < newRows.length; r++) {
    const row = r + 1; // 1-indexed, +1 for header
    // R/R formula in column J (index 9)
    formulaRequests.push({
      range: `${tabName}!J${row}`,
      values: [[`=IF(AND(F${row}<>"",G${row}<>"",H${row}<>""),IF(E${row}="Buy",(H${row}-F${row})/(F${row}-G${row}),(F${row}-H${row})/(G${row}-F${row})),"")`]],
    });
    // P&L (R) formula in column L (index 11): Exit vs Entry relative to risk
    formulaRequests.push({
      range: `${tabName}!L${row}`,
      values: [[`=IF(AND(F${row}<>"",G${row}<>"",I${row}<>""),IF(E${row}="Buy",(I${row}-F${row})/(F${row}-G${row}),(F${row}-I${row})/(G${row}-F${row})),"")`]],
    });
  }

  if (formulaRequests.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        valueInputOption: 'USER_ENTERED',
        data: formulaRequests,
      },
    });
  }

  // Format header row bold + freeze
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      requests: [
        {
          repeatCell: {
            range: { sheetId, startRowIndex: 0, endRowIndex: 1 },
            cell: { userEnteredFormat: { textFormat: { bold: true }, backgroundColor: { red: 0.2, green: 0.2, blue: 0.2 }, horizontalAlignment: 'CENTER' } },
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

  console.log(`  Done. ${newRows.length - 1} data rows written.`);
}

async function createSummaryTab(sheets, tabSheetIds) {
  console.log('\nCreating Summary tab...');

  // Check if Summary tab exists, create if not
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  const existing = meta.data.sheets.find(s => s.properties.title === 'Summary');

  if (!existing) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        requests: [{ addSheet: { properties: { title: 'Summary', index: 0 } } }],
      },
    });
  } else {
    await sheets.spreadsheets.values.clear({
      spreadsheetId: SHEET_ID,
      range: 'Summary!A:Z',
    });
  }

  const tabs = ['Backtesting', 'Forward Testing', 'Live Account'];

  const summaryData = [
    ['TRADING JOURNAL SUMMARY', '', '', '', ''],
    ['', '', '', '', ''],
    ['Metric', 'Backtesting', 'Forward Testing', 'Live Account', 'All Combined'],
    ['Total Trades',
      `=COUNTA('Backtesting'!K2:K1000)`,
      `=COUNTA('Forward Testing'!K2:K1000)`,
      `=COUNTA('Live Account'!K2:K1000)`,
      `=B4+C4+D4`],
    ['Wins',
      `=COUNTIF('Backtesting'!K2:K1000,"Win")`,
      `=COUNTIF('Forward Testing'!K2:K1000,"Win")`,
      `=COUNTIF('Live Account'!K2:K1000,"Win")`,
      `=B5+C5+D5`],
    ['Losses',
      `=COUNTIF('Backtesting'!K2:K1000,"Loss")`,
      `=COUNTIF('Forward Testing'!K2:K1000,"Loss")`,
      `=COUNTIF('Live Account'!K2:K1000,"Loss")`,
      `=B6+C6+D6`],
    ['Break Even',
      `=COUNTIF('Backtesting'!K2:K1000,"Break Even")`,
      `=COUNTIF('Forward Testing'!K2:K1000,"Break Even")`,
      `=COUNTIF('Live Account'!K2:K1000,"Break Even")`,
      `=B7+C7+D7`],
    ['Win Rate',
      `=IF(B4>0,B5/B4,0)`,
      `=IF(C4>0,C5/C4,0)`,
      `=IF(D4>0,D5/D4,0)`,
      `=IF(E4>0,E5/E4,0)`],
    ['', '', '', '', ''],
    ['Avg R/R (Wins)',
      `=AVERAGEIF('Backtesting'!K2:K1000,"Win",'Backtesting'!L2:L1000)`,
      `=AVERAGEIF('Forward Testing'!K2:K1000,"Win",'Forward Testing'!L2:L1000)`,
      `=AVERAGEIF('Live Account'!K2:K1000,"Win",'Live Account'!L2:L1000)`,
      ''],
    ['Avg R/R (Losses)',
      `=AVERAGEIF('Backtesting'!K2:K1000,"Loss",'Backtesting'!L2:L1000)`,
      `=AVERAGEIF('Forward Testing'!K2:K1000,"Loss",'Forward Testing'!L2:L1000)`,
      `=AVERAGEIF('Live Account'!K2:K1000,"Loss",'Live Account'!L2:L1000)`,
      ''],
    ['Total P&L (R)',
      `=SUM('Backtesting'!L2:L1000)`,
      `=SUM('Forward Testing'!L2:L1000)`,
      `=SUM('Live Account'!L2:L1000)`,
      `=B12+C12+D12`],
    ['', '', '', '', ''],
    ['Expectancy (R)',
      `=IF(B4>0,(B5/B4)*B10+(B6/B4)*B11,0)`,
      `=IF(C4>0,(C5/C4)*C10+(C6/C4)*C11,0)`,
      `=IF(D4>0,(D5/D4)*D10+(D6/D4)*D11,0)`,
      ''],
    ['', '', '', '', ''],
    ['NOTE: Expectancy > 0 means your strategy has edge', '', '', '', ''],
    ['NOTE: Fill in Entry, SL, TP, Exit prices for R/R & P&L to calculate automatically', '', '', '', ''],
  ];

  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: 'Summary!A1',
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: summaryData },
  });

  // Format summary header
  const summaryMeta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  const summarySheet = summaryMeta.data.sheets.find(s => s.properties.title === 'Summary');
  const summarySheetId = summarySheet.properties.sheetId;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      requests: [
        {
          repeatCell: {
            range: { sheetId: summarySheetId, startRowIndex: 0, endRowIndex: 1 },
            cell: { userEnteredFormat: { textFormat: { bold: true, fontSize: 16 } } },
            fields: 'userEnteredFormat(textFormat)',
          },
        },
        {
          repeatCell: {
            range: { sheetId: summarySheetId, startRowIndex: 2, endRowIndex: 3 },
            cell: { userEnteredFormat: { textFormat: { bold: true }, backgroundColor: { red: 0.2, green: 0.2, blue: 0.2 }, horizontalAlignment: 'CENTER' } },
            fields: 'userEnteredFormat(textFormat,backgroundColor,horizontalAlignment)',
          },
        },
        // Format Win Rate row as percentage
        {
          repeatCell: {
            range: { sheetId: summarySheetId, startRowIndex: 7, endRowIndex: 8, startColumnIndex: 1, endColumnIndex: 5 },
            cell: { userEnteredFormat: { numberFormat: { type: 'PERCENT', pattern: '0.0%' } } },
            fields: 'userEnteredFormat.numberFormat',
          },
        },
      ],
    },
  });

  console.log('  Summary tab created.');
}

async function main() {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  // Get sheet IDs for each tab
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  const tabMap = {};
  meta.data.sheets.forEach(s => {
    tabMap[s.properties.title] = s.properties.sheetId;
  });

  const tabs = ['Backtesting', 'Forward Testing', 'Live Account'];
  for (const tab of tabs) {
    await rebuildTab(sheets, tab, tabMap[tab]);
  }

  await createSummaryTab(sheets, tabMap);

  console.log('\nDone! Your trading journal has been rebuilt.');
  console.log('Open your Google Sheet to see the changes.');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
