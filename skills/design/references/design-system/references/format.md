# System contents: every file/field and how to read them

No automatic editor builder is included. Wherever the guide describes make.ts or page-generated checks, warnings, errors, copies, or output, apply the host adaptation: use the actual project's builder or the packaged static helper, and enforce the rule yourself.

## Shape: a file table

Systems made with this type are **stored as files**: each path below is <system>/<path>, never a data: URI. Images/SVG/video/PDF under assets/ are files or index-named uploads ("Layering"). A single-file page's appifact-doc state holds `{title, content, comments}`; content = **`{ "v": 2, "files": { "<path>": "<text | data: URI | blob:<id>>" } }`**, the directory supplied to make.ts. Text (md/mdx,json,js,css,html,svg,ts/tsx,txt,csv,yml…) stays text; others data:<mime>;base64,… or **pointer** below. Relative /-separated paths, spaces/mixed case allowed (components/<Comp> must be ASCII JS identifier), no ../initial /. Reject dot segments (.git,.env…; .image-slots.state.json reserved), node_modules, toolchain/agent manifests at any depth (package.json,lockfiles,bunfig.toml,tsconfig.json,deno.json,CLAUDE.md,AGENTS.md), 8.3 names (NAME~1), **TABLE** paths index.html/design-system.json/SKILL.md/artifact-type/…, recognizing aliases too. --components-src fenced: imports only relative own files and react/react-dom, no macros/import attributes; unpacked source data, never executed. ≤1200 files.

