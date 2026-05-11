'use client'

import { CheckCircle, Lock, Zap } from 'lucide-react'

const features = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Process invoices in under 24 hours with our streamlined workflow'
  },
  {
    icon: Lock,
    title: 'Bank-Level Security',
    description: 'Your financial data is encrypted and protected at all times'
  },
  {
    icon: CheckCircle,
    title: 'Real-Time Tracking',
    description: 'Track every step of your invoice journey in your dashboard'
  }
]

export default function Features() {
  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-secondary/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">Why Choose InvoiceFlow</h2>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            Experience the future of invoice processing with our secure and transparent platform
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, i) => {
            const Icon = feature.icon
            return (
              <div key={i} className="p-8 rounded-lg border border-border bg-background hover:border-primary/50 transition-colors">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-foreground/60">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
