import React from 'react'
import { render, screen } from '@testing-library/react'
import HomePage from './(ui)/page'

describe('HomePage', () => {
  it('renders the page title', () => {
    render(<HomePage />)
    expect(screen.getByText('Music Manager CRM')).toBeInTheDocument()
  })

  it('renders quick stats cards', () => {
    render(<HomePage />)
    expect(screen.getByText('Total Contacts')).toBeInTheDocument()
    expect(screen.getByText("Today's Follow-ups")).toBeInTheDocument()
    expect(screen.getByText('Recent Calls')).toBeInTheDocument()
    expect(screen.getByText('Pending Emails')).toBeInTheDocument()
  })

  it('renders action buttons', () => {
    render(<HomePage />)
    expect(screen.getByText('Add New Contact')).toBeInTheDocument()
    expect(screen.getByText('Log a Call')).toBeInTheDocument()
    expect(screen.getByText('View All Contacts')).toBeInTheDocument()
  })
})