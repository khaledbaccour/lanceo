import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import { notFound } from "next/navigation";
import { isValidLocale, locales } from "@/i18n/config";
import "./globals.css";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const lang = isValidLocale(locale) ? locale : "fr";
  
  const titles: Record<string, string> = {
    fr: "Lanceo - Site professionnel clé en main",
    es: "Lanceo - Sitio web profesional todo en uno",
    en: "Lanceo - All-in-one professional website"
  };
  
  const descriptions: Record<string, string> = {
    fr: "Template premium français avec réservation intégrée, assistant FAQ IA et dashboard admin pour indépendants.",
    es: "Template premium en español con reserva integrada, asistente de FAQ con IA y panel de admin.",
    en: "Premium French template with built-in booking, AI FAQ assistant and admin dashboard for independents."
  };
  
  return {
    title: titles[lang] || titles.fr,
    description: descriptions[lang] || descriptions.fr,
  };
}

const display = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const body = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  
  if (!isValidLocale(locale)) {
    notFound();
  }

  return (
    <html lang={locale}>
      <body className={`${display.variable} ${body.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
