#!/bin/bash

# Music Manager CRM - Database Reset Script
# This script handles all database operations:
# 1. Generates Prisma client
# 2. Pushes schema to database (creates/updates tables)
# 3. Seeds the database with an admin user
#
# Usage:
#   npm run db:reset

set -e

echo "=== Music Manager CRM - Database Reset ==="
echo ""

# Check database connection by trying to query
echo "Connecting to database..."
if ! npx prisma db push --accept-data-loss --skip-generate 2>&1 | grep -q "already in sync\|Created\|Updated"; then
  echo "❌ Cannot connect to database. Is it running?"
  echo "   Run: docker-compose up -d"
  exit 1
fi
echo "✓ Database connection OK"

# Generate Prisma client
echo ""
echo "Generating Prisma client..."
npx prisma generate

# Run seed
echo ""
echo "Seeding database..."
npx prisma db seed

echo ""
echo "=== Database Reset Complete! ==="
echo ""
echo "Admin credentials:"
echo "  Email: admin@email.com"
echo "  Password: password"