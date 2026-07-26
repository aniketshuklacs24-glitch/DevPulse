import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './store/store';
import { socket } from './socket';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PRDetail from './pages/PRDetail';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = useSelector((state: RootState) => state.auth.token);
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

function App() {
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    if (token) {
      socket.connect();
    }
    return () => {
      socket.disconnect();
    };
  }, [token]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pr/:owner/:repo/:prId"
          element={
            <ProtectedRoute>
              <PRDetail />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
