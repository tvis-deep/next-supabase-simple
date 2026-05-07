"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

type Profile = {
  id: string;
  email: string | null;
  phone: string | null;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  updated_at: string | null;
};

const PROFILE_SQL = `-- Run this in Supabase SQL editor
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  phone text,
  full_name text,
  bio text,
  avatar_url text,
  is_admin boolean not null default false,
  updated_at timestamptz
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
on public.profiles for select
using (auth.uid() = id);

create policy "Users can insert their own profile"
on public.profiles for insert
with check (auth.uid() = id and is_admin = false);

-- Prevent self-escalation: users can update their row, but cannot change is_admin.
create policy "Users can update their own profile (no admin change)"
on public.profiles for update
using (auth.uid() = id)
with check (
  auth.uid() = id
  and is_admin = (select p.is_admin from public.profiles p where p.id = auth.uid())
);
`;

const STORAGE_NOTE = `-- Storage setup (one-time)
-- Create a bucket named: avatars
-- Bucket should be PRIVATE (recommended).
-- Then add a policy that allows authenticated users to manage only their own files (path = auth.uid()).

-- Example policy idea (adjust in UI/SQL based on your Supabase version):
-- Store files under: avatars/{userId}/...
`;

async function toAvatarUrl(path: string) {
  const supabase = getSupabaseBrowserClient();
  const { data: signed, error } = await supabase.storage
    .from("avatars")
    .createSignedUrl(path, 60 * 60);

  if (!error && signed?.signedUrl) return signed.signedUrl;

  // Fallback for public buckets.
  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return data.publicUrl;
}

export function ProfileClient({
  userId,
  email,
}: {
  userId: string;
  email: string;
}) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>("");
  const [info, setInfo] = useState<string>("");

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [avatarPath, setAvatarPath] = useState<string>("");

  useEffect(() => {
    const init = async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data: row, error: selectError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .maybeSingle();

        if (selectError) {
          setError(selectError.message);
          setLoading(false);
          return;
        }

        const profile = (row ?? null) as Profile | null;
        setFullName(profile?.full_name ?? "");
        setPhone(profile?.phone ?? "");
        setBio(profile?.bio ?? "");
        const storedPathOrUrl = profile?.avatar_url ?? "";
        setAvatarPath(storedPathOrUrl);
        if (storedPathOrUrl) {
          const resolved =
            storedPathOrUrl.startsWith("http")
              ? storedPathOrUrl
              : await toAvatarUrl(storedPathOrUrl);
          setAvatarUrl(resolved);
        } else {
          setAvatarUrl("");
        }

        setLoading(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load profile.");
        setLoading(false);
      }
    };

    void init();
  }, [userId]);

  const save = async () => {
    const supabase = getSupabaseBrowserClient();
    setSaving(true);
    setError("");
    setInfo("");

    const updates: Partial<Profile> = {
      id: userId,
      email,
      phone: phone || null,
      full_name: fullName || null,
      bio: bio || null,
      avatar_url: avatarPath || null,
      updated_at: new Date().toISOString(),
    };

    const { error: upsertError } = await supabase
      .from("profiles")
      .upsert(updates, { onConflict: "id" });

    if (upsertError) {
      setError(upsertError.message);
      setSaving(false);
      return;
    }

    setInfo("Saved.");
    setSaving(false);
  };

  const onPickAvatar = async (file: File | null) => {
    if (!file) return;
    const supabase = getSupabaseBrowserClient();
    setUploading(true);
    setError("");
    setInfo("");

    const ext = file.name.split(".").pop() || "png";
    const filePath = `${userId}/${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true, contentType: file.type });

    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }

    const url = await toAvatarUrl(filePath);
    setAvatarPath(filePath);
    setAvatarUrl(url);
    setUploading(false);
  };

  const signOut = async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.replace("/");
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
            <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Update your details and avatar.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/account"
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              Account
            </Link>
            <button
              onClick={() => void signOut()}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm ring-1 ring-slate-900/10 hover:bg-slate-800 active:translate-y-px dark:bg-slate-100 dark:text-slate-900 dark:ring-white/10 dark:hover:bg-white"
            >
              Sign out
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-6 sm:flex-row">
            <div className="sm:w-44">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Photo
              </p>
              <div className="mt-3 flex items-center gap-4">
                <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt="Avatar"
                      src={avatarUrl}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    "No photo"
                  )}
                </div>
                <label className="inline-flex cursor-pointer items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800">
                  {uploading ? "Uploading…" : "Upload"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) =>
                      void onPickAvatar(e.target.files?.[0] ?? null)
                    }
                  />
                </label>
              </div>
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                Stores the image in Supabase Storage.
              </p>
            </div>

            <div className="flex-1">
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Email
                  </label>
                  <input
                    value={email}
                    disabled
                    className="mt-2 w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none ring-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:ring-slate-800"
                  />
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Email comes from Supabase Auth.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                      Full name
                    </label>
                    <input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-200 placeholder:text-slate-400 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:ring-slate-800 dark:placeholder:text-slate-500"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                      Phone
                    </label>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-200 placeholder:text-slate-400 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:ring-slate-800 dark:placeholder:text-slate-500"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Bio
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    className="mt-2 w-full resize-none rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-200 placeholder:text-slate-400 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:ring-slate-800 dark:placeholder:text-slate-500"
                    placeholder="A couple of lines about you…"
                  />
                </div>
              </div>

              <div className="mt-5 flex items-center gap-3">
                <button
                  onClick={() => void save()}
                  disabled={saving || uploading}
                  className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-slate-900/10 hover:bg-slate-800 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:ring-white/10 dark:hover:bg-white"
                >
                  {saving ? "Saving…" : "Save changes"}
                </button>
                {error ? (
                  <p className="text-sm text-red-600 dark:text-red-300">
                    {error}
                  </p>
                ) : info ? (
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">
                    {info}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Supabase setup
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Create the{" "}
            <code className="rounded bg-slate-100 px-1 py-0.5 text-slate-900 dark:bg-slate-800 dark:text-slate-100">
              profiles
            </code>{" "}
            table + RLS:
          </p>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-950 p-4 text-xs text-slate-100">
            {PROFILE_SQL}
          </pre>
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
            Storage notes (avatars bucket):
          </p>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-950 p-4 text-xs text-slate-100">
            {STORAGE_NOTE}
          </pre>
        </div>
      </main>
    </div>
  );
}

