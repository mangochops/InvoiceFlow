'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { CheckCircle2, Phone } from 'lucide-react'

interface MpesaPaymentModalProps {
  amount: number
  onSuccess: (transactionId: string) => void
  isOpen: boolean
}

export default function MpesaPaymentModal({ amount, onSuccess, isOpen }: MpesaPaymentModalProps) {
  const [step, setStep] = useState<'prompt' | 'pin' | 'processing' | 'success'>('prompt')
  const [pin, setPin] = useState('')
  const [transactionId, setTransactionId] = useState('')

  if (!isOpen) return null

  const handlePaymentInitiate = () => {
    setStep('pin')
  }

  const handlePinSubmit = () => {
    if (pin.length === 4) {
      setStep('processing')
      // Simulate payment processing
      setTimeout(() => {
        const mockTransactionId = `${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`
        setTransactionId(mockTransactionId)
        setStep('success')
      }, 2000)
    }
  }

  const handleSuccess = () => {
    onSuccess(transactionId)
    setStep('prompt')
    setPin('')
    setTransactionId('')
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

            <div className="bg-secondary/50 rounded-lg p-4 mb-6">
              <p className="text-sm text-foreground/60 mb-1">Amount</p>
              <p className="text-3xl font-bold text-foreground">KES {amount.toLocaleString()}</p>
            </div>

            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
              <p className="text-sm text-foreground">
                A prompt will appear on your phone. Enter your M-Pesa PIN to complete the payment.
              </p>
            </div>

            <Button
              onClick={handlePaymentInitiate}
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold"
            >
              Enter M-Pesa PIN
            </Button>
          </div>
        )}

        {step === 'pin' && (
          <div className="p-6">
            <h3 className="text-xl font-bold text-foreground mb-6">Enter Your M-Pesa PIN</h3>

            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">4-Digit PIN</label>
              <input
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className="w-full px-4 py-3 text-2xl tracking-widest text-center border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              />
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Never share your PIN with anyone. M-Pesa will never ask for it except on your phone.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setStep('prompt')
                  setPin('')
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePinSubmit}
                disabled={pin.length !== 4}
                className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Payment
              </Button>
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="p-6 text-center">
            <div className="mb-6">
              <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Processing Payment</h3>
            <p className="text-sm text-foreground/60">Your payment is being processed. Please wait...</p>
          </div>
        )}

        {step === 'success' && (
          <div className="p-6">
            <div className="text-center mb-6">
              <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">Payment Successful</h3>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
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
      </Card>
    </div>
  )
}
