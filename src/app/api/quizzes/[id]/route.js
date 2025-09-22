import { NextResponse } from 'next/server';
import db from '@/lib/db';

// GET /api/quizzes/[id] - Get a specific quiz
export async function GET(request, { params }) {
  try {
    // Await the params promise
    const { id } = await params;

    const [rows] = await db.execute(
      `SELECT id, module_id, title, attempts_allowed, time_limit_seconds, weight,
              shuffle_questions, shuffle_options, feedback_mode, created_at, updated_at
       FROM quizzes WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      );
    }

    // Convert any non-serializable values to strings
    const quiz = rows[0];
    const serializableQuiz = {
      ...quiz,
      created_at: quiz.created_at ? quiz.created_at.toISOString() : null,
      updated_at: quiz.updated_at ? quiz.updated_at.toISOString() : null
    };

    return NextResponse.json(serializableQuiz);
  } catch (error) {
    console.error('Error fetching quiz:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quiz' },
      { status: 500 }
    );
  }
}

// PATCH /api/quizzes/[id] - Update a specific quiz
export async function PATCH(request, { params }) {
  try {
    // Await the params promise
    const { id } = await params;
    const body = await request.json();
    
    const {
      title,
      attempts_allowed,
      time_limit_seconds,
      weight,
      shuffle_questions,
      shuffle_options,
      feedback_mode
    } = body;

    // Build the update query dynamically based on provided fields
    let updateFields = [];
    let updateValues = [];

    if (title !== undefined) {
      updateFields.push('title = ?');
      updateValues.push(title);
    }
    if (attempts_allowed !== undefined) {
      updateFields.push('attempts_allowed = ?');
      updateValues.push(attempts_allowed);
    }
    if (time_limit_seconds !== undefined) {
      updateFields.push('time_limit_seconds = ?');
      updateValues.push(time_limit_seconds);
    }
    if (weight !== undefined) {
      updateFields.push('weight = ?');
      updateValues.push(weight);
    }
    if (shuffle_questions !== undefined) {
      updateFields.push('shuffle_questions = ?');
      updateValues.push(shuffle_questions);
    }
    if (shuffle_options !== undefined) {
      updateFields.push('shuffle_options = ?');
      updateValues.push(shuffle_options);
    }
    if (feedback_mode !== undefined) {
      updateFields.push('feedback_mode = ?');
      updateValues.push(feedback_mode);
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    updateValues.push(id);

    const query = `
      UPDATE quizzes 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    await db.execute(query, updateValues);

    // Fetch the updated quiz to return it
    const [updatedQuiz] = await db.execute(
      `SELECT id, module_id, title, attempts_allowed, time_limit_seconds, weight,
              shuffle_questions, shuffle_options, feedback_mode, created_at, updated_at
       FROM quizzes WHERE id = ?`,
      [id]
    );

    if (updatedQuiz.length === 0) {
      return NextResponse.json(
        { error: 'Quiz not found after update' },
        { status: 404 }
      );
    }

    // Convert any non-serializable values to strings
    const quiz = updatedQuiz[0];
    const serializableQuiz = {
      ...quiz,
      created_at: quiz.created_at ? quiz.created_at.toISOString() : null,
      updated_at: quiz.updated_at ? quiz.updated_at.toISOString() : null
    };

    return NextResponse.json(serializableQuiz);
  } catch (error) {
    console.error('Error updating quiz:', error);
    return NextResponse.json(
      { error: 'Failed to update quiz' },
      { status: 500 }
    );
  }
}

// DELETE /api/quizzes/[id] - Delete a specific quiz
export async function DELETE(request, { params }) {
  try {
    // Await the params promise
    const { id } = await params;

    // Check if quiz exists
    const [rows] = await db.execute(
      'SELECT id FROM quizzes WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      );
    }

    await db.execute(
      'DELETE FROM quizzes WHERE id = ?',
      [id]
    );

    return NextResponse.json(
      { message: 'Quiz deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting quiz:', error);
    return NextResponse.json(
      { error: 'Failed to delete quiz' },
      { status: 500 }
    );
  }
}