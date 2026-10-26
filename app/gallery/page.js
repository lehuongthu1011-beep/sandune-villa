import { SiteHeaderClient, SiteFooterClient } from "@/components/SiteChrome";
import { GalleryPageContent } from "@/components/sections/GalleryPage";

export const metadata = {
  title: "Thư viện ảnh villa Đà Nẵng: hồ bơi nước mặn, phòng ngủ, khu BBQ",
  description:
    "Hơn 70 ảnh thật của SanDune Villa Đà Nẵng: hồ bơi nước mặn, phòng khách, phòng ngủ có bồn tắm đá, phòng xông hơi, khu BBQ và mặt tiền lúc hoàng hôn.",
  alternates: { canonical: "/gallery" },
};

export default function GalleryPage() {
  return (
    <>
      <SiteHeaderClient />
      <GalleryPageContent />
      <SiteFooterClient />
    </>
  );
}
