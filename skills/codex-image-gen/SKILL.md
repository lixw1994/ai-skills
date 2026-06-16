---
name: codex-image-gen
description: Generate images (illustrations, mockups, marketing visuals, cat pics) via the codex CLI using GPT-5.5's built-in image-generation tool. Use whenever the user asks to generate, create, draw, or render an image.
---

# Image generation via codex CLI

The local **codex CLI** (logged into GPT-5.5) has a built-in image-generation tool. Drive it non-interactively with `codex exec`.

## Command

```bash
codex exec \
  -m gpt-5.5 \
  -c model_reasoning_effort="medium" \
  -s workspace-write \
  --skip-git-repo-check \
  "Use your image generation tool to generate <DESCRIPTION>. \
Save the generated image into this working directory and tell me the exact file path."
```

- Replace `<DESCRIPTION>` with a detailed prompt (subject, style, framing, e.g. "a cute photorealistic orange tabby cat sitting, looking at camera").
- `-s workspace-write` lets it save the file into the working directory. Use `-C <dir>` to set a different output dir.
- Run with a generous timeout (~300s) — image generation is slow.

## How it works / gotchas

- Codex writes the raw PNG to its cache at `~/.codex/generated_images/<session-id>/ig_*.png`, then copies it into the working dir. The reply ends with the saved path.
- To verify/preview the result, `Read` the saved `.png` path.
- For multiple variations, ask for them in one prompt or re-run with a varied description.
