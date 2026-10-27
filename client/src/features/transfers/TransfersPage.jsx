import { useState } from "react";
import { Box, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import SwapHorizRoundedIcon from "@mui/icons-material/SwapHorizRounded";
import EastRoundedIcon from "@mui/icons-material/EastRounded";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import DataTable from "@/components/ui/DataTable";
import AccountPicker from "@/components/ui/AccountPicker";
import { AccountCell } from "@/components/ui/LedgerBits";
import useApi from "@/hooks/useApi";
import { listTransfers } from "@/services/ledgerService";
import { useStore } from "@/store";
import { formatCurrency, formatDateTime } from "@/utils/format";

const AccountLink = ({ account }) => (
  <Box component={Link} to={`/accounts/${account.id}`} sx={{ minWidth: 0, height: "100%" }}>
    <AccountCell id={account.id} name={account.name} size={30} />
  </Box>
);

const columns = [
  {
    field: "id",
    headerName: "Transfer ID",
    width: 110,
    renderCell: ({ value }) => <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: "#455468" }}>#{value}</Typography>,
  },
  {
    field: "created_at",
    headerName: "Date & Time",
    minWidth: 170,
    flex: 0.8,
    renderCell: ({ value }) => <Typography sx={{ fontSize: "0.85rem" }}>{formatDateTime(value)}</Typography>,
  },
  {
    field: "fromAccount",
    headerName: "From",
    minWidth: 180,
    flex: 1,
    renderCell: ({ row }) => <AccountLink account={row.fromAccount} />,
  },
  {
    field: "arrow",
    headerName: "",
    width: 50,
    renderCell: () => <EastRoundedIcon sx={{ color: "#AFBACA" }} />,
  },
  {
    field: "toAccount",
    headerName: "To",
    minWidth: 180,
    flex: 1,
    renderCell: ({ row }) => <AccountLink account={row.toAccount} />,
  },
  {
    field: "reference_id",
    headerName: "Reference ID",
    minWidth: 170,
    flex: 0.9,
    renderCell: ({ value }) => (
      <Typography sx={{ fontSize: "0.85rem", fontFamily: "monospace" }} noWrap title={value}>
        {value}
      </Typography>
    ),
  },
  {
    field: "description",
    headerName: "Description",
    minWidth: 160,
    flex: 1,
    renderCell: ({ value }) => (
      <Typography sx={{ fontSize: "0.85rem", color: value ? "#14181D" : "#64748B" }} noWrap title={value || ""}>
        {value || "—"}
      </Typography>
    ),
  },
  {
    field: "amount",
    headerName: "Amount",
    minWidth: 140,
    flex: 0.7,
    align: "right",
    headerAlign: "right",
    renderCell: ({ value }) => (
      <Box sx={{ width: "100%", textAlign: "right" }}>
        <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: "#6E0ACE" }}>{formatCurrency(value)}</Typography>
      </Box>
    ),
  },
];

const TransfersPage = () => {
  const openModal = useStore((s) => s.openModal);
  const [account, setAccount] = useState(null);
  const [paging, setPaging] = useState({ page: 1, pageSize: 10 });

  const { data, loading } = useApi(
    () => listTransfers({ account_id: account?.id, page: paging.page, limit: paging.pageSize }),
    [account?.id, paging.page, paging.pageSize],
  );

  return (
    <Box>
      <PageHeader
        title="Transfers"
        subtitle="Money moved between accounts. Each transfer posts a debit and a matching credit atomically."
        actions={
          <Button variant="contained" startIcon={<SwapHorizRoundedIcon />} onClick={() => openModal("transfer")} sx={{ height: 40 }}>
            New Transfer
          </Button>
        }
      />

      <Box sx={{ width: { xs: "100%", sm: 300 }, mb: 2 }}>
        <AccountPicker
          label="Filter by account"
          size="small"
          value={account}
          onChange={(next) => {
            setAccount(next);
            setPaging((p) => ({ ...p, page: 1 }));
          }}
        />
      </Box>

      <DataTable
        rows={data?.transfers || []}
        columns={columns}
        loading={loading}
        page={paging.page}
        pageSize={paging.pageSize}
        rowCount={data?.pagination.total_records || 0}
        onPaginationChange={setPaging}
        emptyMessage="No transfers yet"
      />
    </Box>
  );
};

export default TransfersPage;
