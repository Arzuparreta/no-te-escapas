# Music Manager CRM

A self-hosted communications CRM for music industry managers to track calls, emails, and negotiations with contacts.

## Features

- **Contact Management**: Track contacts with full iCloud sync via CardDAV
- **Call Logging**: Fast manual call logging with smart contact suggestions
- **Follow-ups**: Create and track follow-ups with due dates
- **Today View**: See actionable items at a glance  
- **Email Integration**: View Gmail threads in contact context (read-only)
- **Single User**: Designed for individual use with simple authentication

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL with pgvector
- **ORM**: Prisma
- **Auth**: NextAuth.js (Credentials)
- **UI**: Tailwind CSS + shadcn/ui
- **Job Queue**: pgBoss (Postgres-backed)

## Quick Start

### Prerequisites

- Node.js 18+ 
- Docker (for PostgreSQL)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration

4. Set up the database:
   ```bash
   docker-compose up -d
   ```

5. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

6. Run migrations:
   ```bash
   npx prisma migrate dev
   ```

7. Create admin user (set password in `.env`):
   ```bash
   # Generate bcrypt hash for your password
   npx bcrypt your-password
   ```
   
   Add the hash to `.env` as `APP_USER_PASSWORD_HASH`

### Development

Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Testing

Run unit tests:
```bash
npm run test
```

Run E2E tests:
```bash
npm run test:e2e
```

## Project Structure

```
├── src/
│   ├── app/              # Next.js app routes and pages
│   ├── lib/              # Utility libraries
│   ├── types/            # TypeScript type definitions
│   └── test/             # Test setup
├── prisma/               # Database schema and migrations
├── docs/                 # Project documentation
└── docker-compose.yml    # Database container
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run E2E tests
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Prisma Studio

## Environment Variables

See `.env.example` for all available environment variables.

## Building for Production

1. Set up a VPS with Docker
2. Configure environment variables
3. Build the application:
   ```bash
   npm run build
   ```
4. Start the application:
   ```bash
   npm start
   ```

## Security

- Passwords are hashed with bcrypt
- Sessions use JWT with secure cookies
- All routes are protected by authentication
- Rate limiting on API endpoints

## License

MIT