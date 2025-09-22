// src/app/api/instructors/route.js
import { NextResponse } from "next/server";
import { listInstructors, countInstructors } from "@/lib/queries/users";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || 50)));
    const offset = (page - 1) * limit;

    const [data, total] = await Promise.all([
      listInstructors({ q, limit, offset }),
      countInstructors({ q }),
    ]);

    return NextResponse.json(
      {
        data,
        meta: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit) || 1,
          q: q || null,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("list instructors error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
