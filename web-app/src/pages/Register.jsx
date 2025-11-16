import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  TextField,
  Typography,
  Snackbar,
  Alert,
  InputAdornment,
  Link as MuiLink,
  Fade,
  Zoom,
  CircularProgress,
} from "@mui/material";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import GoogleIcon from "@mui/icons-material/Google";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import IconButton from "@mui/material/IconButton";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import SparklesIcon from "@mui/icons-material/AutoAwesome";
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerAccount, loginWithGoogle } from "../services/identityService";
import LoginLeftPanel from "../components/LoginLeftPanel";
import { useColorMode } from "../contexts/ThemeContext";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";

export default function Register() {
  const navigate = useNavigate();
  const { mode, toggleColorMode } = useColorMode();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "error",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [cursor, setCursor] = useState({ x: 50, y: 50 });

  useEffect(() => {
    localStorage.removeItem("verifyEmail");
    localStorage.removeItem("verifyContext");
    localStorage.removeItem("verifyIssuedAt");
  }, []);

  const validate = () => {
    const e = {};
    if (!username?.trim()) e.username = "Bắt buộc";
    if (!email?.trim()) {
      e.email = "Bắt buộc";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        e.email = "Địa chỉ email không hợp lệ";
      }
    }
    if (!password?.trim()) e.password = "Bắt buộc";
    if (password !== confirm) e.confirm = "Mật khẩu không khớp";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleMouseMove = (e) => {
    const x = (e.clientX / window.innerWidth) * 100;
    const y = (e.clientY / window.innerHeight) * 100;
    setCursor({ x, y });
  };

  const onSubmit = async (evt) => {
    evt.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        username: username.trim(),
        email: email.trim(),
        password,
      };
      const res = await registerAccount(payload);

      if (res?.status === 200 || res?.status === 201) {
        localStorage.setItem("verifyEmail", payload.email);
        localStorage.setItem("verifyContext", "register");
        localStorage.setItem("verifyIssuedAt", Date.now().toString());

        setSnack({
          open: true,
          message: "Tạo tài khoản thành công! Kiểm tra email để xác thực.",
          severity: "success",
        });

        setTimeout(() => navigate("/verify-user"), 800);
      } else {
        setSnack({
          open: true,
          message: "Không thể đăng ký. Vui lòng thử lại.",
          severity: "error",
        });
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Đăng ký thất bại";
      setSnack({ open: true, message: msg, severity: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
      <Box
        onMouseMove={handleMouseMove}
        sx={{
          height: "100vh",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          position: "relative",
          overflow: "hidden",
        background: (t) => 
          t.palette.mode === "dark" 
            ? "linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #0a0a1a 100%)"
            : "linear-gradient(135deg, #f5f7fa 0%, #e8eaf6 50%, #f5f7fa 100%)",
      }}
    >
      {/* Animated background particles */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          backgroundImage: (t) => t.palette.mode === "dark"
            ? `
              radial-gradient(circle at 20% 30%, rgba(138, 43, 226, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 70%, rgba(74, 0, 224, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 50% 50%, rgba(138, 43, 226, 0.05) 0%, transparent 50%)
            `
            : `
              radial-gradient(circle at 20% 30%, rgba(138, 43, 226, 0.05) 0%, transparent 50%),
              radial-gradient(circle at 80% 70%, rgba(74, 0, 224, 0.05) 0%, transparent 50%),
              radial-gradient(circle at 50% 50%, rgba(138, 43, 226, 0.03) 0%, transparent 50%)
            `,
          animation: "float 20s ease-in-out infinite",
          "@keyframes float": {
            "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
            "50%": { transform: "translateY(-20px) rotate(5deg)" },
          },
        }}
      />

      <LoginLeftPanel variant="register" />

      <Box
        className="register-form-container"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 1.5, sm: 2, md: 2.5 },
          overflow: "hidden",
          position: "relative",
          zIndex: 1,
          background: (t) => 
            t.palette.mode === "dark" 
              ? `radial-gradient(circle at ${cursor.x}% ${cursor.y}%, rgba(138, 43, 226, 0.2), rgba(10, 10, 26, 0.95) 70%)`
              : `radial-gradient(circle at ${cursor.x}% ${cursor.y}%, rgba(138, 43, 226, 0.1), rgba(247, 248, 250, 1) 70%)`,
          transition: "background 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            background: (t) => t.palette.mode === "dark"
              ? `radial-gradient(circle at ${100 - cursor.x}% ${100 - cursor.y}%, rgba(74, 0, 224, 0.15), transparent 60%)`
              : `radial-gradient(circle at ${100 - cursor.x}% ${100 - cursor.y}%, rgba(74, 0, 224, 0.08), transparent 60%)`,
            transition: "background 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
            zIndex: -1,
          },
        }}
      >
        {/* Theme Toggle Button */}
        <IconButton
          onClick={toggleColorMode}
          sx={{
            position: "absolute",
            top: { xs: 16, sm: 24 },
            right: { xs: 16, sm: 24 },
            zIndex: 10,
            width: 48,
            height: 48,
            backgroundColor: (t) => t.palette.mode === "dark"
              ? "rgba(255, 255, 255, 0.1)"
              : "rgba(138, 43, 226, 0.1)",
            backdropFilter: "blur(10px)",
            border: (t) => t.palette.mode === "dark"
              ? "1px solid rgba(255, 255, 255, 0.15)"
              : "1px solid rgba(138, 43, 226, 0.2)",
            color: (t) => t.palette.mode === "dark" ? "#ffd700" : "#8a2be2",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              backgroundColor: (t) => t.palette.mode === "dark"
                ? "rgba(255, 255, 255, 0.15)"
                : "rgba(138, 43, 226, 0.15)",
              transform: "scale(1.1) rotate(15deg)",
              boxShadow: (t) => t.palette.mode === "dark"
                ? "0 8px 24px rgba(255, 215, 0, 0.3)"
                : "0 8px 24px rgba(138, 43, 226, 0.3)",
            },
            "&:active": {
              transform: "scale(0.95)",
            },
          }}
        >
          {mode === "dark" ? (
            <LightModeIcon sx={{ fontSize: 24 }} />
          ) : (
            <DarkModeIcon sx={{ fontSize: 24 }} />
          )}
        </IconButton>
        <Fade in={true} timeout={800}>
          <Card 
            className="register-card"
            sx={{ 
              width: { xs: "100%", sm: 480, md: 500 },
              maxHeight: "calc(100vh - 24px)",
              overflowY: "auto",
              "&::-webkit-scrollbar": {
                display: "none",
              },
              scrollbarWidth: "none",
              msOverflowStyle: "none", 
              maxWidth: "100%", 
              borderRadius: { xs: 4, sm: 5 },
              border: (t) => t.palette.mode === "dark" 
                ? "1px solid rgba(255,255,255,0.12)" 
                : "1px solid rgba(138, 43, 226, 0.15)",
              background: (t) => t.palette.mode === "dark"
                ? "rgba(18, 18, 28, 0.75)"
                : "rgba(255, 255, 255, 0.85)",
              backdropFilter: "blur(24px) saturate(180%)",
              WebkitBackdropFilter: "blur(24px) saturate(180%)",
              boxShadow: (t) => t.palette.mode === "dark"
                ? `
                  0 20px 60px rgba(0, 0, 0, 0.5),
                  0 0 0 1px rgba(138, 43, 226, 0.15),
                  inset 0 1px 0 rgba(255, 255, 255, 0.1)
                `
                : `
                  0 20px 60px rgba(138, 43, 226, 0.12),
                  0 0 0 1px rgba(138, 43, 226, 0.08),
                  inset 0 1px 0 rgba(255, 255, 255, 0.9)
                `,
              transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
              position: "relative",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "4px",
                background: "linear-gradient(90deg, #8a2be2, #4a00e0, #8a2be2)",
                backgroundSize: "200% 100%",
                animation: "shimmer 3s linear infinite",
                "@keyframes shimmer": {
                  "0%": { backgroundPosition: "0% 0%" },
                  "100%": { backgroundPosition: "200% 0%" },
                },
              },
              "&:hover": {
                boxShadow: (t) => t.palette.mode === "dark"
                  ? `
                    0 24px 72px rgba(138, 43, 226, 0.25),
                    0 0 0 1px rgba(138, 43, 226, 0.25),
                    inset 0 1px 0 rgba(255, 255, 255, 0.15)
                  `
                  : `
                    0 24px 72px rgba(138, 43, 226, 0.18),
                    0 0 0 1px rgba(138, 43, 226, 0.12),
                    inset 0 1px 0 rgba(255, 255, 255, 1)
                  `,
                transform: "translateY(-4px) scale(1.01)",
              },
            }}
          >
            <CardContent sx={{ p: { xs: 2.5, sm: 3 }, "&:last-child": { pb: { xs: 2.5, sm: 3 } } }}>
            <Box className="register-header" sx={{ mb: { xs: 1.5, sm: 2 }, textAlign: "center" }}>
              <Zoom in={true} timeout={600} style={{ transitionDelay: "200ms" }}>
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    mb: 1,
                    position: "relative",
                    background: "linear-gradient(135deg, #8a2be2 0%, #4a00e0 50%, #8a2be2 100%)",
                    backgroundSize: "200% 200%",
                    animation: "gradientShift 3s ease infinite, pulse 2s ease-in-out infinite",
                    boxShadow: "0 8px 32px rgba(138, 43, 226, 0.5), 0 0 0 0 rgba(138, 43, 226, 0.7)",
                    "@keyframes gradientShift": {
                      "0%, 100%": { backgroundPosition: "0% 50%" },
                      "50%": { backgroundPosition: "100% 50%" },
                    },
                    "@keyframes pulse": {
                      "0%": { boxShadow: "0 8px 32px rgba(138, 43, 226, 0.5), 0 0 0 0 rgba(138, 43, 226, 0.7)" },
                      "50%": { boxShadow: "0 8px 32px rgba(138, 43, 226, 0.5), 0 0 0 8px rgba(138, 43, 226, 0)" },
                      "100%": { boxShadow: "0 8px 32px rgba(138, 43, 226, 0.5), 0 0 0 0 rgba(138, 43, 226, 0)" },
                    },
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      inset: "-4px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #8a2be2, #4a00e0, #8a2be2)",
                      backgroundSize: "200% 200%",
                      animation: "gradientShift 3s ease infinite",
                      opacity: 0.3,
                      zIndex: -1,
                      filter: "blur(8px)",
                    },
                  }}
                >
                  <PersonAddIcon sx={{ fontSize: 28, color: "white", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }} />
                  <SparklesIcon 
                    sx={{ 
                      position: "absolute",
                      top: "-6px",
                      right: "-6px",
                      fontSize: 18,
                      color: "#ffd700",
                      animation: "sparkle 2s ease-in-out infinite",
                      "@keyframes sparkle": {
                        "0%, 100%": { opacity: 0.6, transform: "scale(1) rotate(0deg)" },
                        "50%": { opacity: 1, transform: "scale(1.2) rotate(180deg)" },
                      },
                    }} 
                  />
                </Box>
              </Zoom>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 900, 
                  mb: 0.5,
                  fontSize: { xs: "1.5rem", sm: "1.75rem" },
                  background: (t) => t.palette.mode === "dark"
                    ? "linear-gradient(135deg, #fff 0%, #e0e0e0 50%, #fff 100%)"
                    : "linear-gradient(135deg, #8a2be2 0%, #4a00e0 50%, #8a2be2 100%)",
                  backgroundSize: "200% 200%",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  letterSpacing: "-0.03em",
                  animation: "gradientShift 3s ease infinite",
                  textShadow: (t) => t.palette.mode === "dark" 
                    ? "0 2px 20px rgba(138, 43, 226, 0.3)" 
                    : "none",
                }}
              >
                Tạo tài khoản
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                  opacity: 0.85,
                  fontWeight: 400,
                  lineHeight: 1.4,
                }}
              >
                Đăng ký để bắt đầu sử dụng Friendify
              </Typography>
            </Box>

            <Box component="form" onSubmit={onSubmit} noValidate className="register-form">
              <Fade in={true} timeout={800} style={{ transitionDelay: "300ms" }}>
                <TextField
                  label="Tên đăng nhập"
                  fullWidth
                  margin="normal"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  error={Boolean(errors.username)}
                  helperText={errors.username || " "}
                  sx={{
                    mt: 0,
                    mb: 1,
                    "& .MuiInputBase-root": {
                      fontSize: { xs: "0.9375rem", sm: "1rem" },
                      borderRadius: 3,
                      backgroundColor: (t) => t.palette.mode === "dark" 
                        ? "rgba(255, 255, 255, 0.06)" 
                        : "rgba(138, 43, 226, 0.04)",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&:hover": {
                        backgroundColor: (t) => t.palette.mode === "dark" 
                          ? "rgba(255, 255, 255, 0.1)" 
                          : "rgba(138, 43, 226, 0.06)",
                        transform: "translateY(-1px)",
                      },
                      "&.Mui-focused": {
                        backgroundColor: (t) => t.palette.mode === "dark" 
                          ? "rgba(255, 255, 255, 0.1)" 
                          : "rgba(138, 43, 226, 0.06)",
                        transform: "translateY(-1px)",
                        boxShadow: "0 4px 12px rgba(138, 43, 226, 0.15)",
                      },
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: (t) => t.palette.mode === "dark" 
                        ? "rgba(255, 255, 255, 0.12)" 
                        : "rgba(138, 43, 226, 0.25)",
                      borderWidth: 1.5,
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    },
                    "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: (t) => t.palette.mode === "dark" 
                        ? "rgba(138, 43, 226, 0.6)" 
                        : "rgba(138, 43, 226, 0.5)",
                      borderWidth: 2,
                    },
                    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#8a2be2",
                      borderWidth: 2.5,
                      boxShadow: "0 0 0 4px rgba(138, 43, 226, 0.1)",
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "#8a2be2",
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonOutlineIcon 
                          fontSize="small" 
                          sx={{ color: (t) => t.palette.mode === "dark" ? "rgba(255,255,255,0.6)" : "rgba(138, 43, 226, 0.6)" }} 
                        />
                      </InputAdornment>
                    ),
                  }}
                />
              </Fade>

              <Fade in={true} timeout={800} style={{ transitionDelay: "400ms" }}>
                <TextField
                  label="Email"
                  fullWidth
                  margin="normal"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={Boolean(errors.email)}
                  helperText={errors.email || " "}
                  sx={{
                    mt: 0,
                    mb: 1,
                    "& .MuiInputBase-root": {
                      fontSize: { xs: "0.9375rem", sm: "1rem" },
                      borderRadius: 3,
                      backgroundColor: (t) => t.palette.mode === "dark" 
                        ? "rgba(255, 255, 255, 0.06)" 
                        : "rgba(138, 43, 226, 0.04)",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&:hover": {
                        backgroundColor: (t) => t.palette.mode === "dark" 
                          ? "rgba(255, 255, 255, 0.1)" 
                          : "rgba(138, 43, 226, 0.06)",
                        transform: "translateY(-1px)",
                      },
                      "&.Mui-focused": {
                        backgroundColor: (t) => t.palette.mode === "dark" 
                          ? "rgba(255, 255, 255, 0.1)" 
                          : "rgba(138, 43, 226, 0.06)",
                        transform: "translateY(-1px)",
                        boxShadow: "0 4px 12px rgba(138, 43, 226, 0.15)",
                      },
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: (t) => t.palette.mode === "dark" 
                        ? "rgba(255, 255, 255, 0.12)" 
                        : "rgba(138, 43, 226, 0.25)",
                      borderWidth: 1.5,
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    },
                    "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: (t) => t.palette.mode === "dark" 
                        ? "rgba(138, 43, 226, 0.6)" 
                        : "rgba(138, 43, 226, 0.5)",
                      borderWidth: 2,
                    },
                    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#8a2be2",
                      borderWidth: 2.5,
                      boxShadow: "0 0 0 4px rgba(138, 43, 226, 0.1)",
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "#8a2be2",
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MailOutlineIcon 
                          fontSize="small" 
                          sx={{ color: (t) => t.palette.mode === "dark" ? "rgba(255,255,255,0.6)" : "rgba(138, 43, 226, 0.6)" }} 
                        />
                      </InputAdornment>
                    ),
                  }}
                />
              </Fade>

              <Fade in={true} timeout={800} style={{ transitionDelay: "500ms" }}>
                <TextField
                  label="Mật khẩu"
                  fullWidth
                  margin="normal"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={Boolean(errors.password)}
                  helperText={errors.password || " "}
                  sx={{
                    mt: 0,
                    mb: 1,
                    "& .MuiInputBase-root": {
                      fontSize: { xs: "0.9375rem", sm: "1rem" },
                      borderRadius: 3,
                      backgroundColor: (t) => t.palette.mode === "dark" 
                        ? "rgba(255, 255, 255, 0.06)" 
                        : "rgba(138, 43, 226, 0.04)",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&:hover": {
                        backgroundColor: (t) => t.palette.mode === "dark" 
                          ? "rgba(255, 255, 255, 0.1)" 
                          : "rgba(138, 43, 226, 0.06)",
                        transform: "translateY(-1px)",
                      },
                      "&.Mui-focused": {
                        backgroundColor: (t) => t.palette.mode === "dark" 
                          ? "rgba(255, 255, 255, 0.1)" 
                          : "rgba(138, 43, 226, 0.06)",
                        transform: "translateY(-1px)",
                        boxShadow: "0 4px 12px rgba(138, 43, 226, 0.15)",
                      },
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: (t) => t.palette.mode === "dark" 
                        ? "rgba(255, 255, 255, 0.12)" 
                        : "rgba(138, 43, 226, 0.25)",
                      borderWidth: 1.5,
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    },
                    "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: (t) => t.palette.mode === "dark" 
                        ? "rgba(138, 43, 226, 0.6)" 
                        : "rgba(138, 43, 226, 0.5)",
                      borderWidth: 2,
                    },
                    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#8a2be2",
                      borderWidth: 2.5,
                      boxShadow: "0 0 0 4px rgba(138, 43, 226, 0.1)",
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "#8a2be2",
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon 
                          fontSize="small" 
                          sx={{ color: (t) => t.palette.mode === "dark" ? "rgba(255,255,255,0.6)" : "rgba(138, 43, 226, 0.6)" }} 
                        />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton 
                          tabIndex={-1} 
                          onClick={() => setShowPassword((prev) => !prev)} 
                          edge="end"
                          size="small"
                          sx={{ 
                            color: (t) => t.palette.mode === "dark" ? "rgba(255,255,255,0.6)" : "rgba(138, 43, 226, 0.6)",
                            "&:hover": {
                              color: "#8a2be2",
                              backgroundColor: (t) => t.palette.mode === "dark" 
                                ? "rgba(138, 43, 226, 0.1)" 
                                : "rgba(138, 43, 226, 0.08)",
                            },
                          }}
                        >
                          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Fade>

              <Fade in={true} timeout={800} style={{ transitionDelay: "600ms" }}>
                <TextField
                  label="Xác nhận mật khẩu"
                  type={showPassword ? "text" : "password"}
                  fullWidth
                  margin="normal"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  error={Boolean(errors.confirm)}
                  helperText={errors.confirm || " "}
                  sx={{
                    mt: 0,
                    mb: 0,
                    "& .MuiInputBase-root": {
                      fontSize: { xs: "0.9375rem", sm: "1rem" },
                      borderRadius: 3,
                      backgroundColor: (t) => t.palette.mode === "dark" 
                        ? "rgba(255, 255, 255, 0.06)" 
                        : "rgba(138, 43, 226, 0.04)",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&:hover": {
                        backgroundColor: (t) => t.palette.mode === "dark" 
                          ? "rgba(255, 255, 255, 0.1)" 
                          : "rgba(138, 43, 226, 0.06)",
                        transform: "translateY(-1px)",
                      },
                      "&.Mui-focused": {
                        backgroundColor: (t) => t.palette.mode === "dark" 
                          ? "rgba(255, 255, 255, 0.1)" 
                          : "rgba(138, 43, 226, 0.06)",
                        transform: "translateY(-1px)",
                        boxShadow: "0 4px 12px rgba(138, 43, 226, 0.15)",
                      },
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: (t) => t.palette.mode === "dark" 
                        ? "rgba(255, 255, 255, 0.12)" 
                        : "rgba(138, 43, 226, 0.25)",
                      borderWidth: 1.5,
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    },
                    "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: (t) => t.palette.mode === "dark" 
                        ? "rgba(138, 43, 226, 0.6)" 
                        : "rgba(138, 43, 226, 0.5)",
                      borderWidth: 2,
                    },
                    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#8a2be2",
                      borderWidth: 2.5,
                      boxShadow: "0 0 0 4px rgba(138, 43, 226, 0.1)",
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "#8a2be2",
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon 
                          fontSize="small" 
                          sx={{ color: (t) => t.palette.mode === "dark" ? "rgba(255,255,255,0.6)" : "rgba(138, 43, 226, 0.6)" }} 
                        />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton 
                          tabIndex={-1} 
                          onClick={() => setShowPassword((prev) => !prev)} 
                          edge="end"
                          size="small"
                          sx={{ 
                            color: (t) => t.palette.mode === "dark" ? "rgba(255,255,255,0.6)" : "rgba(138, 43, 226, 0.6)",
                            "&:hover": {
                              color: "#8a2be2",
                              backgroundColor: (t) => t.palette.mode === "dark" 
                                ? "rgba(138, 43, 226, 0.1)" 
                                : "rgba(138, 43, 226, 0.08)",
                            },
                          }}
                        >
                          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Fade>

              <Fade in={true} timeout={800} style={{ transitionDelay: "700ms" }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="medium"
                  fullWidth
                  disabled={submitting}
                  startIcon={!submitting ? <PersonAddIcon /> : <CircularProgress size={18} sx={{ color: "white" }} />}
                  sx={{ 
                    mt: 1, 
                    mb: 1.5,
                    py: { xs: 1.25, sm: 1.5 },
                    fontSize: { xs: "0.9375rem", sm: "1.0625rem" },
                    fontWeight: 700,
                    textTransform: "none",
                    borderRadius: 3,
                    position: "relative",
                    overflow: "hidden",
                    background: "linear-gradient(135deg, #8a2be2 0%, #4a00e0 50%, #8a2be2 100%)",
                    backgroundSize: "200% 200%",
                    boxShadow: "0 8px 24px rgba(138, 43, 226, 0.4), 0 0 0 0 rgba(138, 43, 226, 0.5)",
                    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    "@keyframes gradientShift": {
                      "0%, 100%": { backgroundPosition: "0% 50%" },
                      "50%": { backgroundPosition: "100% 50%" },
                    },
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: "-100%",
                      width: "100%",
                      height: "100%",
                      background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                      transition: "left 0.5s ease",
                    },
                    "&:hover": {
                      backgroundPosition: "100% 50%",
                      boxShadow: "0 12px 36px rgba(138, 43, 226, 0.6), 0 0 0 4px rgba(138, 43, 226, 0.2)",
                      transform: "translateY(-3px) scale(1.02)",
                      "&::before": {
                        left: "100%",
                      },
                    },
                    "&:active": {
                      transform: "translateY(-1px) scale(1)",
                      boxShadow: "0 6px 20px rgba(138, 43, 226, 0.5)",
                    },
                    "&.Mui-disabled": {
                      background: "rgba(138, 43, 226, 0.3)",
                      boxShadow: "none",
                      transform: "none",
                    },
                  }}
                >
                  {submitting ? "Đang đăng ký..." : "Đăng ký"}
                </Button>
              </Fade>

              <Divider sx={{ my: { xs: 1.5, sm: 2 }, position: "relative" }}>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                    px: 2,
                    backgroundColor: (t) => t.palette.mode === "dark" 
                      ? "rgba(18, 18, 28, 0.75)" 
                      : "rgba(255, 255, 255, 0.85)",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  hoặc
                </Typography>
              </Divider>

              <Fade in={true} timeout={800} style={{ transitionDelay: "800ms" }}>
                <Button
                  variant="outlined"
                  fullWidth
                  size="medium"
                  startIcon={<GoogleIcon />}
                  onClick={() => loginWithGoogle()}
                  sx={{
                    py: { xs: 1.25, sm: 1.5 },
                    fontSize: { xs: "0.9375rem", sm: "1rem" },
                    fontWeight: 600,
                    textTransform: "none",
                    borderRadius: 3,
                    borderColor: (t) => t.palette.mode === "dark" 
                      ? "rgba(255,255,255,0.15)" 
                      : "rgba(138, 43, 226, 0.2)",
                    color: (t) => t.palette.mode === "dark" ? "white" : "#8a2be2",
                    backgroundColor: (t) => t.palette.mode === "dark" 
                      ? "rgba(255, 255, 255, 0.03)" 
                      : "rgba(138, 43, 226, 0.03)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      borderColor: (t) => t.palette.mode === "dark" 
                        ? "rgba(255,255,255,0.3)" 
                        : "rgba(138, 43, 226, 0.4)",
                      backgroundColor: (t) => t.palette.mode === "dark" 
                        ? "rgba(255, 255, 255, 0.08)" 
                        : "rgba(138, 43, 226, 0.08)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 12px rgba(138, 43, 226, 0.2)",
                    },
                  }}
                >
                  Tiếp tục với Google
                </Button>
              </Fade>

              <Fade in={true} timeout={800} style={{ transitionDelay: "900ms" }}>
                <Typography 
                  sx={{ 
                    mt: { xs: 1.5, sm: 2 }, 
                    textAlign: "center",
                    fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                  }} 
                  variant="body2"
                  color="text.secondary"
                >
                  Đã có tài khoản?{" "}
                  <MuiLink 
                    component={Link} 
                    to="/login" 
                    underline="hover"
                    sx={{ 
                      fontWeight: 700,
                      color: "#8a2be2",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        color: "#4a00e0",
                      },
                    }}
                  >
                    Đăng nhập
                  </MuiLink>
                </Typography>
              </Fade>
            </Box>
          </CardContent>
        </Card>
        </Fade>
      </Box>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snack.severity}
          variant="filled"
          onClose={() => setSnack({ ...snack, open: false })}
          sx={{ 
            fontSize: { xs: "0.875rem", sm: "0.9375rem" },
          }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
