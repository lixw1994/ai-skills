# Ask before starting

Ask only when someone can answer. Use the current host's available question mechanism and supported input schema; otherwise write questions as plain text in the user's language and end the turn. Otherwise (headless, agent caller, "just do it"), follow SKILL.md: decide, make it, state assumptions in one line.

Read supplied materials first. A brief with two or more unresolved decisions affecting the result deserves **one** message before the first write, at most 4 questions; one gap with a reasonable default, a complete brief, or a small edit gets none.

Questions come from materials, not forms: point to what you read ("Your notes cover four things"), contradictions/gaps, and the decision most affecting the result, most consequential first. Only someone who read the brief could ask them. Never repeat answered questions; take implicit defaults and say so. Generic intake (audience? length? interface or prototype?) only for genuinely blank briefs.

Options are the real craft: 2–4 concrete directions for **this** work ("lead with restructuring", not "narrative"), each differing on a named dimension, never shades of one idea. Short labels carry choices; short `description`s only if informative. Your preference first, "(Recommended)"; no recommendations for factual questions. Default `"multiSelect": true`, because people often explore; `false` only for mutually exclusive options (length/format). No "Other" or "You decide" (users can always answer freely), or free-text-only questions.

Treat answers as decisions, restate them in your assumption line; decide and state whatever they leave to you. Ask another round (at most 4 new questions) only if requested or an answer raises something impossible to ask earlier; otherwise make it. Never repeat questions.

## Questions for a design

Ask what the supplied page, app, or PRD leaves open for **this** design: which job comes first when an interface does several, who arrives, which product conventions to retain/break, which artboard differences help decisions. User names a product without materials? Ask for a link/screenshot, not blind design. No alignment source or apparent style? Offer two or three concrete directions, or ask using 2–4 low-fidelity artboards. Interface or prototype: infer from signals (SKILL.md); absent signals, pick and say so.

For example, the user links their Projects page (dense 13px table, top-right "New project", an Import from GitHub flow in Settings two tabs away), requesting "a better empty state for teams with no projects". Suitable question content (adapt the format to the current host):

```json
{"questions": [
  {"question": "New project already sits top-right and Import from GitHub lives in Settings. What should the empty state push people toward?", "header": "Main path", "multiSelect": true, "options": [
    {"label": "Starter templates (Recommended)", "description": "Three cards fill the empty table"},
    {"label": "Import from GitHub", "description": "The Settings flow surfaces here"},
    {"label": "Invite teammates", "description": "An inline invite field"},
    {"label": "New project, centered", "description": "The existing button, moved center"}]},
  {"question": "The page is all-business (tight tables, no illustration anywhere in the app). What may the empty state add?", "header": "Feel", "multiSelect": true, "options": [
    {"label": "Stay in system (Recommended)", "description": "Your table's type, one line icon"},
    {"label": "One warm moment", "description": "A small illustration, only here"},
    {"label": "A sample row", "description": "A faint example project row"}]},
  {"question": "A new team hits two more empties right after this one (Members, API keys). Cover them so they read as a set?", "header": "Scope", "multiSelect": false, "options": [
    {"label": "Projects only (Recommended)", "description": "Three artboards of this screen"},
    {"label": "All three empties", "description": "One direction carried across them"}]}]}
```
