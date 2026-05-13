'use client'

import { useSupabaseAuth } from '@/lib/supabase-auth-context'
import { useInvoices } from '@/lib/invoice-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Header from '@/components/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CheckCircle2, ArrowRight, ArrowLeft, Upload } from 'lucide-react'

const steps = [
  {
    number: '01',
    title: 'Register Details',
    description: 'Enter your email, phone, and upload a screenshot of your account balance.',
    fields: ['email', 'phone']
  },
  {
    number: '02',
    title: 'Make Payment',
    description: 'Pay the processing fee via M-Pesa to paybill 542542, account 68709. Upload screenshot to confirm.',
    fields: ['paymentScreenshot']
  },
  {
    number: '03',
    title: 'Submit Confirmation',
    description: 'Upload your M-Pesa transaction ID and confirmation screenshot.',
    fields: ['transactionId', 'confirmationScreenshot']
  },
  {
    number: '04',
    title: 'Invoice Initiated',
    description: 'Payment confirmed — your invoice is created and assigned immediately.',
    fields: ['invoiceAmount']
  },
  {
    number: '05',
    title: 'Funds Disbursed',
    description: 'GBP 1,300 is processed and disbursed to your M-Pesa number.',
    fields: []
  },
  {
    number: '06',
    title: 'M-Pesa Confirmation',
    description: 'You receive confirmation of the GBP 1,300 credit on your M-Pesa.',
    fields: []
  },
  {
    number: '07',
    title: 'Upload Receipt',
    description: 'Upload your M-Pesa receipt screenshot to finalise the process.',
    fields: ['receiptScreenshot']
  },
  {
    number: '08',
    title: 'Fully Tracked',
    description: 'Every step categorised, detailed, and live in your dashboard.',
    fields: []
  }
]

