# Backend

Express.js server with MongoDB for Web3 messaging dApp.

## Setup

```bash
npm install
```

## Configuration

Create `.env` file:

```
MONGODB_URI=mongodb://localhost:27017/web3-messages
PORT=5000
JWT_SECRET=your_secret_key_here
FRONTEND_URL=http://localhost:3000
ETHEREUM_RPC_URL=http://127.0.0.1:8545
CONTRACT_ADDRESS=0x...
```

## Development

```bash
npm run dev
```

Server will run on `http://localhost:5000`

## API Endpoints

### Authentication
- `GET /api/auth/nonce/:address` - Get nonce for message signing
- `POST /api/auth/login` - Login with wallet signature
- `POST /api/auth/logout` - Logout

### Messages
- `GET /api/messages/list` - Get all conversations
- `GET /api/messages/conversation/:address` - Get messages with user
- `POST /api/messages` - Send message
- `PUT /api/messages/:id/read` - Mark message as read
- `DELETE /api/messages/:id` - Delete message

### Users
- `GET /api/users/:address` - Get user profile
- `GET /api/users/search/:query` - Search users
- `PUT /api/users/profile` - Update profile

## Database Models

### User
- address (wallet address)
- username
- avatar
- bio
- isOnline
- lastSeen
- nonce (for signing)

### Message
- sender
- recipient
- content
- contentHash (IPFS or chain hash)
- isRead
- isDeleted
- timestamp
- transactionHash (if on-chain)

### Conversation
- participants (2 addresses)
- lastMessage
- lastMessageTime
- unreadCount
