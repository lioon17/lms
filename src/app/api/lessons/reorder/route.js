 
import { NextResponse } from 'next/server';
import db from '@/lib/db';

// POST /api/lessons/reorder - Reorder lessons
export async function POST(request) {
  let connection;
  try {
    const { moduleId, order } = await request.json();

    if (!moduleId || !order || !Array.isArray(order)) {
      return NextResponse.json(
        { error: 'Module ID and order array are required' },
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

    // Update each lesson's position
    for (const item of order) {
      await connection.execute(
        'UPDATE lessons SET position = ? WHERE id = ? AND module_id = ?',
        [item.position, item.id, moduleId]
      );
    }

    await connection.commit();
    connection.release();

    return NextResponse.json({ message: 'Lessons reordered successfully' });
  } catch (error) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    
    console.error('Error reordering lessons:', error);
    return NextResponse.json(
      { error: 'Failed to reorder lessons' },
      { status: 500 }
    );
  }
}