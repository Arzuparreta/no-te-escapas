# Database-Backed Authentication Migration Plan

## Overview
Migrate from environment variable-based authentication to database-backed authentication using the existing Prisma User model with `passwordHash` and `role` fields. Supports multiple users with admin/user roles, where admin can manage all users through a settings UI.

**Default Admin Credentials (created via seed):**
- Email: `admin@email.com`
- Password: `password`

---

## Phase 1: Database Schema Changes

### File: `prisma/schema.prisma`

1. **Update User model** (around lines 130-138):

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  passwordHash  String?    // NEW: bcrypt hash for credentials auth
  role          String    @default("user")  // NEW: "admin" or "user"
  accounts      Account[]
  sessions      Session[]
}
```

2. **Remove Credentials model** (lines 148-152) - delete entirely:

```prisma
// REMOVE THIS:
model Credentials {
  id       String @id @default(cuid())
  email    String @unique
  password String
}
```

3. **Run migration**:

```bash
npm run db:migrate
# Creates migration to add fields and drop Credentials table
```

---

## Phase 2: Seed Script for Default Admin User

### File: `prisma/seed.ts` (create new)

```typescript
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await hash('password', 12)
  
  await prisma.user.upsert({
    where: { email: 'admin@email.com' },
    update: {},
    create: {
      email: 'admin@email.com',
      name: 'Admin',
      passwordHash: passwordHash,
      role: 'admin',
    },
  })
  
  console.log('✅ Default admin user created: admin@email.com / password')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

### Update `package.json`:

Add seed configuration inside the root object:

```json
{
  "name": "music-manager-crm",
  "version": "0.1.0",
  "private": true,
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  },
  "scripts": {
    // ... existing scripts
  }
  // ... rest of package.json
}
```

**Note:** You may need to install `tsx` if not already available:
```bash
npm install -D tsx
```

**Run seed**:
```bash
npx prisma db seed
```

---

## Phase 3: Update Auth Configuration

### File: `src/lib/auth.ts` (rewrite completely)

```typescript
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare } from 'bcrypt'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/db'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
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

        const email = credentials.email.trim()
        const password = credentials.password.trim()

        // Find user in database
        const user = await prisma.user.findUnique({
          where: { email }
        })

        if (!user || !user.passwordHash) {
          return null
        }

        const isValid = await compare(password, user.passwordHash)

        if (isValid) {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          }
        }

        return null
      }
    })
  ],
  session: { strategy: 'jwt' as const },
  secret: process.env.NEXTAUTH_SECRET || 'test-secret',
  pages: { signIn: '/auth/signin' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id
        (session.user as any).role = token.role
      }
      return session
    },
  },
}
```

---

## Phase 4: Create User Management API Routes

