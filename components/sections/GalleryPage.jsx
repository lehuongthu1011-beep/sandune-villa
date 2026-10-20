"use client";
import { useState } from "react";
import { Breadcrumbs, SectionHeading, Tabs, Figure, IconButton } from "@/components/ds";
import { useLang } from "@/lib/lang-context";
import { SV_GALLERY, SV_GALLERY_ALL } from "@/lib/ds-data";
import { ui } from "@/lib/ui-strings";

export function GalleryPageContent() {
  const { t, lang } = useLang();
  const [tab, setTab] = useState("featured");
  const [open, setOpen] = useState(null);
  const shots = SV_GALLERY;
  const allShots = SV_GALLERY_ALL.map((src) => ({ src }));
  const list = tab === "all" ? allShots : shots;
  const home = ui("home", lang);

  return (
    <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "40px var(--gutter) var(--section-y)" }}>
      <Breadcrumbs items={[{ label: home, href: "/" }, { label: t.nav.gallery }]} />
      <SectionHeading style={{ marginTop: 20 }} overline={t.galOverline} title={t.galTitle} />
      <Tabs value={tab} onChange={setTab} style={{ marginBottom: "var(--space-8)" }} items={ui("galleryTabs", lang)} />
      <div className="sv-r-masonry" style={{ columnCount: 3, columnGap: "var(--grid-gap)" }}>
        {list.map((s, i) => (
          <div key={s.src} style={{ breakInside: "avoid", marginBottom: "var(--grid-gap)", cursor: "pointer" }} onClick={() => setOpen(s.src)}>
            <Figure src={s.src} shape="soft" ratio={i % 3 === 0 ? "3/4" : i % 3 === 1 ? "4/3" : "1/1"} style={{ aspectRatio: "auto" }} caption={s[lang]} alt={s[lang] || ""} />
          </div>
        ))}
      </div>
      {open && (
        <div
          onClick={() => setOpen(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(35,47,22,.9)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}
        >
          <div style={{ position: "absolute", top: 20, right: 24 }}>
            <IconButton icon="x" label="Close" variant="glass" size="lg" onClick={() => setOpen(null)} />
          </div>
          <img src={open} alt="" style={{ maxWidth: "90%", maxHeight: "86vh", objectFit: "contain", borderRadius: "var(--radius-lg)" }} />
        </div>
      )}
    </div>
  );
}
