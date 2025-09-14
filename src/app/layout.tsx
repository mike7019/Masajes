import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { ToastProvider } from "@/components/ui";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { WebVitals } from "@/components/performance/WebVitals";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    template: '%s | Spa & Masajes Relajación',
    default: 'Spa & Masajes Relajación - Masajes Terapéuticos Profesionales'
  },
  description: "Servicios profesionales de masajes terapéuticos, relajantes y deportivos. Más de 10 años cuidando tu bienestar. Reserva tu cita online.",
  keywords: "masajes terapéuticos, spa, relajación, masajes deportivos, bienestar, reservas online, masajes profesionales, terapia muscular, piedras calientes",
  authors: [{ name: "Spa & Masajes Relajación" }],
  creator: "Spa & Masajes Relajación",
  publisher: "Spa & Masajes Relajación",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: "Spa & Masajes Relajación",
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@spamasajes',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col`}>
        <SessionProvider>
          <ToastProvider>
            <Navigation />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </ToastProvider>
        </SessionProvider>
        <WebVitals />
      </body>
    </html>
  );
}
