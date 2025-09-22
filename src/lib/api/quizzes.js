import { fetchAPI } from "./base"

// Shape normalizer → make all fields consistent for UI
export function normalizeQuiz(q = {}) {
  return {
    quiz_id: q.quiz_id ?? q.id,
    quiz_title: q.quiz_title ?? q.title ?? "",
    quiz_description: q.quiz_description ?? q.description ?? "",
    scope: q.scope ?? (q.lesson_id ? "lesson" : "module"),
    module_id: q.module_id ?? q.moduleId ?? null,
    lesson_id: q.lesson_id ?? q.lessonId ?? null,
    attempts_allowed: Number(q.attempts_allowed ?? q.attemptsAllowed ?? 1),
    time_limit_seconds: q.time_limit_seconds ?? (q.timeLimit ? q.timeLimit * 60 : null),
    weight: Number(q.weight ?? 1),
    shuffle_questions: Boolean(
      q.shuffle_questions ?? q.shuffleQuestions ?? false
    ),
    shuffle_options: Boolean(q.shuffle_options ?? false),
    feedback_mode: q.feedback_mode ?? q.feedbackMode ?? "immediate",
    is_final: Number(q.is_final ?? (q.isFinal ? 1 : 0)),
    quiz_created_at: q.quiz_created_at ?? q.created_at ?? null,
    quiz_updated_at: q.quiz_updated_at ?? q.updated_at ?? null,
  }
}

// ---------- CREATE ----------
export async function createQuiz(data) {
  const res = await fetchAPI("/quizzes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  // API returns the created quiz; normalize for UI
  return normalizeQuiz(res)
}

// ---------- READ ----------
export async function getQuizById(quizId) {
  const res = await fetchAPI(`/quizzes/${quizId}`, { method: "GET" })
  return normalizeQuiz(res)
}

export async function getQuizzesByModule(moduleId) {
  const res = await fetchAPI(`/modules/${moduleId}/quizzes`, { method: "GET" })
  const list = res?.quizzes || res?.data || []
  return list.map(normalizeQuiz)
}

export async function getQuizzesByLesson(lessonId) {
  const res = await fetchAPI(`/lessons/${lessonId}/quizzes`, { method: "GET" })
  const list = res?.quizzes || res?.data || []
  return list.map(normalizeQuiz)
}

// ---------- UPDATE ----------
export async function updateQuiz(quizId, updates) {
  const res = await fetchAPI(`/quizzes/${quizId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  })
  return normalizeQuiz(res)
}

// ---------- DELETE ----------
export async function deleteQuiz(quizId) {
  return fetchAPI(`/quizzes/${quizId}`, { method: "DELETE" })
}
