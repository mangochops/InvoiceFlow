'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export default function Hero() {
  return (
    <section className="pt-20 pb-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-block px-4 py-2 rounded-full bg-secondary border border-border mb-6">
          <span className="text-xs font-semibold text-primary">B2B INVOICE PROCESSING • SECURE & TRACKED</span>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
          Invoice Processing,{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
            Simplified
          </span>
        </h1>

        <p className="text-xl text-foreground/70 mb-8 max-w-2xl mx-auto leading-relaxed">
          Register, pay, confirm — your invoice is processed and funds disbursed. Every single step tracked in real time.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-semibold">
            Start Your Invoice
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
          <Button size="lg" variant="outline" className="font-semibold border-border">
            See How It Works
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-8 pt-8 border-t border-border">
          <div>
            <div className="text-3xl font-bold text-primary mb-1">8</div>
            <p className="text-sm text-foreground/60">Steps. Fully Tracked.</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary mb-1">&lt;24h</div>
            <p className="text-sm text-foreground/60">Processing Time</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary mb-1">100%</div>
            <p className="text-sm text-foreground/60">Transparent</p>
          </div>
        </div>
      </div>
    </section>
  )
}
