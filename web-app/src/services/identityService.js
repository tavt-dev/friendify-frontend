import { getToken, removeToken, setToken } from "./localStorageService";
import { API_ENDPOINTS, CONFIG } from "../config/apiConfig";
import { apiFetch } from "./apiHelper";

export const logIn = async (username, password) => {
  try {
    const response = await apiFetch(API_ENDPOINTS.IDENTITY.LOGIN, {
      method: 'POST',
      body: JSON.stringify({
        username: username,
        password: password,
      }),
    });

    const token = response.data?.result?.token || response.data?.token || response.data?.data?.token;
    if (token) {
      setToken(token);
    } else {
      if (import.meta.env.DEV) {
        console.warn("Không tìm thấy token thông báo nào trong phản hồi:", response.data);
      }
    }

    return response;
  } catch (error) {
    console.error("Đăng nhập thất bại: ", error);
    throw error;
  }
};

export const logOut = () => {
  removeToken();
};

export const isAuthenticated = () => {
  return getToken();
};

export const registerAccount = async ({ username, email, password, firstName, lastName}) => {
  const response = await apiFetch(API_ENDPOINTS.IDENTITY.REGISTER, {
    method: 'POST',
    body: JSON.stringify({
      username: username,
      email: email,
      password: password,
      firstName: firstName,
      lastName: lastName,
    }),
  });

  return response;
};

export const requestPasswordReset = async (email) => {
  const response = await apiFetch(API_ENDPOINTS.IDENTITY.FORGOT_PASSWORD, {
    method: 'POST',
    body: JSON.stringify({
      email: email,
    }),
  });

  return response;
}

export const resetPassword = async ({ email, otpCode, newPassword }) => {
  const response = await apiFetch(API_ENDPOINTS.IDENTITY.RESET_PASSWORD, {
    method: 'POST',
    body: JSON.stringify({
      email: email,
      otpCode: otpCode,
      newPassword: newPassword,
    }),
  });

  return response;
}

export const resendVerification = async (email) => {
  const response = await apiFetch(API_ENDPOINTS.IDENTITY.RESEND_OTP, {
    method: 'POST',
    body: JSON.stringify({
      email: email,
    }),
  });

  return response;
}

export const verifyUser = async ({ email, otpCode }) => {
  const response = await apiFetch(API_ENDPOINTS.IDENTITY.VERIFY_USER, {
    method: 'POST',
    body: JSON.stringify({
      email: email,
      otpCode: otpCode,
    }),
  });
  return response;
}

export const loginWithGoogle = () => {
  // Use relative path to go through Vite proxy -> Gateway
  const googleLoginUrl = `/api/v1/identity/oauth2/authorization/google`;
  
  window.location.href = googleLoginUrl;
}