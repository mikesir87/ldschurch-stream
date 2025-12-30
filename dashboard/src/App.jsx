import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider, useConfig } from './context/ConfigContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UnitProvider } from './context/UnitContext';
import { StreamProvider } from './context/StreamContext';
import { initializeApi } from './services/api';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import UnitSettings from './pages/UnitSettings';
import Admin from './pages/Admin';
import Login from './pages/Login';
import KonamiCode from './components/KonamiCode';

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
          <div className="app-layout">
            <Navigation />
            <div className="main-content d-flex flex-column flex-grow-1">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/settings" element={<UnitSettings />} />
                {user.role === 'global_admin' && <Route path="/admin" element={<Admin />} />}
              </Routes>
              <Footer />
            </div>
          </div>
          <KonamiCode />
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

  return (
    <AuthProvider>
      <AuthInitializer config={config} />
    </AuthProvider>
  );
}

function AuthInitializer({ config }) {
  const auth = useAuth();

  React.useEffect(() => {
    // Initialize API with config and auth context
    initializeApi(config, auth);
  }, [config, auth]);

  return <AppContent />;
}

export default App;
