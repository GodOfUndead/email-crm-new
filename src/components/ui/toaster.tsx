"use client"

import { createContext, ReactNode, useContext } from "react"
import { Toaster as SonnerToaster } from "sonner"

type Toast = {
  id: string | number
  title?: ReactNode
  description?: ReactNode
  action?: ReactNode
  duration?: number
  onDismiss?: (toastId: string | number) => void
  onAutoClose?: (toastId: string | number) => void
}

type ToastOptions = {
  id?: string | number
  duration?: number
}

type ToastContextType = {
  toast: (message: ReactNode, options?: ToastOptions) => void
  dismiss: (toastId?: string | number) => void
}

// We are not using the context directly with the useToast hook from our code
// Instead, we are directly importing the 'toast' object from 'sonner'
// This Toaster component is primarily for rendering the Sonner toaster.
export const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToasterProps {
  children?: ReactNode;
}

export function Toaster({ children }: ToasterProps) {
  return (
    <>
      {children}
      <SonnerToaster />
    </>
  )
}

// You can still create a mock useToast hook if needed for testing or specific patterns,
// but the primary way to show toasts with 'sonner' is importing 'toast' directly.
/*
export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToasterProvider");
  }
  return context;
};
*/

// Note: The actual 'toast' function to show notifications comes directly from 'sonner'.
// You import it like: import { toast } from 'sonner'; 