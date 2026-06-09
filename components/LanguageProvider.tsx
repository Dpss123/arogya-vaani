"use client";
import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { getLang, setLang as persistLang } from "@/lib/lang";

// App-wide live translation. Components wrap their visible strings in t("...").
// Source language is Hinglish (the strings as written). Pick any other language
// and every wrapped string is translated by Gemini once, then cached per-browser
// (localStorage) so later switches are instant.

type LangCtx = {
  lang: string;
  t: (s: string) => string;
  changeLang: (code: string) => void;
  translating: boolean;
};

const Ctx = createContext<LangCtx>({
  lang: "hinglish",
  t: (s) => s,
  changeLang: () => {},
  translating: false,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState("hinglish");
  const [dict, setDict] = useState<Record<string, string>>({});
  const [translating, setTranslating] = useState(false);

  const seenRef = useRef<Set<string>>(new Set());
  const langRef = useRef(lang);
  const dictRef = useRef(dict);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  langRef.current = lang;
  dictRef.current = dict;

  // Translate every seen-but-uncached string for the current language.
  const flush = useCallback(async () => {
    const curLang = langRef.current;
    if (curLang === "hinglish") return;
    const missing = [...seenRef.current].filter((s) => s && !(s in dictRef.current));
    if (missing.length === 0) return;
    setTranslating(true);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texts: missing, lang: curLang }),
      });
      const data = await res.json();
      if (data && Array.isArray(data.translations) && data.translations.length === missing.length && langRef.current === curLang) {
        const next = { ...dictRef.current };
        missing.forEach((s, i) => { next[s] = data.translations[i] || s; });
        setDict(next);
        try { localStorage.setItem(`av_i18n_${curLang}`, JSON.stringify(next)); } catch { /* ignore quota */ }
      }
    } catch { /* keep source text as a graceful fallback */ }
    finally { setTranslating(false); }
  }, []);

  const scheduleFlush = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => { void flush(); }, 220);
  }, [flush]);

  // Restore the saved language on mount.
  useEffect(() => {
    const l = getLang();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (l && l !== "hinglish") setLangState(l);
  }, []);

  // On language change: load that language's cache, then translate anything new.
  useEffect(() => {
    if (lang === "hinglish") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDict({});
      return;
    }
    let cached: Record<string, string> = {};
    try { cached = JSON.parse(localStorage.getItem(`av_i18n_${lang}`) || "{}"); } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDict(cached);
    scheduleFlush();
  }, [lang, scheduleFlush]);

  const t = useCallback((s: string) => {
    if (!s || lang === "hinglish") return s;
    if (!seenRef.current.has(s)) {
      seenRef.current.add(s);
      scheduleFlush();
    }
    return dict[s] ?? s;
  }, [lang, dict, scheduleFlush]);

  const changeLang = useCallback((code: string) => {
    persistLang(code);
    setLangState(code);
  }, []);

  return <Ctx.Provider value={{ lang, t, changeLang, translating }}>{children}</Ctx.Provider>;
}

export function useT() {
  return useContext(Ctx);
}
