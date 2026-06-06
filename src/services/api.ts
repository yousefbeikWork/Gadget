import axios from "axios";

// آدرس پایه بک‌اند شما
const API_URL = "http://localhost:5000";

// ساخت یک نمونه (Instance) از عکسویس
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    accept: "*/*",
  },
});

// ----------------------------------------------------
// اینترسپتور درخواست (Request Interceptor)
// قبل از ارسال هر درخواست، اکسس‌توکن را به هدر اضافه می‌کند
// ----------------------------------------------------
// ----------------------------------------------------
// اینترسپتور درخواست (Request Interceptor)
// ----------------------------------------------------
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");

    // تغییر اصلی: توکن فقط به مسیرهایی اضافه می‌شود که شامل /auth/ نباشند
    if (accessToken && !config.url?.includes("/auth/")) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ----------------------------------------------------
// اینترسپتور پاسخ (Response Interceptor)
// بررسی خطای ۴۰۱ و تلاش برای گرفتن توکن جدید
// ----------------------------------------------------
// اینترسپتور پاسخ در فایل api.ts
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // تغییر اصلی: شرط !originalRequest.url?.includes('/auth/login') اضافه شد
    if (
      error.response?.status === 401 &&
      !originalRequest.url?.includes("/auth/login") &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token available");

        const response = await axios.post(`${API_URL}/auth/refresh-token`, {
          token: refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.clear(); // پاکسازی کامل
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
