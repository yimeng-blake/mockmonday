import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "MockMonday",
  description: "A Monday.com-style project management app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              fontSize: '14px',
              fontFamily: 'Figtree, sans-serif',
            },
          }}
        />
      </body>
    </html>
  );
}
