import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Container } from 'react-bootstrap'
import { AttendanceProvider } from './context/AttendanceContext'
import StreamAccess from './pages/StreamAccess'
import AttendanceForm from './pages/AttendanceForm'
import 'bootstrap/dist/css/bootstrap.min.css'

function App() {
  return (
    <AttendanceProvider>
      <Router>
        <Container className="mt-4">
          <Routes>
            <Route path="/" element={<StreamAccess />} />
            <Route path="/attendance" element={<AttendanceForm />} />
          </Routes>
        </Container>
      </Router>
    </AttendanceProvider>
  )
}

export default App