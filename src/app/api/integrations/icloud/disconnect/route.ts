import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(_request: NextRequest) {
  try {
    // Remove iCloud connection settings
    await prisma.appSettings.deleteMany({
      where: {
        key: {
          in: ['icloud_username', 'icloud_connected'],
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error disconnecting iCloud:', error)
    return NextResponse.json(
      { error: 'Failed to disconnect iCloud' },
      { status: 500 }
    )
  }
}
