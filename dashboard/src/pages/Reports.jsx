import React, { useState, useEffect } from 'react';
import { Card, Table, Spinner, Alert, Form, Row, Col } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { streamService } from '../services/api';
import AttendanceTrends from '../components/AttendanceTrends';

const Reports = () => {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [trendsData, setTrendsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nameFilter, setNameFilter] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.units?.[0]) return;

      try {
        setLoading(true);
        const unitId = typeof user.units[0] === 'string' ? user.units[0] : user.units[0]._id;

        const [attendanceResponse, trendsResponse] = await Promise.all([
          streamService.getAttendance(unitId),
          streamService.getAttendanceTrends(unitId),
        ]);

        setAttendance(attendanceResponse.data);
        setTrendsData(trendsResponse.data);
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="text-center">
        <Spinner animation="border" />
        <p>Loading attendance data...</p>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">Error: {error}</Alert>;
  }

  // Filter attendance records by name
  const filteredAttendance = attendance.filter(record =>
    record.attendeeName.toLowerCase().includes(nameFilter.toLowerCase())
  );

  // Calculate total count of filtered attendees
  const totalCount = filteredAttendance.reduce((sum, record) => sum + record.attendeeCount, 0);

  return (
    <div>
      <h1>Attendance Reports</h1>

      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>Attendance Trends</Card.Header>
            <Card.Body>
              <AttendanceTrends trendsData={trendsData} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card>
        <Card.Header>
          <div>Attendance Reports</div>
          <small className="text-muted">Last 30 days • {filteredAttendance.length} records</small>
        </Card.Header>
        <Card.Body>
          <Form.Group className="mb-3">
            <Form.Label>Filter by Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter name to filter..."
              value={nameFilter}
              onChange={e => setNameFilter(e.target.value)}
            />
          </Form.Group>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Attendee Name</th>
                <th>Count</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendance.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-muted">
                    {nameFilter
                      ? 'No matching attendance records found'
                      : 'No attendance data available'}
                  </td>
                </tr>
              ) : (
                filteredAttendance.map(record => (
                  <tr key={record._id}>
                    <td>{new Date(record.streamEventId.scheduledDateTime).toLocaleDateString()}</td>
                    <td>
                      {new Date(record.streamEventId.scheduledDateTime).toLocaleTimeString([], {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </td>
                    <td>{record.attendeeName}</td>
                    <td>{record.attendeeCount}</td>
                    <td>{new Date(record.submittedAt).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
          {filteredAttendance.length > 0 && (
            <div className="text-end text-muted">
              <strong>Total Attendees: {totalCount}</strong>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default Reports;
