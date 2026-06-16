const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  keyFile: './credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const SHEET_ID = '197qkXcwXKHJ0jvAHTYa7LIEJxOedGKl7XwQfboDjzoc';

const rgb = (r, g, b) => ({ red: r/255, green: g/255, blue: b/255 });

const C = {
  navy:       rgb(26, 35, 126),
  navyLight:  rgb(57, 73, 171),
  white:      { red: 1, green: 1, blue: 1 },
  green:      rgb(183, 225, 205),
  greenText:  rgb(11, 83, 48),
  red:        rgb(244, 199, 195),
  redText:    rgb(134, 32, 23),
  amber:      rgb(255, 232, 173),
  amberText:  rgb(122, 81, 0),
  rowAlt:     rgb(248, 249, 255),
  labelBg:    rgb(232, 234, 246),
  grey:       rgb(245, 245, 245),
  greyText:   rgb(100, 100, 100),
  dark:       rgb(30, 30, 30),
};

// --- helpers ---

function base(sheetId) {
  return {
    repeatCell: {
      range: { sheetId },
      cell: { userEnteredFormat: { textFormat: { fontFamily: 'Arial', fontSize: 10, bold: false }, verticalAlignment: 'MIDDLE', wrapStrategy: 'CLIP' } },
      fields: 'userEnteredFormat(textFormat,verticalAlignment,wrapStrategy)',
    },
  };
}

function header(sheetId, startRow, endRow, startCol, endCol) {
  return {
    repeatCell: {
      range: { sheetId, startRowIndex: startRow, endRowIndex: endRow, startColumnIndex: startCol, endColumnIndex: endCol },
      cell: {
        userEnteredFormat: {
          backgroundColor: C.navy,
          textFormat: { bold: true, foregroundColor: C.white, fontFamily: 'Arial', fontSize: 10 },
          horizontalAlignment: 'CENTER',
          verticalAlignment: 'MIDDLE',
        },
      },
      fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)',
    },
  };
}

function colWidth(sheetId, start, end, px) {
  return { updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: start, endIndex: end }, properties: { pixelSize: px }, fields: 'pixelSize' } };
}

function rowHeight(sheetId, start, end, px) {
  return { updateDimensionProperties: { range: { sheetId, dimension: 'ROWS', startIndex: start, endIndex: end }, properties: { pixelSize: px }, fields: 'pixelSize' } };
}

function freeze(sheetId, rows = 1, cols = 0) {
  return { updateSheetProperties: { properties: { sheetId, gridProperties: { frozenRowCount: rows, frozenColumnCount: cols } }, fields: 'gridProperties(frozenRowCount,frozenColumnCount)' } };
}

function banding(sheetId, startRow, endRow, startCol, endCol) {
  return {
    addBanding: {
      bandedRange: {
        range: { sheetId, startRowIndex: startRow, endRowIndex: endRow, startColumnIndex: startCol, endColumnIndex: endCol },
        rowProperties: { firstBandColor: C.white, secondBandColor: rgb(248, 249, 255) },
      },
    },
  };
}

function condGT0(sheetId, startRow, endRow, colIdx) {
  return {
    addConditionalFormatRule: {
      rule: {
        ranges: [{ sheetId, startRowIndex: startRow, endRowIndex: endRow, startColumnIndex: colIdx, endColumnIndex: colIdx + 1 }],
        booleanRule: {
          condition: { type: 'NUMBER_GREATER', values: [{ userEnteredValue: '0' }] },
          format: { backgroundColor: C.green, textFormat: { foregroundColor: C.greenText, bold: true } },
        },
      },
      index: 0,
    },
  };
}

