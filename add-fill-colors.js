const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  keyFile: './credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const PORTFOLIO_ID = '197qkXcwXKHJ0jvAHTYa7LIEJxOedGKl7XwQfboDjzoc';
const JOURNAL_ID   = '1QAiTe-C6OU9-IQloQchp-8EKEiW8vNcWzt34Ikx93bs';

const rgb = (r, g, b) => ({ red: r/255, green: g/255, blue: b/255 });

// ── Color palette ─────────────────────────────────────────────────
const C = {
  white:      { red:1, green:1, blue:1 },
  whiteText:  { red:1, green:1, blue:1 },

  // Section headers
  equityHdr:  rgb(6, 95, 70),      // emerald-800   — stocks / equities
  optionHdr:  rgb(30, 58, 138),    // blue-900      — options / derivatives
  summaryHdr: rgb(15, 23, 42),     // slate-900     — overview tabs (keep dark)
  tealSub:    rgb(15, 118, 110),   // teal-700      — sub-section accent
  indigoSub:  rgb(67, 56, 202),    // indigo-700    — sub-section accent alt

  // Yearly overview year tints
  y2025Hdr:   rgb(120, 53, 15),    // amber-900     — 2025 block
  y2025Row:   rgb(255, 251, 235),  // amber-50      — 2025 data rows
  y2026Hdr:   rgb(49, 46, 129),    // indigo-900    — 2026 block
  y2026Row:   rgb(238, 242, 255),  // indigo-50     — 2026 data rows

  // Total Portfolio Overview section tints
  perfRow:    rgb(240, 249, 255),  // sky-50        — portfolio performance rows
  allocRow:   rgb(240, 253, 250),  // teal-50       — allocation rows

  // Trading Journal tab headers
  backtestHdr: rgb(120, 53, 15),   // amber-900     — backtesting (learning)
  forwardHdr:  rgb(49, 46, 129),   // indigo-900    — forward testing
  liveHdr:     rgb(6, 95, 70),     // emerald-800   — live account (real $)

  // Separators / misc
  sepDark:    rgb(15, 23, 42),
};

// ── Helpers ───────────────────────────────────────────────────────

function hdr(sheetId, r, c0, c1, bg) {
  return {
    repeatCell: {
      range: { sheetId, startRowIndex:r, endRowIndex:r+1, startColumnIndex:c0, endColumnIndex:c1 },
      cell: {
        userEnteredFormat: {
          backgroundColor: bg,
          textFormat: { bold:true, foregroundColor:C.white, fontFamily:'Arial', fontSize:10 },
          horizontalAlignment: 'CENTER',
          verticalAlignment: 'MIDDLE',
        },
      },
      fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)',
    },
  };
}

function fill(sheetId, r0, r1, c0, c1, bg) {
  return {
    repeatCell: {
      range: { sheetId, startRowIndex:r0, endRowIndex:r1, startColumnIndex:c0, endColumnIndex:c1 },
      cell: { userEnteredFormat: { backgroundColor: bg } },
      fields: 'userEnteredFormat.backgroundColor',
    },
  };
}

async function getTabMap(sheets, spreadsheetId) {
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const m = {};
  meta.data.sheets.forEach(s => { m[s.properties.title] = s.properties.sheetId; });
  return m;
}

// ── Portfolio Tracker ─────────────────────────────────────────────

