import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Log the callback for debugging
    console.log('[M-Pesa Callback] Received:', JSON.stringify(body, null, 2))

    // Handle different callback structures
    let result = body.result || body.Result || {}
    const resultCode = result.ResultCode ?? result.result_code ?? '1'
    const resultDesc = result.ResultDesc ?? result.result_desc ?? 'Unknown'

    // Extract metadata
    const metadata = result.ResultParameters?.Result ?? result.metadata ?? []
    const metadataObj = Array.isArray(metadata)
      ? metadata.reduce((acc: any, item: any) => {
          acc[item.Key] = item.Value
          return acc
        }, {})
      : metadata

    const transactionId = metadataObj.TransactionId || metadataObj.transaction_id || ''
    const mpesaReceiptNumber = metadataObj.ReceiptNumber || metadataObj.receipt_number || ''
    const phoneNumber = metadataObj.PhoneNumber || metadataObj.phone_number || ''
    const amount = metadataObj.Amount || metadataObj.amount || 0

    const checkoutRequestId =
      body.CheckoutRequestID || body.checkout_request_id || result.CheckoutRequestID || ''

    // Store callback for auditing
    const { error: callbackError } = await supabaseServer.from('mpesa_callbacks').insert({
      transaction_id: transactionId,
      checkout_request_id: checkoutRequestId,
      result_code: resultCode,
      result_desc: resultDesc,
      amount,
      mpesa_receipt_number: mpesaReceiptNumber,
      phone_number: phoneNumber,
      response_body: body,
    })

    if (callbackError) {
      console.error('[API] Error logging callback:', callbackError)
    }

    // If payment was successful (ResultCode 0)
    if (resultCode === '0' || resultCode === 0) {
      // Find the payment transaction by checkout request ID
      const { data: transaction, error: fetchError } = await supabaseServer
        .from('payment_transactions')
        .select('id, invoice_id, user_id')
        .eq('checkout_request_id', checkoutRequestId)
        .single()

      if (fetchError || !transaction) {
        console.error('[API] Transaction not found:', checkoutRequestId)
        return NextResponse.json(
          { resultCode: '1', resultDesc: 'Transaction not found' },
          { status: 200 }
        )
      }

      // Update payment transaction as completed
      const { error: updateTransactionError } = await supabaseServer
        .from('payment_transactions')
        .update({
          status: 'completed',
          transaction_id: transactionId,
          mpesa_receipt_number: mpesaReceiptNumber,
          completed_at: new Date().toISOString(),
          response_code: resultCode.toString(),
          response_description: resultDesc,
        })
        .eq('id', transaction.id)

      if (updateTransactionError) {
        console.error('[API] Error updating transaction:', updateTransactionError)
      }

      // Update invoice as paid
      const { error: updateInvoiceError } = await supabaseServer
        .from('invoices')
        .update({
          status: 'paid',
          transaction_id: transactionId,
          mpesa_receipt_number: mpesaReceiptNumber,
          paid_at: new Date().toISOString(),
        })
        .eq('id', transaction.invoice_id)

      if (updateInvoiceError) {
        console.error('[API] Error updating invoice:', updateInvoiceError)
      }

      console.log('[M-Pesa Callback] Payment successful:', {
        transactionId,
        invoiceId: transaction.invoice_id,
        mpesaReceiptNumber,
      })
    } else {
      // Payment failed
      const { data: transaction, error: fetchError } = await supabaseServer
        .from('payment_transactions')
        .select('id, invoice_id')
        .eq('checkout_request_id', checkoutRequestId)
        .single()

      if (transaction && !fetchError) {
        // Update transaction as failed
        const { error: updateError } = await supabaseServer
          .from('payment_transactions')
          .update({
            status: 'failed',
            response_code: resultCode.toString(),
            response_description: resultDesc,
            error_message: resultDesc,
          })
          .eq('id', transaction.id)

        if (updateError) {
          console.error('[API] Error updating failed transaction:', updateError)
        }

        // Update invoice status
        const { error: invoiceError } = await supabaseServer
          .from('invoices')
          .update({ status: 'failed' })
          .eq('id', transaction.invoice_id)

        if (invoiceError) {
          console.error('[API] Error updating invoice:', invoiceError)
        }
      }

      console.log('[M-Pesa Callback] Payment failed:', { resultCode, resultDesc })
    }

    // Return success to M-Pesa (they need a 200 response)
    return NextResponse.json(
      { resultCode: '0', resultDesc: 'Callback received successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('[API] Callback processing error:', error)
    return NextResponse.json(
      { resultCode: '1', resultDesc: 'Internal server error' },
      { status: 200 } // Still return 200 so M-Pesa doesn't retry
    )
  }
}
