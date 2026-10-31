"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Form states (supporting both Add and Edit)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Furniture");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    async function checkAdminAndFetch() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/account");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "admin") {
        router.push("/");
        return;
      }

      fetchProducts();
    }
    checkAdminAndFetch();
  }, [router]);

  async function fetchProducts() {
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    if (data) setProducts(data);
    setLoading(false);
  }

  async function handleSaveProduct(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    setSubmitting(true);

    if (editingId) {
      // Update existing product
      const { error } = await supabase
        .from("products")
        .update({
          name,
          price: Number(price),
          category,
          description,
          image_url: imageUrl,
          images: [imageUrl],
        })
        .eq("id", editingId);

      if (error) {
        setFeedback({ text: "Failed to update product: " + error.message, type: "error" });
      } else {
        setFeedback({ text: "Product updated successfully!", type: "success" });
        resetForm();
        fetchProducts();
      }
    } else {
      // Add new product
      const { error } = await supabase.from("products").insert([
        {
          name,
          price: Number(price),
          category,
          description,
          image_url: imageUrl,
          images: [imageUrl],
        },
      ]);

      if (error) {
        setFeedback({ text: "Failed to add product: " + error.message, type: "error" });
      } else {
        setFeedback({ text: "Product added successfully!", type: "success" });
        resetForm();
        fetchProducts();
      }
    }
    setSubmitting(false);
  }

  function handleEditClick(prod: any) {
    setEditingId(prod.id);
    setName(prod.name || "");
    setPrice(prod.price || "");
    setCategory(prod.category || "Furniture");
    setDescription(prod.description || "");
    setImageUrl(prod.image_url || prod.images?.[0] || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setName("");
    setPrice("");
    setCategory("Furniture");
    setDescription("");
    setImageUrl("");
  }

  async function handleDeleteProduct(id: string) {
    if (!confirm("Are you sure you want to delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (!error) {
      setProducts(products.filter((p) => p.id !== id));
      if (editingId === id) resetForm();
    } else {
      alert("Failed to delete product");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f3]">
        <p className="text-sm text-gray-400">Loading products manager...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf8f3] px-6 py-10 text-[#292b20]">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#a77b48]">
              Inventory Management
            </span>
            <h1 className="text-3xl font-bold text-[#293b2b] mt-1">Manage Products</h1>
          </div>
          <Link
            href="/admin"
            className="rounded-full bg-white px-5 py-2.5 text-xs font-semibold text-gray-600 border border-[#e9e5dc] hover:bg-gray-50 transition"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Add / Edit Product Form */}
        <div className="bg-white p-6 rounded-3xl border border-[#e9e5dc] shadow-sm max-w-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-[#293b2b]">
              {editingId ? "Edit Product" : "Add New Product"}
            </h2>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-[10px] font-bold text-gray-400 hover:text-black uppercase tracking-wider"
              >
                Cancel Edit
              </button>
            )}
          </div>

          {feedback && (
            <div className={`mb-4 p-3 rounded-xl text-xs border ${feedback.type === "error" ? "bg-red-50 text-red-600 border-red-200" : "bg-green-50 text-green-700 border-green-200"}`}>
              {feedback.text}
            </div>
          )}

          <form onSubmit={handleSaveProduct} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Oak Wood Chair"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs bg-white outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Price (₹)</label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 4999"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs bg-white outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Furniture / Decor"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs bg-white outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Image URL</label>
                <input
                  type="url"
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs bg-white outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Product description..."
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs bg-white outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-[#293b2b] px-6 py-2.5 text-xs font-semibold text-white hover:bg-[#3c513e] transition disabled:opacity-50"
            >
              {submitting ? "Saving..." : editingId ? "Update Product" : "+ Add Product"}
            </button>
          </form>
        </div>

        {/* Products List with Edit & Delete */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[#293b2b]">Existing Products ({products.length})</h2>
          {products.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-[#e9e5dc]">
              <p className="text-sm text-gray-400">No products found in store.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.map((prod) => (
                <div key={prod.id} className="bg-white p-5 rounded-3xl border border-[#e9e5dc] flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img src={prod.image_url || prod.images?.[0]} alt={prod.name} className="h-16 w-16 rounded-2xl object-cover bg-gray-100" />
                    <div>
                      <h3 className="text-sm font-bold text-[#293b2b]">{prod.name}</h3>
                      <p className="text-xs text-[#a77b48] font-semibold mt-0.5">₹{Number(prod.price).toLocaleString("en-IN")}</p>
                      <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">{prod.category || "Furniture"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditClick(prod)}
                      className="rounded-full bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(prod.id)}
                      className="rounded-full bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}