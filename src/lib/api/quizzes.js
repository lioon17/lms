import { fetchAPI } from "./base"

function resolveQuizId(quizId) {
  if (typeof quizId === "string" && quizId.includes("-")) {
    const parts = quizId.split("-");
    const num = parts.find((p) => /^\d+$/.test(p));
    if (num) return parseInt(num, 10);
  }
  return quizId;
}

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
  const r = await fetch(`/api/quizzes?moduleId=${moduleId}`, { cache: "no-store" });
  if (!r.ok) throw new Error("Failed to fetch module quizzes");
  return r.json(); // expect array
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


// ✅ Get all questions for a quiz
export async function getQuizQuestions(quizId) {
  const resolvedId = resolveQuizId(quizId);
  console.log("🧩 Resolved quiz ID:", resolvedId);
  return fetchAPI(`/quizzes/${resolvedId}/questions`);
}


// ✅ Create a new question (with optional answers)
export async function createQuizQuestion(quizId, questionData) {
  return fetchAPI(`/quizzes/${quizId}/questions`, {
    method: "POST",
    body: questionData,
  });
}

// ✅ Get one question (with answers)
export async function getQuestion(questionId) {
  return fetchAPI(`/questions/${questionId}`);
}

// ✅ Update a question
export async function updateQuestion(questionId, updates) {
  return fetchAPI(`/questions/${questionId}`, {
    method: "PATCH",
    body: updates,
  });
}

// ✅ Delete a question
export async function deleteQuestion(questionId) {
  return fetchAPI(`/questions/${questionId}`, {
    method: "DELETE",
  });
}

// ✅ Get all answers for a question
export async function getQuestionAnswers(questionId) {
  return fetchAPI(`/questions/${questionId}/answers`);
}

// ✅ Create an answer
export async function createAnswer(questionId, answerData) {
  return fetchAPI(`/questions/${questionId}/answers`, {
    method: "POST",
    body: answerData,
  });
}

// ✅ Update an answer
export async function updateAnswer(answerId, updates) {
  return fetchAPI(`/answers/${answerId}`, {
    method: "PATCH",
    body: updates,
  });
}

// ✅ Delete an answer
export async function deleteAnswer(answerId) {
  return fetchAPI(`/answers/${answerId}`, {
    method: "DELETE",
  });
}

export async function startQuiz(id) {
  const r = await fetch(`/api/quizzes/${id}/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store"
  });
  if (!r.ok) {
    let err;
    try { err = await r.json(); } catch {}
    throw new Error(err?.error || `Failed to start (HTTP ${r.status})`);
  }
  return r.json();
}

export async function submitAttempt(attemptId, answers) {
  const r = await fetch(`/api/attempts/${attemptId}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({ answers })
  });
  if (!r.ok) {
    let err;
    try { err = await r.json(); } catch {}
    throw new Error(err?.error || `Submit failed (HTTP ${r.status})`);
  }
  return r.json();
}

