# Diagrams: flowcharts, organization charts, system relationships, swimlanes, sequences, timelines

**Build from separate elements, never one `<svg>`.** The editor selects/drags SVG as a whole, so nobody can move a box or edit text independently in a single-SVG flowchart. Earlier guidance to hand-draw an inline SVG in `<figure>` applies to ordinary pages, not designs. One SVG remains right for parts nobody moves/edits: icons, logos, illustrations, chart plot areas (editable labels/callouts are separate overlays). Row steps joined only by chevrons still use flex rows.

## Host container

Diagrams are the only flex/grid exception: arrows derive numeric coordinates from connected cards' px positions, which flex children lack. Put everything in **one** `position: relative` `<div>` with px width/height; every element uses inline `position: absolute; left; top` in px. If filling an artboard, the host **is** its root, title another positioned element (single click selects each card/arrow). Inset each element 64px from root edges: padding does not move positioned elements.

Every element is literal markup: cards made by `<sc-for>` or with {{hole}} left/top cannot drag individually (click selects all copies). File order determines drawing/click order; later overlapping boxes receive clicks: backgrounds first, all arrows, cards, labels last.

## Elements

- **Cards**: div with inline width/height and box-sizing: border-box (arrow formulas use outer size); internal label only text/inline tags (`<b>`, `<span>`, `<br>`), no child div: one click selects the card, dragging moves card/label together. Flex cards wrap tagged labels in **one** span, as example; otherwise parts sit side-by-side and lose spaces. Icon inside card before span, gap: 8px (text can select separately; drag via icon/padding). Size each card type once for longest wrapped label (at 16px, roughly 9px per character, capitals 11px, 24px per line, plus padding), even dimensions; enlarge artboard if it does not fit, never shrink text. Decision diamond: width/height about twice label, `clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%)`, fill, no border (clipping cuts it); tips are edge midpoints. Never a rotated square.
- **Arrows**: one small SVG per **straight** segment, copy every example attribute. Same as editor Arrow tool: individually selectable/draggable, endpoint handles. SVG spans tail to **tip**; path stops 2 stroke-width before tip, under head. Color/weight/dashes on SVG style (stroke, stroke-width, stroke-dasharray: 6 6); head inherits color/weight, never dashed (Safari draws head path: set fill attribute and its first style fill to arrow color). Properties may write stroke/stroke-width on arrow `<path>`: those take precedence, so change styling there. After weight changes, move each filled-head path endpoint to keep tip fixed. Each arrow has its own `<defs>`, unique marker id (dc-arrow-head-filled-1, -2… continue existing numbering), referenced by marker-end: hiding/deleting one never changes another's head. Users can set either end none/open/filled; preserve existing heads. Ordinary line = same SVG without defs/marker-end.
- **Elbow arrows**: series of straight segments, each starting exactly at preceding end; only final has head (multi-point/curved paths select as one box and distort when scaled).
- **One-to-many**: parent line to gap midpoint, crossbar from first child's center x to last's, arrows into children (organization charts: ordinary lines terminating **on** edges). Many-to-one mirrors it.
- **Arrow labels** ("yes", "retry"): separate small div, font-size: 13px; line-height: 16px, ≥8px from every line/card. Above line y: top y−28; below y+12; beside vertical x: left x+12, top segment midpoint−8. "yes"/"no" near originating decision. Label boxes receive clicks too: width just above text (~8px/character), text-align: center, left gap midpoint−half width.
- **Swimlanes/background bands**: empty div first, separate corner name clear of cards/lines. Lifelines/timeline tracks are ordinary lines.

## Coordinates

Before writing, place each card on a grid with left/top/width/height: row shares center y, column center x, gaps ≥48px (routed line ≥96; label gap = label width+16), integer px. Arrow leaves an edge midpoint, tip 1px before destination midpoint: right = (`left + width`, `top + height/2`), bottom = (`left + width/2`, `top + height`). Give each arrow its own edge; two sharing one edge (out/back between adjacent cards) use thirds/two-thirds, same y (or x) on both cards. Loops with no available gap/grid cell route outside: free edge → blank band 48px beyond cards → earlier card's free edge. Horizontal/vertical lines through gaps/empty cells, never through cards.

Each SVG equals segment length tail→tip, 8px thick, line centered. (x,y) = **left** endpoint (**top** vertically) regardless of direction; n = length; h = 2 stroke-width for headed segment (4 in example), otherwise 0:

- Horizontal: `left: x; top: y − 4`, `width="n" height="8"`, rightward path `M 0 4 L n−h 4`, leftward `M n 4 L h 4`.
- Vertical: `left: x − 4; top: y`, `width="8" height="n"`, downward `M 4 0 L 4 n−h`, upward `M 4 n L 4 h`.

Subtract 1px at tip, so left/up arrow box begins 1px from destination. width/height attributes, viewBox, style width/height always use identical dimensions.

**Arrows do not follow cards.** After moving/resizing a card, recalculate every connected arrow; manual edits require this too, so minimize bends.

## Example: artboard root, two cards, outward/return arrows at thirds of facing edges

First arrow: (264,160) → tip (423,160), 1px short of second card; path stops 4px before tip. Return points left from (424,184) → (265,184), box starts at tip x=265; label below, centered at gap midpoint x=344.

```html
<div style="position: relative; width: 688px; height: 276px">
<svg width="159" height="8" viewBox="0 0 159 8" preserveAspectRatio="none" style="position: absolute; left: 264px; top: 156px; width: 159px; height: 8px; overflow: visible; fill: none; stroke: #8a8378; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round"><defs><marker id="dc-arrow-head-filled-1" orient="auto" markerWidth="5" markerHeight="5" refX="2" refY="2" overflow="visible"><path d="M0 0 L4 2 L0 4 Z" fill="#8a8378" stroke="none" style="stroke: none; fill: #8a8378; fill: context-stroke"/></marker></defs><path d="M 0 4 L 155 4" marker-end="url(#dc-arrow-head-filled-1)"></path></svg>
<svg width="159" height="8" viewBox="0 0 159 8" preserveAspectRatio="none" style="position: absolute; left: 265px; top: 180px; width: 159px; height: 8px; overflow: visible; fill: none; stroke: #8a8378; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round"><defs><marker id="dc-arrow-head-filled-2" orient="auto" markerWidth="5" markerHeight="5" refX="2" refY="2" overflow="visible"><path d="M0 0 L4 2 L0 4 Z" fill="#8a8378" stroke="none" style="stroke: none; fill: #8a8378; fill: context-stroke"/></marker></defs><path d="M 159 4 L 4 4" marker-end="url(#dc-arrow-head-filled-2)"></path></svg>
<div style="position: absolute; left: 64px; top: 64px; font-size: 24px; font-weight: 600">Invoices</div>
<div style="position: absolute; left: 64px; top: 136px; width: 200px; height: 72px; box-sizing: border-box; padding: 8px; display: flex; align-items: center; justify-content: center; text-align: center; background: #ffffff; border: 1px solid #d6d2c4; border-radius: 10px">Draft the invoice</div>
<div style="position: absolute; left: 424px; top: 136px; width: 200px; height: 72px; box-sizing: border-box; padding: 8px; display: flex; align-items: center; justify-content: center; text-align: center; background: #ffffff; border: 1px solid #d6d2c4; border-radius: 10px"><span><b>Approve</b><br>Finance signs off</span></div>
<div style="position: absolute; left: 304px; top: 196px; width: 80px; text-align: center; font-size: 13px; line-height: 16px; color: #6b6a65">sent back</div>
</div>
```
