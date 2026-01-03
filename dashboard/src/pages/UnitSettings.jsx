import React, { useState, useEffect, useCallback } from 'react';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import ListGroup from 'react-bootstrap/ListGroup';
import { useUnit } from '../context/UnitContext';
import { getApi } from '../services/api';

const UnitSettings = () => {
  const { selectedUnit } = useUnit();
  const [leadershipEmails, setLeadershipEmails] = useState([]);
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const loadSettings = useCallback(async () => {
    try {
      const api = getApi();
      const response = await api.get(`/api/units/${selectedUnit._id}/settings`);
      setLeadershipEmails(response.data.leadershipEmails);
    } catch (error) {
      setMessage({ type: 'danger', text: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  }, [selectedUnit]);

  useEffect(() => {
    if (selectedUnit) {
      loadSettings();
    }
  }, [selectedUnit, loadSettings]);

  const addEmail = () => {
    if (newEmail && !leadershipEmails.includes(newEmail)) {
      setLeadershipEmails([...leadershipEmails, newEmail]);
      setNewEmail('');
    }
  };

  const removeEmail = emailToRemove => {
    setLeadershipEmails(leadershipEmails.filter(email => email !== emailToRemove));
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const api = getApi();
      await api.put(`/api/units/${selectedUnit._id}/settings`, {
        leadershipEmails,
      });
      setMessage({ type: 'success', text: 'Settings saved successfully' });
    } catch (error) {
      setMessage({ type: 'danger', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  if (!selectedUnit) {
    return <Alert variant="warning">Please select a unit to manage settings.</Alert>;
  }

  if (loading) {
    return <div>Loading settings...</div>;
  }

  return (
    <div>
      <h2>Unit Settings - {selectedUnit.name}</h2>

      {message && (
        <Alert variant={message.type} onClose={() => setMessage(null)} dismissible>
          {message.text}
        </Alert>
      )}

      <Card>
        <Card.Header>
          <h5>Leadership Email Addresses</h5>
          <small className="text-muted">
            These email addresses will receive weekly attendance reports every Monday morning.
          </small>
        </Card.Header>
        <Card.Body>
          <Form.Group className="mb-3">
            <Form.Label>Add Email Address</Form.Label>
            <div className="d-flex gap-2">
              <Form.Control
                type="email"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                placeholder="Enter email address"
                onKeyPress={e => e.key === 'Enter' && addEmail()}
              />
              <Button variant="outline-primary" onClick={addEmail}>
                Add
              </Button>
            </div>
          </Form.Group>

          {leadershipEmails.length > 0 ? (
            <ListGroup className="mb-3">
              {leadershipEmails.map((email, index) => (
                <ListGroup.Item
                  key={index}
                  className="d-flex justify-content-between align-items-center"
                >
                  {email}
                  <Button variant="outline-danger" size="sm" onClick={() => removeEmail(email)}>
                    Remove
                  </Button>
                </ListGroup.Item>
              ))}
            </ListGroup>
          ) : (
            <Alert variant="info">
              No leadership email addresses configured. Add email addresses above to receive weekly
              reports.
            </Alert>
          )}

          <Button variant="primary" onClick={saveSettings} disabled={saving}>
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </Card.Body>
      </Card>
    </div>
  );
};

export default UnitSettings;
