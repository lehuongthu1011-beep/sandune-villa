"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SiteHeader, SiteFooter, Toast } from "@/components/ds";
import { useLang } from "@/lib/lang-context";
import { SV_CONTACT } from "@/lib/ds-data";

const ROUTES = { villa: "/", rooms: "/rooms", gallery: "/gallery", contact: "/contact" };
const IDS_BY_PATH = { "/": "villa", "/rooms": "rooms", "/gallery": "gallery", "/contact": "contact" };

export function SiteHeaderClient() {
  const { lang, setLang, t } = useLang();
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const onHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight - 120);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const headerVariant = onHome ? (scrolled ? "glass" : "transparent") : "solid";
  const links = [
    { id: "villa", label: t.nav.villa },
    { id: "rooms", label: t.nav.rooms },
    { id: "gallery", label: t.nav.gallery },
    { id: "contact", label: t.nav.contact },
  ];

  return (
    <SiteHeader
      variant={headerVariant}
      links={links}
      active={IDS_BY_PATH[pathname] || "villa"}
      onNavigate={(id) => router.push(ROUTES[id] || "/")}
      lang={lang === "vi" ? "VI" : "EN"}
      onLangChange={(l) => setLang(l === "VI" ? "vi" : "en")}
      ctaLabel={t.cta}
      onCta={() => router.push("/book")}
    />
  );
}

export function SiteFooterClient() {
  const { lang } = useLang();
  return (
    <SiteFooter
      legal="© 2026 SanDune Villa Danang by KUANS"
      address={lang === "vi" ? SV_CONTACT.addressVi : SV_CONTACT.addressEn}
      phone={SV_CONTACT.phone}
      email={SV_CONTACT.email}
      columns={
        lang === "vi"
          ? [
              { title: "Biệt thự", links: ["Phòng ngủ", "Tiện nghi", "Thư viện ảnh", "Hồ bơi"] },
              { title: "Đặt phòng", links: ["Giá & lịch trống", "Chính sách huỷ", "Nhận / trả phòng"] },
            ]
          : [
              { title: "The villa", links: ["Bedrooms", "Amenities", "Gallery", "The pool"] },
              { title: "Booking", links: ["Rates & availability", "Cancellation", "Check-in / out"] },
            ]
      }
    />
  );
}

export function ToastHost({ toast, onDismiss }) {
  const { lang } = useLang();
  if (!toast) return null;
  return (
    <div style={{ position: "fixed", right: 24, bottom: 24, zIndex: 500 }}>
      <Toast
        tone="success"
        title={toast}
        description={lang === "vi" ? "Lễ tân sẽ phản hồi trong ngày." : "The host replies the same day."}
        onDismiss={onDismiss}
      />
    </div>
  );
}
