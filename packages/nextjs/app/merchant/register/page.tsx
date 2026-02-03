"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MERCHANT_REGISTRY_ABI } from "@/contracts/abis";
import { CONTRACTS } from "@/contracts/config";
import toast from "react-hot-toast";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";

export default function MerchantRegister() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState("Food & Beverage");
  const [logoURI, setLogoURI] = useState("");

  const { data: hash, writeContract, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!businessName.trim()) {
      toast.error("Business name is required");
      return;
    }

    try {
      writeContract({
        address: CONTRACTS.MERCHANT_REGISTRY,
        abi: MERCHANT_REGISTRY_ABI,
        functionName: "register",
        args: [businessName, category, logoURI || ""],
      });
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Failed to register merchant");
    }
  };

  // Handle success
  if (isSuccess) {
    toast.success("Merchant registered successfully!");
    setTimeout(() => {
      router.push("/merchant/dashboard");
    }, 2000);
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-2xl px-4">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold mb-2">Register as Merchant</h1>
          <p className="text-gray-600 mb-8">Create your merchant account to start accepting IDRX payments</p>

          {!isConnected ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800">Please connect your wallet to register as a merchant</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Name *</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                  placeholder="Warung Makan Sederhana"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Category *</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Food & Beverage">Food & Beverage</option>
                  <option value="Retail">Retail</option>
                  <option value="Services">Services</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Education">Education</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Logo URL (Optional)</label>
                <input
                  type="text"
                  value={logoURI}
                  onChange={e => setLogoURI(e.target.value)}
                  placeholder="https://... or ipfs://..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">Enter a URL or IPFS hash for your business logo</p>
              </div>

              <button
                type="submit"
                disabled={isPending || isConfirming}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending || isConfirming ? (
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
                    {isPending ? "Confirming..." : "Processing..."}
                  </span>
                ) : (
                  "Register Merchant"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
