"use client";

import { useEffect, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

interface QRCodeDisplayProps {
  merchantAddress: string;
  invoiceId?: string;
  amount?: string;
}

export function QRCodeDisplay({ merchantAddress, invoiceId, amount }: QRCodeDisplayProps) {
  const qrRef = useRef<HTMLDivElement>(null);
  const [qrValue, setQrValue] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    // Create QR data URL
    const baseUrl = window.location.origin;
    const params = new URLSearchParams({
      merchant: merchantAddress,
      ...(invoiceId && { invoice: invoiceId }),
      ...(amount && { amount }),
    });

    setQrValue(`${baseUrl}/pay?${params.toString()}`);
  }, [merchantAddress, invoiceId, amount, isMounted]);

  const downloadQR = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (canvas) {
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `qr-${merchantAddress.slice(0, 8)}.png`;
      link.href = url;
      link.click();
    }
  };

  if (!isMounted) {
    return (
      <div className="flex flex-col items-center">
        <div className="bg-white p-4 rounded-lg border-2 border-gray-200 w-[288px] h-[288px] flex items-center justify-center">
          <div className="text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div ref={qrRef} className="bg-white p-4 rounded-lg border-2 border-gray-200">
        {qrValue && <QRCodeCanvas value={qrValue} size={256} level="H" includeMargin={true} />}
      </div>

      <div className="mt-4 space-y-2 w-full">
        <button
          onClick={downloadQR}
          className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition"
        >
          Download QR Code
        </button>

        <p className="text-xs text-gray-500 text-center">
          Merchant: {merchantAddress.slice(0, 6)}...{merchantAddress.slice(-4)}
        </p>
      </div>
    </div>
  );
}
