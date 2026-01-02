import React from 'react';
import PropTypes from 'prop-types';
import Table from 'react-bootstrap/Table';

const AttendanceTable = ({ attendance, nameFilter }) => {
  const filteredAttendance = attendance.filter(record =>
    record.attendeeName.toLowerCase().includes(nameFilter.toLowerCase())
  );

  const totalCount = filteredAttendance.reduce((sum, record) => sum + record.attendeeCount, 0);

  return (
    <>
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
    </>
  );
};

AttendanceTable.propTypes = {
  attendance: PropTypes.array.isRequired,
  nameFilter: PropTypes.string.isRequired,
};

export default AttendanceTable;
