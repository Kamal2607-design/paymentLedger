import { Box, Typography } from "@mui/material";

const PageHeader = ({ title, subtitle, actions, children }) => (
  <Box
    sx={{
      display: "flex",
      flexWrap: "wrap",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 2,
      mb: 2.5,
    }}>
    <Box sx={{ minWidth: 0 }}>
      <Typography sx={{ fontSize: { xs: 24, sm: 28 }, fontWeight: 700, color: "#111827" }}>{title}</Typography>
      {subtitle && (
        <Typography variant="body2" sx={{ color: "#64748B", mt: 0.5 }}>
          {subtitle}
        </Typography>
      )}
      {children}
    </Box>
    {actions && <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1 }}>{actions}</Box>}
  </Box>
);

export default PageHeader;
