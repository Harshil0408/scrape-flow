import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const StripeModule = await import("stripe");
    const stripe = new StripeModule.default(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: "2025-08-27.basil",
        typescript: true,
    });

    if (req.method === "POST") {
        const event = req.body; 
        res.status(200).json({ received: true });
    } else {
        res.setHeader("Allow", "POST");
        res.status(405).end("Method Not Allowed");
    }
}
