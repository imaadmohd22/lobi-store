export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#faf8f3] px-6 py-12 text-[#292b20]">
      <div className="mx-auto max-w-4xl rounded-3xl bg-white p-8 md:p-12 border border-[#e9e5dc] shadow-sm space-y-6">
        <h1 className="text-3xl font-semibold text-[#293b2b]">Terms & Conditions</h1>
        <p className="text-xs text-gray-500 uppercase tracking-widest">Last updated: October 2026</p>

        <section className="space-y-2 text-sm leading-relaxed text-gray-700">
          <h2 className="text-base font-semibold text-[#293b2b]">1. Acceptance of Terms</h2>
          <p>By accessing and placing an order on LOBI, you confirm that you are in agreement with and bound by the terms of service contained herein.</p>
        </section>

        <section className="space-y-2 text-sm leading-relaxed text-gray-700">
          <h2 className="text-base font-semibold text-[#293b2b]">2. Orders & Payments</h2>
          <p>All orders placed on our website are subject to availability and confirmation of order price. Payments can be processed online via Razorpay or through Cash on Delivery.</p>
        </section>

        <section className="space-y-2 text-sm leading-relaxed text-gray-700">
          <h2 className="text-base font-semibold text-[#293b2b]">3. Shipping & Delivery</h2>
          <p>Standard delivery timelines range between 3 to 7 business days across India depending on the delivery pincode.</p>
        </section>
      </div>
    </main>
  );
}