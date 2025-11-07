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
} from "@mui/material";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import GoogleIcon from "@mui/icons-material/Google";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import IconButton from "@mui/material/IconButton";
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerAccount } from "../services/identityService";
import LoginLeftPanel from "../components/LoginLeftPanel";

export default function Register() {
  const navigate = useNavigate();
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
      sx={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
      }}
    >
      <LoginLeftPanel variant="register" />

      <Box
        className="register-form-container"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 2, sm: 3, md: 4 },
          backgroundColor: (t) =>
            t.palette.mode === "dark" ? "background.default" : "#f7f8fa",
        }}
      >
        <Card 
          className="register-card"
          sx={{ 
            width: { xs: "100%", sm: 440 }, 
            maxWidth: "100%", 
            boxShadow: { xs: 3, sm: 6 }, 
            borderRadius: { xs: 2, sm: 3 },
            border: (t) => t.palette.mode === "dark" ? "1px solid rgba(255,255,255,0.08)" : "none",
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4 }, "&:last-child": { pb: { xs: 3, sm: 4 } } }}>
            <Box className="register-header" sx={{ mb: { xs: 2.5, sm: 3 } }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.75, fontSize: { xs: "1.375rem", sm: "1.5rem" } }}>
                Tạo tài khoản
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: "0.875rem", sm: "0.875rem" } }}>
                Đăng ký để bắt đầu sử dụng Friendify
              </Typography>
            </Box>

            <Box component="form" onSubmit={onSubmit} noValidate className="register-form">
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
                  mb: 0.75,
                  "& .MuiInputBase-root": {
                    fontSize: { xs: "0.9375rem", sm: "1rem" },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlineIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />

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
                  mb: 0.75,
                  "& .MuiInputBase-root": {
                    fontSize: { xs: "0.9375rem", sm: "1rem" },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MailOutlineIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />

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
                  mb: 0.75,
                  "& .MuiInputBase-root": {
                    fontSize: { xs: "0.9375rem", sm: "1rem" },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton 
                        tabIndex={-1} 
                        onClick={() => setShowPassword((prev) => !prev)} 
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

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
                  mb: 0.75,
                  "& .MuiInputBase-root": {
                    fontSize: { xs: "0.9375rem", sm: "1rem" },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton 
                        tabIndex={-1} 
                        onClick={() => setShowPassword((prev) => !prev)} 
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={submitting}
                sx={{ 
                  mt: 1.5, 
                  mb: 2.5,
                  py: { xs: 1.25, sm: 1.5 },
                  fontSize: { xs: "0.9375rem", sm: "1rem" },
                  fontWeight: 600,
                  textTransform: "none",
                  boxShadow: 2,
                  "&:hover": {
                    boxShadow: 4,
                  },
                }}
              >
                {submitting ? "Đang đăng ký..." : "Đăng ký"}
              </Button>

              <Divider sx={{ my: { xs: 2.5, sm: 3 } }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: "0.8125rem", sm: "0.875rem" } }}>
                  hoặc
                </Typography>
              </Divider>

              <Button
                variant="outlined"
                fullWidth
                startIcon={<GoogleIcon />}
                onClick={() =>
                  setSnack({
                    open: true,
                    message: "Đăng ký với Google sắp ra mắt",
                    severity: "info",
                  })
                }
                sx={{
                  py: { xs: 1.25, sm: 1.5 },
                  fontSize: { xs: "0.9375rem", sm: "1rem" },
                  fontWeight: 500,
                  textTransform: "none",
                  borderColor: (t) => t.palette.mode === "dark" ? "rgba(255,255,255,0.23)" : "rgba(0,0,0,0.23)",
                }}
              >
                Tiếp tục với Google
              </Button>

              <Typography 
                sx={{ 
                  mt: { xs: 2.5, sm: 3 }, 
                  textAlign: "center",
                  fontSize: { xs: "0.875rem", sm: "0.875rem" },
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
                    fontWeight: 600,
                    color: "primary.main",
                  }}
                >
                  Đăng nhập
                </MuiLink>
              </Typography>
            </Box>
          </CardContent>
        </Card>
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
