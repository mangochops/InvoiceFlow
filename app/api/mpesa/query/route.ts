import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { checkoutRequestId, invoiceId } = body

    if (!checkoutRequestId || !invoiceId) {
      return NextResponse.json(
        { error: 'Missing checkoutRequestId or invoiceId' },
        { status: 400 }
      )
    }

    // Query the payment transaction from database
    const { data: transaction, error } = await supabaseServer
      .from('payment_transactions')
      .select('*')
      .eq('checkout_request_id', checkoutRequestId)
      .eq('invoice_id', invoiceId)
      .single()

    if (error) {
      console.error('[API] Error querying transaction:', error)
      return NextResponse.json(
        { error: 'Transaction not found', ResultCode: '1' },
        { status: 200 }
      )
    }

    // If transaction is completed, return success
    if (transaction.status === 'completed') {
      return NextResponse.json(
        {
          ResultCode: '0',
          ResultDesc: 'Payment successful',
          MpesaReceiptNumber: transaction.mpesa_receipt_number,
          transaction_id: transaction.transaction_id,
        },
        { status: 200 }
      )
    }

    // If transaction failed, return error
    if (transaction.status === 'failed') {
      return NextResponse.json(
        {
          ResultCode: '1',
          ResultDesc: transaction.error_message || 'Payment was declined',
        },
        { status: 200 }
      )
    }

    // If still pending, return pending status
    return NextResponse.json(
      {
        ResultCode: '2',
        ResultDesc: 'Payment pending',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[API] Query error:', error)
    return NextResponse.json(
      { error: 'Internal server error', ResultCode: '1' },
      { status: 200 }
    )
  }
}
