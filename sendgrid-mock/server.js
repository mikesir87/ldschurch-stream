const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3002;

// Store sent emails in memory
let sentEmails = [];

app.use(cors());
app.use(express.json());

// SendGrid API endpoint
app.post('/v3/mail/send', (req, res) => {
  const email = {
    id: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    from: req.body.from,
    personalizations: req.body.personalizations,
    subject: req.body.subject,
    content: req.body.content,
    headers: req.headers,
  };

  sentEmails.unshift(email); // Add to beginning of array

  // Keep only last 100 emails
  if (sentEmails.length > 100) {
    sentEmails = sentEmails.slice(0, 100);
  }

  console.log(
    `📧 Email sent: ${req.body.subject} to ${req.body.personalizations?.[0]?.to?.[0]?.email}`
  );

  res.status(202).json({ message: 'Email queued for delivery' });
});

// Web interface to view sent emails
app.get('/', (req, res) => {
  const emailsHtml = sentEmails
    .map(email => {
      const to = email.personalizations?.[0]?.to?.[0]?.email || 'Unknown';
      const subject = email.subject || 'No Subject';
      const content = email.content?.[0]?.value || 'No Content';

      return `
      <div style="border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 5px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <strong>${subject}</strong>
          <small style="color: #666;">${new Date(email.timestamp).toLocaleString()}</small>
        </div>
        <div style="margin-bottom: 10px;">
          <strong>From:</strong> ${email.from?.email || 'Unknown'}<br>
          <strong>To:</strong> ${to}
        </div>
        <div style="background: #f5f5f5; padding: 10px; border-radius: 3px; max-height: 200px; overflow-y: auto;">
          ${content}
        </div>
      </div>
    `;
    })
    .join('');

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>SendGrid Mock - Sent Emails</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #1a73e8; color: white; padding: 20px; margin: -20px -20px 20px -20px; }
        .stats { background: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .no-emails { text-align: center; color: #666; padding: 40px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>📧 SendGrid Mock Service</h1>
        <p>Local email testing interface</p>
      </div>
      
      <div class="stats">
        <strong>Total Emails:</strong> ${sentEmails.length}
        <button onclick="location.reload()" style="float: right; padding: 5px 10px;">Refresh</button>
      </div>
      
      ${sentEmails.length === 0 ? '<div class="no-emails">No emails sent yet</div>' : emailsHtml}
    </body>
    </html>
  `);
});

// API endpoint to get emails as JSON
app.get('/api/emails', (req, res) => {
  res.json({
    total: sentEmails.length,
    emails: sentEmails,
  });
});

// Clear all emails
app.delete('/api/emails', (req, res) => {
  sentEmails = [];
  res.json({ message: 'All emails cleared' });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'sendgrid-mock',
    emailsStored: sentEmails.length,
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SendGrid Mock Service running on port ${PORT}`);
  console.log(`📧 View emails at: http://localhost:${PORT}`);
  console.log(`🔗 API endpoint: http://localhost:${PORT}/v3/mail/send`);
});
