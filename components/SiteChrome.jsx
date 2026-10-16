"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SiteHeader, SiteFooter, Toast } from "@/components/ds";
import { useLang } from "@/lib/lang-context";
import { SV_CONTACT, pickLang } from "@/lib/ds-data";

const ROUTES = { villa: "/", rooms: "/rooms", gallery: "/gallery", contact: "/contact" };
const IDS_BY_PATH = { "/": "villa", "/rooms": "rooms", "/gallery": "gallery", "/contact": "contact" };
const LANG_OPTIONS = [
  { code: "vi", label: "VI" },
  { code: "en", label: "EN" },
  { code: "ko", label: "KO" },
  { code: "zh", label: "中文" },
];

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
      lang={lang}
      langs={LANG_OPTIONS}
      onLangChange={(code) => setLang(code.toLowerCase())}
      ctaLabel={t.cta}
      onCta={() => router.push("/book")}
    />
  );
}

const FOOTER_COLUMNS = {
  vi: [
    { title: "Biệt thự", links: ["Phòng ngủ", "Tiện nghi", "Thư viện ảnh", "Hồ bơi"] },
    { title: "Đặt phòng", links: ["Giá & lịch trống", "Chính sách huỷ", "Nhận / trả phòng"] },
  ],
  en: [
    { title: "The villa", links: ["Bedrooms", "Amenities", "Gallery", "The pool"] },
    { title: "Booking", links: ["Rates & availability", "Cancellation", "Check-in / out"] },
  ],
  ko: [
    { title: "빌라", links: ["침실", "편의시설", "갤러리", "수영장"] },
    { title: "예약", links: ["요금 및 예약 가능일", "취소 정책", "체크인 / 체크아웃"] },
  ],
  zh: [
    { title: "别墅", links: ["卧室", "设施", "相册", "泳池"] },
    { title: "预订", links: ["价格与空房", "取消政策", "入住 / 退房"] },
  ],
};

export function SiteFooterClient() {
  const { lang } = useLang();
  return (
    <SiteFooter
      legal="© 2026 SanDune Villa Danang by KUANS"
      address={pickLang(SV_CONTACT, "address", lang)}
      phone={SV_CONTACT.phone}
      email={SV_CONTACT.email}
      columns={FOOTER_COLUMNS[lang] || FOOTER_COLUMNS.vi}
      lang={lang}
    />
  );
}

const TOAST_DESC = {
  vi: "Lễ tân sẽ phản hồi trong ngày.",
  en: "The host replies the same day.",
  ko: "호스트가 당일 안에 답변드립니다.",
  zh: "房东将于当天回复。",
};

export function ToastHost({ toast, onDismiss }) {
  const { lang } = useLang();
  if (!toast) return null;
  return (
    <div style={{ position: "fixed", right: 24, bottom: 24, zIndex: 500 }}>
      <Toast tone="success" title={toast} description={TOAST_DESC[lang] || TOAST_DESC.vi} onDismiss={onDismiss} />
    </div>
  );
}
