import { getToken, removeToken, setToken } from "./localStorageService";
import httpClient from "../configurations/httpClient";
import { API, CONFIG } from "../configurations/configuration";

export const logIn = async (username, password) => {
  try {
    const response = await httpClient.post(API.LOGIN, {
      username: username,
      password: password,
    });

    // Handle different response formats
    const token = response.data?.result?.token || response.data?.token || response.data?.data?.token;
    if (token) {
      setToken(token);
    } else {
      console.warn("No token found in response:", response.data);
    }

    return response;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const logOut = () => {
  removeToken();
};

export const isAuthenticated = () => {
  return getToken();
};

export const registerAccount = async ({ username, email, password }) => {
  const response = await httpClient.post(API.REGISTER, {
    username: username,
    email: email,
    password: password,
  });

  return response;
};

export const requestPasswordReset = async (email) => {
  const response = await httpClient.post("/identity/auth/forgot-password", {
    email: email,
  });

  return response;
}

export const resetPassword = async (token, newPassword) => {
  const response = await httpClient.post("/identity/auth/reset-password", {
    token: token,
    newPassword: newPassword,
  });

  return response;
}

export const resendVerification = async (email) => {
  const response = await httpClient.post(API.RESEND_OTP, {
    email: email,
  });

  return response;
}

export const verifyUser = async ({ email, otpCode }) => {
  const response = await httpClient.post(API.VERIFY_USER, {
    email: email,
    otpCode: otpCode,
  });
  return response;
}

export const loginWithGoogle = () => {
  // Redirect to Google OAuth endpoint
  // OAuth2 flow: Frontend -> Identity Service -> Google -> Identity Service -> Frontend callback
  // The proxy in vite.config will forward /identity to http://localhost:8080 (API Gateway)
  // API Gateway will route /api/v1/identity/** to identity service at http://localhost:8081
  // But OAuth2 endpoint should be accessed via API Gateway: /api/v1/identity/oauth2/authorization/google
  const googleLoginUrl = `${CONFIG.API_GATEWAY}${CONFIG.IDENTITY_SERVICE}${API.GOOGLE_LOGIN}`;
  
  // Use relative path - proxy will handle forwarding
  window.location.href = googleLoginUrl;
}