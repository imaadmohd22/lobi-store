"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ReviewForm({ productId }: { productId: string }) {
  const [userId, setUserId] = useState("");
  const [orderId, setOrderId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);

  useEffect(() => {
    async function checkEligibility() {
      const { data: authData } = await supabase.auth.getUser();

      if (!authData.user) {
        setLoading(false);
        return;
      }

      setUserId(authData.user.id);
      
      // Get customer name from metadata or email fallback
      const fullName =
        authData.user.user_metadata?.full_name ||
        authData.user.email?.split("@")[0] ||
        "Verified Customer";
      setCustomerName(fullName);

      // Find a delivered order containing this product
      const { data: orders, error } = await supabase
        .from("orders")
        .select("id, order_items!inner(product_id)")
        .eq("user_id", authData.user.id)
        .eq("status", "Delivered")
        .eq("order_items.product_id", productId)
        .limit(1);

      if (error || !orders || orders.length === 0) {
        setLoading(false);
        return;
      }

      const eligibleOrderId = orders[0].id;
      setOrderId(eligibleOrderId);

      // Check whether this customer already reviewed this order's product
      const { data: existingReview } = await supabase
        .from("reviews")
        .select("id")
        .eq("order_id", eligibleOrderId)
        .eq("product_id", productId)
        .maybeSingle();

      if (existingReview) {
        setAlreadyReviewed(true);
      }

      setLoading(false);
    }

    checkEligibility();
  }, [productId]);

  async function submitReview(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");

    if (!userId || !orderId) {
      setMessage("You are not eligible to submit this review.");
      return;
    }

    if (reviewText.trim().length < 5) {
      setMessage("Please write at least 5 characters.");
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.from("reviews").insert({
      product_id: productId,
      user_id: userId,
      order_id: orderId,
      rating,
      review_text: reviewText.trim(),
      customer_name: customerName,
    });

    if (error) {
      setMessage(
        error.code === "23505"
          ? "You have already reviewed this product for this order."
          : error.message
      );
    } else {
      setAlreadyReviewed(true);
      setReviewText("");
      setMessage("Review submitted! It will appear after admin approval.");
    }

    setSubmitting(false);
  }

  if (loading) {
    return <p className="mt-8 text-gray-500">Checking review eligibility...</p>;
  }

  if (!userId) {
    return (
      <div className="mt-10 border-t pt-6">
        <h2 className="text-xl font-semibold">Customer Reviews</h2>
        <p className="mt-2 text-gray-600">Please log in to submit a review.</p>
        <Link href="/account" className="mt-3 inline-block text-[#293b2b] underline font-medium">
          Login / Sign up
        </Link>
      </div>
    );
  }

  if (!orderId) {
    return (
      <div className="mt-10 border-t pt-6">
        <h2 className="text-xl font-semibold">Customer Reviews</h2>
        <p className="mt-2 text-gray-600">
          You can review this product after your order has been delivered.
        </p>
      </div>
    );
  }

  if (alreadyReviewed) {
    return (
      <div className="mt-10 border-t pt-6">
        <h2 className="text-xl font-semibold">Customer Reviews</h2>
        <p className="mt-2 text-emerald-800 font-medium">
          You have already submitted a review for this order.
        </p>
        <p className="mt-1 text-sm text-gray-500">
          Reviews are displayed after admin approval.
        </p>
        {message && <p className="mt-2 text-sm">{message}</p>}
      </div>
    );
  }

  return (
    <div className="mt-10 border-t pt-6">
      <h2 className="text-2xl font-semibold">Write a Review</h2>
      <p className="mt-2 text-sm text-gray-600">
        Only customers with a delivered order can review this product.
      </p>

      <form onSubmit={submitReview} className="mt-5 space-y-4">
        <div>
          <label className="block font-medium">Your Rating</label>
          <div className="mt-2 flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`text-3xl ${
                  star <= rating ? "text-yellow-500" : "text-gray-300"
                }`}
                aria-label={`Rate ${star} stars`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block font-medium">Your Review</label>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            rows={4}
            minLength={5}
            maxLength={1000}
            required
            placeholder="Share your experience with this product..."
            className="w-full rounded-lg border p-3 outline-none focus:border-[#293b2b]"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-[#293b2b] px-6 py-3 text-white font-semibold hover:bg-[#3c513e] disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Submit Review"}
        </button>

        {message && <p className="text-sm text-emerald-800 font-medium">{message}</p>}
      </form>
    </div>
  );
}