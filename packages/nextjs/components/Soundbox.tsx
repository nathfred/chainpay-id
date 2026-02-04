"use client";

import { useState } from "react";
import { PAYMENT_PROCESSOR_ABI } from "@/contracts/abis";
import { CONTRACTS, formatIDRX } from "@/contracts/config";
import { formatDistanceToNow } from "date-fns";
import { useWatchContractEvent } from "wagmi";

interface SoundboxProps {
  merchantAddress: string;
}

interface Payment {
  from: string;
  amount: bigint;
  timestamp: number;
  txHash: string;
}

// Indonesian number to words conversion
function numberToIndonesian(num: number): string {
  const ones = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan"];
  const tens = [
    "",
    "",
    "Dua Puluh",
    "Tiga Puluh",
    "Empat Puluh",
    "Lima Puluh",
    "Enam Puluh",
    "Tujuh Puluh",
    "Delapan Puluh",
    "Sembilan Puluh",
  ];
  const teens = [
    "Sepuluh",
    "Sebelas",
    "Dua Belas",
    "Tiga Belas",
    "Empat Belas",
    "Lima Belas",
    "Enam Belas",
    "Tujuh Belas",
    "Delapan Belas",
    "Sembilan Belas",
  ];

  if (num === 0) return "Nol";
  if (num < 10) return ones[num];
  if (num >= 10 && num < 20) return teens[num - 10];
  if (num >= 20 && num < 100) {
    const ten = Math.floor(num / 10);
    const one = num % 10;
    return tens[ten] + (one > 0 ? " " + ones[one] : "");
  }
  if (num >= 100 && num < 1000) {
    const hundred = Math.floor(num / 100);
    const rest = num % 100;
    const hundredWord = hundred === 1 ? "Seratus" : ones[hundred] + " Ratus";
    return hundredWord + (rest > 0 ? " " + numberToIndonesian(rest) : "");
  }
  if (num >= 1000 && num < 1000000) {
    const thousand = Math.floor(num / 1000);
    const rest = num % 1000;
    const thousandWord = thousand === 1 ? "Seribu" : numberToIndonesian(thousand) + " Ribu";
    return thousandWord + (rest > 0 ? " " + numberToIndonesian(rest) : "");
  }
  if (num >= 1000000) {
    const million = Math.floor(num / 1000000);
    const rest = num % 1000000;
    return numberToIndonesian(million) + " Juta" + (rest > 0 ? " " + numberToIndonesian(rest) : "");
  }
  return num.toString();
}

export function Soundbox({ merchantAddress }: SoundboxProps) {
  const [isEnabled, setIsEnabled] = useState(true);
  const [volume, setVolume] = useState(1.0);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Watch for payment events
  useWatchContractEvent({
    address: CONTRACTS.PAYMENT_PROCESSOR,
    abi: PAYMENT_PROCESSOR_ABI,
    eventName: "PaymentProcessed",
    onLogs(logs) {
      logs.forEach((log: any) => {
        const { from, merchant, amount, timestamp } = log.args;

        // Only process if payment is for this merchant
        if (merchant.toLowerCase() === merchantAddress.toLowerCase()) {
          const payment: Payment = {
            from,
            amount,
            timestamp: Number(timestamp),
            txHash: log.transactionHash,
          };

          // Add to recent payments
          setRecentPayments(prev => [payment, ...prev.slice(0, 9)]);

          // Play sound
          if (isEnabled) {
            speakPayment(amount);
          }
        }
      });
    },
  });

  const speakPayment = (amount: bigint) => {
    if (!isEnabled || isSpeaking) return;

    // Convert amount to number (in IDRX)
    const amountNumber = Number(amount) / Math.pow(10, 6);
    const roundedAmount = Math.round(amountNumber);

    // Convert to Indonesian words
    const amountInWords = numberToIndonesian(roundedAmount);
    const message = `${amountInWords} IDRX Diterima`;

    setIsSpeaking(true);

    // Use Web Speech API
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.lang = "id-ID";
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = volume;

      utterance.onend = () => {
        setIsSpeaking(false);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        console.error("Speech synthesis error");
      };

      window.speechSynthesis.speak(utterance);
    } else {
      setIsSpeaking(false);
      console.warn("Speech synthesis not supported");
    }
  };

  const testSound = () => {
    const testAmount = BigInt(50000 * Math.pow(10, 6)); // 50,000 IDRX
    speakPayment(testAmount);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center">
          <span className="text-2xl mr-2">🔊</span>
          Soundbox
        </h2>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={e => setIsEnabled(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          <span className="ml-3 text-sm font-medium text-gray-900">{isEnabled ? "ON" : "OFF"}</span>
        </label>
      </div>

      {/* Volume Control */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Volume</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={e => setVolume(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          disabled={!isEnabled}
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>🔇 Quiet</span>
          <span>🔊 Loud</span>
        </div>
      </div>

      {/* Test Button */}
      <button
        onClick={testSound}
        disabled={!isEnabled || isSpeaking}
        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed mb-4"
      >
        {isSpeaking ? "Playing..." : "Test Sound"}
      </button>

      {/* Recent Payments */}
      <div className="border-t pt-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Recent Payments</h3>
        {recentPayments.length === 0 ? (
          <p className="text-sm text-gray-500">No payments yet</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {recentPayments.map((payment, idx) => (
              <div key={payment.txHash + idx} className="bg-gray-50 rounded p-3 text-sm">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold text-green-600">+{formatIDRX(payment.amount)} IDRX</span>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(payment.timestamp * 1000, { addSuffix: true })}
                  </span>
                </div>
                <p className="text-xs text-gray-600">
                  From: {payment.from.slice(0, 6)}...{payment.from.slice(-4)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status Indicator */}
      <div className="mt-4 flex items-center justify-center">
        <div className={`w-3 h-3 rounded-full mr-2 ${isEnabled ? "bg-green-500 animate-pulse" : "bg-gray-300"}`}></div>
        <span className="text-sm text-gray-600">{isEnabled ? "Listening for payments..." : "Soundbox disabled"}</span>
      </div>
    </div>
  );
}
