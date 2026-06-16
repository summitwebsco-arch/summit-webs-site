const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  keyFile: './credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const SHEET_ID = '1QAiTe-C6OU9-IQloQchp-8EKEiW8vNcWzt34Ikx93bs';

async function testConnection() {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const res = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  console.log('Connected! Sheet title:', res.data.properties.title);
  console.log('Tabs found:');
  res.data.sheets.forEach(s => console.log(' -', s.properties.title));
}

testConnection().catch(err => console.error('Connection failed:', err.message));
