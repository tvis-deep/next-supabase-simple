import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { auditLog } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Missing STRIPE_WEBHOOK_SECRET" },
      { status: 500 }
    );
  }

  const signature = (await headers()).get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const rawBody = await req.text();

  let event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  // Minimal demo: update subscription status on profile when we can map back.
  try {
    const stripe = getStripe();
    if (
      event.type === "checkout.session.completed" ||
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.deleted"
    ) {
      const obj = event.data.object as any;
      const customerId: string | null =
        obj.customer && typeof obj.customer === "string" ? obj.customer : null;

      let subscriptionId: string | null = null;
      let status: string | null = null;
      let priceId: string | null = null;

      if (event.type === "checkout.session.completed") {
        subscriptionId =
          obj.subscription && typeof obj.subscription === "string"
            ? obj.subscription
            : null;
        status = "active";
      } else {
        subscriptionId = obj.id ?? null;
        status = obj.status ?? null;
        priceId = obj.items?.data?.[0]?.price?.id ?? null;
      }

      if (customerId) {
        const supabaseAdmin = getSupabaseAdmin();
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .maybeSingle();

        if (profile?.id) {
          await supabaseAdmin
            .from("profiles")
            .update({
              stripe_subscription_id: subscriptionId,
              stripe_price_id: priceId,
              subscription_status: status,
              updated_at: new Date().toISOString(),
            })
            .eq("id", profile.id);

          await auditLog({
            actorUserId: profile.id,
            action: "billing.webhook",
            entityType: "stripe.event",
            entityId: event.id,
            metadata: { type: event.type, customerId, subscriptionId, status },
          });
        }
      }
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "Webhook handler error";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
