import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Pay Like QRIS. <span className="text-blue-600">Settle Onchain.</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            ChainPay ID brings familiar QRIS experience to Base blockchain with gasless transactions and instant
            Soundbox confirmations.
          </p>

          <div className="flex justify-center gap-4 mb-16">
            <Link
              href="/merchant/register"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Register as Merchant
            </Link>
            <Link
              href="/pay"
              className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
            >
              Scan to Pay
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="font-semibold text-lg mb-2">Gasless Payments</h3>
              <p className="text-gray-600">Zero gas fees for customers. Just scan, sign, and pay.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-4xl mb-4">🔊</div>
              <h3 className="font-semibold text-lg mb-2">Soundbox Confirmation</h3>
              <p className="text-gray-600">Instant audio notification when payment is received.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="font-semibold text-lg mb-2">Lower Fees</h3>
              <p className="text-gray-600">Only 0.5% merchant fee vs 0.7% traditional QRIS.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
