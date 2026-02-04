"use client";

import { QRCodeDisplay } from "./QRCodeDisplay";
import { formatIDRX } from "@/contracts/config";
import { format } from "date-fns";

interface InvoiceCardProps {
  invoiceId: string;
  merchant: string;
  amount: bigint;
  description: string;
  createdAt: number;
  expiresAt: number;
  isPaid: boolean;
}

export function InvoiceCard({
  invoiceId,
  merchant,
  amount,
  description,
  createdAt,
  expiresAt,
  isPaid,
}: InvoiceCardProps) {
  const isExpired = expiresAt > 0 && Date.now() / 1000 > expiresAt;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-lg">{description}</h3>
          <p className="text-2xl font-bold text-blue-600 mt-1">{formatIDRX(amount)} IDRX</p>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            isPaid
              ? "bg-green-100 text-green-800"
              : isExpired
                ? "bg-red-100 text-red-800"
                : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {isPaid ? "Paid" : isExpired ? "Expired" : "Pending"}
        </span>
      </div>

      <div className="text-sm text-gray-600 space-y-1 mb-4">
        <p>Created: {format(createdAt * 1000, "PPpp")}</p>
        {expiresAt > 0 && <p>Expires: {format(expiresAt * 1000, "PPpp")}</p>}
        <p className="font-mono text-xs">ID: {invoiceId.slice(0, 10)}...</p>
      </div>

      {!isPaid && !isExpired && (
        <div className="mt-4 pt-4 border-t">
          <QRCodeDisplay
            merchantAddress={merchant as `0x${string}`}
            invoiceId={invoiceId}
            amount={formatIDRX(amount)}
          />
        </div>
      )}
    </div>
  );
}
