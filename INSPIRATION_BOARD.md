# Portfolio Inspiration Board
## Specific Examples of What Works (2025-2026)

---

## Tier 1: Interactive Game/Experience Portfolios

### Robby Leonardi's Portfolio (rleonardi.com)
**The Concept:** Side-scrolling platformer game
- Navigate a Mario-style character through his career
- Each level is a skill/project
- Pixel art + modern web tech
- ~10-15 minute experience

**Why it works:**
- Unforgettable experience
- Shows technical depth (game dev skills visible)
- Fun, not stuffy
- Visitors explore deeply

**Lessons for Abhi:**
- You don't need a literal game, but could have playful navigation
- Show personality through interaction, not just text
- Make visitors *do* something, not just read

**Vibe:** High-effort, high-reward. For Abhi: maybe too elaborate, but the philosophy is great.

---

### Bruno Simon's Portfolio (bruno-simon.com)
**The Concept:** 3D car navigation
- Controls a car to explore a 3D landscape
- Projects are buildings/locations in the world
- Built with Three.js/WebGL
- Sophisticated, polished

**Why it works:**
- Visually stunning
- Unique interaction model
- Showcases technical skill (3D graphics)
- Immersive experience

**Lessons for Abhi:**
- 3D isn't necessary, but the concept of "navigation as experience" is powerful
- Make the site feel like a place, not a list
- Use motion/interaction to guide understanding

**Vibe:** Very high-effort. For Abhi: Could inspire a lighter version (not full 3D, but playful navigation).

---

## Tier 2: Personality-First Portfolios

### Dylan Brouwer's Portfolio
**The Concept:** Mood selector + character interactions
- Choose light/dark/spring mode on entry
- Animated eye character that follows cursor
- Playful, cheeky personality
- Clean but fun design

**Why it works:**
- Immediate personality injection
- Cursor interaction without being excessive
- Theme selection is useful AND fun
- Charm without being childish

**Lessons for Abhi:**
- Small interactive touches = big personality impact
- Your existing theme toggle is good—could add playfulness
- Cursor effects can work if intentional

**Vibe:** Medium-effort, high-personality. Perfect inspiration for Abhi's vibe.

---

### Veronica Zubakova's Portfolio (veronicazubakova.com)
**The Concept:** Color personality + authentic design
- Bold color palette (vibrant, not minimal)
- Mix of design + illustration
- Personal photos and authentic voice
- UX/UI designer showing her taste

**Why it works:**
- Colors immediately convey personality
- Personal photos build connection
- Shows actual design taste (not just technical skill)
- Feels like meeting a person, not a company

**Lessons for Abhi:**
- Add vibrant accent color (you already have cool palette base)
- Personal photo or illustration matters
- Use color to communicate "who you are"

**Vibe:** Smart, confident, approachable. Good fit for Abhi's student + entrepreneur angle.

---

## Tier 3: Minimalist + Bold Typography

### Studio Feixen's Portfolio
**The Concept:** Experimental, playful, bright
- Oversized typography
- Bright colors, experimental layouts
- Invites exploration and play
- Doesn't take itself too seriously

**Why it works:**
- Memorable typography
- Breaks grid expectations
- Fun without being childish
- Matches the design philosophy

**Lessons for Abhi:**
- Make typography bigger and bolder
- Typography as design element, not just information
- Give yourself permission to be playful

**Vibe:** Creative-forward. For Abhi: Could influence section headers and type hierarchy.

---

## Tier 4: What NOT to Do (The "Vibe Codey" Examples)

### ❌ Generic Developer Portfolios
These are the ones everyone clones:

