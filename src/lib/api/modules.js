// src/lib/api/modules.js
import { fetchAPI } from './base';

export async function createModule(courseId, title, summary) {
  const response = await fetchAPI('/modules', {
    method: 'POST',
    body: JSON.stringify({ courseId, title, summary }),
  });
  return response;
}

export async function updateModule(moduleId, updates) {
  const response = await fetchAPI(`/modules/${moduleId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
  return response;
}

export async function deleteModule(moduleId) {
  const response = await fetchAPI(`/modules/${moduleId}`, {
    method: 'DELETE',
  });
  return response;
}

export async function reorderModules(courseId, order) {
  const response = await fetchAPI('/modules/reorder', {
    method: 'POST',
    body: JSON.stringify({ courseId, order }),
  });
  return response;
}

export async function getModulesByCourseId(courseId) {
  const response = await fetchAPI(`/modules?courseId=${courseId}`);
  return response;
}