import { Playfair_Display, Be_Vietnam_Pro, Montserrat } from "next/font/google";

export const playfair = Playfair_Display({
  subsets: ["latin", "latin-ext", "vietnamese"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

export const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "latin-ext", "vietnamese"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-be-vietnam",
  display: "swap",
});

export const montserrat = Montserrat({
  subsets: ["latin", "latin-ext", "vietnamese"],
  weight: ["300", "400", "500"],
  variable: "--font-montserrat",
  display: "swap",
});
