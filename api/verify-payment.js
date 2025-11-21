const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  // Enable CORS for all origins (you can restrict this to your domain later)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      error: 'Method not allowed. Use POST.' 
    });
  }

  try {
    const { sessionId } = req.body;

    // Validate session ID
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: sessionId',
        paid: false
      });
    }

    // Retrieve Stripe Checkout Session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Return payment status
    res.json({
      success: true,
      paid: session.payment_status === 'paid',
      amount: session.amount_total ? session.amount_total / 100 : 0, // Convert from cents
      currency: session.currency || 'thb',
      customerEmail: session.customer_details?.email || null,
      paymentStatus: session.payment_status,
      metadata: session.metadata || {}
    });

  } catch (error) {
    console.error('Stripe payment verification error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to verify payment',
      paid: false
    });
  }
};

