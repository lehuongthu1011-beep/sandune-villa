import { SiteHeaderClient, SiteFooterClient } from "@/components/SiteChrome";
import ContactClient from "./client";

export const metadata = { title: "Liên hệ · SanDune Villa" };

export default function ContactPage() {
  return (
    <>
      <SiteHeaderClient />
      <ContactClient />
      <SiteFooterClient />
    </>
  );
}
