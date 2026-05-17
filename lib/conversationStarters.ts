// Hand-curated questions a person might ask Abhi. Tagged by category so we
// can pick a varied mix per turn instead of three from the same bucket.
// Add to this list whenever you think of a question you wish people asked.

export type Starter = { text: string; tags: string[] };

export const STARTERS: Starter[] = [
  // ---- Projects (specific) ----
  { text: "what's boardroom in one line", tags: ["project"] },
  { text: "what's the hardest part of boardroom", tags: ["project", "deep"] },
  { text: "tell me about abhimem", tags: ["project"] },
  { text: "what's nexus planner", tags: ["project"] },
  { text: "what's claudeinone", tags: ["project"] },
  { text: "how did the deepseek distillation go", tags: ["project", "ml"] },
  { text: "what's pocketlog", tags: ["project"] },
  { text: "what's strivesync", tags: ["project"] },
  { text: "what's ollama router for", tags: ["project"] },
  { text: "which project are you most proud of", tags: ["project", "meta"] },
  { text: "what's the next project on your list", tags: ["project", "future"] },

  // ---- Tech / tools / opinions ----
  { text: "claude code or codex", tags: ["tools"] },
  { text: "favorite mcp server you've built", tags: ["tools", "deep"] },
  { text: "what's overrated in ai right now", tags: ["opinion"] },
  { text: "what's underrated in ai right now", tags: ["opinion"] },
  { text: "thoughts on local models", tags: ["opinion", "tools"] },
  { text: "next.js or something else", tags: ["tools"] },
  { text: "supabase or roll your own", tags: ["tools"] },
  { text: "what's your editor setup", tags: ["tools"] },

  // ---- Background / school ----
  { text: "why business and not cs", tags: ["background"] },
  { text: "what year are you in", tags: ["background"] },
  { text: "favorite class at beedie", tags: ["background"] },
  { text: "where did you grow up", tags: ["background"] },
  { text: "best thing about vancouver for builders", tags: ["background", "opinion"] },

  // ---- Taste ----
  { text: "favorite movie", tags: ["taste"] },
  { text: "why chazelle", tags: ["taste"] },
  { text: "batman or nolan trilogy, defend it", tags: ["taste"] },
  { text: "what're you watching right now", tags: ["taste"] },
  { text: "what're you listening to", tags: ["taste"] },
  { text: "kanye era you defend the most", tags: ["taste"] },
  { text: "what're you reading", tags: ["taste"] },
  { text: "hyperion any good", tags: ["taste"] },
  { text: "what games are you playing", tags: ["taste"] },
  { text: "elden ring or souls games", tags: ["taste"] },

  // ---- Life / habits ----
  { text: "what does your typical day look like", tags: ["life"] },
  { text: "what fuels you when you code", tags: ["life"] },
  { text: "how do you stay focused", tags: ["life"] },
  { text: "any side projects making money", tags: ["life", "career"] },

  // ---- Career / future ----
  { text: "what do you want to do after graduation", tags: ["career", "future"] },
  { text: "ai research or building products", tags: ["career", "opinion"] },
  { text: "open to internships right now", tags: ["career"] },
  { text: "would you start your own company", tags: ["career", "future"] },

  // ---- Meta ----
  { text: "are you really abhi", tags: ["meta"] },
  { text: "what's it like being a clone", tags: ["meta"] },
  { text: "what should i ask you", tags: ["meta"] },
];

// Lightweight similarity check — flag a starter if its tokens overlap heavily
// with the user's last message, so we don't suggest "favorite movie" right
// after they just asked about movies.
function topicalOverlap(a: string, b: string): boolean {
  const stop = new Set([
    "a", "an", "the", "is", "are", "was", "were", "be", "been", "do", "does",
    "did", "of", "in", "on", "at", "to", "for", "with", "and", "or", "but",
    "i", "you", "u", "ur", "your", "my", "me", "we", "us", "they", "them",
    "what", "whats", "how", "why", "when", "where", "which", "who", "tell",
    "about", "give", "any", "some", "this", "that", "it", "its",
  ]);
  const tokens = (s: string) =>
    new Set(
      s
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, " ")
        .split(/\s+/)
        .filter((t) => t.length > 2 && !stop.has(t))
    );
  const A = tokens(a);
  const B = tokens(b);
  if (A.size === 0 || B.size === 0) return false;
  let overlap = 0;
  for (const t of A) if (B.has(t)) overlap++;
  return overlap >= 2;
}

function shuffle<T>(arr: T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Pick `count` starters from the pool. Avoids ones already shown this
 * session, avoids ones that overlap topically with the last user message,
 * and prefers diversity across tag categories.
 */
export function pickStarters(opts: {
  used: Set<string>;
  lastUserMessage?: string | null;
  count?: number;
}): string[] {
  const { used, lastUserMessage, count = 3 } = opts;

  // First filter: not used, and not topically overlapping with last msg
  let pool = STARTERS.filter((s) => !used.has(s.text));
  if (lastUserMessage) {
    pool = pool.filter((s) => !topicalOverlap(s.text, lastUserMessage));
  }

  // If we've exhausted the pool somehow, reset and just avoid the last few
  if (pool.length < count) pool = STARTERS.slice();

  // Bucket by primary tag, then pick one from each distinct tag for variety
  const byTag = new Map<string, Starter[]>();
  for (const s of pool) {
    const tag = s.tags[0];
    if (!byTag.has(tag)) byTag.set(tag, []);
    byTag.get(tag)!.push(s);
  }

  const tagOrder = shuffle([...byTag.keys()]);
  const picked: string[] = [];

  for (const tag of tagOrder) {
    if (picked.length >= count) break;
    const bucket = byTag.get(tag)!;
    const choice = bucket[Math.floor(Math.random() * bucket.length)];
    picked.push(choice.text);
  }

  // If we somehow still need more (e.g. fewer tag buckets than count),
  // fill from the remaining pool
  if (picked.length < count) {
    const remaining = shuffle(pool.filter((s) => !picked.includes(s.text)));
    for (const s of remaining) {
      if (picked.length >= count) break;
      picked.push(s.text);
    }
  }

  return picked;
}
