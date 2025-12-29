import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';

const Contact = () => {
  return (
    <Container className="py-5">
      <Row>
        <Col lg={6} className="mx-auto">
          <Card>
            <Card.Header>
              <h2>Contact Information</h2>
            </Card.Header>
            <Card.Body>
              <p>
                For questions about LDSChurch.Stream or technical support, please reach out through
                the following channels:
              </p>

              <h5>Technical Support</h5>
              <p>
                Email: <a href="mailto:support@ldschurch.stream">support@ldschurch.stream</a>
              </p>

              <h5>General Inquiries</h5>
              <p>
                Email: <a href="mailto:info@ldschurch.stream">info@ldschurch.stream</a>
              </p>

              <hr />

              <small className="text-muted">
                This service is provided as-is and is not affiliated with The Church of Jesus Christ
                of Latter-Day Saints.
              </small>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Contact;
