# Smart Contracts

Hardhat smart contracts for Web3 messaging dApp.

## Setup

```bash
npm install
```

## Compile

```bash
npx hardhat compile
```

## Test

```bash
npx hardhat test
```

## Deploy

### Local Network

```bash
npx hardhat node
# In another terminal
npx hardhat run scripts/deploy.js --network localhost
```

### Sepolia Testnet

Set `PRIVATE_KEY` and `ETHEREUM_RPC_URL` in `.env`, then:

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

## Contract Functions

### sendMessage(address recipient, string contentHash)
Send a message to another user. Stores message metadata on-chain and emits event.

### markAsRead(uint256 messageId)
Mark a message as read.

### deleteMessage(uint256 messageId)
Delete a message (only sender or recipient).

### getMessage(uint256 messageId)
Retrieve message details.

### getUserMessages(address user)
Get all message IDs for a user.

### getUserMessageCount(address user)
Get the count of messages for a user.
