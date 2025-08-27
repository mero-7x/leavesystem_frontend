import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout/Layout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MyRequests from './pages/MyRequests';
import NewRequest from './pages/NewRequest';
import PendingApprovals from './pages/PendingApprovals';
import HRApprovals from './pages/HRApprovals';
import Users from './pages/Users';
import History from './pages/History';

/**
 * Main App Component
 * Handles routing, authentication, and global layout
 */
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
          <Routes>
            {/* Public routes - accessible without authentication */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected routes - require authentication */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            {/* Employee-only routes */}
            <Route
              path="/my-requests"
              element={
                <ProtectedRoute requiredRoles={["EMPLOYEE"]}>
                  <Layout>
                    <MyRequests />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            {/* All authenticated users can create requests */}
            <Route
              path="/new-request"
              element={
                <ProtectedRoute>
                  <Layout>
                    <NewRequest />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            {/* Manager-only routes */}
            <Route
              path="/pending-approvals"
              element={
                <ProtectedRoute requiredRoles={["MANAGER"]}>
                  <Layout>
                    <PendingApprovals />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            {/* HR-only routes */}
            <Route
              path="/hr-approvals"
              element={
                <ProtectedRoute requiredRoles={["HR"]}>
                  <Layout>
                    <HRApprovals />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/users"
              element={
                <ProtectedRoute requiredRoles={["HR"]}>
                  <Layout>
                    <Users />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            {/* Manager and HR history routes */}
            <Route
              path="/history"
              element={
                <ProtectedRoute requiredRoles={["MANAGER", "HR"]}>
                  <Layout>
                    <History />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            {/* Default redirects */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          
          {/* Global toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1f2937',
                color: '#f9fafb',
                borderRadius: '12px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;