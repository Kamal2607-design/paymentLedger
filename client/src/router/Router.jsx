import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "@/components/layouts/AppLayout";
import DashboardPage from "@/features/dashboard/DashboardPage";
import AccountsPage from "@/features/accounts/AccountsPage";
import AccountDetailsPage from "@/features/accounts/AccountDetailsPage";
import TransactionsPage from "@/features/transactions/TransactionsPage";
import TransfersPage from "@/features/transfers/TransfersPage";

const Router = () => (
  <Routes>
    <Route element={<AppLayout />}>
      <Route index element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/accounts" element={<AccountsPage />} />
      <Route path="/accounts/:accountId" element={<AccountDetailsPage />} />
      <Route path="/transactions" element={<TransactionsPage />} />
      <Route path="/transfers" element={<TransfersPage />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Route>
  </Routes>
);

export default Router;
