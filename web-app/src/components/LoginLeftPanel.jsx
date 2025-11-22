import { Box, Typography, Fade, Zoom } from "@mui/material";
import { useEffect, useState, useRef, useCallback } from "react";
import bg1 from "../assets/images/bg1.jpg";
import bg2 from "../assets/images/bg2.jpg";
import bg3 from "../assets/images/bg3.jpg";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import FavoriteIcon from "@mui/icons-material/Favorite";
import PeopleIcon from "@mui/icons-material/People";
import ShareIcon from "@mui/icons-material/Share";
import { useColorMode } from "../contexts/ThemeContext";

export default function LoginLeftPanel({ variant = "login" }) {
  const { mode } = useColorMode();
  const isDark = mode === "dark";
  const images = [bg1, bg2, bg3];
  const [bgIndex, setBgIndex] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const rafRef = useRef(null);
  const lastUpdateRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => {
      clearInterval(interval);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [images.length]);

  const handleMouseMove = useCallback((e) => {
    const now = Date.now();
    // Throttle updates to reduce lag (50ms = 20fps)
    if (now - lastUpdateRef.current < 50) {
      return;
    }
    lastUpdateRef.current = now;

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
      const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
      setMousePosition({ x, y });
    });
  }, []);

  const features = [
    { icon: <PeopleIcon />, text: "Kết nối bạn bè" },
    { icon: <ShareIcon />, text: "Chia sẻ khoảnh khắc" },
    { icon: <FavoriteIcon />, text: "Tương tác tích cực" },
  ];

  return (
      <Box
      onMouseMove={handleMouseMove}
      sx={{
        display: { xs: "none", md: "flex" },
        position: "relative",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        color: "white",
        borderRadius: { md: "0 24px 24px 0", lg: "0 32px 32px 0" },
        willChange: "transform",
      }}
    >
      {/* Slideshow with zoom effect */}
      {images.map((img, index) => (
        <Box
          key={img}
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${img})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: img === images[bgIndex] ? 1 : 0,
            transform: img === images[bgIndex] ? "scale(1.05)" : "scale(1)",
            transition: "opacity 2s ease-in-out, transform 2s ease-in-out",
            willChange: "opacity, transform",
            filter: isDark ? "brightness(0.4) contrast(1.1)" : "none",
            contain: "layout style paint",
            pointerEvents: "none",
          }}
        />
      ))}

      {/* Animated gradient overlay - Optimized */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: isDark
            ? `linear-gradient(
                135deg,
                rgba(10, 10, 26, 0.75) 0%,
                rgba(26, 10, 46, 0.85) 50%,
                rgba(10, 10, 26, 0.75) 100%
              )`
            : `linear-gradient(
                135deg,
                rgba(138, 43, 226, 0.4) 0%,
                rgba(74, 0, 224, 0.5) 50%,
                rgba(138, 43, 226, 0.4) 100%
              )`,
          backgroundSize: "200% 200%",
          animation: "gradientShift 10s ease infinite",
          zIndex: 0,
          contain: "layout style paint",
          "@keyframes gradientShift": {
            "0%, 100%": { backgroundPosition: "0% 50%" },
            "50%": { backgroundPosition: "100% 50%" },
          },
        }}
      />

      {/* Additional dark overlay for dark mode - Static to reduce lag */}
      {isDark && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(
              135deg,
              rgba(138, 43, 226, 0.12) 0%,
              rgba(74, 0, 224, 0.18) 50%,
              rgba(138, 43, 226, 0.12) 100%
            )`,
            zIndex: 0.5,
            contain: "layout style paint",
          }}
        />
      )}

      {/* Dynamic overlay based on mouse position - Optimized */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: isDark
            ? `radial-gradient(
                circle at ${mousePosition.x}% ${mousePosition.y}%,
                rgba(138, 43, 226, 0.1) 0%,
                rgba(0, 0, 0, 0.8) 70%
              )`
            : `radial-gradient(
                circle at ${mousePosition.x}% ${mousePosition.y}%,
                rgba(138, 43, 226, 0.15) 0%,
                rgba(0, 0, 0, 0.6) 70%
              )`,
          transition: "background 0.3s ease-out",
          zIndex: 1,
          willChange: "background",
          contain: "layout style paint",
        }}
      />

      {/* Floating particles effect */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          "@keyframes floatParticle": {
            "0%, 100%": {
              transform: "translateY(0px) translateX(0px)",
              opacity: 0.3,
            },
            "50%": {
              transform: "translateY(-30px) translateX(20px)",
              opacity: 0.8,
            },
          },
        }}
      >
        {[...Array(6)].map((_, i) => {
          const delay = Math.random() * 5;
          const duration = Math.random() * 10 + 10;
          const size = Math.random() * 2 + 2;
          return (
            <Box
              key={i}
              sx={{
                position: "absolute",
                width: size,
                height: size,
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.4)",
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: "floatParticle",
                animationDuration: `${duration}s`,
                animationDelay: `${delay}s`,
                animationIterationCount: "infinite",
                animationTimingFunction: "ease-in-out",
                willChange: "transform, opacity",
                contain: "layout style paint",
                transform: "translateZ(0)",
              }}
            />
          );
        })}
      </Box>

      {/* Content */}
      <Box
        sx={{
          textAlign: "center",
          px: 6,
          position: "relative",
          zIndex: 3,
          maxWidth: 600,
        }}
      >
        <Zoom in={true} timeout={1000}>
          <Box>
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 3,
                position: "relative",
              }}
            >
              <Typography
                variant="h1"
                sx={{
                  fontWeight: 900,
                  letterSpacing: "-0.02em",
                  fontSize: { md: "4rem", lg: "5rem" },
                  background: "linear-gradient(135deg, #fff 0%, #e0e0ff 50%, #fff 100%)",
                  backgroundSize: "200% 200%",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  textShadow: "0px 4px 30px rgba(138, 43, 226, 0.5)",
                  animation: "gradientShift 3s ease infinite, glow 2s ease-in-out infinite alternate",
                  position: "relative",
                  "@keyframes glow": {
                    "0%": {
                      filter: "drop-shadow(0px 4px 20px rgba(138, 43, 226, 0.5))",
                    },
                    "100%": {
                      filter: "drop-shadow(0px 4px 40px rgba(138, 43, 226, 0.8))",
                    },
                  },
                }}
              >
                Friendify
              </Typography>
              <AutoAwesomeIcon
                sx={{
                  position: "absolute",
                  top: -10,
                  right: -20,
                  fontSize: "3rem",
                  color: "#ffd700",
                  animation: "sparkle 2s ease-in-out infinite",
                  "@keyframes sparkle": {
                    "0%, 100%": {
                      opacity: 0.6,
                      transform: "scale(1) rotate(0deg)",
                    },
                    "50%": {
                      opacity: 1,
                      transform: "scale(1.2) rotate(180deg)",
                    },
                  },
                }}
              />
            </Box>
          </Box>
        </Zoom>

        <Fade in={true} timeout={1200} style={{ transitionDelay: "300ms" }}>
          <Typography
            sx={{
              opacity: 0.95,
              mt: 2,
              mb: 4,
              fontSize: "1.25rem",
              fontWeight: 400,
              lineHeight: 1.8,
              textShadow: "0px 2px 10px rgba(0,0,0,0.5)",
            }}
          >
            {variant === "login"
              ? "Đăng nhập để kết nối với bạn bè và chia sẻ khoảnh khắc đáng nhớ."
              : "Tạo tài khoản và tham gia cộng đồng Friendify ngay hôm nay."}
          </Typography>
        </Fade>

        {/* Features list */}
        <Fade in={true} timeout={1400} style={{ transitionDelay: "500ms" }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2.5,
              mt: 4,
            }}
          >
            {features.map((feature, index) => (
              <Fade
                key={index}
                in={true}
                timeout={800}
                style={{ transitionDelay: `${700 + index * 200}ms` }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 2,
                    p: 2,
                    borderRadius: 3,
                    background: "rgba(255, 255, 255, 0.1)",
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    contain: "layout style paint",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      background: "rgba(255, 255, 255, 0.15)",
                      transform: "translateX(10px)",
                      boxShadow: "0 8px 24px rgba(138, 43, 226, 0.3)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      background: "rgba(138, 43, 226, 0.3)",
                      color: "white",
                      fontSize: "1.5rem",
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography
                    sx={{
                      fontSize: "1.0625rem",
                      fontWeight: 500,
                      textShadow: "0px 2px 8px rgba(0,0,0,0.3)",
                    }}
                  >
                    {feature.text}
                  </Typography>
                </Box>
              </Fade>
            ))}
          </Box>
        </Fade>
      </Box>
    </Box>
  );
}
