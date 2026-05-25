import type { Metadata } from "next"
import { Geist, Instrument_Serif } from "next/font/google"
import "./globals.css"
import { SessionProvider } from "@/components/layout/SessionProvider"
import { ThemeProvider } from "@/components/layout/ThemeProvider"
import { Navbar } from "@/components/layout/Navbar"

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" })
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
})

export const metadata: Metadata = {
  title: "CollegeDiscovery — Find Your Perfect College",
  description: "Search, compare, and analyze top engineering colleges in India. Data-driven insights on placements, fees, and ROI.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${instrumentSerif.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-stone-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        <ThemeProvider>
          <SessionProvider>
            <Navbar />
            <main className="flex-1 page-enter">{children}</main>
            <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-6 mt-auto">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-400 dark:text-gray-500">
                © 2025 CollegeDiscovery · Built with Next.js, Prisma & TailwindCSS
              </div>
            </footer>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
