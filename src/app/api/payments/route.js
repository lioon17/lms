import { NextResponse } from "next/server";
import db from "@/lib/db";

const PROVIDERS = new Set(["paypal", "mpesa"]);
const STATUSES = new Set(["paid", "canceled", "failed"]);

function isPositiveInt(n) {
  return Number.isInteger(n) && n > 0;
}
function normCurrency(s) {
  return (s || "").toString().trim().toUpperCase();
}

// POST /api/payments
// Creates a payment record with idempotency support.
// Body: {
//   user_id, course_id, enrollment_id?,
//   amount_cents, currency, provider, status? ('failed' default),
//   idempotency_key?,
//   provider_order_id?, provider_charge_id?, external_txn_id?,
//   paypal_payer_id?, paypal_email?,
//   mpesa_merchant_request_id?, mpesa_checkout_request_id?, mpesa_receipt_number?, mpesa_phone_e164?,
//   payer_name?, payer_email?,
//   metadata? (object)
// }
export async function POST(request) {
  try {
    const body = await request.json();

    // --- Required
    const user_id = Number(body?.user_id);
    const course_id = Number(body?.course_id);
    const amount_cents = Number(body?.amount_cents);
    const currency = normCurrency(body?.currency);
    const provider = String(body?.provider || "").toLowerCase();

    if (!user_id || !course_id) {
      return NextResponse.json({ error: "user_id and course_id are required." }, { status: 400 });
    }
    if (!isPositiveInt(amount_cents)) {
      return NextResponse.json({ error: "amount_cents must be a positive integer." }, { status: 400 });
    }
    if (!currency || currency.length !== 3) {
      return NextResponse.json({ error: "currency must be a 3-letter ISO code (e.g., USD, KES)." }, { status: 400 });
    }
    if (!PROVIDERS.has(provider)) {
      return NextResponse.json({ error: `provider must be one of: ${[...PROVIDERS].join(", ")}` }, { status: 400 });
    }

    // Optionals
    const enrollment_id = body?.enrollment_id ? Number(body.enrollment_id) : null;
    const status = STATUSES.has(String(body?.status)) ? String(body.status) : "failed";
    const idempotency_key = body?.idempotency_key || null;

    const provider_order_id = body?.provider_order_id || null;
    const provider_charge_id = body?.provider_charge_id || null;
    const external_txn_id = body?.external_txn_id || null;

    const paypal_payer_id = body?.paypal_payer_id || null;
    const paypal_email = body?.paypal_email || null;

    const mpesa_merchant_request_id = body?.mpesa_merchant_request_id || null;
    const mpesa_checkout_request_id = body?.mpesa_checkout_request_id || null;
    const mpesa_receipt_number = body?.mpesa_receipt_number || null;
    const mpesa_phone_e164 = body?.mpesa_phone_e164 || null;

    const payer_name = body?.payer_name || null;
    const payer_email = body?.payer_email || null;

    const metadata = body?.metadata ? JSON.stringify(body.metadata) : null;

    // --- Idempotency: if key provided and exists, return existing record
    if (idempotency_key) {
      const [existing] = await db.execute(
        "SELECT * FROM payments WHERE idempotency_key = ? LIMIT 1",
        [idempotency_key]
      );
      if (existing?.length) {
        return NextResponse.json(existing[0], { status: 200 });
      }
    }

    // Insert
    const [insertRes] = await db.execute(
      `
      INSERT INTO payments (
        user_id, course_id, enrollment_id,
        amount_cents, currency,
        provider, status,
        idempotency_key,
        provider_order_id, provider_charge_id, external_txn_id,
        paypal_payer_id, paypal_email,
        mpesa_merchant_request_id, mpesa_checkout_request_id, mpesa_receipt_number, mpesa_phone_e164,
        payer_name, payer_email,
        metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        user_id, course_id, enrollment_id,
        amount_cents, currency,
        provider, status,
        idempotency_key,
        provider_order_id, provider_charge_id, external_txn_id,
        paypal_payer_id, paypal_email,
        mpesa_merchant_request_id, mpesa_checkout_request_id, mpesa_receipt_number, mpesa_phone_e164,
        payer_name, payer_email,
        metadata
      ]
    );

    const newId = insertRes.insertId;
    const [rows] = await db.execute("SELECT * FROM payments WHERE id = ?", [newId]);
    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    console.error("POST /api/payments error:", error);
    const status = error?.errno === 1062 ? 409 : 500; // duplicate idempotency_key -> 409
    const message = error?.errno === 1062
      ? "Duplicate idempotency_key: this operation was already processed."
      : error?.sqlMessage || error?.message || "Failed to create payment";
    return NextResponse.json({ error: message }, { status });
  }
}

// PATCH /api/payments
// Updates a payment (status, refs, metadata, etc.).
// Identify target by one of:
//  - id
//  - mpesa_checkout_request_id
//  - provider_order_id
// Body example:
// { id: 123, status: "paid", provider_charge_id: "CAPTURE-123", metadata: { gateway_latency_ms: 210 } }
export async function PATCH(request) {
  try {
    const body = await request.json();

    // Identify target
    const id = body?.id ? Number(body.id) : null;
    const mpesa_checkout_request_id = body?.mpesa_checkout_request_id || null;
    const provider_order_id = body?.provider_order_id || null;

    if (!id && !mpesa_checkout_request_id && !provider_order_id) {
      return NextResponse.json(
        { error: "Provide one identifier: id OR mpesa_checkout_request_id OR provider_order_id." },
        { status: 400 }
      );
    }

    // Build dynamic SET clause (only allow known fields)
    const fields = {};
    if (body?.status) {
      if (!STATUSES.has(String(body.status))) {
        return NextResponse.json(
          { error: `status must be one of: ${[...STATUSES].join(", ")}` },
          { status: 400 }
        );
      }
      fields.status = String(body.status);
    }
    if (body?.provider_charge_id != null) fields.provider_charge_id = String(body.provider_charge_id);
    if (body?.external_txn_id != null) fields.external_txn_id = String(body.external_txn_id);

    // PayPal
    if (body?.paypal_payer_id != null) fields.paypal_payer_id = String(body.paypal_payer_id);
    if (body?.paypal_email != null) fields.paypal_email = String(body.paypal_email);

    // M-Pesa
    if (body?.mpesa_merchant_request_id != null) fields.mpesa_merchant_request_id = String(body.mpesa_merchant_request_id);
    if (body?.mpesa_checkout_request_id != null) fields.mpesa_checkout_request_id = String(body.mpesa_checkout_request_id);
    if (body?.mpesa_receipt_number != null) fields.mpesa_receipt_number = String(body.mpesa_receipt_number);
    if (body?.mpesa_phone_e164 != null) fields.mpesa_phone_e164 = String(body.mpesa_phone_e164);
    if (body?.mpesa_result_code != null) fields.mpesa_result_code = Number(body.mpesa_result_code);
    if (body?.mpesa_result_desc != null) fields.mpesa_result_desc = String(body.mpesa_result_desc);

    // Payer & metadata
    if (body?.payer_name != null) fields.payer_name = String(body.payer_name);
    if (body?.payer_email != null) fields.payer_email = String(body.payer_email);
    if (body?.metadata !== undefined) {
      fields.metadata = body.metadata === null ? null : JSON.stringify(body.metadata);
    }

    if (Object.keys(fields).length === 0) {
      return NextResponse.json({ error: "No updatable fields provided." }, { status: 400 });
    }

    // Build SQL
    const setClause = Object.keys(fields).map(k => `${k} = ?`).join(", ");
    const params = Object.values(fields);

    // WHERE by chosen identifier
    let where = "";
    const whereParams = [];
    if (id) {
      where = "id = ?";
      whereParams.push(id);
    } else if (mpesa_checkout_request_id) {
      where = "mpesa_checkout_request_id = ?";
      whereParams.push(mpesa_checkout_request_id);
    } else {
      where = "provider_order_id = ?";
      whereParams.push(provider_order_id);
    }

    const [res] = await db.execute(
      `UPDATE payments SET ${setClause} WHERE ${where}`,
      [...params, ...whereParams]
    );

    if (res.affectedRows === 0) {
      return NextResponse.json({ error: "Payment not found." }, { status: 404 });
    }

    // Return the updated row (by the same identifier used)
    const [rows] = await db.execute(
      `SELECT * FROM payments WHERE ${where} LIMIT 1`,
      whereParams
    );

    return NextResponse.json(rows[0], { status: 200 });
  } catch (error) {
    console.error("PATCH /api/payments error:", error);
    return NextResponse.json(
      { error: error?.sqlMessage || error?.message || "Failed to update payment" },
      { status: 500 }
    );
  }
}
