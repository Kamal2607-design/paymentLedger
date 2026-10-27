import { useState } from "react";
import { Box } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import TypeTabs from "@/components/ui/TypeTabs";
import DataTable from "@/components/ui/DataTable";
import SearchField from "@/components/ui/SearchField";
import AccountPicker from "@/components/ui/AccountPicker";
import useApi from "@/hooks/useApi";
import { getDashboardSummary, listTransactions } from "@/services/ledgerService";
import { useStore } from "@/store";
import { tzOffsetMinutes } from "@/utils/format";
import { buildTransactionColumns } from "./components/transactionColumns";

const columns = buildTransactionColumns({ showAccount: true });

const TransactionsPage = () => {
  const openModal = useStore((s) => s.openModal);
  const [type, setType] = useState("");
  const [search, setSearch] = useState("");
  const [account, setAccount] = useState(null);
  const [paging, setPaging] = useState({ page: 1, pageSize: 25 });

  const resetPage = () => setPaging((p) => ({ ...p, page: 1 }));

  const { data, loading } = useApi(
    () => listTransactions({ type, search, account_id: account?.id, page: paging.page, limit: paging.pageSize }),
    [type, search, account?.id, paging.page, paging.pageSize],
  );
  const summary = useApi(() => getDashboardSummary(tzOffsetMinutes()), []);
  // Global counts only describe the unfiltered ledger.
  const showCounts = !search && !account;

  return (
    <Box>
      <PageHeader
        title="Transactions"
        subtitle="Complete ledger of every credit and debit, latest first"
        actions={
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => openModal("transaction")} sx={{ height: 40 }}>
            New Transaction
          </Button>
        }>
        <TypeTabs
          value={type}
          onChange={(next) => {
            setType(next);
            resetPage();
          }}
          tabs={[
            { label: "All", value: "", count: showCounts ? summary.data?.transaction_count : undefined },
            { label: "Credits", value: "credit", count: showCounts ? summary.data?.credit_count : undefined },
            { label: "Debits", value: "debit", count: showCounts ? summary.data?.debit_count : undefined },
          ]}
        />
      </PageHeader>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mb: 2 }}>
        <Box sx={{ width: { xs: "100%", sm: 300 } }}>
          <AccountPicker
            label="Filter by account"
            size="small"
            value={account}
            onChange={(next) => {
              setAccount(next);
              resetPage();
            }}
          />
        </Box>
        <SearchField
          value={search}
          placeholder="Search reference ID, description or account name"
          onSearch={(value) => {
            setSearch(value);
            resetPage();
          }}
        />
      </Box>

      <DataTable
        rows={data?.transactions || []}
        columns={columns}
        loading={loading}
        page={paging.page}
        pageSize={paging.pageSize}
        rowCount={data?.pagination.total_records || 0}
        onPaginationChange={setPaging}
        emptyMessage="No transactions match the current filters"
      />
    </Box>
  );
};

export default TransactionsPage;
