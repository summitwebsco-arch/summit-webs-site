import { google } from "googleapis";
import path from "path";

export async function POST(request: Request) {
  const sheetId = process.env.GOOGLE_SHEETS_ID;
  if (!sheetId) {
    return Response.json({ error: "GOOGLE_SHEETS_ID not set." }, { status: 500 });
  }

  const { leads } = await request.json();
  if (!Array.isArray(leads) || leads.length === 0) {
    return Response.json({ error: "No leads provided." }, { status: 400 });
  }

  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: path.join(process.cwd(), "..", "credentials.json"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const sheets = google.sheets({ version: "v4", auth });

    const today = new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });

    const rows = leads.map((l: {
      business: string; contact?: string; email?: string; phone?: string; notes?: string;
    }) => [
      l.business ?? "",
      l.contact ?? "",
      l.email ?? "",
      l.phone ?? "",
      "New",
      today,
      l.notes ?? "",
    ]);

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: "Leads!A:G",
      valueInputOption: "USER_ENTERED",
      requestBody: { values: rows },
    });

    return Response.json({ added: rows.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
