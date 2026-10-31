"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

// Declare Razorpay on window object
declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "Online">("COD");

  useEffect(() => {
    // Load cart from local storage
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(savedCart);

    // Load Razorpay script dynamically
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = subtotal > 999 ? 0 : 99;
  const total = subtotal + shipping;

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    setLoading(true);

    if (paymentMethod === "COD") {
      await saveOrderToDatabase("COD");
    } else {
      // Razorpay Online Payment Flow
      if (!window.Razorpay) {
        alert("Razorpay SDK failed to load. Please check your internet connection.");
        setLoading(false);
        return;
      }

      // Note: For production, order_id should ideally be generated from a backend API route.
      // Here we simulate/open Razorpay standard checkout directly for frontend simplicity.
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_YourKeyHere", // Client apni test/live Razorpay Key yahan daal sakte hain (.env.local mein)
        amount: total * 100, // Amount in paise
        currency: "INR",
        name: "LOBI Store",
        description: "Purchase from LOBI Nature Living",
        handler: async function (response: any) {
          // Payment successful! Now save order to database
          await saveOrderToDatabase("Online (Paid)", response.razorpay_payment_id);
        },
        prefill: {
          name: name,
          email: email,
          contact: phone,
        },
        theme: {
          color: "#293b2b",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      setLoading(false);
    }
  }

  async function saveOrderToDatabase(method: string, paymentId?: string) {
    try {
      // 1. Insert into orders table
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            customer_name: name,
            phone: phone,
            email: email || null,
            address: address,
            city: city,
            pincode: pincode,
            total: total,
            status: "Pending",
            payment_method: paymentId ? `${method} [ID: ${paymentId}]` : method,
          },
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Insert order items
      const orderItemsData = cart.map((item) => ({
        order_id: orderData.id,
        product_name: item.name,
        price: item.price,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItemsData);

      if (itemsError) throw itemsError;

      // 3. Clear cart & redirect to success page
      localStorage.removeItem("cart");
      router.push("/order-success");
    } catch (err: any) {
      alert("Error placing order: " + err.message);
      setLoading(false);
    }
  }

  if (cart.length === 0) {
    return (
      <main className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center bg-[#faf8f3]">
        <h1 className="text-2xl font-semibold text-[#293b2b]">Your cart is empty</h1>
        <p className="mt-2 text-sm text-gray-500">Add some natural products to checkout.</p>
        <button
          onClick={() => router.push("/shop")}
          className="mt-6 rounded-full bg-[#293b2b] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#3c513e] transition"
        >
          Explore Shop →
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf8f3] px-6 py-10 text-[#292b20]">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-semibold text-[#293b2b]">Checkout</h1>
        <p className="mt-1 text-xs text-gray-500 uppercase tracking-widest">Secure Delivery & Payment</p>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_400px]">
          {/* Shipping Form */}
          <form onSubmit={handleCheckout} className="rounded-3xl bg-white p-8 shadow-sm border border-[#e9e5dc] space-y-5">
            <h2 className="text-lg font-semibold text-[#293b2b]">Shipping Details</h2>

            <div>
              <label className="block text-xs font-medium text-gray-600">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#293b2b]"
                placeholder="John Doe"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#293b2b]"
                  placeholder="9876543210"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600">Email Address (Optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#293b2b]"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600">Street Address</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#293b2b]"
                placeholder="House no, Street, Landmark"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600">City</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#293b2b]"
                  placeholder="Mumbai"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600">Pincode</label>
                <input
                  type="text"
                  required
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#293b2b]"
                  placeholder="400001"
                />
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="pt-4 border-t border-gray-100">
              <label className="block text-xs font-bold uppercase text-gray-500 mb-3">Select Payment Method</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("Online")}
                  className={`rounded-2xl p-4 text-left border transition ${
                    paymentMethod === "Online"
                      ? "border-[#293b2b] bg-[#293b2b]/5 font-semibold"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  <p className="text-sm">⚡ Online Payment</p>
                  <p className="text-xs text-gray-500 font-normal mt-0.5">UPI, Cards, GPay, PhonePe</p>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("COD")}
                  className={`rounded-2xl p-4 text-left border transition ${
                    paymentMethod === "COD"
                      ? "border-[#293b2b] bg-[#293b2b]/5 font-semibold"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  <p className="text-sm">💵 Cash on Delivery</p>
                  <p className="text-xs text-gray-500 font-normal mt-0.5">Pay when order arrives</p>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#293b2b] py-3.5 text-sm font-semibold text-white hover:bg-[#3c513e] transition disabled:opacity-50 mt-4"
            >
              {loading ? "Processing..." : paymentMethod === "Online" ? `Pay ₹${total.toLocaleString("en-IN")} Now →` : `Place COD Order (₹${total.toLocaleString("en-IN")}) →`}
            </button>
          </form>

          {/* Order Summary Sidebar */}
          <div className="h-fit rounded-3xl bg-white p-6 shadow-sm border border-[#e9e5dc] space-y-4">
            <h2 className="text-lg font-semibold text-[#293b2b]">Order Summary</h2>
            <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto space-y-3">
              {cart.map((item, idx) => (
                <div key={idx} className="flex justify-between pt-3 text-sm">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-medium">₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg pt-2 border-t border-gray-100 text-[#293b2b]">
                <span>Total</span>
                <span>₹{total.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}