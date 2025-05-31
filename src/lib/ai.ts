import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateFollowUpContent(originalEmail: {
  subject: string;
  content: string;
  recipient: string;
}) {
  try {
    const prompt = `Generate a professional follow-up email based on this original email:
    
    To: ${originalEmail.recipient}
    Subject: ${originalEmail.subject}
    Content: ${originalEmail.content}
    
    The follow-up should:
    1. Be professional and courteous
    2. Reference the original email
    3. Ask for a response or next steps
    4. Be concise and clear
    5. Maintain the same tone as the original email`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
      temperature: 0.7,
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error("No content generated from OpenAI");
    }
    return content;
  } catch (error) {
    console.error('Error generating follow-up content:', error);
    throw error;
  }
}

export async function analyzeReply(content: string) {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an email analysis expert. Analyze the following email reply and determine:
1. The sentiment (positive, negative, neutral)
2. Key points or requests made
3. Whether a follow-up is needed
4. Suggested next steps`,
        },
        {
          role: "user",
          content,
        },
      ],
      model: "gpt-4-turbo-preview",
      temperature: 0.3,
    });

    const analysis = completion.choices[0]?.message?.content;
    if (!analysis) {
      throw new Error("Failed to analyze email");
    }

    return analysis;
  } catch (error) {
    console.error("Error analyzing email:", error);
    throw error;
  }
}

export async function generateChainReply(
  originalEmail: string,
  reply: string,
  context: string
) {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an email writing expert. Generate a follow-up email based on the following:
1. The original email
2. The reply received
3. Additional context provided

The follow-up should:
- Be professional and courteous
- Address any unanswered questions
- Provide any missing information
- Maintain a natural conversation flow`,
        },
        {
          role: "user",
          content: `Original Email:
${originalEmail}

Reply Received:
${reply}

Additional Context:
${context}`,
        },
      ],
      model: "gpt-4-turbo-preview",
      temperature: 0.7,
    });

    const followUp = completion.choices[0]?.message?.content;
    if (!followUp) {
      throw new Error("Failed to generate follow-up");
    }

    return followUp;
  } catch (error) {
    console.error("Error generating follow-up:", error);
    throw error;
  }
}

export async function generateEmailSummary(emails: string[]) {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an email summarization expert. Create a concise summary of the following email thread:
1. Main topic or purpose
2. Key points discussed
3. Action items or next steps
4. Overall status or conclusion`,
        },
        {
          role: "user",
          content: emails.join("\n\n"),
        },
      ],
      model: "gpt-4-turbo-preview",
      temperature: 0.3,
    });

    const summary = completion.choices[0]?.message?.content;
    if (!summary) {
      throw new Error("Failed to generate summary");
    }

    return summary;
  } catch (error) {
    console.error("Error generating email summary:", error);
    throw error;
  }
} 