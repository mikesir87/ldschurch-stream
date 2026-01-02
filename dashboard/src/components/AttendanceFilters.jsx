import React from 'react';
import PropTypes from 'prop-types';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

const AttendanceFilters = ({ streams, dateFilter, setDateFilter, nameFilter, setNameFilter }) => {
  const streamDates = streams
    .filter(stream => !stream.isSpecialEvent)
    .map(stream => ({
      date: new Date(stream.scheduledDateTime).toISOString().split('T')[0],
      displayDate: new Date(stream.scheduledDateTime).toLocaleDateString(),
    }))
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .filter((stream, index, arr) => index === 0 || stream.date !== arr[index - 1].date);

  return (
    <Row className="mb-3">
      <Col md={6}>
        <Form.Group>
          <Form.Label>Filter by Date</Form.Label>
          <Form.Select value={dateFilter} onChange={e => setDateFilter(e.target.value)}>
            <option value="">All dates</option>
            {streamDates.map(stream => (
              <option key={stream.date} value={stream.date}>
                {stream.displayDate}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      </Col>
      <Col md={6}>
        <Form.Group>
          <Form.Label>Filter by Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter name to filter..."
            value={nameFilter}
            onChange={e => setNameFilter(e.target.value)}
          />
        </Form.Group>
      </Col>
    </Row>
  );
};

AttendanceFilters.propTypes = {
  streams: PropTypes.array.isRequired,
  dateFilter: PropTypes.string.isRequired,
  setDateFilter: PropTypes.func.isRequired,
  nameFilter: PropTypes.string.isRequired,
  setNameFilter: PropTypes.func.isRequired,
};

export default AttendanceFilters;
