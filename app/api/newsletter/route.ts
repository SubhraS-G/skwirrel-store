import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { newsletterSchema } from "@/lib/validations/newsletter";
import { sendWelcomeEmail } from "@/lib/email/newsletterEmail";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = newsletterSchema.parse(body);

    const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ message: "Already subscribed!" });
    }

    await prisma.newsletterSubscriber.create({ data: { email } });
    // A mail hiccup shouldn't fail an already-persisted subscription.
    await sendWelcomeEmail(email).catch((error) =>
      console.error("[NEWSLETTER_EMAIL]", error)
    );

    return NextResponse.json({ message: "Subscribed successfully!" }, { status: 201 });
  } catch (error) {
    console.error("[NEWSLETTER_POST]", error);
    return NextResponse.json({ error: "Subscription failed" }, { status: 500 });
  }
}
