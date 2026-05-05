"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Auth } from "@/components/Auth";

function Feature({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
        {title}
      </p>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{body}</p>
    </div>
  );
}

export function Landing() {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/70">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-900 text-sm font-semibold text-white dark:bg-slate-100 dark:text-slate-900">
              NS
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight">
                Next Supabase Simple
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Auth + Todos starter
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/account"
              className="hidden rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 sm:inline-flex"
            >
              Account
            </Link>
            <Link
              href="/profile"
              className="hidden rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 sm:inline-flex"
            >
              Profile
            </Link>
            <Link
              href="/admin"
              className="hidden rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 sm:inline-flex"
            >
              Admin
            </Link>
            <button
              onClick={() => setOpen(true)}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-slate-900/10 hover:bg-slate-800 active:translate-y-px dark:bg-slate-100 dark:text-slate-900 dark:ring-white/10 dark:hover:bg-white"
            >
              Login
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-14">
        <section className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
              Simple starter kit
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                Next.js + Supabase
              </span>
            </p>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
              Build auth &amp; CRUD in minutes.
            </h1>
            <p className="mt-4 max-w-xl text-base text-slate-600 dark:text-slate-300">
              Passwordless login (magic link) and a tiny todos app with RLS.
              Clean UI, dark-mode friendly, and easy to extend.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                onClick={() => setOpen(true)}
                className="inline-flex h-11 items-center justify-center rounded-md bg-slate-900 px-5 text-sm font-semibold text-white shadow-sm ring-1 ring-slate-900/10 hover:bg-slate-800 active:translate-y-px dark:bg-slate-100 dark:text-slate-900 dark:ring-white/10 dark:hover:bg-white"
              >
                Login to continue
              </button>
              <Link
                href="/account"
                className="inline-flex h-11 items-center justify-center rounded-md border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-900 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
              >
                View account page
              </Link>
            </div>

            <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
              Tip: after login, open <span className="font-medium">Account</span>{" "}
              to manage todos.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="rounded-2xl bg-slate-950 p-6 text-slate-100">
              <p className="text-xs font-semibold text-slate-300">Preview</p>
              <p className="mt-2 text-sm text-slate-200">
                You’ll get:
              </p>
              <ul className="mt-3 space-y-2 text-sm text-slate-200">
                <li className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
                  Magic-link login
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
                  Protected account page
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
                  Todos CRUD with RLS
                </li>
              </ul>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Feature
                title="Fast setup"
                body="Add keys in .env.local and run the SQL from /account."
              />
              <Feature
                title="Secure by default"
                body="RLS policies keep each user’s todos private."
              />
            </div>
          </div>
        </section>

        <section className="mt-14 grid gap-4 sm:grid-cols-3">
          <Feature title="Next.js App Router" body="Modern routing and layouts." />
          <Feature title="Supabase Auth" body="Passwordless email sign-in." />
          <Feature title="Tailwind UI" body="Clean components, dark-mode ready." />
        </section>

        <footer className="mt-16 border-t border-slate-200 pt-8 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p>Made to be a minimal, hackable starter.</p>
            <button
              onClick={() => setOpen(true)}
              className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              Login
            </button>
          </div>
        </footer>
      </main>

      {open ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 px-6 py-10"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            ref={dialogRef}
            className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-slate-950"
          >
            <div className="flex items-center justify-between gap-3 pb-3">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Login
              </p>
              <button
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-1 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
                aria-label="Close"
              >
                Close
              </button>
            </div>
            <Auth />
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              After signing in, go to{" "}
              <Link className="underline" href="/account">
                /account
              </Link>
              .
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
