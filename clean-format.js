const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  keyFile: './credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const PORTFOLIO_ID = '197qkXcwXKHJ0jvAHTYa7LIEJxOedGKl7XwQfboDjzoc';
const JOURNAL_ID   = '1QAiTe-C6OU9-IQloQchp-8EKEiW8vNcWzt34Ikx93bs';

const rgb = (r, g, b) => ({ red: r/255, green: g/255, blue: b/255 });

// ── Single design system ──────────────────────────────────────────
const D = {
  // Headers
  hdrDark:   rgb(15, 23, 42),       // slate-900  — default header
  hdrGreen:  rgb(20, 83, 45),       // green-900  — equities
  hdrBlue:   rgb(30, 58, 138),      // blue-900   — options
  hdrAmber:  rgb(120, 53, 15),      // amber-900  — backtesting
  hdrIndigo: rgb(49, 46, 129),      // indigo-900 — forward testing
  hdrWhite:  { red:1, green:1, blue:1 },

  // Data rows
  white:     { red:1, green:1, blue:1 },
  empty:     rgb(248, 250, 252),    // slate-50   — placeholder rows
  totalBg:   rgb(241, 245, 249),    // slate-100  — total/summary rows
  border:    rgb(226, 232, 240),    // slate-200  — row separator

  // Text
  textDark:  rgb(15, 23, 42),       // slate-900
  textMuted: rgb(100, 116, 139),    // slate-500

  // P/L
  posBg:     rgb(240, 253, 244),    // green-50
  posText:   rgb(21, 128, 61),      // green-700
  negBg:     rgb(254, 242, 242),    // red-50
  negText:   rgb(185, 28, 28),      // red-700

  // Separator column
  sepCol:    rgb(15, 23, 42),       // slate-900
};

const FONT = { fontFamily: 'Arial', fontSize: 10 };

// ── Request builders ──────────────────────────────────────────────

const cell = (sid, r0, r1, c0, c1, fmt, fields) => ({
  repeatCell: {
    range: { sheetId:sid, startRowIndex:r0, endRowIndex:r1, startColumnIndex:c0, endColumnIndex:c1 },
    cell: { userEnteredFormat: fmt },
    fields,
  },
});

const cw  = (sid, c0, c1, px) => ({ updateDimensionProperties: { range: { sheetId:sid, dimension:'COLUMNS', startIndex:c0, endIndex:c1 }, properties:{ pixelSize:px }, fields:'pixelSize' } });
const rh  = (sid, r0, r1, px) => ({ updateDimensionProperties: { range: { sheetId:sid, dimension:'ROWS',    startIndex:r0, endIndex:r1 }, properties:{ pixelSize:px }, fields:'pixelSize' } });
const frz = (sid, rows=1)     => ({ updateSheetProperties: { properties:{ sheetId:sid, gridProperties:{ frozenRowCount:rows } }, fields:'gridProperties.frozenRowCount' } });

// Base: reset entire sheet to clean slate
const base = (sid) => cell(sid, 0, 500, 0, 30, {
  backgroundColor: D.white,
  textFormat: { ...FONT, bold:false, foregroundColor:D.textDark },
  verticalAlignment: 'MIDDLE',
  wrapStrategy: 'CLIP',
  horizontalAlignment: 'LEFT',
  borders: {},
}, 'userEnteredFormat');

// Header row
const hdr = (sid, r, c0, c1, bg = D.hdrDark) => cell(sid, r, r+1, c0, c1, {
  backgroundColor: bg,
  textFormat: { ...FONT, bold:true, foregroundColor:D.hdrWhite },
  horizontalAlignment: 'CENTER',
  verticalAlignment: 'MIDDLE',
}, 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)');

// Data row (white + bottom border)
const dataRows = (sid, r0, r1, c0, c1) => cell(sid, r0, r1, c0, c1, {
  backgroundColor: D.white,
  borders: { bottom: { style:'SOLID', color:D.border } },
}, 'userEnteredFormat(backgroundColor,borders)');

// Placeholder row (empty slot — subtle grey)
const emptyRows = (sid, r0, r1, c0, c1) => cell(sid, r0, r1, c0, c1, {
  backgroundColor: D.empty,
  borders: { bottom: { style:'SOLID', color:D.border } },
  textFormat: { ...FONT, foregroundColor:D.textMuted },
}, 'userEnteredFormat(backgroundColor,borders,textFormat)');

