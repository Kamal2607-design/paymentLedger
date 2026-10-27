import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import SpaceDashboardOutlinedIcon from "@mui/icons-material/SpaceDashboardOutlined";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import SwapHorizOutlinedIcon from "@mui/icons-material/SwapHorizOutlined";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import theme from "@/theme";
import { useStore } from "@/store";

const MENU_ITEMS = [
  { text: "Dashboard", route: "/dashboard", icon: SpaceDashboardOutlinedIcon },
  { text: "Accounts", route: "/accounts", icon: AccountBalanceOutlinedIcon },
  { text: "Transactions", route: "/transactions", icon: ReceiptLongOutlinedIcon },
  { text: "Transfers", route: "/transfers", icon: SwapHorizOutlinedIcon },
];

const SideBar = () => {
  const location = useLocation();
  const collapsed = useStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useStore((s) => s.toggleSidebar);

  return (
    <>
      <Box
        onClick={toggleSidebar}
        sx={{
          position: "absolute",
          top: "1.5rem",
          right: "-12.5px",
          width: 25,
          height: 25,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          background: "#fff",
          boxShadow: "0px 0px 6px rgb(194, 143, 242)",
          borderRadius: "50px",
          zIndex: 110,
          "&:hover": { backgroundColor: theme.palette.primary.main, "& svg": { color: "#fff" } },
        }}>
        {collapsed ? (
          <ChevronRightIcon fontSize="small" sx={{ color: "black" }} />
        ) : (
          <ChevronLeftIcon fontSize="small" sx={{ color: "black" }} />
        )}
      </Box>

      <Box
        sx={{
          height: "100%",
          width: collapsed ? 70 : 240,
          backgroundColor: "#fff",
          transition: "width 0.3s ease",
          overflowY: "auto",
          overflowX: "hidden",
          borderRight: `2px solid ${theme.palette.lightGrey}`,
        }}>
        <List sx={{ mt: "20px", p: collapsed ? "20px 10px" : "20px 8px", transition: "padding 0.3s ease" }}>
          {MENU_ITEMS.map(({ text, route, icon: Icon }) => {
            const isActive = location.pathname === route || location.pathname.startsWith(`${route}/`);
            return (
              <ListItem key={text} disablePadding sx={{ display: "block", mb: "8px" }}>
                <ListItemButton
                  disableRipple
                  component={Link}
                  to={route}
                  title={collapsed ? text : undefined}
                  sx={{
                    justifyContent: collapsed ? "center" : "initial",
                    borderRadius: "8px",
                    px: 2,
                    backgroundColor: isActive ? "#F8F0FF" : "transparent",
                    "&:hover": { backgroundColor: "#F8F0FF" },
                  }}>
                  <ListItemIcon sx={{ minWidth: 0, mr: collapsed ? 0 : 2 }}>
                    <Icon sx={{ fontSize: 24, color: "#6e0ace" }} />
                  </ListItemIcon>
                  {!collapsed && (
                    <ListItemText
                      primary={text}
                      slotProps={{
                        primary: {
                          sx: {
                            ...theme.typography.subtitle3,
                            color: isActive ? theme.palette.primary.medium : theme.palette.text.primary,
                            fontWeight: isActive ? 600 : 500,
                          },
                        },
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>
    </>
  );
};

export default SideBar;
