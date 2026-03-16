import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/contexts/AuthContext";
import { HeaderProvider } from "@/lib/contexts/HeaderContext";
import { SettingsProvider } from "@/lib/contexts/SettingsContext";
import { SessionAlertProvider } from "@/lib/contexts/SessionAlertContext";
import { AlertProvider } from "@/lib/contexts/AlertContext";
import { ThemeProvider } from "@/app/components/providers/theme-provider";
import { ReactQueryProvider } from "@/app/components/providers/react-query-provider";
import { Toaster } from "@/app/components/ui";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

async function fetchSeoMetadata() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const res = await fetch(`${apiUrl}/settings/seo`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const seo = await fetchSeoMetadata();

  const siteName = seo?.siteName || "RBAC Web App";
  const description = seo?.siteDescription || "Role-Based Access Control Web Application";
  const keywords = seo?.metaKeywords || "";
  const ogImage = seo?.ogImage || "";

  return {
    title: {
      default: siteName,
      template: `%s | ${siteName}`,
    },
    description,
    ...(keywords && { keywords: keywords.split(",").map((k: string) => k.trim()) }),
    openGraph: {
      title: siteName,
      description,
      siteName,
      type: "website",
      ...(ogImage && { images: [{ url: ogImage }] }),
    },
    twitter: {
      card: "summary_large_image",
      title: siteName,
      description,
      ...(ogImage && { images: [ogImage] }),
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ReactQueryProvider>
            <AlertProvider>
              <SessionAlertProvider>
                <AuthProvider>
                  <SettingsProvider>
                    <HeaderProvider>
                      {children}
                    </HeaderProvider>
                  </SettingsProvider>
                </AuthProvider>
              </SessionAlertProvider>
            </AlertProvider>
            <Toaster />
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