**"Dark + Neon" Portfolio**
- Charcoal background (#1a1a1a)
- Neon green/pink accents
- Geometric shapes
- Monospace font everywhere
- Animated grid/particles in background
- "Full Stack Developer" in huge font
- Tech stack listed prominently

**Why it fails:**
- Every third dev portfolio looks like this
- No personality—just trend chasing
- Boring to visit
- Screams "I learned web design from a tutorial"

---

**"Minimalist Corporate" Portfolio**
- Pure white background
- One serif font
- "Less is more"
- Sterile, untouchable feel
- No photos, no personality
- LinkedIn-style copy

**Why it fails:**
- Not memorable
- Too serious for a student/builder
- Boring to look at
- Doesn't show personality

---

**"Everything Animated" Portfolio**
- Particles everywhere
- Cursor trailing effect
- Every scroll triggers animation
- 50+ animations competing
- Parallax on EVERYTHING
- Actual content hard to find

**Why it fails:**
- Distracting from actual work
- Feels immature (shotgun approach)
- Slow/janky in real use
- Animations without purpose

---

## What Abhi's Site Does Right (Don't Break This)

✅ **Aurora blob animations** - Modern, unique, not overdone
✅ **Theme toggle** - Smart feature, well-implemented
✅ **Clean typography** - Plus Jakarta Sans is excellent
✅ **Cool color palette** - Sophisticated, not generic
✅ **Hero structure** - Clear value prop, good hierarchy

---

## Direction for Abhi's Portfolio

### What to Add (Maintain "Unique & Fun" Vibe)

1. **Vibrant accent color**
   - Warm orange or cyan
   - Makes site feel energetic
   - Not neon (too 80s), but definitely visible
   - Example: `#ff6b35` (sunset orange)

2. **Personal visual element**
   - Photo or illustration of YOU
   - Shows you're human, not a brand
   - Creates immediate connection

3. **Playful personality in copy**
   - More storytelling, less resume
   - Your voice, not corporate voice
   - Humor where it fits

4. **Intentional interactions**
   - Hover effects with purpose
   - Not just particle trails
   - Makes cards/projects feel responsive

5. **Bold typography choices**
   - Make headlines bigger/bolder
   - Mix weights for emphasis
   - Typography as design

---

## Easy Wins to Implement Now

### Add to Globals CSS (15 minutes)
```css
/* Add vibrant accent */
--accent-vibrant: #ff6b35;

/* Make aurora-blob animation smoother */
.aurora-blob {
  will-change: transform; /* Already there, keep it */
  filter: blur(90px);     /* Already there, good */
}

/* Add project card hover tilt */
@keyframes cardTilt {
  to {
    transform: rotateY(2deg) translateZ(10px);
  }
}
```

### Add to Hero.tsx (10 minutes)
```tsx
{/* Personal photo - add this above the headline */}
<div style={{
  width: 120,
  height: 120,
  borderRadius: '12px',
  border: '2px solid var(--border)',
  marginBottom: 20,
  overflow: 'hidden',
  background: 'var(--surface)',
}}>
  {/* Add a personal photo here */}
</div>
```

### Update Copy (5 minutes)
Change:
```
"Business student. Product builder."
```

To:
```
"Building at SFU. Shipping products. Learning in public."
```

**Total time: 30 minutes**
**Impact: Huge**

---

## Resources to Check Out

These are real sites worth visiting to see the patterns in action:

1. **[Muzli - Top 100 Creative Portfolios](https://muz.li/blog/top-100-most-creative-unique-portfolio-websites-of-2025/)** ← Start here
2. **[Awwwards Portfolio Category](https://www.awwwards.com/websites/portfolio/)** ← Award-winning examples
3. **[Personal Sites](https://personalsit.es/)** ← Curated by Andy Bell, very taste-driven
4. **[Really Good Designs](https://reallygooddesigns.com/best-portfolio-website-examples/)** ← Great commentary
5. **[Webflow Design Inspiration](https://webflow.com/blog/design-portfolio-examples)** ← How-to + examples

---

## Color Palette Decision Matrix

### Option 1: Sunset Energy 🔥
- Accent: `#ff6b35` (warm orange)
- Vibe: Energetic, entrepreneurial, warm
- Matches: "Side business founder" energy
- Reference: Veronica Zubakova (warm colors)

### Option 2: Cyber Cool 💙
- Accent: `#00d9ff` (cyan)
- Vibe: Tech-forward, modern, trendy
- Matches: "AI dashboards" energy
- Reference: Bruno Simon (3D, tech vibes)

### Option 3: Premium Gold 💎
- Accent: `#fbbf24` (amber/gold)
- Vibe: Elegant, sophisticated, mature
- Matches: "Strategic thinking" energy
- Reference: Luxury/premium aesthetic

**Recommendation:** Sunset orange `#ff6b35` — matches student+entrepreneur+builder vibe best.

---

## Final Thoughts

The difference between a "vibe codey" portfolio and a memorable one usually comes down to:

1. **Did someone make intentional design choices?** (vs. following a template)
2. **Does it show who the person is?** (vs. being generic)
3. **Is there personality in the details?** (vs. "correct" but boring)
4. **Did they spend time on the experience?** (vs. rushing through it)

Your site already has #1 (aurora animations are intentional). Adding #2 and #3 will put you in the top 10% of portfolios.

You don't need to build a 3D car explorer or a Mario game. You just need:
- Personality in your color/tone
- Personal visual element
- Playful interactions that make sense
- Copy that sounds like YOU

Let's do this. 🚀

