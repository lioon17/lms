// src/app/api/categories/route.js
import { NextResponse } from "next/server";
import { listCategories, createCategory, findCategoryBySlug, findCategoryByName } from "@/lib/queries/categories";

export async function GET() {
  try {
    const categories = await listCategories();
    return NextResponse.json(categories, { status: 200 });
  } catch (err) {
    console.error("list categories error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const name = String(body?.name || "").trim();
    const slug = String(body?.slug || "").trim().toLowerCase();

    if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });
    if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json({ error: "slug must be lowercase letters, numbers, dashes" }, { status: 400 });
    }

    const byName = await findCategoryByName(name);
    if (byName) return NextResponse.json({ error: "name already exists" }, { status: 409 });

    const bySlug = await findCategoryBySlug(slug);
    if (bySlug) return NextResponse.json({ error: "slug already exists" }, { status: 409 });

    const id = await createCategory({ name, slug });
    return NextResponse.json({ message: "Category created", id, name, slug }, { status: 201 });
  } catch (err) {
    console.error("create category error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
