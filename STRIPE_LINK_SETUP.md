# ✅ Stripe Link Setup Guide

## 🎯 What is Stripe Link?

[Stripe Link](https://docs.stripe.com/payments/link) allows your customers to:
- **Save payment information** for faster checkout
- **Reuse saved cards** at any Link-enabled business
- **Authenticate with email/phone** instead of entering card details every time
- **Complete checkout faster** with one-time passcode authentication

---

## ✅ What I've Enabled

I've updated your Checkout session to include Link:

```javascript
payment_method_types: ['card', 'link'], // Link enabled
payment_method_options: {
  link: {
    enabled: true
  }
}
```

---

## 🔧 Additional Setup Required

### 1. Enable Link in Stripe Dashboard

**Important**: You must enable Link in your Stripe Dashboard:

1. Go to: https://dashboard.stripe.com/settings/payment_methods
2. Find **"Link"** in the payment methods list
3. **Enable** Link for your account
4. **Save** changes

**Note**: Link is not available in India. In Brazil and Thailand, Link works with Checkout (which you're using) but not with Payment Element.

---

## 🧪 How It Works

### For New Customers:
1. Customer clicks "Pay with Stripe"
2. On Stripe Checkout page, they see **"Pay with Link"** option
3. Customer enters email/phone
4. Receives one-time passcode
5. After authentication, Link autofills payment details
6. Customer can save card for future use

### For Returning Customers:
1. Customer clicks "Pay with Stripe"
2. Link detects they're enrolled (via email/phone/cookie)
3. Customer enters one-time passcode
4. Payment details autofill automatically
5. **Faster checkout!** ⚡

---

## 📋 Customer Experience

When customers visit your checkout page, they'll see:

```
┌─────────────────────────────────┐
│  💳 Pay with Link              │
│  Check out faster with Link    │
│  [Email/Phone input]           │
│  [Continue]                     │
└─────────────────────────────────┘
```

Or if they're already enrolled:
```
┌─────────────────────────────────┐
│  ✅ Welcome back!              │
│  [Saved Card: •••• 4242]       │
│  [Enter passcode]              │
│  [Pay Now]                      │
└─────────────────────────────────┘
```

---

## 🔍 Testing Link

### Test Link Account:
1. Use a **test email** (e.g., `test@example.com`)
2. Complete a payment with Link
3. Save the card during checkout
4. On next payment, Link should detect you and offer faster checkout

### Test Cards:
- Use standard Stripe test cards: `4242 4242 4242 4242`
- Link will work with any valid test card

---

## 📚 Documentation

- **Stripe Link Docs**: https://docs.stripe.com/payments/link
- **Link with Checkout**: https://docs.stripe.com/payments/link/checkout
- **Link Authentication**: https://docs.stripe.com/payments/link#link-authentication

---

## ⚠️ Important Notes

1. **Dashboard Setup Required**: Link must be enabled in Stripe Dashboard settings
2. **Account Activation**: Some accounts may need to activate Link (check your dashboard)
3. **Country Availability**: Link works in Thailand with Checkout ✅
4. **Customer Privacy**: Customers manage their Link account at [link.com](https://link.com)

---

## 🎉 Benefits

- ✅ **Faster checkout** for returning customers
- ✅ **Higher conversion rates** (less friction)
- ✅ **Better customer experience**
- ✅ **Secure** (one-time passcode authentication)
- ✅ **Cross-merchant** (customers can use Link at any enabled business)

---

## 🚀 Next Steps

1. **Enable Link in Dashboard**: https://dashboard.stripe.com/settings/payment_methods
2. **Deploy the updated code** (already done - just push to trigger redeploy)
3. **Test the checkout flow** with a test email
4. **Verify Link appears** on your checkout page

**The code is ready! Just enable Link in your Stripe Dashboard.** 🎉

