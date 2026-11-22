import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createOrderSchema } from "@/lib/validations/order";
import { sendOrderConfirmationEmail } from "@/lib/email/orderEmail";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const orders = await prisma.order.findMany({
      where: { user_id: session.user.id },
      include: { items: { include: { product: true } } },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("[ORDERS_GET]", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const data = createOrderSchema.parse(body);

    const subtotal = data.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = await prisma.order.create({
      data: {
        user_id: session.user.id,
        email: data.email,
        phone: data.shippingAddress.phone,
        subtotal,
        shipping: Math.max(data.total - subtotal, 0),
        total: data.total,
        status: "pending",
        coupon_code: data.couponCode ?? null,
        shipping_address: data.shippingAddress,
        items: {
          create: data.items.map((item) => ({
            name: item.name ?? "Product",
            image: item.image ?? null,
            size: item.size ?? null,
            color: item.color ?? null,
            quantity: item.quantity,
            price: item.price,
            product: {
              connect: { id: item.productId },
            },
            ...(item.variantId
              ? {
                  variant: {
                    connect: { id: item.variantId },
                  },
                }
              : {}),
          })),
        },
      },
      include: { items: { include: { product: true } } },
    });

    try {
      await sendOrderConfirmationEmail(order, data.email);
    } catch (error) {
      console.error("[ORDERS_EMAIL]", error);
    }

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error("[ORDERS_POST]", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
