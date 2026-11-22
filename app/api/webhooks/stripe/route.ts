import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { prisma } from "@/lib/prisma";
import { confirmPaidOrder } from "@/lib/checkout/confirmation";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;
      const paymentIntent =
        typeof session.payment_intent === "string" ? session.payment_intent : null;

      if (orderId) {
        await confirmPaidOrder(orderId, paymentIntent);
      } else if (paymentIntent) {
        // Legacy fallback: match on the payment intent recorded at creation.
        await prisma.order.updateMany({
          where: { payment_intent: paymentIntent },
          data: { status: "confirmed", payment_status: "paid" },
        });
      }
      break;
    }
    case "checkout.session.async_payment_failed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;
      if (orderId) {
        await prisma.order.updateMany({
          where: { id: orderId, NOT: { payment_status: "paid" } },
          data: { status: "payment_failed", payment_status: "failed" },
        });
      }
      break;
    }
    case "payment_intent.payment_failed": {
      const intent = event.data.object as Stripe.PaymentIntent;
      await prisma.order.updateMany({
        where: { payment_intent: intent.id, NOT: { payment_status: "paid" } },
        data: { status: "payment_failed", payment_status: "failed" },
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
