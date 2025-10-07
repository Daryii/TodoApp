// Home page - Server Component
// Data wordt op de SERVER opgehaald, NIET in de browser
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TodoList } from "./components/todo-list";
import { LogoutButton } from "./components/logout-button";

export default async function HomePage() {
  const supabase = await createClient();

  // Check auth SERVER-SIDE
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Haal todos op SERVER-SIDE
  const { data: todos } = await supabase
    .from("todos")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--bg-start)] to-[var(--bg-end)] p-4 text-white pt-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-center items-center mb-6 mt-4 sm:mt-8">
          <h1 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-white to-[#ff5722] bg-clip-text text-transparent">
            Todo App ✅
          </h1>
        </div>

        <div className="backdrop-blur-xl bg-[rgba(31,23,35,0.7)] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-[0_16px_48px_rgba(0,0,0,0.5)]">
          <div className="flex justify-between items-center mb-4">
            <p className="text-white text-sm sm:text-base">
              Signed in as <span className="text-[#ff5722]">{user.email}</span>
            </p>
            <LogoutButton />
          </div>

          <TodoList initialTodos={todos || []} />
        </div>
      </div>
    </div>
  );
}
