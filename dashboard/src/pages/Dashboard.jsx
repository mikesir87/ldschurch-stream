import React from 'react'
import { Row, Col, Card } from 'react-bootstrap'

const Dashboard = () => {
  return (
    <div>
      <h1>Stream Dashboard</h1>
      <Row>
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Active Streams</Card.Title>
              <Card.Text className="h3">0</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Total Attendance</Card.Title>
              <Card.Text className="h3">0</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>This Week</Card.Title>
              <Card.Text className="h3">0</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard