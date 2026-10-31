
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";


type Order = {
  id: string;
  customer_name: string;
  phone: string;
  email: string | null;
  address: string;
  city: string;
  pincode: string;
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

const statuses = [
  "Pending",
  "Confirmed",
  "Shipped",
  "Delivered",
  "Cancelled",
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    async function loadOrders() {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;

      if (!user) {
        window.location.href = "/admin";
        return;
      }

      const { data: admin } = await supabase
        .from("admin_users")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (!admin) {
        setMessage("Access denied. Admin account required.");
        setLoading(false);
        return;
      }

      setAuthorized(true);

      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (orderError) {
        setMessage(orderError.message);
        setLoading(false);
        return;
      }

      const { data: itemData, error: itemError } = await supabase
        .from("order_items")
        .select("*");

      if (itemError) {
        setMessage(itemError.message);
      }

      setOrders(orderData || []);
      setItems(itemData || []);
      setLoading(false);
    }

    loadOrders();
  }, []);

  async function updateStatus(id: string, status: string) {
    setMessage("");

    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id);

    if (error) {
      setMessage(error.message);
      return;
    }

    setOrders((previous) =>
      previous.map((order) =>
        order.id === id ? { ...order, status } : order
      )
    );

    setMessage("Order status updated successfully.");
  }

  if (loading) {
    return <main className="p-10">Loading orders...</main>;
  }

  if (!authorized) {
    return (
      <main className="min-h-screen bg-[#faf8f3] p-10 text-center">
        <h1 className="text-2xl font-semibold">Access Denied</h1>
        <p className="mt-3">{message}</p>
        <Link href="/admin" className="mt-5 inline-block underline">
          Back to Admin
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf8f3] px-5 py-10 text-[#292b20]">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-widest text-[#a77b48]">
              LOBI Administration
            </p>
            <h1 className="mt-2 text-3xl font-semibold">Customer Orders</h1>
          </div>

          <Link
            href="/admin"
            className="rounded-full bg-[#293b2b] px-6 py-3 text-sm text-white"
          >
            ← Admin Dashboard
          </Link>
        </div>

        {message && (
          <p className="mb-5 rounded-xl bg-[#eee9df] p-4 text-sm">
            {message}
          </p>
        )}

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-6">
            <p className="text-sm text-gray-500">Total Orders</p>
            <p className="mt-2 text-3xl font-semibold">{orders.length}</p>
          </div>

          <div className="rounded-2xl bg-white p-6">
            <p className="text-sm text-gray-500">Pending Orders</p>
            <p className="mt-2 text-3xl font-semibold">
              {orders.filter((o) => o.status === "Pending").length}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6">
            <p className="text-sm text-gray-500">Delivered Orders</p>
            <p className="mt-2 text-3xl font-semibold">
              {orders.filter((o) => o.status === "Delivered").length}
            </p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center">
            No orders received yet.
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const orderItems = items.filter(
                (item) => item.order_id === order.id
              );

              return (
                <article key={order.id} className="rounded-2xl bg-white p-6 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Order ID</p>
                      <p className="mt-1 break-all text-sm font-semibold">
                        {order.id}
                      </p>
                      <p className="mt-2 text-xs text-gray-500">
                        {new Date(order.created_at).toLocaleString("en-IN")}
                      </p>
                    </div>

                    <div>
                      <label className="mb-2 block text-xs text-gray-500">
                        Update Status
                      </label>
                      <select
                        value={order.status}
                        onChange={(e) =>
                          updateStatus(order.id, e.target.value)
                        }
                        className="rounded-xl border border-[#ddd7cc] px-4 py-3 text-sm"
                      >
                        {statuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="my-5 border-t border-[#eee9df]" />

                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <h2 className="font-semibold">Customer Details</h2>
                      <p className="mt-3 text-sm">{order.customer_name}</p>
                      <p className="mt-1 text-sm">{order.phone}</p>
                      <p className="mt-1 text-sm">{order.email || "No email provided"}</p>
                      <p className="mt-2 text-sm text-gray-600">
                        {order.address}, {order.city} - {order.pincode}
                      </p>
                    </div>

                    <div>
                      <h2 className="font-semibold">Ordered Products</h2>
                      {orderItems.map((item) => (
                        <div key={item.id} className="mt-3 flex justify-between gap-3 text-sm">
                          <span>{item.product_name} × {item.quantity}</span>
                          <span className="whitespace-nowrap">
                            ₹{(Number(item.price) * item.quantity).toLocaleString("en-IN")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap justify-between gap-3 border-t border-[#eee9df] pt-5">
                    <p className="text-sm text-gray-500">
                      Payment: {order.payment_method}
                    </p>
                    <p className="text-lg font-semibold">
                      Total: ₹{Number(order.total).toLocaleString("en-IN")}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
