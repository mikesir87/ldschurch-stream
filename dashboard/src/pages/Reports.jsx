import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Alert } from 'react-bootstrap';
import { useUnit } from '../context/UnitContext';
import { streamService } from '../services/api';
import AttendanceTrends from '../components/AttendanceTrends';
import AttendanceSection from '../components/AttendanceSection';

const Reports = () => {
  const { selectedUnit } = useUnit();
  const [streams, setStreams] = useState([]);
  const [trendsData, setTrendsData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStaticData = async () => {
      if (!selectedUnit) return;

      try {
        const unitId = typeof selectedUnit === 'string' ? selectedUnit : selectedUnit._id;

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
  }, [selectedUnit]);

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
