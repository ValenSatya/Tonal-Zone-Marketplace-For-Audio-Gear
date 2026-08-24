import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, storeId, action } = body; // action: "APPROVE" | "REJECT"

    if (!email && !storeId) {
      return NextResponse.json(
        { success: false, error: "Email atau Store ID wajib diisi." },
        { status: 400 }
      );
    }

    const newStatus = action === "APPROVE" ? "APPROVED" : "REJECTED";
    const newRole = action === "APPROVE" ? "SELLER" : "BUYER";

    if (storeId) {
      const { data: store } = await supabase
        .from("Store")
        .update({ status: newStatus, updatedAt: new Date().toISOString() })
        .eq("id", storeId)
        .select("userId")
        .single();

      if (store?.userId) {
        await supabase
          .from("User")
          .update({ role: newRole, updatedAt: new Date().toISOString() })
          .eq("id", store.userId);
      }
    } else if (email) {
      const { data: user } = await supabase
        .from("User")
        .update({ role: newRole, updatedAt: new Date().toISOString() })
        .eq("email", email.trim().toLowerCase())
        .select("id")
        .single();

      if (user?.id) {
        await supabase
          .from("Store")
          .update({ status: newStatus, updatedAt: new Date().toISOString() })
          .eq("userId", user.id);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Toko berhasil di-${action === "APPROVE" ? "setujui" : "tolak"}.`,
      sellerStatus: newStatus,
      isSeller: action === "APPROVE",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Terjadi kesalahan internal." },
      { status: 500 }
    );
  }
}
