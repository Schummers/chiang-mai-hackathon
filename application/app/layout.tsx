import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible_Next, Noto_Sans_Thai_Looped } from "next/font/google";
import { PITCH } from "@/lib/pitch";
import "./globals.css";

const atkinson = Atkinson_Hyperlegible_Next({
  variable: "--font-atkinson",
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
});

const thai = Noto_Sans_Thai_Looped({
  variable: "--font-thai",
  subsets: ["thai"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "U Mueang · อู้เมือง",
  description: PITCH,
  openGraph: {
    title: "U Mueang · อู้เมือง",
    description: PITCH,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "U Mueang · อู้เมือง",
    description: PITCH,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#FAF9F6",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${atkinson.variable} ${thai.variable}`}>
      <body>{children}</body>
    </html>
  );
}
