import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { ConfigProvider, useConfig } from './context/ConfigContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StreamProvider } from './context/StreamContext';
import { initializeApi } from './services/api';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import Login from './pages/Login';
import 'bootstrap/dist/css/bootstrap.min.css';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <Login />;
  }

  return (
    <StreamProvider>
      <Router>
        <Navigation />
        <Container className="mt-4">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </Container>
      </Router>
    </StreamProvider>
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
