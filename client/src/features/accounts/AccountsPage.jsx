import { useState } from "react";
import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import DataTable from "@/components/ui/DataTable";
import SearchField from "@/components/ui/SearchField";
import { AccountCell } from "@/components/ui/LedgerBits";
import useApi from "@/hooks/useApi";
import { listAccounts } from "@/services/ledgerService";
import { useStore } from "@/store";
import { formatCurrency, formatDateTime } from "@/utils/format";

const columns = [
  {
    field: "name",
    headerName: "Account Holder",
    minWidth: 240,
    flex: 1.4,
    renderCell: ({ row }) => <AccountCell id={row.id} name={row.name} />,
  },
  {
    field: "balance",
    headerName: "Current Balance",
    minWidth: 170,
    flex: 1,
    align: "right",
    headerAlign: "right",
    renderCell: ({ value }) => (
      <Box sx={{ width: "100%", textAlign: "right" }}>
        <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: value > 0 ? "#14181D" : "#64748B" }}>
          {formatCurrency(value)}
        </Typography>
      </Box>
    ),
  },
  {
    field: "created_at",
    headerName: "Created On",
    minWidth: 190,
    flex: 1,
    renderCell: ({ value }) => <Typography sx={{ fontSize: "0.85rem" }}>{formatDateTime(value)}</Typography>,
  },
  {
    field: "updated_at",
    headerName: "Last Activity",
    minWidth: 190,
    flex: 1,
    renderCell: ({ value }) => <Typography sx={{ fontSize: "0.85rem", color: "#455468" }}>{formatDateTime(value)}</Typography>,
  },
  {
    field: "action",
    headerName: "",
    width: 110,
    align: "right",
    renderCell: () => (
      <Box sx={{ display: "flex", alignItems: "center", color: "#6E0ACE", fontWeight: 600, fontSize: 13 }}>
        View <ChevronRightRoundedIcon fontSize="small" />
      </Box>
    ),
  },
];

const AccountsPage = () => {
  const navigate = useNavigate();
  const openModal = useStore((s) => s.openModal);
  const [search, setSearch] = useState("");
  const [paging, setPaging] = useState({ page: 1, pageSize: 10 });

  const { data, loading } = useApi(
    () => listAccounts({ page: paging.page, limit: paging.pageSize, search }),
    [paging.page, paging.pageSize, search],
  );

  return (
    <Box>
      <PageHeader
        title="Accounts"
        subtitle={`${data?.pagination.total_records ?? 0} accounts in the ledger`}
        actions={
          <Button variant="contained" startIcon={<PersonAddAltOutlinedIcon />} onClick={() => openModal("account")} sx={{ height: 40 }}>
            Create Account
          </Button>
        }
      />

      <Box sx={{ display: "flex", gap: 1.5, mb: 2 }}>
        <SearchField
          value={search}
          placeholder="Search by account holder name or account ID"
          onSearch={(value) => {
            setSearch(value);
            setPaging((p) => ({ ...p, page: 1 }));
          }}
          sx={{ maxWidth: 480 }}
        />
      </Box>

      <DataTable
        rows={data?.accounts || []}
        columns={columns}
        loading={loading}
        page={paging.page}
        pageSize={paging.pageSize}
        rowCount={data?.pagination.total_records || 0}
        onPaginationChange={setPaging}
        onRowClick={(row) => navigate(`/accounts/${row.id}`)}
        emptyMessage={search ? "No accounts match your search" : "No accounts yet — create the first one"}
      />
    </Box>
  );
};

export default AccountsPage;
