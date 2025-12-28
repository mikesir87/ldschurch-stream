import React, { createContext, useContext, useState, useEffect } from 'react';
import { streamService } from '../services/api';
import { useAuth } from './AuthContext';

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
  const { user } = useAuth();

  // Use the first unit from the user's units, or fallback to hardcoded for development
  const unitId = user?.units?.[0]?._id || user?.units?.[0] || '000000000000000000000001';

  const loadStreams = async () => {
    if (!unitId) return;

    try {
      setLoading(true);
      const response = await streamService.getStreams(unitId);
      setStreams(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load streams');
    } finally {
      setLoading(false);
    }
  };

  const createStream = async streamData => {
    if (!unitId) return;

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
    if (!unitId) return;

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
    if (user && unitId) {
      loadStreams();
    }
  }, [user, unitId]);

  const value = {
    streams,
    loading,
    error,
    createStream,
    deleteStream,
    loadStreams,
    unitId,
  };

  return <StreamContext.Provider value={value}>{children}</StreamContext.Provider>;
};
