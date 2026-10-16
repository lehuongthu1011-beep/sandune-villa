"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Overline, Stat, Testimonial, Figure, Icon, Rating, SectionHeading, AmenityList } from "@/components/ds";
import { useLang } from "@/lib/lang-context";
import { SV_ASSETS, SV_AMENITIES, SV_REVIEWS, SV_SCORES, SV_RATE, SV_CONTACT, SV_SHOWCASE, pickLang } from "@/lib/ds-data";

const wrap = { maxWidth: "var(--container-max)", margin: "0 auto", padding: "0 var(--gutter)" };
const narrow = { maxWidth: "var(--container-narrow)", margin: "0 auto", padding: "0 var(--gutter)" };
const serif = { fontFamily: "var(--font-display)", fontWeight: "var(--weight-display)", color: "var(--text-primary)", margin: 0, textWrap: "pretty" };
const copy = { fontFamily: "var(--font-sans)", fontSize: "var(--size-body-md)", lineHeight: "var(--lh-body-lg)", color: "var(--text-secondary)", margin: 0 };
const html = (s) => ({ dangerouslySetInnerHTML: { __html: s } });

function Hero() {
  const { t } = useLang();
  return (
    <section style={{ position: "relative", height: "100vh", minHeight: 640, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      <img src={SV_ASSETS + "photo-pool-hammocks.png"} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", inset: 0, background: "var(--gradient-protect-top)" }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(28,34,18,.52) 0%, rgba(28,34,18,.34) 55%, rgba(28,34,18,.44) 100%)" }} />
      <div style={{ position: "absolute", inset: 0, background: "var(--gradient-protect)" }} />
      <div style={{ position: "relative", textAlign: "center" }}>
        <img src="/assets/logo-mark.png" alt="KUANS" style={{ height: 92, width: "auto", margin: "0 auto", filter: "brightness(0) invert(1)" }} />
        <div style={{ marginTop: "var(--space-3)", textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 25, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--text-inverse)" }}>
            SanDune Villa
          </div>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, letterSpacing: "var(--ls-overline)", textTransform: "uppercase", marginTop: 6, color: "var(--text-inverse-muted)" }}>
            Đà Nẵng · by KUANS
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 40, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-4)" }}>
        <Overline tone="inverse" style={{ fontSize: 12 }}>{t.scrollLabel}</Overline>
        <span style={{ display: "block", width: 1, height: 46, background: "rgba(255,255,255,.5)" }} />
      </div>
    </section>
  );
}

function Statement() {
  const { t } = useLang();
  return (
    <section style={{ background: "var(--surface-page)", padding: "var(--section-y) 0 var(--section-y-compact)" }}>
      <div style={narrow}>
        <h2 className="sv-statement sv-statement--wide" style={{ fontStyle: "italic" }}>
          {t.statement}
        </h2>
      </div>
    </section>
  );
}

function Strip() {
  const shots = ["photo-pool-waterfall-garden.png", "photo-entry-door.png", "photo-bed-tub-balcony.png", "photo-pool-dusk-loungers.png"];
  return (
    <div className="sv-r-4" style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: "var(--space-2)", padding: "0 var(--space-2)" }}>
      {shots.map((s) => (
        <Figure key={s} src={SV_ASSETS + s} shape="soft" ratio="1/1" alt="" />
      ))}
    </div>
  );
}

function About({ onAbout }) {
  const { t } = useLang();
  return (
    <section style={{ background: "var(--surface-page)", paddingBottom: "var(--section-y)" }}>
      <Strip />
      <div style={{ ...narrow, marginTop: "var(--space-12)", textAlign: "center" }}>
        <Overline>{t.introOverline}</Overline>
        <h3
          style={{ ...serif, fontSize: "var(--size-heading-lg)", lineHeight: 1.65, marginTop: "var(--space-6)", color: "var(--text-secondary)" }}
          {...html(t.introHtml)}
        />
        <p style={{ ...copy, marginTop: "var(--space-7)", maxWidth: "58ch", marginLeft: "auto", marginRight: "auto", textAlign: "center" }}>{t.introBody}</p>
        <div style={{ display: "flex", justifyContent: "center", marginTop: "var(--space-8)" }}>
          <Button variant="secondary" onClick={onAbout}>
            {t.aboutBtn}
          </Button>
        </div>
      </div>
    </section>
  );
}

