import type { Metadata } from "next"
import { Noto_Sans_KR, IBM_Plex_Mono } from "next/font/google"
import "./globals.css"
import Nav from "@/components/Nav"

const noto = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-noto",
})
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "한국어 Tutor",
  description: "Your personal Korean language tutor",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${noto.variable} ${mono.variable}`}>
      <body className="bg-gray-50 text-gray-900 font-sans min-h-screen">
        <Nav />
        <main className="max-w-3xl mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}
