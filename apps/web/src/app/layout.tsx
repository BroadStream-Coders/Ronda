import type { Metadata } from "next";
import { Newsreader, Libre_Franklin } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const libreFranklin = Libre_Franklin({
  variable: "--font-libre-franklin",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Ronda — El área digital de tu programa de televisión",
  description:
    "Software para programas de TV en vivo: carga los datos del juego, sale al aire y tu equipo lo maneja sin complicaciones.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${newsreader.variable} ${libreFranklin.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col tracking-[-0.006em]">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
