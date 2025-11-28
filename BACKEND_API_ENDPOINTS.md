# Backend API Endpoints - Updated

## Summary of Changes

All backend endpoints have been updated to match frontend API calls exactly.

---

## 🔐 Auth Routes (`/api/auth`)

### GET /nonce/:address
Get nonce for message signing
- **Params**: `address` (Ethereum address)
- **Response**: `{ nonce, message }`

### POST /login
Login with signed message
- **Body**: `{ address, signature, message }`
- **Response**: `{ token, user: { address, username, isOnline } }`

### POST /logout ✨ NEW
Logout user (invalidate token on frontend)
- **Response**: `{ success: true }`

---

## 💬 Messages Routes (`/api/messages`)

### POST /send
Send a message
- **Body**: `{ recipient, content }`
- **Response**: `{ success, message: { _id, sender, recipient, content, transfer, createdAt } }`

### GET /conversations
Get all conversations for current user
- **Response**: `{ conversations: [ { _id, participants, otherUser, lastMessage, lastMessageTime } ] }`

### GET /conversation/:otherAddress
Get messages with specific user
- **Params**: `otherAddress`
- **Response**: `{ messages, otherUser: { address, username, isOnline } }`

### DELETE /:messageId
Delete a message
- **Response**: `{ success: true }`

---

## 👥 Users Routes (`/api/users`)

### GET /:address ✨ NEW
Get user info by specific address
- **Params**: `address`
- **Response**: `{ user: { address, username, avatar, bio, isOnline, createdAt } }`

### GET /
Get current user info
- **Response**: `{ user: { address, username, avatar, bio, isOnline, createdAt } }`

### GET /search/:query
Search users by address
- **Params**: `query` (partial address to search)
- **Query**: `?limit=10`
- **Response**: `{ users: [ { address, username, avatar, bio, isOnline } ] }`

### PUT /profile ✨ UPDATED
Update user profile
- **Body**: `{ username?, avatar?, bio? }` (all optional)
- **Response**: `{ user: { address, username, avatar, bio, isOnline } }`

### POST /send-message ✨ NEW
Send first message to a user (creates conversation)
- **Body**: `{ recipient, content }`
- **Response**: `{ success, message: { _id, sender, recipient, content, transfer, createdAt } }`

---

## 💸 Transfers Routes (`/api/transfers`)

### POST /send-token
Send token with message
- **Body**: `{ recipient, content, tokenAddress, tokenAmount, transactionHash }`
- **Response**: `{ success, message: { _id, sender, recipient, content, transfer, transferData, createdAt } }`

### POST /send-nft
Send NFT with message
- **Body**: `{ recipient, content, nftAddress, nftTokenId, transactionHash }`
- **Response**: `{ success, message: { _id, sender, recipient, content, transfer, transferData, createdAt } }`

### POST /send-ether
Send Ether with message
- **Body**: `{ recipient, content, etherAmount, transactionHash }`
- **Response**: `{ success, message: { _id, sender, recipient, content, transfer, transferData, createdAt } }`

### PUT /:messageId/claim
Claim received transfer
- **Response**: `{ success, transfer: { claimed: true, claimedAt } }`

### GET /:messageId/verify
Verify transaction on-chain
- **Response**: `{ confirmed: boolean, receipt: {...} }`

---

## 📊 Database Models - Updated

### User Schema
```javascript
{
  address: String (unique),
  username: String,
  avatar: String,           // ✨ NEW
  bio: String,              // ✨ NEW
  nonce: Number,
  isOnline: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## ✅ Compatibility Status

| Frontend Call | Backend Route | Status |
|---|---|---|
| getNonce | GET /auth/nonce/:address | ✅ |
| login | POST /auth/login | ✅ |
| logout | POST /auth/logout | ✅ NEW |
| sendMessage | POST /messages/send | ✅ |
| getConversations | GET /messages/conversations | ✅ |
| getConversation | GET /messages/conversation/:otherAddress | ✅ |
| deleteMessage | DELETE /messages/:id | ✅ |
| getUser | GET /users/:address | ✅ NEW |
| getCurrentUser | GET /users | ✅ FIXED |
| updateProfile | PUT /users/profile | ✅ FIXED |
| searchUsers | GET /users/search/:query | ✅ |
| sendFirstMessage | POST /users/send-message | ✅ NEW |
| sendToken | POST /transfers/send-token | ✅ |
| sendNFT | POST /transfers/send-nft | ✅ |
| sendEther | POST /transfers/send-ether | ✅ |
| claimTransfer | PUT /transfers/:messageId/claim | ✅ |
| verifyTransfer | GET /transfers/:messageId/verify | ✅ |

---

## 🚀 All endpoints are now fully aligned!

The backend now matches 100% of the frontend API calls.
