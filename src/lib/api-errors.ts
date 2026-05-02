import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'

export function prismaErrorResponse(error: unknown): NextResponse | null {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A follow-up is already linked to this call' },
        { status: 409 }
      )
    }
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Invalid reference (contact or call does not exist)' },
        { status: 400 }
      )
    }
  }
  return null
}
