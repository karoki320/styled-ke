import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Styled.ke – Your Style, Elevated.",
  description:
    "Nairobi's premium boutique for fashion & fragrances. All clothing KES 1,500. Authentic EX-USA perfumes, Victoria's Secret, and exclusive fashion — free nationwide delivery.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://styled.ke"
  ),
  openGraph: {
    title: "Styled.ke – Your Style, Elevated.",
    description: "All clothing KES 1,500. Free nationwide delivery.",
    siteName: "Styled.ke",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
