import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { ConfigProvider, useConfig } from './context/ConfigContext';
import { StreamProvider } from './context/StreamContext';
import { initializeApi } from './services/api';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import StreamManagement from './pages/StreamManagement';
import Reports from './pages/Reports';
import 'bootstrap/dist/css/bootstrap.min.css';

function AppContent() {
  return (
    <StreamProvider>
      <Router>
        <Navigation />
        <Container className="mt-4">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/streams" element={<StreamManagement />} />
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

  return <AppContent />;
}

export default App;
