"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Breadcrumbs, SectionHeading, RoomCard, BookingWidget, PriceSummary, Tabs, AmenityList, Divider } from "@/components/ds";
import { useLang } from "@/lib/lang-context";
import { SV_ROOMS, SV_AMENITIES } from "@/lib/ds-data";

export function RoomsPageContent() {
  const { t, lang } = useLang();
  const router = useRouter();
  const [tab, setTab] = useState("all");
  const onBook = () => router.push("/book");

  return (
    <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "40px var(--gutter) var(--section-y)" }}>
      <Breadcrumbs items={[{ label: lang === "vi" ? "Trang chủ" : "Home", href: "/" }, { label: t.nav.rooms }]} />
      <SectionHeading style={{ marginTop: 20 }} overline={t.roomsOverline} title={t.roomsTitle} lede={t.roomsLede} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "var(--space-11)", alignItems: "start" }}>
        <div>
          <Tabs
            value={tab}
            onChange={setTab}
            style={{ marginBottom: "var(--space-7)" }}
            items={
              lang === "vi"
                ? [
                    { id: "all", label: "Tất cả" },
                    { id: "sea", label: "Hướng biển" },
                    { id: "pool", label: "Cạnh hồ bơi" },
                    { id: "family", label: "Cho gia đình" },
                  ]
                : [
                    { id: "all", label: "All" },
                    { id: "sea", label: "Sea view" },
                    { id: "pool", label: "Poolside" },
                    { id: "family", label: "Families" },
                  ]
            }
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "var(--grid-gap)" }}>
            {SV_ROOMS.map((r, i) => (
              <RoomCard
                key={r.id + i}
                image={r.image}
                name={r[lang]}
                flag={lang === "vi" ? r.flagVi : r.flagEn}
                ctaLabel={t.detail}
                onSelect={onBook}
                onFavourite={() => {}}
                meta={r.meta.map((m) => ({ icon: m.icon, label: m[lang] }))}
              />
            ))}
          </div>
          <Divider ornament="waves" style={{ margin: "var(--space-11) 0" }} />
          <SectionHeading overline={t.amenOverline} title={lang === "vi" ? "Có sẵn trong mọi phòng" : "In every room"} />
          <AmenityList columns={2} variant="compact" items={SV_AMENITIES.slice(0, 6).map((a) => ({ icon: a.icon, name: a[lang] }))} />
        </div>
        <div style={{ position: "sticky", top: 100 }}>
          <BookingWidget
            price="15.000.000₫"
            unit={lang === "vi" ? "/ đêm · nguyên căn" : "/ night · whole villa"}
            checkIn="12 Th8"
            checkOut="16 Th8"
            guests={lang === "vi" ? "12 khách" : "12 guests"}
            submitLabel={t.heroPrimary}
            note={lang === "vi" ? "Chưa trừ tiền ở bước này" : "You won't be charged yet"}
            onSubmit={onBook}
          >
            <PriceSummary
              totalLabel={lang === "vi" ? "Tổng cộng" : "Total"}
              total="60.000.000₫"
              rows={[
                { label: "15.000.000₫ × 4", value: "60.000.000₫" },
                {
                  label: lang === "vi" ? "Phí dọn dẹp" : "Cleaning fee",
                  value: lang === "vi" ? "Miễn phí" : "Included",
                  info: lang === "vi" ? "Đã bao gồm trong giá phòng" : "Included in the nightly rate",
                },
              ]}
            />
          </BookingWidget>
        </div>
      </div>
    </div>
  );
}
