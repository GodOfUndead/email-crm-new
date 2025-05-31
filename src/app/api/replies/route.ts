import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { analyzeReply, generateChainReply } from "@/lib/ai";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { threadId, messageId, content, subject } = await request.json();

    // Get the original email thread
    const originalEmail = await prisma.email.findFirst({
      where: { threadId },
      orderBy: { sentAt: "asc" },
    });

    if (!originalEmail) {
      return NextResponse.json(
        { error: "Original email not found" },
        { status: 404 }
      );
    }

    // Analyze the reply
    const analysis = await analyzeReply(
      { subject: originalEmail.subject, content: originalEmail.content },
      content
    );

    // Update original email status
    await prisma.email.update({
      where: { id: originalEmail.id },
      data: { status: "replied" },
    });

    // Cancel any pending follow-ups for this email
    await prisma.followUp.updateMany({
      where: {
        emailId: originalEmail.id,
        status: "pending",
      },
      data: { status: "cancelled" },
    });

    // If a response is needed, generate and save as draft
    if (analysis.needsResponse) {
      const chainReplyContent = await generateChainReply(
        { subject: originalEmail.subject, content: originalEmail.content },
        content,
        analysis
      );

      // Create new email record for the chain reply
      const chainReply = await prisma.email.create({
        data: {
          recipient: originalEmail.recipient,
          subject: `Re: ${subject}`,
          content: chainReplyContent,
          status: "draft",
          threadId,
          sentAt: new Date(),
        },
      });

      // Create follow-up draft for the chain reply
      await prisma.followUp.create({
        data: {
          emailId: chainReply.id,
          clientId: originalEmail.clientId || "",
          content: chainReplyContent,
          status: "pending",
          scheduledAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // 6 days from now
        },
      });

      return NextResponse.json({
        message: "Reply processed",
        analysis,
        chainReply,
      });
    }

    return NextResponse.json({
      message: "Reply processed",
      analysis,
    });
  } catch (error) {
    console.error("Failed to process reply:", error);
    return NextResponse.json(
      { error: "Failed to process reply" },
      { status: 500 }
    );
  }
} 