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

async function resetTab(sheets, tabName, sheetId) {
  console.log(`\nResetting: ${tabName}`);

  // Read full width to find where data actually is
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${tabName}!A1:Z500`,
  });
  const rows = res.data.values || [];
  const dataRows = rows.slice(1); // skip header row

  // Pull only the columns that have real data (Result=col10, Notes=col12, Photo=col13)
  const realData = dataRows
    .filter(row => {
      const result = row[10] || '';
      return result.trim() !== '';
    })
    .map((row, i) => [
      i + 1,          // Trade # (sequential)
      '',             // Date
      '',             // Time
      '',             // Symbol
      row[4] || '',   // Trade Side (col E)
      '',             // Entry Price
      '',             // Stop Loss
      '',             // Take Profit
      '',             // Exit Price
      '',             // Risk/Reward (formula)
      row[10] || '',  // Result
      '',             // P&L (formula)
      row[12] || '',  // Notes / Reason
      row[13] || '',  // Photo Link
    ]);

  console.log(`  ${realData.length} real data rows found`);

  // Wipe the entire sheet
  await sheets.spreadsheets.values.clear({
    spreadsheetId: SHEET_ID,
    range: `${tabName}!A:Z`,
  });

  // Write headers + data starting at A1
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${tabName}!A1`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [HEADERS, ...realData] },
  });

  // Add R/R and P&L formulas
  const formulaData = [];
  for (let r = 0; r < realData.length; r++) {
    const row = r + 2;
    formulaData.push({
      range: `${tabName}!J${row}`,
      values: [[`=IF(AND(F${row}<>"",G${row}<>"",H${row}<>""),IF(E${row}="Buy",(H${row}-F${row})/(F${row}-G${row}),(F${row}-H${row})/(G${row}-F${row})),"")`]],
    });
    formulaData.push({
      range: `${tabName}!L${row}`,
      values: [[`=IF(AND(F${row}<>"",G${row}<>"",I${row}<>""),IF(E${row}="Buy",(I${row}-F${row})/(F${row}-G${row}),(F${row}-I${row})/(G${row}-F${row})),"")`]],
    });
  }
  if (formulaData.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: { valueInputOption: 'USER_ENTERED', data: formulaData },
    });
  }

  // Remove any existing banded ranges on this sheet
  const freshMeta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  const sheetMeta = freshMeta.data.sheets.find(s => s.properties.sheetId === sheetId);
  const bandedRanges = (sheetMeta && sheetMeta.bandedRanges) || [];
  if (bandedRanges.length > 0) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: { requests: bandedRanges.map(b => ({ deleteBanding: { bandedRangeId: b.bandedRangeId } })) },
    });
  }

  // Clean formatting: reset all, then apply header style + alternating rows
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      requests: [
        // Reset all formatting
        {
          updateCells: {
            range: { sheetId },
            fields: 'userEnteredFormat',
            rows: [],
          },
        },
        // Base font for whole sheet
        {
          repeatCell: {
            range: { sheetId },
            cell: { userEnteredFormat: { textFormat: { fontFamily: 'Arial', fontSize: 10, bold: false }, verticalAlignment: 'MIDDLE', wrapStrategy: 'CLIP' } },
            fields: 'userEnteredFormat(textFormat,verticalAlignment,wrapStrategy)',
          },
        },
        // Header row
        {
          repeatCell: {
            range: { sheetId, startRowIndex: 0, endRowIndex: 1 },
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 0.13, green: 0.13, blue: 0.13 },
                textFormat: { fontFamily: 'Arial', fontSize: 10, bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } },
                horizontalAlignment: 'CENTER',
                verticalAlignment: 'MIDDLE',
              },
            },
            fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)',
          },
        },
        // Freeze header
        {
          updateSheetProperties: {
            properties: { sheetId, gridProperties: { frozenRowCount: 1 } },
            fields: 'gridProperties.frozenRowCount',
          },
        },
        // Alternating row colors
        {
          addBanding: {
            bandedRange: {
              range: { sheetId, startRowIndex: 1, endRowIndex: Math.max(realData.length + 1, 50), startColumnIndex: 0, endColumnIndex: 14 },
              rowProperties: {
                firstBandColor: { red: 1, green: 1, blue: 1 },
                secondBandColor: { red: 0.95, green: 0.95, blue: 0.97 },
              },
            },
          },
        },
        // Column widths
        { updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: 0,  endIndex: 1  }, properties: { pixelSize: 70  }, fields: 'pixelSize' } },
        { updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: 1,  endIndex: 2  }, properties: { pixelSize: 100 }, fields: 'pixelSize' } },
        { updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: 2,  endIndex: 3  }, properties: { pixelSize: 75  }, fields: 'pixelSize' } },
        { updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: 3,  endIndex: 4  }, properties: { pixelSize: 90  }, fields: 'pixelSize' } },
        { updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: 4,  endIndex: 5  }, properties: { pixelSize: 90  }, fields: 'pixelSize' } },
        { updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: 5,  endIndex: 9  }, properties: { pixelSize: 100 }, fields: 'pixelSize' } },
        { updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: 9,  endIndex: 10 }, properties: { pixelSize: 100 }, fields: 'pixelSize' } },
        { updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: 10, endIndex: 11 }, properties: { pixelSize: 90  }, fields: 'pixelSize' } },
        { updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: 11, endIndex: 12 }, properties: { pixelSize: 80  }, fields: 'pixelSize' } },
        { updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: 12, endIndex: 13 }, properties: { pixelSize: 200 }, fields: 'pixelSize' } },
        { updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: 13, endIndex: 14 }, properties: { pixelSize: 130 }, fields: 'pixelSize' } },
        // Row heights
        { updateDimensionProperties: { range: { sheetId, dimension: 'ROWS', startIndex: 0, endIndex: 1 },                    properties: { pixelSize: 32 }, fields: 'pixelSize' } },
        { updateDimensionProperties: { range: { sheetId, dimension: 'ROWS', startIndex: 1, endIndex: realData.length + 1 }, properties: { pixelSize: 26 }, fields: 'pixelSize' } },
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
    await resetTab(sheets, tab, tabMap[tab]);
  }

  console.log('\nAll tabs reset and starting at column A.');
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
