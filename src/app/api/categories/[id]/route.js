// src/app/api/categories/[id]/route.js
import { NextResponse } from "next/server";
import {
  findCategoryById,
  findCategoryByName,
  findCategoryBySlug,
  updateCategoryById,
  deleteCategoryById,
} from "@/lib/queries/categories";

export async function GET(_req, ctx) {
  try {
    const { id: idParam } = await ctx.params;
    const id = Number(idParam);
    if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const cat = await findCategoryById(id);
    if (!cat) return NextResponse.json({ error: "Category not found" }, { status: 404 });

    return NextResponse.json(cat, { status: 200 });
  } catch (err) {
    console.error("get category error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req, ctx) {
  try {
    const { id: idParam } = await ctx.params;
    const id = Number(idParam);
    if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const existing = await findCategoryById(id);
    if (!existing) return NextResponse.json({ error: "Category not found" }, { status: 404 });

    const body = await req.json();
    const fields = {};

    if (body.name !== undefined) {
      const newName = String(body.name).trim();
      if (!newName) return NextResponse.json({ error: "name cannot be empty" }, { status: 400 });
      if (newName !== existing.name) {
        const taken = await findCategoryByName(newName);
        if (taken) return NextResponse.json({ error: "name already exists" }, { status: 409 });
      }
      fields.name = newName;
    }

    if (body.slug !== undefined) {
      const newSlug = String(body.slug).trim().toLowerCase();
      if (!/^[a-z0-9-]+$/.test(newSlug)) {
        return NextResponse.json({ error: "slug must be lowercase letters, numbers, dashes" }, { status: 400 });
      }
      if (newSlug !== existing.slug) {
        const taken = await findCategoryBySlug(newSlug);
        if (taken) return NextResponse.json({ error: "slug already exists" }, { status: 409 });
      }
      fields.slug = newSlug;
    }

    const { changed } = await updateCategoryById(id, fields);
    return NextResponse.json({ message: "Category updated", changed }, { status: 200 });
  } catch (err) {
    console.error("update category error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req, ctx) {
  try {
    const { id: idParam } = await ctx.params;
    const id = Number(idParam);
    if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const existing = await findCategoryById(id);
    if (!existing) return NextResponse.json({ error: "Category not found" }, { status: 404 });

    const { deleted } = await deleteCategoryById(id);
    return NextResponse.json({ message: "Category deleted", deleted }, { status: 200 });
  } catch (err) {
    console.error("delete category error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
