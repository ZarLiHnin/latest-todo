import "./globals.css";
import { ReactNode } from "react";
import Providers from "./providers";

export const metadata = {
  title: "My Task App",
  description: "あなたのタスク管理アプリ",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
