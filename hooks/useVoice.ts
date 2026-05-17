"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Voice abstraction. Today: browser SpeechSynthesis with a synthetic mouth
// envelope so the avatar can animate, and `onboundary`-driven word-by-word
// caption sync.
// Swap point: when the real voice clone is wired in, replace `speak()` to
// fetch audio bytes and pipe them through a real Web Audio AnalyserNode
// (use that for `level`), and use timestamped words / forced alignment for
// `spokenText` / `pendingText`. The public shape stays the same.

type SpeakOptions = {
  rate?: number;
  pitch?: number;
};

const VOICE_PREF_KEY = "abhi-clone:preferred-voice";

// Quality score — higher = more natural-sounding. macOS Sequoia ships
// significantly better voices under names like "Siri", "Premium", "Enhanced".
// We score available voices and pick the best by default, but let the user
// override via the picker.
function scoreVoice(v: SpeechSynthesisVoice): number {
  const name = v.name;
  let s = 0;
  if (!v.lang?.toLowerCase().startsWith("en")) return -1; // English only
  // Top pick: the Chrome-bundled Google UK English Male — it's distinctive
  // and consistently natural across machines.
  if (/google uk english male/i.test(name)) s += 200;
  if (/google.*english.*male/i.test(name)) s += 120;
  if (/siri/i.test(name)) s += 100;
  if (/premium/i.test(name)) s += 80;
  if (/enhanced|neural|natural/i.test(name)) s += 60;
  // Apple's "modern" male voices — newer additions, generally cleaner
  if (/\b(reed|evan|tom|zoe|nathan|noah)\b/i.test(name)) s += 30;
  // Classic decent male voices
  if (/\b(daniel|alex|aaron|fred)\b/i.test(name)) s += 15;
  // Local voices preferred over remote (more reliable) — small bonus only
  if (v.localService) s += 3;
  if (v.lang === "en-US") s += 2;
  return s;
}

export function useVoice() {
  const [speaking, setSpeaking] = useState(false);
  const [level, setLevel] = useState(0);
  const [spokenText, setSpokenText] = useState("");
  const [pendingText, setPendingText] = useState("");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceName, setVoiceNameState] = useState<string | null>(null);

  const rafRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(0);
  const fullTextRef = useRef<string>("");
  const rateRef = useRef<number>(1);
  // Estimated chars-per-second progress cursor — used as the caption position
  // when SpeechSynthesis doesn't fire onboundary (Chrome remote voices like
  // Google UK English Male skip onboundary entirely).
  const captionCursorRef = useRef<number>(0);
  const boundaryFiredRef = useRef<boolean>(false);

  // Load voice list. Browsers populate this asynchronously, so we wait for
  // `voiceschanged` if needed.
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Pick a default voice once voices arrive (or restore the saved one).
  useEffect(() => {
    if (voiceName !== null || voices.length === 0) return;
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem(VOICE_PREF_KEY);
      if (saved && voices.some((v) => v.name === saved)) {
        setVoiceNameState(saved);
        return;
      }
    }
    const ranked = voices
      .map((v) => ({ v, score: scoreVoice(v) }))
      .filter((x) => x.score >= 0)
      .sort((a, b) => b.score - a.score);
    if (ranked.length > 0) setVoiceNameState(ranked[0].v.name);
  }, [voices, voiceName]);

  const setVoiceName = useCallback((name: string) => {
    setVoiceNameState(name);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(VOICE_PREF_KEY, name);
    }
  }, []);

  // Surface only English voices in the picker, sorted by quality score
  // descending so the best options are at the top.
  const availableVoices = voices
    .map((v) => ({ v, score: scoreVoice(v) }))
    .filter((x) => x.score >= 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.v);

  const tickEnvelope = useCallback(() => {
    const t = (performance.now() - startedAtRef.current) / 1000;

    // Mouth envelope (synthetic, until real audio analyser is wired)
    const syllable = 0.10 * Math.sin(t * 11.5);
    const emphasis = 0.07 * Math.sin(t * 2.1 + 0.7);
    const jitter = 0.05 * Math.sin(t * 28.0) * Math.sin(t * 6.7);
    const value = 0.30 + syllable + emphasis + jitter;
    setLevel(Math.max(0, Math.min(0.6, value)));

    // Caption progress fallback — drives the spoken/pending split based on
    // estimated speech rate. English speech averages ~15 chars/sec at rate=1.0.
    // Only used when onboundary hasn't fired this utterance (i.e. remote
    // voices). If onboundary fires later, that snaps the cursor and the
    // estimator just keeps coasting from wherever it was.
    if (!boundaryFiredRef.current) {
      const charsPerSec = 15 * rateRef.current;
      const estimatedCursor = Math.min(
        fullTextRef.current.length,
        Math.floor(t * charsPerSec)
      );
      if (estimatedCursor > captionCursorRef.current) {
        captionCursorRef.current = estimatedCursor;
        setSpokenText(fullTextRef.current.slice(0, estimatedCursor));
        setPendingText(fullTextRef.current.slice(estimatedCursor));
      }
    }

    rafRef.current = requestAnimationFrame(tickEnvelope);
  }, []);

  const stopEnvelope = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    setLevel(0);
  }, []);

  const speak = useCallback(
    (text: string, opts: SpeakOptions = {}) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
      const synth = window.speechSynthesis;
      synth.cancel();

      fullTextRef.current = text;
      captionCursorRef.current = 0;
      boundaryFiredRef.current = false;
      setSpokenText("");
      setPendingText(text);

      const u = new SpeechSynthesisUtterance(text);
      // Slightly faster + a touch lower pitch — feels closer to natural
      // 20-something male casual speech than the OS default.
      u.rate = opts.rate ?? 1.12;
      u.pitch = opts.pitch ?? 0.95;
      rateRef.current = u.rate;

      const chosen = voices.find((v) => v.name === voiceName);
      if (chosen) u.voice = chosen;

      u.onstart = () => {
        setSpeaking(true);
        startedAtRef.current = performance.now();
        rafRef.current = requestAnimationFrame(tickEnvelope);
      };
      u.onboundary = (e) => {
        if (e.name && e.name !== "word") return;
        // Mark that boundary events are firing → time estimator stops
        boundaryFiredRef.current = true;
        const end = e.charIndex + (e.charLength || 0);
        const t = fullTextRef.current;
        const cut = Math.min(end, t.length);
        captionCursorRef.current = cut;
        setSpokenText(t.slice(0, cut));
        setPendingText(t.slice(cut));
      };
      u.onend = () => {
        setSpeaking(false);
        setSpokenText(fullTextRef.current);
        setPendingText("");
        stopEnvelope();
      };
      u.onerror = () => {
        setSpeaking(false);
        stopEnvelope();
      };

      synth.speak(u);
    },
    [voices, voiceName, tickEnvelope, stopEnvelope]
  );

  const stop = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
    setPendingText("");
    stopEnvelope();
  }, [stopEnvelope]);

  useEffect(() => () => stopEnvelope(), [stopEnvelope]);

  return {
    speak,
    stop,
    speaking,
    level,
    spokenText,
    pendingText,
    voices: availableVoices,
    voiceName,
    setVoiceName,
  };
}
