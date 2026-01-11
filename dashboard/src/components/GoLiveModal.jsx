import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import Accordion from 'react-bootstrap/Accordion';
import { useUnit } from '../context/UnitContext';
import { useConfig } from '../context/ConfigContext';

const GoLiveModal = ({ show, onHide, stream }) => {
  const { selectedUnit } = useUnit();
  const { config } = useConfig();
  const navigate = useNavigate();
  const [obsAccess, setObsAccess] = useState(null);
  const [obsAccessLoading, setObsAccessLoading] = useState(false);
  const [streamKeyCopySuccess, setStreamKeyCopySuccess] = useState(false);

  const generateObsAccess = async () => {
    if (!stream) return;

    setObsAccess(null);
    setObsAccessLoading(true);

    try {
      const response = await fetch(
        `${config.apiUrl}/api/units/${selectedUnit.id}/streams/${stream._id}/obs-access`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate access code');
      }

      const accessData = await response.json();
      setObsAccess(accessData);
    } catch (error) {
      console.error('Error generating OBS access:', error);
    } finally {
      setObsAccessLoading(false);
    }
  };

  useEffect(() => {
    if (show && stream) {
      generateObsAccess();
    }
  }, [show, stream]);

  const copyStreamKey = streamKey => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(streamKey).then(() => {
        setStreamKeyCopySuccess(true);
        setTimeout(() => setStreamKeyCopySuccess(false), 2000);
      });
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = streamKey;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setStreamKeyCopySuccess(true);
        setTimeout(() => setStreamKeyCopySuccess(false), 2000);
      } catch (err) {
        console.error('Failed to copy stream key', err);
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-broadcast me-2"></i>
          Go Live Instructions
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {stream && (
          <>
            {obsAccessLoading && (
              <div className="text-center mb-4">
                <Spinner animation="border" size="sm" className="me-2" />
                Generating access code...
              </div>
            )}

            <div className="mb-4">
              <h5>Step 1: Set Stream Key in OBS</h5>
              <div className="d-flex align-items-center gap-2 mb-3">
                <code className="flex-grow-1 p-2 bg-light border rounded">{stream.streamKey}</code>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => copyStreamKey(stream.streamKey)}
                  className="d-flex align-items-center gap-1"
                >
                  <i className={streamKeyCopySuccess ? 'bi bi-check' : 'bi bi-clipboard'}></i>
                  {streamKeyCopySuccess ? 'Copied!' : 'Copy'}
                </Button>
              </div>

              <Accordion>
                <Accordion.Item eventKey="0">
                  <Accordion.Header>How do I set this up in OBS?</Accordion.Header>
                  <Accordion.Body>
                    <ol className="mb-0">
                      <li className="mb-2">
                        <strong>Go to Settings → Stream</strong>
                        <ul className="mt-1">
                          <li>Service: YouTube - RTMPS</li>
                          <li>Server: Primary YouTube ingest server</li>
                          <li>Stream Key: Use the key above</li>
                        </ul>
                      </li>
                      <li className="mb-2">
                        <strong>Click "Apply" and "OK"</strong> to save settings
                      </li>
                    </ol>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            </div>

            {obsAccess && (
              <div className="mb-4">
                <h5>Step 2: Remote Control Setup</h5>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <code className="flex-grow-1 p-2 bg-light border rounded">
                    Access Code: {obsAccess.accessCode}
                  </code>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate(`/obs/${obsAccess.accessCode}`)}
                  >
                    Open Controller
                  </Button>
                </div>
                <small className="text-muted">
                  Access code expires: {new Date(obsAccess.expiresAt).toLocaleString()}
                </small>
              </div>
            )}

            <Alert variant="warning">
              <strong>Important Reminders:</strong>
              <ul className="mb-0 mt-2">
                <li>Test your audio and video before going live</li>
                <li>Remember to pause the stream during sacrament administration</li>
                <li>Click "Start Streaming" in OBS when ready to go live</li>
                <li>Recordings will be automatically deleted within 24 hours</li>
              </ul>
            </Alert>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default GoLiveModal;
