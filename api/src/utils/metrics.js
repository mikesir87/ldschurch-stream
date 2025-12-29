const { metrics } = require('@opentelemetry/api');

const meter = metrics.getMeter('ldschurch-stream', '1.0.0');

// Business metrics
const streamEventsCreated = meter.createCounter('stream_events_created_total', {
  description: 'Total number of stream events created',
});

const attendanceSubmissions = meter.createCounter('attendance_submissions_total', {
  description: 'Total attendance form submissions',
});

const activeStreams = meter.createUpDownCounter('stream_events_active_gauge', {
  description: 'Currently active stream events',
});

const youtubeApiRequests = meter.createCounter('youtube_api_requests_total', {
  description: 'YouTube API requests by endpoint',
});

const emailsSent = meter.createCounter('emails_sent_total', {
  description: 'Emails sent successfully',
});

const userLogins = meter.createCounter('user_logins_total', {
  description: 'User login attempts',
});

const activeUsers = meter.createUpDownCounter('active_users_gauge', {
  description: 'Currently active users (logged in within last 24h)',
});

// Usage functions
const recordStreamCreation = (unitId, success = true) => {
  streamEventsCreated.add(1, {
    unit_id: unitId,
    status: success ? 'success' : 'failed',
  });
  if (success) {
    activeStreams.add(1, { unit_id: unitId });
  }
};

const recordAttendanceSubmission = unitId => {
  attendanceSubmissions.add(1, { unit_id: unitId });
};

const recordYouTubeRequest = (endpoint, success = true, errorType = null) => {
  const labels = { endpoint, status: success ? 'success' : 'error' };

  // Add specific error type for failures
  if (!success && errorType) {
    labels.error_type = errorType;
  }

  youtubeApiRequests.add(1, labels);
};

const recordEmailSent = (type, success = true) => {
  emailsSent.add(1, {
    type,
    status: success ? 'success' : 'failed',
  });
};

const recordUserLogin = (userId, success = true, userRole = 'specialist') => {
  userLogins.add(1, {
    status: success ? 'success' : 'failed',
    role: userRole,
  });

  if (success) {
    // For active users, we'd ideally track this with a proper session store
    // For now, just increment on successful login
    activeUsers.add(1, { role: userRole });
  }
};

module.exports = {
  recordStreamCreation,
  recordAttendanceSubmission,
  recordYouTubeRequest,
  recordEmailSent,
  recordUserLogin,
};
