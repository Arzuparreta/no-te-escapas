export interface Contact {
  id: string
  name: string
  emails: string[]
  phones: string[]
  role?: string
  artistContext?: string
  source: ContactSource
  externalId?: string
  lastSyncedAt?: Date
  raw?: any
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export enum ContactSource {
  MANUAL = 'MANUAL',
  GOOGLE = 'GOOGLE',
  ICLOUD = 'ICLOUD',
  OUTLOOK = 'OUTLOOK',
}

export interface Call {
  id: string
  contactId: string
  contact: Contact
  direction: Direction
  startedAt: Date
  durationSeconds?: number
  reason?: string
  conclusion?: string
  sentiment?: string
  rawTranscript?: string
  enrichedAt?: Date
  createdAt: Date
}

export enum Direction {
  INBOUND = 'INBOUND',
  OUTBOUND = 'OUTBOUND',
}

export interface FollowUp {
  id: string
  contactId: string
  contact: Contact
  callId?: string
  call?: Call
  scheduledAt: Date
  completed: boolean
  completedAt?: Date
  notes?: string
  createdAt: Date
}

export interface MailThread {
  id: string
  contactId?: string
  contact?: Contact
  gmailThreadId: string
  subject: string
  snippet?: string
  lastMessageAt: Date
  messageCount: number
  labelIds: string[]
  needsReply: boolean
  createdAt: Date
  updatedAt: Date
}

export interface User {
  id: string
  email: string
  name?: string
  image?: string
}

// API Response types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface CreateContactInput {
  name: string
  emails: string[]
  phones: string[]
  role?: string
  artistContext?: string
  notes?: string
}

export interface UpdateContactInput extends Partial<CreateContactInput> {
  id: string
}

export interface CreateCallInput {
  contactId: string
  direction: Direction
  startedAt: Date
  durationSeconds?: number
  reason?: string
  conclusion?: string
  createFollowUp?: boolean
  followUpDate?: Date
  followUpNotes?: string
}

export interface CreateFollowUpInput {
  contactId: string
  callId?: string
  scheduledAt: Date
  notes?: string
}
