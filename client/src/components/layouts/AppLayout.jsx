import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import Header, { HEADER_HEIGHT } from "./Header";
import SideBar from "./SideBar";
import GlobalModals from "./GlobalModals";

const AppLayout = () => (
  <Box sx={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
    <Box sx={{ flexShrink: 0, position: "sticky", top: 0, zIndex: 1000 }}>
      <Header />
    </Box>
    <Box sx={{ display: "flex", flex: 1, minHeight: 0, height: `calc(100vh - ${HEADER_HEIGHT}px)` }}>
      <Box sx={{ position: "relative", zIndex: 100 }}>
        <SideBar />
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          overflowY: "auto",
          overflowX: "hidden",
          backgroundColor: "#F1F5F9",
          p: { xs: 2, md: 3 },
        }}>
        <Outlet />
      </Box>
    </Box>
    <GlobalModals />
  </Box>
);

export default AppLayout;
