import { google } from 'googleapis';
import { prisma } from './prisma';
import { EmailStatus } from '@prisma/client';

export class EmailService {
  private gmail;

  constructor() {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/gmail.send'],
    });

    this.gmail = google.gmail({ version: 'v1', auth });
  }

  async sendEmail(to: string, subject: string, content: string) {
    try {
      const message = [
        'Content-Type: text/html; charset=utf-8',
        'MIME-Version: 1.0',
        `To: ${to}`,
        `Subject: ${subject}`,
        '',
        content,
      ].join('\n');

      const encodedMessage = Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const response = await this.gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  async checkReplies() {
    try {
      const response = await this.gmail.users.messages.list({
        userId: 'me',
        q: 'in:inbox is:unread',
      });

      const messages = response.data.messages || [];
      
      for (const message of messages) {
        const email = await this.gmail.users.messages.get({
          userId: 'me',
          id: message.id!,
        });

        const headers = email.data.payload?.headers;
        const subject = headers?.find(h => h.name === 'Subject')?.value;
        const from = headers?.find(h => h.name === 'From')?.value;

        if (from && subject) {
          // Update email status in database
          await prisma.email.updateMany({
            where: {
              subject: subject,
              status: EmailStatus.SENT,
            },
            data: {
              status: EmailStatus.REPLIED,
            },
          });
        }
      }
    } catch (error) {
      console.error('Error checking replies:', error);
      throw error;
    }
  }
} 