async function colorPortfolio(sheets) {
  const tabs = await getTabMap(sheets, PORTFOLIO_ID);

  // ── Total Portfolio Overview ──────────────────────────────────
  const ov = tabs['Total Portfolio Overview'];
  const ovReqs = [
    // Main headers stay dark slate — add teal to sub-section headers
    hdr(ov, 4, 0, 3, C.tealSub),    // "Type" sub-header
    hdr(ov, 9, 0, 3, C.indigoSub),  // "Sector" sub-header

    // Very subtle tint on performance data rows (1-3)
    fill(ov, 1, 4, 0, 3, C.perfRow),
    fill(ov, 1, 4, 4, 8, C.perfRow),

    // Subtle tint on allocation rows (5-6 and 10-13)
    fill(ov, 5, 7, 0, 3, C.allocRow),
    fill(ov, 10, 14, 0, 3, C.allocRow),
  ];
  await sheets.spreadsheets.batchUpdate({ spreadsheetId: PORTFOLIO_ID, requestBody: { requests: ovReqs } });
  console.log('Total Portfolio Overview: colored');

  // ── Yearly Overview ───────────────────────────────────────────
  const yr = tabs['Yearly Overview'];
  const yrReqs = [
    // 2025 block — amber theme
    hdr(yr, 0, 0, 4, C.y2025Hdr),
    hdr(yr, 0, 4, 8, C.y2025Hdr),
    fill(yr, 1, 4, 0, 4, C.y2025Row),
    fill(yr, 1, 4, 4, 8, C.y2025Row),

    // 2026 block — indigo theme
    hdr(yr, 5, 0, 4, C.y2026Hdr),
    hdr(yr, 5, 4, 8, C.y2026Hdr),
    fill(yr, 6, 9, 0, 4, C.y2026Row),
    fill(yr, 6, 9, 4, 8, C.y2026Row),
  ];
  await sheets.spreadsheets.batchUpdate({ spreadsheetId: PORTFOLIO_ID, requestBody: { requests: yrReqs } });
  console.log('Yearly Overview: colored');

  // ── Current Portfolio ─────────────────────────────────────────
  const cp = tabs['Current Portfolio'];
  const cpReqs = [
    hdr(cp, 0, 0, 10, C.equityHdr),   // EQUITIES — green
    hdr(cp, 0, 11, 23, C.optionHdr),  // OPTIONS  — blue
  ];
  await sheets.spreadsheets.batchUpdate({ spreadsheetId: PORTFOLIO_ID, requestBody: { requests: cpReqs } });
  console.log('Current Portfolio: colored');

  // ── Planned Trades ────────────────────────────────────────────
  const pt = tabs['Planned Trades'];
  const ptReqs = [
    hdr(pt, 0, 0, 7,  C.equityHdr),  // EQUITIES — green
    hdr(pt, 0, 8, 14, C.optionHdr),  // OPTIONS  — blue
  ];
  await sheets.spreadsheets.batchUpdate({ spreadsheetId: PORTFOLIO_ID, requestBody: { requests: ptReqs } });
  console.log('Planned Trades: colored');

  // ── Trade History ─────────────────────────────────────────────
  const th = tabs['Trade History'];
  const thReqs = [
    hdr(th, 0, 0, 9,  C.equityHdr),  // EQUITIES — green
    hdr(th, 0, 10, 17, C.optionHdr), // OPTIONS  — blue
  ];
  await sheets.spreadsheets.batchUpdate({ spreadsheetId: PORTFOLIO_ID, requestBody: { requests: thReqs } });
  console.log('Trade History: colored');
}

// ── Trading Journal ───────────────────────────────────────────────

async function colorJournal(sheets) {
  const tabs = await getTabMap(sheets, JOURNAL_ID);

  const requests = [];

  // Backtesting — amber (you're still learning, paper trading)
  const bt = tabs['Backtesting'];
  requests.push(hdr(bt, 0, 0, 14, C.backtestHdr));

  // Forward Testing — indigo (bridging the gap)
  const ft = tabs['Forward Testing'];
  requests.push(hdr(ft, 0, 0, 14, C.forwardHdr));

  // Live Account — green (real money, real results)
  const la = tabs['Live Account'];
  requests.push(hdr(la, 0, 0, 14, C.liveHdr));

  // Summary — keep dark slate, but add color to the column header row (row 2)
  const sm = tabs['Summary'];
  requests.push(
    // Column headers row (index 2)
    hdr(sm, 2, 0, 5, C.tealSub),
    // Wins row (index 4) — subtle green tint on label
    fill(sm, 4, 5, 0, 1, rgb(220, 252, 231)),  // green-100
    // Losses row (index 5) — subtle red tint on label
    fill(sm, 5, 6, 0, 1, rgb(254, 226, 226)),  // red-100
    // Break Even row (index 6) — subtle amber tint on label
    fill(sm, 6, 7, 0, 1, rgb(254, 243, 199)),  // amber-100
    // Win Rate row (index 7) — subtle blue tint on label
    fill(sm, 7, 8, 0, 1, rgb(219, 234, 254)),  // blue-100
  );

  await sheets.spreadsheets.batchUpdate({ spreadsheetId: JOURNAL_ID, requestBody: { requests } });
  console.log('Trading Journal: colored');
}

// ── Main ──────────────────────────────────────────────────────────

async function main() {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  await colorPortfolio(sheets);
  await colorJournal(sheets);

  console.log('\nAll fill colors applied.');
}

main().catch(e => { console.error(e.message); process.exit(1); });
