"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ScrollReveal from "./ScrollReveal";
import Avatar from "./talk/Avatar";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useVoice } from "@/hooks/useVoice";
import { pickStarters } from "@/lib/conversationStarters";

// In production this should point at the deployed abhi-clone instance
// (e.g. https://abhi-clone.vercel.app). In dev it falls back to the local
// abhi-clone server. Static-export friendly — no API routes live here.
const CHAT_API =
  process.env.NEXT_PUBLIC_ABHI_CLONE_API || "http://localhost:3000";

type Msg = { role: "user" | "assistant"; content: string };
type Status = "idle" | "listening" | "thinking" | "speaking";

export default function TalkToMe() {
  const [status, setStatus] = useState<Status>("idle");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const [reactionTick, setReactionTick] = useState(0);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [typed, setTyped] = useState("");
  const usedStartersRef = useRef<Set<string>>(new Set());
  const messagesRef = useRef<Msg[]>([]);
  messagesRef.current = messages;
  const wasSpeakingRef = useRef(false);

  const voice = useVoice();
  const stt = useSpeechRecognition({
    onFinal: (text) => void handleUserMessage(text),
  });

  // Seed starters on mount
  useEffect(() => {
    const seeds = pickStarters({ used: usedStartersRef.current });
    seeds.forEach((s) => usedStartersRef.current.add(s));
    setSuggestions(seeds);
  }, []);

  // Status flips from voice.speaking transitions
  useEffect(() => {
    if (voice.speaking) {
      wasSpeakingRef.current = true;
      setStatus("speaking");
    } else if (wasSpeakingRef.current) {
      wasSpeakingRef.current = false;
      setStatus("idle");
    }
  }, [voice.speaking]);

  // STT-driven status
  useEffect(() => {
    if (stt.listening) setStatus("listening");
    else if (status === "listening") setStatus("idle");
  }, [stt.listening, status]);

  const handleUserMessage = useCallback(
    async (userText: string) => {
      if (!userText.trim()) return;
      const next: Msg[] = [
        ...messagesRef.current,
        { role: "user", content: userText },
      ];
      setMessages(next);
      setStatus("thinking");
      setDraft("");
      setSuggestions([]);

      try {
        const res = await fetch(`${CHAT_API}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: next }),
        });
        if (!res.ok || !res.body) {
          const errText = await res.text().catch(() => "");
          const fallback =
            "the model errored — " + (errText.slice(0, 120) || "no body");
          setMessages((m) => [...m, { role: "assistant", content: fallback }]);
          voice.speak(fallback);
          return;
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let acc = "";
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          acc += decoder.decode(value, { stream: true });
          setDraft(acc);
        }
        const finalText = acc.trim();
        if (!finalText) {
          setStatus("idle");
          return;
        }
        setMessages((m) => [...m, { role: "assistant", content: finalText }]);
        setDraft("");
        setReactionTick((n) => n + 1);
        voice.speak(finalText);

        const fresh = pickStarters({
          used: usedStartersRef.current,
          lastUserMessage: userText,
        });
        fresh.forEach((s) => usedStartersRef.current.add(s));
        setSuggestions(fresh);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setMessages((m) => [
          ...m,
          { role: "assistant", content: `network error: ${msg}` },
        ]);
        setStatus("idle");
      }
    },
    [voice]
  );

  // Hold-space to talk (only when typed-input isn't focused)
  useEffect(() => {
    const isTyping = (el: EventTarget | null) => {
      if (!(el instanceof HTMLElement)) return false;
      return (
        el.tagName === "INPUT" ||
        el.tagName === "TEXTAREA" ||
        el.isContentEditable
      );
    };
    const onDown = (e: KeyboardEvent) => {
      if (e.code !== "Space" || e.repeat) return;
      if (isTyping(e.target)) return;
      e.preventDefault();
      if (voice.speaking) voice.stop();
      stt.start();
    };
    const onUp = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      if (isTyping(e.target)) return;
      e.preventDefault();
      stt.stop();
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, [stt, voice]);

  // Current-sentence caption walker (matches abhi-clone behavior)
  const currentSentence = useMemo(() => {
    if (!voice.speaking) return null;
    const full = voice.spokenText + voice.pendingText;
    const cursor = voice.spokenText.length;
    if (full.length === 0) return null;
    let start = 0;
    for (let i = Math.min(cursor, full.length) - 1; i >= 0; i--) {
      if (/[.!?\n]/.test(full[i])) {
        start = i + 1;
        break;
      }
    }
    let end = full.length;
    for (let i = cursor; i < full.length; i++) {
      if (/[.!?\n]/.test(full[i])) {
        end = i + 1;
        break;
      }
    }
    const sentenceCursor = Math.max(0, cursor - start);
    const sentenceText = full.slice(start, end);
    const lead = sentenceText.length - sentenceText.trimStart().length;
    const adj = Math.max(0, sentenceCursor - lead);
    const trimmed = sentenceText.trimStart();
    return { spoken: trimmed.slice(0, adj), pending: trimmed.slice(adj) };
  }, [voice.speaking, voice.spokenText, voice.pendingText]);

  const lastAssistant = [...messages]
    .reverse()
    .find((m) => m.role === "assistant");

  const captionShown =
    status === "thinking"
      ? null
      : voice.speaking && currentSentence
        ? currentSentence
        : !voice.speaking && lastAssistant
          ? { spoken: lastAssistant.content, pending: "" }
          : null;

  const statusLabel: Record<Status, string> = {
    idle: stt.supported ? "hold space or click to talk" : "type below — voice unsupported",
    listening: "listening…",
    thinking: "thinking…",
    speaking: "speaking…",
  };

  const statusDotColor: Record<Status, string> = {
    idle: "var(--faint)",
    listening: "#ef4444",
    thinking: "var(--accent-warm)",
    speaking: "var(--green)",
  };

  return (
    <section
      id="talk"
      style={{
        padding: "96px 0",
        borderBottom: "1px solid var(--border)",
        background: "var(--bg)",
      }}
    >
      <div
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          padding: "0 32px",
        }}
      >
        {/* Section header — matches About / Projects idiom */}
        <ScrollReveal direction="up">
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: ".1em",
              textTransform: "uppercase",
              color: "var(--muted)",
              marginBottom: 20,
            }}
          >
            Talk to me
          </p>
          <h2
            style={{
              fontSize: "clamp(36px, 5vw, 56px)",
              fontWeight: 800,
              letterSpacing: "-0.025em",
              lineHeight: 1.05,
              color: "var(--ink)",
              marginBottom: 28,
            }}
          >
            Or talk to my{" "}
            <em
              style={{
                fontStyle: "italic",
                fontWeight: 300,
                color: "var(--accent-warm)",
              }}
            >
              clone.
            </em>
          </h2>
          <p
            style={{
              fontSize: 15,
              color: "var(--muted)",
              lineHeight: 1.75,
              maxWidth: 640,
              marginBottom: 48,
            }}
          >
            A voice-driven AI clone of me — answers questions about my projects,
            opinions, and life, in roughly my voice. Hold space to talk, or click
            a starter below. It runs in your browser.
          </p>
        </ScrollReveal>

        <ScrollReveal direction="up">
          <div
            className="talk-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 380px) 1fr",
              gap: 32,
              alignItems: "stretch",
            }}
          >
            {/* Avatar card */}
            <div
              style={{
                aspectRatio: "1 / 1",
                background: "#06060d",
                border: "1px solid var(--border)",
                borderRadius: 16,
                overflow: "hidden",
                position: "relative",
              }}
            >
              <Avatar
                charSet=" .:-+*=%@#"
                color="#ff8c6b"
                background="#06060d"
                mouthLevel={voice.level}
                reactionTick={reactionTick}
              />
              {/* Status pill, top-right of avatar */}
              <div
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 12px",
                  background: "rgba(0,0,0,0.55)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 999,
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: ".08em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.85)",
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: statusDotColor[status],
                    boxShadow:
                      status !== "idle"
                        ? `0 0 8px ${statusDotColor[status]}`
                        : "none",
                  }}
                />
                {statusLabel[status]}
              </div>
            </div>

            {/* Chat column */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
                minHeight: 380,
              }}
            >
              {/* Caption / transcript area */}
              <div
                style={{
                  flex: 1,
                  minHeight: 200,
                  padding: "20px 24px",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  fontSize: 16,
                  lineHeight: 1.6,
                  color: "var(--ink)",
                  overflow: "auto",
                  position: "relative",
                }}
              >
                {!captionShown && status === "idle" && messages.length === 0 && (
                  <p
                    style={{
                      color: "var(--faint)",
                      fontStyle: "italic",
                      margin: 0,
                    }}
                  >
                    pick a starter or hit space to ask me anything…
                  </p>
                )}
                {status === "thinking" && (
                  <p style={{ color: "var(--muted)", margin: 0 }}>
                    thinking
                    <span className="thinking-dots">…</span>
                  </p>
                )}
                {captionShown && (
                  <p style={{ margin: 0 }}>
                    <span style={{ color: "var(--ink)" }}>
                      {captionShown.spoken}
                    </span>
                    {captionShown.pending && (
                      <span style={{ color: "var(--faint)" }}>
                        {captionShown.pending}
                      </span>
                    )}
                  </p>
                )}
              </div>

              {/* Starter pills */}
              {suggestions.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setSuggestions([]);
                        void handleUserMessage(s);
                      }}
                      disabled={status === "thinking"}
                      style={{
                        padding: "6px 14px",
                        fontSize: 12,
                        fontWeight: 500,
                        color: "var(--muted)",
                        background: "transparent",
                        border: "1px solid var(--border)",
                        borderRadius: 999,
                        cursor: status === "thinking" ? "not-allowed" : "pointer",
                        transition: "all 0.15s ease",
                        opacity: status === "thinking" ? 0.5 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (status === "thinking") return;
                        e.currentTarget.style.borderColor = "var(--accent-warm)";
                        e.currentTarget.style.color = "var(--ink)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "var(--border)";
                        e.currentTarget.style.color = "var(--muted)";
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {/* Input row: typed + push-to-talk */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!typed.trim()) return;
                  void handleUserMessage(typed.trim());
                  setTyped("");
                }}
                style={{ display: "flex", gap: 8 }}
              >
                <input
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  placeholder="type a message — or hold space to talk"
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    fontSize: 14,
                    color: "var(--ink)",
                    background: "var(--bg)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    outline: "none",
                    fontFamily: "inherit",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "var(--accent-warm)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "var(--border)";
                  }}
                />
                <PushButton
                  supported={stt.supported}
                  listening={stt.listening}
                  onStart={() => {
                    if (voice.speaking) voice.stop();
                    stt.start();
                  }}
                  onStop={() => stt.stop()}
                />
                <button
                  type="submit"
                  style={{
                    padding: "12px 20px",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "var(--accent-warm-text)",
                    background: "var(--accent-warm)",
                    border: "1px solid var(--accent-warm)",
                    borderRadius: 8,
                    cursor: "pointer",
                    transition: "background 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "var(--accent-warm-hover)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "var(--accent-warm)";
                  }}
                >
                  Send
                </button>
              </form>

              {/* Voice picker — small, secondary */}
              {voice.voices.length > 0 && (
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--muted)",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span>voice:</span>
                  <select
                    value={voice.voiceName ?? ""}
                    onChange={(e) => {
                      voice.setVoiceName(e.target.value);
                      voice.speak("hey, this is what i sound like now.");
                    }}
                    style={{
                      padding: "4px 8px",
                      fontSize: 11,
                      color: "var(--muted)",
                      background: "transparent",
                      border: "1px solid var(--border)",
                      borderRadius: 6,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    {voice.voices.map((v) => (
                      <option key={v.name} value={v.name}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </ScrollReveal>
      </div>

      <style jsx>{`
        @keyframes thinking-pulse {
          0%, 60%, 100% { opacity: 1; }
          30% { opacity: 0.3; }
        }
        :global(.thinking-dots) {
          animation: thinking-pulse 1.4s ease-in-out infinite;
        }
        @media (max-width: 768px) {
          :global(.talk-grid) {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}

function PushButton({
  supported,
  listening,
  onStart,
  onStop,
}: {
  supported: boolean;
  listening: boolean;
  onStart: () => void;
  onStop: () => void;
}) {
  if (!supported) return null;
  return (
    <button
      type="button"
      onMouseDown={onStart}
      onMouseUp={onStop}
      onMouseLeave={listening ? onStop : undefined}
      onTouchStart={(e) => {
        e.preventDefault();
        onStart();
      }}
      onTouchEnd={(e) => {
        e.preventDefault();
        onStop();
      }}
      title="Hold to talk"
      style={{
        padding: "12px 16px",
        fontSize: 14,
        fontWeight: 600,
        color: listening ? "#fff" : "var(--ink)",
        background: listening ? "#ef4444" : "transparent",
        border: `1px solid ${listening ? "#ef4444" : "var(--border)"}`,
        borderRadius: 8,
        cursor: "pointer",
        transition: "all 0.15s ease",
        userSelect: "none",
        minWidth: 90,
      }}
    >
      {listening ? "Recording…" : "🎤 Hold"}
    </button>
  );
}
