import type { Metadata } from "next";
import { Space_Grotesk, Bebas_Neue } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Falah Studios — Creative Technology Studio in the UAE",
  description:
    "Premium digital solutions: web development, branding, content creation, automation, and digital growth strategies for ambitious businesses.",
  keywords: [
    "web development UAE",
    "digital agency Dubai",
    "branding agency",
    "web design UAE",
    "digital transformation",
    "automation systems",
  ],
  authors: [{ name: "Falah Studios" }],
  creator: "Falah Studios",
  publisher: "Falah Studios",
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://falahstudios.com",
    title: "Falah Studios — Creative Technology Studio",
    description:
      "Premium digital solutions for ambitious businesses in the UAE.",
    images: [
      {
        url: "https://falahstudios.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Falah Studios",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Falah Studios",
    description:
      "Premium digital solutions for ambitious businesses in the UAE.",
    images: ["https://falahstudios.com/og-image.jpg"],
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#080808" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className={spaceGrotesk.className}>
        <Navigation />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
