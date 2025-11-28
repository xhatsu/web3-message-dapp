# Web3 Message dApp - Backend

Express.js + MongoDB backend for Web3 messaging application with wallet authentication and token/NFT transfers.

## 🏗️ Project Structure

```
backend/
├── models/
│   ├── User.js              # User model (wallet, nonce, online status)
│   ├── Message.js           # Message model (text + transfer data)
│   └── Conversation.js      # Conversation model (participants, last message)
├── routes/
│   ├── auth.js              # Authentication routes (login, nonce)
│   ├── users.js             # User routes (search, info, update)
│   ├── messages.js          # Message routes (send, get, delete)
│   └── transfers.js         # Transfer routes (token, NFT, Ether)
├── middleware/
│   └── auth.js              # JWT authentication middleware
├── .env                     # Environment variables
├── package.json             # Dependencies
└── server.js                # Main server file
```

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Setup Environment
Update `.env` with your configuration:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/web3-messages
JWT_SECRET=your_jwt_secret_key_change_this_in_production
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
CUSTOM_RPC_URL=http://127.0.0.1:8545
```

### 3. Start MongoDB (if running locally)
```bash
mongod
```

### 4. Start Backend
```bash
npm start          # Production
npm run dev        # Development (with nodemon)
```

Server runs on `http://localhost:5000`

## 📚 API Endpoints

### Authentication
- `GET /api/auth/nonce/:address` - Get nonce for message signing
- `POST /api/auth/login` - Login with signed message

### Users
- `GET /api/users/search?q=query` - Search users by address
- `GET /api/users/info` - Get current user info
- `PUT /api/users/update` - Update user (username)

### Messages
- `GET /api/messages/conversations` - Get all conversations
- `GET /api/messages/conversation/:address` - Get messages with user
- `POST /api/messages/send` - Send text message
- `DELETE /api/messages/:id` - Delete message

### Transfers
- `POST /api/transfers/send-token` - Send token with message
- `POST /api/transfers/send-nft` - Send NFT with message
- `POST /api/transfers/send-ether` - Send ETH with message
- `PUT /api/transfers/:id/claim` - Claim received transfer
- `GET /api/transfers/:id/verify` - Verify transaction on-chain

## 🔐 Authentication

All protected routes require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

### Login Flow
1. Get nonce: `GET /api/auth/nonce/0x...`
2. Sign message with wallet
3. Send signature: `POST /api/auth/login`
4. Receive JWT token
5. Use token in all authenticated requests

## 💾 Data Models

### User
```javascript
{
  address: String,      // Ethereum address (unique)
  username: String,     // Optional username
  nonce: Number,        // For message signing
  isOnline: Boolean,    // Online status
  createdAt: Date,
  updatedAt: Date
}
```

### Message
```javascript
{
  sender: String,       // Sender address
  recipient: String,    // Recipient address
  content: String,      // Message text
  transfer: String,     // 'none', 'token', 'nft', 'ether'
  transferData: {
    tokenAddress: String,     // Token contract (optional)
    tokenAmount: String,      // Amount sent
    nftAddress: String,       // NFT contract (optional)
    nftTokenId: String,       // NFT ID
    etherAmount: String,      // ETH amount
    transactionHash: String,  // Tx hash from wallet
    claimed: Boolean,         // Transfer claimed flag
    confirmed: Boolean        // Transaction confirmed on-chain
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Conversation
```javascript
{
  participants: [String],    // Array of wallet addresses
  participantsKey: String,   // Sorted participants (for unique index)
  lastMessage: ObjectId,     // Reference to last message
  lastMessageTime: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔧 Configuration

### Environment Variables
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `NODE_ENV` - Environment (development/production)
- `FRONTEND_URL` - Frontend URL for CORS
- `CUSTOM_RPC_URL` - Blockchain RPC endpoint

## 📖 Key Features

✅ Wallet-based authentication (no passwords)
✅ Message signing verification
✅ Real-time message handling
✅ Token/NFT transfer support
✅ Transaction verification on-chain
✅ Automatic conversation management
✅ User search and discovery
✅ Transfer claim tracking

## 🛡️ Security

- JWT token-based authentication
- Message signature verification
- CORS protection
- Input validation
- Async error handling
- Database connection pooling
- Environment variable protection

## 🐛 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod`
- Check `MONGODB_URI` in .env
- Verify connection permissions

### JWT Token Issues
- Check `JWT_SECRET` is set
- Verify token is in Authorization header
- Token format: `Bearer <token>`

### Transfer Verification Failed
- Check `CUSTOM_RPC_URL` points to correct blockchain
- Verify transaction exists on network
- Confirm Hardhat node is running (for localhost)

## 📝 API Response Format

All responses follow this format:
```javascript
{
  success: boolean,
  data: { ... },
  error: string          // Only on error
}
```

## 🚀 Deployment

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Update `JWT_SECRET` to strong value
- [ ] Configure MongoDB Atlas
- [ ] Update `FRONTEND_URL` for CORS
- [ ] Set proper RPC endpoint
- [ ] Enable HTTPS/SSL
- [ ] Setup logging
- [ ] Monitor error rates

## 📞 Support

For issues or questions:
1. Check logs: `npm run dev` shows detailed errors
2. Verify .env configuration
3. Check MongoDB connection
4. Verify frontend is accessing correct API URL

---

**Backend Status**: ✅ Ready for development and testing
