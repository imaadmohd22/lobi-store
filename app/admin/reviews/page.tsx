
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Review = {
  id: string;
  product_id: string;
  user_id: string;
  order_id: string;
  rating: number;
  review_text: string;
  is_approved: boolean;
  created_at: string;
  products: { name: string } | null;
};

export default function AdminReviewsPage() {
  const router = useRouter();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    checkAdmin();
  }, []);

  async function checkAdmin() {
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      router.push("/account");
      return;
    }

    const { data: admin } = await supabase
      .from("admin_users")
      .select("id")
      .eq("id", authData.user.id)
      .maybeSingle();

    if (!admin) {
      router.push("/");
      return;
    }

    await fetchReviews();
  }

  async function fetchReviews() {
    setLoading(true);

    const { data, error } = await supabase
      .from("reviews")
      .select(`
        id,
        product_id,
        user_id,
        order_id,
        rating,
        review_text,
        is_approved,
        created_at,
        products(name)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
    } else {
      setReviews((data || []) as unknown as Review[]);
    }

    setLoading(false);
  }

  async function updateReview(id: string, approved: boolean) {
    const { error } = await supabase
      .from("reviews")
      .update({ is_approved: approved })
      .eq("id", id);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage(approved ? "Review approved!" : "Review hidden!");
    await fetchReviews();
  }

  async function deleteReview(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this review?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", id);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Review deleted successfully!");
    await fetchReviews();
  }

  if (loading) {
    return <div className="p-8">Loading reviews...</div>;
  }

  const pendingReviews = reviews.filter((r) => !r.is_approved);
  const approvedReviews = reviews.filter((r) => r.is_approved);

  return (
    <main className="min-h-screen bg-[#faf8f3] p-6 md:p-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#293b2b]">
              Customer Reviews
            </h1>
            <p className="mt-2 text-gray-600">
              Manage and moderate customer product reviews.
            </p>
          </div>

          <button
            onClick={() => router.push("/admin")}
            className="rounded-lg border border-[#293b2b] px-5 py-2 text-[#293b2b]"
          >
            Back to Dashboard
          </button>
        </div>

        {message && (
          <p className="mb-5 rounded-lg bg-green-100 p-3 text-green-900">
            {message}
          </p>
        )}

        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-gray-500">Pending Reviews</p>
            <p className="mt-2 text-3xl font-bold">
              {pendingReviews.length}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-gray-500">Approved Reviews</p>
            <p className="mt-2 text-3xl font-bold">
              {approvedReviews.length}
            </p>
          </div>
        </div>

        {reviews.length === 0 ? (
          <div className="rounded-xl bg-white p-8 text-center">
            No customer reviews yet.
          </div>
        ) : (
          <div className="space-y-5">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="rounded-xl bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-[#293b2b]">
                      {review.products?.name || "Product unavailable"}
                    </h2>

                    <p className="mt-1 text-yellow-500">
                      {"★".repeat(review.rating)}
                      <span className="text-gray-300">
                        {"★".repeat(5 - review.rating)}
                      </span>
                    </p>

                    <p className="mt-3 text-gray-700">
                      {review.review_text}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-sm ${
                      review.is_approved
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {review.is_approved ? "Approved" : "Pending"}
                  </span>
                </div>

                <div className="mt-4 border-t pt-4 text-xs text-gray-500">
                  <p>Customer ID: {review.user_id}</p>
                  <p>Order ID: {review.order_id}</p>
                  <p>
                    Submitted:{" "}
                    {new Date(review.created_at).toLocaleString()}
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  {!review.is_approved ? (
                    <button
                      onClick={() => updateReview(review.id, true)}
                      className="rounded-lg bg-green-800 px-4 py-2 text-white"
                    >
                      Approve
                    </button>
                  ) : (
                    <button
                      onClick={() => updateReview(review.id, false)}
                      className="rounded-lg bg-yellow-600 px-4 py-2 text-white"
                    >
                      Hide Review
                    </button>
                  )}

                  <button
                    onClick={() => deleteReview(review.id)}
                    className="rounded-lg bg-red-700 px-4 py-2 text-white"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
