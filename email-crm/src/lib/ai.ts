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

export async function analyzeReply(originalEmail: {
  subject: string;
  content: string;
}, replyContent: string) {
  try {
    const prompt = `Analyze this email reply and determine:
    1. Is this a positive response, negative response, or neutral?
    2. What are the key points or questions in the reply?
    3. What action items or next steps are mentioned?
    4. Is a further response needed?

    Original Email:
    Subject: ${originalEmail.subject}
    Content: ${originalEmail.content}

    Reply:
    ${replyContent}

    Provide your analysis in JSON format with these fields:
    {
      "sentiment": "positive|negative|neutral",
      "keyPoints": ["point1", "point2", ...],
      "actionItems": ["item1", "item2", ...],
      "needsResponse": true|false,
      "responsePriority": "high|medium|low"
    }`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error("No content generated from OpenAI");
    }
    return JSON.parse(content);
  } catch (error) {
    console.error('Error analyzing reply:', error);
    throw error;
  }
}

export async function generateChainReply(originalEmail: {
  subject: string;
  content: string;
}, replyContent: string, analysis: any) {
  try {
    const prompt = `Generate a response to this email reply. Consider the following analysis:
    
    Sentiment: ${analysis.sentiment}
    Key Points: ${analysis.keyPoints.join(', ')}
    Action Items: ${analysis.actionItems.join(', ')}
    Priority: ${analysis.responsePriority}

    Original Email:
    Subject: ${originalEmail.subject}
    Content: ${originalEmail.content}

    Reply Received:
    ${replyContent}

    The response should:
    1. Address all key points and questions
    2. Provide clear next steps for action items
    3. Be professional and maintain the conversation flow
    4. Match the tone of the previous emails
    5. Be concise and actionable`;

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
    console.error('Error generating chain reply:', error);
    throw error;
  }
} 