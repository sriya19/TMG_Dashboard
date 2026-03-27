import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";

export const metadata: Metadata = {
  title: "TMG Dashboard | Top Marble & Granite",
  description:
    "Project management dashboard for Top Marble & Granite",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex font-sans">
        <Sidebar />
        <main className="flex-1 min-h-screen ml-[var(--sidebar-width)] transition-all duration-300">
          {children}
        </main>
      </body>
    </html>
  );
}
