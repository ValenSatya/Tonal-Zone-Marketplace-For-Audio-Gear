import { NextResponse } from "next/server";
import { verifyMidtransSignature, MidtransWebhookPayload } from "@/lib/escrow";

export async function POST(request: Request) {
  try {
    const payload: MidtransWebhookPayload = await request.json();

    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
      payment_type,
      transaction_id,
    } = payload;

    if (!order_id || !status_code || !gross_amount || !signature_key) {
      return NextResponse.json(
        { error: "Missing required Midtrans webhook signature payload parameters." },
        { status: 400 }
      );
    }

    // 1. Verify Cryptographic SHA-512 Signature Key
    const isValidSignature = verifyMidtransSignature({
      order_id,
      status_code,
      gross_amount,
      signature_key,
    });

    if (!isValidSignature && process.env.NODE_ENV === "production") {
      console.error(`[Security Alert] Invalid Midtrans signature hash received for order: ${order_id}`);
      return NextResponse.json(
        { error: "Forbidden: Signature hash verification failed." },
        { status: 403 }
      );
    }

    console.log(
      `[Midtrans Webhook] Verified notification for Order: ${order_id} | Status: ${transaction_status} | Type: ${payment_type}`
    );

    // 2. Evaluate Payment Lifecycle & Escrow Transition
    let targetEscrowStatus = "PAYMENT_PENDING";

    if (transaction_status === "capture") {
      if (fraud_status === "challenge") {
        targetEscrowStatus = "PAYMENT_PENDING"; // Challenge by FDS (Fraud Detection System)
      } else if (fraud_status === "accept") {
        targetEscrowStatus = "ESCROW_HOLDING"; // Card payment captured & accepted
      }
    } else if (transaction_status === "settlement") {
      targetEscrowStatus = "ESCROW_HOLDING"; // VA / QRIS / GoPay / Bank Transfer successfully settled
    } else if (
      transaction_status === "cancel" ||
      transaction_status === "deny" ||
      transaction_status === "expire"
    ) {
      targetEscrowStatus = "CANCELLED";
    } else if (transaction_status === "refund") {
      targetEscrowStatus = "REFUNDED_TO_BUYER";
    }

    // 3. Return 200 OK acknowledgment to Midtrans
    return NextResponse.json({
      status: "success",
      message: `Midtrans webhook processed. Order ${order_id} transitioned to ${targetEscrowStatus}.`,
      orderId: order_id,
      transactionId: transaction_id,
      escrowStatus: targetEscrowStatus,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal webhook handler error.";
    console.error("Midtrans Webhook Processing Error:", error);
    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    );
  }
}
