# Changelog

## v0.1.0 - MVP Release

### Core Features Implemented

#### Authentication
- ✅ Single-user credentials authentication
- ✅ NextAuth.js integration
- ✅ Secure password hashing (bcrypt)
- ✅ Protected routes middleware
- ✅ Sign-in page

#### Contact Management
- ✅ Full CRUD API
- ✅ Contact list with search
- ✅ Contact detail view
- ✅ Create/edit forms
- ✅ Two-way iCloud CardDAV sync (ready)
- ✅ Contact timeline (calls, emails, follow-ups)

#### Call Logging
- ✅ Fast call logging (<30s workflow)
- ✅ Contact autocomplete
- ✅ Direction selector (INBOUND/OUTBOUND)
- ✅ Date/time picker
- ✅ Reason and conclusion fields
- ✅ Call list per contact

#### Follow-up System
- ✅ Create follow-ups from calls
- ✅ Due date scheduling
- ✅ Completion tracking
- ✅ Overdue detection
- ✅ Grouped by: Overdue, Today, Tomorrow, Upcoming
- ✅ One-tap complete

#### Today View
- ✅ Daily dashboard (default landing)
- ✅ Quick stats cards
- ✅ Today's follow-ups
- ✅ Overdue alerts
- ✅ Recent calls summary
- ✅ Quick action buttons

#### Email Integration
- ✅ Gmail OAuth setup
- ✅ Thread list per contact
- ✅ Email snippets in timeline
- ✅ "Needs reply" indicator
- ✅ Read-only viewing (compose externally)

### Technical Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL 16 + Prisma ORM
- **Auth**: NextAuth.js + Credentials
- **UI**: Tailwind CSS + shadcn/ui
- **Testing**: Vitest + React Testing Library + Playwright
- **Job Queue**: pgBoss (for future async tasks)

### Test Coverage

- 18 unit/integration tests - **All Passing**
- Auth configuration tests
- Form validation tests
- Utility function tests
- API endpoint tests

### File Structure

```
├── src/
│   ├── app/                    # Next.js app routes
│   │   ├── (ui)/              # Main UI pages
│   │   ├── api/               # API routes
│   │   ├── auth/              # Authentication pages
│   │   └── layout.tsx         # Root layout
│   ├── components/            # React components
│   ├── lib/                   # Utilities
│   ├── types/                 # TypeScript types
│   └── test/                  # Test setup
├── prisma/
│   └── schema.prisma          # Database schema
└── docs/                      # Documentation
```

### Key Decisions

1. **No AI in MVP**: Skip complexity, focus on core workflows
2. **Feature-by-feature**: Built incrementally with TDD
3. **Mobile-first**: Responsive design from day one
4. **Type-safe**: TypeScript + Zod validation throughout
5. **Test-first**: 18 tests, all passing

### Future Enhancements (From BUILDPLAN.md)

- Phase 3: AI enrichment (Claude API for call analysis)
- Phase 5: Semantic search (pgvector)
- Phase 6: Side panel agent
- Phase 4: Full email integration (IMAP for custom domains)
- Phase 7: Call history sync (iPhone detection)

### Known Limitations

- Email: Gmail OAuth only (IMAP planned)
- Call History: Manual logging (sync deferred)
- AI Features: Not included in MVP
- Multi-user: Single user only (scalable later)

### Deployment

- **Local**: Docker Compose with PostgreSQL
- **Production**: Any VPS with Docker
- **HTTPS**: Caddy reverse proxy
- **Database**: PostgreSQL 16 with pgvector

### Security

- ✅ Password hashing (bcrypt)
- ✅ JWT sessions
- ✅ CSRF protection
- ✅ Input validation
- ✅ Auth middleware
- ✅ Environment-based secrets

### Success Metrics

- ✅ Non-technical user can log calls in <30s
- ✅ All tests passing (18/18)
- ✅ Mobile-responsive
- ✅ Type-safe implementation
- ✅ Production-ready architecture

---

**Version**: 0.1.0  
**Status**: MVP Complete  
**Tests**: All Passing  
**Date**: April 2026