function ShowcaseRow({ item, flip, onSelect }) {
  const [i, setI] = useState(0);
  const { t, lang } = useLang();
  const media = (
    <div>
      <Figure src={SV_ASSETS + item.images[i]} shape="soft" ratio="4/3" alt="" />
      <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "var(--space-3)" }}>
        {item.images.map((im, n) => (
          <button
            key={im}
            onClick={() => setI(n)}
            aria-label={`${n + 1}`}
            style={{ flex: 1, height: 2, border: "none", padding: 0, cursor: "pointer", background: n === i ? "var(--olive-700)" : "var(--border-default)", transition: "background var(--duration-normal) var(--ease-standard)" }}
          />
        ))}
      </div>
    </div>
  );
  const text = (
    <div style={{ paddingTop: "var(--space-8)" }}>
      <h3 style={{ ...serif, fontSize: "var(--size-display-sm)", lineHeight: "var(--lh-display-sm)" }}>{item[lang]}</h3>
      <p style={{ ...copy, fontSize: "var(--size-body-lg)", marginTop: "var(--space-5)", maxWidth: "34ch" }} {...html(pickLang(item, "blurb", lang))} />
      <button
        onClick={onSelect}
        style={{ marginTop: "var(--space-7)", background: "none", border: "none", padding: "0 0 5px", cursor: "pointer", fontFamily: "var(--font-label)", fontSize: 11, textTransform: "uppercase", letterSpacing: "var(--ls-label)", color: "var(--text-brand)", borderBottom: "1px solid var(--border-accent)" }}
      >
        {t.discoverBtn}
      </button>
    </div>
  );
  return (
    <div className="sv-r-row" style={{ ...wrap, display: "grid", gridTemplateColumns: flip ? "minmax(0,0.85fr) minmax(0,1.15fr)" : "minmax(0,1.15fr) minmax(0,0.85fr)", gap: "var(--space-13)", alignItems: "start", marginBottom: "var(--space-14)" }}>
      {flip ? (
        <>
          {text}
          {media}
        </>
      ) : (
        <>
          {media}
          {text}
        </>
      )}
    </div>
  );
}

function Showcase({ onSelect }) {
  const { t } = useLang();
  return (
    <section style={{ background: "var(--mist-100)", padding: "var(--section-y) 0 var(--space-9)" }}>
      <div style={{ ...wrap, marginBottom: "var(--space-13)" }}>
        <h2 className="sv-statement sv-statement--full" {...html(t.showcaseHtml)} />
      </div>
      {SV_SHOWCASE.map((item, n) => (
        <ShowcaseRow key={item.id} item={item} flip={n % 2 === 1} onSelect={onSelect} />
      ))}
    </section>
  );
}

function BookBand({ onBook }) {
  const { t } = useLang();
  return (
    <section style={{ position: "relative", padding: "160px 0", overflow: "hidden" }}>
      <img src={SV_ASSETS + "photo-pool-night.png"} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", inset: 0, background: "rgba(28,34,18,.58)" }} />
      <div style={{ ...narrow, position: "relative", textAlign: "center" }}>
        <h2 className="sv-statement sv-statement--inverse" {...html(t.bookBandHtml)} />
        <div style={{ display: "flex", justifyContent: "center", marginTop: "var(--space-9)" }}>
          <Button variant="inverse" size="lg" onClick={onBook}>
            {t.ctaBtn}
          </Button>
        </div>
      </div>
    </section>
  );
}

function Facts() {
  const { t } = useLang();
  return (
    <section style={{ background: "var(--surface-page)", padding: "var(--section-y-compact) 0" }}>
      <div className="sv-r-4" style={{ ...wrap, display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: "var(--space-8)" }}>
        {t.stats.map((s) => (
          <Stat key={s.label} value={s.value} label={s.label} align="center" />
        ))}
      </div>
    </section>
  );
}

function Amenities() {
  const { t, lang } = useLang();
  return (
    <section style={{ background: "var(--mist-100)", padding: "var(--section-y) 0" }}>
      <div style={wrap}>
        <SectionHeading align="center" overline={t.amenOverline} title={t.amenTitle} />
        <AmenityList
          columns={3}
          items={SV_AMENITIES.map((a) => ({ icon: a.icon, name: a[lang], note: pickLang(a, "note", lang) }))}
        />
      </div>
    </section>
  );
}

