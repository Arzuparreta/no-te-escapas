"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { SignInForm } from '@/components/auth/SignInForm'

export const dynamic = 'force-dynamic'

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <SignInForm />
    </Suspense>
  )
}
