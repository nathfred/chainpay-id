export const MERCHANT_REGISTRY_ABI = [
  {
    inputs: [
      { name: "_businessName", type: "string" },
      { name: "_category", type: "string" },
      { name: "_logoURI", type: "string" },
    ],
    name: "register",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "_merchant", type: "address" }],
    name: "getMerchant",
    outputs: [
      {
        components: [
          { name: "walletAddress", type: "address" },
          { name: "businessName", type: "string" },
          { name: "category", type: "string" },
          { name: "logoURI", type: "string" },
          { name: "registeredAt", type: "uint256" },
          { name: "isActive", type: "bool" },
          { name: "totalTransactions", type: "uint256" },
          { name: "totalVolume", type: "uint256" },
        ],
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "", type: "address" }],
    name: "isRegistered",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "_merchant", type: "address" }],
    name: "isActiveMerchant",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "merchantAddress", type: "address" },
      { indexed: false, name: "businessName", type: "string" },
      { indexed: false, name: "timestamp", type: "uint256" },
    ],
    name: "MerchantRegistered",
    type: "event",
  },
] as const;

export const PAYMENT_PROCESSOR_ABI = [
  {
    inputs: [
      { name: "_merchant", type: "address" },
      { name: "_amount", type: "uint256" },
    ],
    name: "processPayment",
    outputs: [{ name: "", type: "bytes32" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "_amount", type: "uint256" },
      { name: "_description", type: "string" },
      { name: "_expiryMinutes", type: "uint256" },
    ],
    name: "createInvoice",
    outputs: [{ name: "", type: "bytes32" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "_invoiceId", type: "bytes32" }],
    name: "payInvoice",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "_invoiceId", type: "bytes32" }],
    name: "getInvoice",
    outputs: [
      {
        components: [
          { name: "merchant", type: "address" },
          { name: "amount", type: "uint256" },
          { name: "description", type: "string" },
          { name: "createdAt", type: "uint256" },
          { name: "expiresAt", type: "uint256" },
          { name: "isPaid", type: "bool" },
          { name: "paidBy", type: "address" },
          { name: "paidAt", type: "uint256" },
        ],
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "from", type: "address" },
      { indexed: true, name: "merchant", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
      { indexed: false, name: "fee", type: "uint256" },
      { indexed: false, name: "netAmount", type: "uint256" },
      { indexed: false, name: "timestamp", type: "uint256" },
      { indexed: true, name: "paymentId", type: "bytes32" },
    ],
    name: "PaymentProcessed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "invoiceId", type: "bytes32" },
      { indexed: true, name: "merchant", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
      { indexed: false, name: "description", type: "string" },
      { indexed: false, name: "expiresAt", type: "uint256" },
    ],
    name: "InvoiceCreated",
    type: "event",
  },
] as const;

export const IDRX_ABI = [
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "faucet",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "from", type: "address" },
      { indexed: true, name: "to", type: "address" },
      { indexed: false, name: "value", type: "uint256" },
    ],
    name: "Transfer",
    type: "event",
  },
] as const;
