'use client'

const steps = [
  {
    number: '01',
    icon: '👤',
    title: 'Register Details',
    description: 'Enter your email, phone, and upload a screenshot of your account balance.'
  },
  {
    number: '02',
    icon: '💳',
    title: 'Make Payment',
    description: 'Pay the processing fee via M-Pesa to paybill 247247, account 1440184518696.'
  },
  {
    number: '03',
    icon: '📋',
    title: 'Submit Confirmation',
    description: 'Upload your M-Pesa transaction ID and confirmation screenshot.'
  },
  {
    number: '04',
    icon: '⚡',
    title: 'Invoice Initiated',
    description: 'Payment confirmed — your invoice is created and assigned immediately.'
  },
  {
    number: '05',
    icon: '📱',
    title: 'Funds Disbursed',
    description: 'GBP 1,300 is processed and disbursed to your M-Pesa number.'
  },
  {
    number: '06',
    icon: '📨',
    title: 'M-Pesa Confirmation',
    description: 'You receive confirmation of the GBP 1,300 credit on your M-Pesa.'
  },
  {
    number: '07',
    icon: '📤',
    title: 'Upload Receipt',
    description: 'Upload your M-Pesa receipt screenshot to finalise the process.'
  },
  {
    number: '08',
    icon: '✅',
    title: 'Fully Tracked',
    description: 'Every step categorised, detailed, and live in your dashboard.'
  }
]

export default function HowItWorks() {
  return (
    <section id="how" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">Eight steps.</h2>
          <p className="text-xl text-foreground/60">Zero confusion.</p>
          <p className="text-foreground/50 mt-4 max-w-2xl mx-auto">
            Every invoice follows a clear, structured, tracked journey — from registration to disbursement.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div key={i} className="group">
              <div className="p-6 rounded-lg border border-border bg-background hover:border-primary/50 transition-all hover:shadow-lg">
                <div className="text-4xl font-bold text-primary/20 group-hover:text-primary/40 transition-colors mb-2">
                  {step.number}
                </div>
                <div className="text-3xl mb-3">{step.icon}</div>
                <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-foreground/60 leading-relaxed">{step.description}</p>
              </div>
              {i < steps.length - 1 && i % 4 !== 3 && (
                <div className="hidden lg:block absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-primary/20" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
