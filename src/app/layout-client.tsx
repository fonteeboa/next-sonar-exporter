"use client";

import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider, useAppTheme } from "@/context/ThemeContext";
import { EuiProvider } from "@elastic/eui";
import { JetBrains_Mono } from "next/font/google";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});


interface Props {
  readonly children: React.ReactNode;
}

function EuiThemeWrapper({ children }: Props) {
  const { colorMode } = useAppTheme();
  return <EuiProvider colorMode={colorMode}>{children}</EuiProvider>;
}

export default function RootLayoutClient({ children }: Props) {
  return (
    <html lang="pt-BR"  className={jetbrainsMono.variable}>
      <body >
        <ThemeProvider>
          <EuiThemeWrapper>{children}</EuiThemeWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