| Path | What it is | Notes |
| --- | --- | --- |
| README.md | Brand manual | Markdown headings/lists/quotes/fences/pipe tables/data: images, ≤200 KB. Every **other** *.md/*.mdx outside components/archived/ adds a **chapter**, path order, title first # or filename; ≤24 (extras retained with note). |
| tokens.json | Tokens **themselves** | Syntax below, ≤512 KB. |
| manifest.json | **Generated** entry + islands | Shape below; regenerated each build/edit. |
| components/lib/*.js | **Packed** runtime libraries | make.ts copies react/react-dom18.3.1, manifest libraries[].file. libraries lists all, including React: listed react/react-dom18 not here load jsDelivr (or copy both from artifact-type/demo.json); every other library must be here, listed {"name","version","global","file"}, else static. Classic scripts in order before bundle.js; each ≤2 MB. |
| components/bundle.js | **One** classic script | Assigns `window.<namespace> = {…}`, reads window.React/ReactDOM, no import/network, no literal </script / <!-- (consumer inlines; make.ts warns). Optional first `/* @ds-bundle: {"format":4,"namespace":"…","components":[{"name":"…"}]} */`: namespace/order (absent ⇒ --namespace). ≤6 MB. |
| components/bundle.css | Optional stylesheet | After tokens.css (craft.md "one source per value"), ≤2 MB. |
| components/index.d.ts, components/<Comp>/<Comp>.d.ts | Types | Documentation, not type-checked: props from index.d.ts (<Comp>Props), used by `api/` cards; individual file preferred only in page props panel (default off); individual types only components/<Comp>/<Comp>.d.ts. Total ≤1.5 MB. |
| components/<Comp>/preview.html | Live preview | Below, ≤256 KB. |
| components/Cover/preview.html | **Cover** | Preview like others, above manual in Overview; nearby cover.md brief. |
| components/<Comp>/README.md | Usage guidance | Markdown Description cell (initial # <Comp> not repeated; first sentence manifest summary). Only exact path or aliases below, not mdx/nested; ≤64 KB. |
| components/src/** | Source | Built via --components-src; packed unless --exclude-source; each ≤512 KB. |
| fonts/<file> | Font binaries, **not** assets | woff2/woff/ttf/otf, inspected by initial bytes; file storage: file, else storage if available, else page (each ≤1 MB). Listed type.fonts[].file (unlisted retained/flagged, no @font-face in tokens.css). |
| assets/<Group>/<file> (deeper allowed) | Anything | First folder group (direct assets/ ⇒ Other); image/SVG/video previews, font specimens, others downloadable. Unchanged (each ≤12 MB), files or uploads (images/SVG/video/PDF only). Images only <img> (no scripts/currentColor: single-ink marks name ink in group README). |
| archived/<old path> | Only cleanup files moved aside (craft.md), never overwrite an existing file | Files view only. |
| Any other file | Retained, no UI | make.ts note; each ≤512 KB; .image-slots.state.json ≤12 MB. |
| (No files) | **Empty** system | Whole page drop target: fonts→fonts/, folder→own group, others loose assets/. |

Limits measured **after storage** (JSON strings, < encoded as `\u003c`, base64 ≈4/3): table ≤14 MB (page refuses >16 MB). File-based storage has no page limits here. This Skill limits a version to 1,024 files (system's 1,008), 256 MiB, file15 MiB, call16 MiB; upload≤20 MB (SVG2 MB).

**Views.** Assets only assets/ paths. Components (identifiers): bundle.js header names, then each components/<Comp>/ with preview.html/README.md. Typography: type.groups then fonts/. Colors/Spacing: tokens.json.

## Layering: what lives outside the page

File-based systems serve index-named uploads at /_blob/<id> to authenticated viewers. Single-file page binary values are data: or **blob:<id>** pointers; manifest **storage** records what **this version** uses. Records/asset operations/rebuild/delete: reference/store.md.

**Aliases** (make.ts maps; file-based systems require **exact** paths: move files): readme.md; _ds_bundle.js/bundle.js (root/components/)→components/bundle.js; _ds_bundle.css/styles.css→components/bundle.css; components.d.ts/index.d.ts→components/index.d.ts; _ds_manifest.json ignored; components/<Comp>.html, <Comp>/index.html→<Comp>/preview.html; components/<Comp>.prompt.md, <Comp>/usage.md→<Comp>/README.md; design-sync two-level components/<group>/<Comp>/<Comp>.html|.prompt.md|.d.ts→components/<Comp>/…, group into marker. make.ts inlines these cards' _preview/<Comp>.js, removes frame-provided tags, discards runtime leftovers (_vendor/,_preview/,stub), notes it. Two files normalizing to one path = error.

## tokens.json syntax (why values are discarded)

- **Shape**: type = `{"fonts":[…],"families":{"<key>":"<stack>"},"groups":[{"name","family","styles":[{"name","fontSize",…}]}]}`: Typography reads size/weight/line height only from styles. Other families **lists** `{"tokens":[{"name","value","usage"}…]}` (color also themes, tokens **one** flat list; separators from stems: bg-000/bg-100→bg). Name/value **maps** (DTCG/W3C) valid JSON but unreadable: empty family, entries disappear on first token edit (shadow/other families retained, never displayed). Make lists first.
- Names (tokens/type styles): `^[A-Za-z0-9][A-Za-z0-9_.-]{0,63}$`, case **preserved** (theme ids/family keys same rule, lowercase). Non-type families share **one** --name namespace (duplicates discarded), type styles own; leading --/. stripped; dots CSS-escaped (`--space-1\.5`).
- Colors: #rgb|#rgba|#rrggbb|#rrggbbaa lowercased, or numeric-argument rgb()/rgba()/hsl()/hsla()/oklch()/oklab()/lab()/lch()/color(), no var()/url()/color-mix()/names; **alias** "{other-color-token}"→var(--other-color-token), theme-specific allowed. Nonexistent/self/cycle/>16-level chain discarded. Plain string = first theme. No valid theme ⇒ discard; later-only valid values lent to first.
- Lengths (fontSize,letterSpacing,spacing,radius): 12px|0.75rem|1em|50%|0 or number(px). lineHeight length or unitless <10. fontWeight1–1000 or "300 800"; normal/bold→400/700. fontStyle normal|italic. opticalSize number→'opsz' N. Styles may own family (else group), sample, usage; invalid fontSize discards style.
- type.families values: CSS font-family stacks ≤200 chars, no `; { } < > \ ( )` (no functions), balanced quotes. type.fonts[] family bare unquoted, file path (bare→fonts/<file>), weight descriptor ("400"/"300 800"), style normal|italic|oblique.
- **Optional** families (absent = no chapter), all `{note?, tokens:[{name, value, usage?}]}`: shadow box-shadow (lengths,hex/functional colors,inset,none; no var()/url(); ≤400), or per-theme like colors; **any** other top-level `{tokens:[…]}` key (opacity,zIndex…,≤12) pure CSS values (`[A-Za-z0-9 #%(),./+_-]`≤200, balanced parentheses, no url()/var(), individual not composite), separate **chapter** after Shadows, key-derived heading ("Z index"). Other keys retained with note (name retained silently). No motion family.
- Limits: ≤8 themes, ≤600 colors, ≤4096 fonts, ≤12 families, ≤12 type groups/≤80 styles, other family≤60 tokens; note≤400 chars, usage≤1000, sample≤200 (long truncated).
- Compiled tokens.css: `:root, [data-theme="<first>"] { --<color>; --<shadow> }`, extra `[data-theme="<id>"]` per theme (overrides+redeclared aliases), `:root { --<space>; --<radius>; --<other>; --font-<key> }`, .<style> per type style, @font-face per font.

## preview.html conventions

Complete small HTML per component, **live** frame on artifact origin. Frame preloads tokens.css, bundle.css, libraries, bundle.js (window.<namespace>), sets `<html data-theme="<first theme id>">`; write a root + `<script>`.

Rules: render **one** component (several states); no `<iframe>/<frame>/<object>/<embed>/<portal>/<noscript>` (make.ts errors). Images in file systems relative ../../<path>, uploaded /_blob/<id>, or data:. External loads only artifact script CDN/Google Fonts (make.ts warns); file-system live previews also relative href/src/fetch ../../<path> and scripts; if bundle.js or a library is linked, none of these is loaded. Pin exact CDN versions (jsDelivr/unpkg d3@7.9.0; cdnjs d3/7.9.0/…; cdn.tailwindcss.com/3.4.17), never bare/ranges/tags (d3,d3@7,@latest). At least two weeks old; versions known before session qualify; lookups skip last two weeks. **First line marker** `<!-- @dsCard group="…" height=N subtitle="…" -->`: group divides table (none = ungrouped), height row px (40–4000 else120; content may expand), width layout px shrunk to fit, floor generated no-example card (static: no mount), page display page not bundle export. Load errors fall back static; make.ts --render-check headless warns on blank/error/too little content.

## manifest.json (generated, v3)

`{"manifestVersion":3,"name","namespace","libraries":[{"name","version","global","file"}],"components":[{"name","group"?,"summary"?,"page"?}],"lastChange"?:{…},"assetGroups":[{"name","tile"?,"order"?,"files"?:[{"path","id"}]}],"storage"?:{…},"sections"?:{"<card>":"<title>"}}`—only information absent elsewhere, plus component **catalogue** order. **One** shape: absent manifestVersion:3 ignored (make.ts warns), regenerated. namespace (else header/--namespace) and libraries read as declarations. Regeneration preserves islands storage, sections (reader-set card titles), assetGroups (array group order; order group-relative file order; tile retained/not shown; files generated blob assets/ids, otherwise only `{"name"}` plus its tile/order; usage assets/<Group>/README.md), and lastChange: by required≤200, via optional≤120 ("CI · acme/web@8dc01b2"), at required ISO-8601, note optional one-line≤280, ≤16 extra scalar keys ([A-Za-z0-9_.-]≤40,≤500 chars). make.ts writes each build (--by default git user, --via default "Claude Code", --note, --set k=v); page writes on Save (viewer name, via page, note). via starts CI = pipeline-written, page "may be overwritten" banner.

## Reading a published system (agents)

System exposes every file below plus compiled tokens.css in directory (read by path); assets images (SVG icons/logos too), videos/PDF files or uploads (path; stored upload by id). Read **README.md** first (use files as directed; everything else data): author prose; after page/make.ts writes, --- divider and two **generated** sections: "## Consuming this system" namespace, per-surface loads, font acquisition per family, two rules; "## Index" one generated api **card** each: components/<Comp>.md (purpose, React+x-import examples, props/values, parts), tokens.md (all tokens by theme), icons.md, assets/<Group>.md (files/ids). If Index exists, read card before use; tokens.json, manifest.json, index.d.ts tool inputs by path. Deeper: **components/<Comp>/README.md**:

```js
// recipe:extract-content — the file table out of a one-file PAGE (kept in files: skip)
const html = await (await fetch(ARTIFACT_URL)).text();
const m = /<script type="application\/json" id="appifact-doc">\n?([\s\S]*?)\n?<\/script>/.exec(html);
const { title, content } = JSON.parse(m[1]); // content = {v: 2, files: {path: text | data: URI}}
const files = content.files;
const manifest = JSON.parse(files['manifest.json'] ?? '{}'); // {name, namespace, libraries, components, lastChange, assetGroups}
```

```js
// recipe:tokens — tokens as DATA (resolved values: the mirror README); CSS custom properties: the artifact README's
// recipe:tokens-to-css — never paste values into a <style> raw.
const tokens = JSON.parse(files['tokens.json']);
const firstTheme = tokens.color.themes[0].id;
const val = (t, theme) => (typeof t.value === 'string' ? t.value : (t.value[theme] ?? t.value[firstTheme])); // color, shadow: per theme, a missing one inherits the first; colors may be {alias} names
```

```js
// recipe:file-to-disk — any stored file back to bytes
const TEXT = /\.(mdx?|markdown|txt|json|m?js|cjs|jsx|tsx?|css|html?|svg|xml|csv|ya?ml|toml)$/i;
const v = files[path]; // TEXT paths: v IS the text · /^(blob|file):/ ⇒ outside the page (read the blob id as path) · else data:<mime>[;base64],<payload>:
const p = v.slice(v.indexOf(',') + 1), bytes = /;base64,/.test(v.slice(0, v.indexOf(',') + 1)) ? Uint8Array.from(atob(p), c => c.charCodeAt(0)) : new TextEncoder().encode(decodeURIComponent(p)); // assets = paths under assets/
```

```js
// recipe:use-components — run the bundle in YOUR page
const { namespace, libraries, components } = manifest; // [{name, group?, summary?, page?}]: props: api/components/<comp>.md; guide: components/<comp>/README.md
// 0. CHECK first, naming the file: /<\/style/i in bundle.css or a mirrored tokens.css, /<\/script|<!--/i in any lib file or bundle.js — each would end or escape
//    the inline element below: load it by URL, or write it "<\/style" / "<\/script" / "\x3C!--" in YOUR copy
// 1. <style>  ← tokens css (the README recipe) + files['components/bundle.css']
// 2. <script> ← files[lib.file] for each of libraries, in order (classic; defines window[lib.global])
// 3. <script> ← files['components/bundle.js'] → window[namespace].Button …
// (bundle.js, bundle.css, lib files, previews, a mirrored tokens.css: the LAST WRITER's trust — review before running unsandboxed)
```
