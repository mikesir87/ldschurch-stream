import React, { useState } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import Container from 'react-bootstrap/Container';
import { useStream } from '../context/StreamContext';
import { useUnit } from '../context/UnitContext';
import { useConfig } from '../context/ConfigContext';

const Dashboard = () => {
  const { streams, loading, error, createStream, deleteStream } = useStream();
  const { selectedUnit } = useUnit();
  const { config } = useConfig();
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [streamToDelete, setStreamToDelete] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [formData, setFormData] = useState({
    scheduledDate: '',
    scheduledTime: '10:00 AM',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    isSpecialEvent: false,
    specialEventMessage: '',
  });
  const [submitLoading, setSubmitLoading] = useState(false);

  const handleCreateStream = async e => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      await createStream(formData);
      setFormData({
        scheduledDate: '',
        scheduledTime: '10:00 AM',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        isSpecialEvent: false,
        specialEventMessage: '',
      });
      setShowModal(false);
    } catch (error) {
      // Error is handled by context
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteStream = stream => {
    setStreamToDelete(stream);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (streamToDelete) {
      await deleteStream(streamToDelete._id);
      setShowDeleteModal(false);
      setStreamToDelete(null);
    }
  };

  const handleInputChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const copyAccessUrl = async () => {
    if (!config || !selectedUnit) return;

    // Get the unit subdomain - check if it's an object with subdomain property or just an ID
    const unit = selectedUnit;
    const unitSubdomain =
      unit?.subdomain || unit?.name?.toLowerCase().replace(/\s+/g, '-') || 'your-unit';

    // Construct the access URL
    let accessUrl = config.apiUrl.replace('api.', `${unitSubdomain}.`);
    if (accessUrl.includes('/api')) {
      accessUrl = accessUrl.replace('/api', '');
    }

    try {
      await navigator.clipboard.writeText(accessUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = accessUrl;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  // Calculate stats
  const now = new Date();
  const upcomingStreams = streams.filter(stream => new Date(stream.scheduledDateTime) >= now);
  const pastStreams = streams.filter(stream => new Date(stream.scheduledDateTime) < now).reverse();
  const activeStreams = streams.filter(stream => stream.status === 'live').length;
  const totalAttendance = pastStreams.reduce(
    (sum, stream) => sum + (stream.totalAttendees || 0),
    0
  );
  const thisWeekAttendance = pastStreams
    .filter(stream => {
      const streamDate = new Date(stream.scheduledDateTime);
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return streamDate >= weekAgo;
    })
    .reduce((sum, stream) => sum + (stream.totalAttendees || 0), 0);

  const renderStreamCard = (stream, isPast = false) => {
    const streamDate = new Date(stream.scheduledDateTime);
    const isWithin24Hours = isPast && now - streamDate <= 24 * 60 * 60 * 1000;

    return (
      <Card key={stream._id} className="mb-3">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-start">
            <div className="flex-grow-1">
              <Card.Title>
                {streamDate.toLocaleDateString()} at{' '}
                {streamDate.toLocaleTimeString([], {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                })}{' '}
                ({stream.timezone?.replace('America/', '').replace('_', ' ') || 'UTC'})
                {stream.isSpecialEvent && (
                  <span className="badge bg-warning ms-2">Special Event</span>
                )}
              </Card.Title>
              <p className="mb-2">
                Status: <span className="badge bg-primary">{stream.status}</span>
                {isPast && stream.totalAttendees !== undefined && (
                  <span className="ms-3">
                    Total Attendees: <strong>{stream.totalAttendees}</strong>
                  </span>
                )}
              </p>
              {stream.isSpecialEvent && (
                <p className="text-muted mb-0">
                  <strong>Message:</strong>{' '}
                  {stream.specialEventMessage || 'Special event - no stream'}
                </p>
              )}
            </div>
            <div className="d-flex flex-column gap-2 ms-3">
              {!stream.isSpecialEvent &&
                stream.youtubeStreamUrl &&
                (isWithin24Hours || !isPast) && (
                  <Button
                    variant="outline-primary"
                    size="sm"
                    href={stream.youtubeStreamUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    as="a"
                    className="d-flex align-items-center gap-1"
                  >
                    <i className="bi bi-play-circle"></i>
                    View Stream
                  </Button>
                )}
              {!isPast && (
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => handleDeleteStream(stream)}
                  disabled={loading}
                  className="d-flex align-items-center gap-1"
                >
                  <i className="bi bi-trash"></i>
                  Delete
                </Button>
              )}
            </div>
          </div>
        </Card.Body>
      </Card>
    );
  };

  return (
    <div className="fade-in">
      {/* Dashboard Header */}
      <div className="dashboard-header text-center">
        <Container>
          <h1>Stream Dashboard</h1>
          <p className="lead mb-0">Manage your congregation's streaming events</p>
        </Container>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary-dark mb-0">Overview</h2>
        <Button onClick={() => setShowModal(true)} disabled={loading} className="btn-primary">
          Create Event
        </Button>
      </div>

      {/* Stats Cards */}
      <Row className="mb-5">
        <Col md={3}>
          <Card className="stats-card border-primary-light">
            <Card.Body className="text-center">
              <div className="stats-number">{activeStreams}</div>
              <div className="stats-label">Active Streams</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stats-card border-primary-light">
            <Card.Body className="text-center">
              <div className="stats-number">{totalAttendance}</div>
              <div className="stats-label">Total Attendance</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stats-card border-primary-light">
            <Card.Body className="text-center">
              <div className="stats-number">{thisWeekAttendance}</div>
              <div className="stats-label">This Week</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stats-card border-primary-light">
            <Card.Body>
              <div className="stats-label mb-2">Stream Access URL</div>
              <div className="d-flex align-items-center gap-2">
                <small className="text-muted flex-grow-1" style={{ fontSize: '0.75rem' }}>
                  {config && selectedUnit
                    ? (() => {
                        const unit = selectedUnit;
                        const unitSubdomain =
                          unit?.subdomain ||
                          unit?.name?.toLowerCase().replace(/\s+/g, '-') ||
                          'your-unit';
                        let url = config.apiUrl.replace('api.', `${unitSubdomain}.`);
                        if (url.includes('/api')) {
                          url = url.replace('/api', '');
                        }
                        return url;
                      })()
                    : 'Loading...'}
                </small>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={copyAccessUrl}
                  disabled={!config}
                  className="d-flex align-items-center gap-1"
                >
                  <i className={copySuccess ? 'bi bi-check' : 'bi bi-clipboard'}></i>
                  {copySuccess ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {loading ? (
        <div className="loading-spinner">
          <div className="text-center">
            <Spinner animation="border" />
            <p className="mt-3 text-muted">Loading streams...</p>
          </div>
        </div>
      ) : streams.length === 0 ? (
        <Card>
          <Card.Body className="text-center">
            <p>No active streams. Create your first stream to get started.</p>
          </Card.Body>
        </Card>
      ) : (
        <>
          {/* Upcoming Events */}
          <Card className="mb-4">
            <Card.Header>
              <h4 className="mb-0">Upcoming Events</h4>
            </Card.Header>
            <Card.Body>
              {upcomingStreams.length === 0 ? (
                <p className="text-muted mb-0">No upcoming events scheduled.</p>
              ) : (
                upcomingStreams.map(stream => renderStreamCard(stream))
              )}
            </Card.Body>
          </Card>

          {/* Past Events */}
          {pastStreams.length > 0 && (
            <Card className="mb-4">
              <Card.Header>
                <h4 className="mb-0">Past Events</h4>
              </Card.Header>
              <Card.Body>{pastStreams.map(stream => renderStreamCard(stream, true))}</Card.Body>
            </Card>
          )}
        </>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Event</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateStream}>
          <Modal.Body>
            <Form.Group controlId="scheduledDate" className="mb-3">
              <Form.Label>Scheduled Date</Form.Label>
              <Form.Control
                type="date"
                name="scheduledDate"
                value={formData.scheduledDate}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="scheduledTime" className="mb-3">
              <Form.Label>Scheduled Time</Form.Label>
              <Form.Control
                type="text"
                name="scheduledTime"
                value={formData.scheduledTime}
                onChange={handleInputChange}
                placeholder="e.g., 10:00 AM"
                required
              />
            </Form.Group>
            <Form.Group controlId="timezone" className="mb-3">
              <Form.Label>Timezone</Form.Label>
              <Form.Select
                name="timezone"
                value={formData.timezone}
                onChange={handleInputChange}
                required
              >
                <option value="America/New_York">Eastern Time (New York)</option>
                <option value="America/Chicago">Central Time (Chicago)</option>
                <option value="America/Denver">Mountain Time (Denver)</option>
                <option value="America/Phoenix">Arizona Time (Phoenix)</option>
                <option value="America/Los_Angeles">Pacific Time (Los Angeles)</option>
                <option value="America/Anchorage">Alaska Time (Anchorage)</option>
                <option value="Pacific/Honolulu">Hawaii Time (Honolulu)</option>
                {![
                  'America/New_York',
                  'America/Chicago',
                  'America/Denver',
                  'America/Phoenix',
                  'America/Los_Angeles',
                  'America/Anchorage',
                  'Pacific/Honolulu',
                ].includes(formData.timezone) && (
                  <option value={formData.timezone}>{formData.timezone} (Detected)</option>
                )}
              </Form.Select>
            </Form.Group>
            <Form.Group controlId="isSpecialEvent" className="mb-3">
              <Form.Check
                type="checkbox"
                name="isSpecialEvent"
                label="Special Event (No Stream)"
                checked={formData.isSpecialEvent}
                onChange={handleInputChange}
              />
              <Form.Text className="text-muted">
                Check this for weeks with no stream (e.g., Stake Conference, General Conference)
              </Form.Text>
            </Form.Group>
            {formData.isSpecialEvent && (
              <Form.Group controlId="specialEventMessage" className="mb-3">
                <Form.Label>Special Event Message</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="specialEventMessage"
                  value={formData.specialEventMessage}
                  onChange={handleInputChange}
                  placeholder="e.g., No stream this week due to Stake Conference"
                  required={formData.isSpecialEvent}
                />
                <Form.Text className="text-muted">
                  This message will be displayed to attendees when they visit the stream access
                  page.
                </Form.Text>
              </Form.Group>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitLoading}>
              {submitLoading ? <Spinner animation="border" size="sm" /> : 'Create Event'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {streamToDelete && (
            <p>
              Are you sure you want to delete this{' '}
              {streamToDelete.isSpecialEvent ? 'event' : 'stream'} scheduled for{' '}
              {new Date(streamToDelete.scheduledDate).toLocaleDateString()} at{' '}
              {streamToDelete.scheduledTime}?
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Keep Event
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete {streamToDelete?.isSpecialEvent ? 'Event' : 'Stream'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Dashboard;
