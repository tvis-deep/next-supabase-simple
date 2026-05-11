import Link from "next/link";

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

          <form className="mt-4" action="/auth/magic-link" method="post">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Email
            </label>
            <input
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-200 placeholder:text-slate-400 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:ring-slate-800 dark:placeholder:text-slate-500"
            />
            <button
              type="submit"
              className="mt-4 w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Send magic link
            </button>

            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              After you click the link in your email, you’ll be signed in.
            </p>
          </form>

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
