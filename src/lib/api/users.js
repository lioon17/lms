import { fetchAPI } from "@/lib/api/base";

/**
 * Fetch a user's enrolled courses with optional nesting.
 * @param {number} userId
 * @param {{status?: 'active'|'completed'|'suspended'|'failed'|'all',
 *          include?: 'none'|'modules'|'modules+lessons'|'deep',
 *          limit?: number, offset?: number}} opts
 * @returns {Promise<{ user_id:number, status:string, total:number, items:any[] }>}
 */
export async function listUserCourses(userId, opts = {}) {
  if (!userId) throw new Error("userId is required");

  const {
    status = "active",
    include = "deep",    // deep = courses → modules → lessons → sections → blocks (+ progress)
    limit = 50,
    offset = 0,
  } = opts;

  const qs = new URLSearchParams({
    status,
    include,
    limit: String(limit),
    offset: String(offset),
  });

  // Style A: do NOT prefix with /api (fetchAPI adds /api)
  return fetchAPI(`/users/${userId}/courses?${qs.toString()}`, {
    method: "GET",
    cache: "no-store",
  });
}

 

// ✅ Get all questions for a quiz
export async function getQuizQuestions(quizId) {
  return fetchAPI(`/quizzes/${quizId}/questions`);
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
