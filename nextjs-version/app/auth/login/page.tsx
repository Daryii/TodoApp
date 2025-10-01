// Login page - Server Component met Client form
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1625] to-[#0f0a18] flex flex-col items-center justify-center p-4">
      <h1 className="text-5xl font-bold mb-8 bg-gradient-to-r from-white to-[#ff5722] bg-clip-text text-transparent">
        Todo App ✅
      </h1>
      
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  );
}

