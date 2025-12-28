import React, { useState } from 'react'
import { Card, Form, Button, Alert } from 'react-bootstrap'
import { useAttendance } from '../context/AttendanceContext'
import { useNavigate } from 'react-router-dom'

const AttendanceForm = () => {
  const { submitAttendance, loading } = useAttendance()
  const navigate = useNavigate()
  const [attendanceCount, setAttendanceCount] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    await submitAttendance({ count: parseInt(attendanceCount) })
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <Card>
        <Card.Body className="text-center">
          <Alert variant="success">
            <h5>Thank you!</h5>
            <p>Your attendance has been recorded.</p>
          </Alert>
          <Button onClick={() => navigate('/')}>
            Return to Stream
          </Button>
        </Card.Body>
      </Card>
    )
  }

  return (
    <Card>
      <Card.Header>
        <h4>Mark Your Attendance</h4>
      </Card.Header>
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Number of people attending from your household:</Form.Label>
            <Form.Control
              type="number"
              min="1"
              value={attendanceCount}
              onChange={(e) => setAttendanceCount(e.target.value)}
              required
            />
            <Form.Text className="text-muted">
              Please count all family members participating in the meeting.
            </Form.Text>
          </Form.Group>
          
          <div className="d-grid gap-2">
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Attendance'}
            </Button>
            <Button variant="secondary" onClick={() => navigate('/')}>
              Cancel
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  )
}

export default AttendanceForm