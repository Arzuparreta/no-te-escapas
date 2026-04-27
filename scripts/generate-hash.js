#!/usr/bin/env node
import bcrypt from 'bcrypt'

const password = process.argv[2]
if (!password) {
  console.log('Usage: node generate-hash.js <password>')
  console.log('Example: node generate-hash.js mypassword')
  process.exit(1)
}

const saltRounds = 10
const hash = await bcrypt.hash(password, saltRounds)
console.log('Bcrypt hash:', hash)
console.log('Add this to your .env file as APP_USER_PASSWORD_HASH=')
