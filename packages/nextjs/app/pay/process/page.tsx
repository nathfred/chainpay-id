"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IDRX_ABI, MERCHANT_REGISTRY_ABI, PAYMENT_PROCESSOR_ABI } from "@/contracts/abis";
import { CONTRACTS, formatIDRX, parseIDRX } from "@/contracts/config";
import toast from "react-hot-toast";
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";

export default function PaymentProcess() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { address, isConnected } = useAccount();

  const merchantAddress = searchParams.get("merchant") as `0x${string}`;
  const invoiceId = searchParams.get("invoice");
  const presetAmount = searchParams.get("amount");

  const [amount, setAmount] = useState(presetAmount || "");
  const [isApproving, setIsApproving] = useState(false);

  // Get merchant data
  const { data: merchantData } = useReadContract({
    address: CONTRACTS.MERCHANT_REGISTRY,
    abi: MERCHANT_REGISTRY_ABI,
    functionName: "getMerchant",
    args: [merchantAddress],
  });

  // Get user's IDRX balance
  const { data: balance } = useReadContract({
    address: CONTRACTS.IDRX,
    abi: IDRX_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  // Check allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: CONTRACTS.IDRX,
    abi: IDRX_ABI,
    functionName: "allowance",
    args: address ? [address, CONTRACTS.PAYMENT_PROCESSOR] : undefined,
  });

  // Approve contract
  const { writeContract: approveWrite, data: approveHash } = useWriteContract();
  const { isLoading: isApprovePending, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  // Process payment
  const { writeContract: paymentWrite, data: paymentHash, isPending: isPaymentPending } = useWriteContract();
  const { isLoading: isPaymentConfirming, isSuccess: isPaymentSuccess } = useWaitForTransactionReceipt({
    hash: paymentHash,
  });

  useEffect(() => {
    if (isApproveSuccess) {
      refetchAllowance();
      toast.success("Approval successful!");
      setIsApproving(false);
    }
  }, [isApproveSuccess, refetchAllowance]);

  useEffect(() => {
    if (isPaymentSuccess) {
      toast.success("Payment successful! 🎉");
      setTimeout(() => {
        router.push("/pay/success");
      }, 2000);
    }
  }, [isPaymentSuccess, router]);

  const handleApprove = async () => {
    if (!amount) {
      toast.error("Please enter an amount");
      return;
    }

    const amountBigInt = parseIDRX(amount);
    setIsApproving(true);

    try {
      approveWrite({
        address: CONTRACTS.IDRX,
        abi: IDRX_ABI,
        functionName: "approve",
        args: [CONTRACTS.PAYMENT_PROCESSOR, amountBigInt],
      });
    } catch (error) {
      console.error("Approve error:", error);
      toast.error("Failed to approve");
      setIsApproving(false);
    }
  };

  const handlePay = async () => {
    if (!amount) {
      toast.error("Please enter an amount");
      return;
    }

    if (!isConnected) {
      toast.error("Please connect your wallet");
      return;
    }

    const amountBigInt = parseIDRX(amount);

    // Check if need approval
    if (!allowance || allowance < amountBigInt) {
      toast.error("Please approve IDRX spending first");
      return;
    }

    try {
      if (invoiceId) {
        // Pay invoice
        paymentWrite({
          address: CONTRACTS.PAYMENT_PROCESSOR,
          abi: PAYMENT_PROCESSOR_ABI,
          functionName: "payInvoice",
          args: [invoiceId as `0x${string}`],
        });
      } else {
        // Direct payment
        paymentWrite({
          address: CONTRACTS.PAYMENT_PROCESSOR,
          abi: PAYMENT_PROCESSOR_ABI,
          functionName: "processPayment",
          args: [merchantAddress, amountBigInt],
        });
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment failed");
    }
  };

  if (!merchantAddress) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Invalid merchant address</p>
        </div>
      </div>
    );
  }

  const merchant = merchantData as any;
  const needsApproval = !allowance || (amount && allowance < parseIDRX(amount));

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-2xl px-4">
        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Merchant Info */}
          <div className="mb-6 pb-6 border-b">
            <h2 className="text-sm text-gray-600">Paying to</h2>
            <h1 className="text-2xl font-bold text-gray-900">{merchant?.[0]?.businessName || "Loading..."}</h1>
            <p className="text-gray-600">{merchant?.[0]?.category}</p>
          </div>

          {/* Balance Display */}
          <div className="mb-6 bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Your IDRX Balance</p>
            <p className="text-2xl font-bold text-gray-900">{balance ? formatIDRX(balance as bigint) : "0"} IDRX</p>
          </div>

          {/* Amount Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount to Pay</label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                disabled={!!presetAmount || !!invoiceId}
                placeholder="0"
                className="w-full px-4 py-3 text-2xl border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                step="0.01"
                min="0"
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                IDRX
              </span>
            </div>
            {invoiceId && <p className="text-sm text-blue-600 mt-1">Amount locked by invoice</p>}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {!isConnected ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800">Please connect your wallet to continue</p>
              </div>
            ) : needsApproval ? (
              <button
                onClick={handleApprove}
                disabled={isApproving || isApprovePending || !amount}
                className="w-full bg-yellow-500 text-white py-3 rounded-lg font-semibold hover:bg-yellow-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isApproving || isApprovePending ? (
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
                    Approving...
                  </span>
                ) : (
                  "Approve IDRX Spending"
                )}
              </button>
            ) : (
              <button
                onClick={handlePay}
                disabled={isPaymentPending || isPaymentConfirming || !amount}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPaymentPending || isPaymentConfirming ? (
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
                    {isPaymentPending ? "Confirming..." : "Processing..."}
                  </span>
                ) : (
                  `Pay ${amount || "0"} IDRX`
                )}
              </button>
            )}
          </div>

          {/* Info */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">⚡ Gasless Payment</h3>
            <p className="text-sm text-blue-800">
              {"You won't pay any gas fees! The network fee is sponsored by ChainPay ID."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