// Total / summary row
const totalRow = (sid, r, c0, c1) => cell(sid, r, r+1, c0, c1, {
  backgroundColor: D.totalBg,
  textFormat: { ...FONT, bold:true, foregroundColor:D.textDark },
  borders: {
    top:    { style:'SOLID_MEDIUM', color:rgb(148,163,184) },
    bottom: { style:'SOLID_MEDIUM', color:rgb(148,163,184) },
  },
}, 'userEnteredFormat(backgroundColor,textFormat,borders)');

// Thin dark separator column
const sepColumn = (sid, col, r0=0, r1=100) => cell(sid, r0, r1, col, col+1, {
  backgroundColor: D.sepCol,
}, 'userEnteredFormat.backgroundColor');

// Right-align numbers
const right = (sid, r0, r1, c0, c1) => cell(sid, r0, r1, c0, c1, {
  horizontalAlignment: 'RIGHT',
}, 'userEnteredFormat.horizontalAlignment');

// Center-align short fields
const center = (sid, r0, r1, c0, c1) => cell(sid, r0, r1, c0, c1, {
  horizontalAlignment: 'CENTER',
}, 'userEnteredFormat.horizontalAlignment');

// Number format
const nf = (sid, r0, r1, c0, c1, fmt) => cell(sid, r0, r1, c0, c1, {
  numberFormat: fmt,
}, 'userEnteredFormat.numberFormat');

const CURRENCY = { type:'CURRENCY', pattern:'"$"#,##0.00' };
const PERCENT  = { type:'PERCENT',  pattern:'0.00%' };
const NUM2     = { type:'NUMBER',   pattern:'#,##0.00' };
const NUM4     = { type:'NUMBER',   pattern:'#,##0.0000' };

// Conditional P/L formatting (number-based)
const plCond = (sid, r0, r1, col) => [
  { addConditionalFormatRule: { rule: { ranges:[{ sheetId:sid, startRowIndex:r0, endRowIndex:r1, startColumnIndex:col, endColumnIndex:col+1 }], booleanRule: { condition:{ type:'NUMBER_GREATER', values:[{ userEnteredValue:'0' }] }, format:{ backgroundColor:D.posBg, textFormat:{ foregroundColor:D.posText, bold:true } } } }, index:0 } },
  { addConditionalFormatRule: { rule: { ranges:[{ sheetId:sid, startRowIndex:r0, endRowIndex:r1, startColumnIndex:col, endColumnIndex:col+1 }], booleanRule: { condition:{ type:'NUMBER_LESS',    values:[{ userEnteredValue:'0' }] }, format:{ backgroundColor:D.negBg, textFormat:{ foregroundColor:D.negText, bold:true } } } }, index:0 } },
];

// Conditional formatting for text P/L (cells that contain "$" and "-")
const plCondText = (sid, r0, r1, col) => [
  { addConditionalFormatRule: { rule: { ranges:[{ sheetId:sid, startRowIndex:r0, endRowIndex:r1, startColumnIndex:col, endColumnIndex:col+1 }], booleanRule: { condition:{ type:'TEXT_NOT_CONTAINS', values:[{ userEnteredValue:'-' }] }, format:{ backgroundColor:D.posBg, textFormat:{ foregroundColor:D.posText, bold:true } } } }, index:0 } },
  { addConditionalFormatRule: { rule: { ranges:[{ sheetId:sid, startRowIndex:r0, endRowIndex:r1, startColumnIndex:col, endColumnIndex:col+1 }], booleanRule: { condition:{ type:'TEXT_CONTAINS',     values:[{ userEnteredValue:'-' }] }, format:{ backgroundColor:D.negBg, textFormat:{ foregroundColor:D.negText, bold:true } } } }, index:0 } },
];

