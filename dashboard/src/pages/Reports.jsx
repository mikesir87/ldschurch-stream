import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { streamService } from '../services/api';
import AttendanceTrends from '../components/AttendanceTrends';
import AttendanceSection from '../components/AttendanceSection';

const Reports = () => {
  const { user } = useAuth();
  const [streams, setStreams] = useState([]);
  const [trendsData, setTrendsData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStaticData = async () => {
      if (!user?.units?.[0]) return;

      try {
        const unitId = typeof user.units[0] === 'string' ? user.units[0] : user.units[0]._id;

        const [trendsResponse, streamsResponse] = await Promise.all([
          streamService.getAttendanceTrends(unitId),
          streamService.getStreams(unitId),
        ]);

        setTrendsData(trendsResponse.data);
        setStreams(streamsResponse.data);
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Failed to load data');
      }
    };

    fetchStaticData();
  }, [user]);

  if (error) {
    return <Alert variant="danger">Error: {error}</Alert>;
  }

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

      <AttendanceSection streams={streams} />
    </div>
  );
};

export default Reports;
