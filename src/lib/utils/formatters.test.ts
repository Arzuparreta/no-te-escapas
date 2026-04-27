import { describe, it, expect } from 'vitest'
import { formatDate, formatTimeAgo, formatPhoneNumber, truncate } from './formatters'

describe('formatDate', () => {
  it('should format date correctly', () => {
    const date = new Date('2024-01-15T10:30:00')
    expect(formatDate(date)).toBe('Jan 15, 2024 10:30 AM')
  })
})

describe('formatTimeAgo', () => {
  it('should return "just now" for recent dates', () => {
    const date = new Date()
    expect(formatTimeAgo(date)).toBe('just now')
  })

  it('should return minutes ago', () => {
    const date = new Date(Date.now() - 120000) // 2 minutes ago
    expect(formatTimeAgo(date)).toBe('2m ago')
  })

  it('should return hours ago', () => {
    const date = new Date(Date.now() - 7200000) // 2 hours ago
    expect(formatTimeAgo(date)).toBe('2h ago')
  })

  it('should return days ago', () => {
    const date = new Date(Date.now() - 172800000) // 2 days ago
    expect(formatTimeAgo(date)).toBe('2d ago')
  })
})

describe('formatPhoneNumber', () => {
  it('should format US phone number', () => {
    expect(formatPhoneNumber('5551234567')).toBe('(555) 123-4567')
  })

  it('should return original if not 10 digits', () => {
    expect(formatPhoneNumber('123')).toBe('123')
  })

  it('should handle undefined', () => {
    expect(formatPhoneNumber(undefined)).toBe('')
  })
})

describe('truncate', () => {
  it('should truncate long text', () => {
    expect(truncate('Hello World', 5)).toBe('Hello...')
  })

  it('should not truncate short text', () => {
    expect(truncate('Hello', 10)).toBe('Hello')
  })
})
