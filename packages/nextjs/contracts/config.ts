export const CONTRACTS = {
  IDRX: "0x7d65594A92F54b1aa72cf5d46cB7893b991FDDE5" as `0x${string}`,
  MERCHANT_REGISTRY: "0x7f899bFFCF9CAfa9B3b781F2252db0620670Bd2c" as `0x${string}`,
  PAYMENT_PROCESSOR: "0xae2536c18b809a5a4C7aC17432345CB99599D4A5" as `0x${string}`,
} as const;

// IDRX decimals
export const IDRX_DECIMALS = 6;

// Format IDRX amount for display
export function formatIDRX(amount: bigint): string {
  const value = Number(amount) / Math.pow(10, IDRX_DECIMALS);
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

// Parse IDRX amount from string
export function parseIDRX(amount: string): bigint {
  const value = parseFloat(amount);
  if (isNaN(value)) return 0n;
  return BigInt(Math.floor(value * Math.pow(10, IDRX_DECIMALS)));
}
