import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { prismaErrorResponse } from '@/lib/api-errors'
import { z } from 'zod'

const updateFollowUpSchema = z
  .object({
    completed: z.boolean().optional(),
    scheduledAt: z.union([z.string().datetime(), z.coerce.date()]).optional(),
    notes: z.string().optional(),
  })
  .refine(
    (data) =>
      data.completed !== undefined ||
      data.scheduledAt !== undefined ||
      data.notes !== undefined,
    { message: 'At least one field is required', path: ['root'] }
  )

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validated = updateFollowUpSchema.parse(body)

    const data: {
      completed?: boolean
      completedAt?: Date | null
      scheduledAt?: Date
      notes?: string
    } = {}

    if (validated.notes !== undefined) {
      data.notes = validated.notes
    }
    if (validated.scheduledAt !== undefined) {
      const d =
        validated.scheduledAt instanceof Date
          ? validated.scheduledAt
          : new Date(validated.scheduledAt)
      if (Number.isNaN(d.getTime())) {
        return NextResponse.json(
          { error: 'Invalid scheduledAt' },
          { status: 400 }
        )
      }
      data.scheduledAt = d
    }
    if (validated.completed !== undefined) {
      data.completed = validated.completed
      data.completedAt = validated.completed ? new Date() : null
    }

    const followUp = await prisma.followUp.update({
      where: { id: params.id },
      data,
      include: {
        contact: true,
        call: true,
      },
    })

    return NextResponse.json({ data: followUp })
  } catch (error) {
    console.error('Error updating follow-up:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      )
    }
    const pr = prismaErrorResponse(error)
    if (pr) return pr
    return NextResponse.json(
      { error: 'Failed to update follow-up' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.followUp.delete({
      where: { id: params.id },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting follow-up:', error)
    const pr = prismaErrorResponse(error)
    if (pr) return pr
    return NextResponse.json(
      { error: 'Failed to delete follow-up' },
      { status: 500 }
    )
  }
}
