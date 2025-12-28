import React, { useEffect, useState } from 'react'
import { Card, Button, Alert } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'

const StreamAccess = () => {
  const navigate = useNavigate()
  const [streamData, setStreamData] = useState(null)
  const [unit, setUnit] = useState('')

  useEffect(() => {
    // Extract unit from subdomain
    const hostname = window.location.hostname
    const subdomain = hostname.split('.')[0]
    setUnit(subdomain)
  }, [])

  return (
    <div className="text-center">
      <Card>
        <Card.Body>
          <Card.Title className="mb-4">
            {unit ? `${unit.charAt(0).toUpperCase() + unit.slice(1)} Ward` : 'Ward'} Sacrament Meeting
          </Card.Title>
          
          {streamData ? (
            <div>
              <div className="mb-4">
                <iframe
                  width="100%"
                  height="400"
                  src={`https://www.youtube.com/embed/${streamData.youtubeId}`}
                  title="Sacrament Meeting Stream"
                  frameBorder="0"
                  allowFullScreen
                />
              </div>
              <Button 
                variant="primary" 
                size="lg"
                onClick={() => navigate('/attendance')}
              >
                Mark Attendance
              </Button>
            </div>
          ) : (
            <Alert variant="info">
              <h5>No Active Stream</h5>
              <p>There is currently no live stream available. Please check back during sacrament meeting time.</p>
            </Alert>
          )}
        </Card.Body>
      </Card>
    </div>
  )
}

export default StreamAccess