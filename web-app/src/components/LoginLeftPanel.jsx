import { Box, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import bg1 from "../assets/images/bg1.jpg";
import bg2 from "../assets/images/bg2.jpg";
import bg3 from "../assets/images/bg3.jpg";

export default function LoginLeftPanel({ variant = "login" }) {
  const images = [bg1, bg2, bg3];

  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <Box
      sx={{
        display: { xs: "none", md: "flex" },
        position: "relative",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        color: "white",
      }}
    >
      {/* Slideshow */}
      {images.map((img) => (
        <Box
          key={img}
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${img})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: img === images[bgIndex] ? 1 : 0,
            transition: "opacity 1.5s ease-in-out",
          }}
        />
      ))}

      {/* Gradient overlay */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6))",
          zIndex: 0,
        }}
      />

      {/* Purple tint overlay */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: "rgba(60, 20, 120, 0.5)",
          zIndex: 1,
        }}
      />

      {/* Content */}
      <Box
        sx={{
          textAlign: "center",
          px: 6,
          position: "relative",
          zIndex: 2,
        }}
      >
        <Typography
          variant="h1"
          sx={{
            fontWeight: 800,
            letterSpacing: 0.5,
            textShadow: "0px 4px 20px rgba(0,0,0,0.7)",
          }}
        >
          Friendify
        </Typography>

        <Typography sx={{ opacity: 0.9, mt: 2 }} variant="h6">
          {variant === "login"
            ? "Đăng nhập để kết nối với bạn bè và chia sẻ khoảnh khắc."
            : "Tạo tài khoản và tham gia cộng đồng."}
        </Typography>
      </Box>
    </Box>
  );
}
