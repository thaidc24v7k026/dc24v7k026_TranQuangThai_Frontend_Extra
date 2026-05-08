import axios from 'axios';

const commonConfig = {
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
};

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

export default () => {
  const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    ...commonConfig,
  });

  api.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      const originalRequest = error.config || {};

      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        error.response = {
          data: {
            message: 'Không thể kết nối đến máy chủ.',
          },
        };
        return Promise.reject(error);
      }

      if (originalRequest.url?.includes('/api/auth/refresh')) {
        return Promise.reject(error);
      }

      const isAuthEndpoint = originalRequest.url?.match(/\/api\/auth\/(login|register|google)/);
      if (isAuthEndpoint) {
        return Promise.reject(error);
      }

      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          try {
            await new Promise(function (resolve, reject) {
              failedQueue.push({ resolve, reject });
            });
            originalRequest._retry = true;
            return api(originalRequest);
          } catch (err) {
            return Promise.reject(err);
          }
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          await api.post('/api/auth/refresh', {}, { withCredentials: true });

          processQueue(null);

          return api(originalRequest);
        } catch (err) {
          processQueue(err);

          import('@/store/authStore').then(({ authStore }) => {
            authStore.clearUser();
          });

          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          return Promise.reject(err);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    },
  );

  return api;
};
