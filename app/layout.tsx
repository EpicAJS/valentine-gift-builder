import type { Metadata } from "next";
import "./globals.css";
import { DM_Sans, Playfair_Display } from "next/font/google";

const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans"
});

const display = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display"
});

export const metadata: Metadata = {
  title: "Valentine Gift Builder",
  description: "Create a simple, heartfelt virtual Valentine gift to share."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${sans.variable} ${display.variable} min-h-screen bg-rose-50 text-gray-900 antialiased`}
      >
        <div className="min-h-screen flex flex-col">
          <main className="flex-1">{children}</main>
          <footer className="py-4 text-center text-xs text-rose-400 border-t border-rose-100">
            Made with love ❤️
          </footer>
        </div>
      </body>
    </html>
  );
}

