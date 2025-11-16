import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";
import { setToken } from "../services/localStorageService";

export default function OAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    if (error) {
      // Handle OAuth error
      console.error("OAuth error:", error, errorDescription);
      
      let errorMessage = "Đăng nhập với Google thất bại. Vui lòng thử lại.";
      
      if (error === "EMAIL_NOT_PROVIDED") {
        errorMessage = "Không thể lấy email từ Google. Vui lòng thử lại.";
      } else if (error === "invalid_client") {
        errorMessage = "Lỗi: Client ID không tồn tại hoặc không đúng. Vui lòng kiểm tra:\n1. Biến môi trường GOOGLE_CLIENT_ID đã được set chưa?\n2. Client ID trong Google Console có đúng không?\n3. Đã khởi động lại identity-service sau khi set biến môi trường chưa?\n\nXem file GOOGLE_OAUTH_SETUP.md để biết thêm chi tiết.";
      } else if (error === "redirect_uri_mismatch") {
        errorMessage = "Lỗi: Redirect URI không khớp. Vui lòng kiểm tra redirect URI trong Google Console phải là: http://localhost:8081/identity/login/oauth2/code/google";
      } else if (errorDescription) {
        errorMessage = `Lỗi: ${errorDescription}`;
      }
      
      navigate("/login", { 
        state: { error: errorMessage } 
      });
      return;
    }

    if (token) {
      // Save token and redirect to home
      setToken(token);
      navigate("/", { replace: true });
    } else {
      // No token found, redirect to login
      navigate("/login", { 
        state: { error: "Không nhận được token từ Google. Vui lòng thử lại." } 
      });
    }
  }, [searchParams, navigate]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        gap: 2,
      }}
    >
      <CircularProgress size={48} />
      <Typography variant="body1" color="text.secondary">
        Đang xử lý đăng nhập...
      </Typography>
    </Box>
  );
}

