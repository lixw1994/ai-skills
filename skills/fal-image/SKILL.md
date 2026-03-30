---
name: fal-image
description: Generate images using fal.ai API. Supports GPT Image 1/1.5 and Nano Banana 2 models. Use when user asks to "generate an image", "create a picture", "make an illustration", "draw something", "画一张图", "生成图片", "做一张海报", or describes a visual they want created. Also triggers when user mentions fal.ai, GPT Image, or Nano Banana.
---

# fal.ai Image Generator

Generate images from text prompts via fal.ai API. No SDK required — uses HTTP API directly.

## Models

| Model | Endpoint | Strengths | Image Editing |
|-------|----------|-----------|---------------|
| GPT Image 1 | `fal-ai/gpt-image-1/text-to-image` | Best overall quality, transparent backgrounds | No (`--ref` auto-switches to 1.5) |
| GPT Image 1.5 | `fal-ai/gpt-image-1.5` | Slightly cheaper at high quality | Yes (`image_urls`) |
| Nano Banana 2 | `fal-ai/nano-banana-2` | Fastest, up to 4K, extreme aspect ratios (8:1), seed reproducibility | Yes (`/edit` endpoint) |

**Default to GPT Image 1** for general use. Choose Nano Banana 2 when speed matters, extreme aspect ratios are needed, or resolution > 1536px is required. When `--ref` is used with GPT Image 1, the script auto-switches to GPT Image 1.5.

## Script Directory

Scripts in `scripts/` subdirectory. `{baseDir}` = this SKILL.md's directory path. Resolve `${BUN_X}` runtime: if `bun` installed → `bun`; if `npx` available → `npx -y bun`; else suggest installing bun.

## Step 0: Setup (Blocking)

Before first use, check if the API key exists:

```bash
test -f ~/.config/fal/key && echo "OK" || echo "NEEDS_SETUP"
```

