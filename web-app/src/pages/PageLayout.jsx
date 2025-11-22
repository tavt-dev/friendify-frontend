import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Toolbar from "@mui/material/Toolbar";
import { alpha, useTheme } from "@mui/material/styles";
import Header from "../components/Header";
import SideMenu from "../components/SideMenu";
import MobileBottomNav from "../components/MobileBottomNav";
import { useColorMode } from "../contexts/ThemeContext";

const drawerWidth = 300;

function PageLayout({ children }) {
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
          width: "100%",
          overflow: "hidden",
          position: "relative",
          maxWidth: "100vw",
          ml: 0,
          pl: 0,
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          background: theme.palette.mode === "dark"
            ? `radial-gradient(circle at 15% 25%, ${alpha(theme.palette.primary.main, 0.08)} 0%, transparent 50%),
               radial-gradient(circle at 85% 75%, ${alpha(theme.palette.secondary.main, 0.08)} 0%, transparent 50%)`
            : `radial-gradient(circle at 15% 25%, ${alpha(theme.palette.primary.main, 0.04)} 0%, transparent 50%),
               radial-gradient(circle at 85% 75%, ${alpha(theme.palette.secondary.main, 0.04)} 0%, transparent 50%)`,
          pointerEvents: "none",
          zIndex: 0,
        },
      }}
    >
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: "100%",
          left: 0,
          right: 0,
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
            ? `0 4px 24px rgba(0, 0, 0, 0.4), 0 1px 0 ${alpha(theme.palette.primary.main, 0.1)}`
            : `0 4px 24px rgba(0, 0, 0, 0.08), 0 1px 0 ${alpha(theme.palette.primary.main, 0.05)}`,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
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

      <Box sx={{ display: "flex", flexDirection: "row", flex: "1 1 auto", minHeight: 0, position: "relative", zIndex: 1, ml: 0 }}>
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
                backgroundImage: theme.palette.mode === "dark"
                  ? `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0.98)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`
                  : `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0.98)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
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
                top: "64px",
                height: "calc(100vh - 64px)",
                left: 0,
                position: "fixed",
                backgroundImage: theme.palette.mode === "dark"
                  ? `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%),
                     radial-gradient(circle at 50% 0%, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 70%)`
                  : `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%),
                     radial-gradient(circle at 50% 0%, ${alpha(theme.palette.primary.main, 0.025)} 0%, transparent 70%)`,
                boxShadow: theme.palette.mode === "dark"
                  ? `4px 0 24px rgba(0, 0, 0, 0.3), inset -1px 0 0 ${alpha(theme.palette.primary.main, 0.08)}`
                  : `4px 0 24px rgba(0, 0, 0, 0.05), inset -1px 0 0 ${alpha(theme.palette.primary.main, 0.04)}`,
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
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
            width: "100%",
            ml: 0,
            minHeight: 0,
            position: "relative",
            pl: 0,
          }}
        >
          <Toolbar />

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-start",
              width: "100%",
              flex: "1 1 auto",
              minHeight: 0,
              pl: 0,
              pr: { xs: 1, md: 1 },
              py: { xs: 2, md: 2 },
              pb: { xs: 10, md: 2 },
              overflowY: "auto",
              overflowX: "hidden",
              position: "relative",
              "&::-webkit-scrollbar": {
                width: "8px",
              },
              "&::-webkit-scrollbar-track": {
                background: "transparent",
              },
              "&::-webkit-scrollbar-thumb": {
                background: theme.palette.mode === "dark"
                  ? alpha(theme.palette.primary.main, 0.3)
                  : alpha(theme.palette.primary.main, 0.2),
                borderRadius: "4px",
                transition: "background 0.3s ease",
                "&:hover": {
                  background: theme.palette.mode === "dark"
                    ? alpha(theme.palette.primary.main, 0.5)
                    : alpha(theme.palette.primary.main, 0.35),
                },
              },
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

export default PageLayout;
