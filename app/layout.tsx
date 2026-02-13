import type { Metadata } from "next";
import "./globals.css";
import { GiftsCount } from "@/components/GiftsCount";
import { LayoutNav } from "@/components/LayoutNav";
import { Playfair_Display, Poppins } from "next/font/google";

const display = Playfair_Display({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-display"
});

const sans = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans"
});

export const metadata: Metadata = {
  title: "FromMe — Virtual Interactive Gift Builder",
  description: "Create personal, interactive gifts for Valentine's, anniversaries, and special occasions. One link, no account required to view."
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover"
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
          <LayoutNav />
          <main className="flex-1">{children}</main>
          <footer className="py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] text-center text-xs text-rose-400 border-t border-rose-100">
            <GiftsCount variant="compact" className="block mb-1 text-rose-500" />
            FromMe — Made with love ❤️
          </footer>
        </div>
      </body>
    </html>
  );
}

