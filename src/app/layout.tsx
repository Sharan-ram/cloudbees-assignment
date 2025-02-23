import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

import QueryProvider from "@/components/QueryProvider";

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="max-w-3xl mx-auto p-6">
        <QueryProvider>
          <Navbar />
          <main className="max-w-4xl mx-auto p-6">{children}</main>
        </QueryProvider>
      </body>
    </html>
  );
}
