export interface ContactFormData {
  name: string
  emails: string[]
  phones: string[]
  role: string
  artistContext: string
  notes: string
}

export interface Contact {
  id: string
  name: string
  emails: string[]
  phones: string[]
  role?: string
  artistContext?: string
  notes?: string
  source: 'MANUAL' | 'GOOGLE' | 'ICLOUD' | 'OUTLOOK'
  externalId?: string
  lastSyncedAt?: string
  calls: any[]
  mailThreads: any[]
  followUps: any[]
}

export async function getContact(id: string): Promise<Contact> {
  const response = await fetch(`/api/contacts/${id}`)
  if (!response.ok) {
    throw new Error('Failed to fetch contact')
  }
  const data = await response.json()
  return data.data
}

export async function createContact(
  data: ContactFormData
): Promise<Contact> {
  const response = await fetch('/api/contacts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create contact')
  }

  const result = await response.json()
  return result.data
}

export async function updateContact(
  id: string,
  data: Partial<ContactFormData>
): Promise<Contact> {
  const response = await fetch(`/api/contacts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update contact')
  }

  const result = await response.json()
  return result.data
}

export async function deleteContact(id: string): Promise<void> {
  const response = await fetch(`/api/contacts/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to delete contact')
  }
}
