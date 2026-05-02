import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { prismaErrorResponse } from '@/lib/api-errors'
import { z } from 'zod'

const emptyToUndefined = (v: unknown) => (v === '' ? undefined : v)

const createFollowUpSchema = z.object({
  contactId: z.string().cuid(),
  callId: z.preprocess(emptyToUndefined, z.string().cuid().optional()),
  scheduledAt: z.coerce.date().refine((d) => !Number.isNaN(d.getTime()), {
    message: 'Invalid scheduledAt',
  }),
  notes: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const contactId = searchParams.get('contactId')
    const completed = searchParams.get('completed')

    let where: Record<string, unknown> = {}
    if (contactId) {
      where = { ...where, contactId }
    }
    if (completed !== null && completed !== '') {
      where = { ...where, completed: completed === 'true' }
    }

    const followUps = await prisma.followUp.findMany({
      where,
      orderBy: { scheduledAt: 'asc' },
      include: {
        contact: true,
        call: true,
      },
    })

    return NextResponse.json({ data: followUps })
  } catch (error) {
    console.error('Error fetching follow-ups:', error)
    return NextResponse.json(
      { error: 'Failed to fetch follow-ups' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createFollowUpSchema.parse(body)

    const contact = await prisma.contact.findUnique({
      where: { id: validatedData.contactId },
    })
    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 400 })
    }

    if (validatedData.callId) {
      const call = await prisma.call.findUnique({
        where: { id: validatedData.callId },
      })
      if (!call) {
        return NextResponse.json({ error: 'Call not found' }, { status: 400 })
      }
      if (call.contactId !== validatedData.contactId) {
        return NextResponse.json(
          { error: 'Call does not belong to this contact' },
          { status: 400 }
        )
      }
      const existing = await prisma.followUp.findUnique({
        where: { callId: validatedData.callId },
      })
      if (existing) {
        return NextResponse.json(
          { error: 'A follow-up is already linked to this call' },
          { status: 409 }
        )
      }
    }

    const followUp = await prisma.followUp.create({
      data: {
        contactId: validatedData.contactId,
        callId: validatedData.callId,
        scheduledAt: validatedData.scheduledAt,
        notes: validatedData.notes,
      },
      include: {
        contact: true,
        call: true,
      },
    })

    return NextResponse.json({ data: followUp }, { status: 201 })
  } catch (error) {
    console.error('Error creating follow-up:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      )
    }
    const pr = prismaErrorResponse(error)
    if (pr) return pr
    return NextResponse.json(
      { error: 'Failed to create follow-up' },
      { status: 500 }
    )
  }
}
