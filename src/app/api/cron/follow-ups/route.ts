import { NextResponse } from "next/server";
import { processQueue } from "@/lib/redis"; // Assuming Redis utility exists

// This route is triggered by the Vercel cron job
export async function GET() {
  // Check for a secret to secure this endpoint if not using Vercel Cron authentication
  // const authHeader = request.headers.get('authorization');
  // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return new NextResponse('Unauthorized', { status: 401 });
  // }

  try {
    console.log("Cron job triggered: Processing follow-up queue.");
    // Process items from the queue
    const processedItem = await processQueue();

    if (processedItem) {
        console.log("Processed item from queue:", processedItem);
        // You might want to add more detailed logging or metrics here
    } else {
        console.log("Queue was empty.");
    }

    // In a real scenario, you might want a loop here to process multiple items
    // or rely on a separate worker process.
    // For simplicity, this example processes one item per cron trigger.

    return NextResponse.json({ message: "Follow-up cron job executed." });
  } catch (error) {
    console.error("Error executing follow-up cron job:", error);
    return NextResponse.json(
      { error: "Failed to execute follow-up cron job." },
      { status: 500 }
    );
  }
} 