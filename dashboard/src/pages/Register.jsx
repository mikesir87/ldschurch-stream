import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import { getApi } from '../services/api';

const Register = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [inviteDetails, setInviteDetails] = useState(null);
  const [loadingInvite, setLoadingInvite] = useState(true);

  useEffect(() => {
    const fetchInviteDetails = async () => {
      try {
        const response = await getApi().get(`/api/auth/invite/${token}`);
        setInviteDetails(response.data);
        setFormData(prev => ({
          ...prev,
          email: response.data.email,
        }));
      } catch (error) {
        setError(error.response?.data?.error?.message || 'Invalid or expired invite');
      } finally {
        setLoadingInvite(false);
      }
    };

    fetchInviteDetails();
  }, [token]);

  const handleChange = e => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    try {
      await getApi().post('/api/auth/register-with-invite', {
        token,
        email: formData.email,
        name: formData.name,
        password: formData.password,
      });

      // Registration successful, redirect to login
      navigate('/login?registered=true');
    } catch (error) {
      setError(error.response?.data?.error?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (loadingInvite) {
    return (
      <div className="login-background d-flex flex-column min-vh-100">
        <Container className="py-5 flex-grow-1 d-flex flex-column justify-content-center">
          <div className="text-center text-white">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Validating invitation...</p>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="login-background d-flex flex-column min-vh-100">
      <Container className="py-5 flex-grow-1 d-flex flex-column justify-content-center">
        <div className="login-container">
          <div className="text-center text-white mb-4">
            <div className="login-title-row mb-3">
              <img src="/logos/logo-white.svg" alt="LDSChurch.Stream" className="logo" />
              <h1 className="brand-name">
                LDSChurch<span className="stream-suffix">.Stream</span>
              </h1>
            </div>
            <p className="lead">Complete Registration for {inviteDetails?.unitName}</p>
          </div>

          <Card className="login-card">
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled
                  />
                  <Form.Text className="text-muted">
                    This email was specified in your invitation
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    autoFocus
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    minLength={8}
                    required
                  />
                  <Form.Text className="text-muted">Must be at least 8 characters long</Form.Text>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Button type="submit" variant="primary" className="w-100" disabled={loading}>
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </div>
      </Container>
    </div>
  );
};

export default Register;
