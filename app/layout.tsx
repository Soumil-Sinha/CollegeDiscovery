import type { Metadata } from "next"
import { Geist, Instrument_Serif } from "next/font/google"
import "./globals.css"
import { SessionProvider } from "@/components/layout/SessionProvider"
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
    <html lang="en" className={`${geist.variable} ${instrumentSerif.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-stone-50 text-gray-900">
        <SessionProvider>
          <Navbar />
          <main className="flex-1 page-enter">{children}</main>
          <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-400">
              © 2025 CollegeDiscovery · Built with Next.js, Prisma & TailwindCSS
            </div>
          </footer>
        </SessionProvider>
      </body>
    </html>
  )
}
