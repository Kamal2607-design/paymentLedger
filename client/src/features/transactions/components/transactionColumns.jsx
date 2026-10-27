import { Box, Tooltip, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import SwapHorizRoundedIcon from "@mui/icons-material/SwapHorizRounded";
import { AccountCell, SignedAmount, TypeChip } from "@/components/ui/LedgerBits";
import { formatCurrency, formatDateTime } from "@/utils/format";

const muted = { fontSize: "0.8rem", color: "#64748B" };

export const buildTransactionColumns = ({ showAccount = false } = {}) => [
  {
    field: "id",
    headerName: "Txn ID",
    width: 90,
    renderCell: ({ value }) => <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: "#455468" }}>#{value}</Typography>,
  },
  {
    field: "created_at",
    headerName: "Date & Time",
    minWidth: 170,
    flex: 0.8,
    renderCell: ({ value }) => <Typography sx={{ fontSize: "0.85rem" }}>{formatDateTime(value)}</Typography>,
  },
  ...(showAccount
    ? [
        {
          field: "account",
          headerName: "Account",
          minWidth: 190,
          flex: 1,
          renderCell: ({ row }) => (
            <Box component={Link} to={`/accounts/${row.account_id}`} onClick={(e) => e.stopPropagation()} sx={{ minWidth: 0, height: "100%" }}>
              <AccountCell id={row.account_id} name={row.account?.name} size={30} />
            </Box>
          ),
        },
      ]
    : []),
  {
    field: "reference_id",
    headerName: "Reference ID",
    minWidth: 170,
    flex: 0.9,
    renderCell: ({ row }) => (
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, minWidth: 0 }}>
        {row.transfer_id && (
          <Tooltip title={`Part of transfer #${row.transfer_id}`}>
            <SwapHorizRoundedIcon sx={{ fontSize: 18, color: "#6E0ACE" }} />
          </Tooltip>
        )}
        <Typography sx={{ fontSize: "0.85rem", fontFamily: "monospace" }} noWrap title={row.reference_id}>
          {row.reference_id}
        </Typography>
      </Box>
    ),
  },
  {
    field: "description",
    headerName: "Description",
    minWidth: 180,
    flex: 1.2,
    renderCell: ({ value }) => (
      <Typography sx={value ? { fontSize: "0.85rem" } : muted} noWrap title={value || ""}>
        {value || "—"}
      </Typography>
    ),
  },
  {
    field: "type",
    headerName: "Type",
    width: 110,
    renderCell: ({ value }) => <TypeChip type={value} />,
  },
  {
    field: "amount",
    headerName: "Amount",
    minWidth: 140,
    flex: 0.7,
    align: "right",
    headerAlign: "right",
    renderCell: ({ row }) => (
      <Box sx={{ width: "100%", textAlign: "right" }}>
        <SignedAmount type={row.type} amount={row.amount} />
      </Box>
    ),
  },
  {
    field: "balance_after",
    headerName: "Balance After",
    minWidth: 140,
    flex: 0.7,
    align: "right",
    headerAlign: "right",
    renderCell: ({ value }) => (
      <Box sx={{ width: "100%", textAlign: "right" }}>
        <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: "#455468" }}>{formatCurrency(value)}</Typography>
      </Box>
    ),
  },
];
