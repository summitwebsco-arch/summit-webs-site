const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  keyFile: './credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const PORTFOLIO_ID = '197qkXcwXKHJ0jvAHTYa7LIEJxOedGKl7XwQfboDjzoc';
const JOURNAL_ID   = '1QAiTe-C6OU9-IQloQchp-8EKEiW8vNcWzt34Ikx93bs';

const rgb = (r, g, b) => ({ red: r/255, green: g/255, blue: b/255 });

const BORDER_OUTER = { style: 'SOLID_MEDIUM', color: rgb(71, 85, 105) };
const BORDER_INNER = { style: 'SOLID',        color: rgb(203, 213, 225) };
const BORDER_HDR   = { style: 'SOLID_MEDIUM', color: rgb(255, 255, 255) };

function tableBorder(sid, r0, r1, c0, c1) {
  return {
    updateBorders: {
      range: { sheetId:sid, startRowIndex:r0, endRowIndex:r1, startColumnIndex:c0, endColumnIndex:c1 },
      top: BORDER_OUTER, bottom: BORDER_OUTER, left: BORDER_OUTER, right: BORDER_OUTER,
      innerHorizontal: BORDER_INNER,
      innerVertical:   BORDER_INNER,
    },
  };
}

function headerUnderline(sid, r, c0, c1) {
  return {
    updateBorders: {
      range: { sheetId:sid, startRowIndex:r, endRowIndex:r+1, startColumnIndex:c0, endColumnIndex:c1 },
      bottom: BORDER_HDR,
    },
  };
}

const cw = (sid, c0, c1, px) => ({ updateDimensionProperties: { range:{ sheetId:sid, dimension:'COLUMNS', startIndex:c0, endIndex:c1 }, properties:{ pixelSize:px }, fields:'pixelSize' } });
const rh = (sid, r0, r1, px) => ({ updateDimensionProperties: { range:{ sheetId:sid, dimension:'ROWS',    startIndex:r0, endIndex:r1 }, properties:{ pixelSize:px }, fields:'pixelSize' } });

async function apply(sheets, id, reqs) {
  if (reqs.length) await sheets.spreadsheets.batchUpdate({ spreadsheetId:id, requestBody:{ requests:reqs } });
}

async function getTabs(sheets, id) {
  const m = await sheets.spreadsheets.get({ spreadsheetId:id });
  const t = {};
  m.data.sheets.forEach(s => { t[s.properties.title] = s.properties.sheetId; });
  return t;
}

// ── Portfolio: fix smushed columns ────────────────────────────────

