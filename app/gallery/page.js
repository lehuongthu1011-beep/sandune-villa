import { SiteHeaderClient, SiteFooterClient } from "@/components/SiteChrome";
import { GalleryPageContent } from "@/components/sections/GalleryPage";

export const metadata = { title: "Thư viện ảnh · SanDune Villa" };

export default function GalleryPage() {
  return (
    <>
      <SiteHeaderClient />
      <GalleryPageContent />
      <SiteFooterClient />
    </>
  );
}
