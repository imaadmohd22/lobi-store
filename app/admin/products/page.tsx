"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("orders"); // 'orders' or 'reviews'
  const [orderFilter, setOrderFilter] = useState("pending");

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

      // Fetch Orders
      const { data: ordersData } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (ordersData) setOrders(ordersData);

      // Fetch Reviews
      const { data: reviewsData, error: reviewError } = await supabase
        .from("reviews")
        .select("*, products(name)")
        .order("created_at", { ascending: false });

      if (!reviewError && reviewsData) {
        setReviews(reviewsData);
      }

      setLoading(false);
    }

    checkAdminAndFetch();
  }, [router]);

  async function updateOrderStatus(orderId: string, newStatus: string) {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (!error) {
      setOrders(
        orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } else {
      alert("Failed to update order status");
    }
  }

  async function handleApproveReview(reviewId: string, currentStatus: boolean) {
    const { error } = await supabase
      .from("reviews")
      .update({ is_approved: !currentStatus })
      .eq("id", reviewId);

    if (!error) {
      setReviews(
        reviews.map((r) => (r.id === reviewId ? { ...r, is_approved: !currentStatus } : r))
      );
    } else {
      alert("Failed to update review status");
    }
  }

  async function handleDeleteReview(reviewId: string) {
    if (!confirm("Are you sure you want to delete this review?")) return;
    const { error } = await supabase.from("reviews").delete().eq("id", reviewId);
    if (!error) {
      setReviews(reviews.filter((r) => r.id !== reviewId));
    } else {
      alert("Failed to delete review");
    }
  }

  const filteredOrders = orders.filter((order) => {
    const status = order.status?.toLowerCase() || "pending";
    if (orderFilter === "pending") return status !== "delivered" && status !== "cancelled";
    if (orderFilter === "delivered") return status === "delivered";
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f3]">
        <p className="text-sm text-gray-400">Loading admin control center...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf8f3] px-6 py-10 text-[#292b20]">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#a77b48]">
              Control Center
            </span>
            <h1 className="text-3xl font-bold text-[#293b2b] mt-1">Admin Dashboard</h1>
          </div>
          <Link
            href="/admin/products"
            className="rounded-full bg-[#293b2b] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#3c513e] transition text-center"
          >
            + Manage Products
          </Link>
        </div>

        {/* Section Tabs Switcher */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setActiveTab("orders")}
            className={`rounded-full px-6 py-2.5 text-xs font-bold transition ${
              activeTab === "orders"
                ? "bg-[#293b2b] text-white shadow-sm"
                : "bg-white text-gray-600 border border-[#e9e5dc]"
            }`}
          >
            📦 Manage Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`rounded-full px-6 py-2.5 text-xs font-bold transition ${
              activeTab === "reviews"
                ? "bg-[#293b2b] text-white shadow-sm"
                : "bg-white text-gray-600 border border-[#e9e5dc]"
            }`}
          >
            ⭐ Customer Reviews ({reviews.length})
          </button>
        </div>

        {activeTab === "orders" ? (
          <>
            {/* Order Filter Sub-tabs */}
            <div className="flex items-center gap-2 mb-6 border-b border-[#e9e5dc] pb-4">
              <button
                onClick={() => setOrderFilter("pending")}
                className={`rounded-full px-5 py-2 text-xs font-semibold transition ${
                  orderFilter === "pending"
                    ? "bg-[#293b2b] text-white"
                    : "bg-white text-gray-600 border border-[#e9e5dc] hover:bg-gray-50"
                }`}
              >
                Active Orders
              </button>
              <button
                onClick={() => setOrderFilter("delivered")}
                className={`rounded-full px-5 py-2 text-xs font-semibold transition ${
                  orderFilter === "delivered"
                    ? "bg-[#293b2b] text-white"
                    : "bg-white text-gray-600 border border-[#e9e5dc] hover:bg-gray-50"
                }`}
              >
                Delivered Orders
              </button>
              <button
                onClick={() => setOrderFilter("all")}
                className={`rounded-full px-5 py-2 text-xs font-semibold transition ${
                  orderFilter === "all"
                    ? "bg-[#293b2b] text-white"
                    : "bg-white text-gray-600 border border-[#e9e5dc] hover:bg-gray-50"
                }`}
              >
                All Orders
              </button>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-[#e9e5dc]">
                <p className="text-sm text-gray-400">No orders found in this view.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => {
                  const shipping = order.shipping_address || order.address || order.shippingDetails || {};
                  const itemsList = order.items || order.cart_items || order.order_items || [];
                  const totalAmount = order.total_amount || order.amount || order.total || 0;
                  const customerName = shipping.fullName || shipping.name || order.customer_name || "Customer";
                  const customerPhone = shipping.phone || shipping.mobile || order.phone || "N/A";
                  const customerEmail = shipping.email || order.user_email || "N/A";
                  const addressText = shipping.address || shipping.street || order.address || "";
                  const cityText = shipping.city || "";
                  const pincodeText = shipping.pincode || shipping.zip || "";

                  return (
                    <div
                      key={order.id}
                      className="rounded-3xl bg-white p-6 border border-[#e9e5dc] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                    >
                      <div className="space-y-2 flex-grow">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono text-gray-400">
                            ID: {order.id.slice(0, 8)}...
                          </span>
                          <span className="text-xs text-gray-500">
                            {order.created_at ? new Date(order.created_at).toLocaleString() : ""}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                          <div>
                            <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider">
                              Customer Details
                            </h3>
                            <p className="text-sm font-semibold text-[#293b2b] mt-1">
                              {customerName}
                            </p>
                            <p className="text-xs text-gray-600">Phone: {customerPhone}</p>
                            <p className="text-xs text-gray-600">Email: {customerEmail}</p>
                            <p className="text-xs text-gray-600 mt-1">
                              {addressText} {cityText ? `, ${cityText}` : ""} {pincodeText ? ` - ${pincodeText}` : ""}
                            </p>
                          </div>

                          <div>
                            <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider">
                              Ordered Items & Payment
                            </h3>
                            <div className="text-xs text-gray-700 mt-1 space-y-1">
                              {Array.isArray(itemsList) && itemsList.length > 0 ? (
                                itemsList.map((item: any, idx: number) => (
                                  <div key={idx}>
                                    • {item.name || item.title || "Item"} × {item.quantity || 1} (₹{item.price || 0})
                                  </div>
                                ))
                              ) : (
                                <div className="text-gray-400">No item details stored</div>
                              )}
                            </div>
                            <p className="text-xs font-semibold text-[#293b2b] mt-2">
                              Payment: {order.payment_method || "COD"} | Total: ₹{Number(totalAmount).toLocaleString("en-IN")}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 min-w-[140px] border-t md:border-t-0 pt-4 md:pt-0 border-gray-100 w-full md:w-auto">
                        <label className="text-[10px] font-bold uppercase text-gray-400">
                          Update Status
                        </label>
                        <select
                          value={order.status || "Pending"}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className="rounded-xl border border-[#e9e5dc] bg-[#faf8f3] px-3 py-2 text-xs font-medium text-[#292b20] outline-none focus:border-[#293b2b]"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          /* Reviews Management Tab */
          <div>
            {reviews.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-[#e9e5dc]">
                <p className="text-sm text-gray-400">No customer reviews found yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="rounded-3xl bg-white p-6 border border-[#e9e5dc] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-[#a77b48]">
                          {"⭐".repeat(review.rating || 5)}
                        </span>
                        <span className="text-xs font-semibold text-[#293b2b]">
                          {review.user_email || "Customer"}
                        </span>
                        <span className="text-xs text-gray-400">
                          {review.created_at ? new Date(review.created_at).toLocaleDateString() : ""}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-gray-500 mt-1">
                        Product: {review.products?.name || "Item"}
                      </p>
                      <p className="text-xs text-gray-700 mt-1">
                        "{review.comment || review.review_text}"
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleApproveReview(review.id, review.is_approved)}
                        className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                          review.is_approved
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                        }`}
                      >
                        {review.is_approved ? "Approved ✓" : "Approve Review"}
                      </button>
                      <button
                        onClick={() => handleDeleteReview(review.id)}
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
        )}
      </div>
    </main>
  );
}