function condLT0(sheetId, startRow, endRow, colIdx) {
  return {
    addConditionalFormatRule: {
      rule: {
        ranges: [{ sheetId, startRowIndex: startRow, endRowIndex: endRow, startColumnIndex: colIdx, endColumnIndex: colIdx + 1 }],
        booleanRule: {
          condition: { type: 'NUMBER_LESS', values: [{ userEnteredValue: '0' }] },
          format: { backgroundColor: C.red, textFormat: { foregroundColor: C.redText, bold: true } },
        },
      },
      index: 0,
    },
  };
}

function condTextGT0(sheetId, startRow, endRow, colIdx) {
  // For cells stored as text like "$1,354.25" — use contains "-" for negative
  return [condGT0(sheetId, startRow, endRow, colIdx), condLT0(sheetId, startRow, endRow, colIdx)];
}

function resetCellFormat(sheetId) {
  return { updateCells: { range: { sheetId }, fields: 'userEnteredFormat', rows: [] } };
}

async function clearBanding(sheets, sheetId) {
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  const s = meta.data.sheets.find(x => x.properties.sheetId === sheetId);
  const banded = s?.bandedRanges || [];
  if (banded.length > 0) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: { requests: banded.map(b => ({ deleteBanding: { bandedRangeId: b.bandedRangeId } })) },
    });
  }
}

async function clearConditional(sheets, sheetId) {
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  const s = meta.data.sheets.find(x => x.properties.sheetId === sheetId);
  const rules = s?.conditionalFormats || [];
  if (rules.length > 0) {
    const reqs = rules.map((_, i) => ({ deleteConditionalFormatRule: { sheetId, index: 0 } }));
    await sheets.spreadsheets.batchUpdate({ spreadsheetId: SHEET_ID, requestBody: { requests: reqs } });
  }
}

// ---- Tab formatters ----

async function formatKey(sheets, sheetId) {
  await clearBanding(sheets, sheetId);
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      requests: [
        resetCellFormat(sheetId),
        base(sheetId),
        // Title area background
        { repeatCell: { range: { sheetId, startRowIndex: 0, endRowIndex: 4 }, cell: { userEnteredFormat: { backgroundColor: C.navy } }, fields: 'userEnteredFormat.backgroundColor' } },
        // Header row (row 5)
        header(sheetId, 4, 5, 1, 6),
        // Color swatches
        { repeatCell: { range: { sheetId, startRowIndex: 5, endRowIndex: 6, startColumnIndex: 1, endColumnIndex: 2 }, cell: { userEnteredFormat: { backgroundColor: rgb(66,66,66) } }, fields: 'userEnteredFormat.backgroundColor' } },
        { repeatCell: { range: { sheetId, startRowIndex: 6, endRowIndex: 7, startColumnIndex: 1, endColumnIndex: 2 }, cell: { userEnteredFormat: { backgroundColor: rgb(240,240,240) } }, fields: 'userEnteredFormat.backgroundColor' } },
        { repeatCell: { range: { sheetId, startRowIndex: 7, endRowIndex: 8, startColumnIndex: 1, endColumnIndex: 2 }, cell: { userEnteredFormat: { backgroundColor: C.green } }, fields: 'userEnteredFormat.backgroundColor' } },
        // Notes row
        { repeatCell: { range: { sheetId, startRowIndex: 9, endRowIndex: 10 }, cell: { userEnteredFormat: { backgroundColor: rgb(255,249,196), textFormat: { italic: true, fontSize: 9, foregroundColor: C.greyText } } }, fields: 'userEnteredFormat(backgroundColor,textFormat)' } },
        rowHeight(sheetId, 0, 4, 20),
        rowHeight(sheetId, 4, 10, 30),
        colWidth(sheetId, 0, 1, 20),
        colWidth(sheetId, 1, 2, 140),
        colWidth(sheetId, 2, 3, 200),
        colWidth(sheetId, 3, 4, 20),
        colWidth(sheetId, 4, 5, 220),
        colWidth(sheetId, 5, 6, 180),
      ],
    },
  });
}

