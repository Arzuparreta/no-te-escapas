"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CalendarPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { format } from 'date-fns'

interface CallDetail {
  id: string
  contactId: string
  direction: 'INBOUND' | 'OUTBOUND'
  startedAt: string
  durationSeconds?: number
  reason?: string
  conclusion?: string
  sentiment?: string
  contact: { id: string; name: string }
}

export default function CallDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [call, setCall] = useState<CallDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        const res = await fetch(`/api/calls/${params.id}`)
        if (!res.ok) {
          setError(res.status === 404 ? 'Call not found' : 'Failed to load call')
          return
        }
        const data = await res.json()
        if (cancelled) return
        setCall(data.data)
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
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  if (error || !call) {
    return (
      <div className="p-6 lg:p-8">
        <p className="text-sm text-destructive">{error ?? 'Not found'}</p>
        <Button variant="link" className="mt-2 px-0" onClick={() => router.push('/contacts')}>
          Back to contacts
        </Button>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <Button variant="ghost" size="sm" className="mb-2" asChild>
        <Link href={`/contacts/${call.contactId}`}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {call.contact.name}
        </Link>
      </Button>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Call</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {format(new Date(call.startedAt), 'EEEE, MMM d, yyyy h:mm a')}
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link
            href={`/follow-ups/new?contactId=${call.contactId}&callId=${call.id}`}
          >
            <CalendarPlus className="h-4 w-4 mr-2" />
            Schedule follow-up
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
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
            {call.durationSeconds != null && (
              <span className="text-xs text-muted-foreground">
                {call.durationSeconds}s
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {call.reason && (
            <div>
              <CardTitle className="text-xs font-medium text-muted-foreground mb-1">
                Topic
              </CardTitle>
              <p className="text-sm">{call.reason}</p>
            </div>
          )}
          {call.conclusion && (
            <div>
              <CardTitle className="text-xs font-medium text-muted-foreground mb-1">
                Outcome
              </CardTitle>
              <p className="text-sm text-muted-foreground">{call.conclusion}</p>
            </div>
          )}
          {call.sentiment && (
            <Badge variant="secondary" className="text-xs">
              {call.sentiment}
            </Badge>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
