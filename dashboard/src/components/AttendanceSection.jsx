import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Card from 'react-bootstrap/Card';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import { useUnit } from '../context/UnitContext';
import { streamService } from '../services/api';
import AttendanceFilters from './AttendanceFilters';
import AttendanceTable from './AttendanceTable';

const AttendanceSection = ({ streams }) => {
  const { selectedUnit } = useUnit();
  const [allAttendance, setAllAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nameFilter, setNameFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!selectedUnit) return;

      try {
        setLoading(true);
        const unitId = typeof selectedUnit === 'string' ? selectedUnit : selectedUnit._id;

        const attendanceResponse = await streamService.getAttendance(unitId);
        setAllAttendance(attendanceResponse.data);
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Failed to load attendance data');
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [selectedUnit]);

  if (error) {
    return <Alert variant="danger">Error: {error}</Alert>;
  }

  // Filter attendance by date first, then by name
  const dateFilteredAttendance = dateFilter
    ? allAttendance.filter(record => {
        const recordDate = new Date(record.streamEventId.scheduledDateTime)
          .toISOString()
          .split('T')[0];
        return recordDate === dateFilter;
      })
    : allAttendance;

  const filteredAttendance = dateFilteredAttendance.filter(record =>
    record.attendeeName.toLowerCase().includes(nameFilter.toLowerCase())
  );

  const streamDates = streams
    .filter(stream => !stream.isSpecialEvent)
    .map(stream => ({
      date: new Date(stream.scheduledDateTime).toISOString().split('T')[0],
      displayDate: new Date(stream.scheduledDateTime).toLocaleDateString(),
    }))
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .filter((stream, index, arr) => index === 0 || stream.date !== arr[index - 1].date);

  return (
    <Card>
      <Card.Header>
        <div>Attendance Reports</div>
        <small className="text-muted">
          {dateFilter
            ? `Showing ${streamDates.find(s => s.date === dateFilter)?.displayDate || dateFilter} • ${filteredAttendance.length} records`
            : `Last 90 days • ${filteredAttendance.length} records`}
        </small>
      </Card.Header>
      <Card.Body>
        <AttendanceFilters
          streams={streams}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          nameFilter={nameFilter}
          setNameFilter={setNameFilter}
        />
        {loading ? (
          <div className="text-center">
            <Spinner animation="border" />
            <p>Loading attendance data...</p>
          </div>
        ) : (
          <AttendanceTable attendance={dateFilteredAttendance} nameFilter={nameFilter} />
        )}
      </Card.Body>
    </Card>
  );
};

AttendanceSection.propTypes = {
  streams: PropTypes.array.isRequired,
};

export default AttendanceSection;
