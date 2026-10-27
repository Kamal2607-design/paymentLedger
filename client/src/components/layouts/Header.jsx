import { useEffect, useState } from "react";
import { Avatar, Box, Typography } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import Button from "@/components/ui/Button";
import { getHealth } from "@/services/ledgerService";
import { useStore } from "@/store";

export const HEADER_HEIGHT = 72;

const statusDotSx = (online) => ({
  width: 8,
  height: 8,
  borderRadius: "50%",
  backgroundColor: online ? "#118D57" : "#DC2626",
  boxShadow: online ? "0 0 0 3px #D1FAE5" : "0 0 0 3px #FEE2E2",
});

const Header = () => {
  const openModal = useStore((s) => s.openModal);
  const [online, setOnline] = useState(null);

  useEffect(() => {
    let active = true;
    const check = () =>
      getHealth()
        .then(() => active && setOnline(true))
        .catch(() => active && setOnline(false));
    check();
    const id = setInterval(check, 30000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  return (
    <Box
      sx={{
        height: HEADER_HEIGHT,
        px: 3,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#FFFFFF",
        borderBottom: "2px solid #f0f3f9",
      }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box component="img" src="/logo.svg" alt="" sx={{ width: 36, height: 36 }} />
        <Box>
          <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#111827", lineHeight: 1.1 }}>
            Payment Ledger
          </Typography>
          <Typography sx={{ fontSize: 12, color: "#64748B" }}>Accounts, transactions & transfers</Typography>
        </Box>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        {online !== null && (
          <Box
            sx={{
              display: { xs: "none", sm: "inline-flex" },
              alignItems: "center",
              gap: 1,
              px: 1.5,
              height: 32,
              borderRadius: "999px",
              border: "1px solid #E9EFF6",
              fontSize: 12,
              fontWeight: 600,
              color: online ? "#118D57" : "#DC2626",
            }}>
            <Box sx={statusDotSx(online)} />
            {online ? "API connected" : "API offline"}
          </Box>
        )}
        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={() => openModal("transaction")}
          sx={{ height: 40, display: { xs: "none", md: "inline-flex" } }}>
          New Transaction
        </Button>
        <Avatar sx={{ width: 38, height: 38, bgcolor: "#F8F0FF", color: "#6E0ACE", fontWeight: 700, fontSize: 15 }}>
          AD
        </Avatar>
      </Box>
    </Box>
  );
};

export default Header;
