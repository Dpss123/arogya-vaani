"use client";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getLang, setLang as persistLang } from "@/lib/lang";
import { TRANSLATIONS } from "@/lib/translations";

// App-wide UI translation. Components wrap visible strings in t("..."). Source
// language is Hinglish (the strings as written). Translations are pre-generated
// and shipped statically (see lib/translations.ts) — no API call, zero cost,
// instant switching. Unknown strings fall back to the source text.

type LangCtx = {
  lang: string;
  t: (s: string) => string;
  changeLang: (code: string) => void;
};

const Ctx = createContext<LangCtx>({
  lang: "hinglish",
  t: (s) => s,
  changeLang: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState("hinglish");

  // Restore the saved language on mount (avoids SSR mismatch).
  useEffect(() => {
    const l = getLang();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (l && l !== "hinglish") setLangState(l);
  }, []);

  const t = useCallback(
    (s: string) => {
      if (!s || lang === "hinglish") return s;
      return TRANSLATIONS[lang]?.[s] ?? s;
    },
    [lang],
  );

  const changeLang = useCallback((code: string) => {
    persistLang(code);
    setLangState(code);
  }, []);

  return <Ctx.Provider value={{ lang, t, changeLang }}>{children}</Ctx.Provider>;
}

export function useT() {
  return useContext(Ctx);
}
