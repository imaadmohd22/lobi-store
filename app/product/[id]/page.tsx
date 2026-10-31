"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

function ProductDetailContent() {
  const params = useParams();
  const id = params?.id;
  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);

  // New review form states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (!id) return;
    async function fetchProductAndReviews() {
      const { data: prodData } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (prodData) {
        setProduct(prodData);
        const imagesList = prodData.images || (prodData.image_url ? [prodData.image_url] : []);
        if (imagesList.length > 0) {
          setSelectedImage(imagesList[0]);
        }
      }

      const { data: revData } = await supabase
        .from("reviews")
        .select("*")
        .eq("product_id", id)
        .eq("is_approved", true)
        .order("created_at", { ascending: false });

      if (revData) {
        setReviews(revData);
      }

      setLoading(false);
    }
    fetchProductAndReviews();
  }, [id]);

  async function handleAddToCart() {
    setFeedback(null);
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;

    if (!user) {
      setFeedback({ text: "Please login first from the top right button to add items to your cart!", type: "error" });
      return;
    }
    setFeedback({ text: "Product added to cart successfully!", type: "success" });
  }

  async function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);

    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;

    if (!user) {
      setFeedback({ text: "Please login first from the top right button to submit a review.", type: "error" });
      return;
    }

    setSubmittingReview(true);
    const { error } = await supabase.from("reviews").insert([
      {
        product_id: id,
        user_id: user.id,
        rating: Number(rating),
        review_text: comment,
        is_approved: false,
      },
    ]);

    if (error) {
      setFeedback({ 
        text: "Failed to submit review: " + error.message, 
        type: "error" 
      });
    } else {
      setFeedback({ 
        text: "Thank you for your review!", 
        type: "success" 
      });
      setComment("");
      setRating(5);
    }
    setSubmittingReview(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f3]">
        <p className="text-sm text-gray-400">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#faf8f3] gap-4">
        <p className="text-sm text-gray-500">Product not found.</p>
        <Link href="/shop" className="text-xs font-semibold text-[#293b2b] underline">
          Back to Shop
        </Link>
      </div>
    );
  }

  const imagesList = product.images || (product.image_url ? [product.image_url] : []);

  return (
    <main className="min-h-screen bg-[#faf8f3] px-6 py-12 text-[#292b20]">
      <div className="mx-auto max-w-5xl space-y-12">
        {/* Top Section: Images & Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
          
          {/* Left: Image Gallery & Thumbnails */}
          <div className="space-y-4">
            <div className="aspect-square w-full rounded-3xl bg-[#f0ede5] overflow-hidden border border-[#e9e5dc] shadow-sm">
              <img
                src={selectedImage || imagesList[0]}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>

            {imagesList.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {imagesList.map((imgUrl: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(imgUrl)}
                    className={`relative h-20 w-20 flex-shrink-0 rounded-2xl overflow-hidden border-2 transition ${
                      selectedImage === imgUrl ? "border-[#293b2b] shadow-md scale-105" : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={imgUrl} alt="thumbnail" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Info & Cart */}
          <div className="space-y-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#a77b48]">
                {product.category || "Furniture"}
              </span>
              <h1 className="text-3xl font-bold text-[#293b2b] mt-1">{product.name}</h1>
              <p className="text-2xl font-bold text-[#293b2b] mt-2">
                ₹{Number(product.price).toLocaleString("en-IN")}
              </p>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">{product.description}</p>

            <div className="flex items-center gap-4">
              <span className="text-xs font-medium text-gray-600">Quantity</span>
              <div className="flex items-center rounded-xl border border-[#e9e5dc] bg-white px-3 py-1.5 gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="text-gray-500 hover:text-black font-bold"
                >
                  -
                </button>
                <span className="text-xs font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="text-gray-500 hover:text-black font-bold"
                >
                  +
                </button>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className="w-full rounded-full bg-[#293b2b] py-3.5 text-xs font-semibold text-white hover:bg-[#3c513e] transition shadow-sm text-center"
            >
              Add to Cart
            </button>

            <div>
              <Link href="/shop" className="text-xs font-semibold text-gray-500 hover:underline">
                ← Back to Products
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Section: Customer Reviews & Submission */}
        <div className="border-t border-[#e9e5dc] pt-10">
          <h2 className="text-xl font-bold text-[#293b2b] mb-6">Customer Reviews</h2>

          {/* Existing Approved Reviews List */}
          {reviews.length === 0 ? (
            <p className="text-xs text-gray-400 mb-8">No reviews yet. Be the first to review this product!</p>
          ) : (
            <div className="space-y-4 mb-10">
              {reviews.map((rev) => (
                <div key={rev.id} className="bg-white p-5 rounded-2xl border border-[#e9e5dc] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#a77b48]">{"⭐".repeat(rev.rating || 5)}</span>
                    <span className="text-[10px] text-gray-400">{new Date(rev.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-gray-600">{rev.review_text || rev.comment}</p>
                </div>
              ))}
            </div>
          )}

          {/* Write a Review Form */}
          <div className="bg-white p-6 rounded-3xl border border-[#e9e5dc] max-w-xl">
            <h3 className="text-sm font-bold text-[#293b2b] mb-4">Leave a Review</h3>
            
            {feedback && (
              <div className={`mb-4 p-3 rounded-xl text-xs border ${feedback.type === "error" ? "bg-red-50 text-red-600 border-red-200" : "bg-green-50 text-green-700 border-green-200"}`}>
                {feedback.text}
              </div>
            )}

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Rating</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs bg-white outline-none"
                >
                  <option value={5}>5 - Excellent</option>
                  <option value={4}>4 - Good</option>
                  <option value={3}>3 - Average</option>
                  <option value={2}>2 - Poor</option>
                  <option value={1}>1 - Terrible</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Comment</label>
                <textarea
                  required
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience with this product..."
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs bg-white outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="rounded-full bg-[#293b2b] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#3c513e] transition disabled:opacity-50"
              >
                {submittingReview ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          </div>
        </div>

      </div>
    </main>
  );
}

export default function ProductDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#faf8f3]"><p className="text-sm text-gray-400">Loading...</p></div>}>
      <ProductDetailContent />
    </Suspense>
  );
}