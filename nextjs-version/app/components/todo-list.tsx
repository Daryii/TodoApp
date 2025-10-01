"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Todo = {
  id: string;
  text: string;
  completed: boolean;
  created_at: string;
};

export function TodoList({ initialTodos }: { initialTodos: Todo[] }) {
  const [todos, setTodos] = useState(initialTodos);
  const [newTodo, setNewTodo] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const router = useRouter();
  const supabase = createClient();

  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  async function addTodo(e: React.FormEvent) {
    e.preventDefault();
    if (!newTodo.trim()) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("todos")
      .insert({
        text: newTodo.trim(),
        user_id: user.id,
        completed: false,
      })
      .select()
      .single();

    if (!error && data) {
      setTodos([data, ...todos]);
      setNewTodo("");
    }
  }

  async function toggleTodo(id: string, completed: boolean) {
    await supabase.from("todos").update({ completed }).eq("id", id);

    setTodos(todos.map((t) => (t.id === id ? { ...t, completed } : t)));
  }

  async function deleteTodo(id: string) {
    if (!confirm("Delete this todo?")) return;

    await supabase.from("todos").delete().eq("id", id);
    setTodos(todos.filter((t) => t.id !== id));
  }

  return (
    <div className="space-y-4">
      <form onSubmit={addTodo} className="flex gap-2">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a todo"
          maxLength={200}
          className="flex-1 bg-transparent border border-[#3a2d2d] rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:border-[#ff5722] focus:shadow-[0_0_0_3px_rgba(255,87,34,0.4)] outline-none transition-all"
        />
        <button
          type="submit"
          className="bg-gradient-to-r from-[#ff5722] to-[#f4511e] text-white font-semibold px-5 py-2.5 rounded-lg hover:brightness-105 hover:-translate-y-0.5 active:translate-y-0 transition-all"
        >
          ADD
        </button>
      </form>

      <div className="flex gap-2">
        {(["all", "active", "completed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-2 rounded-lg border transition-all capitalize ${
              filter === f
                ? "bg-[#ff5722] text-black border-[#ff5722]"
                : "border-[#3a2d2d] text-white hover:border-[#ff5722]"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <ul className="space-y-0">
        {filteredTodos.length === 0 ? (
          <p className="text-gray-500 py-3">
            {todos.length === 0
              ? "No todos yet. Add one above."
              : filter === "active"
              ? "No active todos."
              : "No completed todos."}
          </p>
        ) : (
          filteredTodos.map((todo) => (
            <li
              key={todo.id}
              className="flex items-center gap-2 py-3 border-b border-[#2a2020]"
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={(e) => toggleTodo(todo.id, e.target.checked)}
                className="w-5 h-5 rounded border-2 border-[#3a2d2d] bg-[#1a1313] checked:bg-[#2a2020] checked:border-gray-300 cursor-pointer"
              />
              <span
                className={`flex-1 ${
                  todo.completed ? "line-through opacity-60" : ""
                }`}
              >
                {todo.text}
              </span>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="p-1 opacity-80 hover:opacity-100 transition-opacity"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 -960 960 960"
                  width="24px"
                  fill="#e3e3e3"
                >
                  <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
                </svg>
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
