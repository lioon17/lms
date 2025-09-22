// src/lib/api/lessons.js
import { fetchAPI } from './base';

export async function createLesson(lessonData) {
  try {
    const response = await fetch('/api/lessons', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        moduleId: lessonData.moduleId, // Changed from module_id to moduleId
        title: lessonData.title,
        summary: lessonData.summary,
        content: lessonData.content,
        videoUrl: lessonData.videoUrl, // Changed from video_url to videoUrl
        durationSeconds: lessonData.durationSeconds,
        type: lessonData.type
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create lesson');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating lesson:', error);
    throw error;
  }
}
 

// Update the updateLesson function
export async function updateLesson(lessonId, updates) {
  try {
    const response = await fetch(`/api/lessons/${lessonId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update lesson');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating lesson:', error);
    throw error;
  }
}

// Update the deleteLesson function
export async function deleteLesson(lessonId) {
  try {
    const response = await fetch(`/api/lessons/${lessonId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete lesson');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error deleting lesson:', error);
    throw error;
  }
}

export async function reorderLessons(moduleId, order) {
  const response = await fetchAPI('/api/lessons/reorder', {
    method: 'POST',
    body: JSON.stringify({ moduleId, order }),
  });
  return response;
}
// replace getLessonsByModule with this:
export async function getLessonsByModule(moduleId) {
  const res = await fetch(`/api/modules/${moduleId}/lessons`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch lessons');
  const { lessons = [] } = await res.json();

  // map camelCase → snake_case so existing JSX works
  return lessons.map(({ moduleId, videoUrl, durationSeconds, createdAt, updatedAt, ...rest }) => ({
    ...rest,
    module_id: moduleId,
    video_url: videoUrl,
    duration_seconds: durationSeconds,
    created_at: createdAt,
    updated_at: updatedAt,
  }));
}
