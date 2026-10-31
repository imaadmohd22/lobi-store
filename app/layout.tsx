"use client";

import { useEffect, useState } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkUserAndRole() {
      const { data } = await supabase.auth.getUser();
      const currentUser = data.user || null;
      setUser(currentUser);

      if (currentUser) {
        // Fetch role dynamically from profiles table
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", currentUser.id)
          .single();

        setIsAdmin(profile?.role === "admin");
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    }

    checkUserAndRole();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          checkUserAndRole();
        } else {
          setUser(null);
          setIsAdmin(false);
          setLoading(false);
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#faf8f3] text-[#292b20] min-h-screen flex flex-col`}>
        {/* Top Announcement Bar */}
        <div className="bg-[#293b2b] text-[#faf8f3] text-xs text-center py-2 px-4 font-medium tracking-wide">
          Welcome to LOBI — Crafted with nature, made for living.
        </div>

        {/* Dynamic Header */}
        <header className="border-b border-[#e9e5dc] bg-[#faf8f3] px-6 py-4 sticky top-0 z-50">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            {/* Logo */}
            <Link href="/" className="text-2xl font-black tracking-[0.2em] text-[#293b2b]">
              LOBI<span className="text-[#a77b48]">.</span>
            </Link>

            {/* Center Navigation */}
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#292b20]">
              <Link href="/" className="hover:text-[#a77b48] transition">Home</Link>
              <Link href="/shop" className="hover:text-[#a77b48] transition">Shop</Link>
              <Link href="/collections" className="hover:text-[#a77b48] transition">Collections</Link>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-5 text-sm font-medium text-[#292b20]">
              {loading ? (
                <span className="text-xs text-gray-400">...</span>
              ) : user ? (
                <>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="rounded-full bg-[#a77b48] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#8e663a] transition shadow-sm"
                    >
                      ⚙️ Admin Panel
                    </Link>
                  )}
                  <Link href="/my-orders" className="hover:text-[#a77b48] transition">
                    Orders
                  </Link>
                  <Link href="/account" className="hover:text-[#a77b48] transition">
                    My Account
                  </Link>
                </>
              ) : (
                <Link
                  href="/account"
                  className="rounded-full bg-[#293b2b] px-5 py-2 text-xs font-semibold text-white hover:bg-[#3c513e] transition"
                >
                  Login
                </Link>
              )}

              <Link href="/cart" className="flex items-center gap-1.5 hover:text-[#a77b48] transition">
                <span>Cart</span>
                <span className="text-xs">🛒</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-grow">{children}</div>

        {/* Footer with Legal Links */}
        <footer className="border-t border-[#e9e5dc] bg-[#f0ede5] py-8 text-center text-xs text-gray-600">
          <div className="mx-auto max-w-7xl flex flex-wrap justify-center gap-6 mb-4 font-medium">
            <Link href="/terms" className="hover:text-[#a77b48] transition">Terms & Conditions</Link>
            <Link href="/privacy" className="hover:text-[#a77b48] transition">Privacy Policy</Link>
            <Link href="/refund-policy" className="hover:text-[#a77b48] transition">Refund Policy</Link>
          </div>
          <p>&copy; {new Date().getFullYear()} LOBI. All rights reserved. Crafted with nature.</p>
        </footer>
      </body>
    </html>
  );
}