import React, { useState } from 'react';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { getApi } from '../services/api';

const Admin = () => {
  const [loading, setLoading] = useState({});
  const [messages, setMessages] = useState({});

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

  return (
    <div>
      <h2>System Administration</h2>
      <p className="text-muted">Manually trigger system jobs and processes</p>

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
    </div>
  );
};

export default Admin;
