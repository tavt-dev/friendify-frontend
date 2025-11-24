import axios from "axios";
import { CONFIG } from "./configuration";
import { getToken } from "../services/localStorageService";

const httpClient = axios.create({
  baseURL: CONFIG.API_GATEWAY,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add token to all requests
httpClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
httpClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle timeout errors
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      console.error('Request timeout - API Gateway may not be running');
      error.message = 'Kết nối timeout. Vui lòng kiểm tra API Gateway có đang chạy không.';
    }
    
    // Handle connection errors
    if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
      console.error('Connection refused - API Gateway may not be running on port 8080');
      error.message = 'Không thể kết nối tới server. Vui lòng kiểm tra API Gateway có đang chạy không.';
    }
    
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      // Optionally clear token and redirect to login
      // localStorage.removeItem("accessToken");
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default httpClient;