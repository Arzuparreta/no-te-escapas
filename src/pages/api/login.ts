import { NextApiRequest, NextApiResponse } from 'next'
import { compare } from 'bcrypt'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Missing credentials' })
    }

    // Hardcoded credentials
    const userEmail = 'rubenpenarubio02@gmail.com'
    const passwordHash = '$2b$12$E3it5tyPhMJo5oDnlAcyzefExJ7Qf5b1G1RSdw5TZjL5I7EFiDVRG'

    if (email.trim() !== userEmail) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const isValid = await compare(password, passwordHash)
    
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    return res.status(200).json({ 
      success: true, 
      user: { email, name: 'Music Manager' } 
    })
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({ error: 'Server error' })
  }
}
