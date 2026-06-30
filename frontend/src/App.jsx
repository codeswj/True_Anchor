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
import Notifications from './pages/notifications/Notifications';
import Messages from './pages/messages/Messages';
import Settings from './pages/Settings';
import AdminOverview from './pages/admin/AdminOverview';
import AdminLoans from './pages/admin/AdminLoans';
import AdminMembers from './pages/admin/AdminMembers';
import AdminReports from './pages/admin/AdminReports';
import StaffPortal from './pages/staff/StaffPortal';
import StaffModule from './pages/staff/StaffModule';
import MembershipModule from './pages/staff/MembershipModule';
import SavingsModule from './pages/staff/SavingsModule';
import AddNewMember from './pages/staff/AddNewMember';
import VendorsModule from './pages/staff/VendorsModule';
import AddVendor from './pages/staff/AddVendor';
import VendorDetail from './pages/staff/VendorDetail';
import EditVendor from './pages/staff/EditVendor';
import Landing from './pages/Landing';

function AdminGuard({ children }) {
  const { user } = useAuth();
  const role = getRole(user);
  if (!user) return <Navigate to="/login" replace />;
  if (role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

function StaffGuard({ children }) {
  const { user } = useAuth();
  const role = getRole(user);
  if (!user) return <Navigate to="/login" replace />;
  if (!['staff', 'admin'].includes(role)) return <Navigate to="/dashboard" replace />;
  return children;
}

function getRole(user) {
  return String(user?.role || 'member').trim().toLowerCase();
}

function homeForRole(role) {
  const normalizedRole = String(role || 'member').trim().toLowerCase();
  if (normalizedRole === 'admin') return '/admin';
  if (normalizedRole === 'staff') return '/staff';
  return '/dashboard';
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
      <Route path="/login"    element={user ? <Navigate to={homeForRole(user.role)} replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />

      <Route element={<DashboardLayout />}>
        <Route path="/dashboard"     element={<Dashboard />} />
        <Route path="/transactions"  element={<Transactions />} />
        <Route path="/loans"         element={<Loans />} />
        <Route path="/loans/:id"     element={<LoanDetail />} />
        <Route path="/account"       element={<Account />} />
        <Route path="/account/statements" element={<AccountStatements />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/messages"      element={<Messages />} />
        <Route path="/settings"      element={<Settings />} />
        <Route path="/admin"         element={<AdminGuard><AdminOverview /></AdminGuard>} />
        <Route path="/admin/loans"   element={<AdminGuard><AdminLoans /></AdminGuard>} />
        <Route path="/admin/members" element={<AdminGuard><AdminMembers /></AdminGuard>} />
        <Route path="/admin/reports" element={<AdminGuard><AdminReports /></AdminGuard>} />
        <Route path="/staff"         element={<StaffGuard><StaffPortal /></StaffGuard>} />
        <Route path="/staff/membership" element={<StaffGuard><MembershipModule /></StaffGuard>} />
        <Route path="/staff/membership/new" element={<StaffGuard><AddNewMember /></StaffGuard>} />
        <Route path="/staff/savings" element={<StaffGuard><SavingsModule /></StaffGuard>} />
        <Route path="/staff/payables/vendors/new" element={<StaffGuard><AddVendor /></StaffGuard>} />
        <Route path="/staff/payables/vendors/:id/edit" element={<StaffGuard><EditVendor /></StaffGuard>} />
        <Route path="/staff/payables/vendors/:id" element={<StaffGuard><VendorDetail /></StaffGuard>} />
        <Route path="/staff/payables/vendors" element={<StaffGuard><VendorsModule /></StaffGuard>} />
        <Route path="/staff/:moduleSlug" element={<StaffGuard><StaffModule /></StaffGuard>} />
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
