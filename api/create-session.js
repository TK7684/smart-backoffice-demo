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
    // Check if Stripe secret key is set
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      console.error('STRIPE_SECRET_KEY environment variable is not set');
      return res.status(500).json({
        success: false,
        error: 'Stripe secret key not configured. Please set STRIPE_SECRET_KEY in Vercel environment variables.'
      });
    }

    // Validate key format
    if (!stripeSecretKey.startsWith('sk_test_') && !stripeSecretKey.startsWith('sk_live_')) {
      console.error('Invalid Stripe secret key format. Must start with sk_test_ or sk_live_');
      return res.status(500).json({
        success: false,
        error: 'Invalid Stripe secret key format. Key must start with sk_test_ or sk_live_'
      });
    }

    // Initialize Stripe with the secret key
    const stripe = require('stripe')(stripeSecretKey);

    const { package, packageName, amount, currency, successUrl, cancelUrl } = req.body;

    // Validate required fields
    if (!amount || !packageName) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: amount and packageName'
      });
    }

    // Create Stripe Checkout Session
    console.log('Creating Stripe Checkout Session with:', {
      amount: amount,
      currency: currency || 'thb',
      packageName: packageName
    });
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'link'], // Enable Link for faster checkout
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
      // Note: Link is enabled by adding 'link' to payment_method_types
      // Link must also be enabled in Stripe Dashboard: https://dashboard.stripe.com/settings/payment_methods
    });
    
    console.log('Stripe Checkout Session created:', {
      sessionId: session.id,
      url: session.url,
      paymentStatus: session.payment_status
    });

    // Return success with session ID
    res.json({
      success: true,
      sessionId: session.id,
      url: session.url // Optional: direct checkout URL
    });

  } catch (error) {
    console.error('Stripe Checkout Session creation error:', {
      message: error.message,
      type: error.type,
      code: error.code,
      statusCode: error.statusCode,
      raw: error.raw ? error.raw.message : null
    });
    
    // Provide more helpful error messages
    let errorMessage = error.message || 'Failed to create checkout session';
    if (error.type === 'StripeAuthenticationError') {
      errorMessage = 'Invalid Stripe API key. Please check your STRIPE_SECRET_KEY in Vercel environment variables.';
    } else if (error.type === 'StripeAPIError') {
      errorMessage = `Stripe API error: ${error.message}`;
    }
    
    res.status(500).json({
      success: false,
      error: errorMessage,
      errorType: error.type,
      errorCode: error.code
    });
  }
};

