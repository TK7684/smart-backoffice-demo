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
    const { package, packageName, amount, currency, successUrl, cancelUrl } = req.body;

    // Validate required fields
    if (!amount || !packageName) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: amount and packageName'
      });
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: currency || 'thb',
          product_data: {
            name: packageName || `Package ${package || 'Unknown'}`,
          },
          unit_amount: Math.round(amount * 100), // Convert to cents (THB uses satang)
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: successUrl || `${req.headers.origin || 'https://smart-backoffice-demo.pages.dev'}?session_id={CHECKOUT_SESSION_ID}&payment_status=success`,
      cancel_url: cancelUrl || `${req.headers.origin || 'https://smart-backoffice-demo.pages.dev'}?payment_status=cancel`,
      metadata: {
        package: package || '',
        packageName: packageName || ''
      }
    });

    // Return success with session ID
    res.json({
      success: true,
      sessionId: session.id,
      url: session.url // Optional: direct checkout URL
    });

  } catch (error) {
    console.error('Stripe Checkout Session creation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create checkout session'
    });
  }
};

