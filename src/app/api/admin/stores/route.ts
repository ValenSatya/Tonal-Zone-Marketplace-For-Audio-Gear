import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-db";

export async function GET() {
  try {
    const { data: stores, error } = await supabase
      .from("Store")
      .select("*, user:User(*)")
      .order("createdAt", { ascending: false });

    if (error) {
      console.warn("Could not fetch stores from Supabase:", error.message);
      return NextResponse.json({ success: true, stores: [] });
    }

    return NextResponse.json({
      success: true,
      stores: stores || [],
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Failed to fetch stores";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
