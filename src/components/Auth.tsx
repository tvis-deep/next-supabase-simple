"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

type Status = "idle" | "sending" | "sent" | "error";

export function Auth() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string>("");
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const init = async () => {
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase.auth.getSession();
      setIsAuthed(Boolean(data.session));
    };
    void init();

    const supabase = getSupabaseBrowserClient();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthed(Boolean(session));
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const sendMagicLink = async () => {
    const supabase = getSupabaseBrowserClient();
    setStatus("sending");
    setMessage("");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo:
          typeof window === "undefined"
            ? undefined
            : `${window.location.origin}/account`,
      },
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    setStatus("sent");
    setMessage("Check your email for the magic link.");
  };

  const signOut = async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
  };

  return (
    <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 text-slate-900 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">
      <h2 className="text-lg font-semibold">Sign in</h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
        Use a magic link (passwordless).
      </p>

      {isAuthed ? (
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-sm text-slate-700 dark:text-slate-200">
            You’re signed in.
          </p>
          <button
            onClick={() => void signOut()}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Sign out
          </button>
        </div>
      ) : (
        <>
          <label className="mt-4 block text-sm font-medium text-slate-700 dark:text-slate-200">
            Email
          </label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="you@example.com"
            className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-200 placeholder:text-slate-400 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:ring-slate-800 dark:placeholder:text-slate-500"
          />
          <button
            onClick={() => void sendMagicLink()}
            disabled={!email || status === "sending"}
            className="mt-4 w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "sending" ? "Sending..." : "Send magic link"}
          </button>
        </>
      )}

      {message ? (
        <p
          className={`mt-3 text-sm ${
            status === "error" ? "text-red-600" : "text-slate-700"
          }`}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
