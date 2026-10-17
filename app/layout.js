import "./globals.css";
import { playfair, beVietnamPro, montserrat } from "./fonts";
import { LangProvider } from "@/lib/lang-context";
import { FloatingContact } from "@/components/FloatingContact";

export const metadata = {
  title: "Đặt phòng · SanDune Villa",
  description:
    "SanDune Villa Danang — nguyên căn ba tầng, năm phòng ngủ, hồ bơi nước mặn, cách biển Mỹ Khê vài bước chân.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="vi"
      className={`${playfair.variable} ${beVietnamPro.variable} ${montserrat.variable}`}
    >
      <body>
        <LangProvider>
          {children}
          <FloatingContact />
        </LangProvider>
      </body>
    </html>
  );
}
