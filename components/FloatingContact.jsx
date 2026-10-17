"use client";
import { useLang } from "@/lib/lang-context";
import { SV_CONTACT, SV_BANK } from "@/lib/ds-data";

// 3 nút tròn nổi góc phải màn hình: gọi điện, Zalo, Telegram. Cùng một số điện
// thoại của chủ nhà (lấy từ content/site.json nên sửa số ở /admin là đổi theo).
const LABELS = {
  vi: { call: "Gọi điện", zalo: "Nhắn Zalo", telegram: "Nhắn Telegram" },
  en: { call: "Call us", zalo: "Message on Zalo", telegram: "Message on Telegram" },
  ko: { call: "전화하기", zalo: "Zalo 메시지", telegram: "Telegram 메시지" },
  zh: { call: "拨打电话", zalo: "Zalo 留言", telegram: "Telegram 留言" },
};

const digits = (s) => String(s || "").replace(/[^\d]/g, "");

function toInternational(s) {
  const d = digits(s);
  if (d.startsWith("84")) return d;
  if (d.startsWith("0")) return "84" + d.slice(1);
  return d;
}

const BTN = {
  width: 52,
  height: 52,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#fff",
  boxShadow: "0 4px 14px rgba(0,0,0,.28)",
  textDecoration: "none",
  border: "2px solid rgba(255,255,255,.9)",
};

export function FloatingContact() {
  const { lang } = useLang();
  const L = LABELS[lang] || LABELS.vi;
  const intl = toInternational(SV_CONTACT.phone);
  const tg = digits((SV_BANK && SV_BANK.telegram) || intl);

  return (
    <div
      style={{
        position: "fixed",
        right: 16,
        bottom: "calc(20px + env(safe-area-inset-bottom, 0px))",
        zIndex: 300,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <a href={"tel:+" + intl} aria-label={L.call} title={L.call} style={{ ...BTN, background: "#2e8b57" }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25c1.1.37 2.3.57 3.6.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.6 21 3 13.4 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.6a1 1 0 0 1-.25 1z" />
        </svg>
      </a>
      <a
        href={"https://zalo.me/" + intl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={L.zalo}
        title={L.zalo}
        style={{ ...BTN, background: "#0068ff", fontWeight: 800, fontSize: 14, letterSpacing: "-0.02em" }}
      >
        Zalo
      </a>
      <a
        href={"https://t.me/+" + tg}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={L.telegram}
        title={L.telegram}
        style={{ ...BTN, background: "#229ed9" }}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M21.9 4.3 18.7 19.5c-.24 1.07-.87 1.33-1.76.83l-4.86-3.58-2.35 2.26c-.26.26-.48.48-.98.48l.35-4.95 9-8.13c.39-.35-.09-.54-.6-.19L6.37 13.2 1.58 11.7c-1.04-.33-1.06-1.04.22-1.54l18.7-7.2c.87-.32 1.63.2 1.4 1.34z" />
        </svg>
      </a>
    </div>
  );
}
