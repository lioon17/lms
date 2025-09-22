// src/app/api/modules/route.js
import { NextResponse } from 'next/server';
import db from '@/lib/db';

// POST /api/modules - Create a new module
export async function POST(request) {
  try {
    const { courseId, title, summary } = await request.json();

    if (!courseId || !title) {
      return NextResponse.json(
        { error: 'Course ID and title are required' },
        { status: 400 }
      );
    }

    // Get the max position for this course to set the new position
    const [maxPositionRows] = await db.execute(
      'SELECT MAX(position) as maxPosition FROM modules WHERE course_id = ?',
      [courseId]
    );
    
    const newPosition = (maxPositionRows[0].maxPosition || 0) + 1;

    // Insert the new module
    const [result] = await db.execute(
      'INSERT INTO modules (course_id, title, summary, position) VALUES (?, ?, ?, ?)',
      [courseId, title, summary || null, newPosition]
    );

    return NextResponse.json(
      { 
        id: result.insertId, 
        message: 'Module created successfully' 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating module:', error);
    return NextResponse.json(
      { error: 'Failed to create module' },
      { status: 500 }
    );
  }
}

// GET /api/modules - Get modules (optional filtering by courseId)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    let query = `
      SELECT id, course_id, title, summary, position, created_at, updated_at 
      FROM modules
    `;
    let params = [];

    if (courseId) {
      query += ' WHERE course_id = ? ORDER BY position ASC';
      params = [courseId];
    } else {
      query += ' ORDER BY course_id, position ASC';
    }

    const [rows] = await db.execute(query, params);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching modules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch modules' },
      { status: 500 }
    );
  }
}