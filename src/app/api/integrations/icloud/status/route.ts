import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(_request: NextRequest) {
  try {
    const settings = await prisma.appSettings.findMany({
      where: {
        key: {
          in: ['icloud_connected', 'icloud_username'],
        },
      },
    })

    const settingsMap = settings.reduce(
      (acc, s) => {
        acc[s.key] = s.value
        return acc
      },
      {} as Record<string, string>
    )

    const connected = settingsMap['icloud_connected'] === 'true'

    return NextResponse.json({
      data: {
        connected,
        username: connected ? settingsMap['icloud_username'] : undefined,
      },
    })
  } catch (error) {
    console.error('Error fetching iCloud status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch iCloud status' },
      { status: 500 }
    )
  }
}
