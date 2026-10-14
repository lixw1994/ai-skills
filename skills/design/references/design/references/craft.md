# Good design: complete version

SKILL.md contains short rules; here are their reasons and details. Read when the user challenges a design decision, or read the specific sections a piece needs: landing-page structure, wireframe rounds, phone prototypes (print: print.md). Cross-family content rules are at the end; the bundled brand kit is described in format.md.

## Good design (methods, not format)

The general content rules at the end (no filler, ask before adding material, change only the requested spot, reuse an existing design's visual language, AI slop clichés, protected-design rules) all apply fully to designs. What follows is specific to design.

### Decide aesthetics with the user, not for them

When the user provides no aesthetic, reference, or system, get their input before settling: ask, or draw 2–4 genuinely different, **visible** low-fidelity direction artboards, rather than choosing an aesthetic yourself (that is how slop happens). A specific subject, asset, or brand **is** input. If nobody can answer, choose a direction you can name and say it, rather than ending with a question. Once decided, the decision continues to count. Then establish a small system:

- A font pairing: Google Fonts can load in an artifact (a `fonts.googleapis.com/css2?family=…&display=swap` `<link>` in `<helmet>`; other webfont hosts cannot). Use 1–3 families, each with a system fallback of similar metrics (rendered while loading and where the font cannot be embedded; PNG/PDF export embeds linked Google Fonts).
- Foreground/background: one tone (warm, cool, neutral); subtly tint both white and black (white saturation below 0.02).
- Accents: 0–2, using oklch with matching chroma/lightness and different hue. Prefer brand/system colors; if too restrictive, derive coordinated oklch colors from them rather than inventing unrelated colors.

### Without brand or system constraints

When not constrained by an existing brand/system, use this guidance and choose a **bold** aesthetic direction before starting:

- **Purpose**: what problem does this solve? Who uses it?
- **Tone**: choose an extreme: refined minimalism, maximalist chaos, retro-futurism, organic/natural, luxury/refinement, playful/toylike, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel, industrial/utilitarian, and so on. Take inspiration, but create a piece faithful to its direction.
- **Differentiation**: what makes it **memorable**? What one thing will people remember?

Bold maximalism and refined minimalism both work; intention matters, not how hard you push. Execute precisely:

- **Typography**: choose beautiful, distinctive, interesting fonts. Avoid generic Arial/Inter; choose character. Pair a distinctive display face with a refined body face.
- **Color and theme**: commit to a unified aesthetic. A dominant color with sharp accents beats timid, evenly distributed color.
- **Motion**: when using animation (CSS in an artboard), concentrate on high-impact moments: one orchestrated reveal delights more than scattered microinteractions.
- **Spatial composition**: unexpected layouts, asymmetry, overlap, diagonal flow, grid-breaking elements, generous space **or** controlled density.
- **Backgrounds and detail**: build atmosphere/depth rather than defaulting to flat color: gradient meshes, noise, geometric patterns, layered transparency, dramatic shadows, decorative borders, grain overlays.

Vary light/dark themes, fonts, and aesthetics; **never** converge on the same choices across generations. Implementation complexity must match the concept: maximal designs need elaborate effects; minimal ones need restraint, precision, and careful spacing/subtleties.

### Anthropic brand work

Ivory #FAF9F5 background, Slate #141413 text, Clay #D97757 accent, serif display with sans body (exact stacks in brand color/typography pages). When Claude or Anthropic logos appear: Claude Spark once per surface, never rotated, distorted, or in a lockup; Claude logo dark on light, light on dark, with clearspace and original proportions; Claude and Anthropic marks appear sequentially, never combined.

### High-fidelity mockups are grounded in context

Good high-fidelity design starts from existing context: the user's codebase/repository, brand assets, product screenshots, attached system. Gather this before designing; ask for it if missing. Mocking an entire product from scratch is a **last resort** and yields poor design. Explain assumptions, context, and thinking early; show something as soon as the user can respond.

If an icon, asset, or component is missing, draw a placeholder: in high-fidelity work, placeholders beat getting the real thing wrong.

### Canvas variations and alternatives

Multi-artboard designs exist for exploring alternatives; use them deliberately:

- Settle unresolved direction (overall approach, hero layout, font pairing, palette, density) **before** a complete deliverable. Give 2–4 genuinely different candidates, each exploring a named dimension ("Warm editorial" versus "Dense data-first"); five shades of one aesthetic are not choices. Decision fidelity differs from delivery fidelity: rough artboards suffice to choose.
- In your reply (not artboards), explain each alternative's honest rationale and main tradeoff; advocating only your favorite rigs the vote.
- Keep names stable: an artboard called "Option B" or "Warm editorial" keeps that identity; never renumber/rename between rounds.
- With direction settled and reusable variations requested, provide at least 3 across dimensions: established patterns plus novel interactions, layouts, metaphors, visuals. Recombine brand visual DNA (scale, fill, texture, rhythm, layering, type treatment). Aim for atomic variations the user can mix, not one perfect option.
- Early wireframes prioritize breadth: 3–5 approaches per idea, simple shapes, placeholder text, minimal color; rough, low fidelity, structure and flow.

### Layouts that survive direct manipulation

Strongly prefer flex/grid with `gap` over inline flow. Sibling UI groups (buttons, chips, icons, cards, navigation, toolbars) use `display: flex`/`grid` + `gap:`, not source whitespace or per-element margins: gaps survive direct editing (drag reorder, delete, duplicate, editor drag-out/wrap-in-flex); whitespace text nodes do not. Inline flow is for prose with occasional `<a>`/`<strong>`/`<em>`, not arranging UI. Modern CSS helps: `text-wrap: pretty`, grid, and other advanced effects.

### Appropriate scale

Generated **mockup** content (buttons/list rows inside phone artboards, not the appifact editor's chrome, which has its own rules) never has hit targets below 44px. Print body text is at least 12pt; all typography fits its real viewing distance.

### Accessible as drawn

Even static mockups use real `<button>`, `<a href>`, `<input>` with `<label>`. Div/span with `role` or `onClick` may look identical but Tab skips them and readers lack accessible content. Icon-only buttons need `aria-label`. Text/background contrast ≥4.5:1 (24px+ ≥3:1). Gray explanatory text and colored fills under white text most often fail: darken both. Distinguishable colors differ in lightness, not hue alone; blue/orange over red/green.

### Landing pages and marketing artboards

Use marketing-page structure: a hero saying what is offered in one sentence, one clear call to action; credible proof (reviews, customer logos, numbers from user materials or conspicuous placeholders); benefits addressing real doubts rather than feature lists. One primary action per page, repeated down it, not three competing buttons.

For landing pages, copy is the product. Write specific copy grounded in the user's product, customers, and voice. Never lorem ipsum, "Welcome to our website", or interchangeable marketing language. Missing facts (price/date/address) get conspicuous [YOUR PRICE]-style placeholders for the user, never inventions.

A landing page is **PAGE**, not a fixed poster: canvas.json `"expand": "fill"`, fluid root (no px width; padded `max-width` container, %/rem/fr, grid becomes one column on phones), so full-window view follows window width (canvas uses `w`). Height: on canvas, `100vh` is frame `h`, so use `vh` only for a full-screen root (dashboard/web app shell); sections with following content (hero) use px/rem `min-height`, never `vh`; never root `%` height: with `$preview`, the parent has no set height, so `height: 100%` collapses to content. Frame `w`/`h` (`$preview` too) are canvas dimensions only: `h` must equal page height at width `w` or clipping occurs (too tall beats clipped). Inline `repeat(N, minmax(0, 1fr))` stays N columns at every width; use `repeat(auto-fit, minmax(min(<min>px, 100%), 1fr))`, with `<min>` no larger than one column at `w` including gaps. `min()` lets phone columns shrink below `<min>` rather than overflow. Same for dashboards, web apps, and scrolling explainers. Fixed roots only for fixed formats: device mockups, posters, print (including memos/reports: print.md), social graphics. Design for phone width while writing: good title breaks, unsquashed grids, readable text.

### Print methods

Posters, flyers, brochures, memos, reports, anything delivered as PDF: read nearby `print.md` before the first artboard.

### Phone prototypes

No fake chrome: **do not** draw fake iOS status bars ("9:41 · battery · Wi-Fi") or virtual keyboards. On a real phone, real bars/keyboards render over the layout; drawn copies duplicate them and look immature. Leave that space alone. Same inside desktop device-frame artboards: no fake bar inside the phone rectangle.

### Reproducing existing interfaces

If source is obtainable (checkout, pasted files, attached system), use real source, not training-memory recollections: inventory, read components/styles, copy actually loaded assets (icons, fonts, images, stylesheets, not merely bundler component source). Copy exact padding, radii, sizes, line heights, never rounding or snapping to 4/8px grids/framework defaults. Claude reproduces/edits from code and design context better than screenshots; with source, screenshots are high-level reference only. No source access: stop and say so rather than inventing from memory. (Whether reproduction is appropriate follows shared protected-design rules.)

## Content and design rules shared by all appifact families

<!-- The block between the shared:* markers below is generated from
skills/_shared/content-design.md by scripts/inline-shared.ts — edit the
fragment and re-run it; hand edits here fail scripts/shared-inline.test.ts. -->

<!-- shared:content-design -->
These rules address **content** inside appifacts (slides, artboards, dashboards, preset cards/rows), not chrome (kit, toolbars, document mechanisms). They apply to every family (which adds its own methods), and none changes kit rules.

- **No filler content.** Never fill space with placeholder prose, fake sections, or informational material. Every element earns its place. Empty-looking sections need layout/composition, not invented content. Behind every "yes" are a thousand "no"s. Avoid data slop: useless numbers, icons, statistics. Less is more; favor minimalism.
- **Ask before adding material.** If extra sections, pages, copy, or content would improve a design, ask rather than adding them yourself. The user knows their audience and goals better.
- **Change only the requested spot.** A small targeted request (text/color/element) changes **only** that; leave every other layout, spacing, margin, font, size, position, color, and content untouched. Do not redesign/"improve" unrequested areas. Redesign/new direction/from-scratch requests are different: make the requested big change. If broader changes would help a small request, first finish it, then **suggest** the rest instead of doing them unasked.
- **Reuse existing visual language.** Before adding content to an interface/document, understand and match copy style, palette, tone, hover/click states, motion, shadows + cards + layouts, density, and so on.
- **Avoid AI slop clichés:** including overused gradient backgrounds, emoji (unless explicitly part of the brand), rounded containers with left accent borders, and overused families (Inter, Roboto, Arial, Fraunces). Emoji in content only when used by the brand/system. (Appifact chrome is stricter: never emoji as UI glyphs, unconditionally.)
- **Reproduce from source, not memory/screenshots.** With source (repository, pasted files, attached system), read real code rather than training recollections: components/styles, real assets, exact padding/radii/sizes/line heights, never rounded or snapped to 4/8px grids/defaults. Claude reproduces from code/context better than screenshots; source makes screenshots high-level reference only.
- **Do not reproduce protected designs.** Refuse requests for a company's distinctive UI patterns, proprietary command structures, or branded visuals unless the user's email domain shows they work there. Understand their goal and help create original designs respecting intellectual property instead. (If the current host provides no email-domain signal, rely on the user's stated employer; ask if unclear.)
<!-- /shared:content-design -->
