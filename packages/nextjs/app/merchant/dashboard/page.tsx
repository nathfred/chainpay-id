"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { QRCodeDisplay } from "@/components/QRCodeDisplay";
import { MERCHANT_REGISTRY_ABI } from "@/contracts/abis";
import { CONTRACTS, formatIDRX } from "@/contracts/config";
import { useAccount, useReadContract } from "wagmi";

export default function MerchantDashboard() {
  const router = useRouter();
  const { address, isConnected } = useAccount();

  // Check if merchant is registered
  const { data: isRegistered, isLoading } = useReadContract({
    address: CONTRACTS.MERCHANT_REGISTRY,
    abi: MERCHANT_REGISTRY_ABI,
    functionName: "isRegistered",
    args: address ? [address] : undefined,
  });

  // Get merchant data
  const { data: merchantData } = useReadContract({
    address: CONTRACTS.MERCHANT_REGISTRY,
    abi: MERCHANT_REGISTRY_ABI,
    functionName: "getMerchant",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!isRegistered,
    },
  });

  useEffect(() => {
    if (!isConnected) {
      router.push("/merchant/register");
    } else if (!isLoading && !isRegistered) {
      router.push("/merchant/register");
    }
  }, [isConnected, isRegistered, isLoading, router]);

  if (isLoading || !merchantData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading merchant data...</p>
        </div>
      </div>
    );
  }

  const [merchantInfo] = merchantData as any;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{merchantInfo.businessName}</h1>
          <p className="text-gray-600">{merchantInfo.category}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-sm text-gray-600 mb-1">Total Transactions</p>
            <p className="text-3xl font-bold text-gray-900">{merchantInfo.totalTransactions?.toString() || "0"}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-sm text-gray-600 mb-1">Total Volume</p>
            <p className="text-3xl font-bold text-gray-900">{formatIDRX(merchantInfo.totalVolume || 0n)} IDRX</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-sm text-gray-600 mb-1">Status</p>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              {merchantInfo.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Your Payment QR Code</h2>
            <p className="text-gray-600 mb-6">Display this QR code at your checkout for customers to scan and pay</p>
            <QRCodeDisplay merchantAddress={address!} />
          </div>

          <div className="space-y-4">
            <Link
              href="/merchant/invoice/create"
              className="block bg-blue-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-blue-700 transition text-center"
            >
              Create Invoice
            </Link>

            <Link
              href="/merchant/transactions"
              className="block bg-white border-2 border-gray-300 text-gray-700 px-6 py-4 rounded-lg font-semibold hover:bg-gray-50 transition text-center"
            >
              View Transactions
            </Link>

            <Link
              href="/merchant/settings"
              className="block bg-white border-2 border-gray-300 text-gray-700 px-6 py-4 rounded-lg font-semibold hover:bg-gray-50 transition text-center"
            >
              Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
