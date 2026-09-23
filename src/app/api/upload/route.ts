import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "application/pdf",
]);

const EXTENSION_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
  "application/pdf": "pdf",
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folderRaw = (formData.get("folder") as string) || "general";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "File tidak ditemukan dalam request form data." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: "Ukuran file melebihi batas maksimal 10MB." },
        { status: 400 }
      );
    }

    const mimeType = file.type.toLowerCase();
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      return NextResponse.json(
        {
          success: false,
          error: `Format file tidak didukung (${file.type}). Format yang didukung: JPG, PNG, WEBP, GIF, SVG, PDF.`,
        },
        { status: 400 }
      );
    }

    // Clean folder parameter
    const folder = folderRaw.toLowerCase().replace(/[^a-z0-9_-]/g, "") || "general";

    // Determine extension & create unique filename
    const ext = EXTENSION_MAP[mimeType] || "bin";
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
    const cleanBaseName = file.name
      ? path.parse(file.name).name.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 30)
      : "upload";
    const filename = `${uniqueSuffix}-${cleanBaseName}.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    // 1. Attempt Supabase Storage upload if bucket is reachable
    try {
      const storagePath = `${folder}/${filename}`;
      const { data: uploadData, error: storageError } = await supabase.storage
        .from("public-assets")
        .upload(storagePath, buffer, {
          contentType: mimeType,
          upsert: true,
        });

      if (!storageError && uploadData) {
        const { data: urlData } = supabase.storage
          .from("public-assets")
          .getPublicUrl(storagePath);

        if (urlData?.publicUrl) {
          return NextResponse.json({
            success: true,
            url: urlData.publicUrl,
            storage: "supabase",
            filename,
            size: file.size,
            type: mimeType,
          });
        }
      }
    } catch (supaErr) {
      // Supabase storage bucket not configured or unreachable; fallback to local public storage
    }

    // 2. Local Filesystem Storage (public/uploads/{folder}/{filename})
    const uploadsDir = path.join(process.cwd(), "public", "uploads", folder);
    await fs.mkdir(uploadsDir, { recursive: true });

    const localFilePath = path.join(uploadsDir, filename);
    await fs.writeFile(localFilePath, buffer);

    const publicUrl = `/uploads/${folder}/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      storage: "local",
      filename,
      size: file.size,
      type: mimeType,
    });
  } catch (error: any) {
    console.error("[Upload API Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal mengunggah file." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fileUrl = searchParams.get("url");

    if (!fileUrl) {
      return NextResponse.json(
        { success: false, error: "Parameter url file wajib disertakan." },
        { status: 400 }
      );
    }

    // If local file: delete from public/uploads
    if (fileUrl.startsWith("/uploads/")) {
      const relativePath = fileUrl.replace(/^\/uploads\//, "");
      const sanitizedRelPath = path.normalize(relativePath).replace(/^(\.\.[\/\\])+/, "");
      const fullPath = path.join(process.cwd(), "public", "uploads", sanitizedRelPath);

      try {
        await fs.unlink(fullPath);
        return NextResponse.json({ success: true, message: "File berhasil dihapus dari storage lokal." });
      } catch (err: any) {
        if (err.code === "ENOENT") {
          return NextResponse.json({ success: true, message: "File sudah tidak ada." });
        }
        throw err;
      }
    }

    return NextResponse.json({ success: true, message: "Request hapus diterima." });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal menghapus file." },
      { status: 500 }
    );
  }
}
