"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type CartItem = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  stock: number;
  quantity: number;
};

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const savedCart = JSON.parse(
      localStorage.getItem("lobi-cart") || "[]"
    );
    setCart(savedCart);
    setLoaded(true);
  }, []);

  function updateCart(updatedCart: CartItem[]) {
    setCart(updatedCart);
    localStorage.setItem("lobi-cart", JSON.stringify(updatedCart));
  }

  function changeQuantity(id: string, amount: number) {
    const updated = cart.map((item) => {
      if (item.id !== id) return item;

      return {
        ...item,
        quantity: Math.max(1, item.quantity + amount),
      };
    });

    updateCart(updated);
  }

  function removeItem(id: string) {
    updateCart(cart.filter((item) => item.id !== id));
  }

  const total = cart.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  if (!loaded) {
    return <main className="p-10 text-center">Loading cart...</main>;
  }

  return (
    <main className="min-h-screen bg-[#faf8f3] text-[#292b20]">
      <header className="border-b border-[#e9e5dc] px-6 py-5">
        <div className="mx-auto flex max-w-7xl justify-between">
          <Link href="/" className="text-3xl font-black tracking-[0.2em] text-[#293b2b]">
            LOBI<span className="text-[#a77b48]">.</span>
          </Link>

          <Link href="/" className="text-sm font-medium">
            Continue Shopping
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="mb-8 text-3xl font-semibold">Your Shopping Cart</h1>

        {cart.length === 0 ? (
          <div className="rounded-2xl bg-[#f0ede5] p-12 text-center">
            <p className="text-xl font-semibold">Your cart is empty.</p>
            <Link
              href="/"
              className="mt-6 inline-block rounded-full bg-[#293b2b] px-8 py-3 text-white"
            >
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[1fr_350px]">
            <div className="space-y-5">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center gap-5 rounded-2xl bg-white p-5 shadow-sm"
                >
                  <div className="h-28 w-28 overflow-hidden rounded-xl bg-[#e8dfd0]">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-4xl">
                        🪵
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold">{item.name}</h2>
                    <p className="mt-2">
                      ₹{Number(item.price).toLocaleString("en-IN")}
                    </p>

                    <div className="mt-3 flex items-center gap-4">
                      <button
                        onClick={() => changeQuantity(item.id, -1)}
                        className="rounded-full border px-3 py-1"
                      >
                        −
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        onClick={() => changeQuantity(item.id, 1)}
                        className="rounded-full border px-3 py-1"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold">
                      ₹{(Number(item.price) * item.quantity).toLocaleString("en-IN")}
                    </p>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="mt-4 text-sm text-red-600 underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <aside className="h-fit rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold">Order Summary</h2>

              <div className="mt-6 flex justify-between text-sm">
                <span>Subtotal</span>
                <span>₹{total.toLocaleString("en-IN")}</span>
              </div>

              <div className="mt-4 flex justify-between text-sm">
                <span>Delivery</span>
                <span>Free (COD)</span>
              </div>

              <div className="my-5 border-t border-[#e9e5dc]" />

              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>₹{total.toLocaleString("en-IN")}</span>
              </div>

              <button
                onClick={() => window.location.href = "/checkout"}
                className="mt-7 w-full rounded-full bg-[#293b2b] px-6 py-4 font-semibold text-white hover:bg-[#3c513e]"
              >
                Proceed to Checkout →
              </button>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}