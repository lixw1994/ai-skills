# Cover: components/Cover/preview.html

Every system has a cover. It is a preview document just like a component preview—first-line marker (`<!-- @dsCard height=288 -->`; 240–360), same preview frame, preloads (tokens.css, fonts, bundle.css, bundle.js), limits, theme propagation. Overview places it above the manual, giving the system a face when opened. Keep the directory **clean**: adjacent README.md/Cover.d.ts or Cover in the bundle header makes it a regular component and removes the cover. Write **last**, based on completed material.

## Direction: color and pattern

Show what people remember a system by—color and shape—with its name foremost. Always three parts:

1. **Color blocks.** Make large solid fields, not chips: three to five blocks using identity colors at **full** values—brand/accent/signal hues, a deep ink/dark surface, a breathable tint—together one-quarter to one-half of the cover. Weight by identity, not UI frequency: recognizable brand colors get large fields even if rarely used in UI (neutral systems lead with their one/two hues); state-only error red stays small. Cut dimensions from scale: spacing levels/multiples, radii from tokens (square systems square; pills/circles rx = half short side—SVG 9999px makes an ellipse, not a pill). Use the brand's composition: flush modular grid, staggered stack, one tall slab/satellites, variable-width band, blocks bleeding top/right. Never equal squares in a row: that is a swatch table.
2. **One pattern**, over/between blocks, using block colors (or cut-out background), chosen from README principles/token usage:
   - Soft/friendly/rounded → circles, pills, semicircles from radius scale.
   - Precise/technical/monospace/4px grid → dot/plus grid with spacing-level step.
   - Editorial/serif/"borders, not shadows" → **a few** token hairlines at original strength or baseline grid through blocks—never all lines, never lines without blocks.
   - Loud/heavy/poster type → stripes, chevrons, checkerboard at spacing cadence.
   - Geometric/modular/dense UI → radius-token tiles, some merged two units wide like components.
   - Concrete motif (lens, wave, leaf, ticket, spark) → radius-built arcs/quarter-circles/silhouette.
   - Distinctive display/numeric face → huge glyph/digit as shape, clipped by blocks.

   Shapes, not pictures: no faces, mascots, icons, scenes. Choose the row best reflecting **this** brand and explain derivation; if generic systems would use the same row **and** arrangement, change arrangement. Geometry comes from scale (pitch/gaps/radii tokens); tiles/dots/pills 12–60 units, lines 3–6, never hundreds.
3. **Name** in display face (single-family system: body family at display weight), at most 120px, leading .9–.95 (two lines ≥.95), bottom-left on **background**, in ink; one 13–14px muted tagline below (README's or brand-voice sentence), both in ≤440px text block. No other words. Exact README words/case; wrap only at existing spaces/hyphens, never inside words, max two lines. Reserve its region: choose 120px down to 64px so longest line ≤440px (fallback up to one-fifth wider: sans estimate .6em/letter, serif .55, mono .62); line count × size + tagline + two spacing levels must fit height. Still too wide at 64px → top-band skeleton below. Otherwise blocks/pattern units stay right of x=480: nothing overlaps name/tagline, even hairlines.

Rules:
- **One inline SVG and two text elements on background**; every fill/stroke/rx bound to token class (`.brand{fill:var(--brand)}`, `.tile{rx:var(--radius-lg)}`; pills/circles half short side). No images or gradients/shadows absent from tokens.
- **Two themes, one file.** Render dark and **look**: blocks only a few percentage points from background vanish—bind another token, no outline.
- **One layout, 960 × height.** Overview lays out at 960px then scales proportionally on narrower pages: identical appearance at every width. No responsiveness: no container/media width queries, cqw/vw, narrow layout. Blocks/pattern in x=480→right-edge region. Only alternate skeleton: color/pattern band across full top (96–120px tall, about one-third height, one spacing level from name cap line), name below, size per step 3. Overwide names use largest ≤64px fitting 960 minus text-block horizontal padding. Use when brand favors horizontal bands, and always when the name is too wide for its region.
- **No motion.**
- **Squint:** name first, colors next, pattern last; halve pattern count if it steals attention. **Cover the name with your thumb:** colors/shapes alone should identify the brand; if interchangeable, colors or row are wrong.
- **Derivation first**—four lines retained as SVG-top comment: blocks (token × size), arrangement, pattern row/reason, spacing/radii used. Any blocks/pattern/scale line lacking a token → start over.

Avoid barcodes (thin verticals densifying toward an edge), swatch tables, confetti (>five colors/two patterns), posters (pattern louder than name), text on blocks. Regenerate when name/palette/display face/scale changes, not smaller edits. Users revise via requests in chat/comments ("quieter", "more green", "waves"): edit this file, retain derivation unless the request changes it, save as revision. It is not edited in the page.
