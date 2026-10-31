"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function CollectionsPage() {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      const { data, error } = await supabase.from("products").select("category");
      if (!error && data) {
        const uniqueCats = Array.from(
          new Set(data.map((item: any) => item.category).filter(Boolean))
        );
        setCategories(uniqueCats as string[]);
      }
      setLoading(false);
    }
    fetchCategories();
  }, []);

  return (
    <main className="min-h-screen bg-[#faf8f3] px-6 py-10 text-[#292b20]">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold text-[#293b2b]">Curated Collections</h1>
        <p className="text-xs text-gray-500 uppercase tracking-widest mt-1 mb-8">
          Browse by categories
        </p>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading collections...</div>
        ) : categories.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            No specific collections found. Explore all items in{" "}
            <Link href="/shop" className="text-[#a77b48] underline">
              Shop
            </Link>
            .
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((cat, idx) => (
              <Link
                key={idx}
                href={`/shop?category=${encodeURIComponent(cat)}`}
                className="group rounded-3xl bg-white p-8 border border-[#e9e5dc] shadow-sm hover:border-[#a77b48] transition flex flex-col justify-between h-48"
              >
                <div>
                  <span className="text-xs font-bold uppercase text-[#a77b48]">Collection</span>
                  <h2 className="text-2xl font-bold text-[#293b2b] mt-2 capitalize group-hover:text-[#a77b48] transition">
                    {cat}
                  </h2>
                </div>
                <div className="text-sm font-semibold text-[#293b2b] flex items-center gap-1">
                  Explore Category <span>→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}