async function fixPortfolioWidths(sheets, tabs) {

  // TOTAL PORTFOLIO OVERVIEW
  const ov = tabs['Total Portfolio Overview'];
  await apply(sheets, PORTFOLIO_ID, [
    cw(ov, 0,1,210), cw(ov, 1,2,130), cw(ov, 2,3,130),
    cw(ov, 3,4,10),
    cw(ov, 4,5,120), cw(ov, 5,6,140), cw(ov, 6,7,150), cw(ov, 7,8,180),
  ]);
  console.log('  Total Portfolio Overview ✓');

  // YEARLY OVERVIEW
  const yr = tabs['Yearly Overview'];
  await apply(sheets, PORTFOLIO_ID, [
    cw(yr, 0,1,155), cw(yr, 1,2,135), cw(yr, 2,3,130),
    cw(yr, 3,4,10),
    cw(yr, 4,5,110), cw(yr, 5,6,125), cw(yr, 6,7,145), cw(yr, 7,8,175),
  ]);
  console.log('  Yearly Overview ✓');

  // CURRENT PORTFOLIO
  const cp = tabs['Current Portfolio'];
  await apply(sheets, PORTFOLIO_ID, [
    // Stocks
    cw(cp, 0,1,210), cw(cp, 1,2,75),  cw(cp, 2,3,170),
    cw(cp, 3,4,100), cw(cp, 4,5,120), cw(cp, 5,6,110),
    cw(cp, 6,7,120), cw(cp, 7,8,110), cw(cp, 8,9,140), cw(cp, 9,10,130),
    cw(cp, 10,11,10),
    // Options
    cw(cp, 11,12,110), cw(cp, 12,13,100), cw(cp, 13,14,140),
    cw(cp, 14,15,100), cw(cp, 15,16,75),  cw(cp, 16,17,100),
    cw(cp, 17,18,120), cw(cp, 18,19,120), cw(cp, 19,20,120),
    cw(cp, 20,21,130), cw(cp, 21,22,120),
  ]);
  console.log('  Current Portfolio ✓');

  // PLANNED TRADES
  const pt = tabs['Planned Trades'];
  await apply(sheets, PORTFOLIO_ID, [
    cw(pt, 0,1,210), cw(pt, 1,2,75),  cw(pt, 2,3,170),
    cw(pt, 3,4,140), cw(pt, 4,5,110), cw(pt, 5,6,120), cw(pt, 6,7,120),
    cw(pt, 7,8,10),
    cw(pt, 8,9,110), cw(pt, 9,10,100), cw(pt, 10,11,80),
    cw(pt, 11,12,110), cw(pt, 12,13,120), cw(pt, 13,14,130),
  ]);
  console.log('  Planned Trades ✓');

  // TRADE HISTORY
  const th = tabs['Trade History'];
  await apply(sheets, PORTFOLIO_ID, [
    cw(th, 0,1,230), cw(th, 1,2,75),  cw(th, 2,3,170),
    cw(th, 3,4,115), cw(th, 4,5,115), cw(th, 5,6,80),
    cw(th, 6,7,130), cw(th, 7,8,160), cw(th, 8,9,110),
    cw(th, 9,10,10),
    cw(th, 10,11,110), cw(th, 11,12,95), cw(th, 12,13,115),
    cw(th, 13,14,115), cw(th, 14,15,160), cw(th, 15,16,130), cw(th, 16,17,110),
  ]);
  console.log('  Trade History ✓');
}

// ── Journal: fix widths + extend tables for future trades ─────────

async function fixJournalTabs(sheets, tabs) {

  // SUMMARY — fix widths
  const sm = tabs['Summary'];
  await apply(sheets, JOURNAL_ID, [
    cw(sm, 0,1,200), cw(sm, 1,2,140), cw(sm, 2,3,145),
    cw(sm, 3,4,140), cw(sm, 4,5,140),
  ]);
  console.log('  Summary ✓');

  // Column widths for all 3 trading tabs
  //  Trade#  Date   Time  Symbol  Side  Entry   SL      TP     Exit   R/R   Result  P&L   Notes  Photo
  const journalCols = [
    [0,1,80], [1,2,115], [2,3,85], [3,4,95], [4,5,100],
    [5,6,115], [6,7,115], [7,8,115], [8,9,115],
    [9,10,95], [10,11,100], [11,12,90],
    [12,13,220], [13,14,140],
  ];

  // EXTEND tables — use 200 rows so user always has room to add trades
  const EXTEND_TO = 200;

  for (const [name] of [['Backtesting'], ['Forward Testing'], ['Live Account']]) {
    const sid = tabs[name];
    await apply(sheets, JOURNAL_ID, [
      // Redraw table border to cover 200 rows
      tableBorder(sid, 0, EXTEND_TO, 0, 14),
      headerUnderline(sid, 0, 0, 14),
      // Header row height
      rh(sid, 0, 1, 38),
      // All data + future rows: consistent height
      rh(sid, 1, EXTEND_TO, 30),
      // Column widths
      ...journalCols.map(([c0,c1,px]) => cw(sid, c0, c1, px)),
    ]);
    console.log(`  ${name} ✓`);
  }
}

// ── Main ───────────────────────────────────────────────────────────

async function main() {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const [ptabs, jtabs] = await Promise.all([
    getTabs(sheets, PORTFOLIO_ID),
    getTabs(sheets, JOURNAL_ID),
  ]);

  console.log('Fixing portfolio column widths:');
  await fixPortfolioWidths(sheets, ptabs);

  console.log('Fixing journal tabs:');
  await fixJournalTabs(sheets, jtabs);

  console.log('\nAll done.');
}

main().catch(e => { console.error(e.message); process.exit(1); });
