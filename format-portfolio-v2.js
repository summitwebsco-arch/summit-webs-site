const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  keyFile: './credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const SHEET_ID = '197qkXcwXKHJ0jvAHTYa7LIEJxOedGKl7XwQfboDjzoc';

const rgb = (r, g, b) => ({ red: r/255, green: g/255, blue: b/255 });

// Slate design system palette
const P = {
  h1:      rgb(15, 23, 42),      // slate-900 – main headers
  h2:      rgb(30, 41, 59),      // slate-800 – sub-section headers
  divider: rgb(51, 65, 85),      // slate-700 – thin divider rows
  white:   { red:1, green:1, blue:1 },
  text:    rgb(15, 23, 42),      // slate-900
  muted:   rgb(100, 116, 139),   // slate-500
  border:  rgb(226, 232, 240),   // slate-200 – row borders
  surface: rgb(248, 250, 252),   // slate-50  – empty/placeholder rows
  total:   rgb(241, 245, 249),   // slate-100 – total rows
  posBg:   rgb(240, 253, 244),   // green-50
  posText: rgb(21, 128, 61),     // green-700
  negBg:   rgb(254, 242, 242),   // red-50
  negText: rgb(185, 28, 28),     // red-700
  notesBg: rgb(254, 252, 232),   // yellow-50
};

// ── request builders ──────────────────────────────────────────────

function rc(sheetId, r0, r1, c0, c1, fmt, fields) {
  return {
    repeatCell: {
      range: { sheetId, startRowIndex:r0, endRowIndex:r1, startColumnIndex:c0, endColumnIndex:c1 },
      cell: { userEnteredFormat: fmt },
      fields,
    },
  };
}

const cw = (sid, c0, c1, px) => ({ updateDimensionProperties: { range: { sheetId:sid, dimension:'COLUMNS', startIndex:c0, endIndex:c1 }, properties:{ pixelSize:px }, fields:'pixelSize' } });
const rh = (sid, r0, r1, px) => ({ updateDimensionProperties: { range: { sheetId:sid, dimension:'ROWS',    startIndex:r0, endIndex:r1 }, properties:{ pixelSize:px }, fields:'pixelSize' } });
const freeze = (sid, rows=1) => ({ updateSheetProperties: { properties: { sheetId:sid, gridProperties:{ frozenRowCount:rows } }, fields:'gridProperties.frozenRowCount' } });

const FONT = { fontFamily:'Arial', fontSize:10 };

function baseStyle(sid) {
  return rc(sid, 0, 200, 0, 30, { textFormat:{ ...FONT, bold:false, foregroundColor:P.text }, verticalAlignment:'MIDDLE', wrapStrategy:'CLIP', backgroundColor:P.white }, 'userEnteredFormat(textFormat,verticalAlignment,wrapStrategy,backgroundColor)');
}

function mainHeader(sid, r, c0, c1) {
  return rc(sid, r, r+1, c0, c1, {
    backgroundColor: P.h1,
    textFormat: { ...FONT, bold:true, foregroundColor:P.white },
    horizontalAlignment: 'CENTER',
    verticalAlignment: 'MIDDLE',
  }, 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)');
}

function subHeader(sid, r, c0, c1) {
  return rc(sid, r, r+1, c0, c1, {
    backgroundColor: P.h2,
    textFormat: { ...FONT, bold:true, foregroundColor:P.white, fontSize:9 },
    horizontalAlignment: 'LEFT',
    verticalAlignment: 'MIDDLE',
  }, 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)');
}

function dataRow(sid, r0, r1, c0, c1) {
  return rc(sid, r0, r1, c0, c1, {
    backgroundColor: P.white,
    textFormat: { ...FONT, foregroundColor:P.text },
    verticalAlignment: 'MIDDLE',
    borders: { bottom: { style:'SOLID', color:P.border, width:1 } },
  }, 'userEnteredFormat(backgroundColor,textFormat,verticalAlignment,borders)');
}

function placeholderRow(sid, r0, r1, c0, c1) {
  return rc(sid, r0, r1, c0, c1, {
    backgroundColor: P.surface,
    borders: { bottom: { style:'SOLID', color:P.border, width:1 } },
  }, 'userEnteredFormat(backgroundColor,borders)');
}

function totalRowStyle(sid, r, c0, c1) {
  return rc(sid, r, r+1, c0, c1, {
    backgroundColor: P.total,
    textFormat: { ...FONT, bold:true, foregroundColor:P.text },
    verticalAlignment: 'MIDDLE',
    borders: { top:{ style:'SOLID_MEDIUM', color:rgb(148,163,184), width:2 }, bottom:{ style:'SOLID_MEDIUM', color:rgb(148,163,184), width:2 } },
  }, 'userEnteredFormat(backgroundColor,textFormat,verticalAlignment,borders)');
}

