// M-Pesa Daraja API - STK Push Only
const BASE_URL = 'https://sandbox.safaricom.co.ke' // Change to production URL for live
const BUSINESS_SHORTCODE = process.env.MPESA_BUSINESS_SHORTCODE || '174379'
const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY || ''
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET || ''
const PASSKEY = process.env.MPESA_PASSKEY || ''
const CALLBACK_URL = process.env.MPESA_CALLBACK_URL || 'https://invoiceflow.com/api/mpesa/callback'

let tokenCache: { token: string; expiry: number } | null = null

// Get OAuth access token
async function getAccessToken(): Promise<string> {
  // Return cached token if still valid
  if (tokenCache && tokenCache.expiry > Date.now()) {
    return tokenCache.token
  }

  const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64')

  try {
    const response = await fetch(`${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${auth}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to get access token: ${response.statusText}`)
    }

    const data = await response.json() as { access_token: string; expires_in: number }
    tokenCache = {
      token: data.access_token,
      expiry: Date.now() + data.expires_in * 1000,
    }

    return data.access_token
  } catch (error) {
    console.error('[M-Pesa] Error getting access token:', error)
    throw error
  }
}

// Initiate STK Push - sends payment prompt to user's phone
export async function initiateStkPush(
  phoneNumber: string,
  amount: number,
  invoiceId: string
) {
  const token = await getAccessToken()

  // Format phone number: ensure it starts with 254 for Kenya
  let formattedPhone = phoneNumber.replace(/^0/, '254')
  if (!formattedPhone.startsWith('254')) {
    formattedPhone = `254${phoneNumber}`
  }

  // Generate timestamp
  const timestamp = new Date().toISOString().replace(/[:-]/g, '').split('.')[0]

  // Generate password for STK push
  const password = Buffer.from(`${BUSINESS_SHORTCODE}${PASSKEY}${timestamp}`).toString('base64')

  try {
    const response = await fetch(`${BASE_URL}/mpesa/stkpush/v1/processrequest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        BusinessShortCode: BUSINESS_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(amount),
        PartyA: formattedPhone,
        PartyB: BUSINESS_SHORTCODE,
        PhoneNumber: formattedPhone,
        CallBackURL: CALLBACK_URL,
        AccountReference: invoiceId,
        TransactionDesc: 'Invoice Processing Fee',
      }),
    })

    if (!response.ok) {
      throw new Error(`STK Push failed: ${response.statusText}`)
    }

    const data = await response.json()
    console.log('[M-Pesa] STK Push initiated:', data)
    return data
  } catch (error) {
    console.error('[M-Pesa] Error initiating STK push:', error)
    throw error
  }
}

export { BUSINESS_SHORTCODE, CALLBACK_URL }

