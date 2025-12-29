import React, { createContext, useContext, useState, useEffect } from 'react';
import { getApi } from '../services/api';
import { useAuth } from './AuthContext';

const UnitContext = createContext();

export const useUnit = () => {
  const context = useContext(UnitContext);
  if (!context) {
    throw new Error('useUnit must be used within UnitProvider');
  }
  return context;
};

export const UnitProvider = ({ children }) => {
  const { user } = useAuth();
  const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUnits();
    } else {
      setUnits([]);
      setSelectedUnit(null);
      setLoading(false);
    }
  }, [user]);

  const fetchUnits = async () => {
    try {
      const response = await getApi().get('/api/units');
      setUnits(response.data);

      // Auto-select first unit if none selected
      if (response.data.length > 0 && !selectedUnit) {
        setSelectedUnit(response.data[0]);
      }
    } catch (error) {
      console.error('Failed to fetch units:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectUnit = unit => {
    setSelectedUnit(unit);
  };

  return (
    <UnitContext.Provider
      value={{
        units,
        selectedUnit,
        selectUnit,
        loading,
      }}
    >
      {children}
    </UnitContext.Provider>
  );
};
