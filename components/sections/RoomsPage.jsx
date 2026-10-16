"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Breadcrumbs, SectionHeading, RoomCard, BookingWidget, PriceSummary, Tabs, AmenityList, Divider } from "@/components/ds";
import { useLang } from "@/lib/lang-context";
import { SV_ROOMS, SV_AMENITIES, pickLang } from "@/lib/ds-data";
import { ui } from "@/lib/ui-strings";

export function RoomsPageContent() {
  const { t, lang } = useLang();
  const router = useRouter();
  const [tab, setTab] = useState("all");
  const onBook = () => router.push("/book");
  const home = ui("home", lang);

  return (
    <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "40px var(--gutter) var(--section-y)" }}>
      <Breadcrumbs items={[{ label: home, href: "/" }, { label: t.nav.rooms }]} />
      <SectionHeading style={{ marginTop: 20 }} overline={t.roomsOverline} title={t.roomsTitle} lede={t.roomsLede} />
      <div className="sv-r-split" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 340px", gap: "var(--space-11)", alignItems: "start" }}>
        <div>
          <Tabs value={tab} onChange={setTab} style={{ marginBottom: "var(--space-7)" }} items={ui("roomTabs", lang)} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: "var(--grid-gap)" }}>
            {SV_ROOMS.map((r, i) => (
              <RoomCard
                key={r.id + i}
                image={r.image}
                name={r[lang]}
                flag={pickLang(r, "flag", lang)}
                ctaLabel={t.detail}
                onSelect={onBook}
                onFavourite={() => {}}
                meta={r.meta.map((m) => ({ icon: m.icon, label: m[lang] }))}
              />
            ))}
          </div>
          <Divider ornament="waves" style={{ margin: "var(--space-11) 0" }} />
          <SectionHeading overline={t.amenOverline} title={ui("inEveryRoom", lang)} />
          <AmenityList columns={2} variant="compact" items={SV_AMENITIES.slice(0, 6).map((a) => ({ icon: a.icon, name: a[lang] }))} />
        </div>
        <div className="sv-r-sticky" style={{ position: "sticky", top: 100 }}>
          <BookingWidget
            price="15.000.000₫"
            unit={pickLang({ unitVi: "/ đêm · nguyên căn", unitEn: "/ night · whole villa", unitKo: "/ 1박 · 빌라 전체", unitZh: "/ 晚 · 整栋别墅" }, "unit", lang)}
            checkIn="12 Th8"
            checkOut="16 Th8"
            guests={lang === "vi" ? "12 khách" : lang === "ko" ? "12명" : lang === "zh" ? "12位客人" : "12 guests"}
            submitLabel={t.heroPrimary}
            note={lang === "vi" ? "Chưa trừ tiền ở bước này" : lang === "ko" ? "아직 결제되지 않습니다" : lang === "zh" ? "此步骤暂不扣款" : "You won't be charged yet"}
            onSubmit={onBook}
          >
            <PriceSummary
              totalLabel={lang === "vi" ? "Tổng cộng" : lang === "ko" ? "총액" : lang === "zh" ? "总计" : "Total"}
              total="60.000.000₫"
              rows={[
                { label: "15.000.000₫ × 4", value: "60.000.000₫" },
                {
                  label: lang === "vi" ? "Phí dọn dẹp" : lang === "ko" ? "청소비" : lang === "zh" ? "清洁费" : "Cleaning fee",
                  value: lang === "vi" ? "Miễn phí" : lang === "ko" ? "무료" : lang === "zh" ? "免费" : "Included",
                  info:
                    lang === "vi"
                      ? "Đã bao gồm trong giá phòng"
                      : lang === "ko"
                        ? "숙박 요금에 포함되어 있습니다"
                        : lang === "zh"
                          ? "已包含在房价中"
                          : "Included in the nightly rate",
                },
              ]}
            />
          </BookingWidget>
        </div>
      </div>
    </div>
  );
}