function thinDivider(sid, r, c0, c1) {
  return rc(sid, r, r+1, c0, c1, { backgroundColor:P.h1 }, 'userEnteredFormat.backgroundColor');
}

function sepColumn(sid, c, r0=0, r1=200) {
  return rc(sid, r0, r1, c, c+1, { backgroundColor:P.h1 }, 'userEnteredFormat.backgroundColor');
}

function rightAlign(sid, r0, r1, c0, c1) {
  return rc(sid, r0, r1, c0, c1, { horizontalAlignment:'RIGHT' }, 'userEnteredFormat.horizontalAlignment');
}

function plCond(sid, r0, r1, col) {
  return [
    { addConditionalFormatRule: { rule: { ranges:[{ sheetId:sid, startRowIndex:r0, endRowIndex:r1, startColumnIndex:col, endColumnIndex:col+1 }], booleanRule: { condition:{ type:'NUMBER_GREATER', values:[{ userEnteredValue:'0' }] }, format:{ backgroundColor:P.posBg, textFormat:{ foregroundColor:P.posText, bold:true } } } }, index:0 } },
    { addConditionalFormatRule: { rule: { ranges:[{ sheetId:sid, startRowIndex:r0, endRowIndex:r1, startColumnIndex:col, endColumnIndex:col+1 }], booleanRule: { condition:{ type:'NUMBER_LESS',    values:[{ userEnteredValue:'0' }] }, format:{ backgroundColor:P.negBg, textFormat:{ foregroundColor:P.negText, bold:true } } } }, index:0 } },
  ];
}

// ── cleanup helpers ───────────────────────────────────────────────

async function cleanSheet(sheets, sheetId) {
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  const s = meta.data.sheets.find(x => x.properties.sheetId === sheetId);
  const reqs = [];
  (s?.bandedRanges || []).forEach(b => reqs.push({ deleteBanding: { bandedRangeId: b.bandedRangeId } }));
  const cfCount = (s?.conditionalFormats || []).length;
  for (let i = 0; i < cfCount; i++) reqs.push({ deleteConditionalFormatRule: { sheetId, index: 0 } });
  if (reqs.length > 0) await sheets.spreadsheets.batchUpdate({ spreadsheetId: SHEET_ID, requestBody: { requests: reqs } });
}

// ── Tab formatters ────────────────────────────────────────────────

async function formatKey(sheets, sid) {
  await cleanSheet(sheets, sid);
  await sheets.spreadsheets.batchUpdate({ spreadsheetId: SHEET_ID, requestBody: { requests: [
    { updateCells: { range:{ sheetId:sid }, fields:'userEnteredFormat', rows:[] } },
    baseStyle(sid),
    // Dark banner across top (rows 0-3)
    rc(sid, 0, 4, 0, 8, { backgroundColor:P.h1 }, 'userEnteredFormat.backgroundColor'),
    // Header row (row 4)
    mainHeader(sid, 4, 1, 6),
    // Data rows 5-7
    dataRow(sid, 5, 8, 1, 6),
    // Color swatches
    rc(sid, 5, 6, 1, 2, { backgroundColor:rgb(60,60,60) }, 'userEnteredFormat.backgroundColor'),
    rc(sid, 6, 7, 1, 2, { backgroundColor:rgb(240,240,240) }, 'userEnteredFormat.backgroundColor'),
    rc(sid, 7, 8, 1, 2, { backgroundColor:P.posBg }, 'userEnteredFormat.backgroundColor'),
    // Notes row (row 9)
    rc(sid, 9, 10, 0, 8, { backgroundColor:P.notesBg, textFormat:{ italic:true, fontSize:9, foregroundColor:P.muted, fontFamily:'Arial' } }, 'userEnteredFormat(backgroundColor,textFormat)'),
    // Widths
    cw(sid, 0,1,12), cw(sid, 1,2,140), cw(sid, 2,3,190), cw(sid, 3,4,12), cw(sid, 4,5,250), cw(sid, 5,6,170),
    // Heights
    rh(sid, 0,4,8), rh(sid, 4,5,34), rh(sid, 5,8,28), rh(sid, 8,9,8), rh(sid, 9,10,55),
  ]}});
}

