#!/bin/bash

echo "=== Music Manager CRM - Development Setup ==="
echo ""

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+"
    exit 1
fi

echo "✓ Node.js version: $(node --version)"

# Check for Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker"
    exit 1
fi

echo "✓ Docker is installed"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo ""
    echo "Creating .env file..."
    cp .env.example .env
    echo "✓ Created .env file from .env.example"
    echo ""
    echo "⚠️  Please edit .env and set:"
    echo "   - APP_USER_PASSWORD_HASH (use: npx bcrypt your-password)"
else
    echo "✓ .env file already exists"
fi

# Start database
echo ""
echo "Starting PostgreSQL database..."
docker-compose up -d

# Wait for database to be ready
echo "Waiting for database to be ready..."
sleep 5

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo ""
    echo "Installing dependencies..."
    npm install
    echo "✓ Dependencies installed"
fi

# Generate Prisma client
echo ""
echo "Generating Prisma client..."
npx prisma generate

# Run migrations
echo "Running database migrations..."
npx prisma migrate dev --name init

echo ""
echo "=== Setup Complete! ==="
echo ""
echo "To start the development server, run:"
echo "  npm run dev"
echo ""
echo "To create an admin user, set APP_USER_PASSWORD_HASH in .env"
echo "  npx bcrypt your-password"
echo ""
echo "Then visit: http://localhost:3000"
echo ""
echo "To stop the database, run:"
echo "  docker-compose down"
