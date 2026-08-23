import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "TopBid — O'zbekiston reyting platformasi",
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
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/favicon-180.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "TopBid — O'zbekiston reyting platformasi",
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
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
