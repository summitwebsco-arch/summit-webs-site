const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  keyFile: './credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const SHEET_ID = '1QAiTe-C6OU9-IQloQchp-8EKEiW8vNcWzt34Ikx93bs';

const rgb = (r, g, b) => ({ red: r/255, green: g/255, blue: b/255 });

async function main() {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  const summarySheet = meta.data.sheets.find(s => s.properties.title === 'Summary');
  const sheetId = summarySheet.properties.sheetId;

  // Fix #DIV/0! errors with IFERROR and format Win Rate as %
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      valueInputOption: 'USER_ENTERED',
      data: [
        // Win Rate row (row 8) — wrap in IFERROR
        { range: 'Summary!B8', values: [['=IFERROR(IF(B4>0,B5/B4,0),"—")']] },
        { range: 'Summary!C8', values: [['=IFERROR(IF(C4>0,C5/C4,0),"—")']] },
        { range: 'Summary!D8', values: [['=IFERROR(IF(D4>0,D5/D4,0),"—")']] },
        { range: 'Summary!E8', values: [['=IFERROR(IF(E4>0,E5/E4,0),"—")']] },
        // Avg R/R rows (rows 10, 11)
        { range: 'Summary!B10', values: [['=IFERROR(AVERAGEIF(Backtesting!K2:K1000,"Win",Backtesting!L2:L1000),"—")']] },
        { range: 'Summary!C10', values: [['=IFERROR(AVERAGEIF(\'Forward Testing\'!K2:K1000,"Win",\'Forward Testing\'!L2:L1000),"—")']] },
        { range: 'Summary!D10', values: [['=IFERROR(AVERAGEIF(\'Live Account\'!K2:K1000,"Win",\'Live Account\'!L2:L1000),"—")']] },
        { range: 'Summary!B11', values: [['=IFERROR(AVERAGEIF(Backtesting!K2:K1000,"Loss",Backtesting!L2:L1000),"—")']] },
        { range: 'Summary!C11', values: [['=IFERROR(AVERAGEIF(\'Forward Testing\'!K2:K1000,"Loss",\'Forward Testing\'!L2:L1000),"—")']] },
        { range: 'Summary!D11', values: [['=IFERROR(AVERAGEIF(\'Live Account\'!K2:K1000,"Loss",\'Live Account\'!L2:L1000),"—")']] },
        // Expectancy row (row 14)
        { range: 'Summary!B14', values: [['=IFERROR(IF(B4>0,(B5/B4)*B10+(B6/B4)*B11,"—"),"—")']] },
        { range: 'Summary!C14', values: [['=IFERROR(IF(C4>0,(C5/C4)*C10+(C6/C4)*C11,"—"),"—")']] },
        { range: 'Summary!D14', values: [['=IFERROR(IF(D4>0,(D5/D4)*D10+(D6/D4)*D11,"—"),"—")']] },
      ],
    },
  });

  // Remove existing banding on summary
  const freshMeta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  const s = freshMeta.data.sheets.find(x => x.properties.sheetId === sheetId);
  const banded = (s.bandedRanges || []);
  if (banded.length > 0) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: { requests: banded.map(b => ({ deleteBanding: { bandedRangeId: b.bandedRangeId } })) },
    });
  }

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      requests: [
        // Reset all formatting
        { updateCells: { range: { sheetId }, fields: 'userEnteredFormat', rows: [] } },

        // Base font for whole sheet
        {
          repeatCell: {
            range: { sheetId },
            cell: { userEnteredFormat: { textFormat: { fontFamily: 'Arial', fontSize: 10 }, verticalAlignment: 'MIDDLE' } },
            fields: 'userEnteredFormat(textFormat,verticalAlignment)',
          },
        },

        // Row 1: Title — large navy text
        {
          repeatCell: {
            range: { sheetId, startRowIndex: 0, endRowIndex: 1 },
            cell: {
              userEnteredFormat: {
                backgroundColor: rgb(26, 35, 126),
                textFormat: { bold: true, fontSize: 14, foregroundColor: { red: 1, green: 1, blue: 1 }, fontFamily: 'Arial' },
                verticalAlignment: 'MIDDLE',
                horizontalAlignment: 'LEFT',
              },
            },
            fields: 'userEnteredFormat(backgroundColor,textFormat,verticalAlignment,horizontalAlignment)',
          },
        },

        // Row 3: Column headers — navy
        {
          repeatCell: {
            range: { sheetId, startRowIndex: 2, endRowIndex: 3 },
            cell: {
              userEnteredFormat: {
                backgroundColor: rgb(26, 35, 126),
                textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 }, fontFamily: 'Arial', fontSize: 10 },
                horizontalAlignment: 'CENTER',
                verticalAlignment: 'MIDDLE',
              },
            },
            fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)',
          },
        },

        // Metric label column (A) — bold, dark
        {
          repeatCell: {
            range: { sheetId, startRowIndex: 3, endRowIndex: 17, startColumnIndex: 0, endColumnIndex: 1 },
            cell: {
              userEnteredFormat: {
                textFormat: { bold: true, fontFamily: 'Arial', fontSize: 10, foregroundColor: rgb(30, 30, 30) },
                backgroundColor: rgb(232, 234, 246),
              },
            },
            fields: 'userEnteredFormat(textFormat,backgroundColor)',
          },
        },

        // Data cells (B-E) — light background, centered
        {
          repeatCell: {
            range: { sheetId, startRowIndex: 3, endRowIndex: 14, startColumnIndex: 1, endColumnIndex: 5 },
            cell: {
              userEnteredFormat: {
                backgroundColor: rgb(248, 249, 255),
                horizontalAlignment: 'CENTER',
              },
            },
            fields: 'userEnteredFormat(backgroundColor,horizontalAlignment)',
          },
        },

        // Wins row (row 5, index 4) — green tint
        {
          repeatCell: {
            range: { sheetId, startRowIndex: 4, endRowIndex: 5, startColumnIndex: 1, endColumnIndex: 5 },
            cell: { userEnteredFormat: { backgroundColor: rgb(183, 225, 205), textFormat: { foregroundColor: rgb(11, 83, 48), bold: true } } },
            fields: 'userEnteredFormat(backgroundColor,textFormat)',
          },
        },

        // Losses row (row 6, index 5) — red tint
        {
          repeatCell: {
            range: { sheetId, startRowIndex: 5, endRowIndex: 6, startColumnIndex: 1, endColumnIndex: 5 },
            cell: { userEnteredFormat: { backgroundColor: rgb(244, 199, 195), textFormat: { foregroundColor: rgb(134, 32, 23), bold: true } } },
            fields: 'userEnteredFormat(backgroundColor,textFormat)',
          },
        },

        // Break Even row (row 7, index 6) — amber tint
        {
          repeatCell: {
            range: { sheetId, startRowIndex: 6, endRowIndex: 7, startColumnIndex: 1, endColumnIndex: 5 },
            cell: { userEnteredFormat: { backgroundColor: rgb(255, 232, 173), textFormat: { foregroundColor: rgb(122, 81, 0), bold: true } } },
            fields: 'userEnteredFormat(backgroundColor,textFormat)',
          },
        },

        // Win Rate row (row 8, index 7) — format as percentage
        {
          repeatCell: {
            range: { sheetId, startRowIndex: 7, endRowIndex: 8, startColumnIndex: 1, endColumnIndex: 5 },
            cell: {
              userEnteredFormat: {
                numberFormat: { type: 'PERCENT', pattern: '0.0%' },
                backgroundColor: rgb(232, 234, 246),
                textFormat: { bold: true },
                horizontalAlignment: 'CENTER',
              },
            },
            fields: 'userEnteredFormat(numberFormat,backgroundColor,textFormat,horizontalAlignment)',
          },
        },

        // Notes rows (16, 17) — italic, muted
        {
          repeatCell: {
            range: { sheetId, startRowIndex: 15, endRowIndex: 17 },
            cell: {
              userEnteredFormat: {
                textFormat: { italic: true, foregroundColor: rgb(100, 100, 100), fontSize: 9 },
                backgroundColor: rgb(245, 245, 245),
              },
            },
            fields: 'userEnteredFormat(textFormat,backgroundColor)',
          },
        },

        // Column widths
        { updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: 0, endIndex: 1 }, properties: { pixelSize: 200 }, fields: 'pixelSize' } },
        { updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: 1, endIndex: 5 }, properties: { pixelSize: 140 }, fields: 'pixelSize' } },

        // Row heights
        { updateDimensionProperties: { range: { sheetId, dimension: 'ROWS', startIndex: 0, endIndex: 1  }, properties: { pixelSize: 45 }, fields: 'pixelSize' } },
        { updateDimensionProperties: { range: { sheetId, dimension: 'ROWS', startIndex: 1, endIndex: 2  }, properties: { pixelSize: 10 }, fields: 'pixelSize' } },
        { updateDimensionProperties: { range: { sheetId, dimension: 'ROWS', startIndex: 2, endIndex: 17 }, properties: { pixelSize: 28 }, fields: 'pixelSize' } },

        // Freeze top 3 rows
        {
          updateSheetProperties: {
            properties: { sheetId, gridProperties: { frozenRowCount: 0 } },
            fields: 'gridProperties.frozenRowCount',
          },
        },
      ],
    },
  });

  console.log('Summary tab formatted.');
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
