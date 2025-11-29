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
      console.warn("Không tìm thấy token thông báo nào trong phản hồi:", response.data);
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

export const changePassword = async (currentPassword, newPassword) => {
  if (!currentPassword || !newPassword) {
    throw new Error('Current password and new password are required');
  }

  const trimmedCurrent = currentPassword.trim();
  const trimmedNew = newPassword.trim();

  try {
    // Most common format: oldPassword and newPassword
    const response = await apiFetch(API_ENDPOINTS.IDENTITY.CHANGE_PASSWORD, {
      method: 'PUT',
      body: JSON.stringify({
        oldPassword: trimmedCurrent,
        newPassword: trimmedNew,
      }),
    });

    return response;
  } catch (error) {
    console.error('Error changing password with oldPassword format:', error);
    
    // If 400 error, try with currentPassword format
    if (error?.response?.status === 400) {
      try {
        console.log('Trying with currentPassword format...');
        const response = await apiFetch(API_ENDPOINTS.IDENTITY.CHANGE_PASSWORD, {
          method: 'PUT',
          body: JSON.stringify({
            currentPassword: trimmedCurrent,
            newPassword: trimmedNew,
          }),
        });
        return response;
      } catch (secondError) {
        console.error('Error with currentPassword format:', secondError);
        // Try POST method as last resort
        if (secondError?.response?.status === 400 || secondError?.response?.status === 405) {
          try {
            console.log('Trying with POST method...');
            const response = await apiFetch(API_ENDPOINTS.IDENTITY.CHANGE_PASSWORD, {
              method: 'POST',
              body: JSON.stringify({
                oldPassword: trimmedCurrent,
                newPassword: trimmedNew,
              }),
            });
            return response;
          } catch (postError) {
            console.error('Error with POST method:', postError);
            throw postError;
          }
        }
        throw secondError;
      }
    }
    
    throw error;
  }
}