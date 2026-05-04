import "./globals.css";
import { Inter } from "next/font/google";
import AuthSessionProvider from "@/components/AuthSessionProvider";
import ToastProvider from "@/components/ToastProvider";
import PwaServiceWorkerRegistration from "@/components/pwa/PwaServiceWorkerRegistration";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Esto es para el PWA
export const metadata = {
  applicationName: "OA! Bebidas",
  title: "OA! Bebidas",
  description: "Tienda online de bebidas OA!",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
      { url: "/icons/icon-512.svg", sizes: "512x512", type: "image/svg+xml" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    title: "OA! Bebidas",
    statusBarStyle: "default",
  },
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
        <PwaServiceWorkerRegistration />
        <ToastProvider />
      </body>
    </html>
  );
}
