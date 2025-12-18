// lib/api/progress.js
// ✅ All helpers use relative routes and handle JSON parsing + errors.

async function jsonFetch(url, options = {}) {
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

/* ------------------- PROGRESS ROUTES ------------------- */

// 1️⃣ Start or resume an entity (lesson/module/section/quiz)
export async function startProgress({
  userId,
  enrollmentId,
  entityType,
  entityId,
  pctComplete = 0,
  secondsSpent = 0,
  courseId,
  lastEntityType,
  lastEntityId,
}) {
  return jsonFetch("/api/progress/start", {
    method: "POST",
    headers: userId ? { "x-user-id": userId.toString() } : {},
    body: JSON.stringify({
      enrollment_id: enrollmentId,
      entity_type: entityType,
      entity_id: entityId,
      pct_complete: pctComplete,
      seconds_spent: secondsSpent,
      course_id: courseId,
      last_entity_type: lastEntityType,
      last_entity_id: lastEntityId,
    }),
  });
}

// 2️⃣ Tick (heartbeat update)
export async function tickProgress({
  enrollmentId,
  entityType,
  entityId,
  seconds = 30,
  pctComplete,
}) {
  return jsonFetch("/api/progress/tick", {
    method: "PATCH",
    body: JSON.stringify({
      enrollment_id: enrollmentId,
      entity_type: entityType,
      entity_id: entityId,
      seconds,
      pct_complete: pctComplete,
    }),
  });
}

// 3️⃣ Mark entity complete
export async function completeProgress({
  enrollmentId,
  entityType,
  entityId,
  secondsSpent = 0,
}) {
  return jsonFetch("/api/progress/complete", {
    method: "PATCH",
    body: JSON.stringify({
      enrollment_id: enrollmentId,
      entity_type: entityType,
      entity_id: entityId,
      seconds_spent: secondsSpent,
    }),
  });
}

// 4️⃣ Record quiz result (passed / failed)
export async function recordQuizProgress({
  enrollmentId,
  quizId,
  passed,
  score,
  secondsSpent = 0,
}) {
  return jsonFetch("/api/progress/quiz", {
    method: "PATCH",
    body: JSON.stringify({
      enrollment_id: enrollmentId,
      quiz_id: quizId,
      passed,
      score,
      seconds_spent: secondsSpent,
    }),
  });
}

// 5️⃣ Fetch progress for a given enrollment or entity
export async function getProgress({ enrollmentId, entityType, entityId }) {
  const params = new URLSearchParams();
  if (enrollmentId) params.set("enrollmentId", enrollmentId);
  if (entityType) params.set("entityType", entityType);
  if (entityId) params.set("entityId", entityId);
  return jsonFetch(`/api/progress?${params.toString()}`);
}

// 6️⃣ Admin delete (optional)
export async function deleteProgress({ enrollmentId, entityType, entityId }) {
  return jsonFetch("/api/progress", {
    method: "DELETE",
    body: JSON.stringify({
      enrollment_id: enrollmentId,
      entity_type: entityType,
      entity_id: entityId,
    }),
  });
}

// -----------------------------------------------------
// Fetch aggregated summary for the progress sidebar
// -----------------------------------------------------
export async function getProgressSummary({ enrollmentId, courseId }) {
  const params = new URLSearchParams();
  if (enrollmentId) params.set("enrollmentId", enrollmentId);
  if (courseId) params.set("courseId", courseId);
  return jsonFetch(`/api/progress/summary?${params.toString()}`);
}


// -----------------------------------------------------
// Progress Pointers: track where user left off
// -----------------------------------------------------
export async function getProgressPointer({ userId, courseId }) {
  const params = new URLSearchParams();
  if (userId) params.set("userId", userId);
  if (courseId) params.set("courseId", courseId);
  return jsonFetch(`/api/progress/pointer?${params.toString()}`);
}

export async function updateProgressPointer({
  userId,
  courseId,
  lastEntityType,
  lastEntityId,
}) {
  return jsonFetch("/api/progress/pointer", {
    method: "PATCH",
    body: JSON.stringify({
      user_id: userId,
      course_id: courseId,
      last_entity_type: lastEntityType,
      last_entity_id: lastEntityId,
    }),
  });
}
