const nodemailer = require('nodemailer');
const config = require('../config');
const logger = require('../utils/logger');
const { recordEmailSent } = require('../utils/metrics');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: config.email.user
        ? {
            user: config.email.user,
            pass: config.email.pass,
          }
        : undefined,
    });
  }

  async sendAttendanceReport(recipients, report) {
    try {
      const mailOptions = {
        from: config.email.from,
        to: recipients.join(', '),
        subject: `Weekly Attendance Report - ${report.unit}`,
        html: this.generateReportHtml(report),
      };

      await this.transporter.sendMail(mailOptions);

      logger.info('Attendance report sent', {
        unit: report.unit,
        recipients: recipients.length,
      });

      recordEmailSent('attendance_report', true);
    } catch (error) {
      logger.error('Failed to send attendance report', {
        error: error.message,
        unit: report.unit,
      });

      recordEmailSent('attendance_report', false);
      throw error;
    }
  }

  generateReportHtml(report) {
    return `
      <h2>Weekly Attendance Report</h2>
      <p><strong>Unit:</strong> ${report.unit}</p>
      <p><strong>Stream Date:</strong> ${report.streamDate}</p>
      <p><strong>Total Attendees:</strong> ${report.totalAttendees}</p>
      <p><strong>Unique Names:</strong> ${report.uniqueNames}</p>
      
      <h3>Attendee List</h3>
      <ul>
        ${report.attendeeList.map(a => `<li>${a.name} (${a.count})</li>`).join('')}
      </ul>
    `;
  }
}

module.exports = new EmailService();
