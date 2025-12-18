export async function createEnrollment({ user_id, course_id, parent_enrollment_id = null, status = "active" }) {
  const res = await fetch("/api/enrollments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id, course_id, parent_enrollment_id, status })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Failed to create enrollment");
  return data; // { id, user_id, course_id, status, ... }
}


// Get number of ACTIVE enrollments for a user
export async function getActiveEnrollmentCount(userId) {
  if (!userId) throw new Error("userId is required");
  const res = await fetch(`/api/enrollments/active-count/${userId}`, {
    method: "GET",
    cache: "no-store",
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error || "Failed to load active enrollments count");
  // Expecting: { user_id, active_count }
  return json;
}
