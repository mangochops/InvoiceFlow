'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { CheckCircle2, Phone, AlertCircle } from 'lucide-react'

interface MpesaPaymentModalProps {
  amount: number
  onSuccess: (transactionId: string) => void
  isOpen: boolean
  invoiceId: string
  phoneNumber: string
  userId: string
}

export default function MpesaPaymentModal({
  amount,
  onSuccess,
  isOpen,
  invoiceId,
  phoneNumber,
  userId,
}: MpesaPaymentModalProps) {
  const [step, setStep] = useState<'prompt' | 'processing' | 'success' | 'error'>('prompt')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [transactionId, setTransactionId] = useState('')
  const [checkoutRequestId, setCheckoutRequestId] = useState('')

  if (!isOpen) return null

  const handlePaymentInitiate = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/mpesa/stkpush', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber,
          amount,
          invoiceId,
          userId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to initiate payment')
        setStep('error')
        setLoading(false)
        return
      }

      setCheckoutRequestId(data.checkoutRequestId)
      setStep('processing')

      // Start polling for transaction completion
      pollTransactionStatus(data.checkoutRequestId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment initiation failed')
      setStep('error')
      setLoading(false)
    }
  }

  const pollTransactionStatus = (checkoutId: string) => {
    let pollCount = 0
    const maxPolls = 60 // Poll for up to 5 minutes

    const poll = async () => {
      try {
        const response = await fetch('/api/mpesa/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            checkoutRequestId: checkoutId,
            invoiceId,
          }),
        })

        const data = await response.json()

        // Check if payment was successful (ResultCode 0)
        if (data.ResultCode === '0' || data.ResultCode === 0) {
          setTransactionId(data.MpesaReceiptNumber || data.transaction_id || checkoutId)
          setStep('success')
          setLoading(false)
          return
        }

        // Check if payment failed
        if (data.ResultCode && data.ResultCode !== '0' && pollCount > 5) {
          setError(data.ResultDesc || 'Payment was declined')
          setStep('error')
          setLoading(false)
          return
        }

        pollCount++
        if (pollCount < maxPolls) {
          // Poll again in 5 seconds
          setTimeout(poll, 5000)
        } else {
          setError('Payment request timed out. Please check your phone.')
          setStep('error')
          setLoading(false)
        }
      } catch (err) {
        console.error('Poll error:', err)
        if (pollCount < maxPolls) {
          setTimeout(poll, 5000)
        } else {
          setError('Failed to check payment status')
          setStep('error')
          setLoading(false)
        }
      }
    }

    poll()
  }

  const handleSuccess = () => {
    onSuccess(transactionId)
    setStep('prompt')
    setError('')
    setTransactionId('')
    setCheckoutRequestId('')
  }

  const handleClose = () => {
    setStep('prompt')
    setError('')
    setTransactionId('')
    setCheckoutRequestId('')
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        {step === 'prompt' && (
          <div className="p-6">
            <div className="mb-6 text-center">
              <Phone className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">M-Pesa Payment</h3>
              <p className="text-sm text-foreground/60">You will receive an M-Pesa prompt on your phone</p>
            </div>

            <div className="bg-secondary/50 rounded-lg p-4 mb-4">
              <p className="text-sm text-foreground/60 mb-1">Phone Number</p>
              <p className="text-lg font-semibold text-foreground">{phoneNumber}</p>
            </div>

            <div className="bg-secondary/50 rounded-lg p-4 mb-6">
              <p className="text-sm text-foreground/60 mb-1">Amount</p>
              <p className="text-3xl font-bold text-foreground">KES {amount.toLocaleString()}</p>
            </div>

            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
              <p className="text-sm text-foreground">
                A prompt will appear on your phone. Enter your M-Pesa PIN to complete the payment.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handlePaymentInitiate}
                disabled={loading}
                className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold"
              >
                {loading ? 'Initiating...' : 'Send Payment Prompt'}
              </Button>
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="p-6 text-center">
            <div className="mb-6">
              <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Waiting for Payment</h3>
            <p className="text-sm text-foreground/60 mb-4">
              A payment prompt has been sent to {phoneNumber}
            </p>
            <p className="text-xs text-foreground/50">
              This may take up to 5 minutes. Please enter your M-Pesa PIN on your phone.
            </p>
          </div>
        )}

        {step === 'success' && (
          <div className="p-6">
            <div className="text-center mb-6">
              <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">Payment Successful</h3>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-4">
              <p className="text-xs text-foreground/60 mb-1">Transaction ID</p>
              <p className="text-sm font-mono font-semibold text-foreground break-all">{transactionId}</p>
            </div>

            <div className="bg-secondary/50 rounded-lg p-4 mb-6">
              <p className="text-sm text-foreground/60 mb-1">Amount Paid</p>
              <p className="text-2xl font-bold text-foreground">KES {amount.toLocaleString()}</p>
            </div>

            <Button
              onClick={handleSuccess}
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold"
            >
              Continue to Next Step
            </Button>
          </div>
        )}

        {step === 'error' && (
          <div className="p-6">
            <div className="text-center mb-6">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">Payment Failed</h3>
            </div>

            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
              <p className="text-sm text-destructive">{error}</p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  setStep('prompt')
                  setError('')
                }}
                className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold"
              >
                Try Again
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

