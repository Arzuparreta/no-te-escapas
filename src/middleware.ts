import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(req) {
    // The withAuth middleware handles authentication
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|auth/signin).*)',
  ],
}
