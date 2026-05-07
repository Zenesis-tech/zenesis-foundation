import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import { ZenesisHomeHero } from "./zenesis-home-hero";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-zenesis-body",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-zenesis-display",
});

export const metadata: Metadata = {
  title: "Zenesis Foundation | Thinking Beyond Earth's Limits",
  description:
    "Zenesis Foundation advances human civilization through work across agriculture, healthcare, biotechnology, financial infrastructure, and space exploration.",
};

export default function HomePage() {
  return (
    <div className={`${manrope.variable} ${spaceGrotesk.variable}`}>
      <ZenesisHomeHero />
    </div>
  );
}
