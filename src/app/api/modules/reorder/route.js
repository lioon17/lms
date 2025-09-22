// src/app/api/modules/reorder/route.js
import { NextResponse } from 'next/server';
import db from '@/lib/db';

// POST /api/modules/reorder - Reorder modules
export async function POST(request) {
  let connection;
  try {
    const { courseId, order } = await request.json();

    if (!courseId || !order || !Array.isArray(order)) {
      return NextResponse.json(
        { error: 'Course ID and order array are required' },
        { status: 400 }
      );
    }

    // Validate that positions are contiguous (1..N)
    const expectedPositions = Array.from({ length: order.length }, (_, i) => i + 1);
    const actualPositions = order.map(item => item.position).sort((a, b) => a - b);
    
    if (JSON.stringify(expectedPositions) !== JSON.stringify(actualPositions)) {
      return NextResponse.json(
        { error: 'Positions must be contiguous (1 to N)' },
        { status: 400 }
      );
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    // Update each module's position
    for (const item of order) {
      await connection.execute(
        'UPDATE modules SET position = ? WHERE id = ? AND course_id = ?',
        [item.position, item.id, courseId]
      );
    }

    await connection.commit();
    connection.release();

    return NextResponse.json({ message: 'Modules reordered successfully' });
  } catch (error) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    
    console.error('Error reordering modules:', error);
    return NextResponse.json(
      { error: 'Failed to reorder modules' },
      { status: 500 }
    );
  }
}