#!/bin/bash

# Web3 Message dApp - Setup Script
# This script initializes the project with all dependencies

echo "🚀 Web3 Message dApp - Setup Script"
echo "===================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
echo -e "${BLUE}Checking Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js v16 or higher"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v)${NC}"

# Check npm
echo ""
echo -e "${BLUE}Checking npm...${NC}"
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found"
    exit 1
fi
echo -e "${GREEN}✓ npm $(npm -v)${NC}"

# Create .env files if they don't exist
echo ""
echo -e "${BLUE}Setting up environment files...${NC}"

if [ ! -f ".env" ]; then
    cp .env.example .env
    echo -e "${GREEN}✓ Created .env${NC}"
else
    echo -e "${YELLOW}⚠ .env already exists${NC}"
fi

if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    echo -e "${GREEN}✓ Created backend/.env${NC}"
else
    echo -e "${YELLOW}⚠ backend/.env already exists${NC}"
fi

if [ ! -f "contracts/.env" ]; then
    cp contracts/.env.example contracts/.env
    echo -e "${GREEN}✓ Created contracts/.env${NC}"
else
    echo -e "${YELLOW}⚠ contracts/.env already exists${NC}"
fi

if [ ! -f "frontend/.env" ]; then
    cp frontend/.env.example frontend/.env
    echo -e "${GREEN}✓ Created frontend/.env${NC}"
else
    echo -e "${YELLOW}⚠ frontend/.env already exists${NC}"
fi

# Install root dependencies
echo ""
echo -e "${BLUE}Installing root dependencies...${NC}"
npm install
echo -e "${GREEN}✓ Root dependencies installed${NC}"

# Install backend dependencies
echo ""
echo -e "${BLUE}Installing backend dependencies...${NC}"
cd backend
npm install
cd ..
echo -e "${GREEN}✓ Backend dependencies installed${NC}"

# Install contracts dependencies
echo ""
echo -e "${BLUE}Installing contracts dependencies...${NC}"
cd contracts
npm install
cd ..
echo -e "${GREEN}✓ Contracts dependencies installed${NC}"

# Install frontend dependencies
echo ""
echo -e "${BLUE}Installing frontend dependencies...${NC}"
cd frontend
npm install
cd ..
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"

# Summary
echo ""
echo "=================================="
echo -e "${GREEN}✓ Setup Complete!${NC}"
echo "=================================="
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Update .env files with your configuration"
echo "2. Start Hardhat node:        cd contracts && npx hardhat node"
echo "3. Deploy contracts:          cd contracts && npx hardhat run scripts/deploy.js --network localhost"
echo "4. Start backend:             cd backend && npm run dev"
echo "5. Start frontend:            cd frontend && npm start"
echo ""
echo "Or run all at once: npm run dev"
echo ""
echo "For more details, see QUICKSTART.md"
