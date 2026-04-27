import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const updateContactSchema = z.object({
  name: z.string().min(1).optional(),
  emails: z.array(z.string().email()).optional(),
  phones: z.array(z.string()).optional(),
  role: z.string().optional(),
  artistContext: z.string().optional(),
  notes: z.string().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contact = await prisma.contact.findUnique({
      where: { id: params.id },
      include: {
        calls: {
          orderBy: { startedAt: 'desc' },
        },
        mailThreads: {
          orderBy: { lastMessageAt: 'desc' },
        },
        followUps: {
          where: { completed: false },
          orderBy: { scheduledAt: 'asc' },
        },
      },
    })

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
    }

    return NextResponse.json({ data: contact })
  } catch (error) {
    console.error('Error fetching contact:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contact' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validatedData = updateContactSchema.parse(body)

    const contact = await prisma.contact.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        emails: validatedData.emails || [],
        phones: validatedData.phones || [],
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({ data: contact })
  } catch (error) {
    console.error('Error updating contact:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update contact' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.contact.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Contact deleted' })
  } catch (error) {
    console.error('Error deleting contact:', error)
    return NextResponse.json(
      { error: 'Failed to delete contact' },
      { status: 500 }
    )
  }
}
