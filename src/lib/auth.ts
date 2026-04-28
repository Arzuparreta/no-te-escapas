import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare } from 'bcrypt'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log('AUTHORIZE CALLED:', credentials?.email)
        
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const email = credentials.email.trim()
        const password = credentials.password.trim()

        // Check credentials against environment variables
        const userEmail = process.env.APP_USER_EMAIL
        const userPasswordHash = process.env.APP_USER_PASSWORD_HASH

        if (email !== userEmail) {
          console.log('Email mismatch:', email, '!==', userEmail)
          return null
        }

        if (!userPasswordHash) {
          console.error('APP_USER_PASSWORD_HASH not set in environment')
          return null
        }

        try {
          const isValid = await compare(password, userPasswordHash)
          console.log('Password valid:', isValid)

          if (isValid) {
            return {
              id: '1',
              email: email,
              name: 'Music Manager',
            }
          }
        } catch (error) {
          console.error('Auth compare error:', error)
        }

        return null
      }
    })
  ],
  session: { strategy: 'jwt' as const },
  secret: process.env.NEXTAUTH_SECRET || 'test-secret',
  pages: { signIn: '/auth/signin' },
  debug: true,
}
