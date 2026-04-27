# Quick Start Guide

## Getting Started (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

Edit `.env`:
```bash
# Generate a bcrypt hash for your password
npx bcrypt your-password
```

Add the hash to `.env` as `APP_USER_PASSWORD_HASH`

### 3. Start Database (PostgreSQL)
```bash
# Option A: Use Docker (recommended)
docker-compose up -d

# Option B: Use existing PostgreSQL
# Edit .env DATABASE_URL to match your setup
```

### 4. Initialize Database
```bash
npx prisma generate
npx prisma db push
```

### 5. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## First Login

1. Navigate to the app
2. You'll be redirected to sign-in page
3. Use the credentials from your `.env` file
4. You're in!

## What You Can Do Right Away

- ✅ **Add Contacts** - Click "Add New Contact"
- ✅ **Log Calls** - Click "Log a Call" or from a contact
- ✅ **Schedule Follow-ups** - Create follow-ups from calls or contact page
- ✅ **View Today** - See your daily tasks and recent activity
- ✅ **Connect Gmail** - Optional: Set up Gmail OAuth for email integration

## Next Steps

1. **Connect iCloud** - Go to Settings to sync your contacts
2. **Configure Gmail** - Set up OAuth for email integration
3. **Customize** - Add your own fields and workflows

## Troubleshooting

**Database connection failed:**
- Ensure PostgreSQL is running
- Check `DATABASE_URL` in `.env`
- For Docker: `docker-compose logs db`

**Prisma errors:**
- Run `npx prisma generate` after schema changes
- Run `npx prisma db push` to update database

**Auth issues:**
- Ensure `NEXTAUTH_SECRET` is set
- Password hash must be bcrypt format
- Check `APP_USER_EMAIL` and `APP_USER_PASSWORD_HASH` in `.env`

## Development

```bash
# Run tests
npm run test

# Lint code
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

## Production Deployment

See `IMPLEMENTATION_SUMMARY.md` for detailed deployment guide.

Key steps:
1. Build app: `npm run build`
2. Set production environment variables
3. Use Caddy for HTTPS (see `Caddyfile`)
4. Set up PostgreSQL backups
5. Configure monitoring

## Getting Help

- 📄 [BUILDPLAN.md](docs/BUILDPLAN.md) - Complete project plan
- 📄 [README.md](README.md) - Full documentation
- 📄 [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - Technical details
