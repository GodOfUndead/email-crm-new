import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

export async function sendEmail(to: string, subject: string, content: string) {
  try {
    const message = [
      'Content-Type: text/html; charset="UTF-8"\n',
      "MIME-Version: 1.0\n",
      `To: ${to}\n`,
      `Subject: ${subject}\n\n`,
      content,
    ].join("");

    const encodedMessage = Buffer.from(message)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

export async function getEmails(maxResults = 10) {
  try {
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults,
    });

    const messages = response.data.messages || [];
    const emails = await Promise.all(
      messages.map(async (message) => {
        const email = await gmail.users.messages.get({
          userId: 'me',
          id: message.id!,
        });

        const headers = email.data.payload?.headers;
        const subject = headers?.find((h) => h.name === "Subject")?.value;
        const from = headers?.find((h) => h.name === "From")?.value;
        const date = headers?.find((h) => h.name === "Date")?.value;

        return {
          id: message.id,
          subject,
          from,
          date,
          snippet: email.data.snippet,
        };
      })
    );

    return emails;
  } catch (error) {
    console.error("Error fetching emails:", error);
    throw error;
  }
}

export async function getThread(threadId: string) {
  try {
    const response = await gmail.users.threads.get({
      userId: 'me',
      id: threadId,
    });

    const messages = response.data.messages || [];
    const thread = await Promise.all(
      messages.map(async (message) => {
        const email = await gmail.users.messages.get({
          userId: 'me',
          id: message.id!,
        });

        const headers = email.data.payload?.headers;
        const subject = headers?.find((h) => h.name === "Subject")?.value;
        const from = headers?.find((h) => h.name === "From")?.value;
        const date = headers?.find((h) => h.name === "Date")?.value;

        return {
          id: message.id,
          subject,
          from,
          date,
          snippet: email.data.snippet,
        };
      })
    );

    return thread;
  } catch (error) {
    console.error("Error fetching thread:", error);
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