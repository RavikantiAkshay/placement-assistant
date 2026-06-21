import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import InterviewSetup from './pages/InterviewSetup';
import LiveInterview from './pages/LiveInterview';

// Placeholder Pages
const Dashboard = () => <div className="p-8">Dashboard Content</div>;
const Login = () => <div className="p-8">Login Page</div>;
const Register = () => <div className="p-8">Register Page</div>;
const History = () => <div className="p-8">Interview History</div>;

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes */}
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/setup" element={<ProtectedRoute><InterviewSetup /></ProtectedRoute>} />
          <Route path="/interview/:id" element={<ProtectedRoute><LiveInterview /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
