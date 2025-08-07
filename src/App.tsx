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

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected routes */}
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
            <Route
              path="/history"
              element={
                <ProtectedRoute requiredRoles={['MANAGER', 'HR']}>
                  <Layout>
                    <History />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-requests"
              element={
                <ProtectedRoute requiredRoles={['Employee']}>
                  <Layout>
                    <MyRequests />
                  </Layout>
                </ProtectedRoute>
              }
            />
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
            <Route
              path="/pending-approvals"
              element={
                <ProtectedRoute requiredRoles={['MANAGER']}>
                  <Layout>
                    <PendingApprovals />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/hr-approvals"
              element={
                <ProtectedRoute requiredRoles={['HR']}>
                  <Layout>
                    <HRApprovals />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute requiredRoles={['HR']}>
                  <Layout>
                    <Users />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          
          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
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