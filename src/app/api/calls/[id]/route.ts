import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { prismaErrorResponse } from '@/lib/api-errors'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const call = await prisma.call.findUnique({
      where: { id: params.id },
      include: { contact: true },
    })
    if (!call) {
      return NextResponse.json({ error: 'Call not found' }, { status: 404 })
    }
    return NextResponse.json({ data: call })
  } catch (error) {
    console.error('Error fetching call:', error)
    const pr = prismaErrorResponse(error)
    if (pr) return pr
    return NextResponse.json({ error: 'Failed to fetch call' }, { status: 500 })
  }
}
