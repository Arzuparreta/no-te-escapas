import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare } from 'bcrypt'
import { prisma } from './db'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Trim credentials to avoid whitespace issues
        const email = credentials.email.trim()
        const password = credentials.password.trim()

        // For MVP: Check credentials against hardcoded values from env
        // In production, you would use a proper User model
        const userEmail = process.env.APP_USER_EMAIL
        const userPasswordHash = process.env.APP_USER_PASSWORD_HASH

        if (email !== userEmail) {
          return null
        }

        try {
          const isValid = await compare(password, userPasswordHash || '')
          console.log('Auth debug - Email match:', email === userEmail)
          console.log('Auth debug - Password valid:', isValid)
          console.log('Auth debug - Hash exists:', !!userPasswordHash)

          if (!isValid) {
            return null
          }
        } catch (error) {
          console.error('Auth debug - Compare error:', error)
          return null
        }

        return {
          id: '1',
          email: credentials.email,
          name: 'Music Manager',
        }
      }
    })
  ],
  session: {
    strategy: 'jwt' as const,
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/auth/signin',
  },
}
