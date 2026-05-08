import Link from "next/link";
import { Auth } from "@/components/Auth";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-12">
        <div className="mb-6">
          <Link
            href="/"
            className="text-sm font-medium text-slate-700 hover:underline dark:text-slate-300"
          >
            ← Back to home
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Login
          </p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Use a magic link (passwordless).
          </p>
          <div className="mt-4">
            <Auth />
          </div>
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            After signing in, go to{" "}
            <Link className="underline" href="/account">
              /account
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
