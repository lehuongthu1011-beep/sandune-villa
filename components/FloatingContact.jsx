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

// Màu và kiểu lấy theo trang: xanh ô-liu đậm, viền cát mảnh, bóng nhẹ, chữ Montserrat.
const CSS = `
.sv-fab{position:relative;width:48px;height:48px;border-radius:50%;display:flex;align-items:center;justify-content:center;
  background:rgba(69,92,42,.58);-webkit-backdrop-filter:blur(10px) saturate(1.3);backdrop-filter:blur(10px) saturate(1.3);
  color:var(--sand-100);text-decoration:none;
  border:1px solid rgba(233,217,194,.65);box-shadow:0 8px 20px -6px rgba(35,47,22,.45);
  font-family:var(--font-label);font-weight:600;font-size:11px;letter-spacing:.08em;text-transform:uppercase;
  opacity:0;animation:sv-fab-in .6s cubic-bezier(.2,.8,.2,1) forwards,sv-fab-float 3.6s ease-in-out infinite;
  animation-delay:var(--d,0s),calc(var(--d,0s) + .6s);
  transition:background .2s ease,box-shadow .2s ease,border-color .2s ease}
.sv-fab::before{content:"";position:absolute;inset:-1px;border-radius:50%;border:1px solid rgba(188,204,164,.8);
  animation:sv-fab-ring 2.8s ease-out infinite;animation-delay:calc(var(--d,0s) + 1s);pointer-events:none}
.sv-fab:hover,.sv-fab:focus-visible{background:rgba(52,69,33,.82);border-color:var(--sand-300);
  box-shadow:0 12px 26px -8px rgba(35,47,22,.6);outline:none}
.sv-fab:focus-visible{box-shadow:0 0 0 3px rgba(188,204,164,.7)}
.sv-fab svg{display:block;transform-origin:50% 50%}
.sv-fab--call svg{animation:sv-fab-ring-phone 3.6s ease-in-out infinite;animation-delay:1.4s}
.sv-fab--tg svg{animation:sv-fab-plane 3.6s ease-in-out infinite;animation-delay:2.2s}
@keyframes sv-fab-in{from{opacity:0;transform:translateY(16px) scale(.8)}to{opacity:1;transform:none}}
@keyframes sv-fab-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
@keyframes sv-fab-ring{0%{transform:scale(1);opacity:.9}70%,100%{transform:scale(1.55);opacity:0}}
@keyframes sv-fab-ring-phone{0%,60%,100%{transform:rotate(0)}66%{transform:rotate(-14deg)}72%{transform:rotate(12deg)}78%{transform:rotate(-10deg)}84%{transform:rotate(8deg)}90%{transform:rotate(0)}}
@keyframes sv-fab-plane{0%,60%,100%{transform:translate(0,0)}75%{transform:translate(3px,-3px)}85%{transform:translate(0,0)}}
@media (prefers-reduced-motion:reduce){.sv-fab,.sv-fab::before,.sv-fab svg{animation:none!important;opacity:1}}
`;

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
        gap: 10,
      }}
    >
      <style>{CSS}</style>
      <a className="sv-fab sv-fab--call" style={{ "--d": "0s" }} href={"tel:+" + intl} aria-label={L.call} title={L.call}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 4h3.2l1.6 4-2 1.3a11 11 0 0 0 5.9 5.9l1.3-2 4 1.6V18a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z" />
        </svg>
      </a>
      <a className="sv-fab" style={{ "--d": ".15s" }} href={"https://zalo.me/" + intl} target="_blank" rel="noopener noreferrer" aria-label={L.zalo} title={L.zalo}>
        Zalo
      </a>
      <a className="sv-fab sv-fab--tg" style={{ "--d": ".3s" }} href={"https://t.me/+" + tg} target="_blank" rel="noopener noreferrer" aria-label={L.telegram} title={L.telegram}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 4 3 11l5.5 2L10 19l3-3.5 4.5 3.3z" />
          <path d="m8.5 13 8-6" />
        </svg>
      </a>
    </div>
  );
}
