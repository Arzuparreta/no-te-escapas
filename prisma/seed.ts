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
