import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCardDAVService } from '@/lib/services/carddav'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body // 'merge' or 'replace'

    if (!['merge', 'replace'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Use "merge" or "replace".' },
        { status: 400 }
      )
    }

    const carddav = await getCardDAVService()
    if (!carddav) {
      return NextResponse.json(
        { error: 'iCloud not connected' },
        { status: 400 }
      )
    }

    if (action === 'replace') {
      // Delete all local contacts that are from MANUAL source
      const deleteResult = await prisma.contact.deleteMany({
        where: { source: 'MANUAL' },
      })

      // Fetch iCloud contacts and import them
      const icloudContacts = await carddav.fetchContacts()

      for (const contact of icloudContacts) {
        await prisma.contact.create({
          data: {
            name: contact.name,
            emails: contact.emails,
            phones: contact.phones,
            source: 'ICLOUD',
            externalId: contact.externalId,
            lastSyncedAt: new Date(),
            raw: contact.raw,
          },
        })
      }

      return NextResponse.json({
        success: true,
        message: `Replaced local contacts. Imported ${icloudContacts.length} contacts from iCloud.`,
        deleted: deleteResult.count,
        imported: icloudContacts.length,
      })
    } else {
      // Merge: Create local contacts on iCloud
      const localContacts = await prisma.contact.findMany({
        where: { source: 'MANUAL' },
      })

      let created = 0
      for (const contact of localContacts) {
        try {
          const externalId = await carddav.createContact({
            name: contact.name,
            emails: contact.emails,
            phones: contact.phones,
          })

          // Update the contact to mark it as synced
          await prisma.contact.update({
            where: { id: contact.id },
            data: {
              source: 'ICLOUD',
              externalId,
              lastSyncedAt: new Date(),
            },
          })
          created++
        } catch (err) {
          console.error(`Failed to sync contact ${contact.id}:`, err)
        }
      }

      // Also fetch any new iCloud contacts
      const icloudContacts = await carddav.fetchContacts()
      const existingExternalIds = new Set(
        (
          await prisma.contact.findMany({
            where: { source: 'ICLOUD' },
            select: { externalId: true },
          })
        ).map((c) => c.externalId)
      )

      let imported = 0
      for (const contact of icloudContacts) {
        if (!existingExternalIds.has(contact.externalId)) {
          await prisma.contact.create({
            data: {
              name: contact.name,
              emails: contact.emails,
              phones: contact.phones,
              source: 'ICLOUD',
              externalId: contact.externalId,
              lastSyncedAt: new Date(),
              raw: contact.raw,
            },
          })
          imported++
        }
      }

      return NextResponse.json({
        success: true,
        message: `Merge completed. Created ${created} contacts on iCloud, imported ${imported} from iCloud.`,
        created,
        imported,
      })
    }
  } catch (error) {
    console.error('Error syncing contacts:', error)
    return NextResponse.json(
      { error: 'Failed to sync contacts' },
      { status: 500 }
    )
  }
}
