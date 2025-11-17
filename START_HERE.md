#!/usr/bin/env bash
# 
# 🚀 START HERE - Web3 Message dApp Setup
#
# This file explains how to get started with your Web3 Message dApp
#

cat << 'EOF'

╔════════════════════════════════════════════════════════════════════════════╗
║                                                                            ║
║                   🚀 WEB3 MESSAGE DAPP - START HERE 🚀                    ║
║                                                                            ║
║              Your complete Web3 messaging application is ready!            ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝

📁 PROJECT LOCATION:
   /home/ubuntu/web3/web3-message-dapp

════════════════════════════════════════════════════════════════════════════════

📖 DOCUMENTATION (Read in this order):

   1. README.md                    → Project overview
   2. QUICKSTART.md                → Step-by-step setup
   3. FILE_INDEX.md                → File structure & navigation
   4. BUILD_SUMMARY.md             → Complete feature list
   5. SETUP_COMPLETE.md            → Detailed configuration

════════════════════════════════════════════════════════════════════════════════

⚡ QUICK START (Copy & Paste):

   # Navigate to project
   cd /home/ubuntu/web3/web3-message-dapp

   # Run automated setup
   ./setup.sh

   # Then in 3 separate terminals:

   # Terminal 1: Start Hardhat network
   cd contracts && npx hardhat node

   # Terminal 2: Deploy smart contract
   cd contracts && npx hardhat run scripts/deploy.js --network localhost

   # Terminal 3: Start backend + frontend
   npm run dev

   # Open browser to http://localhost:3000

════════════════════════════════════════════════════════════════════════════════

📦 WHAT YOU HAVE:

   Smart Contract (Solidity)
   ├─ WebMessage.sol         → Main messaging contract
   ├─ deploy.js              → Deployment script
   ├─ WebMessage.test.js     → Test suite
   └─ hardhat.config.js      → Configuration

   Backend (Express + MongoDB)
   ├─ server.js              → Express server
   ├─ models/                → Database schemas
   ├─ routes/                → API endpoints
   └─ middleware/            → Authentication

   Frontend (React)
   ├─ pages/                 → Login & Chat pages
   ├─ components/            → UI components
   ├─ services/              → API & Web3 clients
   └─ store/                 → State management

════════════════════════════════════════════════════════════════════════════════

🔧 MANUAL SETUP (If you prefer):

   1. Install Dependencies:
      npm run install-all

   2. Configure Environment:
      cp .env.example .env
      cp backend/.env.example backend/.env
      cp contracts/.env.example contracts/.env
      cp frontend/.env.example frontend/.env

   3. Start Local Network:
      cd contracts && npx hardhat node

   4. Deploy Contracts (in new terminal):
      cd contracts && npx hardhat run scripts/deploy.js --network localhost

   5. Start Backend (in new terminal):
      cd backend && npm run dev

   6. Start Frontend (in new terminal):
      cd frontend && npm start

   7. Open http://localhost:3000

════════════════════════════════════════════════════════════════════════════════

✨ KEY FEATURES:

   ✅ MetaMask wallet authentication
   ✅ Non-custodial login (sign a message)
   ✅ P2P messaging with MongoDB
   ✅ Real-time chat interface
   ✅ User profile management
   ✅ Smart contract integration
   ✅ Online status indicator
   ✅ Message deletion
   ✅ Conversation tracking
   ✅ Beautiful, responsive UI

════════════════════════════════════════════════════════════════════════════════

🔗 KEY URLs:

   Frontend:        http://localhost:3000
   Backend API:     http://localhost:5000/api
   Hardhat Network: http://127.0.0.1:8545

════════════════════════════════════════════════════════════════════════════════

📋 PREREQUISITES:

   Required:
   ✓ Node.js v16+ (Check: node --version)
   ✓ npm (Check: npm --version)

   Optional but recommended:
   ✓ MetaMask browser extension
   ✓ MongoDB (local or MongoDB Atlas)
   ✓ Git

════════════════════════════════════════════════════════════════════════════════

🎓 RECOMMENDED READING ORDER:

   If you're new to Web3:
   1. README.md - Understand the project
   2. QUICKSTART.md - Follow the steps
   3. contracts/README.md - Learn about the contract
   4. backend/README.md - Understand the API
   5. frontend/README.md - Explore the UI

   If you know Web3:
   1. BUILD_SUMMARY.md - See what's included
   2. FILE_INDEX.md - Navigate the codebase
   3. Dive into the code directly

════════════════════════════════════════════════════════════════════════════════

🚨 TROUBLESHOOTING:

   "MetaMask not detected"
   → Make sure you're on http://localhost:3000 (not https)
   → Clear browser cache
   → Reinstall MetaMask

   "Cannot connect to backend"
   → Check backend is running: npm run dev:backend
   → Verify port 5000 is not in use
   → Check .env FRONTEND_URL is correct

   "Cannot deploy contract"
   → Ensure Hardhat node is running: cd contracts && npx hardhat node
   → Check private key in contracts/.env
   → Verify MongoDB is running

   "Messages not loading"
   → Check MongoDB connection in backend/.env
   → Verify JWT token is stored
   → Check browser console for errors

════════════════════════════════════════════════════════════════════════════════

📞 HELP & DOCUMENTATION:

   Each directory has its own README:
   ├─ ./README.md              - Main project
   ├─ ./QUICKSTART.md          - Quick setup guide
   ├─ ./FILE_INDEX.md          - File reference
   ├─ ./BUILD_SUMMARY.md       - Feature list
   ├─ ./contracts/README.md    - Smart contract
   ├─ ./backend/README.md      - Backend API
   └─ ./frontend/README.md     - Frontend UI

   For detailed troubleshooting, see QUICKSTART.md

════════════════════════════════════════════════════════════════════════════════

🎯 NEXT STEPS:

   1. Read QUICKSTART.md
   2. Run ./setup.sh
   3. Start the services in 3 terminals
   4. Open http://localhost:3000
   5. Connect MetaMask
   6. Start messaging!

════════════════════════════════════════════════════════════════════════════════

🌟 PROJECT STATS:

   Files: 48
   Code: 3000+ lines
   Size: 284 KB
   Smart Contracts: 1 (with tests)
   API Endpoints: 9
   React Components: 5
   Database Models: 3

════════════════════════════════════════════════════════════════════════════════

✅ YOUR WEB3 MESSAGE DAPP IS READY TO LAUNCH!

   Questions? Check the documentation.
   Ready to build? Start with QUICKSTART.md
   Want to customize? Check FILE_INDEX.md for guidance.

═══════════════════════════════════════════════════════════════════════════════

Happy coding! 🚀

EOF

echo ""
echo "For quick start, run: cat QUICKSTART.md"
