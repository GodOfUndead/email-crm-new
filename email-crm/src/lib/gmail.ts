import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

const oauth2Client = new OAuth2Client(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  'https://developers.google.com/oauthplayground'
);

oauth2Client.setCredentials({
  refresh_token: process.env.GMAIL_REFRESH_TOKEN,
});

const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

export async function sendEmail(to: string, subject: string, content: string) {
  try {
    const message = [
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0',
      `To: ${to}`,
      'From: me',
      `Subject: ${subject}`,
      '',
      content,
    ].join('\n');

    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const res = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    return res.data;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

export async function getEmailThread(threadId: string) {
  try {
    const res = await gmail.users.threads.get({
      userId: 'me',
      id: threadId,
    });
    return res.data;
  } catch (error) {
    console.error('Error getting email thread:', error);
    throw error;
  }
}

export async function listEmails(query: string = '') {
  try {
    const res = await gmail.users.messages.list({
      userId: 'me',
      q: query,
    });
    return res.data;
  } catch (error) {
    console.error('Error listing emails:', error);
    throw error;
  }
}

export async function getEmailDetails(messageId: string) {
  try {
    const res = await gmail.users.messages.get({
      userId: 'me',
      id: messageId,
    });
    return res.data;
  } catch (error) {
    console.error('Error getting email details:', error);
    throw error;
  }
}

export async function checkForReplies(threadId: string, lastMessageId: string) {
  try {
    const thread = await getEmailThread(threadId);
    const messages = thread.messages || [];
    
    // Find messages newer than the last message we processed
    const newMessages = messages.filter(msg => 
      msg.id !== lastMessageId && 
      new Date(parseInt(msg.internalDate || '0')) > new Date()
    );

    return newMessages.length > 0;
  } catch (error) {
    console.error('Error checking for replies:', error);
    throw error;
  }
} 