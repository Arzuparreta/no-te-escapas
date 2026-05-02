"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { format } from 'date-fns'

interface ThreadRow {
  id: string
  subject: string
  snippet?: string
  lastMessageAt: string
  messageCount: number
  needsReply: boolean
}

export default function ContactEmailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [name, setName] = useState<string>('')
  const [threads, setThreads] = useState<ThreadRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        const res = await fetch(`/api/contacts/${params.id}?mailThreadsTake=500`)
        if (!res.ok) {
          setError('Contact not found')
          return
        }
        const data = await res.json()
        if (cancelled) return
        setName(data.data?.name ?? '')
        setThreads(data.data?.mailThreads ?? [])
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
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Mail className="h-7 w-7" />
          Email threads
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{name}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Threads</CardTitle>
        </CardHeader>
        <CardContent>
          {threads.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No email threads</p>
          ) : (
            <ul className="space-y-3">
              {threads.map((thread) => (
                <li
                  key={thread.id}
                  className="rounded-lg border p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h2 className="text-sm font-medium">{thread.subject}</h2>
                      {thread.snippet && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {thread.snippet}
                        </p>
                      )}
                    </div>
                    {thread.needsReply && (
                      <Badge variant="destructive" className="text-xs shrink-0">
                        Needs reply
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                    <span>{thread.messageCount} messages</span>
                    <span>{format(new Date(thread.lastMessageAt), 'MMM d, yyyy h:mm a')}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
