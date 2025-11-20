/**
 * Kasikorn Bank OAuth 2.0 Test Script
 * 
 * This script demonstrates how to authenticate with K-Bank API using OAuth Client Credentials
 */

// OAuth Credentials
const CONSUMER_ID = 'suDxvMLTLYsQwL1R0L9UL1m8Ceoibmcr';
const CONSUMER_SECRET = 'goOfPtGLoGxYP3DG';

// API Endpoint
const OAUTH_URL = 'https://openapi-sandbox.kasikornbank.com/v2/oauth/token';

/**
 * Step 1: Create Basic Authentication String
 * Format: <Consumer ID>:<Consumer Secret>
 */
function createBasicAuthString() {
  const credentials = `${CONSUMER_ID}:${CONSUMER_SECRET}`;
  console.log('Step 1 - Credentials string:', credentials);
  return credentials;
}

/**
 * Step 2: Encode to Base64
 * In browser: btoa() function
 * In Node.js: Buffer.from().toString('base64')
 */
function encodeBase64(str) {
  // For browser environment
  if (typeof btoa !== 'undefined') {
    return btoa(str);
  }
  // For Node.js environment
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str).toString('base64');
  }
  throw new Error('No Base64 encoding method available');
}

/**
 * Step 3: Make OAuth Token Request
 */
async function getAccessToken() {
  try {
    // Create Basic Auth header
    const credentials = createBasicAuthString();
    const encodedCredentials = encodeBase64(credentials);
    const authHeader = `Basic ${encodedCredentials}`;
    
    console.log('Step 2 - Base64 encoded:', encodedCredentials);
    console.log('Step 3 - Authorization header:', authHeader);
    
    // Prepare request
    const headers = {
      'Authorization': authHeader,
      'Content-Type': 'application/x-www-form-urlencoded',
      'x-test-mode': 'true',
      'env-id': 'OAUTH2'
    };
    
    const body = new URLSearchParams({
      'grant_type': 'client_credentials'
    });
    
    console.log('\nMaking OAuth request...');
    console.log('URL:', OAUTH_URL);
    console.log('Headers:', headers);
    console.log('Body:', body.toString());
    
    // Make the request
    const response = await fetch(OAUTH_URL, {
      method: 'POST',
      headers: headers,
      body: body.toString()
    });
    
    const data = await response.json();
    
    console.log('\n=== Response ===');
    console.log('Status:', response.status, response.statusText);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.ok && data.access_token) {
      console.log('\n✓ Success! Access Token received');
      console.log('Access Token:', data.access_token);
      console.log('Token Type:', data.token_type);
      console.log('Expires In:', data.expires_in, 'seconds (' + Math.round(data.expires_in / 60) + ' minutes)');
      return data;
    } else {
      console.error('\n✗ Error:', data);
      return null;
    }
    
  } catch (error) {
    console.error('Error making OAuth request:', error);
    return null;
  }
}

// Run the test
if (typeof window !== 'undefined') {
  // Browser environment
  console.log('Running in browser...');
  window.getAccessToken = getAccessToken;
  console.log('Call getAccessToken() to test OAuth');
} else {
  // Node.js environment
  console.log('Running in Node.js...');
  getAccessToken();
}

