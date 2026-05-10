import "@/styles/globals.css";
import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Traveloop — Plan Your Perfect Multi-City Adventure",
  description:
    "Traveloop is your all-in-one travel planner. Create personalized multi-city itineraries, manage budgets, discover activities, and share your adventures with the world.",
  keywords: [
    "travel planner",
    "itinerary builder",
    "multi-city trip",
    "budget travel",
    "travel app",
  ],
  openGraph: {
    title: "Traveloop — Plan Your Perfect Multi-City Adventure",
    description:
      "Create personalized multi-city itineraries, manage budgets, and share your adventures.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable}`}>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
