"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PAYMENT_PROCESSOR_ABI } from "@/contracts/abis";
import { CONTRACTS, parseIDRX } from "@/contracts/config";
import toast from "react-hot-toast";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";

export default function CreateInvoice() {
  const router = useRouter();
  const { isConnected } = useAccount();

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [expiryMinutes, setExpiryMinutes] = useState("30");

  const { data: hash, writeContract, isPending } = useWriteContract();
  const { isLoading, isSuccess, data: receipt } = useWaitForTransactionReceipt({ hash });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!amount || !description) {
      toast.error("Please fill all required fields");
      return;
    }

    const amountBigInt = parseIDRX(amount);

    try {
      writeContract({
        address: CONTRACTS.PAYMENT_PROCESSOR,
        abi: PAYMENT_PROCESSOR_ABI,
        functionName: "createInvoice",
        args: [amountBigInt, description, BigInt(expiryMinutes || 0)],
      });
    } catch (error) {
      console.error("Create invoice error:", error);
      toast.error("Failed to create invoice");
    }
  };

  if (isSuccess && receipt) {
    toast.success("Invoice created successfully!");

    // In production, parse the invoiceId from logs
    setTimeout(() => {
      router.push("/merchant/invoice/list");
    }, 2000);
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-2xl px-4">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold mb-2">Create Invoice</h1>
          <p className="text-gray-600 mb-8">Generate a payment invoice with a fixed amount</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount (IDRX) *</label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="50000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                min="1"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Nasi Goreng Special + Es Teh"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                required
                maxLength={200}
              />
              <p className="text-sm text-gray-500 mt-1">{description.length}/200 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Time (minutes)</label>
              <select
                value={expiryMinutes}
                onChange={e => setExpiryMinutes(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="0">No expiry</option>
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="180">3 hours</option>
                <option value="1440">24 hours</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isPending || isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending || isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  {isPending ? "Confirming..." : "Creating..."}
                </span>
              ) : (
                "Create Invoice"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
