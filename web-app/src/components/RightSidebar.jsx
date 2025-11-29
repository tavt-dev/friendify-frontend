import React from "react";
import { Box } from "@mui/material";
import { alpha } from "@mui/material/styles";
import ChatWidget from "./ChatWidget";

export default function RightSidebar() {
  return (
    <Box
      sx={{
        width: "100%",
        position: "sticky",
        top: 80,
        alignSelf: "flex-start",
        maxHeight: "calc(100vh - 96px)",
        overflowY: "auto",
        overflowX: "hidden",
        "&::-webkit-scrollbar": {
          width: "6px",
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: (t) => alpha(t.palette.text.primary, 0.2),
          borderRadius: 3,
        },
        "&::-webkit-scrollbar-track": {
          backgroundColor: "transparent",
        },
      }}
    >
      <ChatWidget />
    </Box>
  );
}
