"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Html5Qrcode } from "html5-qrcode";
import toast from "react-hot-toast";

export function QRScanner() {
  const router = useRouter();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const startScanning = async () => {
    try {
      setError(null);
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        decodedText => {
          // Successfully scanned
          scanner.stop().catch(console.error);
          setIsScanning(false);

          // Parse the QR code URL
          try {
            const url = new URL(decodedText);
            const merchant = url.searchParams.get("merchant");
            const invoice = url.searchParams.get("invoice");
            const amount = url.searchParams.get("amount");

            if (!merchant) {
              toast.error("Invalid QR code");
              return;
            }

            // Navigate to payment page
            const params = new URLSearchParams({
              merchant,
              ...(invoice && { invoice }),
              ...(amount && { amount }),
            });

            router.push(`/pay/process?${params.toString()}`);
          } catch (err) {
            toast.error("Invalid QR code format");
          }
        },
        errorMessage => {
          // Scanning error (can be ignored if just searching for QR)
        },
      );

      setIsScanning(true);
    } catch (err: any) {
      console.error("Scanner error:", err);
      setError(err.message || "Failed to start camera");
      toast.error("Failed to start camera. Please check permissions.");
    }
  };

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().catch(console.error);
      setIsScanning(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div id="qr-reader" className="rounded-lg overflow-hidden mb-4"></div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {!isScanning ? (
        <button
          onClick={startScanning}
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Start Scanning
        </button>
      ) : (
        <button
          onClick={stopScanning}
          className="w-full bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
        >
          Stop Scanning
        </button>
      )}
    </div>
  );
}
