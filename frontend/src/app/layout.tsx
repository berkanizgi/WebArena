import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WebArena — Betritt die Arena",
  description: "Wähle deinen Kämpfer und spiele WebArena direkt im Browser. Training und Solo-Arena auf der originalen Spielkarte.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body>
        {children}
      </body>
    </html>
  );
}
