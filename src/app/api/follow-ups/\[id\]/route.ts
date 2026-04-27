import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const updateFollowUpSchema = z.object({
  scheduledAt: z.string().datetime().optional(),
  notes: z.string().optional(),
  completed: z.boolean().optional(),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validatedData = updateFollowUpSchema.parse(body)

    const followUp = await prisma.followUp.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        scheduledAt: validatedData.scheduledAt
          ? new Date(validatedData.scheduledAt)
          : undefined,
        updatedAt: new Date(),
      },
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
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update follow-up' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.followUp.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Follow-up deleted' })
  } catch (error) {
    console.error('Error deleting follow-up:', error)
    return NextResponse.json(
      { error: 'Failed to delete follow-up' },
      { status: 500 }
    )
  }
}
