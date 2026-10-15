import { SiteHeaderClient, SiteFooterClient } from "@/components/SiteChrome";
import { HomeSections } from "@/components/sections/Home";

export default function HomePage() {
  return (
    <>
      <SiteHeaderClient />
      <HomeSections />
      <SiteFooterClient />
    </>
  );
}
