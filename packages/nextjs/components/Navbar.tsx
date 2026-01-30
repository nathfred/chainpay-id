"use client";

import Link from "next/link";
import { WalletButton } from "./WalletButton";

export function Navbar() {
  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">⚡</span>
              <span className="ml-2 text-xl font-semibold text-gray-900">ChainPay ID</span>
            </Link>

            <div className="ml-10 flex space-x-4">
              <Link
                href="/merchant"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Merchant
              </Link>
              <Link href="/pay" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Pay
              </Link>
            </div>
          </div>

          <WalletButton />
        </div>
      </div>
    </nav>
  );
}
