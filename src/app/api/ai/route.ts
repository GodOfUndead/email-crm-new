import { NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a helpful AI assistant.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "gpt-4-turbo-preview",
      temperature: 0.7,
    })

    const response = completion.choices[0]?.message?.content

    if (!response) {
      throw new Error("Failed to generate response")
    }

    return NextResponse.json({ response })
  } catch (error) {
    console.error("Error generating AI response:", error)
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    )
  }
} 