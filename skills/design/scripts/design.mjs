import fs from "node:fs/promises";
import path from "node:path";
import http from "node:http";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { buildTokens } from "./tokens.mjs";

const usage = `node design.mjs new <directory> [--title "My design"]
node design.mjs tokens <directory>
node design.mjs check <directory>
node design.mjs serve <directory> [--port 4318]`;

const deviceNames = ["iphone", "ipad", "desktop", "browser", "none"];

function relativePath(value, html = false) {
  if (
    typeof value !== "string" ||
    !value ||
    value.length > 800 ||
    /[\\?#%\u0000]/.test(value) ||
    path.posix.isAbsolute(value) ||
    value.split("/").some((part) => !part || part.startsWith(".")) ||
    (html && !/\.html$/i.test(value))
  ) {
    throw new Error("Expected a relative project path: " + String(value));
  }
  return value;
}

async function projectFile(root, relative) {
  const resolved = await fs.realpath(path.join(root, relativePath(relative)));
  const boundary = path.relative(root, resolved);
  if (
    boundary === ".." ||
    boundary.startsWith(".." + path.sep) ||
    path.isAbsolute(boundary)
  ) {
    throw new Error("File is outside the project: " + relative);
  }
  return resolved;
}

async function loadProject(directory) {
  const root = await fs.realpath(directory);
  const file = await projectFile(root, "design.json");
  const config = JSON.parse(await fs.readFile(file, "utf8"));
  if (
    config.version !== 1 ||
    typeof config.title !== "string" ||
    !config.title.trim() ||
    config.title.length > 100
  ) {
    throw new Error("Invalid design.json version or title");
  }
  relativePath(config.entry, true);
  if (
    !Array.isArray(config.pages) ||
    !config.pages.length ||
    config.pages.length > 100
  ) {
    throw new Error("design.json requires 1–100 pages");
  }
  const seen = new Set();
  for (const page of config.pages) {
    relativePath(page.path, true);
    if (
      seen.has(page.path) ||
      typeof page.title !== "string" ||
      !page.title.trim()
    ) {
      throw new Error("Invalid or duplicate page");
    }
    seen.add(page.path);
  }
  if (!seen.has(config.entry)) throw new Error("entry must be listed in pages");
  if (config.designSystem !== null) relativePath(config.designSystem);
  for (const name of deviceNames) {
    const device = config.devices?.[name];
    if (
      !device ||
      !["width", "height"].every(
        (key) =>
          Number.isInteger(device[key]) &&
          device[key] >= 128 &&
          device[key] <= 4096,
      )
    ) {
      throw new Error("Invalid device dimensions: " + name);
    }
    if (
      !["safeTop", "safeBottom"].every(
        (key) =>
          Number.isInteger(device[key]) &&
          device[key] >= 0 &&
          device[key] < device.height,
      )
    ) {
      throw new Error("Invalid device safe area: " + name);
    }
  }
  if (!deviceNames.includes(config.defaultDevice))
    throw new Error("Invalid default device");
  return { root, config };
}

async function readSystem(root, config) {
  if (!config.designSystem)
    throw new Error("This project has no design system");
  const source = await projectFile(root, config.designSystem + "/tokens.json");
  const tokens = JSON.parse(await fs.readFile(source, "utf8"));
  return buildTokens(tokens);
}

async function buildSystem(root, config) {
  const system = await readSystem(root, config);
  const file = path.join(root, config.designSystem, "tokens.css");
  try {
    if ((await fs.lstat(file)).isSymbolicLink())
      throw new Error("Generated CSS cannot be a symbolic link");
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  await fs.writeFile(file, system.css);
  return system.contrast;
}

async function newProject(directory, title) {
  title = title.trim();
  if (!title || title.length > 100)
    throw new Error("Project title must contain 1–100 characters");
  const root = path.resolve(directory);
  await fs.mkdir(path.dirname(root), { recursive: true });
  try {
    await fs.mkdir(root);
  } catch (error) {
    if (error.code === "EEXIST")
      throw new Error("Directory already exists; edit its files in place");
    throw error;
  }
  const template = fileURLToPath(
    new URL("../assets/project/", import.meta.url),
  );
  for (const name of await fs.readdir(template)) {
    await fs.cp(path.join(template, name), path.join(root, name), {
      recursive: true,
      force: false,
      errorOnExist: true,
    });
  }
  const devices = {
    iphone: { width: 390, height: 844, safeTop: 56, safeBottom: 34 },
    ipad: { width: 834, height: 1194, safeTop: 32, safeBottom: 28 },
    desktop: { width: 1440, height: 900, safeTop: 0, safeBottom: 0 },
    browser: { width: 1440, height: 900, safeTop: 0, safeBottom: 0 },
    none: { width: 1440, height: 900, safeTop: 0, safeBottom: 0 },
  };
  const config = {
    version: 1,
    title,
    entry: "index.html",
    pages: [{ path: "index.html", title: "Home" }],
    designSystem: "design-system",
    defaultDevice: "iphone",
    devices,
  };
  await fs.writeFile(
    path.join(root, "design.json"),
    JSON.stringify(config, null, 2) + "\n",
  );
  await buildSystem(root, config);
  return { directory: root, content: "index.html", preview: "preview.html" };
}

async function checkProject(root, config) {
  const files = [
    ...config.pages.map((page) => page.path),
    "preview.html",
    "preview/preview.js",
    "preview/preview.css",
    "preview/vendor/ios-shell.js",
    "preview/vendor/chrome-shell.js",
    "preview/vendor/macos-window.js",
    "preview/vendor/dom.js",
  ];
  let contrast = null;
  if (config.designSystem) {
    const system = await readSystem(root, config);
    const file = await projectFile(root, config.designSystem + "/tokens.css");
    if ((await fs.readFile(file, "utf8")) !== system.css) {
      throw new Error(
        "Tokens are out of sync; run design.mjs tokens <directory>",
      );
    }
    for (const name of ["components.css", "preview.html", "README.md"]) {
      files.push(config.designSystem + "/" + name);
    }
    contrast = system.contrast;
  }
  for (const name of files) {
    if (!(await fs.stat(await projectFile(root, name))).isFile()) {
      throw new Error("Expected a file: " + name);
    }
  }
  return {
    project: root,
    pages: config.pages.length,
    contrast,
    visualVerification: "not performed",
  };
}

const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/plain; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mp3": "audio/mpeg",
  ".pdf": "application/pdf",
};

function serveProject(root, config, port) {
  const server = http.createServer(async (request, response) => {
    try {
      if (!["GET", "HEAD"].includes(request.method)) {
        response.writeHead(405, { Allow: "GET, HEAD" });
        return response.end("The preview service only serves files");
      }
      const url = new URL(request.url, "http://127.0.0.1");
      const relative =
        decodeURIComponent(url.pathname).slice(1) || "preview.html";
      const file = await projectFile(root, relative);
      if (!(await fs.stat(file)).isFile()) throw new Error("Expected a file");
      const bytes = await fs.readFile(file);
      response.writeHead(200, {
        "Content-Type":
          mime[path.extname(file).toLowerCase()] || "application/octet-stream",
        "Content-Length": bytes.length,
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
        "Access-Control-Allow-Origin": "*",
      });
      response.end(request.method === "HEAD" ? undefined : bytes);
    } catch (error) {
      response.writeHead(
        error instanceof URIError ? 400 : error.code === "ENOENT" ? 404 : 403,
        { "Content-Type": "text/plain; charset=utf-8" },
      );
      response.end("Cannot read this project file");
    }
  });
  server.listen(port, "127.0.0.1", () => {
    const origin = "http://127.0.0.1:" + server.address().port;
    console.log(
      JSON.stringify({
        preview: origin + "/preview.html",
        content: origin + "/" + config.entry,
      }),
    );
  });
  const stop = () => server.close(() => process.exit(0));
  process.once("SIGINT", stop);
  process.once("SIGTERM", stop);
}

async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      title: { type: "string" },
      port: { type: "string" },
      help: { type: "boolean" },
    },
  });
  if (values.help) return console.log(usage);
  const [command, directory] = positionals;
  if (
    positionals.length !== 2 ||
    !["new", "tokens", "check", "serve"].includes(command) ||
    (values.title !== undefined && command !== "new") ||
    (values.port !== undefined && command !== "serve")
  )
    throw new Error(usage);
  let result;
  if (command === "new") {
    result = await newProject(directory, values.title ?? "My design");
  } else {
    const { root, config } = await loadProject(directory);
    if (command === "tokens") result = await buildSystem(root, config);
    if (command === "check") result = await checkProject(root, config);
    if (command === "serve") {
      const port = values.port ?? "0";
      if (!/^\d+$/.test(port) || Number(port) > 65535)
        throw new Error("Invalid port");
      return serveProject(root, config, Number(port));
    }
  }
  console.log(JSON.stringify(result));
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
