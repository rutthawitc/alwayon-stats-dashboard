#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🚀 Starting production build process..."

# Check Node.js version
NODE_VERSION=$(node -v)
echo "Node.js version: $NODE_VERSION"
if [[ ! $NODE_VERSION =~ ^v(18|20|23) ]]; then
    echo -e "${RED}Error: Node.js version 18, 20, or 23 is required${NC}"
    exit 1
fi

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf .next out

# Install dependencies
echo "📦 Installing dependencies..."
if yarn install; then
    echo -e "${GREEN}Dependencies installed successfully${NC}"
else
    echo -e "${RED}Failed to install dependencies${NC}"
    exit 1
fi

# Type check
echo "📝 Running type check..."
if yarn type-check; then
    echo -e "${GREEN}Type check passed${NC}"
else
    echo -e "${RED}Type check failed${NC}"
    exit 1
fi

# Production build
echo "🏗️ Creating production build..."
if yarn build; then
    echo -e "${GREEN}Production build completed successfully${NC}"
else
    echo -e "${RED}Production build failed${NC}"
    exit 1
fi

echo -e "${GREEN}✨ Production build process completed successfully!${NC}"