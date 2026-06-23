import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import InterviewSetup from './pages/InterviewSetup';
import LiveInterview from './pages/LiveInterview';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Feedback from './pages/Feedback';
import Login from './pages/Login';
import Register from './pages/Register';
import DoubtChat from './pages/DoubtChat';
import { useLocation } from 'react-router-dom';
function App() {
  const location = useLocation();
  const isDoubtChat = location.pathname.startsWith('/doubts');

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {!isDoubtChat && <Navbar />}
      <main className="flex-1 flex flex-col h-full">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes */}
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/setup" element={<ProtectedRoute><InterviewSetup /></ProtectedRoute>} />
          <Route path="/interview/:id" element={<ProtectedRoute><LiveInterview /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
          <Route path="/feedback/:id" element={<ProtectedRoute><Feedback /></ProtectedRoute>} />
          <Route path="/doubts/:id" element={<ProtectedRoute><DoubtChat /></ProtectedRoute>} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