export default function StartInvoicingPage() {
  const { user } = useSupabaseAuth()
  const { createInvoice, updateInvoice } = useInvoices()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [showMpesaModal, setShowMpesaModal] = useState(false)
  const [invoiceId, setInvoiceId] = useState<string>('')
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    paymentScreenshot: '',
    confirmationScreenshot: '',
    invoiceAmount: '',
    transactionId: '',
    receiptScreenshot: ''
  })

  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFileUpload = (field: string, file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      handleInputChange(field, e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleCompleteStep = () => {
    // Special handling for step 1 (Register Details) - create invoice
    if (currentStep === 0 && !invoiceId) {
      const newInvoice = createInvoice({
        email: formData.email,
        phone: formData.phone,
        amount: 2000,
        status: 'pending'
      })
      setInvoiceId(newInvoice.id)
    }

    // Mark step as complete
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep])
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const isStepComplete = (stepIndex: number) => completedSteps.includes(stepIndex)
  const isCurrentStepComplete = isStepComplete(currentStep)
  const allStepsComplete = completedSteps.length === steps.length

  if (!user) {
    return null
  }

  const step = steps[currentStep]

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-background">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-foreground">Start Invoicing</h1>
            <span className="text-lg font-semibold text-muted-foreground">
              {completedSteps.length} of {steps.length} complete
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((completedSteps.length + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step progress visualization */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
          {steps.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStep(idx)}
              disabled={!isStepComplete(idx) && idx !== currentStep}
              className={`p-3 rounded-lg border-2 transition-all ${idx === currentStep
                ? 'border-primary bg-primary/5'
                : isStepComplete(idx)
                  ? 'border-primary/50 bg-primary/10'
                  : 'border-border bg-background/50 opacity-50 cursor-not-allowed'
                }`}
            >
              <div className="flex items-center justify-center h-8">
                {isStepComplete(idx) ? (
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                ) : (
                  <span className="text-sm font-bold text-foreground">{s.number}</span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Main step card */}
        <Card className="p-8 mb-8">
          <div className="mb-8">
            <div className="inline-block mb-4">
              <span className="text-5xl font-bold text-primary/20">{step.number}</span>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">{step.title}</h2>
            <p className="text-foreground/60">{step.description}</p>
          </div>

          {/* Form fields for the current step */}
          <div className="space-y-6 mb-8">
            {step.number === '01' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Phone Number</label>
                  <Input
                    type="tel"
                    placeholder="+254712345678 or 0712345678"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  {/* <label className="block text-sm font-medium text-foreground mb-3">Account Balance Screenshot</label>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:bg-secondary/50 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleFileUpload('balanceScreenshot', file)
                      }}
                      className="hidden"
                      id="balance-upload"
                    />
                    <label htmlFor="balance-upload" className="cursor-pointer flex flex-col items-center gap-2">
                      {formData.balanceScreenshot ? (
                        <>
                          <CheckCircle2 className="w-8 h-8 text-primary" />
                          <p className="text-sm font-medium text-foreground">Screenshot uploaded</p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-foreground/40" />
                          <p className="text-sm text-foreground/60">Click to upload balance screenshot</p>
                        </>
                      )}
                    </label>
                  </div> */}
                </div>
              </>
            )}

            {step.number === '02' && (
              <div>
                <div className="bg-secondary/50 rounded-lg p-6 mb-6">
                  <p className="text-sm text-foreground/60 mb-4">Send payment to:</p>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-foreground/60 mb-1">Paybill Number</p>
                      <p className="text-2xl font-bold text-foreground font-mono">542542</p>
                    </div>
                    <div>
                      <p className="text-xs text-foreground/60 mb-1">Account Number</p>
                      <p className="text-2xl font-bold text-foreground font-mono">68709</p>
                    </div>
                    <div>
                      <p className="text-xs text-foreground/60 mb-1">Amount</p>
                      <p className="text-2xl font-bold text-primary">KES 2,535</p>
                    </div>
                  </div>
                </div>

                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
                  <p className="text-sm text-foreground">
                    Pay using M-Pesa. After payment, upload a screenshot of the confirmation to proceed.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">Upload Payment Screenshot</label>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:bg-secondary/50 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleFileUpload('paymentScreenshot', file)
                      }}
                      className="hidden"
                      id="payment-upload"
                    />
                    <label htmlFor="payment-upload" className="cursor-pointer flex flex-col items-center gap-2">
                      {formData.paymentScreenshot ? (
                        <>
                          <CheckCircle2 className="w-8 h-8 text-primary" />
                          <p className="text-sm font-medium text-foreground">Screenshot uploaded</p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-foreground/40" />
                          <p className="text-sm text-foreground/60">Click to upload payment screenshot</p>
                          <p className="text-xs text-foreground/40">or drag and drop</p>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </div>
            )}

            {step.number === '03' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">M-Pesa Transaction ID</label>
                  <Input
                    type="text"
                    placeholder="e.g., ABC123DEF456"
                    value={formData.transactionId}
                    onChange={(e) => handleInputChange('transactionId', e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Confirmation Screenshot</label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleInputChange('confirmationScreenshot', file.name)
                      }}
                      className="hidden"
                      id="confirmation-upload"
                    />
                    <label htmlFor="confirmation-upload" className="cursor-pointer">
                      <p className="text-sm text-foreground/60">
                        {formData.confirmationScreenshot || 'Click to upload confirmation'}
                      </p>
                    </label>
                  </div>
                </div>
              </>
            )}

            {step.number === '04' && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Invoice Amount</label>
                <Input
                  type="number"
                  placeholder="Amount in GBP"
                  value={formData.invoiceAmount}
                  onChange={(e) => handleInputChange('invoiceAmount', e.target.value)}
                  className="w-full"
                />
              </div>
            )}

            {(step.number === '05' || step.number === '06') && (
              <div className="p-6 bg-primary/5 border border-primary/20 rounded-lg text-center">
                <p className="text-foreground mb-2">Processing your request...</p>
                <div className="flex justify-center">
                  <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
              </div>
            )}

            {step.number === '07' && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">M-Pesa Receipt Screenshot</label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleInputChange('receiptScreenshot', file.name)
                    }}
                    className="hidden"
                    id="receipt-upload"
                  />
                  <label htmlFor="receipt-upload" className="cursor-pointer">
                    <p className="text-sm text-foreground/60">
                      {formData.receiptScreenshot || 'Click to upload receipt'}
                    </p>
                  </label>
                </div>
              </div>
            )}

            {step.number === '08' && (
              <div className="p-6 bg-primary/5 border border-primary/20 rounded-lg text-center">
                <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Invoice Processing Complete!</h3>
                <p className="text-foreground/60">All steps have been completed successfully. Your invoice is now fully tracked in your dashboard.</p>
              </div>
            )}
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={handlePreviousStep}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>

            <div className="flex-1" />

            {!allStepsComplete ? (
              <Button
                onClick={handleCompleteStep}
                className="bg-primary hover:bg-primary/90 flex items-center gap-2"
              >
                {currentStep === steps.length - 1 ? 'Finish' : 'Continue'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={() => router.push('/dashboard')}
                className="bg-primary hover:bg-primary/90 flex items-center gap-2"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </Card>
      </div>
    </main>
  )
}