// Journal trade result coloring
const resultCond = (sid, r0, r1, col) => [
  { addConditionalFormatRule: { rule: { ranges:[{ sheetId:sid, startRowIndex:r0, endRowIndex:r1, startColumnIndex:col, endColumnIndex:col+1 }], booleanRule: { condition:{ type:'TEXT_EQ', values:[{ userEnteredValue:'Win' }]        }, format:{ backgroundColor:D.posBg, textFormat:{ foregroundColor:D.posText, bold:true } } } }, index:0 } },
  { addConditionalFormatRule: { rule: { ranges:[{ sheetId:sid, startRowIndex:r0, endRowIndex:r1, startColumnIndex:col, endColumnIndex:col+1 }], booleanRule: { condition:{ type:'TEXT_EQ', values:[{ userEnteredValue:'Loss' }]       }, format:{ backgroundColor:D.negBg, textFormat:{ foregroundColor:D.negText, bold:true } } } }, index:0 } },
  { addConditionalFormatRule: { rule: { ranges:[{ sheetId:sid, startRowIndex:r0, endRowIndex:r1, startColumnIndex:col, endColumnIndex:col+1 }], booleanRule: { condition:{ type:'TEXT_EQ', values:[{ userEnteredValue:'Break Even' }] }, format:{ backgroundColor:rgb(254,243,199), textFormat:{ foregroundColor:rgb(146,64,14), bold:true } } } }, index:0 } },
];

// ── Full reset ────────────────────────────────────────────────────

async function fullReset(sheets, spreadsheetId, sheetId) {
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const s = meta.data.sheets.find(x => x.properties.sheetId === sheetId);
  const reqs = [];
  (s?.bandedRanges     || []).forEach(b  => reqs.push({ deleteBanding:              { bandedRangeId: b.bandedRangeId } }));
  (s?.conditionalFormats || []).forEach((_,i) => reqs.push({ deleteConditionalFormatRule: { sheetId, index: 0 } }));
  if (reqs.length) await sheets.spreadsheets.batchUpdate({ spreadsheetId, requestBody:{ requests:reqs } });
}

// ── Tab formatters ────────────────────────────────────────────────

async function run(sheets, id, requests) {
  await sheets.spreadsheets.batchUpdate({ spreadsheetId:id, requestBody:{ requests } });
}

// KEY
async function fmtKey(sheets, sid) {
  await run(sheets, PORTFOLIO_ID, [
    base(sid),
    cell(sid, 0, 4, 0, 8, { backgroundColor:D.hdrDark }, 'userEnteredFormat.backgroundColor'),
    hdr(sid, 4, 1, 6),
    dataRows(sid, 5, 8, 1, 6),
    cell(sid, 5, 6, 1, 2, { backgroundColor:rgb(60,60,60)  }, 'userEnteredFormat.backgroundColor'),
    cell(sid, 6, 7, 1, 2, { backgroundColor:rgb(230,230,230) }, 'userEnteredFormat.backgroundColor'),
    cell(sid, 7, 8, 1, 2, { backgroundColor:D.posBg }, 'userEnteredFormat.backgroundColor'),
    cell(sid, 9, 10, 0, 8, { backgroundColor:rgb(254,252,232), textFormat:{ italic:true, fontSize:9, foregroundColor:D.textMuted, fontFamily:'Arial' } }, 'userEnteredFormat(backgroundColor,textFormat)'),
    rh(sid,0,4,6), rh(sid,4,5,34), rh(sid,5,8,28), rh(sid,8,9,8), rh(sid,9,10,52),
    cw(sid,0,1,14), cw(sid,1,2,140), cw(sid,2,3,200), cw(sid,3,4,14), cw(sid,4,5,260), cw(sid,5,6,170),
  ]);
}

