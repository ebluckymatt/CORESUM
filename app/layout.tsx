import "./globals.css";
import type { Metadata } from "next";
import { appName } from "@/lib/constants";

export const metadata: Metadata = {
  title: appName,
  description: "Construction execution and accountability platform for Halo Technical Solutions Global."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
