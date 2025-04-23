import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Event Task Manager",
  description: "Manage your event tasks efficiently",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <header className="bg-purple-600 text-white py-4 text-center">
          <h1 className="text-2xl font-bold">Event Task Manager</h1>
        </header>
        <main className="p-4">{children}</main>
        <footer className="bg-gray-800 text-white py-4 text-center">
          <p>&copy; {new Date().getFullYear()} Event Task Manager. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}