// TOTAL PORTFOLIO OVERVIEW
async function fmtOverview(sheets, sid) {
  await run(sheets, PORTFOLIO_ID, [
    base(sid),
    hdr(sid, 0, 0, 3), hdr(sid, 0, 4, 8),
    sepColumn(sid, 3, 0, 14),
    dataRows(sid, 1, 4, 0, 3), dataRows(sid, 1, 4, 4, 8),
    hdr(sid, 4, 0, 3, rgb(30,41,59)),  // slate-800 sub-header
    dataRows(sid, 5, 7, 0, 3),
    cell(sid, 7, 9, 0, 8, { backgroundColor:D.hdrDark }, 'userEnteredFormat.backgroundColor'),
    hdr(sid, 9, 0, 3, rgb(30,41,59)),  // slate-800 sub-header
    dataRows(sid, 10, 14, 0, 3),
    ...plCond(sid, 1, 14, 2),
    ...plCond(sid, 1, 5,  6),
    right(sid, 1, 14, 1, 3), right(sid, 1, 5, 4, 8),
    nf(sid,1,4,0,1,CURRENCY), nf(sid,1,4,1,2,CURRENCY), nf(sid,1,4,2,3,CURRENCY),
    nf(sid,1,4,5,6,CURRENCY), nf(sid,1,4,6,7,PERCENT),  nf(sid,1,4,7,8,PERCENT),
    nf(sid,5,7,1,2,CURRENCY), nf(sid,5,7,2,3,PERCENT),
    nf(sid,10,14,1,2,CURRENCY), nf(sid,10,14,2,3,PERCENT),
    frz(sid),
    rh(sid,0,1,34), rh(sid,1,4,28), rh(sid,4,5,28), rh(sid,5,7,28), rh(sid,7,9,4), rh(sid,9,10,28), rh(sid,10,14,28),
    cw(sid,0,1,190), cw(sid,1,2,120), cw(sid,2,3,120), cw(sid,3,4,10), cw(sid,4,5,160), cw(sid,5,6,130), cw(sid,6,7,140), cw(sid,7,8,170),
  ]);
}

// YEARLY OVERVIEW
async function fmtYearly(sheets, sid) {
  await run(sheets, PORTFOLIO_ID, [
    base(sid),
    sepColumn(sid, 3, 0, 10),
    hdr(sid, 0, 0, 3, D.hdrAmber), hdr(sid, 0, 4, 8, D.hdrAmber),
    dataRows(sid, 1, 4, 0, 3), dataRows(sid, 1, 4, 4, 8),
    cell(sid, 4, 5, 0, 8, { backgroundColor:D.hdrDark }, 'userEnteredFormat.backgroundColor'),
    hdr(sid, 5, 0, 3, D.hdrIndigo), hdr(sid, 5, 4, 8, D.hdrIndigo),
    dataRows(sid, 6, 9, 0, 3), dataRows(sid, 6, 9, 4, 8),
    ...plCond(sid, 1, 9, 2), ...plCond(sid, 1, 9, 6),
    right(sid, 1, 9, 0, 3), right(sid, 1, 9, 4, 8),
    nf(sid,1,9,0,1,CURRENCY), nf(sid,1,9,1,2,CURRENCY), nf(sid,1,9,2,3,CURRENCY),
    nf(sid,1,9,5,6,CURRENCY), nf(sid,1,9,6,7,PERCENT),  nf(sid,1,9,7,8,PERCENT),
    frz(sid),
    rh(sid,0,1,34), rh(sid,1,4,28), rh(sid,4,5,4), rh(sid,5,6,34), rh(sid,6,9,28),
    cw(sid,0,1,150), cw(sid,1,2,130), cw(sid,2,3,130), cw(sid,3,4,10), cw(sid,4,5,100), cw(sid,5,6,120), cw(sid,6,7,140), cw(sid,7,8,170),
  ]);
}

