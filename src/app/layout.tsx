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
  title: "Ustar — Ta'lim va IT mutaxassislar reytingi",
  description:
    "O'zbekistondagi eng yaxshi ta'lim markazlari, repetitorlar va IT mutaxassislari reytingi. O'zingizga mos mutaxassisni tanlang yoz profilingizni reytingga qo'shing.",
  keywords: [
    "Ustar",
    "reyting",
    "repetitor",
    "ta'lim markazi",
    "IELTS",
    "IT mutaxassis",
    "dasturchi",
    "dizayner",
    "O'zbekiston",
  ],
  openGraph: {
    title: "Ustar — Ta'lim va IT mutaxassislar reytingi",
    description:
      "O'zbekistondagi eng yaxshi ta'lim markazlari, repetitorlar va IT mutaxassislari reytingi.",
    siteName: "Ustar",
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