function Reviews() {
  const { t, lang } = useLang();
  const s = SV_SCORES;
  const score = { fontFamily: "var(--font-display)", fontSize: 30, letterSpacing: ".01em", color: "var(--text-primary)" };
  const src = { fontFamily: "var(--font-label)", fontSize: 10, textTransform: "uppercase", letterSpacing: "var(--ls-overline)", color: "var(--text-muted)", marginTop: "var(--space-3)" };
  return (
    <section style={{ background: "var(--surface-page)", padding: "var(--section-y) 0" }}>
      <div style={{ ...narrow, textAlign: "center" }}>
        <h2 className="sv-statement">{t.reviewsHeading}</h2>
        <div style={{ display: "flex", justifyContent: "center", gap: "var(--space-12)", marginTop: "var(--space-8)", flexWrap: "wrap" }}>
          <div>
            <Rating value={s.airbnb.rating} count={s.airbnb.count} />
            <div style={src}>Airbnb</div>
          </div>
          <div>
            <div style={score}>
              {s.agoda.rating}
              <span style={{ fontSize: 14, color: "var(--text-muted)" }}>/10</span>
            </div>
            <div style={src}>Agoda · {pickLang(s.agoda, "label", lang)}</div>
          </div>
        </div>
      </div>
      <div className="sv-r-3" style={{ ...wrap, display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: "var(--space-9)", marginTop: "var(--space-12)" }}>
        {SV_REVIEWS.map((r) => (
          <Testimonial key={r.name} quote={r[lang]} name={r.name} from={pickLang(r, "from", lang)} />
        ))}
      </div>
    </section>
  );
}

function Place() {
  const { t } = useLang();
  return (
    <section style={{ background: "var(--mist-100)", padding: "var(--section-y) 0" }}>
      <div className="sv-r-row" style={{ ...wrap, display: "grid", gridTemplateColumns: "minmax(0,1.15fr) minmax(0,0.85fr)", gap: "var(--space-13)", alignItems: "center" }}>
        <Figure src={SV_ASSETS + "photo-exterior-dusk.png"} ratio="4/3" alt="" />
        <div>
          <Overline>{t.placeOverline}</Overline>
          <h3
            style={{ ...serif, fontSize: "var(--size-display-sm)", lineHeight: "var(--lh-display-sm)", marginTop: "var(--space-5)" }}
            {...html(t.placeHeadingHtml)}
          />
          <div style={{ marginTop: "var(--space-8)" }}>
            {t.placeNear.map((p) => (
              <div key={p.name} style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", padding: "var(--space-4) 0", borderBottom: "1px solid var(--border-subtle)" }}>
                <span style={{ color: "var(--olive-700)" }}>
                  <Icon name={p.icon} size={17} />
                </span>
                <span style={{ flex: 1, fontFamily: "var(--font-sans)", fontSize: "var(--size-body-sm)", color: "var(--text-primary)" }}>{p.name}</span>
                <span style={{ fontFamily: "var(--font-label)", fontSize: 10, textTransform: "uppercase", letterSpacing: ".12em", color: "var(--text-muted)" }}>{p.dist}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CtaBand({ onBook }) {
  const { t, lang } = useLang();
  const rate = SV_RATE;
  return (
    <section style={{ position: "relative", padding: "150px 0", overflow: "hidden" }}>
      <img src={SV_ASSETS + "photo-pool-dusk.png"} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", inset: 0, background: "rgba(28,34,18,.6)" }} />
      <div style={{ ...narrow, position: "relative", textAlign: "center" }}>
        <h2 className="sv-statement sv-statement--inverse">{t.ctaTitle}</h2>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: "var(--space-3)", marginTop: "var(--space-8)" }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 34, color: "var(--text-inverse)" }}>{rate.amount}</span>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: "var(--size-body-sm)", color: "var(--text-inverse-muted)" }}>{pickLang(rate, "unit", lang)}</span>
        </div>
        <p style={{ ...copy, color: "var(--text-inverse-muted)", marginTop: "var(--space-4)" }}>{pickLang(rate, "note", lang)}</p>
        <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "center", marginTop: "var(--space-9)", flexWrap: "wrap" }}>
          <Button variant="inverse" size="lg" onClick={onBook}>
            {t.ctaBtn}
          </Button>
          <Button variant="outline-inverse" size="lg" iconLeft="phone" as="a" href={"tel:" + SV_CONTACT.phone.replace(/\./g, "")}>
            {SV_CONTACT.phone}
          </Button>
        </div>
      </div>
    </section>
  );
}

export function HomeSections() {
  const router = useRouter();
  const goRooms = () => router.push("/rooms");
  const goBook = () => router.push("/book");
  return (
    <>
      <Hero />
      <Statement />
      <About onAbout={goRooms} />
      <Showcase onSelect={goRooms} />
      <BookBand onBook={goBook} />
      <Facts />
      <Amenities />
      <Reviews />
      <Place />
      <CtaBand onBook={goBook} />
    </>
  );
}