// CURRENT PORTFOLIO
async function fmtCurrentPortfolio(sheets, sid) {
  await run(sheets, PORTFOLIO_ID, [
    base(sid),
    hdr(sid, 0, 0, 10, D.hdrGreen), hdr(sid, 0, 11, 23, D.hdrBlue),
    sepColumn(sid, 10, 0, 23),
    dataRows(sid, 1, 4, 0, 10), dataRows(sid, 1, 4, 11, 23),
    emptyRows(sid, 4, 20, 0, 10), emptyRows(sid, 4, 20, 11, 23),
    cell(sid, 20, 21, 0, 23, { backgroundColor:D.hdrDark }, 'userEnteredFormat.backgroundColor'),
    totalRow(sid, 21, 0, 10), totalRow(sid, 21, 11, 23),
    ...plCond(sid,1,22,8), ...plCond(sid,1,22,9), ...plCond(sid,1,22,20), ...plCond(sid,1,22,21),
    right(sid,1,22,4,10), right(sid,1,22,12,23),
    nf(sid,1,22,4,5,CURRENCY), nf(sid,1,22,5,6,CURRENCY), nf(sid,1,22,6,7,CURRENCY),
    nf(sid,1,22,7,8,NUM4),     nf(sid,1,22,8,9,CURRENCY), nf(sid,1,22,9,10,PERCENT),
    nf(sid,1,22,12,13,NUM2),   nf(sid,1,22,13,14,CURRENCY), nf(sid,1,22,16,17,CURRENCY),
    nf(sid,1,22,18,19,CURRENCY), nf(sid,1,22,19,20,CURRENCY),
    nf(sid,1,22,20,21,CURRENCY), nf(sid,1,22,21,22,PERCENT),
    nf(sid,21,22,2,3,PERCENT),  nf(sid,21,22,4,5,CURRENCY),
    nf(sid,21,22,13,14,PERCENT), nf(sid,21,22,15,16,CURRENCY),
    frz(sid),
    rh(sid,0,1,34), rh(sid,1,4,28), rh(sid,4,20,22), rh(sid,20,21,4), rh(sid,21,22,32),
    cw(sid,0,1,200), cw(sid,1,2,65), cw(sid,2,3,160), cw(sid,3,4,88), cw(sid,4,5,115),
    cw(sid,5,6,100), cw(sid,6,7,110), cw(sid,7,8,100), cw(sid,8,9,130), cw(sid,9,10,120),
    cw(sid,10,11,10), cw(sid,11,12,100), cw(sid,12,13,85), cw(sid,13,14,130),
    cw(sid,14,15,90), cw(sid,15,16,65), cw(sid,16,17,90), cw(sid,17,18,110),
    cw(sid,18,19,110), cw(sid,19,20,110), cw(sid,20,21,120), cw(sid,21,22,110),
  ]);
}

// PLANNED TRADES
async function fmtPlanned(sheets, sid) {
  await run(sheets, PORTFOLIO_ID, [
    base(sid),
    hdr(sid, 0, 0, 7, D.hdrGreen), hdr(sid, 0, 8, 14, D.hdrBlue),
    sepColumn(sid, 7, 0, 20),
    emptyRows(sid, 1, 20, 0, 7), emptyRows(sid, 1, 20, 8, 14),
    frz(sid),
    rh(sid,0,1,34), rh(sid,1,20,26),
    cw(sid,0,1,200), cw(sid,1,2,65), cw(sid,2,3,160), cw(sid,3,4,130),
    cw(sid,4,5,100), cw(sid,5,6,110), cw(sid,6,7,110),
    cw(sid,7,8,10), cw(sid,8,9,110), cw(sid,9,10,90),
    cw(sid,10,11,75), cw(sid,11,12,100), cw(sid,12,13,115), cw(sid,13,14,120),
  ]);
}

// TRADE HISTORY — 50 data/padding rows + total at row 50
async function fmtHistory(sheets, sid) {
  const DATA_END = 10, PAD_END = 50, TR = 50;
  await run(sheets, PORTFOLIO_ID, [
    base(sid),
    hdr(sid, 0, 0, 9, D.hdrGreen), hdr(sid, 0, 10, 17, D.hdrBlue),
    sepColumn(sid, 9, 0, TR + 1),
    dataRows(sid, 1, DATA_END, 0, 9),  dataRows(sid, 1, DATA_END, 10, 17),
    emptyRows(sid, DATA_END, PAD_END, 0, 9), emptyRows(sid, DATA_END, PAD_END, 10, 17),
    totalRow(sid, TR, 0, 9), totalRow(sid, TR, 10, 17),
    ...plCondText(sid, 1, TR + 1, 8), ...plCondText(sid, 1, TR + 1, 16),
    right(sid, 1, TR + 1, 3, 9),  right(sid, 1, TR + 1, 11, 17),
    nf(sid, 1, TR+1, 3, 4, CURRENCY), nf(sid, 1, TR+1, 4, 5, CURRENCY),
    nf(sid, 1, TR+1, 5, 6, NUM4),     nf(sid, 1, TR+1, 6, 7, CURRENCY),
    nf(sid, 1, DATA_END, 8, 9, CURRENCY),
    nf(sid, 1, TR+1, 11, 12, NUM2),   nf(sid, 1, TR+1, 12, 13, CURRENCY),
    nf(sid, 1, TR+1, 13, 14, CURRENCY), nf(sid, 1, TR+1, 15, 16, CURRENCY),
    nf(sid, 1, DATA_END, 16, 17, CURRENCY),
    nf(sid, TR, TR+1, 2, 3, PERCENT),  nf(sid, TR, TR+1, 4, 5, CURRENCY),
    nf(sid, TR, TR+1, 12, 13, PERCENT), nf(sid, TR, TR+1, 14, 15, CURRENCY),
    frz(sid),
    rh(sid, 0, 1, 34), rh(sid, 1, DATA_END, 28), rh(sid, DATA_END, PAD_END, 10), rh(sid, TR, TR+1, 32),
    cw(sid,0,1,220), cw(sid,1,2,65),  cw(sid,2,3,160), cw(sid,3,4,110),
    cw(sid,4,5,110), cw(sid,5,6,75),  cw(sid,6,7,120), cw(sid,7,8,150), cw(sid,8,9,100),
    cw(sid,9,10,10), cw(sid,10,11,100), cw(sid,11,12,85),
    cw(sid,12,13,110), cw(sid,13,14,110), cw(sid,14,15,150), cw(sid,15,16,120), cw(sid,16,17,100),
  ]);
}

