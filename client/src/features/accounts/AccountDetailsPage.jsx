import { useState } from "react";
import { Box, Skeleton, Typography } from "@mui/material";
import { Link, useParams } from "react-router-dom";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SouthWestRoundedIcon from "@mui/icons-material/SouthWestRounded";
import NorthEastRoundedIcon from "@mui/icons-material/NorthEastRounded";
import SwapHorizRoundedIcon from "@mui/icons-material/SwapHorizRounded";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import Button from "@/components/ui/Button";
import SummaryCards from "@/components/ui/SummaryCards";
import TypeTabs from "@/components/ui/TypeTabs";
import DataTable from "@/components/ui/DataTable";
import { AccountAvatar, SectionCard } from "@/components/ui/LedgerBits";
import useApi from "@/hooks/useApi";
import { getAccount, getAccountTransactions } from "@/services/ledgerService";
import { useStore } from "@/store";
import { formatCurrency, formatDate, formatDateTime } from "@/utils/format";
import { buildTransactionColumns } from "@/features/transactions/components/transactionColumns";

const columns = buildTransactionColumns();

const AccountNotFound = ({ id }) => (
  <SectionCard sx={{ textAlign: "center", py: 8 }}>
    <Typography variant="h5" sx={{ mb: 1 }}>
      Account not found
    </Typography>
    <Typography sx={{ color: "#64748B", mb: 3 }}>Account #{id} does not exist in the ledger.</Typography>
    <Button component={Link} to="/accounts">
      Back to accounts
    </Button>
  </SectionCard>
);

const AccountDetailsPage = () => {
  const { accountId } = useParams();
  const openModal = useStore((s) => s.openModal);
  const [type, setType] = useState("");
  const [paging, setPaging] = useState({ page: 1, pageSize: 10 });

  const account = useApi(() => getAccount(accountId), [accountId]);
  const history = useApi(
    () => getAccountTransactions(accountId, { type, page: paging.page, limit: paging.pageSize }),
    [accountId, type, paging.page, paging.pageSize],
  );

  if (account.error?.status === 404 || account.error?.status === 400) return <AccountNotFound id={accountId} />;

  const acc = account.data;
  const stats = acc?.stats;
  const loadingAccount = account.loading && !acc;

  const cards = [
    {
      label: "TOTAL CREDITED",
      value: formatCurrency(stats?.total_credit),
      caption: `${stats?.credit_count ?? 0} credits`,
      color: "#118D57",
      iconBg: "rgba(34, 197, 94, 0.15)",
      icon: <SouthWestRoundedIcon />,
    },
    {
      label: "TOTAL DEBITED",
      value: formatCurrency(stats?.total_debit),
      caption: `${stats?.debit_count ?? 0} debits`,
      color: "#DC2626",
      iconBg: "#FEE2E2",
      icon: <NorthEastRoundedIcon />,
    },
    {
      label: "TRANSACTIONS",
      value: stats?.transaction_count ?? 0,
      caption: "Posted to this account",
      color: "#0351AB",
      iconBg: "#E6F6FF",
      icon: <ReceiptLongOutlinedIcon />,
    },
    {
      label: "LAST ACTIVITY",
      value: stats?.last_transaction_at ? formatDate(stats.last_transaction_at) : "—",
      caption: stats?.last_transaction_at ? formatDateTime(stats.last_transaction_at).split(", ")[1] : "No transactions yet",
      color: "#111827",
      iconBg: "#F1F5F9",
      icon: <ScheduleRoundedIcon />,
    },
  ];

  return (
    <Box>
      <Box component={Link} to="/accounts" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, color: "#64748B", fontSize: 14, fontWeight: 600, mb: 2, "&:hover": { color: "#6E0ACE" } }}>
        <ArrowBackRoundedIcon fontSize="small" /> Accounts
      </Box>

      <SectionCard sx={{ mb: 2.5, p: 3 }}>
        <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, minWidth: 0 }}>
            {loadingAccount ? (
              <Skeleton variant="circular" width={56} height={56} />
            ) : (
              <AccountAvatar id={acc?.id} name={acc?.name} size={56} />
            )}
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: { xs: 22, sm: 26 }, fontWeight: 700, color: "#111827" }} noWrap>
                {loadingAccount ? <Skeleton width={200} /> : acc?.name}
              </Typography>
              <Typography sx={{ fontSize: 13, color: "#64748B" }}>
                Account #{accountId} · Opened {formatDateTime(acc?.created_at)}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 3 }}>
            <Box sx={{ textAlign: { xs: "left", md: "right" } }}>
              <Typography sx={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", color: "#64748B" }}>CURRENT BALANCE</Typography>
              <Typography sx={{ fontSize: { xs: 28, sm: 34 }, fontWeight: 800, color: "#6E0ACE", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
                {loadingAccount ? <Skeleton width={180} /> : formatCurrency(acc?.balance)}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              <Button
                variant="contained"
                backgroundColor="#118D57"
                startIcon={<SouthWestRoundedIcon />}
                onClick={() => openModal("transaction", { accountId: Number(accountId), type: "credit" })}
                disabled={!acc}
                sx={{ height: 40 }}>
                Credit
              </Button>
              <Button
                variant="contained"
                backgroundColor="#DC2626"
                startIcon={<NorthEastRoundedIcon />}
                onClick={() => openModal("transaction", { accountId: Number(accountId), type: "debit" })}
                disabled={!acc}
                sx={{ height: 40 }}>
                Debit
              </Button>
              <Button
                startIcon={<SwapHorizRoundedIcon />}
                onClick={() => openModal("transfer", { fromAccountId: Number(accountId) })}
                disabled={!acc}
                sx={{ height: 40 }}>
                Transfer
              </Button>
            </Box>
          </Box>
        </Box>
      </SectionCard>

      <SummaryCards cards={cards} loading={loadingAccount} />

      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", mb: 1.5 }}>
        <Box>
          <Typography sx={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>Transaction History</Typography>
          <TypeTabs
            value={type}
            onChange={(next) => {
              setType(next);
              setPaging((p) => ({ ...p, page: 1 }));
            }}
            tabs={[
              { label: "All", value: "", count: stats?.transaction_count },
              { label: "Credits", value: "credit", count: stats?.credit_count },
              { label: "Debits", value: "debit", count: stats?.debit_count },
            ]}
          />
        </Box>
        {history.data && (
          <Typography sx={{ fontSize: 13, color: "#64748B", mb: 1 }}>
            Page {history.data.pagination.current_page} of {Math.max(history.data.pagination.total_pages, 1)} · latest first
          </Typography>
        )}
      </Box>

      <DataTable
        rows={history.data?.transactions || []}
        columns={columns}
        loading={history.loading}
        page={paging.page}
        pageSize={paging.pageSize}
        rowCount={history.data?.pagination.total_records || 0}
        onPaginationChange={setPaging}
        emptyMessage={type ? `No ${type} transactions for this account` : "No transactions yet — post a credit to fund this account"}
      />
    </Box>
  );
};

export default AccountDetailsPage;
