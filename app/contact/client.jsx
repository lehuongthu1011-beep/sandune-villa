"use client";
import { useState } from "react";
import { ContactPageContent } from "@/components/sections/ContactPage";
import { ToastHost } from "@/components/SiteChrome";
import { useLang } from "@/lib/lang-context";

const SENT = { vi: "Đã gửi yêu cầu", en: "Enquiry sent", ko: "문의가 전송되었습니다", zh: "咨询已发送" };

export default function ContactClient() {
  const { lang } = useLang();
  const [toast, setToast] = useState(null);
  return (
    <>
      <ContactPageContent onSent={() => setToast(SENT[lang] || SENT.vi)} />
      <ToastHost toast={toast} onDismiss={() => setToast(null)} />
    </>
  );
}
