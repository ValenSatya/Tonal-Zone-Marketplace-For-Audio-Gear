import { NextResponse } from "next/server";
import { supabase, userRepo } from "@/lib/supabase-db";

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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, name, role, location, tuningPreference, status } = body;

    if (!email) {
      return NextResponse.json({ success: false, error: "Email wajib diisi" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const roleDb = (role || "BUYER").toString().toUpperCase() as "BUYER" | "SELLER" | "ADMIN";

    const dbUser = await userRepo.upsert({
      email: cleanEmail,
      name: name || cleanEmail.split("@")[0],
      role: roleDb,
      location: location || "Indonesia",
      tuningPreference: tuningPreference || "Reference / Neutral",
    });

    return NextResponse.json({
      success: true,
      user: {
        ...dbUser,
        status: status || "Active",
      },
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Failed to create user";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, email, name, role, location, tuningPreference, status } = body;

    if (!id && !email) {
      return NextResponse.json({ success: false, error: "ID atau Email pengguna wajib diisi" }, { status: 400 });
    }

    const updates: any = {
      updatedAt: new Date().toISOString(),
    };

    if (name) updates.name = name;
    if (location) updates.location = location;
    if (tuningPreference) updates.tuningPreference = tuningPreference;
    if (role) {
      const r = role.toString().toUpperCase();
      updates.role = r.includes("ADMIN") ? "ADMIN" : r.includes("SELLER") ? "SELLER" : "BUYER";
    }

    let query = supabase.from("User").update(updates);
    if (id) {
      query = query.eq("id", id);
    } else if (email) {
      query = query.eq("email", email.trim().toLowerCase());
    }

    const { data, error } = await query.select("*, store:Store(*)").maybeSingle();

    if (error) {
      console.error("Supabase user update error:", error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      user: data || { id, email, name, role, location, tuningPreference, status },
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Failed to update user";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "User ID wajib disertakan" }, { status: 400 });
    }

    const { error } = await supabase.from("User").delete().eq("id", id);

    if (error) {
      console.error("Supabase user delete error:", error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Pengguna berhasil dihapus" });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Failed to delete user";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

