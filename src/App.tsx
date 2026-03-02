import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/common/Toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import Home from './pages/Home';
import BankDetails from './pages/masters/BankDetails';
import FunctionCode from './pages/masters/FunctionCode';
import AddBankDetails from './pages/masters/AddBankDetails';
import Services from './pages/masters/Services';
import SubServices from './pages/masters/SubServices';
import AccountFundSOFMapping from './pages/masters/AccountFundSOFMapping';
import BudgetCode from './pages/masters/BudgetCode';
import BillQueue from './pages/masters/BillQueue';
import BeneficiarySchemes from './pages/masters/BeneficiarySchemes';
import WorkBillDeductions from './pages/masters/WorkBillDeductions';
import Vendors from './pages/masters/Vendors';
import Procurement from './pages/masters/Procurement';
import FileSetupList, { FileSetupCreate } from './pages/bill-accounting/FileSetup';

// Placeholder page for routes not yet built
const Placeholder: React.FC<{ title: string }> = ({ title }) => (
  <div style={{ padding: '2rem', textAlign: 'center', color: '#737373' }}>
    <h2 style={{ marginBottom: '0.5rem' }}>{title}</h2>
    <p style={{ fontSize: '0.875rem' }}>This page is under development.</p>
  </div>
);

// Redirect to /home if already logged in; otherwise render Login
const LoginGuard: React.FC = () => {
  const { role } = useAuth();
  return role ? <Navigate to="/home" replace /> : <Login />;
};

// Require authentication for all nested routes; otherwise redirect to /login
const AuthGuard: React.FC = () => {
  const { role } = useAuth();
  if (!role) return <Navigate to="/login" replace />;
  return <AppLayout />;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginGuard />} />

      {/* Authenticated layout */}
      <Route element={<AuthGuard />}>
        <Route index element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />

        {/* Masters landing */}
        <Route path="/masters" element={<Placeholder title="Masters" />} />

        {/* Charts of Accounts — tabs are URL segments */}
        <Route
          path="/masters/charts-of-accounts"
          element={<Navigate to="/masters/charts-of-accounts/fund-code" replace />}
        />
        <Route path="/masters/charts-of-accounts/:tab" element={<BankDetails />} />

        {/* Redirect legacy bank-details URL */}
        <Route
          path="/masters/bank-details"
          element={<Navigate to="/masters/charts-of-accounts/fund-code" replace />}
        />

        {/* Other Masters pages */}
        <Route path="/masters/function-code" element={<FunctionCode />} />
        <Route path="/masters/services" element={<Services />} />
        <Route path="/masters/add-map-sub-services" element={<SubServices />} />
        <Route path="/masters/account-fund-sof-mapping" element={<AccountFundSOFMapping />} />
        <Route path="/masters/budget-code" element={<BudgetCode />} />
        <Route path="/masters/bill-queue" element={<BillQueue />} />
        <Route path="/masters/schemes-beneficiary" element={<BeneficiarySchemes />} />
        <Route path="/masters/work-bill-deductions" element={<WorkBillDeductions />} />
        <Route path="/masters/vendors" element={<Vendors />} />
        <Route path="/masters/procurement" element={<Procurement />} />
        <Route path="/masters/add-bank-details" element={<AddBankDetails />} />

        {/* Bill Accounting */}
        <Route path="/bill-accounting" element={<Placeholder title="Bill Accounting" />} />
        <Route path="/bill-accounting/file-setup" element={<FileSetupList />} />
        <Route path="/bill-accounting/file-setup/create" element={<FileSetupCreate />} />
        <Route path="/transactions" element={<Placeholder title="Transactions" />} />
        <Route path="/budget" element={<Placeholder title="Budget" />} />
        <Route path="/audit" element={<Placeholder title="Audit" />} />
        <Route path="/dashboard" element={<Placeholder title="Dashboard" />} />
        <Route path="/reports" element={<Placeholder title="Reports" />} />
        <Route path="/help" element={<Placeholder title="Help" />} />
        <Route path="/settings" element={<Placeholder title="Settings" />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
