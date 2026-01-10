import axios from 'axios';
import logger from './utils/logger.js';

const API_URL = process.env.API_URL || 'http://api.traefik.me';

export const validateAccessCode = async accessCode => {
  try {
    const response = await axios.get(`${API_URL}/api/obs-proxy/validate/${accessCode}`);
    return { valid: true, unitName: response.data.unitName };
  } catch (error) {
    logger.error('Access code validation failed', {
      accessCode,
      error: error.message,
    });
    return { valid: false };
  }
};
