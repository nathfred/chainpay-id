# ChainPay ID Testing Checklist

## Pre-Testing Setup

- [ ] Get Base Sepolia ETH from faucet
- [ ] Get test IDRX from contract faucet
- [ ] Connect wallet to Base Sepolia network

## Merchant Flow Testing

- [ ] **Registration**
  - [ ] Connect wallet
  - [ ] Fill registration form
  - [ ] Submit transaction
  - [ ] Verify on BaseScan
  - [ ] Check merchant appears in dashboard

- [ ] **Dashboard**
  - [ ] View merchant info
  - [ ] See QR code displayed
  - [ ] Download QR code
  - [ ] Check stats (should be 0 initially)

- [ ] **Soundbox**
  - [ ] Toggle ON/OFF
  - [ ] Adjust volume
  - [ ] Click "Test Sound"
  - [ ] Verify audio plays in Indonesian

- [ ] **Invoice Creation**
  - [ ] Navigate to Create Invoice
  - [ ] Fill amount and description
  - [ ] Set expiry time
  - [ ] Submit transaction
  - [ ] Verify invoice created
  - [ ] Check invoice QR code generates

## Customer Flow Testing

- [ ] **Get Test IDRX**
  - [ ] Click "Get Test IDRX"
  - [ ] Receive 10,000 IDRX
  - [ ] Check balance updates

- [ ] **QR Scanning**
  - [ ] Navigate to Pay page
  - [ ] Allow camera access
  - [ ] Scan merchant QR code
  - [ ] Verify redirect to payment page

- [ ] **Payment Processing**
  - [ ] Enter payment amount
  - [ ] Check balance display
  - [ ] Click "Approve IDRX"
  - [ ] Wait for approval confirmation
  - [ ] Click "Pay"
  - [ ] Verify gasless transaction
  - [ ] Check success page

- [ ] **Soundbox Verification (Merchant Side)**
  - [ ] Merchant should hear: "X IDRX Diterima"
  - [ ] Check recent payments list updates
  - [ ] Verify transaction in dashboard

## Invoice Payment Testing

- [ ] **Create Invoice (Merchant)**
  - [ ] Create invoice with fixed amount
  - [ ] Share invoice QR code

- [ ] **Pay Invoice (Customer)**
  - [ ] Scan invoice QR
  - [ ] Verify amount is locked
  - [ ] Approve and pay
  - [ ] Check invoice marked as paid

## Edge Cases

- [ ] Try paying without IDRX balance
- [ ] Try paying without approval
- [ ] Try scanning invalid QR code
- [ ] Try paying expired invoice
- [ ] Try paying already-paid invoice
- [ ] Test with multiple merchants
- [ ] Test rapid successive payments

## Performance Testing

- [ ] Page load times < 3 seconds
- [ ] QR scan responsiveness
- [ ] Transaction confirmation < 5 seconds
- [ ] Soundbox latency < 2 seconds
- [ ] Mobile responsiveness

## Browser Compatibility

- [ ] Chrome (Desktop & Mobile)
- [ ] Safari (Desktop & Mobile)
- [ ] Firefox
- [ ] Edge

## Network Testing

- [ ] Test on slow 3G connection
- [ ] Test with VPN
- [ ] Test transaction failures
- [ ] Test wallet disconnection

## Security Testing

- [ ] Cannot pay to unregistered merchant
- [ ] Cannot pay with insufficient balance
- [ ] Cannot bypass approval
- [ ] XSS prevention in forms
- [ ] SQL injection prevention (if using backend)
