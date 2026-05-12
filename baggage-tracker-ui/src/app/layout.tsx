import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Airline Luggage Tracking",
  description: "Real-time airline baggage operations and tracking",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans text-slate-800 antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}