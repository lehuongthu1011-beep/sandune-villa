"use client";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { SV_COPY } from "./ds-data";

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLangState] = useState("vi");

  useEffect(() => {
    const saved = window.localStorage.getItem("sv-lang");
    if (saved === "vi" || saved === "en") setLangState(saved);
  }, []);

  const setLang = useCallback((next) => {
    setLangState(next);
    try {
      window.localStorage.setItem("sv-lang", next);
    } catch {
      /* ignore */
    }
  }, []);

  const value = { lang, setLang, t: SV_COPY[lang] };
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used within LangProvider");
  return ctx;
}
