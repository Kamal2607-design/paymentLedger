import { GlobalStyles as MuiGlobalStyles } from "@mui/material";

const GlobalStyles = () => (
  <MuiGlobalStyles
    styles={{
      "*, *::before, *::after": { boxSizing: "border-box", padding: 0, margin: 0 },
      html: { fontSize: "100%", fontFamily: '"DM Sans", sans-serif' },
      body: { fontSize: "inherit", backgroundColor: "#F1F5F9", color: "#14181D" },
      a: { color: "inherit", textDecoration: "none" },
    }}
  />
);

export default GlobalStyles;
