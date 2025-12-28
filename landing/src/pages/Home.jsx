import React from 'react'
import { Container, Row, Col, Card, Button } from 'react-bootstrap'

const Home = () => {
  return (
    <div>
      <div className="bg-primary text-white py-5">
        <Container>
          <Row>
            <Col lg={8} className="mx-auto text-center">
              <h1 className="display-4">LDSChurch.Stream</h1>
              <p className="lead">
                Help your congregation provide YouTube streams of sacrament meetings
              </p>
              <Button variant="light" size="lg">
                Get Started
              </Button>
            </Col>
          </Row>
        </Container>
      </div>

      <Container className="py-5">
        <Row>
          <Col md={4}>
            <Card className="h-100">
              <Card.Body>
                <Card.Title>Easy Setup</Card.Title>
                <Card.Text>
                  Simple configuration for stream specialists to manage YouTube Live streams
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="h-100">
              <Card.Body>
                <Card.Title>Automated Reporting</Card.Title>
                <Card.Text>
                  Weekly attendance reports sent automatically to ward leadership
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="h-100">
              <Card.Body>
                <Card.Title>Privacy Compliant</Card.Title>
                <Card.Text>
                  Recordings deleted within 24 hours, unlisted streams for privacy
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default Home