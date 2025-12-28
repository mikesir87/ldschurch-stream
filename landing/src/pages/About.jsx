import React from 'react'
import { Container, Row, Col, Alert } from 'react-bootstrap'

const About = () => {
  return (
    <Container className="py-5">
      <Row>
        <Col lg={8} className="mx-auto">
          <h1>About LDSChurch.Stream</h1>
          
          <p>
            LDSChurch.Stream is a tool designed to help congregations of The Church of Jesus Christ 
            of Latter-Day Saints provide YouTube streams of their sacrament meetings.
          </p>

          <h3>Key Features</h3>
          <ul>
            <li>YouTube Live stream management</li>
            <li>Automated attendance reporting</li>
            <li>Subdomain-based unit access</li>
            <li>Weekly email reports to leadership</li>
            <li>Automated stream cleanup (24-hour retention)</li>
          </ul>

          <h3>Church Guidelines Compliance</h3>
          <ul>
            <li>Stream recordings deleted within 24 hours</li>
            <li>Unlisted YouTube events for privacy</li>
            <li>Honesty-based attendance (no identity verification)</li>
          </ul>

          <Alert variant="info">
            <strong>Note:</strong> This is not an official product of The Church of Jesus Christ of Latter-Day Saints.
          </Alert>
        </Col>
      </Row>
    </Container>
  )
}

export default About