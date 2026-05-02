import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { prismaErrorResponse } from '@/lib/api-errors'
import { z } from 'zod'

const createCallSchema = z
  .object({
    contactId: z.string().cuid(),
    direction: z.enum(['INBOUND', 'OUTBOUND']),
    startedAt: z.coerce.date().refine((d) => !Number.isNaN(d.getTime()), {
      message: 'Invalid startedAt',
    }),
    durationSeconds: z.number().optional(),
    reason: z.string().optional(),
    conclusion: z.string().optional(),
    createFollowUp: z.boolean().optional(),
    followUpDate: z.preprocess((v) => {
      if (v === '' || v == null) return undefined
      return v
    }, z.coerce.date().optional()),
    followUpNotes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.createFollowUp) {
      if (
        !data.followUpDate ||
        Number.isNaN(data.followUpDate.getTime())
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'followUpDate is required and must be valid when scheduling a follow-up',
          path: ['followUpDate'],
        })
      }
    }
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

    const contact = await prisma.contact.findUnique({
      where: { id: validatedData.contactId },
    })
    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 400 })
    }

    const { createFollowUp, followUpDate, followUpNotes, ...callFields } =
      validatedData

    const call = await prisma.call.create({
      data: {
        contactId: callFields.contactId,
        direction: callFields.direction,
        startedAt: callFields.startedAt,
        durationSeconds: callFields.durationSeconds,
        reason: callFields.reason,
        conclusion: callFields.conclusion,
      },
      include: {
        contact: true,
      },
    })

    if (createFollowUp && followUpDate) {
      const existing = await prisma.followUp.findUnique({
        where: { callId: call.id },
      })
      if (existing) {
        return NextResponse.json(
          { error: 'A follow-up is already linked to this call' },
          { status: 409 }
        )
      }
      await prisma.followUp.create({
        data: {
          contactId: validatedData.contactId,
          callId: call.id,
          scheduledAt: followUpDate,
          notes: followUpNotes ?? '',
        },
      })
    }

    return NextResponse.json({ data: call }, { status: 201 })
  } catch (error) {
    console.error('Error creating call:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      )
    }
    const pr = prismaErrorResponse(error)
    if (pr) return pr
    return NextResponse.json({ error: 'Failed to create call' }, { status: 500 })
  }
}
