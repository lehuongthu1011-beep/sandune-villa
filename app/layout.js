import "./globals.css";
import { playfair, beVietnamPro, montserrat } from "./fonts";
import { LangProvider } from "@/lib/lang-context";
import { FloatingContact } from "@/components/FloatingContact";

const SITE_URL = "https://sandunevilla.vn";
const DEFAULT_TITLE = "SanDune Villa Đà Nẵng · Villa nguyên căn 5 phòng ngủ, hồ bơi nước mặn gần biển Mỹ Khê";
const DEFAULT_DESC =
  "SanDune Villa Đà Nẵng: villa nguyên căn ba tầng, năm phòng ngủ, hồ bơi nước mặn, cách biển Mỹ Khê vài bước chân. Đặt trực tiếp với chủ villa.";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: DEFAULT_TITLE, template: "%s · SanDune Villa" },
  description: DEFAULT_DESC,
  applicationName: "SanDune Villa",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "SanDune Villa",
    locale: "vi_VN",
    url: "/",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESC,
    images: [{ url: "/assets/photo-pool-dusk.png", width: 1200, height: 799, alt: "Mặt tiền SanDune Villa lúc hoàng hôn, Mỹ Khê, Đà Nẵng" }],
  },
  twitter: { card: "summary_large_image", title: DEFAULT_TITLE, description: DEFAULT_DESC, images: ["/assets/photo-pool-dusk.png"] },
  robots: { index: true, follow: true },
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
