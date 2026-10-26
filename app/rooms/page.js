import { SiteHeaderClient, SiteFooterClient } from "@/components/SiteChrome";
import { RoomsPageContent } from "@/components/sections/RoomsPage";

export const metadata = {
  title: "Phòng nghỉ villa Mỹ Khê Đà Nẵng: Phòng Gác Lửng, Phòng Vườn",
  description:
    "Các phòng ngủ tại SanDune Villa Đà Nẵng: phòng Gác Lửng duplex có bồn tắm đá, phòng Vườn, giường king, ban công riêng. Thuê nguyên căn, cách biển Mỹ Khê vài bước chân.",
  alternates: { canonical: "/rooms" },
};

export default function RoomsPage() {
  return (
    <>
      <SiteHeaderClient />
      <RoomsPageContent />
      <SiteFooterClient />
    </>
  );
}
