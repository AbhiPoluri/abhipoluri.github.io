"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Avatar from "./Avatar";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useVoice } from "@/hooks/useVoice";
import { pickStarters } from "@/lib/conversationStarters";

const CHAT_API =
  process.env.NEXT_PUBLIC_ABHI_CLONE_API || "http://localhost:3000";

type Msg = { role: "user" | "assistant"; content: string };
type Status = "idle" | "listening" | "thinking" | "speaking";

/**
 * Self-contained interactive clone widget. Avatar + caption + starter pills
 * + input. Designed to fit inside any container; the consumer controls
 * outer width/height.
 */
export default function CloneWidget({
  accentColor = "#ff8c6b",
  avatarBg = "transparent",
}: {
  accentColor?: string;
  avatarBg?: string;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [, setDraft] = useState("");
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

  useEffect(() => {
    const seeds = pickStarters({ used: usedStartersRef.current });
    seeds.forEach((s) => usedStartersRef.current.add(s));
    setSuggestions(seeds);
  }, []);

  useEffect(() => {
    if (voice.speaking) {
      wasSpeakingRef.current = true;
      setStatus("speaking");
    } else if (wasSpeakingRef.current) {
      wasSpeakingRef.current = false;
      setStatus("idle");
    }
  }, [voice.speaking]);

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

  // Hold-space to talk (skip when typing)
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
    idle: stt.supported ? "hold space to talk" : "type below to chat",
    listening: "listening…",
    thinking: "thinking…",
    speaking: "speaking…",
  };

  const dotColor: Record<Status, string> = {
    idle: "rgba(255,255,255,0.35)",
    listening: "#ef4444",
    thinking: accentColor,
    speaking: "#4ade80",
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 14,
        width: "100%",
        height: "100%",
        minHeight: 0,
      }}
    >
      {/* Avatar area — flex-grow so it takes available vertical space */}
      <div
        style={{
          position: "relative",
          flex: 1,
          minHeight: 240,
          borderRadius: 16,
          overflow: "hidden",
          background: avatarBg,
          border: "1px solid var(--hero-border)",
        }}
      >
        <Avatar
          charSet=" .:-+*=%@#"
          color={accentColor}
          background={avatarBg === "transparent" ? "#00000000" : avatarBg}
          mouthLevel={voice.level}
          reactionTick={reactionTick}
        />

        {/* Status pill */}
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "5px 11px",
            background: "rgba(0,0,0,0.45)",
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
              background: dotColor[status],
              boxShadow: status !== "idle" ? `0 0 8px ${dotColor[status]}` : "none",
              animation: status !== "idle" ? "pulse-dot 1.5s ease-in-out infinite" : "none",
            }}
          />
          {statusLabel[status]}
        </div>

        {/* Caption overlay — bottom of avatar */}
        {captionShown && (
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              padding: "16px 18px",
              background:
                "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 60%, transparent 100%)",
              fontSize: 14,
              lineHeight: 1.5,
              color: "#fff",
              maxHeight: "45%",
              overflowY: "auto",
              pointerEvents: "none",
            }}
          >
            <span style={{ color: "#ffffff" }}>{captionShown.spoken}</span>
            {captionShown.pending && (
              <span style={{ color: "rgba(255,255,255,0.4)" }}>
                {captionShown.pending}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Starter pills */}
      {suggestions.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => {
                setSuggestions([]);
                void handleUserMessage(s);
              }}
              disabled={status === "thinking"}
              style={{
                padding: "5px 11px",
                fontSize: 11,
                fontWeight: 500,
                color: "var(--hero-muted)",
                background: "transparent",
                border: "1px solid var(--hero-border)",
                borderRadius: 999,
                cursor: status === "thinking" ? "not-allowed" : "pointer",
                transition: "all 0.15s ease",
                opacity: status === "thinking" ? 0.5 : 1,
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                if (status === "thinking") return;
                e.currentTarget.style.borderColor = accentColor;
                e.currentTarget.style.color = "var(--hero-text)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--hero-border)";
                e.currentTarget.style.color = "var(--hero-muted)";
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input row */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!typed.trim()) return;
          void handleUserMessage(typed.trim());
          setTyped("");
        }}
        style={{ display: "flex", gap: 6 }}
      >
        <input
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          placeholder="ask me anything…"
          style={{
            flex: 1,
            padding: "10px 14px",
            fontSize: 13,
            color: "var(--hero-text)",
            background: "rgba(128,128,128,0.06)",
            border: "1px solid var(--hero-border)",
            borderRadius: 8,
            outline: "none",
            fontFamily: "inherit",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = accentColor;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "var(--hero-border)";
          }}
        />
        <button
          type="submit"
          style={{
            padding: "10px 16px",
            fontSize: 13,
            fontWeight: 600,
            color: "#fff",
            background: accentColor,
            border: `1px solid ${accentColor}`,
            borderRadius: 8,
            cursor: "pointer",
            transition: "filter 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.filter = "brightness(0.92)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.filter = "none";
          }}
        >
          Send
        </button>
      </form>

      <style jsx>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
