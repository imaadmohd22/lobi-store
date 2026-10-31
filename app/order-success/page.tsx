
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SuccessContent() {
  const params = useSearchParams();
  const orderId = params.get("id");

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#faf8f3] px-6">
      <div className="w-full max-w-lg rounded-3xl bg-white p-10 text-center shadow-sm">
        <div className="text-6xl">✓</div>
        <h1 className="mt-5 text-3xl font-semibold text-[#293b2b]">
          Order Placed!
        </h1>
        <p className="mt-4 text-gray-600">
          Thank you for shopping with LOBI. Your order has been received.
        </p>

        {orderId && (
          <p className="mt-5 break-all text-sm text-gray-500">
            Order ID: {orderId}
          </p>
        )}

        <p className="mt-5 text-sm">Payment Method: Cash on Delivery</p>

        <Link
          href="/"
          className="mt-8 inline-block rounded-full bg-[#293b2b] px-8 py-4 text-white"
        >
          Continue Shopping
        </Link>
      </div>
    </main>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<main className="p-10">Loading...</main>}>
      <SuccessContent />
    </Suspense>
  );
}
