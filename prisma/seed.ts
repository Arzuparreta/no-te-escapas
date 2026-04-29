import { PrismaClient } from '@prisma/client'
import { hash } from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  // Only create default admin if NO users exist
  const userCount = await prisma.user.count()
  
  if (userCount === 0) {
    const passwordHash = await hash('password', 12)
    
    await prisma.user.create({
      data: {
        email: 'admin@email.com',
        name: 'Admin',
        passwordHash: passwordHash,
        role: 'admin',
      },
    })
    
    console.log('✅ Default admin user created: admin@email.com / password')
  } else {
    console.log(`ℹ️  Users already exist (${userCount} users), skipping seed`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