// JOURNAL: SUMMARY
async function fmtSummary(sheets, sid) {
  await run(sheets, JOURNAL_ID, [
    base(sid),
    cell(sid, 0, 1, 0, 5, { backgroundColor:D.hdrDark, textFormat:{ bold:true, fontSize:13, foregroundColor:D.hdrWhite, fontFamily:'Arial' }, verticalAlignment:'MIDDLE' }, 'userEnteredFormat(backgroundColor,textFormat,verticalAlignment)'),
    hdr(sid, 2, 0, 5),
    dataRows(sid, 3, 8,  0, 5),
    cell(sid, 8, 9, 0, 5, { backgroundColor:D.hdrDark }, 'userEnteredFormat.backgroundColor'),
    dataRows(sid, 9, 12, 0, 5),
    cell(sid, 12, 13, 0, 5, { backgroundColor:D.hdrDark }, 'userEnteredFormat.backgroundColor'),
    dataRows(sid, 13, 14, 0, 5),
    cell(sid, 14, 15, 0, 5, { backgroundColor:D.hdrDark }, 'userEnteredFormat.backgroundColor'),
    cell(sid, 15, 17, 0, 5, { backgroundColor:rgb(254,252,232), textFormat:{ italic:true, fontSize:9, foregroundColor:D.textMuted, fontFamily:'Arial' } }, 'userEnteredFormat(backgroundColor,textFormat)'),
    right(sid, 3, 14, 1, 5),
    nf(sid,7,8,1,5,PERCENT),
    nf(sid,3,7,1,5,NUM2), nf(sid,9,12,1,5,NUM2), nf(sid,11,12,1,5,NUM2), nf(sid,13,14,1,5,NUM2),
    frz(sid, 3),
    rh(sid,0,1,42), rh(sid,1,2,8), rh(sid,2,3,30), rh(sid,3,8,28), rh(sid,8,9,4),
    rh(sid,9,12,28), rh(sid,12,13,4), rh(sid,13,14,28), rh(sid,14,15,4), rh(sid,15,17,40),
    cw(sid,0,1,185), cw(sid,1,2,130), cw(sid,2,3,140), cw(sid,3,4,130), cw(sid,4,5,130),
  ]);
}

