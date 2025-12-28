import React from 'react'
import { Card, Table } from 'react-bootstrap'

const Reports = () => {
  return (
    <div>
      <h1>Attendance Reports</h1>
      <Card>
        <Card.Header>Weekly Attendance Summary</Card.Header>
        <Card.Body>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Date</th>
                <th>Stream Title</th>
                <th>Attendance</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={3} className="text-center text-muted">
                  No attendance data available
                </td>
              </tr>
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  )
}

export default Reports