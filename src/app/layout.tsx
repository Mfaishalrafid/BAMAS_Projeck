import type { Metadata } from "next";
import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/plus-jakarta-sans";
import "./globals.css";
export const metadata: Metadata = {
  title: "BAMAS — Bantu Masyarakat",
  description:
    "Prototipe aplikasi donasi BAMAS. SIMULASI — bukan transaksi nyata.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
