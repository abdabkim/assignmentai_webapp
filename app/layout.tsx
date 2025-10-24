import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "./contexts/auth-context"
import { PreferencesProvider } from "./contexts/preferences-provider"

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
})

export const metadata: Metadata = {
  title: "AssignmentPlanner AI - Smart Academic Planning",
  description:
    "AI-powered assignment planning tool for students. Break down any assignment into manageable steps with intelligent scheduling and helpful tips.",
  keywords: "assignment planner, AI, student tools, academic planning, homework organizer",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider 
          attribute="class" 
          defaultTheme="system" 
          enableSystem 
          disableTransitionOnChange
        >
          <PreferencesProvider>
            <AuthProvider>{children}</AuthProvider>
          </PreferencesProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}