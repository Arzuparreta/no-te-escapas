import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/follow-ups/route'
import { PUT, DELETE } from '@/app/api/follow-ups/[id]/route'
import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'

vi.mock('@/lib/db', () => ({
  prisma: {
    contact: { findUnique: vi.fn() },
    call: { findUnique: vi.fn() },
    followUp: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
  },
}))

const CONTACT_ID = 'cjld2cjxh0000qzrmn831i7rn'
const CALL_ID = 'cjld2cjxh0000qzrmn831i7ro'
const FU_ID = 'cjld2cjxh0000qzrmn831i7rp'

const prismaMock = prisma as unknown as {
  contact: { findUnique: ReturnType<typeof vi.fn> }
  call: { findUnique: ReturnType<typeof vi.fn> }
  followUp: {
    findUnique: ReturnType<typeof vi.fn>
    create: ReturnType<typeof vi.fn>
    update: ReturnType<typeof vi.fn>
    delete: ReturnType<typeof vi.fn>
  }
}

describe('POST /api/follow-ups', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates follow-up without callId', async () => {
    prismaMock.contact.findUnique.mockResolvedValue({ id: CONTACT_ID, name: 'Pat' })
    prismaMock.followUp.create.mockResolvedValue({
      id: FU_ID,
      contactId: CONTACT_ID,
      callId: null,
      scheduledAt: new Date('2026-06-01T12:00:00.000Z'),
      notes: null,
      completed: false,
      contact: { id: CONTACT_ID, name: 'Pat' },
      call: null,
    })

    const req = new NextRequest('http://localhost/api/follow-ups', {
      method: 'POST',
      body: JSON.stringify({
        contactId: CONTACT_ID,
        scheduledAt: '2026-06-01T12:00:00.000Z',
      }),
    })
    const res = await POST(req)
    expect(res.status).toBe(201)
    expect(prismaMock.followUp.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          contactId: CONTACT_ID,
          callId: undefined,
        }),
      })
    )
  })

  it('returns 400 when contact does not exist', async () => {
    prismaMock.contact.findUnique.mockResolvedValue(null)

    const req = new NextRequest('http://localhost/api/follow-ups', {
      method: 'POST',
      body: JSON.stringify({
        contactId: CONTACT_ID,
        scheduledAt: '2026-06-01T12:00:00.000Z',
      }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/contact/i)
  })

  it('returns 409 when call already has a follow-up', async () => {
    prismaMock.contact.findUnique.mockResolvedValue({ id: CONTACT_ID, name: 'Pat' })
    prismaMock.call.findUnique.mockResolvedValue({
      id: CALL_ID,
      contactId: CONTACT_ID,
    })
    prismaMock.followUp.findUnique.mockResolvedValue({ id: FU_ID, callId: CALL_ID })

    const req = new NextRequest('http://localhost/api/follow-ups', {
      method: 'POST',
      body: JSON.stringify({
        contactId: CONTACT_ID,
        callId: CALL_ID,
        scheduledAt: '2026-06-01T12:00:00.000Z',
      }),
    })
    const res = await POST(req)
    expect(res.status).toBe(409)
  })

  it('treats empty string callId as absent', async () => {
    prismaMock.contact.findUnique.mockResolvedValue({ id: CONTACT_ID, name: 'Pat' })
    prismaMock.followUp.create.mockResolvedValue({
      id: FU_ID,
      contactId: CONTACT_ID,
      callId: null,
      scheduledAt: new Date(),
      contact: {},
      call: null,
    })

    const req = new NextRequest('http://localhost/api/follow-ups', {
      method: 'POST',
      body: JSON.stringify({
        contactId: CONTACT_ID,
        callId: '',
        scheduledAt: '2026-06-01T12:00:00.000Z',
      }),
    })
    const res = await POST(req)
    expect(res.status).toBe(201)
    expect(prismaMock.call.findUnique).not.toHaveBeenCalled()
  })
})

describe('PUT /api/follow-ups/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 400 when no fields to update', async () => {
    const req = new NextRequest('http://localhost/api/follow-ups/x', {
      method: 'PUT',
      body: JSON.stringify({}),
    })
    const res = await PUT(req, { params: { id: FU_ID } })
    expect(res.status).toBe(400)
  })

  it('returns 404 when record missing', async () => {
    const err = new Prisma.PrismaClientKnownRequestError('Not found', {
      code: 'P2025',
      clientVersion: 'test',
    })
    prismaMock.followUp.update.mockRejectedValue(err)

    const req = new NextRequest('http://localhost/api/follow-ups/x', {
      method: 'PUT',
      body: JSON.stringify({ completed: true }),
    })
    const res = await PUT(req, { params: { id: 'nonexistentcuididididididid' } })
    expect(res.status).toBe(404)
  })
})

describe('DELETE /api/follow-ups/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 404 when record missing', async () => {
    const err = new Prisma.PrismaClientKnownRequestError('Not found', {
      code: 'P2025',
      clientVersion: 'test',
    })
    prismaMock.followUp.delete.mockRejectedValue(err)

    const req = new NextRequest('http://localhost/api/follow-ups/x', {
      method: 'DELETE',
    })
    const res = await DELETE(req, { params: { id: FU_ID } })
    expect(res.status).toBe(404)
  })
})
