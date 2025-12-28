import React, { useEffect, useState } from 'react';
import { Card, Button, Alert, Spinner, Form } from 'react-bootstrap';
import { initializeApi } from '../services/api';
import { extractSubdomain } from '../utils/subdomain';

const StreamAccess = () => {
  const [streamData, setStreamData] = useState(null);
  const [unit, setUnit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendeeName, setAttendeeName] = useState('');
  const [attendeeCount, setAttendeeCount] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadStreamData = async () => {
      try {
        const subdomain = extractSubdomain();

        if (!subdomain) {
          setError('Invalid subdomain');
          setLoading(false);
          return;
        }

        const api = await initializeApi();
        const response = await api.get(`/api/public/${subdomain}/current-stream`);

        setUnit(response.data.unit);
        setStreamData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load stream data:', err);
        setError(err.response?.data?.error?.message || 'Failed to load stream information');
        setLoading(false);
      }
    };

    loadStreamData();
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const subdomain = extractSubdomain();
      const api = await initializeApi();

      const response = await api.post(`/api/public/${subdomain}/attend`, {
        attendeeName: attendeeName.trim(),
        attendeeCount: parseInt(attendeeCount),
      });

      // Redirect to YouTube stream
      window.location.href = response.data.streamUrl;
    } catch (err) {
      console.error('Failed to submit attendance:', err);
      setError(err.response?.data?.error?.message || 'Failed to submit attendance');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        <h5>Error</h5>
        <p>{error}</p>
      </Alert>
    );
  }

  return (
    <div className="text-center">
      <Card>
        <Card.Body>
          <Card.Title className="mb-4">{unit?.name || 'Ward'} Sacrament Meeting</Card.Title>

          {streamData?.hasStream ? (
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  value={attendeeName}
                  onChange={e => setAttendeeName(e.target.value)}
                  required
                  placeholder="Enter your name"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Number of Attendees</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  max="20"
                  value={attendeeCount}
                  onChange={e => setAttendeeCount(e.target.value)}
                  required
                />
              </Form.Group>

              <Button
                variant="primary"
                size="lg"
                type="submit"
                disabled={submitting || !attendeeName.trim()}
              >
                {submitting ? 'Submitting...' : 'Join Stream'}
              </Button>
            </Form>
          ) : (
            <Alert variant="info">
              <h5>{streamData?.isSpecialEvent ? 'Special Event' : 'No Active Stream'}</h5>
              <p>
                {streamData?.message ||
                  'There is currently no live stream available. Please check back during sacrament meeting time.'}
              </p>
            </Alert>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default StreamAccess;
