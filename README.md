# Web3 Message dApp

A decentralized messaging application with Web3 wallet authentication, MongoDB database, and smart contract integration using Hardhat.

## Features

- 🔐 Wallet-based authentication (MetaMask, Taho, and more)
- 💬 Real-time messaging with MongoDB storage
- 🔗 Smart contract for message verification
- ⛓️ Deployed on Ethereum-compatible networks
- 🎨 Modern React UI with ethers.js integration

## Project Structure

```
web3-message-dapp/
├── contracts/           # Hardhat smart contracts
├── backend/            # Express.js server with MongoDB
├── frontend/           # React application
├── .env.example        # Environment variables template
└── package.json        # Root package configuration
```

## Prerequisites

- Node.js v16+
- npm or yarn
- MetaMask or similar Web3 wallet
- MongoDB instance (local or cloud)

## Installation

```bash
npm run install-all
```

## Environment Setup

Copy `.env.example` to `.env` in each directory and configure:

### Backend (.env)
```
MONGODB_URI=mongodb://localhost:27017/web3-messages
PORT=5000
JWT_SECRET=your_secret_key
WALLET_PRIVATE_KEY=your_private_key
```

### Frontend (.env)
```
REACT_APP_BACKEND_URL=http://localhost:5000
REACT_APP_CONTRACT_ADDRESS=0x...
```

### Contracts (.env)
```
HARDHAT_NETWORK=localhost
ETHEREUM_RPC_URL=http://127.0.0.1:8545
PRIVATE_KEY=your_private_key
```

## Development

### Start Local Hardhat Network
```bash
cd contracts && npx hardhat node
```

### Deploy Contracts
```bash
npm run contracts:deploy
```

### Start Backend
```bash
npm run dev:backend
```

### Start Frontend
```bash
npm run dev:frontend
```

### Start All (Backend + Frontend)
```bash
npm run dev
```

## Smart Contract

The `WebMessage` contract includes:
- Message sending on-chain
- Message storage in MongoDB
- Wallet-based authentication
- Event emissions for UI updates

## API Endpoints

- `POST /auth/login` - Wallet authentication
- `GET /messages` - Fetch messages
- `POST /messages` - Create new message
- `GET /messages/:id` - Get specific message
- `DELETE /messages/:id` - Delete message

## Testing

```bash
npm run contracts:test
```

## Deployment

See individual README files in `backend/`, `frontend/`, and `contracts/` directories for deployment instructions.

## License

MIT
