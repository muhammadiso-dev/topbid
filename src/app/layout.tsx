import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "TopBid — O'rganish va Yollash reytingi",
  description:
    "O'zbekistondagi eng yaxshi ta'lim markazlari, repetitorlar va IT mutaxassislari reytingi. O'z o'rinngizni egallang yoki mutaxassis toping.",
  keywords: [
    "TopBid",
    "topbid.uz",
    "reyting",
    "repetitor",
    "ta'lim markazi",
    "IELTS",
    "IT mutaxassis",
    "dasturchi",
    "dizayner",
    "frilanser",
    "O'zbekiston",
  ],
  openGraph: {
    title: "TopBid — O'rganish va Yollash reytingi",
    description:
      "O'zbekistondagi eng yaxshi ta'lim markazlari, repetitorlar va IT mutaxassislari reytingi.",
    siteName: "TopBid.uz",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <body className={`${manrope.variable} font-sans antialiased bg-background text-foreground`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
