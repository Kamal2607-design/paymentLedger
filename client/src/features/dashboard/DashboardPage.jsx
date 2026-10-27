import { Box, Skeleton, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import SouthWestRoundedIcon from "@mui/icons-material/SouthWestRounded";
import NorthEastRoundedIcon from "@mui/icons-material/NorthEastRounded";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import SwapHorizRoundedIcon from "@mui/icons-material/SwapHorizRounded";
import PageHeader from "@/components/ui/PageHeader";
import SummaryCards from "@/components/ui/SummaryCards";
import Button from "@/components/ui/Button";
import { AccountCell, SectionCard, SignedAmount, TypeChip } from "@/components/ui/LedgerBits";
import useApi from "@/hooks/useApi";
import { getDashboardSummary } from "@/services/ledgerService";
import { useStore } from "@/store";
import { formatCurrency, formatDateTime, tzOffsetMinutes } from "@/utils/format";
import VolumeChart from "./components/VolumeChart";

const linkSx = { fontSize: 13, fontWeight: 600, color: "#6E0ACE" };

const DashboardPage = () => {
  const navigate = useNavigate();
  const openModal = useStore((s) => s.openModal);
  const { data, loading } = useApi(() => getDashboardSummary(tzOffsetMinutes()), []);

  const cards = [
    {
      label: "TOTAL BALANCE",
      value: formatCurrency(data?.total_balance),
      caption: "Across all accounts",
      color: "#6E0ACE",
      icon: <AccountBalanceWalletOutlinedIcon />,
    },
    {
      label: "ACCOUNTS",
      value: data?.total_accounts ?? 0,
      caption: `${data?.transfer_count ?? 0} transfers completed`,
      color: "#0351AB",
      iconBg: "#E6F6FF",
      icon: <GroupsOutlinedIcon />,
    },
    {
      label: "TOTAL CREDITS",
      value: formatCurrency(data?.total_credit),
      caption: `${data?.credit_count ?? 0} credit transactions`,
      color: "#118D57",
      iconBg: "rgba(34, 197, 94, 0.15)",
      icon: <SouthWestRoundedIcon />,
    },
    {
      label: "TOTAL DEBITS",
      value: formatCurrency(data?.total_debit),
      caption: `${data?.debit_count ?? 0} debit transactions`,
      color: "#DC2626",
      iconBg: "#FEE2E2",
      icon: <NorthEastRoundedIcon />,
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of balances and ledger activity"
        actions={
          <>
            <Button startIcon={<PersonAddAltOutlinedIcon />} onClick={() => openModal("account")} sx={{ height: 40 }}>
              New Account
            </Button>
            <Button startIcon={<SwapHorizRoundedIcon />} onClick={() => openModal("transfer")} sx={{ height: 40 }}>
              Transfer
            </Button>
          </>
        }
      />

      <SummaryCards cards={cards} loading={loading && !data} />

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 2fr) minmax(0, 1fr)" }, gap: 2.5, mb: 2.5 }}>
        <SectionCard title="Credits vs Debits — last 14 days">
          <VolumeChart data={data?.daily_volume} loading={loading} />
        </SectionCard>

        <SectionCard title="Top Accounts" action={<Box component={Link} to="/accounts" sx={linkSx}>View all</Box>}>
          {loading && !data
            ? [...Array(5)].map((_, i) => <Skeleton key={i} height={52} />)
            : (data?.top_accounts || []).map((account) => (
                <Box
                  key={account.id}
                  onClick={() => navigate(`/accounts/${account.id}`)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1,
                    py: 1.25,
                    px: 1,
                    mx: -1,
                    borderRadius: "8px",
                    cursor: "pointer",
                    "&:hover": { backgroundColor: "#F8F0FF" },
                  }}>
                  <AccountCell id={account.id} name={account.name} />
                  <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#14181D" }}>{formatCurrency(account.balance)}</Typography>
                </Box>
              ))}
          {data && !data.top_accounts.length && (
            <Typography sx={{ color: "#64748B", py: 4, textAlign: "center" }}>No accounts yet</Typography>
          )}
        </SectionCard>
      </Box>

      <SectionCard
        title="Recent Transactions"
        action={<Box component={Link} to="/transactions" sx={linkSx}>View ledger</Box>}
        sx={{ p: 0, "& > div:first-of-type": { px: 2.5, pt: 2.5 } }}>
        <Box sx={{ overflowX: "auto" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ pl: 2.5 }}>Date</TableCell>
                <TableCell>Account</TableCell>
                <TableCell>Reference</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right" sx={{ pr: 2.5 }}>
                  Amount
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(data?.recent_transactions || []).map((tx) => (
                <TableRow
                  key={tx.id}
                  hover
                  onClick={() => navigate(`/accounts/${tx.account_id}`)}
                  sx={{ cursor: "pointer", "&:last-child td": { borderBottom: 0 } }}>
                  <TableCell sx={{ pl: 2.5, whiteSpace: "nowrap", fontSize: 13 }}>{formatDateTime(tx.created_at)}</TableCell>
                  <TableCell sx={{ py: 1.25 }}>
                    <AccountCell id={tx.account_id} name={tx.account?.name} size={28} />
                  </TableCell>
                  <TableCell sx={{ fontFamily: "monospace", fontSize: 13 }}>{tx.reference_id}</TableCell>
                  <TableCell>
                    <TypeChip type={tx.type} />
                  </TableCell>
                  <TableCell align="right" sx={{ pr: 2.5, whiteSpace: "nowrap" }}>
                    <SignedAmount type={tx.type} amount={tx.amount} />
                  </TableCell>
                </TableRow>
              ))}
              {data && !data.recent_transactions.length && (
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: "center", py: 5, color: "#64748B", borderBottom: 0 }}>
                    No transactions yet — create an account and post a credit to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
      </SectionCard>
    </Box>
  );
};

export default DashboardPage;
