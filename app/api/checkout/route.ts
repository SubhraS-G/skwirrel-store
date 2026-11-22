import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe/client";
import { razorpay } from "@/lib/razorpay/client";
import { checkoutSchema } from "@/lib/validations/checkout";
import { prisma } from "@/lib/prisma";
import { sendOrderConfirmationEmail } from "@/lib/email/orderEmail";

const FREE_SHIPPING_THRESHOLD = 999;
const FLAT_SHIPPING_FEE = 99;

async function resolveDiscount(subtotal: number, couponCode?: string) {
  if (!couponCode) return { coupon: null, discount: 0 };
  try {
    const coupon = await prisma.coupon.findUnique({
      where: { code: couponCode.toUpperCase() },
    });
    if (!coupon || !coupon.is_active) return { coupon: null, discount: 0 };
    if (coupon.expires_at && coupon.expires_at < new Date()) return { coupon: null, discount: 0 };
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) return { coupon: null, discount: 0 };
    if (coupon.min_order && subtotal < Number(coupon.min_order)) return { coupon: null, discount: 0 };

    let discount =
      coupon.type === "percentage"
        ? Math.round((subtotal * Number(coupon.value)) / 100)
        : Number(coupon.value);
    if (coupon.max_discount) discount = Math.min(discount, Number(coupon.max_discount));
    discount = Math.min(Math.max(discount, 0), subtotal);

    return { coupon, discount };
  } catch (error) {
    console.error("[CHECKOUT_COUPON]", error);
    return { coupon: null, discount: 0 };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = checkoutSchema.parse(body);

    const subtotal = data.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_FEE;
    const { coupon, discount } = await resolveDiscount(subtotal, data.couponCode);
    const total = Math.max(subtotal - discount + shipping, 1);

    // Persist the order up front so every payment method (and its webhook)
    // has a real row to confirm against.
    const order = await prisma.order.create({
      data: {
        user_id: data.userId || null,
        email: data.email,
        phone: data.shippingAddress.phone,
        status: "pending",
        payment_method: data.paymentMethod,
        subtotal,
        discount,
        shipping,
        total,
        coupon_code: coupon?.code ?? null,
        shipping_address: data.shippingAddress,
        items: {
          create: data.items.map((item) => ({
            name: item.name,
            image: item.image,
            size: item.size ?? null,
            color: item.color ?? null,
            quantity: item.quantity,
            price: item.price,
            product: { connect: { id: item.productId } },
            ...(item.variantId ? { variant: { connect: { id: item.variantId } } } : {}),
          })),
        },
      },
      include: { items: true },
    });

    if (coupon) {
      await prisma.coupon
        .update({ where: { id: coupon.id }, data: { used_count: { increment: 1 } } })
        .catch((error) => console.error("[CHECKOUT_COUPON_COUNT]", error));
    }

    try {
      if (data.paymentMethod === "stripe") {
        const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = data.items.map((item) => ({
          price_data: {
            currency: "inr",
            product_data: {
              name: item.name,
              images: [item.image],
              metadata: {
                productId: item.productId,
                variantId: item.variantId ?? "",
              },
            },
            unit_amount: Math.round(item.price * 100),
          },
          quantity: item.quantity,
        }));

        if (shipping > 0) {
          lineItems.push({
            quantity: 1,
            price_data: {
              currency: "inr",
              product_data: { name: "Shipping" },
              unit_amount: shipping * 100,
            },
          });
        }

        // Discounts can't be a negative line item, so mirror the coupon as a
        // Stripe coupon and attach it to the session.
        const stripeCouponId = coupon ? `skwirrel_${coupon.code.toLowerCase()}` : null;
        if (discount > 0 && coupon && stripeCouponId) {
          try {
            await stripe.coupons.create(
              coupon.type === "percentage"
                ? { id: stripeCouponId, percent_off: Number(coupon.value), duration: "once" }
                : {
                    id: stripeCouponId,
                    amount_off: Math.round(Number(coupon.value) * 100),
                    currency: "inr",
                    duration: "once",
                  }
            );
          } catch (error: any) {
            if (error?.code !== "resource_exists") throw error;
          }
        }

        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: lineItems,
          mode: "payment",
          client_reference_id: order.id,
          customer_email: data.email,
          success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
          metadata: {
            orderId: order.id,
            email: data.email,
            userId: data.userId ?? "",
          },
          ...(discount > 0 && stripeCouponId ? { discounts: [{ coupon: stripeCouponId }] } : {}),
          shipping_address_collection: { allowed_countries: ["IN"] },
          phone_number_collection: { enabled: true },
          locale: "auto",
        });

        return NextResponse.json({ url: session.url, sessionId: session.id, orderId: order.id });
      }

      if (data.paymentMethod === "razorpay") {
        const rzpOrder = await razorpay.orders.create({
          amount: Math.round(total * 100),
          currency: "INR",
          receipt: order.order_number,
          notes: { orderId: order.id, email: data.email },
        });

        await prisma.order.update({
          where: { id: order.id },
          data: { razorpay_order_id: rzpOrder.id },
        });

        return NextResponse.json({
          orderId: rzpOrder.id,
          dbOrderId: order.id,
          amount: rzpOrder.amount,
          currency: rzpOrder.currency,
        });
      }

      if (data.paymentMethod === "cod") {
        const confirmed = await prisma.order.update({
          where: { id: order.id },
          data: { status: "confirmed" },
        });
        try {
          await sendOrderConfirmationEmail(confirmed, data.email);
        } catch (error) {
          console.error("[CHECKOUT_EMAIL]", error);
        }
        return NextResponse.json({
          orderId: order.id,
          orderNumber: order.order_number,
          cod: true,
        });
      }

      return NextResponse.json({ error: "Invalid payment method" }, { status: 400 });
    } catch (error) {
      // Don't leave orphaned pending orders behind when the payment provider
      // call fails — the customer never reached checkout anyway.
      await prisma.order.delete({ where: { id: order.id } }).catch(() => {});
      throw error;
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid checkout payload", details: error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    console.error("[CHECKOUT_POST]", error);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
