import axios from 'axios';

let api;

export const initializeApi = config => {
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
};
