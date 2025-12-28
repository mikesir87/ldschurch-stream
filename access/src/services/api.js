import axios from 'axios';

let api;

export const initializeApi = async () => {
  try {
    const response = await fetch('/config.json');
    const config = await response.json();

    api = axios.create({
      baseURL: config.apiUrl,
    });

    return api;
  } catch (error) {
    console.error('Failed to initialize API:', error);
    // Fallback to default
    api = axios.create({
      baseURL: 'http://api.traefik.me',
    });
    return api;
  }
};

export const getApi = () => {
  if (!api) {
    throw new Error('API not initialized. Call initializeApi first.');
  }
  return api;
};

export default api;
