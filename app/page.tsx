"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  image_url: string | null;
  stock: number;
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  async function fetchProducts() {
    setLoading(true);
    let query = supabase.from("products").select("*").eq("is_published", true);

    if (selectedCategory !== "All") {
      query = query.eq("category", selectedCategory);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      console.error(error.message);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  }

  const categories = ["All", "Furniture", "Home Decor", "Kitchen & Dining", "Accessories"];

  return (
    <main className="min-h-screen bg-[#faf8f3] text-[#292b20]">
      {/* Hero Section */}
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 md:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-[#a77b48] font-semibold">
            The Art of Natural Living
          </p>
          <h1 className="mt-4 text-5xl font-semibold tracking-tight md:text-6xl text-[#293b2b]">
            Bring home the beauty of wood.
          </h1>
          <p className="mt-6 text-base leading-relaxed text-[#77766c]">
            Discover thoughtfully crafted wooden furniture, home decor, and everyday essentials made to bring warmth to your space.
          </p>
          <div className="mt-8 flex items-center gap-4">
            <a
              href="#shop-section"
              className="rounded-full bg-[#293b2b] px-8 py-4 text-sm font-semibold text-white hover:bg-[#3c513e] transition"
            >
              Shop Collection →
            </a>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl bg-[#e8dfd0] shadow-sm">
          <img
            src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=1000"
            alt="Wooden Interior"
            className="h-[450px] w-full object-cover"
          />
        </div>
      </section>

      {/* Shop Section */}
      <section id="shop-section" className="mx-auto max-w-7xl px-6 py-16 border-t border-[#e9e5dc]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#a77b48] font-semibold">Curated Catalog</p>
            <h2 className="mt-2 text-3xl font-semibold text-[#293b2b]">Explore Our Pieces</h2>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-5 py-2 text-xs font-semibold transition ${
                  selectedCategory === cat
                    ? "bg-[#293b2b] text-white"
                    : "bg-white border border-[#d8d2c6] text-[#292b20] hover:bg-[#f0ede5]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="py-20 text-center text-gray-500">Loading collection...</div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center text-gray-500">No products found in this category.</div>
        ) : (
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className="group rounded-3xl bg-white p-4 shadow-sm border border-[#e9e5dc] hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-square overflow-hidden rounded-2xl bg-[#e8dfd0]">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-4xl">🪵</div>
                    )}
                  </div>
                  <p className="mt-4 text-xs uppercase tracking-wider text-[#a77b48]">{product.category}</p>
                  <h3 className="mt-1 font-semibold text-[#293b2b] group-hover:text-[#a77b48] transition">
                    {product.name}
                  </h3>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <span className="text-lg font-semibold text-[#293b2b]">
                    ₹{Number(product.price).toLocaleString("en-IN")}
                  </span>
                  <span className="rounded-full bg-[#f0ede5] px-3 py-1 text-xs font-medium text-[#293b2b]">
                    View →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}