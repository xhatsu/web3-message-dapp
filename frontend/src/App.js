import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Login from './pages/Login';
import Chat from './pages/Chat';
import './App.css';

function App() {
  const { isConnected, hydrate } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    hydrate();
    setIsLoading(false);
  }, [hydrate]);

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
