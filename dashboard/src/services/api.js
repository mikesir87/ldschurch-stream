import axios from 'axios';

let api;
let authContext;

export const initializeApi = (config, auth) => {
  authContext = auth;

  api = axios.create({
    baseURL: config.apiUrl,
  });

  api.interceptors.request.use(config => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Response interceptor to handle token refresh on 401
  api.interceptors.response.use(
    response => response,
    async error => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry && authContext?.refreshToken) {
        originalRequest._retry = true;

        try {
          await authContext.refreshToken();
          const newToken = localStorage.getItem('accessToken');
          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
        }
      }

      return Promise.reject(error);
    }
  );

  return api;
};

export const getApi = () => {
  if (!api) {
    throw new Error('API not initialized. Call initializeApi first.');
  }
  return api;
};

export const streamService = {
  getStreams: unitId => getApi().get(`/api/units/${unitId}/streams`),
  createStream: (unitId, streamData) => getApi().post(`/api/units/${unitId}/streams`, streamData),
  updateStream: (unitId, streamId, streamData) =>
    getApi().put(`/api/units/${unitId}/streams/${streamId}`, streamData),
  deleteStream: (unitId, streamId) => getApi().delete(`/api/units/${unitId}/streams/${streamId}`),
  getAttendance: (unitId, params = {}) =>
    getApi().get(`/api/units/${unitId}/attendance`, { params }),
  getAttendanceTrends: unitId => getApi().get(`/api/units/${unitId}/attendance/trends`),
};
