import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Badge from 'react-bootstrap/Badge';
import { useConfig } from '../context/ConfigContext';

function ObsController() {
  const { accessCode } = useParams();
  const navigate = useNavigate();
  const { config } = useConfig();
  const [validation, setValidation] = useState(null);
  const [proxyConnected, setProxyConnected] = useState(false);
  const [obsConnected, setObsConnected] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [error, setError] = useState(null);
  const proxySocketRef = useRef(null);
  const obsSocketRef = useRef(null);

  useEffect(() => {
    validateAccessCode();
  }, [accessCode]);

  useEffect(() => {
    if (validation?.valid) {
      connectToProxy();
    }

    // Warn user before leaving page
    const handleBeforeUnload = e => {
      if (proxyConnected || obsConnected) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      if (proxySocketRef.current) proxySocketRef.current.close();
      if (obsSocketRef.current) obsSocketRef.current.close();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [validation]);

  const validateAccessCode = async () => {
    try {
      const response = await fetch(`${config.obsProxyUrl}/validate/${accessCode}`);
      const result = await response.json();
      setValidation(result);
      if (!result.valid) {
        setError('Invalid or expired access code');
      }
    } catch (err) {
      setError('Failed to validate access code');
    }
  };

  const connectToProxy = () => {
    const wsUrl = config.obsProxyUrl.replace(/^http/, 'ws') + `/${accessCode}`;
    proxySocketRef.current = new WebSocket(wsUrl);

    proxySocketRef.current.onopen = () => {
      setProxyConnected(true);
      setError(null);
    };

    proxySocketRef.current.onclose = () => {
      setProxyConnected(false);
      if (obsSocketRef.current) obsSocketRef.current.close();
    };

    proxySocketRef.current.onmessage = event => {
      if (event.data === 'CONNECT') {
        connectToObs();
      } else if (obsSocketRef.current) {
        obsSocketRef.current.send(event.data);
      }
    };

    proxySocketRef.current.onerror = () => {
      setError('Failed to connect to proxy service');
    };
  };

  const connectToObs = () => {
    obsSocketRef.current = new WebSocket('ws://localhost:4455');

    obsSocketRef.current.onopen = () => {
      setObsConnected(true);
      proxySocketRef.current.send('CONNECTED');
    };

    obsSocketRef.current.onclose = () => {
      setObsConnected(false);
      if (proxySocketRef.current) proxySocketRef.current.close();
    };

    obsSocketRef.current.onmessage = event => {
      if (proxySocketRef.current) {
        proxySocketRef.current.send(event.data);
      }
    };

    obsSocketRef.current.onerror = () => {
      setError('Failed to connect to OBS. Make sure OBS is running with WebSocket server enabled.');
    };
  };

  const copyAccessCode = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(accessCode).then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      });
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = accessCode;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (err) {
        console.error('Failed to copy access code', err);
      }
      document.body.removeChild(textArea);
    }
  };

  if (error && !validation?.valid) {
    return (
      <Container className="mt-4">
        <Row className="justify-content-center">
          <Col md={6}>
            <Card>
              <Card.Body className="text-center">
                <i
                  className="bi bi-exclamation-triangle text-danger"
                  style={{ fontSize: '3rem' }}
                ></i>
                <Card.Title className="text-danger mt-3">Invalid Access Code</Card.Title>
                <Card.Text>
                  The access code <code>{accessCode}</code> is invalid or has expired.
                </Card.Text>
                <Card.Text className="text-muted">
                  Please generate a new access code from the dashboard.
                </Card.Text>
                <Button variant="primary" onClick={() => navigate('/')}>
                  <i className="bi bi-arrow-left me-2"></i>Back to Dashboard
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card>
            <Card.Header className="bg-primary text-white">
              <Card.Title className="mb-0">
                <i className="bi bi-camera-video me-2"></i>OBS Remote Control
              </Card.Title>
            </Card.Header>
            <Card.Body>
              <Row className="mb-4">
                <Col md={8}>
                  <div className="d-flex align-items-center">
                    <i className="bi bi-key me-2 text-muted"></i>
                    <span className="text-muted me-2">Access Code:</span>
                    <code className="bg-light px-2 py-1 rounded me-2">{accessCode}</code>
                    <Button variant="outline-primary" size="sm" onClick={copyAccessCode}>
                      <i className={`bi ${copySuccess ? 'bi-check' : 'bi-clipboard'} me-1`}></i>
                      {copySuccess ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                </Col>
              </Row>

              <Row className="g-3">
                <Col md={6}>
                  <Card className="border-0 bg-light">
                    <Card.Body className="text-center">
                      <i className="bi bi-wifi text-primary" style={{ fontSize: '2rem' }}></i>
                      <Card.Title as="h6" className="mt-2">
                        Proxy Connection
                      </Card.Title>
                      <Badge bg={proxyConnected ? 'success' : 'danger'}>
                        {proxyConnected ? 'Connected' : 'Disconnected'}
                      </Badge>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="border-0 bg-light">
                    <Card.Body className="text-center">
                      <i
                        className="bi bi-camera-video text-primary"
                        style={{ fontSize: '2rem' }}
                      ></i>
                      <Card.Title as="h6" className="mt-2">
                        OBS Connection
                      </Card.Title>
                      <Badge bg={obsConnected ? 'success' : 'danger'}>
                        {obsConnected ? 'Connected' : 'Disconnected'}
                      </Badge>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {error && (
                <Alert variant="danger" className="mt-3">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </Alert>
              )}

              <Alert variant="warning" className="mt-4">
                <i className="bi bi-exclamation-triangle me-2"></i>
                <strong>Keep this page open!</strong> The OBS connection will be lost if you
                navigate away or close this tab.
              </Alert>

              <Alert variant="info">
                <i className="bi bi-info-circle me-2"></i>
                <strong>Instructions:</strong>
                <ol className="mb-0 mt-2">
                  <li>This page will automatically connect to OBS when ready</li>
                  <li>Copy the access code above to use on your phone controller</li>
                  <li>Open the controller app on your phone and enter the access code</li>
                </ol>
              </Alert>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default ObsController;