async function formatTotalOverview(sheets, sheetId) {
  await clearBanding(sheets, sheetId);
  await clearConditional(sheets, sheetId);
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      requests: [
        resetCellFormat(sheetId),
        base(sheetId),
        // Left section header (row 1, cols A-C)
        header(sheetId, 0, 1, 0, 3),
        // Right section header (row 1, cols E-H)
        header(sheetId, 0, 1, 4, 8),
        // Left data rows
        banding(sheetId, 1, 8, 0, 3),
        // Right data rows
        banding(sheetId, 1, 5, 4, 8),
        // Sector section header (row 10)
        header(sheetId, 9, 10, 0, 3),
        banding(sheetId, 10, 15, 0, 3),
        // Type section header (row 5)
        header(sheetId, 4, 5, 0, 3),
        // P/L col (C=2) — green/red
        condGT0(sheetId, 1, 15, 2),
        condLT0(sheetId, 1, 15, 2),
        // Increase/Decrease col (G=6)
        condGT0(sheetId, 1, 5, 6),
        condLT0(sheetId, 1, 5, 6),
        freeze(sheetId, 1),
        rowHeight(sheetId, 0, 15, 28),
        colWidth(sheetId, 0, 1, 190),
        colWidth(sheetId, 1, 4, 120),
        colWidth(sheetId, 4, 5, 150),
        colWidth(sheetId, 5, 8, 140),
      ],
    },
  });
}

async function formatYearlyOverview(sheets, sheetId) {
  await clearBanding(sheets, sheetId);
  await clearConditional(sheets, sheetId);
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      requests: [
        resetCellFormat(sheetId),
        base(sheetId),
        // Year 1 headers (row 1)
        header(sheetId, 0, 1, 0, 4),
        header(sheetId, 0, 1, 4, 8),
        banding(sheetId, 1, 5, 0, 4),
        banding(sheetId, 1, 5, 4, 8),
        // Year 2 headers (row 6)
        header(sheetId, 5, 6, 0, 4),
        header(sheetId, 5, 6, 4, 8),
        banding(sheetId, 6, 10, 0, 4),
        banding(sheetId, 6, 10, 4, 8),
        // P/L col (C=2) both sections
        condGT0(sheetId, 1, 10, 2),
        condLT0(sheetId, 1, 10, 2),
        // P/L col (G=6) benchmark
        condGT0(sheetId, 1, 10, 6),
        condLT0(sheetId, 1, 10, 6),
        rowHeight(sheetId, 0, 10, 28),
        colWidth(sheetId, 0, 1, 150),
        colWidth(sheetId, 1, 4, 130),
        colWidth(sheetId, 4, 5, 10),
        colWidth(sheetId, 5, 8, 140),
      ],
    },
  });
}

async function formatCurrentPortfolio(sheets, sheetId) {
  await clearBanding(sheets, sheetId);
  await clearConditional(sheets, sheetId);
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      requests: [
        resetCellFormat(sheetId),
        base(sheetId),
        // Stocks section header (cols A-J)
        header(sheetId, 0, 1, 0, 10),
        banding(sheetId, 1, 21, 0, 10),
        // Options section header (cols L-V)
        header(sheetId, 0, 1, 11, 23),
        banding(sheetId, 1, 21, 11, 23),
        // Unrealized Gain Amount (col I=8) — green/red
        condGT0(sheetId, 1, 21, 8),
        condLT0(sheetId, 1, 21, 8),
        // Unrealized Gain Percent (col J=9)
        condGT0(sheetId, 1, 21, 9),
        condLT0(sheetId, 1, 21, 9),
        // Options unrealized (col U=20, V=21)
        condGT0(sheetId, 1, 21, 20),
        condLT0(sheetId, 1, 21, 20),
        condGT0(sheetId, 1, 21, 21),
        condLT0(sheetId, 1, 21, 21),
        // Total row (row 22)
        { repeatCell: { range: { sheetId, startRowIndex: 21, endRowIndex: 22 }, cell: { userEnteredFormat: { backgroundColor: C.labelBg, textFormat: { bold: true } } }, fields: 'userEnteredFormat(backgroundColor,textFormat)' } },
        freeze(sheetId, 1),
        rowHeight(sheetId, 0, 22, 28),
        colWidth(sheetId, 0, 1, 200),
        colWidth(sheetId, 1, 2, 70),
        colWidth(sheetId, 2, 3, 160),
        colWidth(sheetId, 3, 4, 90),
        colWidth(sheetId, 4, 10, 120),
        colWidth(sheetId, 10, 11, 20),
        colWidth(sheetId, 11, 12, 110),
        colWidth(sheetId, 12, 23, 110),
      ],
    },
  });
}

