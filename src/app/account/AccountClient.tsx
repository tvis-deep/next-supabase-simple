"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Todos } from "@/components/Todos";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

const TODOS_SQL = `-- Run this in Supabase SQL editor
create table if not exists public.todos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  task text not null,
  is_complete boolean not null default false,
  inserted_at timestamptz not null default now()
);

alter table public.todos enable row level security;

create policy "Users can view their own todos"
on public.todos for select
using (auth.uid() = user_id);

create policy "Users can insert their own todos"
on public.todos for insert
with check (auth.uid() = user_id);

create policy "Users can update their own todos"
on public.todos for update
using (auth.uid() = user_id);

create policy "Users can delete their own todos"
on public.todos for delete
using (auth.uid() = user_id);
`;

export function AccountClient({ email }: { email: string }) {
  const router = useRouter();

  const signOut = async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.replace("/");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <main className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-16">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Account</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Signed in as <span className="font-medium">{email}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              Home
            </Link>
            <Link
              href="/profile"
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              Profile
            </Link>
            <button
              onClick={() => void signOut()}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
            >
              Sign out
            </button>
          </div>
        </div>

        <Todos />

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-semibold text-slate-900">
            Supabase SQL (todos table)
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Create the table + RLS policies:
          </p>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-950 p-4 text-xs text-slate-100">
            {TODOS_SQL}
          </pre>
        </div>
      </main>
    </div>
  );
}

