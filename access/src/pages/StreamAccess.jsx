import React, { useEffect, useState } from 'react';
import { Card, Button, Spinner, Form } from 'react-bootstrap';
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
      <div className="stream-access-container">
        <div className="text-center">
          <Spinner animation="border" role="status" variant="light" size="lg">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="text-white mt-3">Loading stream information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="stream-access-container">
        <div className="special-event-message bg-danger text-white">
          <div className="icon">⚠️</div>
          <h3>Error</h3>
          <p className="mb-0">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="stream-access-container">
      <div className="text-center mb-4">
        <h1 className="text-white mb-3">{unit?.name || 'Ward'}</h1>
      </div>

      {streamData?.hasStream ? (
        <div className="attendance-form">
          <div className="text-center mb-4">
            <p className="text-white lead mb-2">
              Before joining today's stream, please help us know who's attending
            </p>
            <p className="text-white-50">This helps our leadership assist in ministering efforts</p>
          </div>

          <Card className="shadow-lg">
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={attendeeName}
                    onChange={e => setAttendeeName(e.target.value)}
                    required
                    placeholder="Enter your name"
                    size="lg"
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Number of Attendees</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    max="20"
                    value={attendeeCount}
                    onChange={e => setAttendeeCount(e.target.value)}
                    required
                    size="lg"
                  />
                </Form.Group>

                <Button
                  variant="primary"
                  size="lg"
                  type="submit"
                  disabled={submitting || !attendeeName.trim()}
                  className="w-100"
                >
                  {submitting ? 'Submitting...' : 'Join Stream'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </div>
      ) : (
        <div className="special-event-message">
          <div className="icon">📺</div>
          <h3>{streamData?.isSpecialEvent ? 'Special Event' : 'No Active Stream'}</h3>
          <p className="mb-0">
            {streamData?.message ||
              'There is currently no live stream available. Please check back during sacrament meeting time.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default StreamAccess;
