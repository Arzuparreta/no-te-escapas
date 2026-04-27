import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from 'next/link'
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Music Manager CRM",
  description: "Communications CRM for music industry managers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          {/* Top Navigation */}
          <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center gap-8">
                  <Link href="/" className="text-xl font-bold text-gray-900">
                    Music Manager CRM
                  </Link>
                  <div className="hidden sm:flex items-center gap-6">
                    <Link href="/" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                      Today
                    </Link>
                    <Link href="/contacts" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                      Contacts
                    </Link>
                    <Link href="/follow-ups" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                      Follow-ups
                    </Link>
                    <Link href="/calls/new" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                      Log Call
                    </Link>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    href="/auth/signin"
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Sign Out
                  </Link>
                </div>
              </div>
            </div>
          </nav>

          {/* Mobile Navigation */}
          <div className="sm:hidden bg-white border-b border-gray-200">
            <div className="flex justify-around py-2">
              <Link href="/" className="text-xs text-gray-600 hover:text-gray-900 px-2 py-1">
                Today
              </Link>
              <Link href="/contacts" className="text-xs text-gray-600 hover:text-gray-900 px-2 py-1">
                Contacts
              </Link>
              <Link href="/follow-ups" className="text-xs text-gray-600 hover:text-gray-900 px-2 py-1">
                Follow-ups
              </Link>
              <Link href="/calls/new" className="text-xs text-gray-600 hover:text-gray-900 px-2 py-1">
                Call
              </Link>
            </div>
          </div>

          {/* Main Content */}
          <main className="relative">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
