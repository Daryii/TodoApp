"use client"; // Client Component voor interactie

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="backdrop-blur-xl bg-[rgba(31,23,35,0.7)] border border-white/10 rounded-2xl p-7 shadow-[0_16px_48px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,87,34,0.4),inset_0_1px_0_rgba(255,255,255,0.05)]">
      <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-[#ff5722] bg-clip-text text-transparent">
        Login to your account
      </h2>
      <p className="text-gray-400 text-sm mb-4">
        Enter your email below to login to your account
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="m@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full bg-[rgba(20,15,15,0.6)] border border-[rgba(74,55,55,0.5)] rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:border-[#ff5722] focus:shadow-[0_0_0_3px_rgba(255,87,34,0.4)] outline-none transition-all"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full bg-[rgba(20,15,15,0.6)] border border-[rgba(74,55,55,0.5)] rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:border-[#ff5722] focus:shadow-[0_0_0_3px_rgba(255,87,34,0.4)] outline-none transition-all"
        />

        {error && (
          <p className="text-[#ff8a80] text-sm">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-[#ff5722] to-[#f4511e] text-white font-bold py-3 rounded-xl shadow-[0_4px_14px_rgba(255,87,34,0.3)] hover:shadow-[0_6px_20px_rgba(255,87,34,0.4)] hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50"
        >
          {loading ? "Loading..." : "Login"}
        </button>

        <a
          href="/auth/signup"
          className="block text-center border border-[#3a2d2d] rounded-xl py-2.5 text-white hover:border-[#ff5722] hover:text-[#ff5722] transition-all"
        >
          Don't have an account? Sign up
        </a>
      </form>
    </div>
  );
}