### File: `src/app/api/users/route.ts` (create)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { hash } from 'bcrypt'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        emailVerified: true,
        image: true,
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json({ data: users })
  } catch (error) {
    console.error('Failed to fetch users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { email, name, password, role } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    const passwordHash = await hash(password, 12)
    
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: role || 'user',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      }
    })
    
    return NextResponse.json({ data: user }, { status: 201 })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
    }
    console.error('Failed to create user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

### File: `src/app/api/users/[id]/route.ts` (create)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { hash } from 'bcrypt'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        emailVerified: true,
        image: true,
      }
    })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    return NextResponse.json({ data: user })
  } catch (error) {
    console.error('Failed to fetch user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, email, password, role } = body

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (email !== undefined) updateData.email = email
    if (role !== undefined) updateData.role = role
    if (password) {
      updateData.passwordHash = await hash(password, 12)
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      }
    })
    
    return NextResponse.json({ data: user })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
    }
    console.error('Failed to update user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Prevent self-deletion
  if ((session.user as any).id === params.id) {
    return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
  }

  try {
    await prisma.user.delete({
      where: { id: params.id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

---

## Phase 5: Create Settings/Users UI

### File: `src/app/(ui)/settings/users/page.tsx` (create)

```tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import UsersClient from '@/components/settings/UsersClient'

export default async function SettingsUsersPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || (session.user as any).role !== 'admin') {
    redirect('/')
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
      </div>
      <UsersClient initialUsers={users} />
    </div>
  )
}
```

### File: `src/components/settings/UsersClient.tsx` (create)

```tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { UsersTable } from './UsersTable'
import { UserForm } from './UserForm'
import { User } from '@prisma/client'

interface UsersClientProps {
  initialUsers: User[]
}

export default function UsersClient({ initialUsers }: UsersClientProps) {
  const [users, setUsers] = useState(initialUsers)
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const handleCreate = () => {
    setEditingUser(null)
    setShowForm(true)
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingUser(null)
  }

  const handleSuccess = () => {
    setShowForm(false)
    setEditingUser(null)
    // Refresh the page to get updated data
    window.location.reload()
  }

  return (
    <div>
      <div className="mb-4">
        <Button onClick={handleCreate}>Add User</Button>
      </div>
      
      <UsersTable users={users} onEdit={handleEdit} />
      
      {showForm && (
        <UserForm
          user={editingUser}
          onClose={handleCloseForm}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  )
}
```

### File: `src/components/settings/UsersTable.tsx` (create)

```tsx
'use client'

import { User } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface UsersTableProps {
  users: User[]
  onEdit: (user: User) => void
}

export function UsersTable({ users, onEdit }: UsersTableProps) {
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' })
      if (res.ok) {
        window.location.reload()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to delete user')
      }
    } catch (error) {
      alert('Failed to delete user')
    }
  }

  if (users.length === 0) {
    return <p className="text-gray-500 text-center py-8">No users yet.</p>
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Role
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {user.name || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {user.email}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                  {user.role}
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(user.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                <Button variant="ghost" size="sm" onClick={() => onEdit(user)}>
                  Edit
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleDelete(user.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

### File: `src/components/settings/UserForm.tsx` (create)

```tsx
'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { User } from '@prisma/client'

interface UserFormProps {
  user: User | null  // null = create, User = edit
  onClose: () => void
  onSuccess: () => void
}

export function UserForm({ user, onClose, onSuccess }: UserFormProps) {
  const [email, setEmail] = useState(user?.email || '')
  const [name, setName] = useState(user?.name || '')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState(user?.role || 'user')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isEdit = !!user

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const url = isEdit ? `/api/users/${user.id}` : '/api/users'
      const method = isEdit ? 'PUT' : 'POST'

      const body: any = {
        email,
        name,
        role,
      }

      if (!isEdit || password) {
        if (!isEdit && !password) {
          setError('Password is required for new users')
          setLoading(false)
          return
        }
        body.password = password
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        onSuccess()
      } else {
        const data = await res.json()
        setError(data.error || 'An error occurred')
      }
    } catch (err) {
      setError('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit User' : 'Create User'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-md p-3 text-sm">
              {error}
            </div>
          )}
          
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="password">
              Password {isEdit && '(leave blank to keep current)'}
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={!isEdit}
              placeholder={isEdit ? 'Enter new password' : ''}
            />
          </div>
          
          <div>
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (isEdit ? 'Update' : 'Create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

---

## Phase 6: Add Navigation Link

### Find and Edit Navigation Component

Locate the navigation/sidebar component (likely in `src/app/(ui)/layout.tsx` or a separate component) and add:

```tsx
// Inside the navigation, conditionally render for admin users
{session?.user?.role === 'admin' && (
  <Link href="/settings/users" className="...">
    <UsersIcon className="..." />
    User Management
  </Link>
)}
```

**Note:** You'll need to make the layout a client component or use a client wrapper component to access session data. Alternatively, use `getServerSession` in the server component layout.

---

## Phase 7: Cleanup Environment Variables

### File: `.env`

**Remove these lines:**
```
APP_USER_EMAIL=rubenpenarubio02@gmail.com
APP_USER_PASSWORD_HASH="$2b$12$2jkoaHFXSXrBcPyIeeFatube3f3FgbH8hu20M686u7jUM2YYiJZVi"
```

**Keep:**
```
NEXTAUTH_URL=http://100.91.167.48:3003
NEXTAUTH_SECRET=5f7b8e9c0a1d2e3f4g5h6i7j8k9l0m1n2o3p4q5r6s7t8u9v0w1x2y3z4a5b6c7d
```

---

## Phase 8: Update .env.example

### File: `.env.example`

Update documentation to reflect new setup:

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/music_manager_crm

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here

# Default admin user is created via seed script
# After running: npx prisma db seed
# Email: admin@email.com
# Password: password
# 
# Admin can then change password, rename user, or create additional users
# via the /settings/users page

# Google OAuth (for Gmail integration)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# iCloud
ICLOUD_USERNAME=your-icloud-email
ICLOUD_APP_PASSWORD=your-app-password

# Anthropic Claude API
ANTHROPIC_API_KEY=your-api-key-here

# OpenAI (for Whisper transcription)
OPENAI_API_KEY=your-openai-api-key-here
```

---

## Phase 9: Verification Steps

Follow these steps to verify the implementation:

1. **Run migration:**
   ```bash
   npm run db:migrate
   ```

2. **Run seed:**
   ```bash
   npx prisma db seed
   ```

3. **Start dev server:**
   ```bash
   npm run dev
   ```

4. **Sign in with default admin:**
   - Email: `admin@email.com`
   - Password: `password`

5. **Navigate to user management:**
   - Go to `/settings/users`

6. **Test user creation:**
   - Click "Add User"
   - Fill in email, name, password, role
   - Submit and verify user appears in list

7. **Test user edit:**
   - Click "Edit" on a user
   - Change role or reset password
   - Submit and verify changes

8. **Test user deletion:**
   - Click "Delete" on a user (not self)
   - Confirm deletion
   - Verify user removed from list

9. **Test admin can't delete self:**
   - Try to delete your own admin account
   - Should show error message

10. **Test non-admin access:**
    - Sign in with a regular user account
    - Try to access `/settings/users`
    - Should redirect to home page

11. **Run tests:**
    ```bash
    npm run test
    npm run lint
    ```

---

## Files Summary

| File | Action |
|------|--------|
| `prisma/schema.prisma` | Edit - update User model, remove Credentials model |
| `prisma/seed.ts` | Create - default admin user seed script |
| `package.json` | Edit - add `prisma.seed` configuration |
| `src/lib/auth.ts` | Rewrite - use PrismaAdapter, query database |
| `src/app/api/users/route.ts` | Create - list/create users API |
| `src/app/api/users/[id]/route.ts` | Create - update/delete user API |
| `src/app/(ui)/settings/users/page.tsx` | Create - admin UI page |
| `src/components/settings/UsersClient.tsx` | Create - client wrapper component |
| `src/components/settings/UsersTable.tsx` | Create - users table component |
| `src/components/settings/UserForm.tsx` | Create - user form dialog |
| Navigation component | Edit - add users link for admin |
| `.env` | Edit - remove APP_USER_* variables |
| `.env.example` | Edit - update documentation |

---

## Notes

- The `@auth/prisma-adapter` package is already installed (v2.11.2)
- The `bcrypt` package is already installed (v5.1.1)
- JWT strategy is maintained for session handling
- Only admin users can access user management features
- Password reset is only available through admin (edit user with new password)
- No email verification or password reset emails (as per requirements)
- The default admin user can be renamed/deleted after first login
