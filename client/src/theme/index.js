import { createTheme } from "@mui/material";
import palette from "./palette";
import typography from "./typography";

const theme = createTheme({
  palette,
  typography,
  shape: { borderRadius: 8 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: "12px", boxShadow: "none", border: "1px solid #E2E8F0" },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { fontFamily: "DM Sans", borderBottom: "1px solid #F0F3F9" },
        head: { color: "#64748B", fontWeight: 600, fontSize: "0.8rem" },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          backgroundColor: "#FFFFFF",
          "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E2E8F0" },
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#CBD5E1" },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#6E0ACE" },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: { "&.Mui-focused": { color: "#6E0ACE" } },
      },
    },
  },
});

export default theme;
