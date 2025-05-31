import OpenAI from 'openai';
import { prisma } from './prisma';

export class AIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateFollowUp(context: string, originalEmail: string) {
    try {
      const prompt = `Generate a professional follow-up email based on this context and original email:
      Context: ${context}
      Original Email: ${originalEmail}
      
      The follow-up should be:
      - Professional and courteous
      - Reference the original email
      - Ask for a response
      - Not be too pushy`;

      const completion = await this.openai.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "gpt-4",
        temperature: 0.7,
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('Error generating follow-up:', error);
      throw error;
    }
  }

  async analyzeEmail(content: string) {
    try {
      const prompt = `Analyze this email and extract the following information in JSON format:
      - Company Name
      - Lead Name
      - Proposed Solution
      - Proposal Link
      
      Email Content: ${content}`;

      const completion = await this.openai.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "gpt-4",
        temperature: 0.3,
        response_format: { type: "json_object" },
      });

      return JSON.parse(completion.choices[0].message.content || '{}');
    } catch (error) {
      console.error('Error analyzing email:', error);
      throw error;
    }
  }

  async generateInitialEmail(context: string) {
    try {
      const prompt = `Generate a professional initial outreach email based on this context:
      ${context}
      
      The email should:
      - Be personalized and engaging
      - Clearly state the value proposition
      - Include a clear call to action
      - Be concise and professional`;

      const completion = await this.openai.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "gpt-4",
        temperature: 0.7,
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('Error generating initial email:', error);
      throw error;
    }
  }
} 