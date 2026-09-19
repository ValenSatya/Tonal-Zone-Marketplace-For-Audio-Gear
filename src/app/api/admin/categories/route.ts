import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-db";

export async function GET() {
  try {
    const { data: categories, error } = await supabase
      .from("Category")
      .select("id, name, createdAt, updatedAt")
      .order("name", { ascending: true });

    if (error) {
      console.warn("Could not fetch categories from Supabase:", error.message);
      return NextResponse.json({ success: true, categories: [] });
    }

    // Fetch real product count per category
    const { data: products } = await supabase
      .from("Product")
      .select("id, categoryId");

    const countMap: Record<string, number> = {};
    products?.forEach((p) => {
      if (p.categoryId) {
        countMap[p.categoryId] = (countMap[p.categoryId] || 0) + 1;
      }
    });

    const mapped = (categories || []).map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
      description: `Katalog resmi untuk kategori ${cat.name} di marketplace audio TonalZone.`,
      itemCount: countMap[cat.id] || 0,
      createdAt: cat.createdAt,
    }));

    return NextResponse.json({
      success: true,
      categories: mapped,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Failed to fetch categories";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, slug, description } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: "Nama kategori wajib diisi" }, { status: 400 });
    }

    const formattedName = name.trim().toUpperCase();
    const generatedSlug = slug?.trim() || formattedName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    const now = new Date().toISOString();

    const payload = {
      id: `cat-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      name: formattedName,
      createdAt: now,
      updatedAt: now,
    };

    const { data, error } = await supabase
      .from("Category")
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error("Supabase insert category error:", error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      category: {
        id: data.id,
        name: data.name,
        slug: generatedSlug,
        description: description || `Katalog resmi untuk kategori ${data.name} di marketplace audio TonalZone.`,
        itemCount: 0,
        createdAt: data.createdAt,
      },
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Failed to create category";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, name, slug, description } = body;

    if (!id || !name) {
      return NextResponse.json({ success: false, error: "ID dan Nama kategori wajib diisi" }, { status: 400 });
    }

    const formattedName = name.trim().toUpperCase();
    const generatedSlug = slug?.trim() || formattedName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

    const { data, error } = await supabase
      .from("Category")
      .update({ name: formattedName, updatedAt: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase update category error:", error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Get product count
    const { count } = await supabase
      .from("Product")
      .select("id", { count: "exact", head: true })
      .eq("categoryId", id);

    return NextResponse.json({
      success: true,
      category: {
        id: data.id,
        name: data.name,
        slug: generatedSlug,
        description: description || `Katalog resmi untuk kategori ${data.name} di marketplace audio TonalZone.`,
        itemCount: count || 0,
        createdAt: data.createdAt,
      },
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Failed to update category";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "ID kategori wajib disertakan" }, { status: 400 });
    }

    const { error } = await supabase.from("Category").delete().eq("id", id);

    if (error) {
      console.error("Supabase delete category error:", error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Kategori berhasil dihapus" });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Failed to delete category";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
