# Email CRM System

A comprehensive email CRM management system built with Next.js, Prisma, and OpenAI.

## Features

- Email management and tracking
- Automated follow-up generation
- Client relationship management
- Analytics dashboard
- AI-powered email assistance

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- OpenAI API key
- Upstash Redis account
- Vercel account (for deployment)

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd email-crm
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Fill in your environment variables:
     - `DATABASE_URL`: Your PostgreSQL connection string
     - `OPENAI_API_KEY`: Your OpenAI API key
     - `UPSTASH_REDIS_REST_URL`: Your Redis URL
     - `UPSTASH_REDIS_REST_TOKEN`: Your Redis token
     - `CRON_SECRET`: A secure secret for cron jobs

4. Set up the database:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

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