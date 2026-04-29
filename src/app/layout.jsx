import "./globals.css";
import { Inter } from "next/font/google";
import AuthSessionProvider from "@/components/AuthSessionProvider";
import ToastProvider from "@/components/ToastProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "OA! - Tu tienda online",
  description: "Catálogo y tienda online",
  manifest: "/manifest.json",
  icons: { icon: "/icons/icon-192.png", apple: "/icons/icon-192.png" },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#C1121F",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`bg-background ${inter.variable}`}>
        <AuthSessionProvider>{children}</AuthSessionProvider>
        <ToastProvider />
      </body>
    </html>
  );
}
