import { NextResponse } from "next/server"
import OpenAI from "openai"
import { z } from "zod"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const generateEmailSchema = z.object({
  clientName: z.string(),
  context: z.string(),
  tone: z.enum(["professional", "friendly", "formal"]).default("professional"),
  length: z.enum(["short", "medium", "long"]).default("medium"),
})

export async function POST(req: Request) {
  try {
    const requestBody = await req.json()
    const { clientName, context, tone, length } = generateEmailSchema.parse(requestBody)

    const prompt = `Write a ${tone} email to ${clientName} about the following: ${context}
    The email should be ${length} in length.
    Include a clear subject line.
    Format the email with proper greeting and closing.`

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a professional email writer. Write clear, concise, and effective emails.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "gpt-4-turbo-preview",
      temperature: 0.7,
    })

    const emailContent = completion.choices[0]?.message?.content

    if (!emailContent) {
      throw new Error("Failed to generate email content")
    }

    // Extract subject and body
    const [subject, ...bodyParts] = emailContent.split("\n\n")
    const emailBody = bodyParts.join("\n\n")

    return NextResponse.json({
      subject: subject.replace("Subject: ", ""),
      body: emailBody,
    })
  } catch (error) {
    console.error("Error generating email:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Failed to generate email" },
      { status: 500 }
    )
  }
} 