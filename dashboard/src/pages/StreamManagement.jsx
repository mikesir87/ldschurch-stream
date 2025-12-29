import React, { useState } from 'react';
import { Button, Card, Form, Modal, Alert, Spinner } from 'react-bootstrap';
import { useStream } from '../context/StreamContext';

const StreamManagement = () => {
  const { streams, loading, error, createStream, deleteStream } = useStream();
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [streamToDelete, setStreamToDelete] = useState(null);
  const [formData, setFormData] = useState({
    scheduledDate: '',
    scheduledTime: '10:00 AM',
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

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Stream Management</h1>
        <Button onClick={() => setShowModal(true)} disabled={loading}>
          Create Event
        </Button>
      </div>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" />
          <p>Loading streams...</p>
        </div>
      ) : streams.length === 0 ? (
        <Card>
          <Card.Body className="text-center">
            <p>No active streams. Create your first stream to get started.</p>
          </Card.Body>
        </Card>
      ) : (
        streams.map(stream => (
          <Card key={stream._id} className="mb-3">
            <Card.Body>
              <Card.Title>
                {new Date(stream.scheduledDate).toLocaleDateString()} at {stream.scheduledTime}
                {stream.isSpecialEvent && (
                  <span className="badge bg-warning ms-2">Special Event</span>
                )}
              </Card.Title>
              <p>
                Status: <span className="badge bg-primary">{stream.status}</span>
              </p>
              {stream.isSpecialEvent ? (
                <p className="text-muted">
                  <strong>Message:</strong>{' '}
                  {stream.specialEventMessage || 'Special event - no stream'}
                </p>
              ) : (
                stream.youtubeStreamUrl && (
                  <p>
                    Stream URL:{' '}
                    <a href={stream.youtubeStreamUrl} target="_blank" rel="noopener noreferrer">
                      View Stream
                    </a>
                  </p>
                )
              )}
              <Button
                variant="danger"
                onClick={() => handleDeleteStream(stream)}
                disabled={loading}
              >
                Cancel {stream.isSpecialEvent ? 'Event' : 'Stream'}
              </Button>
            </Card.Body>
          </Card>
        ))
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
          <Modal.Title>Confirm Cancellation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {streamToDelete && (
            <p>
              Are you sure you want to cancel this{' '}
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
            Cancel {streamToDelete?.isSpecialEvent ? 'Event' : 'Stream'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default StreamManagement;
