"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function checkUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user || null);
      setLoading(false);
    }
    checkUser();
  }, []);

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
      } else {
        // Login successful: Redirect directly to Homepage instead of reloading or staying on account view
        router.push("/");
        router.refresh();
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
      } else {
        alert("Registration successful! Please login.");
        setIsLogin(true);
        setLoading(false);
      }
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="min-h-[70vh] flex items-center justify-center bg-[#faf8f3]">
        <p className="text-sm text-gray-400">Loading account...</p>
      </main>
    );
  }

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-6 py-12 bg-[#faf8f3]">
      <div className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-sm border border-[#e9e5dc]">
        
        {/* Close / Cross Button to go Home */}
        <Link
          href="/"
          className="absolute top-5 right-5 h-8 w-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-black transition"
          title="Close"
        >
          ✕
        </Link>

        {user ? (
          // IF USER IS LOGGED IN: Show Profile Dashboard (Agar koi direct /account URL khole)
          <div className="text-center space-y-6 pt-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#a77b48]">
                My Profile
              </span>
              <h1 className="text-2xl font-bold text-[#293b2b] mt-1">Welcome Back!</h1>
              <p className="text-xs text-gray-500 mt-1 break-all bg-gray-50 py-2 px-4 rounded-xl border border-gray-100">
                {user.email}
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <Link
                href="/my-orders"
                className="block w-full rounded-full bg-[#f0ede5] py-3 text-xs font-semibold text-[#293b2b] hover:bg-[#e4e1d8] transition text-center"
              >
                📦 View My Orders
              </Link>
              <button
                onClick={handleLogout}
                className="w-full rounded-full bg-red-50 py-3 text-xs font-semibold text-red-600 hover:bg-red-100 transition"
              >
                Logout from Account
              </button>
            </div>

            <div className="pt-2">
              <Link href="/" className="text-xs text-gray-500 hover:text-[#a77b48] underline transition">
                ← Back to Home
              </Link>
            </div>
          </div>
        ) : (
          // IF USER IS NOT LOGGED IN: Show Login/Signup Form
          <>
            <div className="text-center mb-6">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#a77b48]">
                Secure Access
              </span>
              <h1 className="text-2xl font-bold text-[#293b2b] mt-1">
                {isLogin ? "Welcome Back" : "Create Account"}
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Manage your orders and activity
              </p>
            </div>

            {/* Tab Switcher */}
            <div className="grid grid-cols-2 gap-1 rounded-full bg-[#f0ede5] p-1 mb-6">
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className={`rounded-full py-2 text-xs font-semibold transition ${
                  isLogin ? "bg-[#293b2b] text-white shadow-sm" : "text-gray-600 hover:text-black"
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className={`rounded-full py-2 text-xs font-semibold transition ${
                  !isLogin ? "bg-[#293b2b] text-white shadow-sm" : "text-gray-600 hover:text-black"
                }`}
              >
                Sign Up
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs text-red-600 text-center border border-red-100">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-[#292b20] bg-white outline-none focus:border-[#293b2b]"
                  placeholder="name@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-[#292b20] bg-white outline-none focus:border-[#293b2b]"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-[#293b2b] py-3 text-xs font-semibold text-white hover:bg-[#3c513e] transition disabled:opacity-50 mt-2"
              >
                {loading ? "Please wait..." : isLogin ? "Login to Account" : "Register Now"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link href="/" className="text-xs text-gray-500 hover:text-[#a77b48] underline transition">
                ← Continue Shopping
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}