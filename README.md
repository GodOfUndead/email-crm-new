# Email CRM with Pipedrive Integration

An intelligent email CRM system that automatically tracks emails, manages follow-ups, and integrates with Pipedrive.

## Features

- **Email Tracking**: Track all sent emails with recipient info, subject, content, and timestamps
- **Automatic Follow-up System**: Monitors emails for 6 days and creates follow-up drafts if no reply is received
- **Draft Management**: Review, edit, send, or delete auto-generated follow-up drafts
- **Dashboard & Analytics**: View total emails sent, replies received, and follow-ups needed
- **Pipedrive Integration**: Automatic client organization in Pipedrive with:
  - Company Name
  - Lead Name
  - Last Contact Date
  - Next Follow-up Date
  - Proposal/Pitch Deck Link
  - Proposed Solution
  - Current Status

## Tech Stack

- Next.js 14
- TypeScript
- Prisma (PostgreSQL)
- OpenAI API
- Gmail API
- Pipedrive API
- Redis (for queue management)

## Setup

1. Clone the repository:
   ```bash
   git clone [your-repo-url]
   cd [your-repo-name]
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file with the following variables:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/email_crm"

   # OpenAI
   OPENAI_API_KEY="your-openai-api-key"

   # Gmail
   GMAIL_CLIENT_ID="your-gmail-client-id"
   GMAIL_CLIENT_SECRET="your-gmail-client-secret"
   GMAIL_REFRESH_TOKEN="your-gmail-refresh-token"

   # Redis
   REDIS_URL="redis://localhost:6379"

   # Pipedrive
   PIPEDRIVE_API_KEY="your-pipedrive-api-key"
   PIPEDRIVE_DOMAIN="your-pipedrive-domain"

   # Cron
   CRON_SECRET="your-cron-secret"
   ```

4. Set up the database:
   ```bash
   npx prisma migrate dev
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

## Usage

1. Send Email: Use the "New Email" button to compose and send emails
2. Automatic Monitoring: System tracks when emails are sent and sets a 6-day follow-up date
3. Auto-Draft Creation: After 6 days without a reply, it automatically generates a follow-up email draft
4. Review & Send: Review the auto-generated drafts and send them or make modifications

## Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables in Vercel
4. Deploy

## Cron Job Setup

Set up a cron job to hit the `/api/cron` endpoint with your secret key. You can use Vercel Cron Jobs or Upstash QStash.

Example cron schedule: `0 0 * * *` (runs daily at midnight)

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT 