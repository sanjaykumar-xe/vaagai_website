import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { translations, type Lang, type TKey } from '../data/translations'

const STORAGE_KEY = 'vaagai-lang'

interface LangCtx {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: TKey) => string
  pick: (o: { en: string; ta: string }) => string
}
const Ctx = createContext<LangCtx | null>(null)

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'en' || saved === 'ta') return saved
  } catch { /* storage unavailable */ }
  return 'en'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang)

  useEffect(() => {
    document.documentElement.lang = lang
    try { localStorage.setItem(STORAGE_KEY, lang) } catch { /* ignore */ }
  }, [lang])

  const t = useCallback((key: TKey) => translations[lang][key], [lang])
  const pick = useCallback((o: { en: string; ta: string }) => o[lang], [lang])
  const value = useMemo(() => ({ lang, setLang: setLangState, t, pick }), [lang, t, pick])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useLang() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useLang must be used inside LanguageProvider')
  return c
}
