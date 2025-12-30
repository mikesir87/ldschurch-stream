import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import { AttendanceProvider } from './context/AttendanceContext';
import StreamAccess from './pages/StreamAccess';
import Footer from './components/Footer';
import KonamiCode from './components/KonamiCode';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/main.scss';

function App() {
  return (
    <AttendanceProvider>
      <Router>
        <div className="app-background d-flex flex-column min-vh-100">
          <Container className="py-5 flex-grow-1">
            <Routes>
              <Route path="/" element={<StreamAccess />} />
            </Routes>
          </Container>
          <Footer />
          <KonamiCode />
        </div>
      </Router>
    </AttendanceProvider>
  );
}

export default App;
