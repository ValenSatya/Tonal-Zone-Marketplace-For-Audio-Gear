import { NextRequest, NextResponse } from "next/server";
import { userRepo } from "@/lib/supabase-db";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth/security";

async function resolveUserEmail(req: NextRequest, bodyEmail?: string): Promise<string | null> {
  if (bodyEmail && bodyEmail.trim()) {
    return bodyEmail.trim().toLowerCase();
  }

  const { searchParams } = new URL(req.url);
  const paramEmail = searchParams.get("email");
  if (paramEmail && paramEmail.trim()) {
    return paramEmail.trim().toLowerCase();
  }

  try {
    const cookieStore = await cookies();
    const rawSession = cookieStore.get("tonalzone_session")?.value;
    if (rawSession) {
      const session = verifySession<{ email?: string }>(rawSession);
      if (session?.email) {
        return session.email.trim().toLowerCase();
      }
    }
  } catch {
    // ignore parse error
  }

  return null;
}

export async function GET(req: NextRequest) {
  try {
    const email = await resolveUserEmail(req);
    if (!email) {
      return NextResponse.json(
        { success: false, error: "Identitas pengguna (email) tidak ditemukan.", addresses: [], defaultAddress: null },
        { status: 401 }
      );
    }

    const addresses = await userRepo.getAddresses(email);
    const defaultAddress = await userRepo.getDefaultAddress(email);

    return NextResponse.json({
      success: true,
      email,
      addresses,
      defaultAddress,
    });
  } catch (error: any) {
    console.error("[API Address GET] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal mengambil data alamat.", addresses: [] },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = await resolveUserEmail(req, body.email);

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Identitas pengguna (email) diperlukan untuk menyimpan alamat." },
        { status: 400 }
      );
    }

    // Action: Set Default
    if (body.action === "SET_DEFAULT" && body.addressId) {
      const ok = await userRepo.setDefaultAddress(email, body.addressId);
      const addresses = await userRepo.getAddresses(email);
      const defaultAddress = await userRepo.getDefaultAddress(email);
      return NextResponse.json({
        success: ok,
        message: ok ? "Alamat utama berhasil diperbarui." : "Alamat tidak ditemukan.",
        addresses,
        defaultAddress,
      });
    }

    const { address } = body;
    if (!address || !address.street || !address.city) {
      return NextResponse.json(
        { success: false, error: "Data alamat tidak lengkap (jalan dan kota wajib diisi)." },
        { status: 400 }
      );
    }

    const savedAddress = await userRepo.saveAddress(email, {
      id: address.id,
      label: address.label || "Alamat Utama",
      recipientName: address.recipientName || email.split("@")[0],
      phone: address.phone || "",
      street: address.street,
      city: address.city,
      province: address.province || "DKI Jakarta",
      postalCode: address.postalCode || "10110",
      country: address.country || "Indonesia",
      isDefault: address.isDefault,
    });

    const addresses = await userRepo.getAddresses(email);
    const defaultAddress = await userRepo.getDefaultAddress(email);

    return NextResponse.json({
      success: true,
      message: "Alamat berhasil disimpan ke profil akun.",
      address: savedAddress,
      addresses,
      defaultAddress,
    });
  } catch (error: any) {
    console.error("[API Address POST] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal menyimpan alamat." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { searchParams } = new URL(req.url);
    const addressId = body.addressId || searchParams.get("addressId");
    const email = await resolveUserEmail(req, body.email);

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Identitas pengguna (email) diperlukan." },
        { status: 400 }
      );
    }

    if (!addressId) {
      return NextResponse.json(
        { success: false, error: "ID alamat yang akan dihapus diperlukan." },
        { status: 400 }
      );
    }

    const ok = await userRepo.deleteAddress(email, addressId);
    const addresses = await userRepo.getAddresses(email);
    const defaultAddress = await userRepo.getDefaultAddress(email);

    return NextResponse.json({
      success: ok,
      message: ok ? "Alamat berhasil dihapus dari profil." : "Alamat tidak ditemukan.",
      addresses,
      defaultAddress,
    });
  } catch (error: any) {
    console.error("[API Address DELETE] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal menghapus alamat." },
      { status: 500 }
    );
  }
}
