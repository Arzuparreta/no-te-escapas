import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(_request: NextRequest) {
  try {
    const settings = await prisma.appSettings.findMany({
      where: {
        key: {
          in: ['create_on_icloud', 'sync_mode'],
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

    return NextResponse.json({
      data: {
        createOnIcloud: settingsMap['create_on_icloud'] === 'true',
        syncMode: (settingsMap['sync_mode'] as 'merge' | 'replace') || 'merge',
      },
    })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { createOnIcloud, syncMode } = body

    const updates = []

    if (createOnIcloud !== undefined) {
      updates.push(
        prisma.appSettings.upsert({
          where: { key: 'create_on_icloud' },
          update: { value: String(createOnIcloud) },
          create: { key: 'create_on_icloud', value: String(createOnIcloud) },
        })
      )
    }

    if (syncMode !== undefined) {
      updates.push(
        prisma.appSettings.upsert({
          where: { key: 'sync_mode' },
          update: { value: syncMode },
          create: { key: 'sync_mode', value: syncMode },
        })
      )
    }

    await Promise.all(updates)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
