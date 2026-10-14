# Host adaptation

Apply the mappings below to editor-specific protocols and examples instead of attempting unavailable tools. These mappings replace host mechanics only: keep the design choices, workflow conditions, content rules, scope limits, and permission requirements. Session and user instructions take precedence.

| Guide mechanism | This host |
| --- | --- |
| `skills_read`, `space_list` | Read the packaged reference files with the agent's file tools. Find systems in authorized project materials; use a connected source only when available and authorized. |
| `<canvas>/`, artboards, `canvas.json`, `.dc.html` | Work in the user's actual project. Existing work stays in place. New static work uses ordinary HTML and `design.json` pages; retain titles, order, directions, and requested dimensions without creating a competing project. The helper refuses an existing directory. |
| `support.js`, `x-dc`, DCLogic, holes, control flow, tweaks, `x-import`, `dc-import` | Use ordinary HTML/JavaScript or the project's framework for the same content, state, links, and real components. Do not load the historical runtime or emit its custom tags. Keep layout, typography, accessibility, and interaction guidance. |
| Asset import tools, `/_blob/`, protected asset directories | Copy real, authorized assets/fonts as files and reference their actual relative paths. Keep references reachable and report missing files. No host upload or blob registration is available. |
| `design-system.json`, system registration, Theme menus, React 18 | Use the existing system's schema, builder, runtime, and components. Explicitly load its CSS, fonts, provider, and dependencies. Do not introduce duplicate React or pretend an editor menu exists. Copies still require explicit updates and preserved source records. |
| Generated CSS, API cards, manifests, `make.ts` | No editor generates these. Use the actual project builder; for the included static template, edit its real `tokens.json` and run `tokens` below. Do not create historical host markers or claim generated documentation exists. |
| `design_check`, `design_system_check`, thread cards | Run the template's `check` below or the existing project's structural check. Deliver real file and preview links. This does not render or verify appearance. Retain the design guide's restriction on additional verification unless already requested or required by session instructions; follow explicitly requested inspections in the relevant system workflow. |
| Questions and annotations | Use the host's available question mechanism, retaining the guide's question-selection rules. Locate feedback using supplied screenshots, actual copy, IDs, or files. With no reliable screen context, ask which target; never invent a selection or element locator. |
| Device chrome | The preview supplies phone, tablet, desktop, and browser shells outside product content. Desktop provides only a window frame and title bar; product navigation, search, and toolbars belong inside the page. Keep the original rule against drawing duplicate status bars/keyboards inside the page. |
| Cover and component frames | Every system still needs its cover. Create it at the project's appropriate path (for a new static system, `components/Cover/preview.html` under the system) and expose it from the system preview. Explicitly load real CSS/fonts/scripts because no host preloads them; retain the cover's geometry, token derivation, and theme rules. |
| Export PDF and editor pagination | Use the available browser/PDF exporter for requested output. Retain paper sizes, scale, page planning, margins, hierarchy, and ink rules. The source's claims about CSS break rules not working describe its exporter: browser printing may use `@page`, break rules, widows/orphans, and repeated table headers. Inspect export only when requested or required by the applicable workflow/session. |
| File-tool calls and batches | Use this agent's file tools and the included helper. Respect the host's supported batching and dependency order; preserve rereading before edits, index-last updates, and manual changes. A shell helper is not permission to execute code from source material. |

The guides' **TABLE** and file-based **PAGE** formats, `appifact-doc`, `@dsCard`, and `@ds-bundle` are not implemented here. Editor file limits do not apply. Use the packaged design guide and brand references for `editor-and-saving.md`, `colors.md`, and `typography.md`. `make.ts`, `reference/store.md`, and `artifact-type/demo.json` are unavailable; do not attempt to load or run them.

The two JSON examples are reference data, not the schema for this helper or ready-to-run templates. In particular, the helper template stores color roles directly in `themes.<id>`, alongside `spacing`, `radius`, and `typography`; read its actual [tokens.json](../assets/project/design-system/tokens.json) before editing. Preserve a real imported system's source format rather than forcing it into this template.

