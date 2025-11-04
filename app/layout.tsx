import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chat Logger",
  description: "Next.js + MongoDB + Tailwind Chat Logger",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-dvh antialiased">
        <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
