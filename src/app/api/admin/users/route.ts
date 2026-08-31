import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-db";

export async function GET() {
  try {
    const { data: users, error } = await supabase
      .from("User")
      .select("*, store:Store(*)")
      .order("createdAt", { ascending: false });

    if (error) {
      console.warn("Could not fetch users from Supabase:", error.message);
      return NextResponse.json({ success: true, users: [] });
    }

    return NextResponse.json({
      success: true,
      users: users || [],
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Failed to fetch users";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
