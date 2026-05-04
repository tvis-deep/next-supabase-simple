"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

type Todo = {
  id: string;
  task: string;
  is_complete: boolean;
  inserted_at: string;
  user_id: string;
};

export function Todos() {
  const [userId, setUserId] = useState<string | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTask, setNewTask] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const sortedTodos = useMemo(() => {
    return [...todos].sort((a, b) => (a.inserted_at < b.inserted_at ? 1 : -1));
  }, [todos]);

  useEffect(() => {
    const init = async () => {
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (!session) {
        setLoading(false);
        return;
      }
      setUserId(session.user.id);
      await refresh(session.user.id);
      setLoading(false);
    };
    void init();
  }, []);

  const refresh = async (uid: string) => {
    const supabase = getSupabaseBrowserClient();
    setError("");
    const { data, error: selectError } = await supabase
      .from("todos")
      .select("*")
      .eq("user_id", uid);
    if (selectError) {
      setError(selectError.message);
      return;
    }
    setTodos((data ?? []) as Todo[]);
  };

  const addTodo = async () => {
    if (!userId || !newTask.trim()) return;
    const supabase = getSupabaseBrowserClient();
    setError("");
    const task = newTask.trim();
    setNewTask("");

    const { error: insertError } = await supabase
      .from("todos")
      .insert({ user_id: userId, task });

    if (insertError) {
      setError(insertError.message);
      return;
    }
    await refresh(userId);
  };

  const toggleTodo = async (todo: Todo) => {
    const supabase = getSupabaseBrowserClient();
    setError("");
    const { error: updateError } = await supabase
      .from("todos")
      .update({ is_complete: !todo.is_complete })
      .eq("id", todo.id);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    if (userId) await refresh(userId);
  };

  const deleteTodo = async (todo: Todo) => {
    const supabase = getSupabaseBrowserClient();
    setError("");
    const { error: deleteError } = await supabase
      .from("todos")
      .delete()
      .eq("id", todo.id);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    if (userId) await refresh(userId);
  };

  if (loading) return <p className="text-sm text-slate-600">Loading…</p>;
  if (!userId)
    return (
      <p className="text-sm text-slate-600">
        Sign in first to see your todos.
      </p>
    );

  return (
    <div className="w-full rounded-xl border border-slate-200 bg-white p-6 text-slate-900 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700">
            New todo
          </label>
          <input
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void addTodo();
            }}
            className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-200 placeholder:text-slate-400 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:ring-slate-800 dark:placeholder:text-slate-500"
            placeholder="Buy milk"
          />
        </div>
        <button
          onClick={() => void addTodo()}
          disabled={!newTask.trim()}
          className="h-10 rounded-md bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Add
        </button>
      </div>

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

      <ul className="mt-6 space-y-2">
        {sortedTodos.length === 0 ? (
          <li className="text-sm text-slate-600">No todos yet.</li>
        ) : (
          sortedTodos.map((todo) => (
            <li
              key={todo.id}
              className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
            >
              <button
                onClick={() => void toggleTodo(todo)}
                className="flex-1 text-left text-sm"
              >
                <span
                  className={
                    todo.is_complete
                      ? "text-slate-500 line-through"
                      : "text-slate-900"
                  }
                >
                  {todo.task}
                </span>
              </button>
              <button
                onClick={() => void deleteTodo(todo)}
                className="rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
