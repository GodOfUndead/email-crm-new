import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Email CRM",
  description: "A comprehensive email CRM management system.",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
          {/* The Toaster component is rendered within Providers or directly in the layout */}
          {/* <Toaster /> */}
        </Providers>
      </body>
    </html>
  )
} 