async function formatPlannedTrades(sheets, sheetId) {
  await clearBanding(sheets, sheetId);
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      requests: [
        resetCellFormat(sheetId),
        base(sheetId),
        header(sheetId, 0, 1, 0, 7),
        header(sheetId, 0, 1, 7, 13),
        banding(sheetId, 1, 20, 0, 7),
        banding(sheetId, 1, 20, 7, 13),
        freeze(sheetId, 1),
        rowHeight(sheetId, 0, 20, 28),
        colWidth(sheetId, 0, 1, 200),
        colWidth(sheetId, 1, 2, 70),
        colWidth(sheetId, 2, 3, 160),
        colWidth(sheetId, 3, 7, 120),
        colWidth(sheetId, 7, 8, 20),
        colWidth(sheetId, 8, 13, 110),
      ],
    },
  });
}

async function formatTradeHistory(sheets, sheetId) {
  await clearBanding(sheets, sheetId);
  await clearConditional(sheets, sheetId);
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      requests: [
        resetCellFormat(sheetId),
        base(sheetId),
        // Stocks header
        header(sheetId, 0, 1, 0, 9),
        banding(sheetId, 1, 21, 0, 9),
        // Options header
        header(sheetId, 0, 1, 10, 17),
        banding(sheetId, 1, 21, 10, 17),
        // P/L col stocks (I=8)
        condGT0(sheetId, 1, 21, 8),
        condLT0(sheetId, 1, 21, 8),
        // P/L col options (Q=16)
        condGT0(sheetId, 1, 21, 16),
        condLT0(sheetId, 1, 21, 16),
        // Total rows
        { repeatCell: { range: { sheetId, startRowIndex: 20, endRowIndex: 22 }, cell: { userEnteredFormat: { backgroundColor: C.labelBg, textFormat: { bold: true } } }, fields: 'userEnteredFormat(backgroundColor,textFormat)' } },
        freeze(sheetId, 1),
        rowHeight(sheetId, 0, 22, 28),
        colWidth(sheetId, 0, 1, 220),
        colWidth(sheetId, 1, 2, 70),
        colWidth(sheetId, 2, 3, 160),
        colWidth(sheetId, 3, 6, 110),
        colWidth(sheetId, 6, 7, 120),
        colWidth(sheetId, 7, 8, 150),
        colWidth(sheetId, 8, 9, 100),
        colWidth(sheetId, 9, 10, 20),
        colWidth(sheetId, 10, 17, 110),
      ],
    },
  });
}

// ---- Main ----

async function main() {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  const tabMap = {};
  meta.data.sheets.forEach(s => { tabMap[s.properties.title] = s.properties.sheetId; });

  const jobs = [
    ['Key',                    formatKey],
    ['Total Portfolio Overview', formatTotalOverview],
    ['Yearly Overview',        formatYearlyOverview],
    ['Current Portfolio',      formatCurrentPortfolio],
    ['Planned Trades',         formatPlannedTrades],
    ['Trade History',          formatTradeHistory],
  ];

  for (const [name, fn] of jobs) {
    console.log(`Formatting: ${name}`);
    await fn(sheets, tabMap[name]);
  }

  console.log('\nPortfolio tracker formatted.');
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
