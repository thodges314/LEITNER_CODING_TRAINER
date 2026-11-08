import { useState, useEffect, useMemo } from 'react';
import { javascript } from '@codemirror/lang-javascript';
import type { Extension } from '@codemirror/state';
import type { CardInputLanguage } from '../lib/leitner';

type DslLanguage = 'sql' | 'html' | 'graphql';

const cachedDslExtensions: Partial<Record<DslLanguage, Extension>> = {};

function isDslLanguage(lang: CardInputLanguage): lang is DslLanguage {
  return lang === 'sql' || lang === 'html' || lang === 'graphql';
}

/**
 * Returns the CodeMirror 6 language extension for the given card input language.
 * JavaScript/TypeScript is loaded synchronously; SQL, HTML, and GraphQL grammars
 * are lazy-loaded on demand and cached in memory for subsequent cards.
 */
export function useCodeMirrorLanguage(
  inputLang: CardInputLanguage,
  isTypeScript: boolean
): Extension {
  const [loadedDsl, setLoadedDsl] = useState<{
    lang: DslLanguage;
    ext: Extension;
  } | null>(() => {
    if (isDslLanguage(inputLang) && cachedDslExtensions[inputLang]) {
      return { lang: inputLang, ext: cachedDslExtensions[inputLang]! };
    }
    return null;
  });

  useEffect(() => {
    if (!isDslLanguage(inputLang) || cachedDslExtensions[inputLang]) {
      return;
    }

    let cancelled = false;
    const loadGrammar = async () => {
      let ext: Extension;
      if (inputLang === 'html') {
        const { html } = await import('@codemirror/lang-html');
        ext = html();
      } else if (inputLang === 'sql') {
        const { sql } = await import('@codemirror/lang-sql');
        ext = sql();
      } else {
        const { graphql } = await import('cm6-graphql');
        ext = graphql();
      }
      cachedDslExtensions[inputLang] = ext;
      if (!cancelled) {
        setLoadedDsl({ lang: inputLang, ext });
      }
    };

    void loadGrammar();
    return () => {
      cancelled = true;
    };
  }, [inputLang]);

  return useMemo(() => {
    if (!isDslLanguage(inputLang)) {
      return javascript({ jsx: true, typescript: isTypeScript });
    }
    const cached = cachedDslExtensions[inputLang];
    if (cached) return cached;
    if (loadedDsl?.lang === inputLang) return loadedDsl.ext;
    return [];
  }, [inputLang, isTypeScript, loadedDsl]);
}
