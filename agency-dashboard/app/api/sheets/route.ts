import { getCrmData } from "@/lib/sheets";

export async function GET() {
  const data = await getCrmData();
  if (!data) {
    return Response.json(
      {
        error:
          "CRM not connected. Set GOOGLE_SHEETS_ID in .env.local and share the sheet with the service account email.",
      },
      { status: 200 }
    );
  }
  return Response.json(data);
}
