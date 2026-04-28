"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ContactForm from '@/components/contacts/ContactForm'
import { createContact } from '@/lib/api/contacts'

export default function NewContactPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: {
    name: string
    emails: string[]
    phones: string[]
    role: string
    artistContext: string
    notes: string
  }) => {
    setIsLoading(true)
    try {
      const contact = await createContact(data)
      router.push(`/contacts/${contact.id}`)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to create contact')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <ContactForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  )
}
