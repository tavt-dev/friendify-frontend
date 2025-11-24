import { // Các component từ Material-UI để xây dựng giao diện
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
  IconButton,
  Fade,
  Zoom,
  CircularProgress,
} from "@mui/material";
// Import các icon từ Material-UI Icons
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import GoogleIcon from "@mui/icons-material/Google";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import LoginIcon from "@mui/icons-material/Login";
import SparklesIcon from "@mui/icons-material/AutoAwesome";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";

import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";

import { logIn, isAuthenticated, loginWithGoogle } from "../services/identityService";
import { useUser } from "../contexts/UserContext";

import LoginPanel from "../components/LoginPanel";
import { useColorMode } from "../contexts/ThemeContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, toggleColorMode } = useColorMode();
  const { loadUser } = useUser();
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "error" });
  const [showPassword, setShowPassword] = useState(false);
  
  // State lưu vị trí cursor để tạo hiệu ứng gradient theo chuột
  const [cursor, setCursor] = useState({ x: 50, y: 50 });
  // Ref để lưu requestAnimationFrame ID, dùng để cancel khi cần
  const cursorUpdateRef = useRef(null);
  // Ref để lưu thời gian cập nhật cursor cuối cùng, dùng để throttle
  const lastCursorUpdateRef = useRef(0);

  // Nếu đã đăng nhập thì redirect về trang chủ
  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/");
    }
    return () => {
      if (cursorUpdateRef.current) {
        cancelAnimationFrame(cursorUpdateRef.current);
      }
    };
  }, [navigate]);

  // Hiển thị lỗi từ location state (nếu có)
  useEffect(() => {
    if (location.state?.error) {
      setSnack({ 
        open: true, 
        message: location.state.error, 
        severity: "error" 
      });
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Hàm validate form đăng nhập
  const validate = () => {
    const e = {};
    if (!username?.trim()) e.username = "Bắt buộc";
    if (!password?.trim()) e.password = "Bắt buộc";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Hàm xử lý submit form đăng nhập
  const onSubmit = async (evt) => {
    evt.preventDefault();
    if (!validate()) return;
    setSubmitting(true); // Bật trạng thái đang submit
    try {
      const res = await logIn(username.trim(), password);
      if (res?.status === 200) {
        await loadUser();
        navigate("/");
      } else {
        setSnack({ open: true, message: "Không thể đăng nhập. Vui lòng thử lại.", severity: "error" });
      }
    } catch (err) {
      const status = err?.response?.status;
      const body = err?.response?.data || {};
      const msg = body?.message ?? body?.error ?? err?.message ?? "Đăng nhập thất bại";

      // Xử lý trường hợp email chưa được verify
      if (status === 403 && (body?.error === "EMAIL_NOT_VERIFIED" || body?.code === "EMAIL_NOT_VERIFIED")) {
        navigate("/verify-email", { state: { email: username.trim(), reason: msg } });
        return;
      }

      // Xử lý trường hợp quá nhiều request (rate limiting)
      if (status === 429 || body?.code === "TOO_MANY_REQUESTS") {
        setSnack({ open: true, message: msg || "Too many attempts. Please wait.", severity: "warning" });
        return;
      }

      // Xử lý lỗi validation từ server
      if (body?.errors && typeof body.errors === "object") {
        setErrors((prev) => ({ ...prev, ...body.errors }));
        setSnack({ open: true, message: msg || "Validation error", severity: "error" });
        return;
      }

      // Xử lý các lỗi khác
      setSnack({ open: true, message: String(msg), severity: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  // Function xử lý sự kiện di chuyển chuột
  // Sử dụng throttle để giới hạn số lần cập nhật (mỗi 100ms)
  // Tính toán vị trí cursor theo phần trăm màn hình
  // Sử dụng requestAnimationFrame để tối ưu performance
  // Cập nhật state cursor để tạo hiệu ứng gradient theo chuột
  const handleMouseMove = useCallback((e) => {
    const now = Date.now();
    if (now - lastCursorUpdateRef.current < 100) {
      return;
    }
    lastCursorUpdateRef.current = now;

    if (cursorUpdateRef.current) {
      cancelAnimationFrame(cursorUpdateRef.current);
    }

    cursorUpdateRef.current = requestAnimationFrame(() => {
      const x = Math.round((e.clientX / window.innerWidth) * 100);
      const y = Math.round((e.clientY / window.innerHeight) * 100);
      setCursor({ x, y });
    });
  }, []);

  return (
    <Box
      onMouseMove={handleMouseMove}
      sx={{
        minHeight: "100vh",
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

      <LoginPanel variant="login" />
      <Box
        className="login-form-container"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 2, sm: 3, md: 4 },
          position: "relative",
          zIndex: 1,
          background: (t) => 
            t.palette.mode === "dark" 
              ? `radial-gradient(circle at ${cursor.x}% ${cursor.y}%, rgba(138, 43, 226, 0.2), rgba(10, 10, 26, 0.95) 70%)`
              : `radial-gradient(circle at ${cursor.x}% ${cursor.y}%, rgba(138, 43, 226, 0.1), rgba(247, 248, 250, 1) 70%)`,
          transition: "background 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
          willChange: "background",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            background: (t) => t.palette.mode === "dark"
              ? `radial-gradient(circle at ${100 - cursor.x}% ${100 - cursor.y}%, rgba(74, 0, 224, 0.15), transparent 60%)`
              : `radial-gradient(circle at ${100 - cursor.x}% ${100 - cursor.y}%, rgba(74, 0, 224, 0.08), transparent 60%)`,
            transition: "background 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
            zIndex: -1,
            willChange: "background",
          },
        }}
      >
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
            className="login-card"
            sx={{ 
              width: { xs: "100%", sm: 500, md: 520 }, 
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
            <CardContent sx={{ p: { xs: 3.5, sm: 5 }, "&:last-child": { pb: { xs: 3.5, sm: 5 } } }}>
            <Box className="login-header" sx={{ mb: { xs: 3.5, sm: 4.5 }, textAlign: "center" }}>
              <Zoom in={true} timeout={600} style={{ transitionDelay: "200ms" }}>
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    mb: 2.5,
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
                  <LoginIcon sx={{ fontSize: 36, color: "white", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }} />
                  <SparklesIcon 
                    sx={{ 
                      position: "absolute",
                      top: "-8px",
                      right: "-8px",
                      fontSize: 24,
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
                  mb: 1.5,
                  fontSize: { xs: "1.875rem", sm: "2.25rem" },
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
                Chào mừng trở lại
              </Typography>
              <Typography 
                variant="body1" 
                color="text.secondary" 
                sx={{ 
                  fontSize: { xs: "0.9375rem", sm: "1.0625rem" },
                  opacity: 0.85,
                  fontWeight: 400,
                  lineHeight: 1.6,
                }}
              >
                Đăng nhập vào tài khoản của bạn để tiếp tục
              </Typography>
            </Box>

            <Box component="form" onSubmit={onSubmit} noValidate className="login-form">
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
                    mb: 2,
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
              <Fade in={true} timeout={800} style={{ transitionDelay: "400ms" }}>
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
                    mb: 0.5,
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

              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 0.5, mb: 3 }}>
                <MuiLink 
                  tabIndex={-1} 
                  component={Link} 
                  to="/forgot-password" 
                  underline="hover" 
                  sx={{ 
                    fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                    color: "#8a2be2",
                    fontWeight: 600,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      color: "#4a00e0",
                      transform: "translateX(2px)",
                    },
                  }}
                >
                  Quên mật khẩu?
                </MuiLink>
              </Box>

              <Fade in={true} timeout={800} style={{ transitionDelay: "500ms" }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={submitting}
                  startIcon={
                    !submitting ? (
                      <LoginIcon sx={{ fontSize: 20 }} />
                    ) : (
                      <CircularProgress 
                        size={20} 
                        sx={{ 
                          color: "white",
                          animationDuration: "550ms",
                        }} 
                      />
                    )
                  }
                  sx={{ 
                    mt: 1.5, 
                    mb: 3,
                    py: { xs: 1.625, sm: 1.875 },
                    fontSize: { xs: "0.9375rem", sm: "1.0625rem" },
                    fontWeight: 700,
                    textTransform: "none",
                    borderRadius: 3,
                    position: "relative",
                    overflow: "hidden",
                    background: submitting
                      ? "rgba(138, 43, 226, 0.5)"
                      : "linear-gradient(135deg, #8a2be2 0%, #4a00e0 50%, #8a2be2 100%)",
                    backgroundSize: "200% 200%",
                    boxShadow: submitting
                      ? "0 4px 12px rgba(138, 43, 226, 0.2)"
                      : "0 8px 24px rgba(138, 43, 226, 0.4), 0 0 0 0 rgba(138, 43, 226, 0.5)",
                    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    animation: !submitting ? "gradientShift 3s ease infinite" : "none",
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
                      background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
                      transition: "left 0.6s ease",
                    },
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      inset: 0,
                      borderRadius: 3,
                      padding: "2px",
                      background: "linear-gradient(135deg, rgba(255,255,255,0.3), transparent)",
                      WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                      WebkitMaskComposite: "xor",
                      maskComposite: "exclude",
                      opacity: 0,
                      transition: "opacity 0.3s ease",
                    },
                    "&:hover:not(:disabled)": {
                      backgroundPosition: "100% 50%",
                      boxShadow: "0 12px 36px rgba(138, 43, 226, 0.6), 0 0 0 4px rgba(138, 43, 226, 0.2)",
                      transform: "translateY(-3px) scale(1.02)",
                      "&::before": {
                        left: "100%",
                      },
                      "&::after": {
                        opacity: 1,
                      },
                    },
                    "&:active:not(:disabled)": {
                      transform: "translateY(-1px) scale(1)",
                      boxShadow: "0 6px 20px rgba(138, 43, 226, 0.5)",
                    },
                    "&.Mui-disabled": {
                      background: "rgba(138, 43, 226, 0.3)",
                      boxShadow: "none",
                      transform: "none",
                      cursor: "not-allowed",
                    },
                  }}
                >
                  {submitting ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <span>Đang đăng nhập</span>
                      <Box
                        component="span"
                        sx={{
                          display: "inline-block",
                          width: 4,
                          height: 4,
                          borderRadius: "50%",
                          backgroundColor: "white",
                          animation: "dotPulse 1.4s ease-in-out infinite",
                          "&:nth-of-type(2)": {
                            animationDelay: "0.2s",
                          },
                          "&:nth-of-type(3)": {
                            animationDelay: "0.4s",
                          },
                          "@keyframes dotPulse": {
                            "0%, 60%, 100%": {
                              transform: "scale(1)",
                              opacity: 0.5,
                            },
                            "30%": {
                              transform: "scale(1.5)",
                              opacity: 1,
                            },
                          },
                        }}
                      />
                    </Box>
                  ) : (
                    "Đăng nhập"
                  )}
                </Button>
              </Fade>

              <Divider sx={{ my: { xs: 3, sm: 3.5 }, position: "relative" }}>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                    px: 2,
                    backgroundColor: (t) => t.palette.mode === "dark" 
                      ? "rgba(18, 18, 28, 0.85)" 
                      : "rgba(255, 255, 255, 0.9)",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  hoặc
                </Typography>
              </Divider>

              <Fade in={true} timeout={800} style={{ transitionDelay: "600ms" }}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={
                    <GoogleIcon 
                      sx={{ 
                        fontSize: 20,
                        transition: "transform 0.3s ease",
                      }} 
                    />
                  }
                  onClick={() => loginWithGoogle()}
                  sx={{
                    py: { xs: 1.5, sm: 1.75 },
                    fontSize: { xs: "0.9375rem", sm: "1rem" },
                    fontWeight: 600,
                    textTransform: "none",
                    borderRadius: 3,
                    borderWidth: 1.5,
                    borderColor: (t) => t.palette.mode === "dark" 
                      ? "rgba(255,255,255,0.15)" 
                      : "rgba(138, 43, 226, 0.25)",
                    color: (t) => t.palette.mode === "dark" ? "white" : "#8a2be2",
                    backgroundColor: (t) => t.palette.mode === "dark" 
                      ? "rgba(255, 255, 255, 0.03)" 
                      : "rgba(138, 43, 226, 0.03)",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    position: "relative",
                    overflow: "hidden",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: "-100%",
                      width: "100%",
                      height: "100%",
                      background: "linear-gradient(90deg, transparent, rgba(138, 43, 226, 0.1), transparent)",
                      transition: "left 0.5s ease",
                    },
                    "&:hover": {
                      borderColor: (t) => t.palette.mode === "dark" 
                        ? "rgba(255,255,255,0.3)" 
                        : "rgba(138, 43, 226, 0.5)",
                      borderWidth: 2,
                      backgroundColor: (t) => t.palette.mode === "dark" 
                        ? "rgba(255, 255, 255, 0.08)" 
                        : "rgba(138, 43, 226, 0.08)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 6px 20px rgba(138, 43, 226, 0.25)",
                      "&::before": {
                        left: "100%",
                      },
                      "& .MuiButton-startIcon": {
                        transform: "scale(1.1) rotate(5deg)",
                      },
                    },
                    "&:active": {
                      transform: "translateY(0px)",
                      boxShadow: "0 2px 8px rgba(138, 43, 226, 0.2)",
                    },
                  }}
                >
                  Tiếp tục với Google
                </Button>
              </Fade>

              <Fade in={true} timeout={800} style={{ transitionDelay: "700ms" }}>
                <Typography 
                  sx={{ 
                    mt: { xs: 3, sm: 3.5 }, 
                    textAlign: "center",
                    fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                  }} 
                  variant="body2"
                  color="text.secondary"
                >
                  Mới đến Friendify?{" "}
                  <MuiLink 
                    component={Link} 
                    to="/register" 
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
                    Tạo tài khoản
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
        autoHideDuration={snack.severity === "error" ? 8000 : 4000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert 
          severity={snack.severity} 
          variant="filled" 
          onClose={() => setSnack({ ...snack, open: false })}
          sx={{ 
            fontSize: { xs: "0.875rem", sm: "0.9375rem" },
            whiteSpace: "pre-line",
            maxWidth: { xs: "90vw", sm: "500px" },
          }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
