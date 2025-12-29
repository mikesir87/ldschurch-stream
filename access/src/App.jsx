import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import { AttendanceProvider } from './context/AttendanceContext';
import StreamAccess from './pages/StreamAccess';
import KonamiCode from './components/KonamiCode';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/main.scss';

function App() {
  return (
    <AttendanceProvider>
      <Router>
        <div className="app-background">
          <Container className="py-5">
            <Routes>
              <Route path="/" element={<StreamAccess />} />
            </Routes>
          </Container>
          <KonamiCode />
        </div>
      </Router>
    </AttendanceProvider>
  );
}

export default App;
