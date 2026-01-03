const nodemailer = require('nodemailer');
const config = require('../config');
const logger = require('../utils/logger');
const { recordEmailSent } = require('../utils/metrics');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
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

  async sendInviteEmail(email, inviteData) {
    try {
      const mailOptions = {
        from: config.email.from,
        to: email,
        subject: `Invitation to Join ${inviteData.unitName} - LDSChurch.Stream`,
        html: this.generateInviteHtml(inviteData),
      };

      await this.transporter.sendMail(mailOptions);

      logger.info('Invite email sent', {
        email,
        unitName: inviteData.unitName,
        token: inviteData.token,
      });

      recordEmailSent('invite', true);
    } catch (error) {
      logger.error('Failed to send invite email', {
        error: error.message,
        email,
        unitName: inviteData.unitName,
      });

      recordEmailSent('invite', false);
      throw error;
    }
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

  async sendTestEmail(email) {
    try {
      const mailOptions = {
        from: config.email.from,
        to: email,
        subject: 'SMTP Configuration Test - LDSChurch.Stream',
        html: this.generateTestEmailHtml(),
      };

      await this.transporter.sendMail(mailOptions);

      logger.info('Test email sent successfully', { email });
      recordEmailSent('test', true);
    } catch (error) {
      logger.error('Failed to send test email', {
        error: error.message,
        email,
      });

      recordEmailSent('test', false);
      throw error;
    }
  }

  generateInviteHtml(inviteData) {
    return `
      <h2>You're Invited to Join LDSChurch.Stream</h2>
      <p>Hello!</p>
      <p>You've been invited to become a stream specialist for <strong>${inviteData.unitName}</strong>.</p>
      <p>LDSChurch.Stream helps LDS congregations provide YouTube streams of their sacrament meetings with simplified management and automated reporting.</p>
      
      <p><strong>To get started:</strong></p>
      <ol>
        <li>Click the link below to complete your registration</li>
        <li>Create your account using this email address</li>
        <li>Start managing streams for your unit</li>
      </ol>
      
      <p style="margin: 20px 0;">
        <a href="${inviteData.inviteUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
          Complete Registration
        </a>
      </p>
      
      <p><strong>Important:</strong> This invitation expires on ${new Date(inviteData.expiresAt).toLocaleDateString()} at ${new Date(inviteData.expiresAt).toLocaleTimeString()}.</p>
      
      <p>If you have any questions, please contact your local leadership.</p>
      
      <hr>
      <p style="font-size: 12px; color: #666;">
        This is an automated message from LDSChurch.Stream. This application is not an official product of The Church of Jesus Christ of Latter-Day Saints.
      </p>
    `;
  }

  generateTestEmailHtml() {
    return `
      <h2>SMTP Configuration Test</h2>
      <p>Hello!</p>
      <p>This is a test email to verify that your SMTP configuration is working correctly.</p>
      
      <p><strong>Test Details:</strong></p>
      <ul>
        <li>Sent at: ${new Date().toLocaleString()}</li>
        <li>From: LDSChurch.Stream System</li>
        <li>Purpose: SMTP Configuration Validation</li>
      </ul>
      
      <p>If you received this email, your SMTP settings are configured correctly! ✅</p>
      
      <hr>
      <p style="font-size: 12px; color: #666;">
        This is an automated test message from LDSChurch.Stream. This application is not an official product of The Church of Jesus Christ of Latter-Day Saints.
      </p>
    `;
  }

  generateReportHtml(report) {
    const analysisHtml = report.analysis
      ? `
      <h3>Attendance Analysis</h3>
      ${
        report.analysis.newThisWeek.length > 0
          ? `
        <p><strong>New This Week:</strong> ${report.analysis.newThisWeek.join(', ')}</p>
      `
          : ''
      }
      ${
        report.analysis.regularStreamers.length > 0
          ? `
        <p><strong>Regular Streamers:</strong> ${report.analysis.regularStreamers.join(', ')}</p>
      `
          : ''
      }
      ${
        report.analysis.missingRegulars.length > 0
          ? `
        <p><strong>Missing Regulars:</strong> ${report.analysis.missingRegulars.join(', ')}</p>
      `
          : ''
      }
    `
      : '';

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
      
      ${analysisHtml}
    `;
  }
}

module.exports = new EmailService();
