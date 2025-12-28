import React, { useState } from 'react'
import { Button, Card, Form, Modal } from 'react-bootstrap'
import { useStream } from '../context/StreamContext'

const StreamManagement = () => {
  const { streams, createStream, deleteStream } = useStream()
  const [showModal, setShowModal] = useState(false)
  const [streamTitle, setStreamTitle] = useState('')

  const handleCreateStream = async (e) => {
    e.preventDefault()
    await createStream({ title: streamTitle })
    setStreamTitle('')
    setShowModal(false)
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Stream Management</h1>
        <Button onClick={() => setShowModal(true)}>Create Stream</Button>
      </div>

      {streams.length === 0 ? (
        <Card>
          <Card.Body className="text-center">
            <p>No active streams. Create your first stream to get started.</p>
          </Card.Body>
        </Card>
      ) : (
        streams.map(stream => (
          <Card key={stream.id} className="mb-3">
            <Card.Body>
              <Card.Title>{stream.title}</Card.Title>
              <Button variant="danger" onClick={() => deleteStream(stream.id)}>
                Delete
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
            <Form.Group>
              <Form.Label>Stream Title</Form.Label>
              <Form.Control
                type="text"
                value={streamTitle}
                onChange={(e) => setStreamTitle(e.target.value)}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Stream
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  )
}

export default StreamManagement