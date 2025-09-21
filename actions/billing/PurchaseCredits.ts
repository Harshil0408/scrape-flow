"use server";

import { getAppUrl } from "@/lib/helper/appUrl";
import { getCreditsPack, PackId } from "@/types/billing";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getStripe } from "@/lib/stripe/stripe"; 

export async function PurchaseCredits(packId: PackId) {
    const { userId } = auth();

    if (!userId) {
        throw new Error("Unauthenticated");
    }

    const selectedPack = getCreditsPack(packId);
    if (!selectedPack) {
        throw new Error("Invalid pack");
    }

    const stripe = getStripe(); 

    const session = await stripe.checkout.sessions.create({
        mode: "payment",
        invoice_creation: { enabled: true },
        success_url: getAppUrl("billing"),
        cancel_url: getAppUrl("billing"),
        metadata: { userId, packId },
        line_items: [{ quantity: 1, price: selectedPack.priceId }],
    });

    if (!session.url) {
        throw new Error("Cannot create Stripe session");
    }

    redirect(session.url);
}
