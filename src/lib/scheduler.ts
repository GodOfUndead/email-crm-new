import { CronJob } from 'cron';
import { prisma } from './prisma';
import { AIService } from './ai-service';
import { EmailService } from './email-service';
import { addDays } from 'date-fns';

export class Scheduler {
  private aiService: AIService;
  private emailService: EmailService;

  constructor() {
    this.aiService = new AIService();
    this.emailService = new EmailService();
  }

  async start() {
    // Check for emails needing follow-up every day at 9 AM
    new CronJob('0 9 * * *', async () => {
      await this.scheduleFollowUps();
    }).start();

    // Generate drafts every day at 10 AM
    new CronJob('0 10 * * *', async () => {
      await this.generateDrafts();
    }).start();

    // Check for replies every hour
    new CronJob('0 * * * *', async () => {
      await this.emailService.checkReplies();
    }).start();
  }

  async scheduleFollowUps() {
    try {
      const sixDaysAgo = addDays(new Date(), -6);

      const emailsNeedingFollowUp = await prisma.email.findMany({
        where: {
          status: 'SENT',
          sentAt: {
            lte: sixDaysAgo,
          },
          followUps: {
            none: {
              status: 'PENDING',
            },
          },
        },
        include: {
          client: true,
        },
      });

      for (const email of emailsNeedingFollowUp) {
        await prisma.followUp.create({
          data: {
            emailId: email.id,
            clientId: email.clientId,
            scheduledAt: new Date(),
            status: 'PENDING',
          },
        });
      }
    } catch (error) {
      console.error('Error scheduling follow-ups:', error);
      throw error;
    }
  }

  async generateDrafts() {
    try {
      const pendingFollowUps = await prisma.followUp.findMany({
        where: {
          status: 'PENDING',
        },
        include: {
          email: true,
          client: true,
        },
      });

      for (const followUp of pendingFollowUps) {
        const content = await this.aiService.generateFollowUp(
          `Follow up with ${followUp.client.leadName} from ${followUp.client.companyName}`,
          followUp.email.content
        );

        await prisma.draft.create({
          data: {
            emailId: followUp.emailId,
            content,
            status: 'PENDING',
          },
        });
      }
    } catch (error) {
      console.error('Error generating drafts:', error);
      throw error;
    }
  }
} 