async function formatTotal(sheets, sid) {
  await cleanSheet(sheets, sid);
  await sheets.spreadsheets.batchUpdate({ spreadsheetId: SHEET_ID, requestBody: { requests: [
    { updateCells: { range:{ sheetId:sid }, fields:'userEnteredFormat', rows:[] } },
    baseStyle(sid),

    // Section 1: Portfolio Performance (rows 0-3)
    mainHeader(sid, 0, 0, 3),   // left panel header
    mainHeader(sid, 0, 4, 8),   // right panel header
    sepColumn(sid, 3, 0, 20),   // separator column D
    dataRow(sid, 1, 4, 0, 3),
    dataRow(sid, 1, 4, 4, 8),

    // Thin dark divider (row 4 acts as subheader)
    subHeader(sid, 4, 0, 3),

    // Section 2: Type Allocation (rows 5-6)
    dataRow(sid, 5, 7, 0, 3),

    // Narrow dark spacer between sections
    thinDivider(sid, 7, 0, 8),
    thinDivider(sid, 8, 0, 8),

    // Section 3: Sector Allocation (rows 9-13)
    subHeader(sid, 9, 0, 3),
    dataRow(sid, 10, 14, 0, 3),

    // P/L conditional formatting
    ...plCond(sid, 1, 14, 2),   // P/L col C
    ...plCond(sid, 1,  5, 6),   // Increase/Decrease col G

    // Right-align numbers
    rightAlign(sid, 1, 14, 1, 3),
    rightAlign(sid, 1,  5, 5, 8),

    freeze(sid, 1),
    cw(sid,0,1,185), cw(sid,1,2,120), cw(sid,2,3,120), cw(sid,3,4,12), cw(sid,4,5,160), cw(sid,5,6,130), cw(sid,6,7,140), cw(sid,7,8,170),
    rh(sid,0,1,34), rh(sid,1,4,28), rh(sid,4,5,28), rh(sid,5,7,28), rh(sid,7,9,4), rh(sid,9,10,28), rh(sid,10,14,28),
  ]}});
}

async function formatYearly(sheets, sid) {
  await cleanSheet(sheets, sid);
  await sheets.spreadsheets.batchUpdate({ spreadsheetId: SHEET_ID, requestBody: { requests: [
    { updateCells: { range:{ sheetId:sid }, fields:'userEnteredFormat', rows:[] } },
    baseStyle(sid),
    sepColumn(sid, 3, 0, 15),

    // 2025 block
    mainHeader(sid, 0, 0, 3),
    mainHeader(sid, 0, 4, 8),
    dataRow(sid, 1, 4, 0, 3),
    dataRow(sid, 1, 4, 4, 8),

    // Gap row – solid dark divider
    thinDivider(sid, 4, 0, 8),

    // 2026 block
    mainHeader(sid, 5, 0, 3),
    mainHeader(sid, 5, 4, 8),
    dataRow(sid, 6, 9, 0, 3),
    dataRow(sid, 6, 9, 4, 8),

    ...plCond(sid, 1, 9, 2),
    ...plCond(sid, 1, 9, 6),

    rightAlign(sid, 1, 9, 0, 3),
    rightAlign(sid, 1, 9, 4, 8),

    freeze(sid, 1),
    cw(sid,0,1,145), cw(sid,1,2,130), cw(sid,2,3,130), cw(sid,3,4,12), cw(sid,4,5,130), cw(sid,5,6,120), cw(sid,6,7,150), cw(sid,7,8,170),
    rh(sid,0,1,34), rh(sid,1,4,28), rh(sid,4,5,4), rh(sid,5,6,34), rh(sid,6,9,28),
  ]}});
}

async function formatCurrent(sheets, sid) {
  await cleanSheet(sheets, sid);
  await sheets.spreadsheets.batchUpdate({ spreadsheetId: SHEET_ID, requestBody: { requests: [
    { updateCells: { range:{ sheetId:sid }, fields:'userEnteredFormat', rows:[] } },
    baseStyle(sid),

    mainHeader(sid, 0, 0, 10),
    mainHeader(sid, 0, 11, 23),
    sepColumn(sid, 10, 0, 25),

    // Active rows
    dataRow(sid, 1, 4, 0, 10),
    dataRow(sid, 1, 4, 11, 23),

    // Placeholder rows (light, still with borders)
    placeholderRow(sid, 4, 20, 0, 10),
    placeholderRow(sid, 4, 20, 11, 23),

    // Dark divider before totals
    thinDivider(sid, 20, 0, 23),

    // Total row
    totalRowStyle(sid, 21, 0, 10),
    totalRowStyle(sid, 21, 11, 23),

    // P/L: Unrealized Gain $ (col I=8), % (col J=9), Options $ (col U=20), % (col V=21)
    ...plCond(sid, 1, 22, 8),
    ...plCond(sid, 1, 22, 9),
    ...plCond(sid, 1, 22, 20),
    ...plCond(sid, 1, 22, 21),

    rightAlign(sid, 1, 22, 4, 10),
    rightAlign(sid, 1, 22, 12, 23),

    freeze(sid, 1),
    cw(sid,0,1,195), cw(sid,1,2,65), cw(sid,2,3,155), cw(sid,3,4,88), cw(sid,4,5,115), cw(sid,5,6,100), cw(sid,6,7,110), cw(sid,7,8,100), cw(sid,8,9,130), cw(sid,9,10,120),
    cw(sid,10,11,10), cw(sid,11,12,100), cw(sid,12,13,85), cw(sid,13,14,130), cw(sid,14,15,90), cw(sid,15,16,65), cw(sid,16,17,90), cw(sid,17,18,110), cw(sid,18,19,110), cw(sid,19,20,110), cw(sid,20,21,120), cw(sid,21,22,110),
    rh(sid,0,1,34), rh(sid,1,4,28), rh(sid,4,20,22), rh(sid,20,21,4), rh(sid,21,22,32),
  ]}});
}

