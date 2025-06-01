import { prisma } from './prisma';
import { EmailStatus, FollowUpStatus } from '@prisma/client';

export class SearchService {
  async searchEmails(query: string) {
    try {
      const emails = await prisma.email.findMany({
        where: {
          OR: [
            { subject: { contains: query, mode: 'insensitive' } },
            { content: { contains: query, mode: 'insensitive' } },
          ],
        },
        include: {
          client: true,
        },
        orderBy: {
          sentAt: 'desc',
        },
      });

      return emails;
    } catch (error) {
      console.error('Error searching emails:', error);
      throw error;
    }
  }

  async filterByStatus(status: EmailStatus) {
    try {
      const emails = await prisma.email.findMany({
        where: {
          status,
        },
        include: {
          client: true,
        },
        orderBy: {
          sentAt: 'desc',
        },
      });

      return emails;
    } catch (error) {
      console.error('Error filtering by status:', error);
      throw error;
    }
  }

  async searchClients(query: string) {
    try {
      const clients = await prisma.client.findMany({
        where: {
          OR: [
            { companyName: { contains: query, mode: 'insensitive' } },
            { leadName: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
          ],
        },
        include: {
          emails: {
            orderBy: {
              sentAt: 'desc',
            },
            take: 5,
          },
          followUps: {
            where: {
              status: 'PENDING',
            },
            orderBy: {
              scheduledAt: 'asc',
            },
            take: 1,
          },
        },
      });

      return clients;
    } catch (error) {
      console.error('Error searching clients:', error);
      throw error;
    }
  }

  async getAnalytics() {
    try {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));

      const [emailsSent, repliesReceived, followUpsNeeded] = await Promise.all([
        prisma.email.count({
          where: {
            status: EmailStatus.SENT,
            sentAt: {
              gte: startOfDay,
            },
          },
        }),
        prisma.email.count({
          where: {
            status: EmailStatus.REPLIED,
            sentAt: {
              gte: startOfDay,
            },
          },
        }),
        prisma.followUp.count({
          where: {
            status: FollowUpStatus.PENDING,
          },
        }),
      ]);

      return {
        emailsSent,
        repliesReceived,
        followUpsNeeded,
      };
    } catch (error) {
      console.error('Error getting analytics:', error);
      throw error;
    }
  }
} 