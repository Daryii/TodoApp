import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./components/theme-provider";
import { Toaster } from "react-hot-toast";
import { ThemeToggle } from "./components/theme-toggle";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Todo App - Next.js + Supabase",
  description: "Secure todo app with server-side auth and database",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <ThemeToggle />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "rgba(31, 23, 35, 0.95)",
                color: "#fff",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              },
              success: {
                iconTheme: {
                  primary: "#69f0ae",
                  secondary: "#000",
                },
              },
              error: {
                iconTheme: {
                  primary: "#ff8a80",
                  secondary: "#000",
                },
              },
            }}
          />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
