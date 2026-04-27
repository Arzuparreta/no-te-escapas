import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const createCallSchema = z.object({
  contactId: z.string().cuid(),
  direction: z.enum(['INBOUND', 'OUTBOUND']),
  startedAt: z.string().datetime(),
  durationSeconds: z.number().optional(),
  reason: z.string().optional(),
  conclusion: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const contactId = searchParams.get('contactId')

    let where = {}
    if (contactId) {
      where = { contactId }
    }

    const calls = await prisma.call.findMany({
      where,
      orderBy: { startedAt: 'desc' },
      include: {
        contact: true,
      },
    })

    return NextResponse.json({ data: calls })
  } catch (error) {
    console.error('Error fetching calls:', error)
    return NextResponse.json(
      { error: 'Failed to fetch calls' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createCallSchema.parse(body)

    const call = await prisma.call.create({
      data: {
        ...validatedData,
        startedAt: new Date(validatedData.startedAt),
      },
      include: {
        contact: true,
      },
    })

    // Create follow-up if requested
    if (body.createFollowUp && body.followUpDate) {
      await prisma.followUp.create({
        data: {
          contactId: validatedData.contactId,
          callId: call.id,
          scheduledAt: new Date(body.followUpDate),
          notes: body.followUpNotes || '',
        },
      })
    }

    return NextResponse.json({ data: call }, { status: 201 })
  } catch (error) {
    console.error('Error creating call:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create call' },
      { status: 500 }
    )
  }
}