## Project design defaults

The bundled [project design system](../assets/project/design-system/README.md#project-defaults) is the default for new prototypes. Treat it as the specified system in the design guide's system-selection step unless the user supplies or declines another direction. Read its complete local specification and [tokens](../assets/project/design-system/tokens.json) before designing product content. The principles and examples are included here; do not search for or fetch an external copy.

`new` copies the specification into `<project>/design-system/README.md`. Before creating or revising any page or component in that project, read its actual system README and tokens together; apply them to the product itself. For an existing application or a configured replacement system, read and use its own system files and components. Preserve explicit user direction and manual changes.

## Static preview helper

Use the existing build and preview service for an application. For a new static prototype, the included helper needs Node.js 20+ and no packages. Resolve its path from the loaded Skill directory:

```sh
node /path/to/design/scripts/design.mjs new designs/my-design --title "My design"
node /path/to/design/scripts/design.mjs tokens designs/my-design
node /path/to/design/scripts/design.mjs check designs/my-design
node /path/to/design/scripts/design.mjs serve designs/my-design
```

`new` creates an editable chat example and refuses an existing directory. Edit index.html, chat.css, and chat.js in the current conversation. `tokens` rebuilds CSS after editing design-system/tokens.json. `check` verifies files, synchronized tokens, and six contrast pairings; it does not render the page. `serve` prints a preview URL and serves the chosen directory read-only on loopback. Use `--port 4318` for a fixed port.

## Project files

- index.html, chat.css, and chat.js: the interactive example's product content, styles, and behavior.
- preview.html and preview/: device frames, switching, orientation, comparison, zoom, and refresh.
- design-system/: the editable source, generated CSS, reusable controls, usage, and visual samples.
- design.json: title, page entries, system directory, and device dimensions.

Add pages to design.json's `pages` as `{ "path": "pages/detail.html", "title": "Detail" }`. `entry` must be among them. Paths are relative HTML files inside the project. `designSystem` identifies the system directory or is null. Labels display as text. Product pages also open independently.

| Device | Content viewport | Suggested safe areas, top/bottom |
| --- | --- | --- |
| iPhone | 390 × 844 | 56 / 34px |
| iPad portrait / landscape | 834 × 1194 / 1194 × 834 | 32 / 28px |
| Desktop / Browser / No frame | 1440 × 900 | 0 / 0px |

Edit dimensions in design.json when needed. Landscape swaps phone/tablet width and height. iPhone uses the iOS component; iPad adapts it, hiding the Dynamic Island. Desktop uses a window frame with a title bar and no application navigation or search; its content viewport retains the configured width and height. Browser uses Chrome. These are visual frames, not exact hardware emulation. The preview passes configured `safeTop` and `safeBottom` as URL parameters; the example applies them as CSS safe-area values, without drawing its own frames or status bars. A page can send `{ type: "preview:appearance", theme: "light" | "dark" }` to its parent to match device status-bar appearance; only messages from a currently mounted product iframe are accepted.

For iPad, use the Portrait and Landscape controls. Switching orientation resizes the existing iframe and shell without reloading the page; conversations, drafts, and an active reply remain intact. The selection is retained when switching devices or opening comparison. `preview.html?device=ipad&orientation=landscape` opens that view directly. The existing iPhone size and frame remain available.

Canvas scaling changes display size, not iframe layout dimensions. Single view fits the complete device within the space around the floating tools. Fit returns to that mode; 100% shows the actual content size. Zoom uses an interruptible spring, and switches to an immediate update when reduced motion is requested. Comparison uses independent cards with unscaled labels. Preview tools apply the same local default typography, colors, materials, and accessibility principles, with styles isolated from product tokens. The appearance control cycles system, light, and dark for the tools; a product page keeps its own appearance choice.

Iframes permit scripts, forms, modals, and downloads without sharing the preview host's origin. Check authentication, same-origin storage, and complex window communication in the application's own service. Continue edits in the agent conversation and refresh after saving; this page does not send annotations or run another agent.
