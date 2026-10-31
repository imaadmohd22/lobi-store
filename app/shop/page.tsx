"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function ShopPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase.from("products").select("*");
      if (!error && data) {
        setProducts(data);
      }
      setLoading(false);
    }
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#faf8f3] px-6 py-10 text-[#292b20]">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#293b2b]">All Products</h1>
            <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">
              Explore our complete collection
            </p>
          </div>

          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-72 rounded-full border border-[#e9e5dc] bg-white px-5 py-2.5 text-sm outline-none focus:border-[#293b2b]"
          />
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading shop...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 text-gray-500">No products found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className="group rounded-3xl bg-white p-4 border border-[#e9e5dc] shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-square w-full rounded-2xl bg-[#f0ede5] overflow-hidden mb-4">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs">
                        No Image
                      </div>
                    )}
                  </div>
                  <h2 className="font-semibold text-[#293b2b] text-base group-hover:text-[#a77b48] transition">
                    {product.name}
                  </h2>
                  <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                    {product.description}
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                  <span className="font-bold text-[#293b2b]">
                    ₹{Number(product.price).toLocaleString("en-IN")}
                  </span>
                  <span className="text-xs font-semibold text-[#a77b48]">
                    View →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}