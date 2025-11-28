import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { reconnectWallet } from './services/web3';
import Login from './pages/Login';
import Chat from './pages/Chat';
import './App.css';

function App() {
  const { isConnected, hydrate, user, walletType } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      if (isInitialized) return;

      // Hydrate auth state from localStorage
      hydrate();

      // Wait a moment for hydrate to update state
      setTimeout(async () => {
        // If user is logged in, reconnect wallet
        if (user?.address && walletType) {
          try {
            await reconnectWallet(walletType);
          } catch (error) {
            console.warn('Failed to auto-reconnect wallet:', error);
          }
        }

        setIsLoading(false);
        setIsInitialized(true);
      }, 100);
    };

    initializeApp();
  }, [isInitialized]);

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/chat/*"
          element={isConnected ? <Chat /> : <Navigate to="/login" />}
        />
        <Route
          path="/"
          element={isConnected ? <Navigate to="/chat" /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
