import type { Metadata } from "next";
import { Fira_Sans, Overpass } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const firaSans = Fira_Sans({
  weight: ["700", "900"],
  subsets: ["latin"],
  variable: "--font-fira-sans",
  display: "swap",
});

const overpass = Overpass({
  weight: ["400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-overpass",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NASA Space Biology Knowledge Base",
  description: "Explore space biology research through smart search, plain-English summaries, and interactive visualizations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${firaSans.variable} ${overpass.variable} font-body antialiased`}
      >
        <Providers>
          <div className="min-h-screen bg-background">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
