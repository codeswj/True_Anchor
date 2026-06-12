import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import DashboardLayout from './components/layout/DashboardLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import Transactions from './pages/transactions/Transactions';
import Loans from './pages/loans/Loans';
import LoanDetail from './pages/loans/LoanDetail';
import Account from './pages/account/Account';
import AccountStatements from './pages/account/AccountStatements';
import Messages from './pages/messages/Messages';
import Settings from './pages/Settings';
import AdminOverview from './pages/admin/AdminOverview';
import AdminLoans from './pages/admin/AdminLoans';
import Landing from './pages/Landing';

function AdminGuard({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-500 text-sm">Loading…</p>
      </div>
    </div>
  );

  return (
    <Routes>
      <Route path="/login"    element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />

      <Route element={<DashboardLayout />}>
        <Route path="/dashboard"     element={<Dashboard />} />
        <Route path="/transactions"  element={<Transactions />} />
        <Route path="/loans"         element={<Loans />} />
        <Route path="/loans/:id"     element={<LoanDetail />} />
        <Route path="/account"       element={<Account />} />
        <Route path="/account/statements" element={<AccountStatements />} />
        <Route path="/messages"      element={<Messages />} />
        <Route path="/settings"      element={<Settings />} />
        <Route path="/admin"         element={<AdminGuard><AdminOverview /></AdminGuard>} />
        <Route path="/admin/loans"   element={<AdminGuard><AdminLoans /></AdminGuard>} />
      </Route>

      <Route path="/" element={<Landing />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: { borderRadius: '12px', fontSize: '14px', fontWeight: '500' },
            success: { iconTheme: { primary: '#1976d2', secondary: '#fff' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
