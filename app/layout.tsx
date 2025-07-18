import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/hooks/use-auth"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "XS Card - Digital Business Cards | Professional Networking Made Simple",
  description:
    "Create stunning, interactive digital business cards that make lasting impressions. Share your professional identity instantly with QR codes, NFC, and smart links. Join thousands of professionals who've gone digital.",
  keywords: [
    "digital business cards",
    "QR code business cards",
    "NFC business cards",
    "professional networking",
    "digital networking",
    "business card app",
    "contact sharing",
    "South Africa business cards",
    "XS Card",
    "mobile business cards",
  ],
  authors: [{ name: "XS Card Team" }],
  creator: "XS Card",
  publisher: "XS Card",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://xscard.co.za"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "XS Card - Digital Business Cards | Professional Networking Made Simple",
    description:
      "Create stunning, interactive digital business cards that make lasting impressions. Share your professional identity instantly with QR codes, NFC, and smart links.",
    url: "https://xscard.co.za",
    siteName: "XS Card",
    images: [
      {
        url: "/images/xscard-logo.png",
        width: 1200,
        height: 630,
        alt: "XS Card - Digital Business Cards",
      },
    ],
    locale: "en_ZA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "XS Card - Digital Business Cards",
    description:
      "Create stunning, interactive digital business cards that make lasting impressions. Share your professional identity instantly.",
    images: ["/images/xscard-logo.png"],
    creator: "@xscard",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
  category: "technology",
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
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.png" sizes="any" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <meta name="theme-color" content="#9333ea" />
        <meta name="msapplication-TileColor" content="#9333ea" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

