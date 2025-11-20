# Payment Account Setup Guide

This guide explains how to configure your PromptPay account for receiving payments via QR code.

## Quick Setup

1. **Open `index.html`** in your code editor
2. **Find the `PAYMENT_CONFIG` section** (around line 1776)
3. **Update the following values:**

```javascript
const PAYMENT_CONFIG = {
  promptPayId: "0812345678",        // ⚠️ REPLACE WITH YOUR PROMPTPAY ID
  merchantName: "AI Smart Backoffice",
  contactPhone: "0812345678"         // ⚠️ REPLACE WITH YOUR CONTACT PHONE
};
```

## How to Get Your PromptPay ID

### Option 1: Using Your Phone Number
- **Format**: 10 digits starting with 08
- **Example**: `0812345678`
- **How to find**: Check your mobile banking app (SCB, KBank, BBL, etc.)
- **Where to look**: 
  - Open your banking app
  - Go to "PromptPay" or "QR Payment" section
  - Your registered phone number is your PromptPay ID

### Option 2: Using Your National ID
- **Format**: 13 digits
- **Example**: `1234567890123`
- **How to find**: Your Thai National ID card number
- **Note**: Must be registered with PromptPay in your bank

### Option 3: Using Your Bank Account Number
- **Format**: Varies by bank (usually 10-12 digits)
- **How to find**: Check your bank account number
- **Note**: Must be registered with PromptPay

## Step-by-Step Setup Instructions

### Step 1: Get Your PromptPay ID

1. **Open your mobile banking app** (SCB Easy, KBank, BBL mBanking, etc.)
2. **Navigate to PromptPay section**:
   - SCB: Menu → PromptPay
   - KBank: Services → PromptPay
   - BBL: Services → PromptPay
3. **Check your registered PromptPay ID**:
   - It will show your phone number, National ID, or account number
   - Copy this number

### Step 2: Update the Code

1. Open `index.html` in your code editor
2. Search for `PAYMENT_CONFIG` (around line 1776)
3. Replace `"0812345678"` with your actual PromptPay ID:

```javascript
const PAYMENT_CONFIG = {
  promptPayId: "YOUR_ACTUAL_PROMPTPAY_ID",  // e.g., "0812345678"
  merchantName: "AI Smart Backoffice",
  contactPhone: "YOUR_CONTACT_PHONE"         // e.g., "0812345678"
};
```

### Step 3: Test the QR Code

1. **Save the file**
2. **Open `index.html` in a browser**
3. **Click "📦 เลือกแพ็กเกจบริการ"**
4. **Select a package**
5. **Verify the QR code appears**
6. **Test scan with your banking app**:
   - Open your banking app
   - Use "Scan QR" feature
   - Verify it shows the correct amount and recipient

## Important Notes

### ⚠️ Security Considerations

- **Never commit your actual PromptPay ID to public repositories**
- Consider using environment variables or server-side configuration
- For production, use proper Thai QR code library with CRC validation

### 📱 QR Code Format

The current implementation uses a simplified QR code format. For production use, consider:

1. **Using proper Thai QR code library**:
   - Python: [pypromptpay](https://github.com/suphakin-th/THAI_QRCODE)
   - JavaScript: Use SCB API or proper Thai QR standard library

2. **SCB Developer API** (Recommended for production):
   - Documentation: https://developer.scb.co.th/#/documents/documentation/qr-payment/thai-qr.html
   - Provides proper Thai QR code generation with CRC validation

### 🔧 Advanced Setup (Optional)

For production, you may want to:

1. **Move configuration to server-side**:
   - Store PromptPay ID in Google Apps Script
   - Generate QR code server-side
   - Return QR code image to frontend

2. **Use proper Thai QR code library**:
   ```javascript
   // Example using proper library (pseudo-code)
   const thaiQR = require('thai-qr-code');
   const qrData = thaiQR.generate({
     promptPayId: PAYMENT_CONFIG.promptPayId,
     amount: amount,
     merchantName: PAYMENT_CONFIG.merchantName
   });
   ```

3. **Add payment verification**:
   - Webhook from bank to verify payment
   - Update order status automatically
   - Send confirmation emails

## Troubleshooting

### QR Code Not Appearing
- Check browser console for errors
- Verify QRCode.js library is loaded
- Check that `qrcode` element exists in HTML

### QR Code Not Scannable
- Current implementation uses simplified format
- For production, use proper Thai QR code library
- Verify PromptPay ID format is correct

### Payment Not Received
- Verify PromptPay ID is correct
- Check that account is registered with PromptPay
- Verify amount matches what customer scanned

## Testing

1. **Test with small amount first** (e.g., 1 ฿)
2. **Scan QR code with your own banking app**
3. **Verify payment details are correct**:
   - Amount
   - Recipient (your PromptPay ID)
   - Merchant name

## Support

If you need help:
- Check SCB Developer Documentation: https://developer.scb.co.th/
- Review Thai QR Code GitHub: https://github.com/suphakin-th/THAI_QRCODE
- Contact your bank's developer support

---

**Last Updated**: 2024-01-15
**Version**: 1.0.0

