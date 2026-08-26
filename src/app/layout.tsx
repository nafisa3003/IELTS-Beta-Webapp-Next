import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/shell/theme-provider";
import "./globals.css";

const display = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "IELTS Beta 3.0",
  description: "Your complete IELTS preparation companion.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`} suppressHydrationWarning>
      <body className="font-body antialiased">
        <ThemeProvider>
          {children}
          <Toaster
            position="top-right"
            closeButton
            toastOptions={{
              classNames: {
                toast:
                  "!bg-surface dark:!bg-[var(--white)] !border !border-mist !text-ink !shadow-float !rounded-md",
                title: "!font-medium !text-sm",
                actionButton: "!bg-teal !text-white !rounded-pill !text-xs !font-semibold",
                cancelButton: "!bg-mist !text-slate !rounded-pill !text-xs !font-semibold",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
