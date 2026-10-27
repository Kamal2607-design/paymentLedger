import { Box, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const NoRows = ({ message }) => (
  <Box sx={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1, py: 6 }}>
    <ReceiptLongOutlinedIcon sx={{ fontSize: 40, color: "#CBD5E1" }} />
    <Typography sx={{ color: "#64748B", fontWeight: 500 }}>{message}</Typography>
  </Box>
);

/**
 * Server-paginated DataGrid with the CRM payments table styling.
 * `page` is 1-based to match the API; DataGrid itself is 0-based.
 */
const DataTable = ({
  rows,
  columns,
  loading,
  page,
  pageSize,
  rowCount,
  onPaginationChange,
  onRowClick,
  emptyMessage = "No records found",
}) => (
  <Box sx={{ width: "100%", backgroundColor: "#FFFFFF", borderRadius: "12px" }}>
    <DataGrid
      rows={rows}
      columns={columns}
      loading={loading}
      autoHeight
      rowHeight={56}
      paginationMode="server"
      rowCount={rowCount}
      paginationModel={{ page: page - 1, pageSize }}
      onPaginationModelChange={(model) => onPaginationChange({ page: model.page + 1, pageSize: model.pageSize })}
      pageSizeOptions={PAGE_SIZE_OPTIONS}
      onRowClick={onRowClick ? (params) => onRowClick(params.row) : undefined}
      disableRowSelectionOnClick
      disableColumnMenu
      disableColumnSorting
      slots={{ noRowsOverlay: () => <NoRows message={emptyMessage} /> }}
      sx={{
        border: "1px solid #E9EFF6",
        borderRadius: "12px",
        fontFamily: "DM Sans, sans-serif",
        "--DataGrid-overlayHeight": "220px",
        "& .MuiDataGrid-columnHeaders, & .MuiDataGrid-columnHeader": { backgroundColor: "#FFFFFF" },
        "& .MuiDataGrid-columnHeaderTitle": { fontWeight: 600, color: "#64748B", fontSize: "0.8rem" },
        "& .MuiDataGrid-columnHeader:not(:last-child)": { borderRight: "1px solid #F0F3F9" },
        "& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within": { outline: "none" },
        "& .MuiDataGrid-cell": {
          borderBottom: "1px solid #F0F3F9",
          color: "#14181D",
          display: "flex",
          alignItems: "center",
        },
        "& .MuiDataGrid-row:hover": {
          backgroundColor: "rgba(110, 10, 206, 0.04)",
          cursor: onRowClick ? "pointer" : "default",
        },
        "& .MuiDataGrid-footerContainer": { borderTop: "1px solid #F0F3F9" },
      }}
    />
  </Box>
);

export default DataTable;
