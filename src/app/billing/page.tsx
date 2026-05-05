"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

export default function BillingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const init = async () => {
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (!session) {
        router.replace("/");
        return;
      }
      setEmail(session.user.email ?? "");
      setLoading(false);
    };
    void init();
  }, [router]);

  const subscribe = async () => {
    setError("");
    const res = await fetch("/api/stripe/create-checkout-session", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as
        | { error?: string }
        | null;
      setError(body?.error ?? "Failed to start checkout");
      return;
    }
    const body = (await res.json()) as { url: string };
    window.location.href = body.url;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-6 py-16 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <div className="mx-auto max-w-3xl text-sm text-slate-600 dark:text-slate-300">
          Loading…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <main className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-16">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Signed in as <span className="font-medium">{email}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              Profile
            </Link>
            <Link
              href="/account"
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              Account
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Subscription
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            This demo creates a Stripe Checkout session for a single recurring
            price.
          </p>

          {error ? (
            <p className="mt-3 text-sm text-red-600 dark:text-red-300">
              {error}
            </p>
          ) : null}

          <button
            onClick={() => void subscribe()}
            className="mt-5 inline-flex h-11 items-center justify-center rounded-md bg-slate-900 px-5 text-sm font-semibold text-white shadow-sm ring-1 ring-slate-900/10 hover:bg-slate-800 active:translate-y-px dark:bg-slate-100 dark:text-slate-900 dark:ring-white/10 dark:hover:bg-white"
          >
            Subscribe
          </button>

          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            Requires <code className="rounded bg-slate-100 px-1 py-0.5 text-slate-900 dark:bg-slate-800 dark:text-slate-100">STRIPE_SECRET_KEY</code>,{" "}
            <code className="rounded bg-slate-100 px-1 py-0.5 text-slate-900 dark:bg-slate-800 dark:text-slate-100">STRIPE_WEBHOOK_SECRET</code>, and{" "}
            <code className="rounded bg-slate-100 px-1 py-0.5 text-slate-900 dark:bg-slate-800 dark:text-slate-100">NEXT_PUBLIC_STRIPE_PRICE_ID</code>.
          </p>
        </div>
      </main>
    </div>
  );
}

