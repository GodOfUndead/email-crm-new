import { NextResponse } from "next/server"
import { Configuration, OpenAIApi } from "openai"

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration)

export async function POST(request: Request) {
  try {
    const { originalEmail, context } = await request.json()

    const prompt = `Generate a follow-up email based on the following context:
    Original email: ${originalEmail}
    Context: ${context}
    
    The follow-up should be professional, concise, and maintain the conversation flow.`

    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a professional email assistant that helps write follow-up emails.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    })

    const followUpContent = completion.data.choices[0]?.message?.content

    if (!followUpContent) {
      throw new Error("Failed to generate follow-up content")
    }

    return NextResponse.json({ content: followUpContent })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate follow-up content" },
      { status: 500 }
    )
  }
} 