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
  IconButton,
} from "@mui/material";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import GoogleIcon from "@mui/icons-material/Google";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { logIn, isAuthenticated } from "../services/identityService";
import LoginLeftPanel from "../components/LoginLeftPanel";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "error" });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/");
    }
  }, [navigate]);

  const validate = () => {
    const e = {};
    if (!username?.trim()) e.username = "Bắt buộc";
    if (!password?.trim()) e.password = "Bắt buộc";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (evt) => {
    evt.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await logIn(username.trim(), password);
      if (res?.status === 200) {
        navigate("/");
      } else {
        setSnack({ open: true, message: "Unable to sign in. Please try again.", severity: "error" });
      }
    } catch (err) {
      const status = err?.response?.status;
      const body = err?.response?.data || {};
      const msg = body?.message ?? body?.error ?? err?.message ?? "Login failed";

      if (status === 403 && (body?.error === "EMAIL_NOT_VERIFIED" || body?.code === "EMAIL_NOT_VERIFIED")) {
        navigate("/verify-email", { state: { email: username.trim(), reason: msg } });
        return;
      }

      if (status === 429 || body?.code === "TOO_MANY_REQUESTS") {
        setSnack({ open: true, message: msg || "Too many attempts. Please wait.", severity: "warning" });
        return;
      }

      if (body?.errors && typeof body.errors === "object") {
        setErrors((prev) => ({ ...prev, ...body.errors }));
        setSnack({ open: true, message: msg || "Validation error", severity: "error" });
        return;
      }

      setSnack({ open: true, message: String(msg), severity: "error" });
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
      <LoginLeftPanel variant="login" />
      <Box
        className="login-form-container"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 2, sm: 3, md: 4 },
          backgroundColor: (t) => (t.palette.mode === "dark" ? "background.default" : "#f7f8fa"),
        }}
      >
        <Card 
          className="login-card"
          sx={{ 
            width: { xs: "100%", sm: 440 }, 
            maxWidth: "100%", 
            boxShadow: { xs: 3, sm: 6 }, 
            borderRadius: { xs: 2, sm: 3 },
            border: (t) => t.palette.mode === "dark" ? "1px solid rgba(255,255,255,0.08)" : "none",
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4 }, "&:last-child": { pb: { xs: 3, sm: 4 } } }}>
            <Box className="login-header" sx={{ mb: { xs: 2.5, sm: 3 } }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.75, fontSize: { xs: "1.375rem", sm: "1.5rem" } }}>
                Chào mừng trở lại
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: "0.875rem", sm: "0.875rem" } }}>
                Đăng nhập vào tài khoản của bạn
              </Typography>
            </Box>

            <Box component="form" onSubmit={onSubmit} noValidate className="login-form">
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
                  mb: 0.5,
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

              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 0.5, mb: 2 }}>
                <MuiLink 
                  tabIndex={-1} 
                  component={Link} 
                  to="#" 
                  underline="hover" 
                  sx={{ 
                    fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                    color: "primary.main",
                    fontWeight: 500,
                  }}
                >
                  Quên mật khẩu?
                </MuiLink>
              </Box>

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={submitting}
                sx={{ 
                  mt: 1, 
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
                {submitting ? "Đang đăng nhập..." : "Tiếp tục"}
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
                onClick={() => setSnack({ open: true, message: "Đăng nhập với Google sắp ra mắt", severity: "info" })}
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
                Mới đến Friendify?{" "}
                <MuiLink 
                  component={Link} 
                  to="/register" 
                  underline="hover"
                  sx={{ 
                    fontWeight: 600,
                    color: "primary.main",
                  }}
                >
                  Tạo tài khoản
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
