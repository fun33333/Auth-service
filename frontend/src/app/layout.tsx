import type { Metadata } from "next";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Employee Management System",
  description: "Modern EMS built with Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="antialiased min-h-screen text-slate-900 dark:text-slate-100 flex flex-col"
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}