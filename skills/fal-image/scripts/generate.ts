#!/usr/bin/env bun
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join, resolve } from "path";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MODEL_ENDPOINTS: Record<string, string> = {
  "gpt-image-1": "fal-ai/gpt-image-1/text-to-image",
  "gpt-image-1.5": "fal-ai/gpt-image-1.5",
  "nano-banana-2": "fal-ai/nano-banana-2",
};

// GPT Image 1.5 handles both text-to-image and editing via the same endpoint (image_urls param).
// Nano Banana 2 uses a separate /edit endpoint for image editing.
const NANO_BANANA_EDIT_ENDPOINT = "fal-ai/nano-banana-2/edit";

const GPT_AR_MAP: Record<string, string> = {
  "1:1": "1024x1024",
  "16:9": "1536x1024",
  "3:2": "1536x1024",
  "9:16": "1024x1536",
  "2:3": "1024x1536",
};

const MAX_RETRIES = 3;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Config {
  default_model: string;
  default_quality: string;
  default_ar: string;
  default_format: string;
  batch_workers: number;
}

interface Options {
  prompt: string;
  promptFiles: string[];
  model: string;
  ar: string;
  size: string;
  quality: string;
  n: number;
  format: string;
  image: string;
  outputDir: string;
  batchFile: string;
  jobs: number;
  json: boolean;
  seed: number;
  ref: string[];
}

interface BatchTask {
  id?: string;
  prompt?: string;
  promptFiles?: string[];
  image: string;
  model?: string;
  ar?: string;
  size?: string;
  quality?: string;
  n?: number;
  format?: string;
  seed?: number;
  ref?: string[];
}

interface ImageResult {
  path: string;
  width: number;
  height: number;
}

// ---------------------------------------------------------------------------
// Config & API Key
// ---------------------------------------------------------------------------

function loadConfig(): Config {
  const defaults: Config = {
    default_model: "gpt-image-1",
    default_quality: "2k",
    default_ar: "",
    default_format: "png",
    batch_workers: 4,
  };
  const configPath = join(process.env.HOME || "", ".config", "fal-image", "config.json");
  try {
    return { ...defaults, ...JSON.parse(readFileSync(configPath, "utf-8")) };
  } catch {
    return defaults;
  }
}

function getApiKey(): string {
  if (process.env.FAL_KEY) return process.env.FAL_KEY;
  const keyPath = join(process.env.HOME || "", ".config", "fal", "key");
  try {
    return readFileSync(keyPath, "utf-8").trim();
  } catch {
    throw new Error("FAL_KEY not configured. Run: bash scripts/setup.sh <your-api-key>");
  }
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 60)
      .replace(/^-|-$/g, "") || "image"
  );
}

