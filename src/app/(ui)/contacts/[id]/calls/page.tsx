"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { format } from 'date-fns'

interface CallRow {
  id: string
  direction: 'INBOUND' | 'OUTBOUND'
  startedAt: string
  durationSeconds?: number
  reason?: string
  conclusion?: string
}

export default function ContactCallsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [name, setName] = useState<string>('')
  const [calls, setCalls] = useState<CallRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        const [cRes, callsRes] = await Promise.all([
          fetch(`/api/contacts/${params.id}`),
          fetch(`/api/calls?contactId=${params.id}`),
        ])
        if (!cRes.ok) {
          setError('Contact not found')
          return
        }
        if (!callsRes.ok) {
          setError('Failed to load calls')
          return
        }
        const cData = await cRes.json()
        const callsData = await callsRes.json()
        if (cancelled) return
        setName(cData.data?.name ?? '')
        setCalls(callsData.data ?? [])
      } catch {
        if (!cancelled) setError('Failed to load')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 lg:p-8">
        <p className="text-sm text-destructive">{error}</p>
        <Button variant="link" className="mt-2 px-0" onClick={() => router.push('/contacts')}>
          Back to contacts
        </Button>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <Button variant="ghost" size="sm" className="mb-2" asChild>
        <Link href={`/contacts/${params.id}`}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to {name || 'contact'}
        </Link>
      </Button>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calls</h1>
          <p className="text-sm text-muted-foreground mt-1">{name}</p>
        </div>
        <Button asChild size="sm">
          <Link href={`/calls/new?contactId=${params.id}`}>
            <Phone className="h-4 w-4 mr-2" />
            Log call
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All calls</CardTitle>
        </CardHeader>
        <CardContent>
          {calls.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No calls logged</p>
          ) : (
            <ul className="space-y-3">
              {calls.map((call) => (
                <li key={call.id}>
                  <Link
                    href={`/calls/${call.id}`}
                    className="block rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge
                        variant="outline"
                        className={
                          call.direction === 'INBOUND'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }
                      >
                        {call.direction === 'INBOUND' ? 'Inbound' : 'Outbound'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(call.startedAt), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                    {call.reason && <p className="text-sm font-medium">{call.reason}</p>}
                    {call.conclusion && (
                      <p className="text-xs text-muted-foreground mt-1">{call.conclusion}</p>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
