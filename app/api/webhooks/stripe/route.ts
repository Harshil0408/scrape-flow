import { HandleCheckOutSessionCompleted } from "@/lib/stripe/handleCheckoutSessionCompleted";
import { getStripe } from "@/lib/stripe/stripe";
import { NextResponse } from "next/server";

export const runtime = 'nodejs'; 

export async function POST(request: Request) {
    const stripe = getStripe();

    const buf = await request.arrayBuffer();
    const rawBody = Buffer.from(buf);

    const signature = request.headers.get("stripe-signature") as string;

    try {
        const event = stripe.webhooks.constructEvent(
            rawBody,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );

        switch (event.type) {
            case "checkout.session.completed":
                await HandleCheckOutSessionCompleted(event.data.object);
                break;
            default:
                console.log(`Unhandled event type: ${event.type}`);
                break;
        }

        return new NextResponse(null, { status: 200 });
    } catch (err: any) {
        console.error("Stripe webhook error:", err);
        return new NextResponse(`Webhook error: ${err.message}`, { status: 400 });
    }
}
