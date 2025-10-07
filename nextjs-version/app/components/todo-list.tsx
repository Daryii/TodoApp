"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [loading, setLoading] = useState<string | null>(null); // Track loading by action id
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

    setLoading("add");

    // Generate custom ID (text type in DB)
    const todoId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    const { data, error } = await supabase
      .from("todos")
      .insert({
        id: todoId,
        text: newTodo.trim(),
        user_id: user.id,
        completed: false,
      })
      .select()
      .single();

    setLoading(null);
    if (!error && data) {
      setTodos([data, ...todos]);
      setNewTodo("");
      toast.success("Todo added!");
    } else {
      console.error("Add todo error:", error);
      toast.error(error?.message || "Failed to add todo");
    }
  }

  async function toggleTodo(id: string, completed: boolean) {
    // Optimistic update
    setTodos(todos.map((t) => (t.id === id ? { ...t, completed } : t)));

    const { error } = await supabase
      .from("todos")
      .update({ completed })
      .eq("id", id);

    if (error) {
      // Revert on error
      setTodos(
        todos.map((t) => (t.id === id ? { ...t, completed: !completed } : t))
      );
      toast.error("Failed to update");
    }
  }

  async function deleteTodo(id: string) {
    // Optimistic update
    const original = todos;
    setTodos(todos.filter((t) => t.id !== id));

    const { error } = await supabase.from("todos").delete().eq("id", id);

    if (error) {
      setTodos(original);
      toast.error("Failed to delete");
    } else {
      toast.success("Todo deleted");
    }
  }

  async function startEdit(todo: Todo) {
    setEditingId(todo.id);
    setEditText(todo.text);
  }

  async function saveEdit(id: string) {
    if (!editText.trim()) {
      setEditingId(null);
      return;
    }

    setLoading(id);
    const { error } = await supabase
      .from("todos")
      .update({ text: editText.trim() })
      .eq("id", id);

    setLoading(null);
    if (!error) {
      setTodos(
        todos.map((t) => (t.id === id ? { ...t, text: editText.trim() } : t))
      );
      setEditingId(null);
      toast.success("Todo updated!");
    } else {
      toast.error("Failed to update");
    }
  }

  function cancelEdit() {
    setEditingId(null);
    setEditText("");
  }

  async function bulkDeleteCompleted() {
    const completedIds = todos.filter((t) => t.completed).map((t) => t.id);
    if (completedIds.length === 0) {
      toast.error("No completed todos to delete");
      return;
    }

    setLoading("bulk-delete");
    const { error } = await supabase
      .from("todos")
      .delete()
      .in("id", completedIds);
    setLoading(null);

    if (!error) {
      setTodos(todos.filter((t) => !t.completed));
      toast.success(`Deleted ${completedIds.length} completed todo(s)`);
    } else {
      toast.error("Failed to delete");
    }
  }

  const completedCount = todos.filter((t) => t.completed).length;

  return (
    <div className="space-y-4">
      <form onSubmit={addTodo} className="flex gap-2">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a todo"
          maxLength={200}
          disabled={loading === "add"}
          className="flex-1 bg-transparent border border-[#3a2d2d] rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:border-[#ff5722] focus:shadow-[0_0_0_3px_rgba(255,87,34,0.4)] outline-none transition-all disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading === "add"}
          className="bg-gradient-to-r from-[#ff5722] to-[#f4511e] text-white font-semibold px-5 py-2.5 rounded-lg hover:brightness-105 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 min-w-[70px]"
        >
          {loading === "add" ? "..." : "ADD"}
        </button>
      </form>

      <div className="flex justify-between items-center">
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

        {completedCount > 0 && (
          <button
            onClick={bulkDeleteCompleted}
            disabled={loading === "bulk-delete"}
            className="text-sm text-gray-400 hover:text-[#ff5722] transition-colors disabled:opacity-50"
          >
            {loading === "bulk-delete"
              ? "Deleting..."
              : `Clear ${completedCount} completed`}
          </button>
        )}
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
                disabled={editingId === todo.id}
                className="w-5 h-5 rounded border-2 border-[#3a2d2d] bg-[#1a1313] checked:bg-[#2a2020] checked:border-gray-300 cursor-pointer disabled:opacity-50"
              />

              {editingId === todo.id ? (
                <>
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEdit(todo.id);
                      if (e.key === "Escape") cancelEdit();
                    }}
                    autoFocus
                    className="flex-1 bg-transparent border border-[#ff5722] rounded px-2 py-1 text-white outline-none"
                  />
                  <button
                    onClick={() => saveEdit(todo.id)}
                    disabled={loading === todo.id}
                    className="text-green-400 hover:text-green-300 text-sm px-2 disabled:opacity-50"
                  >
                    {loading === todo.id ? "..." : "✓"}
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="text-red-400 hover:text-red-300 text-sm px-2"
                  >
                    ✕
                  </button>
                </>
              ) : (
                <>
                  <span
                    onDoubleClick={() => startEdit(todo)}
                    className={`flex-1 cursor-pointer ${
                      todo.completed ? "line-through opacity-60" : ""
                    }`}
                    title="Double-click to edit"
                  >
                    {todo.text}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTodo(todo.id);
                    }}
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
                </>
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
