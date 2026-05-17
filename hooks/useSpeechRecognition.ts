"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getSpeechRecognitionCtor,
  type SpeechRecognitionLike,
} from "@/lib/speech";

type Options = {
  onFinal?: (text: string) => void;
  lang?: string;
};

export function useSpeechRecognition({ onFinal, lang = "en-US" }: Options = {}) {
  const [supported, setSupported] = useState<boolean>(false);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const onFinalRef = useRef(onFinal);
  onFinalRef.current = onFinal;

  useEffect(() => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      setSupported(false);
      return;
    }
    setSupported(true);

    const rec = new Ctor();
    rec.lang = lang;
    rec.continuous = false;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onresult = (e) => {
      let finalText = "";
      let interimText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        const t = r[0].transcript;
        if (r.isFinal) finalText += t;
        else interimText += t;
      }
      if (interimText) setInterim(interimText);
      if (finalText) {
        setInterim("");
        onFinalRef.current?.(finalText.trim());
      }
    };
    rec.onerror = (e) => {
      setError(e.error ?? "unknown");
      setListening(false);
    };
    rec.onend = () => {
      setListening(false);
      setInterim("");
    };

    recRef.current = rec;
    return () => {
      try {
        rec.abort();
      } catch {
        /* ignore */
      }
      recRef.current = null;
    };
  }, [lang]);

  const start = useCallback(() => {
    const rec = recRef.current;
    if (!rec) return;
    setError(null);
    try {
      rec.start();
      setListening(true);
    } catch {
      // already started — ignore
    }
  }, []);

  const stop = useCallback(() => {
    const rec = recRef.current;
    if (!rec) return;
    try {
      rec.stop();
    } catch {
      /* ignore */
    }
  }, []);

  return { supported, listening, interim, error, start, stop };
}
