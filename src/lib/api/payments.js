
export async function createPayment({
  user_id, course_id, enrollment_id,
  amount_cents, currency = "USD",
  provider = "paypal", // or "mpesa"
  status = "paid",     // force 'paid' per your requirement
  metadata = {}
}) {
  const res = await fetch("/api/payments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id, course_id, enrollment_id,
      amount_cents, currency, provider, status,
      metadata
    })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Failed to create payment");
  return data;
}
