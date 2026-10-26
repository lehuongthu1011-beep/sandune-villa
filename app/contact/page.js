import { SiteHeaderClient, SiteFooterClient } from "@/components/SiteChrome";
import ContactClient from "./client";

export const metadata = {
  title: "Liên hệ đặt villa Mỹ Khê Đà Nẵng",
  description:
    "Liên hệ SanDune Villa: 43 Mỹ Khê 1, Sơn Trà, Đà Nẵng. Gọi 096.315.9933 hoặc nhắn Zalo, Telegram để hỏi giá và giữ ngày thuê nguyên căn.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <SiteHeaderClient />
      <ContactClient />
      <SiteFooterClient />
    </>
  );
}
