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

export const metadata: Metadata = {
  title: "RBAC Web App",
  description: "Role-Based Access Control Web Application",
};

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
