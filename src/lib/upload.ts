/**
 * Client-side upload utility for sending media files to /api/upload.
 * Replaces cumbersome base64 strings with lightweight, CDN-ready static URLs.
 */
export async function uploadMedia(
  file: File,
  folder: "avatars" | "stores" | "products" | "reviews" | "banners" | "ktp" | "general" = "general"
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || "Gagal mengunggah file." };
    }

    return { success: true, url: data.url };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal mengunggah media." };
  }
}
