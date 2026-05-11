import { NextRequest, NextResponse } from 'next/server'
import { initiateStkPush } from '@/lib/mpesa'
import { supabaseServer } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phoneNumber, amount, invoiceId, userId } = body

    if (!phoneNumber || !amount || !invoiceId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: phoneNumber, amount, invoiceId, userId' },
        { status: 400 }
      )
    }

    // Validate phone number format
    let formattedPhone = phoneNumber.toString().replace(/\D/g, '')
    if (!formattedPhone.startsWith('254')) {
      formattedPhone = formattedPhone.replace(/^0/, '254')
      if (!formattedPhone.startsWith('254')) {
        formattedPhone = `254${formattedPhone}`
      }
    }

    // Create payment transaction record
    const { data: transaction, error: transactionError } = await supabaseServer
      .from('payment_transactions')
      .insert({
        invoice_id: invoiceId,
        user_id: userId,
        amount,
        phone_number: formattedPhone,
        status: 'pending',
      })
      .select()
      .single()

    if (transactionError) {
      console.error('[API] Error creating transaction record:', transactionError)
      return NextResponse.json(
        { error: 'Failed to create transaction record' },
        { status: 500 }
      )
    }

    // Initiate M-Pesa STK push
    const stkResponse = await initiateStkPush(formattedPhone, amount, invoiceId)

    // Update transaction with checkout request ID
    if (stkResponse.CheckoutRequestID) {
      const { error: updateError } = await supabaseServer
        .from('payment_transactions')
        .update({
          checkout_request_id: stkResponse.CheckoutRequestID,
          response_code: stkResponse.ResponseCode,
          response_description: stkResponse.ResponseDescription,
        })
        .eq('id', transaction.id)

      if (updateError) {
        console.error('[API] Error updating transaction:', updateError)
      }
    }

    // Update invoice status to processing
    const { error: invoiceError } = await supabaseServer
      .from('invoices')
      .update({ status: 'processing' })
      .eq('id', invoiceId)

    if (invoiceError) {
      console.error('[API] Error updating invoice:', invoiceError)
    }

    return NextResponse.json(
      {
        success: true,
        checkoutRequestId: stkResponse.CheckoutRequestID,
        message: stkResponse.CustomerMessage,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[API] STK Push error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to initiate payment' },
      { status: 500 }
    )
  }
}
