// M-Pesa Daraja API Integration

const DARAJA_BASE_URL = 'https://sandbox.safaricom.co.ke' // Use production URL in production
const BUSINESS_SHORTCODE = process.env.MPESA_BUSINESS_SHORTCODE || '174379'
const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY || ''
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET || ''
const PASSKEY = process.env.MPESA_PASSKEY || ''
const CALLBACK_URL = process.env.MPESA_CALLBACK_URL || 'https://invoiceflow.com/api/mpesa/callback'

interface AccessTokenResponse {
  access_token: string
  expires_in: number
}

interface STKPushResponse {
  MerchantRequestID: string
  CheckoutRequestID: string
  ResponseCode: string
  ResponseDescription: string
  CustomerMessage: string
}

interface STKPushPayload {
  BusinessShortCode: string
  Password: string
  Timestamp: string
  TransactionType: string
  Amount: number
  PartyA: string
  PartyB: string
  PhoneNumber: string
  CallBackURL: string
  AccountReference: string
  TransactionDesc: string
}

// Get access token
async function getAccessToken(): Promise<string> {
  try {
    const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64')
    
    const response = await fetch(
      `${DARAJA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
      {
        method: 'GET',
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to get access token: ${response.statusText}`)
    }

    const data = (await response.json()) as AccessTokenResponse
    return data.access_token
  } catch (error) {
    console.error('[M-Pesa] Error getting access token:', error)
    throw error
  }
}

// Generate password for STK push
function generatePassword(timestamp: string): string {
  const data = `${BUSINESS_SHORTCODE}${PASSKEY}${timestamp}`
  return Buffer.from(data).toString('base64')
}

// Initiate STK push (prompt user to enter PIN on phone)
export async function initiateStkPush(
  phoneNumber: string,
  amount: number,
  invoiceId: string
): Promise<STKPushResponse> {
  try {
    const accessToken = await getAccessToken()
    const timestamp = new Date().toISOString().replace(/[:-]/g, '').split('.')[0]
    const password = generatePassword(timestamp)

    // Format phone number: ensure it starts with 254 for Kenya
    let formattedPhone = phoneNumber.replace(/^0/, '254')
    if (!formattedPhone.startsWith('254')) {
      formattedPhone = `254${phoneNumber}`
    }

    const payload: STKPushPayload = {
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
    }

    const response = await fetch(`${DARAJA_BASE_URL}/mpesa/stkpush/v1/processrequest`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`STK Push failed: ${response.statusText}`)
    }

    const data = (await response.json()) as STKPushResponse
    console.log('[M-Pesa] STK Push initiated:', data)
    return data
  } catch (error) {
    console.error('[M-Pesa] Error initiating STK push:', error)
    throw error
  }
}

// Query STK push status
export async function queryStkPushStatus(checkoutRequestId: string): Promise<any> {
  try {
    const accessToken = await getAccessToken()
    const timestamp = new Date().toISOString().replace(/[:-]/g, '').split('.')[0]
    const password = generatePassword(timestamp)

    const payload = {
      BusinessShortCode: BUSINESS_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId,
    }

    const response = await fetch(
      `${DARAJA_BASE_URL}/mpesa/stkpushquery/v1/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    )

    if (!response.ok) {
      throw new Error(`Query failed: ${response.statusText}`)
    }

    const data = await response.json()
    console.log('[M-Pesa] STK Push query result:', data)
    return data
  } catch (error) {
    console.error('[M-Pesa] Error querying STK status:', error)
    throw error
  }
}

export { BUSINESS_SHORTCODE, CALLBACK_URL }
