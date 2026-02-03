"use client";

import { useEffect } from "react";
import { IDRX_ABI } from "@/contracts/abis";
import { CONTRACTS } from "@/contracts/config";
import toast from "react-hot-toast";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";

export function IDRXFaucet() {
  const { isConnected } = useAccount();
  const { data: hash, writeContract, isPending } = useWriteContract();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess) {
      toast.success("Received 10,000 test IDRX! 🎉");
    }
  }, [isSuccess]);

  const handleFaucet = () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      writeContract({
        address: CONTRACTS.IDRX,
        abi: IDRX_ABI,
        functionName: "faucet",
      });
    } catch (error) {
      console.error("Faucet error:", error);
      toast.error("Failed to get test IDRX");
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-6">
      <h3 className="font-semibold text-lg mb-2">🪙 Get Test IDRX</h3>
      <p className="text-gray-600 mb-4 text-sm">Get 10,000 test IDRX tokens to try out payments (Base Sepolia only)</p>

      <button
        onClick={handleFaucet}
        disabled={isPending || isLoading || !isConnected}
        className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending || isLoading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Getting IDRX...
          </span>
        ) : (
          "Get 10,000 Test IDRX"
        )}
      </button>
    </div>
  );
}
