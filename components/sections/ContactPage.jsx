"use client";
import { useState } from "react";
import { Breadcrumbs, SectionHeading, Card, Field, Input, Textarea, Select, Checkbox, Button, AmenityList, Figure, Overline } from "@/components/ds";
import { useLang } from "@/lib/lang-context";
import { SV_ASSETS, SV_CONTACT } from "@/lib/ds-data";
import { sendLead } from "@/lib/notify";

const EMPTY = { name: "", email: "", phone: "", guests: "", dates: "", notes: "", offers: false };

export function ContactPageContent({ onSent }) {
  const { t, lang } = useLang();
  const L = lang === "vi";
  const [form, setForm] = useState(EMPTY);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = () => {
    if (!form.name.trim() || !form.email.trim()) return;
    sendLead({ type: "contact", lang, ...form });
    setForm(EMPTY);
    onSent && onSent();
  };

  return (
    <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "40px var(--gutter) var(--section-y)" }}>
      <Breadcrumbs items={[{ label: L ? "Trang chủ" : "Home", href: "/" }, { label: t.nav.contact }]} />
      <SectionHeading
        style={{ marginTop: 20 }}
        overline={L ? "Liên hệ" : "Get in touch"}
        title={L ? "Chat trực tiếp với chủ nhà" : "Chat directly with the host"}
        lede={
          L
            ? "Chủ nhà sẽ trả lời trong vài tiếng, bằng tiếng Việt hoặc tiếng Anh. Thuê nguyên căn 15.000.000₫ một đêm."
            : "The host replies within a few hours, in Vietnamese or English. The villa is let whole at 15,000,000₫ a night."
        }
      />
      <div className="sv-r-split" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 380px", gap: "var(--space-11)", alignItems: "start" }}>
        <Card padded elevation="flat">
          <div className="sv-r-2" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: "var(--space-5)" }}>
            <Field label={L ? "Họ và tên" : "Full name"} required>
              <Input iconLeft="user" placeholder={L ? "Nguyễn Văn A" : "Jane Doe"} value={form.name} onChange={set("name")} />
            </Field>
            <Field label="Email" required>
              <Input iconLeft="mail" placeholder="ban@email.com" value={form.email} onChange={set("email")} />
            </Field>
            <Field label={L ? "Số điện thoại / Zalo / Viber" : "Phone / Zalo / Viber"}>
              <Input iconLeft="phone" placeholder="+84 …" value={form.phone} onChange={set("phone")} />
            </Field>
            <Field label={L ? "Số khách" : "Guests"}>
              <Select placeholder={L ? "Chọn" : "Select"} options={["2", "4", "6", "8", "10+"]} value={form.guests} onChange={set("guests")} />
            </Field>
            <div style={{ gridColumn: "1 / -1" }}>
              <Field label={L ? "Ngày dự kiến" : "Dates you have in mind"}>
                <Input iconLeft="calendar" placeholder="12 – 16 / 08 / 2026" value={form.dates} onChange={set("dates")} />
              </Field>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <Field label={L ? "Yêu cầu đặc biệt" : "Anything we should know"} hint={L ? "Đón sân bay, giường phụ, ăn kiêng…" : "Airport pickup, extra bed, dietary needs…"}>
                <Textarea rows={4} value={form.notes} onChange={set("notes")} />
              </Field>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, marginTop: "var(--space-7)" }}>
            <Checkbox
              label={L ? "Gửi cho tôi ưu đãi theo mùa" : "Send me seasonal offers"}
              checked={form.offers}
              onChange={() => setForm((f) => ({ ...f, offers: !f.offers }))}
            />
            <Button variant="primary" size="lg" iconRight="send" onClick={submit}>
              {L ? "Gửi yêu cầu" : "Send enquiry"}
            </Button>
          </div>
        </Card>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
          <Figure src={SV_ASSETS + "photo-exterior-entry.png"} shape="soft" ratio="4/3" alt="" />
          <Card padded>
            <Overline>{L ? "Địa chỉ" : "Where we are"}</Overline>
            <p style={{ fontSize: "var(--size-body-sm)", lineHeight: 1.7, color: "var(--text-secondary)", marginTop: 12 }}>43 Mỹ Khê 1, Sơn Trà, Đà Nẵng, Việt Nam</p>
            <div style={{ height: 1, background: "var(--border-subtle)", margin: "18px 0" }} />
            <AmenityList
              variant="compact"
              columns={1}
              items={[
                { icon: "footprints", name: L ? "3 phút đi bộ tới biển Mỹ Khê" : "3-minute walk to My Khe beach" },
                { icon: "plane", name: L ? "20 phút xe tới sân bay" : "20 minutes by car to the airport" },
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
