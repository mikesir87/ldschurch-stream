import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Container } from 'react-bootstrap'
import { StreamProvider } from './context/StreamContext'
import Navigation from './components/Navigation'
import Dashboard from './pages/Dashboard'
import StreamManagement from './pages/StreamManagement'
import Reports from './pages/Reports'
import 'bootstrap/dist/css/bootstrap.min.css'

function App() {
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
  )
}

export default App