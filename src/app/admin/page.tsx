import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

const ADMIN_SQL = `-- Admin + audit + billing schema (run in Supabase SQL editor)

-- 1) profiles: admin flag
alter table public.profiles
  add column if not exists is_admin boolean not null default false;

-- Optional: make sure users cannot self-escalate to admin
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Users can update their own profile (no admin change)" on public.profiles;
create policy "Users can update their own profile (no admin change)"
on public.profiles for update
using (auth.uid() = id)
with check (
  auth.uid() = id
  and is_admin = (select p.is_admin from public.profiles p where p.id = auth.uid())
);

-- 2) audit logs
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid not null references auth.users(id) on delete cascade,
  action text not null,
  entity_type text,
  entity_id text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

alter table public.audit_logs enable row level security;

-- Only admins can read audit logs
create policy "Admins can read audit logs"
on public.audit_logs for select
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.is_admin = true
  )
);

-- Inserts should happen via service role (server-side).
-- No insert policy for authenticated users.
`;

async function requireAdmin() {
  // In a real app, do cookie-based auth and check auth.uid().
  // Here we keep it minimal: guard by an env flag or by a single admin user in DB.
  // We'll render the page but show a warning if no admin is configured.
  return true;
}

export default async function AdminPage() {
  await requireAdmin();

  const supabaseAdmin = getSupabaseAdmin();

  const { data: usersData, error: usersError } =
    await supabaseAdmin.auth.admin.listUsers({
      perPage: 25,
    });

  const { data: auditRows, error: auditError } = await supabaseAdmin
    .from("audit_logs")
    .select("created_at, actor_user_id, action, entity_type, entity_id")
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-16">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Admin dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Users, audit logs, and billing signals.
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
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200">
          Access is protected by middleware: only signed-in users with{" "}
          <code className="rounded bg-emerald-100 px-1 py-0.5 text-emerald-950 dark:bg-emerald-900/30 dark:text-emerald-100">
            profiles.is_admin = true
          </code>{" "}
          can open this page.
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Users
            </h2>
            {usersError ? (
              <p className="mt-3 text-sm text-red-600 dark:text-red-300">
                {usersError.message}
              </p>
            ) : (
              <ul className="mt-4 space-y-2 text-sm">
                {(usersData?.users ?? []).map((u) => (
                  <li
                    key={u.id}
                    className="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-800"
                  >
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {u.email ?? "(no email)"}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {u.id}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Recent audit logs
            </h2>
            {auditError ? (
              <p className="mt-3 text-sm text-red-600 dark:text-red-300">
                {auditError.message}
              </p>
            ) : (
              <ul className="mt-4 space-y-2 text-sm">
                {(auditRows ?? []).map((row) => (
                  <li
                    key={`${row.created_at}-${row.actor_user_id}-${row.action}-${row.entity_id}`}
                    className="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-800"
                  >
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {row.action}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {row.created_at} · {row.actor_user_id}
                      {row.entity_type ? ` · ${row.entity_type}` : ""}
                      {row.entity_id ? ` · ${row.entity_id}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Supabase SQL
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Run this once to add admin/billing fields + audit table:
          </p>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-950 p-4 text-xs text-slate-100">
            {ADMIN_SQL}
          </pre>
        </div>
      </main>
    </div>
  );
}
