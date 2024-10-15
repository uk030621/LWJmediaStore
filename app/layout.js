import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "LWJ Media Repository",
  description: "Developed by LWJ",
  icons: {
    icon: "/icons/icon-512x512.png", // Favicon
    apple: "/icons/icon-180x180.png", // Apple touch icon for iOS home screen
  },
  manifest: "/manifest.json", // Link to your Web App Manifest
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Add mobile-web-app-capable tags manually */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        {/* You can still manually add theme-color here if needed */}
        <meta name="theme-color" content="#000000" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
