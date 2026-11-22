import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { stripe } from "@/lib/stripe/client";
import { prisma } from "@/lib/prisma";
import { confirmPaidOrder } from "@/lib/checkout/confirmation";

/**
 * Confirms a completed payment without relying on webhooks (which are not
 * available in local/dev environments). Safe to call multiple times.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.provider === "stripe" && typeof body.sessionId === "string") {
      const session = await stripe.checkout.sessions.retrieve(body.sessionId);
      if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") {
        return NextResponse.json({ verified: false }, { status: 402 });
      }
      const orderId = session.metadata?.orderId;
      if (!orderId) return NextResponse.json({ error: "Order not found" }, { status: 404 });

      await confirmPaidOrder(
        orderId,
        typeof session.payment_intent === "string" ? session.payment_intent : null
      );
      return NextResponse.json({ verified: true, orderId });
    }

    if (
      body.provider === "razorpay" &&
      body.razorpayOrderId &&
      body.razorpayPaymentId &&
      body.razorpaySignature
    ) {
      const expected = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
        .update(`${body.razorpayOrderId}|${body.razorpayPaymentId}`)
        .digest("hex");

      if (expected !== body.razorpaySignature) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
      }

      const order = await prisma.order.findFirst({
        where: { razorpay_order_id: body.razorpayOrderId },
      });
      if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

      await prisma.order
        .update({ where: { id: order.id }, data: { razorpay_payment_id: body.razorpayPaymentId } })
        .catch(() => {});
      await confirmPaidOrder(order.id);

      return NextResponse.json({ verified: true, orderId: order.id });
    }

    return NextResponse.json({ error: "Invalid verification request" }, { status: 400 });
  } catch (error) {
    console.error("[CHECKOUT_VERIFY]", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