// JOURNAL: TRADING TABS (Backtesting, Forward Testing, Live Account)
async function fmtTradingTab(sheets, sid, spreadsheetId, hdrColor, numDataRows) {
  const end = numDataRows + 1;
  await run(sheets, spreadsheetId, [
    base(sid),
    hdr(sid, 0, 0, 14, hdrColor),
    dataRows(sid, 1, end, 0, 14),
    ...resultCond(sid, 1, end, 10),  // Result col K (index 10)
    center(sid, 1, end, 0,  1),  // Trade #
    center(sid, 1, end, 1,  3),  // Date, Time
    center(sid, 1, end, 4,  5),  // Trade Side
    center(sid, 1, end, 10, 11), // Result
    right(sid,  1, end, 5,  9),  // prices
    right(sid,  1, end, 9,  12), // R/R and P&L
    nf(sid, 1, end, 5,  6,  CURRENCY), // Entry
    nf(sid, 1, end, 6,  7,  CURRENCY), // Stop Loss
    nf(sid, 1, end, 7,  8,  CURRENCY), // Take Profit
    nf(sid, 1, end, 8,  9,  CURRENCY), // Exit
    nf(sid, 1, end, 9,  10, NUM2),     // R/R
    nf(sid, 1, end, 11, 12, NUM2),     // P&L
    frz(sid),
    rh(sid, 0, 1, 34), rh(sid, 1, end, 28),
    cw(sid,0,1,75),  cw(sid,1,2,100), cw(sid,2,3,75),  cw(sid,3,4,90),
    cw(sid,4,5,90),  cw(sid,5,6,100), cw(sid,6,7,100), cw(sid,7,8,100),
    cw(sid,8,9,100), cw(sid,9,10,90), cw(sid,10,11,90), cw(sid,11,12,80),
    cw(sid,12,13,200), cw(sid,13,14,130),
  ]);
}

// ── Main ──────────────────────────────────────────────────────────

async function main() {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  // Get all tab IDs
  const [pmeta, jmeta] = await Promise.all([
    sheets.spreadsheets.get({ spreadsheetId: PORTFOLIO_ID }),
    sheets.spreadsheets.get({ spreadsheetId: JOURNAL_ID }),
  ]);

  const ptabs = {}, jtabs = {};
  pmeta.data.sheets.forEach(s => { ptabs[s.properties.title] = s.properties.sheetId; });
  jmeta.data.sheets.forEach(s => { jtabs[s.properties.title] = s.properties.sheetId; });

  // Full reset all tabs first
  console.log('Resetting all tabs...');
  const allTabs = [
    [PORTFOLIO_ID, ptabs['Key']],
    [PORTFOLIO_ID, ptabs['Total Portfolio Overview']],
    [PORTFOLIO_ID, ptabs['Yearly Overview']],
    [PORTFOLIO_ID, ptabs['Current Portfolio']],
    [PORTFOLIO_ID, ptabs['Planned Trades']],
    [PORTFOLIO_ID, ptabs['Trade History']],
    [JOURNAL_ID,   jtabs['Summary']],
    [JOURNAL_ID,   jtabs['Backtesting']],
    [JOURNAL_ID,   jtabs['Forward Testing']],
    [JOURNAL_ID,   jtabs['Live Account']],
  ];
  for (const [id, sid] of allTabs) await fullReset(sheets, id, sid);
  console.log('Reset complete.\n');

  // Apply formatting
  const jobs = [
    ['Key',                      () => fmtKey(sheets, ptabs['Key'])],
    ['Total Portfolio Overview',  () => fmtOverview(sheets, ptabs['Total Portfolio Overview'])],
    ['Yearly Overview',           () => fmtYearly(sheets, ptabs['Yearly Overview'])],
    ['Current Portfolio',         () => fmtCurrentPortfolio(sheets, ptabs['Current Portfolio'])],
    ['Planned Trades',            () => fmtPlanned(sheets, ptabs['Planned Trades'])],
    ['Trade History',             () => fmtHistory(sheets, ptabs['Trade History'])],
    ['Summary',                   () => fmtSummary(sheets, jtabs['Summary'])],
    ['Backtesting',               () => fmtTradingTab(sheets, jtabs['Backtesting'],      JOURNAL_ID, D.hdrAmber,  80)],
    ['Forward Testing',           () => fmtTradingTab(sheets, jtabs['Forward Testing'],  JOURNAL_ID, D.hdrIndigo,  4)],
    ['Live Account',              () => fmtTradingTab(sheets, jtabs['Live Account'],     JOURNAL_ID, D.hdrGreen,   9)],
  ];

  for (const [name, fn] of jobs) {
    process.stdout.write(`Formatting: ${name}...`);
    await fn();
    console.log(' done');
  }

  console.log('\nAll done. Both sheets are clean.');
}

main().catch(e => { console.error('\nError:', e.message); process.exit(1); });
