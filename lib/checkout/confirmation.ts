import { prisma } from "@/lib/prisma";
import { sendOrderConfirmationEmail } from "@/lib/email/orderEmail";

/**
 * Marks an order as confirmed + paid exactly once (idempotent across
 * webhooks, redirects and retries) and sends the confirmation email the
 * first time the transition happens.
 *
 * Returns true when the order transitioned to paid.
 */
export async function confirmPaidOrder(orderId: string, paymentIntent?: string | null) {
  const result = await prisma.order.updateMany({
    where: { id: orderId, NOT: { payment_status: "paid" as const } },
    data: {
      status: "confirmed",
      payment_status: "paid",
      ...(paymentIntent ? { payment_intent: paymentIntent } : {}),
    },
  });

  if (result.count === 0) return false;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (order) {
    try {
      await sendOrderConfirmationEmail(order, order.email);
    } catch (error) {
      console.error("[ORDER_CONFIRMATION_EMAIL]", error);
    }
  }

  return true;
}
