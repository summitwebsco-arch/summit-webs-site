const stripe  = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { google } = require('googleapis');

function getSheets() {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

exports.handler = async (event) => {
  // Verify Stripe signature
  const sig     = event.headers['stripe-signature'];
  const secret  = process.env.STRIPE_WEBHOOK_SECRET;

  let stripeEvent;
  try {
    stripeEvent = stripe.webhooks.constructEvent(event.body, sig, secret);
  } catch (err) {
    console.error('Webhook signature failed:', err.message);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  if (stripeEvent.type !== 'checkout.session.completed') {
    return { statusCode: 200, body: JSON.stringify({ received: true }) };
  }

  const session = stripeEvent.data.object;
  const email   = (session.customer_details?.email || session.customer_email || '').toLowerCase();

  // client_reference_id format: "CarePlan|CarePrice|BuildPlan"
  // e.g. "Growth|100|Pro Site"
  const ref        = session.client_reference_id || '';
  const [carePlan, carePrice, buildPlan] = ref.split('|');

  const sheetId = process.env.GOOGLE_SHEETS_ID;
  if (!sheetId || !email) {
    return { statusCode: 200, body: JSON.stringify({ received: true }) };
  }

  try {
    const sheets = getSheets();
    const today  = new Date().toISOString().split('T')[0];

    // Find lead row by email
    const leadsRes = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Leads!A:G',
    });

    const rows = leadsRes.data.values || [];
    let leadRowIndex = -1;
    let leadData     = null;

    for (let i = 1; i < rows.length; i++) {
      if ((rows[i][2] || '').toLowerCase() === email) {
        leadRowIndex = i + 1; // Sheets rows are 1-indexed
        leadData     = rows[i];
        break;
      }
    }

    // Update lead status → Won
    if (leadRowIndex > 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `Leads!E${leadRowIndex}:F${leadRowIndex}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [['Won', today]] },
      });
    }

    // Add to Clients sheet
    const businessName = leadData?.[0] || session.customer_details?.name || email;
    const contactName  = leadData?.[1] || session.customer_details?.name || '';
    const mrr          = carePrice || '50';
    const plan         = carePlan  || buildPlan || 'Essential';

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'Clients!A:E',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[businessName, contactName, plan, mrr, 'Active']],
      },
    });

    console.log(`Payment received: ${businessName} (${email}) — ${buildPlan} + ${carePlan}`);
  } catch (err) {
    console.error('Sheets update error:', err);
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) };
};
