"use client";

import { QRScanner } from "@/components/QRScanner";

export default function PayPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-2xl px-4">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold mb-2">Scan to Pay</h1>
          <p className="text-gray-600 mb-8">Scan merchant QR code to make a payment</p>

          <QRScanner />

          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
              <li>Click &ldquo;Start Scanning&rdquo; and allow camera access</li>
              <li>Point your camera at the merchant&apos;s QR code</li>
              <li>Enter payment amount (or auto-filled from invoice)</li>
              <li>Confirm and pay (gasless!)</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
