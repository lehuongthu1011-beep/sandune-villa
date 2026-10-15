import { SiteHeaderClient, SiteFooterClient } from "@/components/SiteChrome";
import { RoomsPageContent } from "@/components/sections/RoomsPage";

export const metadata = { title: "Phòng · SanDune Villa" };

export default function RoomsPage() {
  return (
    <>
      <SiteHeaderClient />
      <RoomsPageContent />
      <SiteFooterClient />
    </>
  );
}
