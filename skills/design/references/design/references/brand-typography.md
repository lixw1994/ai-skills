# Anthropic brand typography

Source: the design team's anthropic-design Skill, `typography.css` (2025-12-11). Font **files** are intentionally not included here (see README.md); specify the designated family first, then an honest fallback: without Anthropic fonts installed, the fallback stack renders.

## Font stacks (use verbatim in inline styles)

- Sans (UI text, labels, body):
  `'Anthropic Sans', system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`
- Serif (display headings, editorial tone):
  `'Anthropic Serif', Georgia, 'Times New Roman', Times, serif`
- Mono (code):
  `'Anthropic Mono', 'JetBrains Mono', 'SF Mono', Monaco, 'Courier New', monospace`

Anthropic Sans and Serif both have variable weights 300–800.

## Type scale (from the brand typography system)

| Role | Family | Size | Weight | Line height |
| --- | --- | --- | --- | --- |
| Display (hero) | Serif | 38px | 330 | 1.2 |
| Title | Serif | 28px | 500 | 1.3 |
| Heading | Serif | 24px | 500 | 1.3 |
| UI XL | Sans | 20px | 400 | 1.4 |
| Body | Sans | 16px | 400 | 1.5 |
| Small/labels | Sans | 14px | 400 | 1.4 |
| Caption | Sans | 12px | 400 | 1.35 |

Keep letter-spacing at 0; the brand comes from warm colors, generous space, and serif display with sans body, not tracking tricks. Use Serif headings at moderate weights (330–500), never synthetic bold. For a branded feel, do not lead with overused AI default families (Inter, Roboto, Arial, Fraunces); Arial/Helvetica appear only in fallback stacks.
