import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, appPassword } = body

    if (!username || !appPassword) {
      return NextResponse.json(
        { error: 'Username and app password are required' },
        { status: 400 }
      )
    }

    // TODO: Implement actual CardDAV connection test
    // For now, just store the connection info (encrypted in production)
    await prisma.appSettings.upsert({
      where: { key: 'icloud_username' },
      update: { value: username },
      create: { key: 'icloud_username', value: username },
    })

    await prisma.appSettings.upsert({
      where: { key: 'icloud_connected' },
      update: { value: 'true' },
      create: { key: 'icloud_connected', value: 'true' },
    })

    // Check if there are local contacts that need merging
    const localContactsCount = await prisma.contact.count({
      where: { source: 'MANUAL' },
    })

    return NextResponse.json({
      success: true,
      localContactsCount,
      message:
        localContactsCount > 0
          ? 'Connected. You have local contacts that can be merged.'
          : 'Connected successfully.',
    })
  } catch (error) {
    console.error('Error connecting iCloud:', error)
    return NextResponse.json(
      { error: 'Failed to connect to iCloud' },
      { status: 500 }
    )
  }
}
