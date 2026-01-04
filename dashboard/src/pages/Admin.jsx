import React, { useState, useEffect } from 'react';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';
import Modal from 'react-bootstrap/Modal';
import { getApi } from '../services/api';

const Admin = () => {
  const [loading, setLoading] = useState({});
  const [messages, setMessages] = useState({});
  const [units, setUnits] = useState([]);
  const [newUnit, setNewUnit] = useState({ name: '', subdomain: '' });
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [testEmail, setTestEmail] = useState('');

  useEffect(() => {
    loadUnits();
  }, []);

  const loadUnits = async () => {
    try {
      const response = await getApi().get('/api/admin/units');
      setUnits(response.data);
    } catch (error) {
      console.error('Failed to load units:', error);
    }
  };

  const handleCreateUnit = async e => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, createUnit: true }));
    setMessages(prev => ({ ...prev, createUnit: null }));

    try {
      await getApi().post('/api/admin/units', newUnit);
      setMessages(prev => ({
        ...prev,
        createUnit: { type: 'success', text: 'Unit created successfully!' },
      }));
      setNewUnit({ name: '', subdomain: '' });
      loadUnits(); // Refresh the units list
    } catch (error) {
      setMessages(prev => ({
        ...prev,
        createUnit: {
          type: 'danger',
          text: error.response?.data?.error?.message || 'Failed to create unit',
        },
      }));
    } finally {
      setLoading(prev => ({ ...prev, createUnit: false }));
    }
  };

  const handleInviteSpecialist = unit => {
    setSelectedUnit(unit);
    setInviteEmail('');
    setShowInviteModal(true);
  };

  const handleSendInvite = async e => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, sendInvite: true }));

    try {
      await getApi().post(`/api/admin/units/${selectedUnit._id}/invite`, { email: inviteEmail });
      setMessages(prev => ({
        ...prev,
        invite: { type: 'success', text: `Invite sent to ${inviteEmail}` },
      }));
      setShowInviteModal(false);
      setInviteEmail('');
    } catch (error) {
      setMessages(prev => ({
        ...prev,
        invite: {
          type: 'danger',
          text: error.response?.data?.error?.message || 'Failed to send invite',
        },
      }));
    } finally {
      setLoading(prev => ({ ...prev, sendInvite: false }));
    }
  };

  const triggerJob = async (jobType, endpoint, description) => {
    setLoading(prev => ({ ...prev, [jobType]: true }));
    setMessages(prev => ({ ...prev, [jobType]: null }));

    try {
      const response = await getApi().post(endpoint);
      setMessages(prev => ({
        ...prev,
        [jobType]: { type: 'success', text: response.data.message },
      }));
    } catch (error) {
      setMessages(prev => ({
        ...prev,
        [jobType]: {
          type: 'danger',
          text: error.response?.data?.error?.message || `Failed to trigger ${description}`,
        },
      }));
    } finally {
      setLoading(prev => ({ ...prev, [jobType]: false }));
    }
  };

  const handleSendTestEmail = async e => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, testEmail: true }));
    setMessages(prev => ({ ...prev, testEmail: null }));

    try {
      await getApi().post('/api/admin/test/email', { email: testEmail });
      setMessages(prev => ({
        ...prev,
        testEmail: { type: 'success', text: `Test email sent to ${testEmail}` },
      }));
      setTestEmail('');
    } catch (error) {
      setMessages(prev => ({
        ...prev,
        testEmail: {
          type: 'danger',
          text: error.response?.data?.error?.message || 'Failed to send test email',
        },
      }));
    } finally {
      setLoading(prev => ({ ...prev, testEmail: false }));
    }
  };

  return (
    <div>
      <h2>System Administration</h2>
      <p className="text-muted">Manage units and trigger system jobs</p>

      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>
              <h5>Create New Unit</h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleCreateUnit}>
                <Form.Group className="mb-3">
                  <Form.Label>Unit Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., Blacksburg Ward"
                    value={newUnit.name}
                    onChange={e => setNewUnit(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Subdomain</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., blacksburg-va"
                    value={newUnit.subdomain}
                    onChange={e => setNewUnit(prev => ({ ...prev, subdomain: e.target.value }))}
                    pattern="[a-z0-9-]+"
                    title="Only lowercase letters, numbers, and hyphens allowed"
                    required
                  />
                  <Form.Text className="text-muted">
                    Only lowercase letters, numbers, and hyphens. Will be used as:{' '}
                    {newUnit.subdomain}.ldschurch.stream
                  </Form.Text>
                </Form.Group>
                {messages.createUnit && (
                  <Alert variant={messages.createUnit.type}>{messages.createUnit.text}</Alert>
                )}
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading.createUnit || !newUnit.name.trim() || !newUnit.subdomain.trim()}
                >
                  {loading.createUnit ? 'Creating...' : 'Create Unit'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>
              <h5>Existing Units</h5>
            </Card.Header>
            <Card.Body>
              {messages.invite && (
                <Alert variant={messages.invite.type} className="mb-3">
                  {messages.invite.text}
                </Alert>
              )}
              {units.length === 0 ? (
                <p className="text-muted">No units found.</p>
              ) : (
                <Table striped size="sm">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Subdomain</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {units.map(unit => (
                      <tr key={unit._id}>
                        <td>{unit.name}</td>
                        <td>{unit.subdomain}</td>
                        <td>{new Date(unit.createdAt).toLocaleDateString()}</td>
                        <td>
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() => handleInviteSpecialist(unit)}
                          >
                            Invite Specialist
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>
              <h5>YouTube Batch Processing</h5>
            </Card.Header>
            <Card.Body>
              <p>
                Process pending stream events and create YouTube Live broadcasts. Normally runs
                every 4 hours.
              </p>
              {messages.youtube && (
                <Alert variant={messages.youtube.type}>{messages.youtube.text}</Alert>
              )}
              <Button
                variant="primary"
                onClick={() =>
                  triggerJob('youtube', '/api/admin/youtube/batch', 'YouTube batch processing')
                }
                disabled={loading.youtube}
              >
                {loading.youtube ? 'Processing...' : 'Trigger YouTube Batch'}
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>
              <h5>Weekly Reports</h5>
            </Card.Header>
            <Card.Body>
              <p>
                Generate attendance reports and send to leadership. Also cleans up YouTube events.
                Normally runs Monday at 6 AM.
              </p>
              {messages.reports && (
                <Alert variant={messages.reports.type}>{messages.reports.text}</Alert>
              )}
              <Button
                variant="success"
                onClick={() =>
                  triggerJob('reports', '/api/admin/reports/generate', 'report generation')
                }
                disabled={loading.reports}
                className="me-2"
              >
                {loading.reports ? 'Generating...' : 'Generate Reports'}
              </Button>
              <Button
                variant="outline-info"
                size="sm"
                onClick={() =>
                  triggerJob('testData', '/api/admin/test/setup-report-data', 'test data setup')
                }
                disabled={loading.testData}
              >
                {loading.testData ? 'Setting up...' : 'Setup Test Data'}
              </Button>
              {messages.testData && (
                <Alert variant={messages.testData.type} className="mt-2">
                  {messages.testData.text}
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>
              <h5>Stream Completion</h5>
            </Card.Header>
            <Card.Body>
              <p>
                Mark streams as completed if they're 90+ minutes past their start time. Normally
                runs every 30 minutes.
              </p>
              {messages.streamCompletion && (
                <Alert variant={messages.streamCompletion.type}>
                  {messages.streamCompletion.text}
                </Alert>
              )}
              <Button
                variant="warning"
                onClick={() =>
                  triggerJob('streamCompletion', '/api/admin/streams/complete', 'stream completion')
                }
                disabled={loading.streamCompletion}
              >
                {loading.streamCompletion ? 'Processing...' : 'Mark Completed Streams'}
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>
              <h5>SendGrid Configuration Test</h5>
            </Card.Header>
            <Card.Body>
              <p>Send a test email to verify SendGrid settings are configured correctly.</p>
              <Form onSubmit={handleSendTestEmail}>
                <Form.Group className="mb-3">
                  <Form.Label>Test Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="admin@example.com"
                    value={testEmail}
                    onChange={e => setTestEmail(e.target.value)}
                    required
                  />
                  <Form.Text className="text-muted">
                    A test email will be sent to verify SendGrid configuration.
                  </Form.Text>
                </Form.Group>
                {messages.testEmail && (
                  <Alert variant={messages.testEmail.type}>{messages.testEmail.text}</Alert>
                )}
                <Button
                  type="submit"
                  variant="info"
                  disabled={loading.testEmail || !testEmail.trim()}
                >
                  {loading.testEmail ? 'Sending...' : 'Send Test Email'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Invite Specialist Modal */}
      <Modal show={showInviteModal} onHide={() => setShowInviteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Invite Stream Specialist</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSendInvite}>
          <Modal.Body>
            <p>
              Send an invitation to become a stream specialist for{' '}
              <strong>{selectedUnit?.name}</strong>.
            </p>
            <Form.Group>
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                placeholder="specialist@example.com"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                required
              />
              <Form.Text className="text-muted">
                An invitation email will be sent with registration instructions.
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowInviteModal(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading.sendInvite || !inviteEmail.trim()}
            >
              {loading.sendInvite ? 'Sending...' : 'Send Invite'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default Admin;