If not configured, ask the user for their fal.ai API key (from https://fal.ai/dashboard/keys), then run:

```bash
bash {baseDir}/scripts/setup.sh <api-key>
```

Do NOT echo or log the key in any other way. Generation is BLOCKED until the key is saved.

### Config (Optional)

Default preferences are loaded from `~/.config/fal-image/config.json`:

```json
{
  "default_model": "gpt-image-1",
  "default_quality": "2k",
  "default_ar": "",
  "default_format": "png",
  "batch_workers": 4
}
```

CLI args always override config defaults. Create this file manually or let the script use built-in defaults.

## Usage

```bash
# Basic
${BUN_X} {baseDir}/scripts/generate.ts '<prompt>' --image out.png

# With aspect ratio
${BUN_X} {baseDir}/scripts/generate.ts '<prompt>' --image out.png --ar 16:9

# High quality
${BUN_X} {baseDir}/scripts/generate.ts '<prompt>' --image out.png --quality 2k

# Nano Banana 2 with 4K
${BUN_X} {baseDir}/scripts/generate.ts '<prompt>' --image out.png --model nano-banana-2 --quality 2k --ar 16:9

# From prompt files (concatenated)
${BUN_X} {baseDir}/scripts/generate.ts --promptfiles system.md content.md --image out.png

# With reference images (image editing)
${BUN_X} {baseDir}/scripts/generate.ts 'Make the sky purple' --ref source.png --image edited.png

# Reference image with explicit model
${BUN_X} {baseDir}/scripts/generate.ts 'Add a hat' --ref photo.jpg --model nano-banana-2 --image out.png

# Batch parallel generation
${BUN_X} {baseDir}/scripts/generate.ts --batchfile batch.json

# Batch with explicit worker count
${BUN_X} {baseDir}/scripts/generate.ts --batchfile batch.json --jobs 4 --json
```

Always single-quote prompts to avoid shell interpretation.

## Options

| Option | Description | Default |
|--------|-------------|---------|
| `<text>` | Prompt text (positional) | |
| `--promptfiles <files...>` | Read prompt from files (concatenated) | |
| `--image <path>` | Output image path | auto-generated |
| `--model <name>`, `-m` | `gpt-image-1`, `gpt-image-1.5`, `nano-banana-2` | `gpt-image-1` |
| `--ar <ratio>` | Aspect ratio: `1:1`, `16:9`, `9:16`, `4:3`, `3:2`, `21:9`, etc. | |
| `--size <WxH>` | Explicit size (overrides `--ar`) | |
| `--quality <preset>` | Quality preset: `normal`, `2k` | `2k` |
| `--n <count>` | Number of images (1-4) | `1` |
| `--format <fmt>` | Output format: `png`, `jpeg`, `webp` | `png` |
| `--ref <files...>` | Reference images for editing (GPT Image 1.5, Nano Banana 2) | |
| `--seed <int>` | Seed for reproducibility (Nano Banana 2 only) | |
| `--output-dir <dir>` | Output directory | `fal-images` |
| `--batchfile <path>` | JSON batch file for parallel generation | |
| `--jobs <count>` | Worker count for batch mode | `4` |
| `--json` | JSON output (paths + metadata) | |

## Quality Presets

Quality presets abstract away model-specific parameters:

| Preset | GPT Image 1/1.5 | Nano Banana 2 |
|--------|------------------|---------------|
| `normal` | quality: `medium`, 1024px | resolution: `1K` |
| `2k` (default) | quality: `high`, 1024px | resolution: `2K` |

## Aspect Ratio Mapping

`--ar` is a unified parameter that maps to model-specific settings:

**GPT Image 1/1.5** (fixed sizes only):

| AR | Mapped Size |
|----|-------------|
| `1:1` | `1024x1024` |
| `16:9`, `3:2` | `1536x1024` |
| `9:16`, `2:3` | `1024x1536` |

**Nano Banana 2**: passes `aspect_ratio` directly to the API (supports `1:1`, `16:9`, `9:16`, `4:3`, `3:4`, `3:2`, `2:3`, `21:9`, `5:4`, `4:5`, `4:1`, `1:4`, `8:1`, `1:8`).

`--size` always overrides `--ar` when both are given.

## Reference Images (`--ref`)

Pass one or more local image files as reference for image editing:

```bash
${BUN_X} {baseDir}/scripts/generate.ts 'Make the background blue' --ref photo.png --image edited.png
```

Behavior per model:

| Model | Mechanism | Notes |
|-------|-----------|-------|
| GPT Image 1 | Not supported | Auto-switches to GPT Image 1.5 |
| GPT Image 1.5 | `image_urls` param on same endpoint | Supports multiple refs |
| Nano Banana 2 | Separate `/edit` endpoint | `image_urls` param |

Reference images are uploaded to fal.ai's storage before generation. The prompt should describe the desired edit relative to the reference image(s).

## Batch File Format

```json
{
  "jobs": 4,
  "tasks": [
    {
      "id": "hero",
      "prompt": "A hero banner image",
      "image": "out/hero.png",
      "model": "gpt-image-1",
      "ar": "16:9",
      "quality": "2k"
    },
    {
      "id": "icon",
      "prompt": "A minimalist app icon",
      "promptFiles": ["prompts/icon.md"],
      "image": "out/icon.png",
      "model": "nano-banana-2"
    },
    {
      "id": "edit",
      "prompt": "Make the sky dramatic and purple",
      "image": "out/edited.png",
      "ref": ["source/landscape.png"]
    }
  ]
}
```

Paths in `promptFiles` and `image` are resolved relative to the batch file's directory. `jobs` is optional (overridden by CLI `--jobs`). Top-level array format (without `jobs` wrapper) is also accepted.

## Workflow

1. Check setup — if FAL_KEY not configured, run setup first
2. **Display model info**: `Using <model> | quality: <preset> | ar: <ratio>`
3. Craft a detailed prompt based on what the user wants (expand vague requests into specific visual descriptions)
4. Run the generate script
5. Read the generated image file to show the user the result
6. If the user wants adjustments, refine the prompt and regenerate

## Generation Mode

| Situation | Approach |
|-----------|----------|
| Single image or 1-2 simple images | Sequential (default) |
| Multiple images with finalized prompts | Batch (`--batchfile`) with parallel workers |
| Each image needs separate creative reasoning | Subagents per image |

## Error Handling

- Missing API key → error with setup instructions
- Generation failure → auto-retry up to 3 attempts
- Invalid aspect ratio → warning, proceed with model default
- All retries exhausted → error with failure reason

## Output

Images save to `fal-images/` by default. The script prints saved file paths to stdout.

With `--json`, outputs structured JSON:

```json
{
  "images": [
    { "path": "fal-images/a-cat.png", "width": 1024, "height": 1024 }
  ]
}
```