async function formatPlanned(sheets, sid) {
  await cleanSheet(sheets, sid);
  await sheets.spreadsheets.batchUpdate({ spreadsheetId: SHEET_ID, requestBody: { requests: [
    { updateCells: { range:{ sheetId:sid }, fields:'userEnteredFormat', rows:[] } },
    baseStyle(sid),

    mainHeader(sid, 0, 0, 7),
    mainHeader(sid, 0, 8, 14),
    sepColumn(sid, 7, 0, 20),

    placeholderRow(sid, 1, 20, 0, 7),
    placeholderRow(sid, 1, 20, 8, 14),

    freeze(sid, 1),
    cw(sid,0,1,195), cw(sid,1,2,65), cw(sid,2,3,155), cw(sid,3,4,130), cw(sid,4,5,100), cw(sid,5,6,110), cw(sid,6,7,110),
    cw(sid,7,8,10), cw(sid,8,9,110), cw(sid,9,10,90), cw(sid,10,11,75), cw(sid,11,12,100), cw(sid,12,13,115), cw(sid,13,14,120),
    rh(sid,0,1,34), rh(sid,1,20,26),
  ]}});
}

async function formatHistory(sheets, sid) {
  await cleanSheet(sheets, sid);
  await sheets.spreadsheets.batchUpdate({ spreadsheetId: SHEET_ID, requestBody: { requests: [
    { updateCells: { range:{ sheetId:sid }, fields:'userEnteredFormat', rows:[] } },
    baseStyle(sid),

    mainHeader(sid, 0, 0, 9),
    mainHeader(sid, 0, 10, 17),
    sepColumn(sid, 9, 0, 25),

    // Active trades rows 1-9
    dataRow(sid, 1, 10, 0, 9),
    dataRow(sid, 1, 10, 10, 17),

    // Padding rows 10-15 (tiny height)
    placeholderRow(sid, 10, 16, 0, 9),
    placeholderRow(sid, 10, 16, 10, 17),

    // Options total (row index 16)
    totalRowStyle(sid, 16, 0, 9),
    totalRowStyle(sid, 16, 10, 17),

    // More padding 17-19 (tiny)
    placeholderRow(sid, 17, 20, 0, 9),
    placeholderRow(sid, 17, 20, 10, 17),

    // Dark divider before stocks total
    thinDivider(sid, 20, 0, 17),

    // Stocks total (row index 20)
    totalRowStyle(sid, 20, 0, 9),
    totalRowStyle(sid, 20, 10, 17),

    ...plCond(sid, 1, 21, 8),   // stock P/L col I
    ...plCond(sid, 1, 21, 16),  // options P/L col Q

    rightAlign(sid, 1, 21, 3, 9),
    rightAlign(sid, 1, 21, 11, 17),

    freeze(sid, 1),
    cw(sid,0,1,215), cw(sid,1,2,65), cw(sid,2,3,155), cw(sid,3,4,110), cw(sid,4,5,110), cw(sid,5,6,75), cw(sid,6,7,120), cw(sid,7,8,150), cw(sid,8,9,100),
    cw(sid,9,10,10), cw(sid,10,11,100), cw(sid,11,12,85), cw(sid,12,13,110), cw(sid,13,14,110), cw(sid,14,15,150), cw(sid,15,16,120), cw(sid,16,17,100),
    rh(sid,0,1,34), rh(sid,1,10,28), rh(sid,10,16,8), rh(sid,16,17,32), rh(sid,17,20,8), rh(sid,20,21,4), rh(sid,20,21,32),
  ]}});
}

// ── Main ─────────────────────────────────────────────────────────

async function main() {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  const tabMap = {};
  meta.data.sheets.forEach(s => { tabMap[s.properties.title] = s.properties.sheetId; });

  const jobs = [
    ['Key',                      formatKey],
    ['Total Portfolio Overview',  formatTotal],
    ['Yearly Overview',           formatYearly],
    ['Current Portfolio',         formatCurrent],
    ['Planned Trades',            formatPlanned],
    ['Trade History',             formatHistory],
  ];

  for (const [name, fn] of jobs) {
    console.log(`Formatting: ${name}...`);
    await fn(sheets, tabMap[name]);
  }

  console.log('\nDone.');
}

main().catch(e => { console.error(e.message); process.exit(1); });
