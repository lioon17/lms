 
import { NextResponse } from 'next/server';
import db from '@/lib/db';

// POST /api/lessons - Create a new lesson
export async function POST(request) {
  try {
    const { moduleId, title, summary, content, videoUrl, durationSeconds } = await request.json();

    if (!moduleId || !title) {
      return NextResponse.json(
        { error: 'Module ID and title are required' },
        { status: 400 }
      );
    }

    // Get the max position for this module to set the new position
    const [maxPositionRows] = await db.execute(
      'SELECT MAX(position) as maxPosition FROM lessons WHERE module_id = ?',
      [moduleId]
    );
    
    const newPosition = (maxPositionRows[0].maxPosition || 0) + 1;

    // Insert the new lesson
    const [result] = await db.execute(
      'INSERT INTO lessons (module_id, title, summary, content, video_url, duration_seconds, position) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [moduleId, title, summary || null, content || null, videoUrl || null, durationSeconds || null, newPosition]
    );

    return NextResponse.json(
      { 
        id: result.insertId, 
        message: 'Lesson created successfully' 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating lesson:', error);
    return NextResponse.json(
      { error: 'Failed to create lesson' },
      { status: 500 }
    );
  }
}

// GET /api/lessons - Get lessons (optional filtering by moduleId)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const moduleId = searchParams.get('moduleId');

    let query = `
      SELECT id, module_id, title, summary, content, video_url, duration_seconds, position, created_at, updated_at 
      FROM lessons
    `;
    let params = [];

    if (moduleId) {
      query += ' WHERE module_id = ? ORDER BY position ASC';
      params = [moduleId];
    } else {
      query += ' ORDER BY module_id, position ASC';
    }

    const [rows] = await db.execute(query, params);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lessons' },
      { status: 500 }
    );
  }
}