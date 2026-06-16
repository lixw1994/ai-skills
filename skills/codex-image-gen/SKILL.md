---
name: codex-image-gen
description: Generate images (illustrations, mockups, marketing visuals, cat pics) via the codex CLI using GPT-5.5's built-in image-generation tool. Use whenever the user asks to generate, create, draw, or render an image.
---

# Image generation via codex CLI

The local **codex CLI** (logged into GPT-5.5) has a built-in image-generation tool. Drive it non-interactively with `codex exec`.

## Prerequisites

This skill assumes the `codex` CLI is installed and logged into GPT-5.5. Verify before running:

```bash
codex --version          # confirms the CLI is on PATH
```

If `codex` is missing or not authenticated (the run errors with a login/auth message), tell the user to install it and run `codex login` first — don't try to work around it.

## Output location

Default to saving in the current working directory. If the user names a specific folder, point codex at it with `-C <dir>`:

```bash
-C ./images/   # set a specific output dir; omit to use the current directory
```

Note: `-s workspace-write` writes the generated PNG into the working tree. If you're inside a git repo, don't accidentally commit it — check `git status` and clean up or `.gitignore` test images.

## Command

```bash
codex exec \
  -m gpt-5.5 \
  -c model_reasoning_effort="high" \
  -s workspace-write \
  --skip-git-repo-check \
  "Use your image generation tool to generate <DESCRIPTION>. \
Save the generated image into this working directory and tell me the exact file path."
```

- Replace `<DESCRIPTION>` with a detailed prompt (subject, style, framing, e.g. "a cute photorealistic orange tabby cat sitting, looking at camera").
- `-s workspace-write` lets it save the file into the working tree. Add `-C <dir>` to set a specific output dir (defaults to the current directory).
- Run with a generous timeout (~300s) — high reasoning + image gen is slow.

## Controlling size / aspect / quality

There are **no CLI flags** for image size, aspect ratio, or quality — `codex exec` exposes none (verified against `--help`). Image generation is a *tool the model calls*, so you steer all of it through **natural language in the prompt**:

- **Pixel size** — "The output MUST be exactly 1024x1024 pixels." (Tested: honored exactly; the model even self-verifies dimensions.) The underlying tool works in a fixed set of sizes (square `1024x1024`, portrait `1024x1536`, landscape `1536x1024`); odd requests get mapped to the nearest supported size, so treat exact pixels as best-effort.
- **Aspect ratio** — "square / 16:9 widescreen / portrait / vertical poster."
- **Quality & detail** — "high detail, photorealistic, sharp focus" vs "simple flat minimalist." (`-c model_reasoning_effort="high"` improves the model's *planning*, not pixel fidelity — keep it high anyway.)
- **Background / format** — "transparent background", "white background", "PNG".

So: bake size/aspect/quality requirements into `<DESCRIPTION>` rather than looking for flags.

## Reference / input images (image editing)

To generate *from* an existing image (style reference, edit, variation), attach it with `-i/--image`:

```bash
codex exec -m gpt-5.5 -s workspace-write --skip-git-repo-check \
  -i /path/to/reference.png \
  "Use your image generation tool to redraw this in a watercolor style. Save it here and give me the path."
```

`-i` is repeatable for multiple references. Note `-i` is for *input* — it does not control output size.

## How it works / gotchas

- Codex writes the raw PNG to its cache at `~/.codex/generated_images/<session-id>/ig_*.png`, then copies it into the working dir. The reply ends with the saved path.
- To verify/preview the result, `Read` the saved `.png` path.
- For multiple variations, ask for them in one prompt or re-run with a varied description.
