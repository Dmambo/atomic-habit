import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import PwaServiceWorker from "@/components/pwa-service-worker"
import PwaInstallPrompt from "@/components/pwa-install-prompt"
import PwaNotificationPermission from "@/components/pwa-notification-permission"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Atomic Habit - Set goals. Build habits. Achieve more.",
  description: "A habit tracking app inspired by Atomic Habits to help you build better habits and achieve your goals.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
      </head>
      <body className={inter.className}>
        <PwaServiceWorker />
        <PwaInstallPrompt />
        <PwaNotificationPermission />
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
