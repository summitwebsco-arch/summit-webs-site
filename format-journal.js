const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  keyFile: './credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const SHEET_ID = '1QAiTe-C6OU9-IQloQchp-8EKEiW8vNcWzt34Ikx93bs';

async function formatTab(sheets, sheetId, rowCount) {
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      requests: [
        // Clear ALL existing formatting on the sheet first
        {
          updateCells: {
            range: { sheetId, startRowIndex: 0 },
            fields: 'userEnteredFormat',
            rows: [],
          },
        },
        // Default font and size for entire sheet
        {
          repeatCell: {
            range: { sheetId },
            cell: {
              userEnteredFormat: {
                textFormat: { fontFamily: 'Arial', fontSize: 10, bold: false },
                verticalAlignment: 'MIDDLE',
                wrapStrategy: 'CLIP',
              },
            },
            fields: 'userEnteredFormat(textFormat,verticalAlignment,wrapStrategy)',
          },
        },
        // Header row: dark background, white bold text
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
        // Freeze header row
        {
          updateSheetProperties: {
            properties: { sheetId, gridProperties: { frozenRowCount: 1 } },
            fields: 'gridProperties.frozenRowCount',
          },
        },
        // Alternate row colors for data rows
        {
          addBanding: {
            bandedRange: {
              range: { sheetId, startRowIndex: 1, endRowIndex: Math.max(rowCount + 1, 100), startColumnIndex: 0, endColumnIndex: 14 },
              rowProperties: {
                headerColor: { red: 0.13, green: 0.13, blue: 0.13 },
                firstBandColor: { red: 1, green: 1, blue: 1 },
                secondBandColor: { red: 0.95, green: 0.95, blue: 0.97 },
              },
            },
          },
        },
        // Center-align specific columns: Trade#, Date, Time, Trade Side, R/R, Result, P&L
        {
          repeatCell: {
            range: { sheetId, startRowIndex: 1, startColumnIndex: 0, endColumnIndex: 1 },
            cell: { userEnteredFormat: { horizontalAlignment: 'CENTER' } },
            fields: 'userEnteredFormat.horizontalAlignment',
          },
        },
        {
          repeatCell: {
            range: { sheetId, startRowIndex: 1, startColumnIndex: 1, endColumnIndex: 4 },
            cell: { userEnteredFormat: { horizontalAlignment: 'CENTER' } },
            fields: 'userEnteredFormat.horizontalAlignment',
          },
        },
        {
          repeatCell: {
            range: { sheetId, startRowIndex: 1, startColumnIndex: 9, endColumnIndex: 12 },
            cell: { userEnteredFormat: { horizontalAlignment: 'CENTER' } },
            fields: 'userEnteredFormat.horizontalAlignment',
          },
        },
        // Column widths
        { updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: 0, endIndex: 1 },   properties: { pixelSize: 70 },  fields: 'pixelSize' } },  // Trade #
        { updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: 1, endIndex: 2 },   properties: { pixelSize: 100 }, fields: 'pixelSize' } },  // Date
        { updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: 2, endIndex: 3 },   properties: { pixelSize: 75 },  fields: 'pixelSize' } },  // Time
        { updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: 3, endIndex: 4 },   properties: { pixelSize: 90 },  fields: 'pixelSize' } },  // Symbol
        { updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: 4, endIndex: 5 },   properties: { pixelSize: 90 },  fields: 'pixelSize' } },  // Trade Side
        { updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: 5, endIndex: 9 },   properties: { pixelSize: 100 }, fields: 'pixelSize' } },  // Prices
        { updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: 9, endIndex: 10 },  properties: { pixelSize: 100 }, fields: 'pixelSize' } },  // R/R
        { updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: 10, endIndex: 11 }, properties: { pixelSize: 90 },  fields: 'pixelSize' } },  // Result
        { updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: 11, endIndex: 12 }, properties: { pixelSize: 80 },  fields: 'pixelSize' } },  // P&L
        { updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: 12, endIndex: 13 }, properties: { pixelSize: 200 }, fields: 'pixelSize' } },  // Notes
        { updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: 13, endIndex: 14 }, properties: { pixelSize: 130 }, fields: 'pixelSize' } },  // Photo
        // Row height for all rows
        { updateDimensionProperties: { range: { sheetId, dimension: 'ROWS', startIndex: 0, endIndex: 1 },              properties: { pixelSize: 32 }, fields: 'pixelSize' } },
        { updateDimensionProperties: { range: { sheetId, dimension: 'ROWS', startIndex: 1, endIndex: rowCount + 1 },   properties: { pixelSize: 26 }, fields: 'pixelSize' } },
      ],
    },
  });
}

async function formatSummary(sheets, sheetId) {
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      requests: [
        {
          updateCells: {
            range: { sheetId, startRowIndex: 0 },
            fields: 'userEnteredFormat',
            rows: [],
          },
        },
        {
          repeatCell: {
            range: { sheetId },
            cell: { userEnteredFormat: { textFormat: { fontFamily: 'Arial', fontSize: 10 }, verticalAlignment: 'MIDDLE' } },
            fields: 'userEnteredFormat(textFormat,verticalAlignment)',
          },
        },
        // Title row
        {
          repeatCell: {
            range: { sheetId, startRowIndex: 0, endRowIndex: 1 },
            cell: { userEnteredFormat: { textFormat: { fontFamily: 'Arial', fontSize: 16, bold: true }, horizontalAlignment: 'LEFT' } },
            fields: 'userEnteredFormat(textFormat,horizontalAlignment)',
          },
        },
        // Column header row (row 3)
        {
          repeatCell: {
            range: { sheetId, startRowIndex: 2, endRowIndex: 3 },
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 0.13, green: 0.13, blue: 0.13 },
                textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 }, fontFamily: 'Arial', fontSize: 10 },
                horizontalAlignment: 'CENTER',
              },
            },
            fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)',
          },
        },
        // Data rows: alternate shading
        {
          addBanding: {
            bandedRange: {
              range: { sheetId, startRowIndex: 3, endRowIndex: 20, startColumnIndex: 0, endColumnIndex: 5 },
              rowProperties: {
                firstBandColor: { red: 1, green: 1, blue: 1 },
                secondBandColor: { red: 0.95, green: 0.95, blue: 0.97 },
              },
            },
          },
        },
        // Column widths for summary
        { updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: 0, endIndex: 1 }, properties: { pixelSize: 200 }, fields: 'pixelSize' } },
        { updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: 1, endIndex: 5 }, properties: { pixelSize: 140 }, fields: 'pixelSize' } },
        // Row heights
        { updateDimensionProperties: { range: { sheetId, dimension: 'ROWS', startIndex: 0, endIndex: 1 }, properties: { pixelSize: 40 }, fields: 'pixelSize' } },
        { updateDimensionProperties: { range: { sheetId, dimension: 'ROWS', startIndex: 1, endIndex: 20 }, properties: { pixelSize: 28 }, fields: 'pixelSize' } },
      ],
    },
  });
}

async function main() {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });

  for (const sheet of meta.data.sheets) {
    const name = sheet.properties.title;
    const sheetId = sheet.properties.sheetId;
    console.log(`Formatting: ${name}`);

    if (name === 'Summary') {
      await formatSummary(sheets, sheetId);
    } else {
      // Get row count for this tab
      const res = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${name}!A:A`,
      });
      const rowCount = (res.data.values || []).length;
      await formatTab(sheets, sheetId, rowCount);
    }
  }

  console.log('\nFormatting complete.');
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
