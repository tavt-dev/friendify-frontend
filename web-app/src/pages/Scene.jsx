// src/pages/Scene.jsx  (CHỈNH SỬA)
import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Toolbar from "@mui/material/Toolbar";
import { alpha, useTheme } from "@mui/material/styles";
import Header from "../components/Header";
import SideMenu from "../components/SideMenu";
import MobileBottomNav from "../components/MobileBottomNav";
import { useColorMode } from "../contexts/ThemeContext";

const drawerWidth = 300;

function Scene({ children }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);
  const theme = useTheme();

  const { mode, toggleColorMode } = useColorMode();

  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };
  const handleDrawerTransitionEnd = () => setIsClosing(false);
  const handleDrawerToggle = () => {
    if (!isClosing) setMobileOpen((prev) => !prev);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
        color: "text.primary",
        height: "100vh",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          ml: { lg: `${drawerWidth}px` },
          zIndex: theme.zIndex.drawer + 1,
          bgcolor:
            theme.palette.mode === "dark"
              ? alpha(theme.palette.grey[900], 0.85)
              : alpha(theme.palette.background.paper, 0.9),
          backdropFilter: "saturate(180%) blur(20px)",
          borderBottom: "1px solid",
          borderColor: "divider",
          color: "inherit",
          boxShadow: theme.palette.mode === "dark"
            ? "0 4px 24px rgba(0, 0, 0, 0.4)"
            : "0 4px 24px rgba(0, 0, 0, 0.08)",
        }}
      >
        <Toolbar sx={{ minHeight: 64 }}>
          <Header
            isDarkMode={mode === "dark"}
            onToggleTheme={toggleColorMode}
            onMenuClick={handleDrawerToggle}
          />
        </Toolbar>
      </AppBar>

      <Box sx={{ display: "flex", flexDirection: "row", flex: "1 1 auto", minHeight: 0 }}>
        <Box component="nav" sx={{ width: { lg: drawerWidth }, flexShrink: { lg: 0 } }} aria-label="side menu">
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onTransitionEnd={handleDrawerTransitionEnd}
            onClose={handleDrawerClose}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: "block", lg: "none" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: drawerWidth,
                bgcolor: "background.paper",
                borderRight: "1px solid",
                borderColor: "divider",
                boxShadow: theme.palette.mode === "dark"
                  ? "4px 0 24px rgba(0, 0, 0, 0.5)"
                  : "4px 0 24px rgba(0, 0, 0, 0.1)",
              },
            }}
          >
            <SideMenu onNavigate={handleDrawerClose} />
          </Drawer>

          <Drawer
            variant="permanent"
            sx={{
              display: { xs: "none", lg: "block" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: drawerWidth,
                bgcolor: "background.paper",
                borderRight: "1px solid",
                borderColor: "divider",
                backgroundImage: theme.palette.mode === "dark"
                  ? "linear-gradient(180deg, rgba(28, 30, 36, 0.95) 0%, rgba(28, 30, 36, 1) 100%)"
                  : "linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 1) 100%)",
                boxShadow: theme.palette.mode === "dark"
                  ? "4px 0 24px rgba(0, 0, 0, 0.3)"
                  : "4px 0 24px rgba(0, 0, 0, 0.05)",
              },
            }}
            open
          >
            <SideMenu />
          </Drawer>
        </Box>

        <Box
          component="main"
          sx={{
            flex: "1 1 auto",
            display: "flex",
            flexDirection: "column",
            width: { lg: `calc(100% - ${drawerWidth}px)` },
            minHeight: 0,
            position: "relative",
          }}
        >
          <Toolbar />

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              width: "100%",
              flex: "1 1 auto",
              minHeight: 0,
              px: { xs: 2, md: 3 },
              py: { xs: 2, md: 3 },
              pb: { xs: 10, md: 3 },
              overflowY: "auto",
              overflowX: "hidden",
              position: "relative",
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>

      <MobileBottomNav />
    </Box>
  );
}

export default Scene;
