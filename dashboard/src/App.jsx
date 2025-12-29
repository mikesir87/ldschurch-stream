import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { ConfigProvider, useConfig } from './context/ConfigContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UnitProvider } from './context/UnitContext';
import { StreamProvider } from './context/StreamContext';
import { initializeApi } from './services/api';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import UnitSettings from './pages/UnitSettings';
import Admin from './pages/Admin';
import Login from './pages/Login';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <Login />;
  }

  return (
    <UnitProvider>
      <StreamProvider>
        <Router>
          <Navigation />
          <Container className="mt-4">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<UnitSettings />} />
              {user.role === 'global_admin' && <Route path="/admin" element={<Admin />} />}
            </Routes>
          </Container>
        </Router>
      </StreamProvider>
    </UnitProvider>
  );
}

function App() {
  return (
    <ConfigProvider>
      <ConfigInitializer />
    </ConfigProvider>
  );
}

function ConfigInitializer() {
  const { config, loading, error } = useConfig();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading configuration: {error.message}</div>;

  // Initialize API with config
  initializeApi(config);

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
