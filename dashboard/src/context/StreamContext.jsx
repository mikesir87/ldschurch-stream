import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { streamService } from '../services/api';
import { useAuth } from './AuthContext';
import { useUnit } from './UnitContext';

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
  const { selectedUnit } = useUnit();

  const unitId = selectedUnit?._id;

  const loadStreams = useCallback(async () => {
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
  }, [unitId]);

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
    } else {
      setStreams([]);
    }
  }, [user, unitId, loadStreams]);

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

StreamProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
