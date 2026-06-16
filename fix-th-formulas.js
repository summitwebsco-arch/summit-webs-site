const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  keyFile: './credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const PORTFOLIO_ID = '197qkXcwXKHJ0jvAHTYa7LIEJxOedGKl7XwQfboDjzoc';

async function main() {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  // Build formula arrays for rows 2-50 (sheet rows, idx 1-49)
  // Stocks cols: G=Purchase Value, I=P/L
  // Options cols: P=Purchase Value, Q=P/L
  const G = [], I = [], P = [], Q = [];
  for (let n = 2; n <= 50; n++) {
    G.push([`=IF(D${n}="","",D${n}*F${n})`]);
    I.push([`=IF(D${n}="","", (E${n}-D${n})*F${n})`]);
    P.push([`=IF(L${n}="","", (M${n}*100)*L${n})`]);
    Q.push([`=IF(L${n}="","", (N${n}-M${n})*L${n}*100)`]);
  }

  // Total row formulas (row 51 = idx 50)
  // Stocks: % gain = SUM(P/L) / SUM(Purchase Value), Amount = SUM(P/L)
  // Options: same pattern
  const totalRow = [
    ['Total Gain:', 'Percent -',
      '=IFERROR(SUM(I2:I50)/SUM(G2:G50),"—")',
      'Amount -',
      '=IFERROR(SUM(I2:I50),"—")',
      '', '', '', '', '',
      'Total Gain:', 'Percent -',
      '=IFERROR(SUM(Q2:Q50)/SUM(P2:P50),"—")',
      'Amount -',
      '=IFERROR(SUM(Q2:Q50),"—")',
    ],
  ];

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: PORTFOLIO_ID,
    requestBody: {
      valueInputOption: 'USER_ENTERED',
      data: [
        { range: 'Trade History!G2:G50', values: G },
        { range: 'Trade History!I2:I50', values: I },
        { range: 'Trade History!P2:P50', values: P },
        { range: 'Trade History!Q2:Q50', values: Q },
        { range: 'Trade History!A51:O51', values: totalRow },
      ],
    },
  });

  console.log('Formulas written to all 49 data rows + total row.');
}

main().catch(e => { console.error(e.message); process.exit(1); });
