"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Order = {
  id: string;
  total: number;
  status: string;
  payment_method: string;
  created_at: string;
};

type OrderItem = {
  id: string;
  order_id: string;
  product_name: string;
  price: number;
  quantity: number;
};

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOrders() {
      const { data: authData } = await supabase.auth.getUser();

      if (!authData.user) {
        window.location.href = "/account";
        return;
      }

      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("id, total, status, payment_method, created_at")
        .eq("user_id", authData.user.id)
        .order("created_at", { ascending: false });

      if (orderError) {
        setError(orderError.message);
        setLoading(false);
        return;
      }

      const { data: itemData, error: itemError } = await supabase
        .from("order_items")
        .select("id, order_id, product_name, price, quantity");

      if (itemError) setError(itemError.message);

      setOrders(orderData || []);
      setItems(itemData || []);
      setLoading(false);
    }

    loadOrders();
  }, []);

  if (loading) {
    return <main className="p-10 text-center">Loading your orders...</main>;
  }

  return (
    <main className="min-h-screen bg-[#faf8f3] px-6 py-12 text-[#292b20]">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-3xl font-black tracking-[0.2em] text-[#293b2b]">
            LOBI<span className="text-[#a77b48]">.</span>
          </Link>
          <Link href="/account" className="text-sm font-medium">My Account</Link>
        </div>

        <h1 className="mb-8 mt-10 text-3xl font-semibold">
          My Orders
        </h1>

        {error && (
          <p className="mb-5 rounded-xl bg-red-50 p-4 text-red-700">
            {error}
          </p>
        )}

        {orders.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <p className="text-xl font-semibold">No orders yet.</p>
            <Link href="/" className="mt-5 inline-block rounded-full bg-[#293b2b] px-6 py-3 text-sm text-white">
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <article key={order.id} className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="flex flex-wrap justify-between gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Order ID</p>
                    <p className="mt-1 break-all text-sm font-semibold">
                      {order.id}
                    </p>
                    <p className="mt-2 text-xs text-gray-500">
                      {new Date(order.created_at).toLocaleString("en-IN")}
                    </p>
                  </div>

                  <span className="h-fit rounded-full bg-[#eee9df] px-4 py-2 text-sm font-medium">
                    {order.status}
                  </span>
                </div>

                <div className="my-5 border-t border-[#eee9df]" />

                {items
                  .filter((item) => item.order_id === order.id)
                  .map((item) => (
                    <div key={item.id} className="flex justify-between gap-4 py-2 text-sm">
                      <span>{item.product_name} × {item.quantity}</span>
                      <span>
                        ₹{(Number(item.price) * item.quantity).toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}

                <div className="mt-5 flex justify-between border-t border-[#eee9df] pt-5 font-semibold">
                  <span>Total</span>
                  <span>₹{Number(order.total).toLocaleString("en-IN")}</span>
                </div>

                <p className="mt-3 text-xs text-gray-500">
                  Payment: {order.payment_method}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}