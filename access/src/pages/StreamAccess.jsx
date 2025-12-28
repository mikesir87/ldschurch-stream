import React, { useEffect, useState } from 'react';
import { Card, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { initializeApi } from '../services/api';
import { extractSubdomain } from '../utils/subdomain';

const StreamAccess = () => {
  const navigate = useNavigate();
  const [streamData, setStreamData] = useState(null);
  const [unit, setUnit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
            <div>
              {streamData.stream?.youtubeStreamUrl && (
                <div className="mb-4">
                  <iframe
                    width="100%"
                    height="400"
                    src={streamData.stream.youtubeStreamUrl}
                    title="Sacrament Meeting Stream"
                    frameBorder="0"
                    allowFullScreen
                  />
                </div>
              )}
              <Button variant="primary" size="lg" onClick={() => navigate('/attendance')}>
                Mark Attendance
              </Button>
            </div>
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
