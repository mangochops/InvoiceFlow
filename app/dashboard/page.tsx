'use client'

import { useSupabaseAuth } from '@/lib/supabase-auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Header from '@/components/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, TrendingUp, Clock, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface InvoiceData {
  id: string
  email: string
  phone: string
  amount: number
  status: string
  created_at: string
}

export default function DashboardPage() {
  const { user } = useSupabaseAuth()
  const router = useRouter()
  const [invoices, setInvoices] = useState<InvoiceData[]>([])
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    const fetchInvoices = async () => {
      try {
        if (!supabase) {
          console.log('[v0] Supabase not initialized')
          setLoading(false)
          return
        }

        const { data, error } = await supabase
          .from('invoices')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('[v0] Error fetching invoices:', error)
          return
        }

        const typedData = (data || []) as InvoiceData[]
        setInvoices(typedData)

        // Calculate stats
        const completed = typedData.filter(inv => inv.status === 'completed').length
        const pending = typedData.filter(inv => inv.status === 'pending').length

        setStats({
          total: typedData.length,
          completed,
          pending
        })
      } catch (error) {
        console.error('[v0] Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchInvoices()
  }, [user, router])

  if (!user) {
    return null
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-background">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Welcome back, {user.email?.split('@')[0]}!</h1>
          <p className="text-muted-foreground mt-2">Here&apos;s your invoice processing summary</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Invoices</p>
                <p className="text-3xl font-bold text-foreground mt-2">{stats.total}</p>
              </div>
              <FileText className="h-10 w-10 text-primary/20" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-3xl font-bold text-foreground mt-2">{stats.completed}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-primary/20" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-3xl font-bold text-foreground mt-2">{stats.pending}</p>
              </div>
              <Clock className="h-10 w-10 text-primary/20" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-3xl font-bold text-foreground mt-2">
                  {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                </p>
              </div>
              <TrendingUp className="h-10 w-10 text-primary/20" />
            </div>
          </Card>
        </div>

        <Card className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground">Recent Invoices</h2>
            <Button className="bg-primary hover:bg-primary/90" asChild>
              <Link href="/start-invoicing">New Invoice</Link>
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : invoices.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">No invoices yet. Start by creating your first invoice.</p>
              <Button className="mt-4 bg-primary hover:bg-primary/90" asChild>
                <Link href="/start-invoicing">Create Invoice</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between py-4 border-b border-border last:border-0">
                  <div>
                    <p className="font-medium text-foreground">Invoice #{invoice.id.slice(0, 8)}</p>
                    <p className="text-sm text-muted-foreground">{invoice.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground">KES {invoice.amount.toLocaleString()}</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      invoice.status === 'completed'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-yellow-500/10 text-yellow-600'
                    }`}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </main>
  )
}
