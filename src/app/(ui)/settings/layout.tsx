"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Users, Settings, Cloud, Contact } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (!pathname) return false
    if (path === '/settings') {
      return pathname === '/settings'
    }
    return pathname.startsWith(path)
  }

  const tabs = [
    {
      href: '/settings',
      label: 'General',
      icon: Settings,
    },
    {
      href: '/settings/users',
      label: 'Users',
      icon: Users,
    },
    {
      href: '/settings/integrations',
      label: 'Integrations',
      icon: Cloud,
    },
    {
      href: '/settings/contacts',
      label: 'Contacts',
      icon: Contact,
    },
  ]

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your account and application settings
        </p>
      </div>

      <div className="border-b mb-6">
        <nav className="flex gap-6">
          {tabs.map((tab) => {
            const active = isActive(tab.href)
            const Icon = tab.icon
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  'flex items-center gap-2 pb-3 px-1 border-b-2 font-medium text-sm transition-colors',
                  active
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </Link>
            )
          })}
        </nav>
      </div>

      {children}
    </div>
  )
}
