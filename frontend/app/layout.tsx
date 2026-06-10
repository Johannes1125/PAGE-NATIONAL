import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Poppins, Instrument_Serif } from 'next/font/google';
import "goey-toast/styles.css";

// Import the wrapper you created
import ToasterProvider from "../app/admin-dashboard/components/ToastProvider"; 

const poppins = Poppins({
  subsets: ['latin'],      
  weight: ['400', '500', '600', '700'], 
  variable: '--font-poppins',
  display: 'swap',
});

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-instrument-serif'
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// This works perfectly because this file is a Server Component!
export const metadata: Metadata = {
  title: "PAGE — Philippine Association for Graduate Education",
  description: "Advancing excellence in graduate education through collaboration, research, and professional development across the Philippines.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${instrumentSerif.variable} ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Render the Client Component wrapper here */}
        <ToasterProvider /> 
        
        {children}
      </body>
    </html>
  );
}