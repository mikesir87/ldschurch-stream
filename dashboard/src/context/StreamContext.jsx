import React, { createContext, useContext, useState, useEffect } from 'react';
import { streamService } from '../services/api';

const StreamContext = createContext();

export const useStream = () => {
  const context = useContext(StreamContext);
  if (!context) {
    throw new Error('useStream must be used within a StreamProvider');
  }
  return context;
};

export const StreamProvider = ({ children }) => {
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // For now, using a hardcoded unitId - this should come from auth context
  const unitId = '000000000000000000000001'; // Development unit ID

  const loadStreams = async () => {
    try {
      setLoading(true);
      const response = await streamService.getStreams(unitId);
      setStreams(response.data);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load streams');
    } finally {
      setLoading(false);
    }
  };

  const createStream = async streamData => {
    try {
      setLoading(true);
      const response = await streamService.createStream(unitId, streamData);
      setStreams(prev => [...prev, response.data]);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to create stream');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteStream = async streamId => {
    try {
      setLoading(true);
      await streamService.deleteStream(unitId, streamId);
      setStreams(prev => prev.filter(stream => stream._id !== streamId));
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to delete stream');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStreams();
  }, []);

  const value = {
    streams,
    loading,
    error,
    createStream,
    deleteStream,
    loadStreams,
  };

  return <StreamContext.Provider value={value}>{children}</StreamContext.Provider>;
};
