'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export interface Invoice {
  id: string
  email: string
  phone: string
  amount: number
  status: 'pending' | 'processing' | 'completed'
  createdAt: string
  transactionId?: string
  receiptUrl?: string
}

interface InvoiceContextType {
  invoices: Invoice[]
  createInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt'>) => Invoice
  updateInvoice: (id: string, updates: Partial<Invoice>) => void
  getInvoice: (id: string) => Invoice | undefined
}

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined)

export function InvoiceProvider({ children }: { children: React.ReactNode }) {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('invoices')
    if (saved) {
      try {
        setInvoices(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to load invoices:', e)
      }
    }
  }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('invoices', JSON.stringify(invoices))
    }
  }, [invoices, mounted])

  const createInvoice = (invoice: Omit<Invoice, 'id' | 'createdAt'>): Invoice => {
    const newInvoice: Invoice = {
      ...invoice,
      id: `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    }
    setInvoices([...invoices, newInvoice])
    return newInvoice
  }

  const updateInvoice = (id: string, updates: Partial<Invoice>) => {
    setInvoices(invoices.map(inv => inv.id === id ? { ...inv, ...updates } : inv))
  }

  const getInvoice = (id: string) => invoices.find(inv => inv.id === id)

  return (
    <InvoiceContext.Provider value={{ invoices, createInvoice, updateInvoice, getInvoice }}>
      {children}
    </InvoiceContext.Provider>
  )
}

export function useInvoices() {
  const context = useContext(InvoiceContext)
  if (!context) {
    throw new Error('useInvoices must be used within InvoiceProvider')
  }
  return context
}
