# Print design: posters, flyers, brochures, documents, anything exported as PDF

Print work uses Export PDF and has two forms. Decide **before** making the first artboard; if unspecified and someone can answer, ask plainly ("Design each page separately, or let text flow onto pages? What size?"). Nobody to ask: flowing documents, fixed pages for everything else, Letter/A4 paper.

- **Fixed pages** (`print` absent or `"fixed"`): each artboard is exactly **one** PDF page, sized by its frame. Posters, flyers, certificates, résumés, brochure faces, one-pagers: anything designed as a page layout, and any request specifying a page count.
- **Flowing** (`"print": "flow"` + `"paper": "letter"|"a4"`): **one** artboard of continuous content, paginated during export. Reports, memos, letters, papers, guides.

(`print`, `paper`, `w`, `h` are artboard fields in canvas.json; for a design created by this type, the same keys in its `boards` entry in `<canvas>/canvas.json`.)

## Paper and units (CSS px at 96 px/in)

- Fixed pages: the PDF page is the frame converted at this ratio; flowing: the paper dimensions.
- Letter 816×1056 · A4 794×1123 · landscape = swap dimensions (fixed pages only).
  North American audience: Letter; clearly metric audience: A4; uncertain → Letter.
- Fixed pages only: Legal 816×1344 · Tabloid 1056×1632 · A5 559×794 ·
  A3 1123×1587 · user-**specified** poster size = inches × 96 (18×24in → 1728×2304; each side ≤8000). No size → design at Letter/A4, never invent paper dimensions.
- 1in = 96px · 1pt = 4/3px (12pt = 16px, 9pt = 12px) · 0.75in = 72px ·
  1mm ≈3.78px. Write px, think in pt and inches. Never vh/vw or window percentages: those follow the editor's resizable viewport, not paper.

## Fixed pages

- Root fixed to frame `w`×`h` (`$preview` too); **fill** the page. Content beyond edges is clipped in PDF, never moved onto another page: budget height before writing.
- Pages are full bleed: backgrounds may reach the edges, content may not. Leave ≥40px inside every edge, 72px (0.75in) around continuous body text.
- Multi-page work is **a group** of artboards, one per page, in reading order (left→right, then next row), on one design page with nothing else. "All artboards (.pdf)" combines that page's artboards in this order into one file.
- Draw page numbers, running heads, and letterheads on each artboard. Double-sided flyer = 2 artboards. Trifold = 2 artboards with 3 columns each: outside = fold-in panel · back · **front** (rightmost); inside = a spread read left→right. Write in unfolding order (front makes a promise, inside delivers it in three beats, back gives practical details and contact information).

## Flowing documents

- `paper` `"letter"`: `w` 816; `"a4"`: 794; portrait only. Root `width` = `w`, **no** fixed height (print documents have fixed px width and content height; PAGE has no px width), and no internal scrolling container. Frame `h` = content height, capped at 8000 (longer content still exports completely; canvas shows only the first 8000px).
- You set margins: 72px (0.75in) root padding all around; this padding becomes printed margins. At each page break, export adds only ≈53px (5% of a page) below the cut and above the next page's content, filled with the `<body>`/`<html>` background: set paper color there, not on an inner box.
- The exporter chooses breaks, not CSS: it cuts **between** text lines, never through `<img>`/`<svg>` (use `<img>` for photographs, never `background-image`, which is cut). Nothing else stays intact: bordered boxes, tables, and cards may split between two of their lines. `break-before/inside`, `orphans`/`widows`, `@page`, and repeating `<thead>` have no effect here; you cannot force a page break. Keep each figure + caption far shorter than a page; captions may still move to the next page, and images taller than ≈950px are cut at page ends. If exact breaks or forced new pages matter, use a group of fixed pages.
- Continuous body text uses **one** column: CSS `columns` and side-by-side text columns run the document's entire height, then get sliced into pages; use only in blocks shorter than a page.
- No repeated per-page content (no headers, footers, or page numbers); no `position: fixed/sticky`; ≤100 pages per artboard.

## Typography, tables, ink

- Documents begin with their own `<h1>` (no separate masthead), then clear h2/h3 hierarchy. Body 16px (12pt), line height 1.5–1.65, measure 60–75 characters; captions/footnotes ≥12px (9pt), never smaller. Headings use `text-wrap: balance`, body `pretty`.
- Tables: one header row, rules ≥1px (finer hairlines disappear on paper), right-aligned numbers; figures/code blocks get a one-line caption.
- Ink: near-black body text on light paper; no large dark fields; gray text no lighter than #767676; strokes ≥1px; readable in grayscale.
- A flyer is read across a room in three seconds: **one** dominant line (≤6 words, 80px/60pt+), everything else clearly subordinate. The five Ws—what, when, where, price, one way to act (short URL or QR code, phone, optional perforated tear-off grid)—stay together rather than scattered through paragraphs. Prefer flat color and vectors over photos/gradients; cut copy until hierarchy is immediate.
