import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ParsedEmailData {
  companyName?: string;
  leadName?: string;
  proposedSolution?: string;
  proposalLink?: string;
}

export async function parseEmailContent(content: string): Promise<ParsedEmailData> {
  try {
    const prompt = `Extract the following information from this email content:
    1. Company Name (if mentioned)
    2. Lead/Contact Name (if mentioned)
    3. Proposed Solution (if any solution or service is discussed)
    4. Proposal/Pitch Deck Link (if any links to proposals or decks are shared)
    
    Email Content:
    ${content}
    
    Return the information in JSON format with these exact keys: companyName, leadName, proposedSolution, proposalLink.
    If any information is not found, set that key to null.`;

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an email parser that extracts specific information from email content.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "gpt-3.5-turbo",
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const parsedData = JSON.parse(completion.choices[0].message.content || "{}");
    return {
      companyName: parsedData.companyName || undefined,
      leadName: parsedData.leadName || undefined,
      proposedSolution: parsedData.proposedSolution || undefined,
      proposalLink: parsedData.proposalLink || undefined,
    };
  } catch (error) {
    console.error("Error parsing email content:", error);
    return {};
  }
}

export function extractLinks(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.match(urlRegex) || [];
}

export function extractEmailAddresses(text: string): string[] {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  return text.match(emailRegex) || [];
}

export function extractPhoneNumbers(text: string): string[] {
  const phoneRegex = /(?:\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  return text.match(phoneRegex) || [];
} 