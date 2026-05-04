import { Auth } from "@/components/Auth";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto flex max-w-5xl flex-col items-center gap-10 px-6 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight">
            Next.js + Supabase (Simple)
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Passwordless auth + a tiny todos table.
          </p>
        </div>

        <Auth />

        <div className="w-full max-w-md rounded-xl border bg-white p-6 text-sm text-slate-700 shadow-sm">
          <p className="font-medium">Setup</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-slate-600">
            <li>
              Create a Supabase project and put keys in{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5">
                .env.local
              </code>
            </li>
            <li>
              Create a table called{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5">todos</code>{" "}
              (SQL provided on the account page).
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