function ensureDir(filePath: string) {
  const dir = dirname(filePath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function readPromptFiles(files: string[]): string {
  return files.map((f) => readFileSync(resolve(f), "utf-8").trim()).join("\n\n");
}

function imageToDataUrl(filePath: string): string {
  const absPath = resolve(filePath);
  const data = readFileSync(absPath);
  const ext = absPath.split(".").pop()?.toLowerCase() || "png";
  const mime =
    ext === "jpg" || ext === "jpeg" ? "image/jpeg" :
    ext === "webp" ? "image/webp" :
    ext === "gif" ? "image/gif" : "image/png";
  return `data:${mime};base64,${data.toString("base64")}`;
}

async function uploadToFal(filePath: string, apiKey: string): Promise<string> {
  const absPath = resolve(filePath);
  const data = readFileSync(absPath);
  const ext = absPath.split(".").pop()?.toLowerCase() || "png";
  const mime =
    ext === "jpg" || ext === "jpeg" ? "image/jpeg" :
    ext === "webp" ? "image/webp" : "image/png";
  const fileName = absPath.split("/").pop() || "image.png";

  // Step 1: get presigned upload URL
  const initRes = await fetch("https://rest.alpha.fal.ai/storage/upload/initiate", {
    method: "POST",
    headers: {
      Authorization: `Key ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ file_name: fileName, content_type: mime }),
  });
  if (!initRes.ok) throw new Error(`Upload init failed: HTTP ${initRes.status}`);
  const { upload_url, file_url } = (await initRes.json()) as { upload_url: string; file_url: string };

  // Step 2: upload the file
  const uploadRes = await fetch(upload_url, {
    method: "PUT",
    headers: { "Content-Type": mime },
    body: data,
  });
  if (!uploadRes.ok) throw new Error(`Upload failed: HTTP ${uploadRes.status}`);

  return file_url;
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function printHelp() {
  console.log(`Usage: bun generate.ts '<prompt>' [options]

Options:
  --promptfiles <files...>  Read prompt from files (concatenated)
  --image <path>            Output image path
  --model <name>, -m        gpt-image-1, gpt-image-1.5, nano-banana-2
  --ar <ratio>              Aspect ratio (1:1, 16:9, 9:16, 4:3, etc.)
  --size <WxH>              Explicit size (overrides --ar)
  --quality <preset>        normal or 2k (default: 2k)
  --ref <files...>          Reference images for image editing
  --n <count>               Number of images, 1-4 (default: 1)
  --format <fmt>            png, jpeg, webp (default: png)
  --seed <int>              Seed for reproducibility (Nano Banana 2)
  --output-dir <dir>        Output directory (default: fal-images)
  --batchfile <path>        JSON batch file for parallel generation
  --jobs <count>            Worker count for batch mode (default: 4)
  --json                    JSON output
  -h, --help                Show help`);
}

function parseArgs(argv: string[], config: Config): Options | null {
  const opts: Options = {
    prompt: "",
    promptFiles: [],
    model: config.default_model,
    ar: config.default_ar,
    size: "",
    quality: config.default_quality,
    n: 1,
    format: config.default_format,
    image: "",
    outputDir: "fal-images",
    batchFile: "",
    jobs: config.batch_workers,
    json: false,
    seed: -1,
    ref: [],
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "-h" || arg === "--help") {
      printHelp();
      process.exit(0);
    } else if (arg === "--model" || arg === "-m") {
      opts.model = argv[++i] || "";
    } else if (arg === "--ar") {
      opts.ar = argv[++i] || "";
    } else if (arg === "--size") {
      opts.size = argv[++i] || "";
    } else if (arg === "--quality") {
      opts.quality = argv[++i] || "";
    } else if (arg === "--n") {
      opts.n = parseInt(argv[++i] || "1");
    } else if (arg === "--format") {
      opts.format = argv[++i] || "png";
    } else if (arg === "--image") {
      opts.image = argv[++i] || "";
    } else if (arg === "--output-dir") {
      opts.outputDir = argv[++i] || "";
    } else if (arg === "--seed") {
      opts.seed = parseInt(argv[++i] || "-1");
    } else if (arg === "--batchfile") {
      opts.batchFile = argv[++i] || "";
    } else if (arg === "--jobs") {
      opts.jobs = parseInt(argv[++i] || "4");
    } else if (arg === "--json") {
      opts.json = true;
    } else if (arg === "--ref") {
      // Consume all following non-flag args as ref image paths
      while (i + 1 < argv.length && !argv[i + 1].startsWith("-")) {
        opts.ref.push(argv[++i]);
      }
    } else if (arg === "--promptfiles") {
      // Consume all following non-flag args as file paths
      while (i + 1 < argv.length && !argv[i + 1].startsWith("-")) {
        opts.promptFiles.push(argv[++i]);
      }
    } else if (!arg.startsWith("-")) {
      opts.prompt = arg;
    }
  }

  // Batch mode doesn't need prompt
  if (opts.batchFile) return opts;

  // Resolve prompt from files
  if (!opts.prompt && opts.promptFiles.length) {
    opts.prompt = readPromptFiles(opts.promptFiles);
  }

  if (!opts.prompt) {
    console.error("Error: prompt is required (positional arg or --promptfiles)");
    printHelp();
    return null;
  }

  if (!MODEL_ENDPOINTS[opts.model]) {
    console.error(`Error: unknown model "${opts.model}". Available: ${Object.keys(MODEL_ENDPOINTS).join(", ")}`);
    return null;
  }

  // Auto-upgrade: --ref with gpt-image-1 → gpt-image-1.5 (only 1.5 supports image editing)
  if (opts.ref.length && opts.model === "gpt-image-1") {
    opts.model = "gpt-image-1.5";
    console.error("Note: --ref requires gpt-image-1.5, auto-switching from gpt-image-1");
  }

  return opts;
}

// ---------------------------------------------------------------------------
// Request Building
// ---------------------------------------------------------------------------

function resolveQualityAndSize(model: string, quality: string, ar: string, size: string) {
  const isGpt = model.startsWith("gpt-image");

  if (isGpt) {
    const q = quality === "normal" ? "medium" : quality === "2k" ? "high" : quality;
    let s = size;
    if (!s && ar) s = GPT_AR_MAP[ar] || "1024x1024";
    if (!s) s = "1024x1024";
    return { gptQuality: q, gptSize: s };
  }

  // Nano Banana 2
  const res = quality === "normal" ? "1K" : quality === "2k" ? "2K" : "1K";
  return { nbResolution: res, nbAr: ar || "1:1" };
}

function resolveEndpoint(model: string, hasRef: boolean): string {
  if (hasRef && model === "nano-banana-2") return NANO_BANANA_EDIT_ENDPOINT;
  return MODEL_ENDPOINTS[model];
}

function buildRequestBody(
  prompt: string,
  model: string,
  quality: string,
  ar: string,
  size: string,
  n: number,
  format: string,
  seed: number,
  imageUrls: string[]
): Record<string, any> {
  const body: Record<string, any> = {
    prompt,
    num_images: n,
    output_format: format,
  };

  const resolved = resolveQualityAndSize(model, quality, ar, size);

  if (model.startsWith("gpt-image")) {
    body.image_size = resolved.gptSize;
    body.quality = resolved.gptQuality;
    if (imageUrls.length) body.image_urls = imageUrls;
  } else {
    body.aspect_ratio = resolved.nbAr;
    body.resolution = resolved.nbResolution;
    if (seed >= 0) body.seed = seed;
    if (imageUrls.length) body.image_urls = imageUrls;
  }

  return body;
}

// ---------------------------------------------------------------------------
// fal.ai API
// ---------------------------------------------------------------------------

interface QueueResponse {
  request_id: string;
  status_url: string;
  response_url: string;
}

async function submitToQueue(
  endpoint: string,
  body: Record<string, any>,
  apiKey: string
): Promise<QueueResponse> {
  const response = await fetch(`https://queue.fal.run/${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: `Key ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status} — ${text}`);
  }

  return (await response.json()) as QueueResponse;
}

async function pollResult(queue: QueueResponse, apiKey: string): Promise<any> {
  const headers = { Authorization: `Key ${apiKey}` };

  while (true) {
    const res = await fetch(queue.status_url, { headers });
    if (!res.ok) throw new Error(`Status check failed: HTTP ${res.status}`);

    const status = (await res.json()) as { status: string; error?: string };

    if (status.status === "COMPLETED") {
      const result = await fetch(queue.response_url, { headers });
      if (!result.ok) throw new Error(`Result fetch failed: HTTP ${result.status}`);
      return result.json();
    }

    if (status.status === "FAILED") {
      throw new Error(`Generation failed: ${status.error || "unknown error"}`);
    }

    await new Promise((r) => setTimeout(r, 1000));
  }
}

async function downloadImage(url: string, outputPath: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Image download failed: HTTP ${response.status}`);
  ensureDir(outputPath);
  writeFileSync(outputPath, Buffer.from(await response.arrayBuffer()));
}

// ---------------------------------------------------------------------------
// Generation with Retry
// ---------------------------------------------------------------------------

async function generateWithRetry(
  endpoint: string,
  body: Record<string, any>,
  apiKey: string
): Promise<{ url: string; width: number; height: number }[]> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const queue = await submitToQueue(endpoint, body, apiKey);
      if (attempt > 1) console.error(`  Retry ${attempt}/${MAX_RETRIES}, queued (${queue.request_id})`);

      const result = await pollResult(queue, apiKey);
      const images = result.images || [];
      if (!images.length) throw new Error("No images returned");
      return images;
    } catch (error) {
      lastError = error as Error;
      if (attempt < MAX_RETRIES) {
        console.error(`  Attempt ${attempt} failed: ${lastError.message}. Retrying...`);
        await new Promise((r) => setTimeout(r, 1000 * attempt));
      }
    }
  }

  throw lastError || new Error("Generation failed after retries");
}

// ---------------------------------------------------------------------------
// Single Image Generation
// ---------------------------------------------------------------------------

async function generateSingle(opts: Options, apiKey: string): Promise<ImageResult[]> {
  // Upload ref images if provided
  let imageUrls: string[] = [];
  if (opts.ref.length) {
    console.error(`Uploading ${opts.ref.length} reference image(s)...`);
    imageUrls = await Promise.all(opts.ref.map((f) => uploadToFal(f, apiKey)));
  }

  const endpoint = resolveEndpoint(opts.model, imageUrls.length > 0);
  const body = buildRequestBody(
    opts.prompt, opts.model, opts.quality, opts.ar, opts.size,
    opts.n, opts.format, opts.seed, imageUrls
  );

  // Display model info
  const qualityLabel = opts.quality || "2k";
  const arLabel = opts.ar || "1:1";
  const refLabel = opts.ref.length ? ` | ref: ${opts.ref.length} image(s)` : "";
  console.error(`Using ${opts.model} | quality: ${qualityLabel} | ar: ${arLabel}${refLabel}`);

  const images = await generateWithRetry(endpoint, body, apiKey);
  const results: ImageResult[] = [];
  const outputDir = resolve(opts.outputDir);
  const slug = slugify(opts.prompt);

  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const suffix = images.length > 1 ? `-${i + 1}` : "";
    const filePath = opts.image
      ? images.length > 1
        ? opts.image.replace(/(\.\w+)$/, `${suffix}$1`)
        : resolve(opts.image)
      : join(outputDir, `${slug}${suffix}.${opts.format}`);

    await downloadImage(img.url, filePath);
    console.error(`Saved: ${filePath} (${img.width}x${img.height})`);
    results.push({ path: filePath, width: img.width, height: img.height });
  }

  return results;
}

// ---------------------------------------------------------------------------
// Batch Generation
// ---------------------------------------------------------------------------

async function generateBatch(opts: Options, apiKey: string): Promise<void> {
  const batchPath = resolve(opts.batchFile);
  const batchDir = dirname(batchPath);
  const raw = JSON.parse(readFileSync(batchPath, "utf-8"));
  const tasks: BatchTask[] = Array.isArray(raw) ? raw : raw.tasks || [];
  const jobs = opts.jobs || raw.jobs || 4;
  const config = loadConfig();

  if (!tasks.length) {
    console.error("Error: batch file contains no tasks");
    process.exit(1);
  }

  console.error(`Batch: ${tasks.length} tasks, ${jobs} workers`);

  let completed = 0;
  let failed = 0;
  const allResults: { id: string; results?: ImageResult[]; error?: string }[] = [];

  // Worker pool
  const queue = [...tasks];
  const workers = Array.from({ length: Math.min(jobs, tasks.length) }, async () => {
    while (queue.length) {
      const task = queue.shift()!;
      const id = task.id || task.image || `task-${completed + failed + 1}`;

      try {
        let prompt = task.prompt || "";
        if (!prompt && task.promptFiles?.length) {
          prompt = task.promptFiles
            .map((f) => readFileSync(resolve(batchDir, f), "utf-8").trim())
            .join("\n\n");
        }
        if (!prompt) throw new Error("No prompt provided");

        let model = task.model || config.default_model;
        if (!MODEL_ENDPOINTS[model]) throw new Error(`Unknown model: ${model}`);

        // Upload ref images for this task
        let taskImageUrls: string[] = [];
        if (task.ref?.length) {
          taskImageUrls = await Promise.all(
            task.ref.map((f) => uploadToFal(resolve(batchDir, f), apiKey))
          );
          if (model === "gpt-image-1") model = "gpt-image-1.5";
        }

        const endpoint = resolveEndpoint(model, taskImageUrls.length > 0);
        const body = buildRequestBody(
          prompt,
          model,
          task.quality || config.default_quality,
          task.ar || "",
          task.size || "",
          task.n || 1,
          task.format || config.default_format,
          task.seed ?? -1,
          taskImageUrls
        );

        console.error(`[${id}] Generating with ${model}...`);
        const images = await generateWithRetry(endpoint, body, apiKey);
        const results: ImageResult[] = [];

        for (let i = 0; i < images.length; i++) {
          const img = images[i];
          const suffix = images.length > 1 ? `-${i + 1}` : "";
          const imgPath = resolve(batchDir, task.image.replace(/(\.\w+)$/, `${suffix}$1`));
          await downloadImage(img.url, imgPath);
          results.push({ path: imgPath, width: img.width, height: img.height });
        }

        completed++;
        console.error(`[${id}] Done (${completed}/${tasks.length})`);
        allResults.push({ id, results });
      } catch (error) {
        failed++;
        const msg = (error as Error).message;
        console.error(`[${id}] Failed: ${msg}`);
        allResults.push({ id, error: msg });
      }
    }
  });

  await Promise.all(workers);

  console.error(`\nBatch complete: ${completed} succeeded, ${failed} failed`);

  if (opts.json) {
    console.log(JSON.stringify({ completed, failed, results: allResults }, null, 2));
  } else {
    for (const r of allResults) {
      if (r.results) {
        for (const img of r.results) console.log(img.path);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const config = loadConfig();
  const opts = parseArgs(process.argv.slice(2), config);
  if (!opts) process.exit(1);

  const apiKey = getApiKey();

  if (opts.batchFile) {
    await generateBatch(opts, apiKey);
    return;
  }

  const results = await generateSingle(opts, apiKey);

  if (opts.json) {
    console.log(JSON.stringify({ images: results }, null, 2));
  } else {
    for (const r of results) console.log(r.path);
  }
}

main().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exit(1);
});
