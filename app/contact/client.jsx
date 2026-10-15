"use client";
import { useState } from "react";
import { ContactPageContent } from "@/components/sections/ContactPage";
import { ToastHost } from "@/components/SiteChrome";
import { useLang } from "@/lib/lang-context";

export default function ContactClient() {
  const { lang } = useLang();
  const [toast, setToast] = useState(null);
  return (
    <>
      <ContactPageContent onSent={() => setToast(lang === "vi" ? "Đã gửi yêu cầu" : "Enquiry sent")} />
      <ToastHost toast={toast} onDismiss={() => setToast(null)} />
    </>
  );
}
