export default function RefundPolicyPage() {
  return (
    <main className="min-h-screen bg-[#faf8f3] px-6 py-12 text-[#292b20]">
      <div className="mx-auto max-w-4xl rounded-3xl bg-white p-8 md:p-12 border border-[#e9e5dc] shadow-sm space-y-6">
        <h1 className="text-3xl font-semibold text-[#293b2b]">Refund & Cancellation Policy</h1>
        <p className="text-xs text-gray-500 uppercase tracking-widest">Last updated: October 2026</p>

        <section className="space-y-2 text-sm leading-relaxed text-gray-700">
          <h2 className="text-base font-semibold text-[#293b2b]">1. Order Cancellations</h2>
          <p>You can request an order cancellation before the product is dispatched. Once dispatched, cancellations cannot be processed directly through the dashboard.</p>
        </section>

        <section className="space-y-2 text-sm leading-relaxed text-gray-700">
          <h2 className="text-base font-semibold text-[#293b2b]">2. Returns & Refunds</h2>
          <p>If you receive a damaged or incorrect product, notify our support team within 48 hours of delivery for a replacement or a full refund back to your original payment method within 5–7 business days.</p>
        </section>
      </div>
    </main>
  );
}