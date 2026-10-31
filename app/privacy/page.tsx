export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#faf8f3] px-6 py-12 text-[#292b20]">
      <div className="mx-auto max-w-4xl rounded-3xl bg-white p-8 md:p-12 border border-[#e9e5dc] shadow-sm space-y-6">
        <h1 className="text-3xl font-semibold text-[#293b2b]">Privacy Policy</h1>
        <p className="text-xs text-gray-500 uppercase tracking-widest">Last updated: October 2026</p>

        <section className="space-y-2 text-sm leading-relaxed text-gray-700">
          <h2 className="text-base font-semibold text-[#293b2b]">1. Information We Collect</h2>
          <p>We collect personal details such as your name, email, phone number, and delivery address exclusively for order fulfillment and customer support.</p>
        </section>

        <section className="space-y-2 text-sm leading-relaxed text-gray-700">
          <h2 className="text-base font-semibold text-[#293b2b]">2. Data Security</h2>
          <p>Your payment data is securely handled by our PCI-DSS compliant payment gateway partner (Razorpay). We do not store your debit/credit card or banking details on our servers.</p>
        </section>
      </div>
    </main>
  );
}