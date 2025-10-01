import { SignupForm } from "./signup-form";

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1625] to-[#0f0a18] flex flex-col items-center justify-center p-4">
      <h1 className="text-5xl font-bold mb-8 bg-gradient-to-r from-white to-[#ff5722] bg-clip-text text-transparent">
        Todo App ✅
      </h1>

      <div className="w-full max-w-md">
        <SignupForm />
      </div>
    </div>
  );
}
