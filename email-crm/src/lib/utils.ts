import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export function getFollowUpDate(date: Date): Date {
  const followUpDate = new Date(date)
  followUpDate.setDate(followUpDate.getDate() + 6)
  return followUpDate
}

export function getEmailStatus(sentAt: Date, repliedAt?: Date | null): string {
  if (repliedAt) return "replied"
  const now = new Date()
  const sixDaysAgo = new Date(sentAt)
  sixDaysAgo.setDate(sixDaysAgo.getDate() + 6)
  return now > sixDaysAgo ? "follow-up" : "sent"
} 