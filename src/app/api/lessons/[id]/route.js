import { NextResponse } from 'next/server';
import db from '@/lib/db';

// PATCH /api/lessons/[id] - Update a lesson
export async function PATCH(request, context) {
  try {
    const { id } = await context.params; // ✅ await params (Next 14 dynamic API)
    const { title, summary, content, videoUrl, durationSeconds } = await request.json();

    if (!title && !summary && !content && !videoUrl && durationSeconds === undefined) {
      return NextResponse.json(
        { error: 'At least one field is required for update' },
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
    if (content !== undefined) {
      updates.push('content = ?');
      values.push(content);
    }
    if (videoUrl !== undefined) {
      updates.push('video_url = ?');
      values.push(videoUrl);
    }
    if (durationSeconds !== undefined) {
      updates.push('duration_seconds = ?');
      values.push(durationSeconds);
    }

    values.push(id);

    const [result] = await db.execute(
      `UPDATE lessons SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Lesson updated successfully' });
  } catch (error) {
    console.error('Error updating lesson:', error);
    return NextResponse.json({ error: 'Failed to update lesson' }, { status: 500 });
  }
}

// DELETE /api/lessons/[id] - Delete a lesson
export async function DELETE(request, context) {
  try {
    const { id } = await context.params; // ✅ await params
    const [result] = await db.execute('DELETE FROM lessons WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Lesson deleted successfully' });
  } catch (error) {
    console.error('Error deleting lesson:', error);
    return NextResponse.json({ error: 'Failed to delete lesson' }, { status: 500 });
  }
}
