import { NextRequest, NextResponse } from "next/server";
import { fetchLandingConfigFromDb, saveLandingConfigToDb } from "@/lib/landing-config";

export async function GET() {
  try {
    const config = await fetchLandingConfigFromDb();
    return NextResponse.json({ success: true, config });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Internal error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await saveLandingConfigToDb(body);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true, message: "Configuration saved successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed to update config" }, { status: 500 });
  }
}
