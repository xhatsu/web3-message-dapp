# Frontend

React application for Web3 messaging dApp.

## Setup

```bash
npm install
```

## Configuration

Create `.env` file:

```
REACT_APP_BACKEND_URL=http://localhost:5000/api
```

## Development

```bash
npm start
```

Application will run on `http://localhost:3000`

## Features

- 🔐 MetaMask wallet connection and authentication
- 💬 Real-time messaging interface
- 📋 Conversation list with online status
- 🎨 Modern, responsive UI
- 🔄 Message synchronization with backend

## Build

```bash
npm run build
```

## Key Components

- **Login.js** - Wallet authentication page
- **Chat.js** - Main chat interface
- **ConversationList.js** - List of conversations
- **ChatWindow.js** - Message window and input

## Dependencies

- React 18 - UI framework
- ethers.js - Web3 integration
- axios - HTTP client
- zustand - State management
- lucide-react - Icons
- react-router-dom - Routing
