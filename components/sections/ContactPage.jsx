"use client";
import { useState } from "react";
import { Breadcrumbs, SectionHeading, Card, Field, Input, Textarea, Select, Checkbox, Button, AmenityList, Figure, Overline } from "@/components/ds";
import { useLang } from "@/lib/lang-context";
import { SV_ASSETS, SV_CONTACT } from "@/lib/ds-data";
import { sendLead } from "@/lib/notify";
import { ui } from "@/lib/ui-strings";

const EMPTY = { name: "", email: "", phone: "", guests: "", dates: "", notes: "", offers: false };

export function ContactPageContent({ onSent }) {
  const { t, lang } = useLang();
  const [form, setForm] = useState(EMPTY);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const c = ui("contact", lang);
  const home = ui("home", lang);

  const submit = () => {
    if (!form.name.trim() || !form.email.trim()) return;
    sendLead({ type: "contact", lang, ...form });
    setForm(EMPTY);
    onSent && onSent();
  };

  return (
    <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "40px var(--gutter) var(--section-y)" }}>
      <Breadcrumbs items={[{ label: home, href: "/" }, { label: t.nav.contact }]} />
      <SectionHeading style={{ marginTop: 20 }} overline={c.overline} title={c.title} lede={c.lede} />
      <div className="sv-r-split" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 380px", gap: "var(--space-11)", alignItems: "start" }}>
        <Card padded elevation="flat">
          <div className="sv-r-2" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: "var(--space-5)" }}>
            <Field label={c.fullName} required>
              <Input iconLeft="user" placeholder={c.fullNamePh} value={form.name} onChange={set("name")} />
            </Field>
            <Field label={c.email} required>
              <Input iconLeft="mail" placeholder={c.emailPh} value={form.email} onChange={set("email")} />
            </Field>
            <Field label={c.phone}>
              <Input iconLeft="phone" placeholder={c.phonePh} value={form.phone} onChange={set("phone")} />
            </Field>
            <Field label={c.guests}>
              <Select placeholder={c.guestsSelect} options={["2", "4", "6", "8", "10+"]} value={form.guests} onChange={set("guests")} />
            </Field>
            <div style={{ gridColumn: "1 / -1" }}>
              <Field label={c.dates}>
                <Input iconLeft="calendar" placeholder={c.datesPh} value={form.dates} onChange={set("dates")} />
              </Field>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <Field label={c.notes} hint={c.notesHint}>
                <Textarea rows={4} value={form.notes} onChange={set("notes")} />
              </Field>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, marginTop: "var(--space-7)" }}>
            <Checkbox label={c.offers} checked={form.offers} onChange={() => setForm((f) => ({ ...f, offers: !f.offers }))} />
            <Button variant="primary" size="lg" iconRight="send" onClick={submit}>
              {c.send}
            </Button>
          </div>
        </Card>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
          <Figure src={SV_ASSETS + "photo-exterior-entry.png"} shape="soft" ratio="4/3" alt="Cổng vào SanDune Villa, 43 Mỹ Khê 1, Đà Nẵng" />
          <Card padded>
            <Overline>{c.addressOverline}</Overline>
            <p style={{ fontSize: "var(--size-body-sm)", lineHeight: 1.7, color: "var(--text-secondary)", marginTop: 12 }}>{c.addressText}</p>
            <div style={{ height: 1, background: "var(--border-subtle)", margin: "18px 0" }} />
            <AmenityList
              variant="compact"
              columns={1}
              items={[
                { icon: "footprints", name: c.nearBeach },
                { icon: "plane", name: c.nearAirport },
                { icon: "phone", name: SV_CONTACT.phone },
                { icon: "mail", name: SV_CONTACT.email },
              ]}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
