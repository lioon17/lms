// src/app/api/modules/[id]/route.js
import { NextResponse } from 'next/server';
import db from "@/lib/db";

export async function PATCH(request, context) {
  try {
    const { id } = await context.params;   // ✅ await the params
    const { title, summary } = await request.json();

    if (!title && !summary) {
      return NextResponse.json(
        { error: 'Title or summary is required for update' },
        { status: 400 }
      );
    }

    const updates = [];
    const values = [];

    if (title) {
      updates.push('title = ?');
      values.push(title);
    }

    if (summary !== undefined) {
      updates.push('summary = ?');
      values.push(summary);
    }

    values.push(id);

    const [result] = await db.execute(
      `UPDATE modules SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Module not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Module updated successfully' });
  } catch (error) {
    console.error('Error updating module:', error);
    return NextResponse.json(
      { error: 'Failed to update module' },
      { status: 500 }
    );
  }
}

// DELETE /api/modules/[id] - Delete a module
export async function DELETE(request, context) {
  try {
    const { id } = await context.params;   // ✅ await here too
    const [result] = await db.execute('DELETE FROM modules WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Module not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Module deleted successfully' });
  } catch (error) {
    console.error('Error deleting module:', error);
    return NextResponse.json(
      { error: 'Failed to delete module' },
      { status: 500 }
    );
  }
}



