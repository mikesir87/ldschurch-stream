import React, { useState } from 'react';
import { Button, Card, Form, Modal, Alert, Spinner } from 'react-bootstrap';
import { useStream } from '../context/StreamContext';

const StreamManagement = () => {
  const { streams, loading, error, createStream, deleteStream } = useStream();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    scheduledDate: '',
    scheduledTime: '10:00 AM',
  });
  const [submitLoading, setSubmitLoading] = useState(false);

  const handleCreateStream = async e => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      await createStream(formData);
      setFormData({ scheduledDate: '', scheduledTime: '10:00 AM' });
      setShowModal(false);
    } catch (error) {
      // Error is handled by context
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleInputChange = e => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Stream Management</h1>
        <Button onClick={() => setShowModal(true)} disabled={loading}>
          Create Stream
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
              </Card.Title>
              <p>
                Status: <span className="badge bg-primary">{stream.status}</span>
              </p>
              {stream.youtubeStreamUrl && (
                <p>
                  Stream URL:{' '}
                  <a href={stream.youtubeStreamUrl} target="_blank" rel="noopener noreferrer">
                    View Stream
                  </a>
                </p>
              )}
              <Button variant="danger" onClick={() => deleteStream(stream._id)} disabled={loading}>
                Cancel Stream
              </Button>
            </Card.Body>
          </Card>
        ))
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Stream</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateStream}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Scheduled Date</Form.Label>
              <Form.Control
                type="date"
                name="scheduledDate"
                value={formData.scheduledDate}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
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
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitLoading}>
              {submitLoading ? <Spinner animation="border" size="sm" /> : 'Create Stream'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default StreamManagement;
