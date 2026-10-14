# Anthropic brand color system

Source: the design team's anthropic-design Skill, `colors.css` (2025-12-11). Use these values in inline styles in .dc.html artboards.

## Primary colors (foundation: most surfaces use only these two)

| Name | Hex | Usage |
| --- | --- | --- |
| Ivory | `#FAF9F5` | Page/artboard background. Never pure #FFF for a whole page. |
| Slate | `#141413` | Text, dark surfaces. |

Content surfaces (cards, panels) use `#FFFFFF` over Ivory. Tinted hover/selected surfaces: `rgba(115,114,108,0.1)`. Borders derive from low-opacity Slate: default `0.5px solid rgba(31,30,29,0.15)`, stronger `rgba(31,30,29,0.3)`; never colored borders to organize structure.

## Claude colors

| Token | Hex | |
| --- | --- | --- |
| Claude primary (Clay, the Spark's color) | `#D97757` | Accent; the only emphasis color on Claude surfaces |
| Claude background (Ivory) | `#FAF9F5` | |
| Claude text (Slate) | `#141413` | |
| Claude accent (Oat) | `#E3DACC` | Pale fills, dividers |
| Main accent (Blue) | `#2A78D6` | Main accent for non-Claude actions |

## Secondary colors (multicolor: illustrations and composition, not UI chrome)

Strong: Fig `#C46686` · Sky `#6A9BCC` · Olive `#788C5D` · Clay `#D97757`
Soft: Coral `#EBCECE` · Heather `#CBCADB` · Cactus `#BCD1CA` · Oat `#E3DACC`

## Warm gray scale (21 steps, black → white)

`#000000` 1000 · `#141413` 950 (Slate) · `#1A1918` 900 · `#1F1E1D` 850 ·
`#262624` 800 · `#30302E` 750 · `#3D3D3A` 700 · `#4D4C48` 650 ·
`#5E5D59` 600 · `#73726C` 550 · `#87867F` 500 · `#9C9A92` 450 ·
`#B0AEA5` 400 · `#C2C0B6` 350 · `#D1CFC5` 300 · `#DEDCD1` 250 ·
`#E8E6DC` 200 · `#F0EEE6` 150 · `#F5F4ED` 100 · `#FAF9F5` 050 (Ivory) ·
`#FFFFFF` 000

These are **warm** grays: never replace them with a cool or neutral ramp.

## Tertiary scales (marketing/slides/data visualization, **not** product interfaces)

Orange, yellow, green, cyan, blue, purple, magenta, and red have nine-step scales; their 500 anchors: orange `#D97757`, yellow `#C9A82D`, green `#558A42`, cyan `#2E9191`, blue `#6A9BCC`, purple `#6B4D9E`, magenta `#A64D87`. Use only as accents in charts and illustrations; product-like UI stays within primary colors + grays.
