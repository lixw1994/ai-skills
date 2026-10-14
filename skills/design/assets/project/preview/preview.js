const names = {
  iphone: "iPhone",
  ipad: "iPad",
  desktop: "Desktop",
  browser: "Browser",
  none: "No frame",
};
function node(tag, cls, text) {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  if (text !== undefined) el.textContent = text;
  return el;
}
window.addEventListener("message", (event) => {
  if (event.data?.type !== "preview:appearance" ||
      !["light", "dark"].includes(event.data.theme)) return;
  for (const frame of document.querySelectorAll(".artboard iframe")) {
    if (event.source === frame.contentWindow) {
      frame.closest("ios-shell")?.toggleAttribute("dark", event.data.theme === "dark");
      break;
    }
  }
});

function deviceBoard({
  device,
  width,
  height,
  safeTop = 0,
  safeBottom = 0,
  title,
  url,
  entryLabel,
  primary = "#0066cc",
  onFocus,
}) {
  const board = node("section", "artboard");
  board.dataset.device = device;
  const head = node("div", "board-head"),
    label = node("div", "board-name");
  label.append(
    node("strong", "", names[device]),
    node("span", "", `${width} × ${height}`),
  );
  const focus = node("button", "board-focus", "View alone ↗");
  focus.type = "button";
  focus.setAttribute("aria-label", "View alone " + names[device]);
  focus.onclick = () => onFocus(device);
  head.append(label, focus);
  board.append(head);
  const viewport = node("div", "device-viewport"),
    render = node("div", "device-render");
  const iframe = node("iframe");
  iframe.width = String(width);
  iframe.height = String(height);
  iframe.title = `${title} · ${names[device]}`;
  const contentUrl = new URL(url, location.href);
  contentUrl.searchParams.set("safeTop", String(safeTop));
  contentUrl.searchParams.set("safeBottom", String(safeBottom));
  iframe.src = contentUrl.href;
  iframe.setAttribute(
    "sandbox",
    "allow-scripts allow-forms allow-modals allow-downloads",
  );
  if (device === "iphone" || device === "ipad") {
    const shell = node(
      "ios-shell",
      device === "ipad"
        ? "tablet-shell"
        : width > height
          ? "phone-landscape"
          : "",
    );
    shell.setAttribute("width", String(width + 26));
    shell.setAttribute("screen-height", String(height));
    shell.toggleAttribute("dark", document.documentElement.dataset.dsTheme === "dark");
    shell.append(iframe);
    render.append(shell);
  } else if (device === "browser") {
    const shell = node("chrome-shell");
    shell.setAttribute("width", String(width));
    shell.setAttribute("tab", title);
    shell.setAttribute("fav", primary);
    shell.setAttribute("url", "design.local/" + entryLabel);
    shell.append(iframe);
    render.append(shell);
  } else if (device === "desktop") {
    render.append(
      window.PreviewDOM.h(
        window.MacWindow,
        { width, height, title },
        iframe,
      ),
    );
  } else {
    const shell = node("div", "plain-screen");
    shell.append(iframe);
    render.append(shell);
  }
  viewport.append(render);
  board.append(viewport);
  return board;
}

class PreviewCanvas {
  constructor({ canvas, surface, stage, onZoom }) {
    Object.assign(this, {
      canvas,
      surface,
      stage,
      onZoom,
      zoom: 1,
      compare: false,
      fitting: true,
      fitMode: "window",
      zoomVelocity: 0,
      zoomTarget: 1,
      zoomFrame: 0,
    });
    this.resizeObserver = new ResizeObserver(() => {
      const { top, bottom } = this.insets();
      canvas.style.setProperty("--toolbar-height", top + "px");
      canvas.style.setProperty("--footer-height", bottom + "px");
      if (this.compare) this.layoutCompare();
      else if (this.fitting) this.fit(this.fitMode, false);
      else this.layoutSingle();
    });
    this.resizeObserver.observe(canvas);
    this.resizeObserver.observe(document.getElementById("toolbar"));
    this.resizeObserver.observe(document.getElementById("canvas-footer"));
    canvas.addEventListener(
      "wheel",
      (e) => {
        if (!e.ctrlKey && !e.metaKey) return;
        e.preventDefault();
        if (!this.compare) {
          const rect = canvas.getBoundingClientRect();
          this.zoomBy(Math.exp(-e.deltaY * 0.002), {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          });
        }
      },
      { passive: false },
    );
    let drag;
    canvas.addEventListener("pointerdown", (e) => {
      if (
        e.button !== 0 || e.pointerType !== "mouse" ||
        e.target.closest("button,a,iframe") ||
        !(
          e.target === canvas ||
          e.target === surface ||
          e.target === stage ||
          e.target.closest(".board-head")
        )
      )
        return;
      drag = {
        x: e.clientX,
        y: e.clientY,
        left: canvas.scrollLeft,
        top: canvas.scrollTop,
      };
      canvas.setPointerCapture(e.pointerId);
      canvas.classList.add("dragging");
    });
    canvas.addEventListener("pointermove", (e) => {
      if (!drag) return;
      canvas.scrollLeft = drag.left - (e.clientX - drag.x);
      canvas.scrollTop = drag.top - (e.clientY - drag.y);
    });
    const end = () => {
      drag = null;
      canvas.classList.remove("dragging");
    };
    canvas.addEventListener("pointerup", end);
    canvas.addEventListener("pointercancel", end);
  }
  show(boards, compare = false) {
    cancelAnimationFrame(this.zoomFrame);
    this.zoomFrame = 0;
    this.zoomVelocity = 0;
    this.zoomAnchor = null;
    this.compare = compare;
    this.fitting = true;
    this.stage.replaceChildren(...boards);
    this.canvas.classList.toggle("comparing", compare);
    this.canvas.scrollTo(0, 0);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        if (compare) this.layoutCompare();
        else this.fit("window", false);
        this.canvas.scrollTo(0, 0);
      }),
    );
  }
  measurements(board) {
    const inner = board.querySelector(".device-render");
    return { inner, width: inner.offsetWidth, height: inner.offsetHeight };
  }
  insets() {
    return {
      top: document.getElementById("toolbar").offsetHeight,
      bottom: document.getElementById("canvas-footer").offsetHeight + 32,
    };
  }
  layoutCompare() {
    if (!this.compare || !this.stage.children.length) return;
    const width = this.canvas.clientWidth;
    this.stage.dataset.columns = width >= 1180 ? "3" : width >= 900 ? "2" : "1";
    this.surface.style.width = "";
    this.surface.style.height = "";
    this.stage.style.transform = "";
    this.stage.style.left = "";
    this.stage.style.top = "";
    this.stage.style.width = "";
    this.stage.style.height = "";
    for (const board of this.stage.children) {
      const { inner, width: naturalWidth, height } = this.measurements(board);
      if (!naturalWidth || !height) continue;
      const viewport = board.querySelector(".device-viewport");
      const available = viewport.clientWidth,
        scale = Math.min(1, available / naturalWidth);
      viewport.style.width = "100%";
      viewport.style.height = Math.ceil(height * scale) + "px";
      inner.style.position = "absolute";
      inner.style.left =
        (viewport.clientWidth - naturalWidth * scale) / 2 + "px";
      inner.style.top = "0";
      inner.style.transform = `scale(${scale})`;
    }
    this.onZoom(null);
  }
  fit(mode = "window", animate = true) {
    if (this.compare) return this.layoutCompare();
    const board = this.stage.firstElementChild;
    if (!board) return;
    const { width, height } = this.measurements(board);
    if (!width || !height) return;
    const { top, bottom } = this.insets();
    const widthRatio = (this.canvas.clientWidth - 48) / width;
    const ratio =
      mode === "width"
        ? widthRatio
        : Math.min(widthRatio, (this.canvas.clientHeight - top - bottom - 48) / height);
    this.fitMode = mode;
    this.fitting = true;
    this.setZoom(Math.min(1, Math.max(0.05, ratio)), animate);
  }
  actualSize() {
    if (this.compare) return;
    this.fitting = false;
    this.setZoom(1);
  }
  zoomBy(factor, anchor = {
    x: this.canvas.clientWidth / 2,
    y: this.canvas.clientHeight / 2,
  }) {
    if (this.compare || !this.stage.firstElementChild) return;
    const next = Math.max(0.05, Math.min(2, (this.zoomFrame ? this.zoomTarget : this.zoom) * factor));
    this.fitting = false;
    this.setZoom(next, true, anchor);
  }
  setZoom(target, animate = true, anchor) {
    this.zoomTarget = target;
    this.zoomAnchor = anchor ? {
      ...anchor,
      contentX: (this.canvas.scrollLeft + anchor.x - parseFloat(this.stage.style.left || 0)) / this.zoom,
      contentY: (this.canvas.scrollTop + anchor.y - parseFloat(this.stage.style.top || 0)) / this.zoom,
    } : null;
    const paint = () => {
      this.layoutSingle();
      if (this.zoomAnchor) {
        const a = this.zoomAnchor;
        this.canvas.scrollLeft = parseFloat(this.stage.style.left) + a.contentX * this.zoom - a.x;
        this.canvas.scrollTop = parseFloat(this.stage.style.top) + a.contentY * this.zoom - a.y;
      } else this.canvas.scrollTo(0, 0);
    };
    if (!animate || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      cancelAnimationFrame(this.zoomFrame);
      this.zoomFrame = 0;
      this.zoomVelocity = 0;
      this.zoom = target;
      paint();
      return;
    }
    if (this.zoomFrame) return;
    let previous = performance.now();
    const tick = (time) => {
      const dt = Math.min(.04, (time - previous) / 1000);
      previous = time;
      const omega = 24;
      const displacement = this.zoom - this.zoomTarget;
      const handoff = this.zoomVelocity + omega * displacement;
      const decay = Math.exp(-omega * dt);
      this.zoom = this.zoomTarget + (displacement + handoff * dt) * decay;
      this.zoomVelocity = (this.zoomVelocity - omega * handoff * dt) * decay;
      const settled = Math.abs(this.zoom - this.zoomTarget) < .0001 && Math.abs(this.zoomVelocity) < .005;
      if (settled) this.zoom = this.zoomTarget;
      paint();
      this.zoomFrame = settled ? 0 : requestAnimationFrame(tick);
    };
    this.zoomFrame = requestAnimationFrame(tick);
  }
  layoutSingle() {
    if (this.compare) return;
    const board = this.stage.firstElementChild;
    if (!board) return;
    const { inner, width, height } = this.measurements(board);
    if (!width || !height) return;
    const viewport = board.querySelector(".device-viewport");
    viewport.style.width = width + "px";
    viewport.style.height = height + "px";
    inner.style.position = "relative";
    inner.style.left = "";
    inner.style.top = "";
    inner.style.transform = "";
    const { top, bottom } = this.insets();
    const sw = Math.max(this.canvas.clientWidth, width * this.zoom + 48),
      sh = Math.max(this.canvas.clientHeight, height * this.zoom + top + bottom + 48);
    this.surface.style.width = sw + "px";
    this.surface.style.height = sh + "px";
    this.stage.style.width = width + "px";
    this.stage.style.height = height + "px";
    this.stage.style.left = (sw - width * this.zoom) / 2 + "px";
    this.stage.style.top = top + (sh - top - bottom - height * this.zoom) / 2 + "px";
    this.stage.style.transform = `scale(${this.zoom})`;
    this.onZoom(this.zoom);
  }
}

const $ = (id) => document.getElementById(id);
const state = {
  config: null,
  entry: "",
  device: "iphone",
  orientations: { iphone: "portrait", ipad: "portrait" },
  compare: false,
  version: Date.now(),
  primary: "#0066cc",
  appearance: "system",
};
const systemAppearance = matchMedia("(prefers-color-scheme: dark)");
try {
  const saved = localStorage.getItem("design-preview.appearance");
  if (["system", "light", "dark"].includes(saved)) state.appearance = saved;
} catch {}
function applyAppearance() {
  document.documentElement.dataset.dsTheme = state.appearance === "system"
    ? (systemAppearance.matches ? "dark" : "light") : state.appearance;
  const label = state.appearance[0].toUpperCase() + state.appearance.slice(1) + " appearance. Change appearance";
  $("appearance").setAttribute("aria-label", label);
  $("appearance").title = label;
  $("appearance").dataset.selected = String(state.appearance !== "system");
}
systemAppearance.addEventListener("change", applyAppearance);
function relative(value, html = false) {
  if (
    typeof value !== "string" ||
    !value ||
    value.length > 800 ||
    /[\\?#%\u0000]/.test(value) ||
    value.startsWith("/") ||
    value
      .split("/")
      .some((p) => !p || p === "." || p === ".." || p.startsWith(".")) ||
    (html && !/\.html$/i.test(value))
  )
    throw new Error(
      "Design entries must be relative HTML paths inside the project.",
    );
  return value;
}
const encoded = (value) =>
  relative(value).split("/").map(encodeURIComponent).join("/");
function validate(config) {
  if (
    !config ||
    config.version !== 1 ||
    typeof config.title !== "string" ||
    !config.title.trim() ||
    config.title.length > 100
  )
    throw new Error("Check the version and title in design.json.");
  relative(config.entry, true);
  if (
    !Array.isArray(config.pages) ||
    !config.pages.length ||
    config.pages.length > 100
  )
    throw new Error("List the pages in design.json.");
  const seen = new Set();
  for (const page of config.pages) {
    relative(page.path, true);
    if (
      seen.has(page.path) ||
      typeof page.title !== "string" ||
      !page.title.trim()
    )
      throw new Error("Invalid page title or path.");
    seen.add(page.path);
  }
  if (!seen.has(config.entry))
    throw new Error("entry must be listed in pages.");
  if (config.designSystem !== null) relative(config.designSystem);
  for (const name of Object.keys(names)) {
    const d = config.devices?.[name];
    if (
      !d ||
      !["width", "height"].every(
        (k) => Number.isInteger(d[k]) && d[k] >= 128 && d[k] <= 4096,
      ) ||
      !["safeTop", "safeBottom"].every(
        (k) => Number.isInteger(d[k]) && d[k] >= 0 && d[k] < d.height,
      )
    )
      throw new Error("Check device dimensions and safe areas: " + name);
  }
  if (!Object.hasOwn(names, config.defaultDevice))
    throw new Error("Invalid default device.");
  return config;
}
function ready(value) {
  document
    .querySelectorAll("[data-device]")
    .forEach((b) => (b.disabled = !value));
  document.querySelectorAll("[data-orientation]").forEach((b) => (b.disabled = !value));
  for (const id of [
    "rotate",
    "compare",
    "zoom-out",
    "zoom-in",
    "fit",
    "actual-size",
    "page-select",
  ])
    $(id).disabled = !value;
  $("open-page").setAttribute("aria-disabled", String(!value));
}
const engine = new PreviewCanvas({
  canvas: $("canvas"),
  surface: $("surface"),
  stage: $("stage"),
  onZoom: (zoom) => {
    $("zoom-controls").hidden = zoom === null;
    $("compare-hint").hidden = zoom !== null;
    if (zoom !== null) {
      $("zoom-label").textContent = Math.round(zoom * 100) + "%";
      $("actual-size").setAttribute(
        "aria-pressed",
        String(!engine.fitting && Math.abs(zoom - 1) < 0.001),
      );
      $("fit").setAttribute("aria-pressed", String(engine.fitting));
    }
  },
});
function dimensions(device) {
  const d = state.config.devices[device];
  return state.orientations[device] === "landscape" &&
    ["iphone", "ipad"].includes(device)
    ? { width: d.height, height: d.width }
    : { width: d.width, height: d.height };
}
function focusDevice(device) {
  if (!state.config) return;
  state.device = device;
  state.compare = false;
  render();
}
function render(preserveContent = false) {
  const url = encoded(state.entry) + "?preview=" + state.version;
  if (preserveContent) {
    for (const board of engine.stage.children) {
      const { width, height } = dimensions(board.dataset.device);
      const frame = board.querySelector("iframe");
      frame.width = String(width);
      frame.height = String(height);
      const shell = board.querySelector("ios-shell");
      shell.setAttribute("width", String(width + 26));
      shell.setAttribute("screen-height", String(height));
      shell.classList.toggle("phone-landscape", board.dataset.device === "iphone" && width > height);
      board.querySelector(".board-name span").textContent = `${width} × ${height}`;
    }
    engine.fit("window", false);
  } else engine.show(
    (state.compare ? ["iphone", "ipad", "desktop"] : [state.device]).map(
      (device) =>
        deviceBoard({
          device,
          ...dimensions(device),
          safeTop: state.config.devices[device].safeTop,
          safeBottom: state.config.devices[device].safeBottom,
          title: state.config.title,
          url,
          entryLabel: state.entry,
          primary: state.primary,
          onFocus: focusDevice,
        }),
    ),
    state.compare,
  );
  document
    .querySelectorAll("[data-device]")
    .forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.device === state.device)),
    );
  $("compare").setAttribute("aria-pressed", String(state.compare));
  $("rotate").disabled =
    state.compare || !["iphone", "ipad"].includes(state.device);
  $("rotate").hidden = state.compare || state.device !== "iphone";
  $("ipad-orientation").hidden = state.device !== "ipad" || state.compare;
  document.querySelectorAll("[data-orientation]").forEach((button) =>
    button.setAttribute("aria-pressed", String(button.dataset.orientation === state.orientations.ipad)),
  );
  $("rotate").setAttribute("aria-pressed", String(state.orientations.iphone === "landscape"));
  const d = dimensions(state.device);
  $("preview-label").textContent = state.compare
    ? "Compare devices"
    : `${names[state.device]} · ${d.width} × ${d.height}`;
  $("open-page").href = url;
  const view = new URL(location.href);
  view.searchParams.set("device", state.device);
  view.searchParams.set("orientation", state.orientations[state.device] || "portrait");
  if (state.compare) view.searchParams.set("compare", "1");
  else view.searchParams.delete("compare");
  history.replaceState(null, "", view);
}
async function refresh() {
  $("refresh").disabled = true;
  try {
    if (location.protocol === "file:")
      throw new Error(
        "Open the device preview through a local project server. Content pages can open independently.",
      );
    const response = await fetch("design.json?preview=" + Date.now(), {
      cache: "no-store",
    });
    if (!response.ok)
      throw new Error(
        "design.json was not found. Initialize the project first.",
      );
    const config = validate(await response.json()),
      initial = !state.config;
    state.config = config;
    if (initial) {
      const query = new URLSearchParams(location.search);
      state.device = Object.hasOwn(names, query.get("device")) ? query.get("device") : config.defaultDevice;
      if (["portrait", "landscape"].includes(query.get("orientation")) && ["iphone", "ipad"].includes(state.device))
        state.orientations[state.device] = query.get("orientation");
      state.compare = query.get("compare") === "1";
    }
    if (!config.pages.some((p) => p.path === state.entry))
      state.entry = config.entry;
    $("project-title").textContent = config.title;
    document.title = config.title + " · Design";
    $("page-select").replaceChildren(
      ...config.pages.map((p) => {
        const o = document.createElement("option");
        o.value = p.path;
        o.textContent = p.title;
        return o;
      }),
    );
    $("page-select").value = state.entry;
    $("page-choice").hidden = config.pages.length < 2;
    $("system-link").hidden = !config.designSystem;
    state.primary = "#0066cc";
    if (config.designSystem) {
      $("system-link").href = encoded(config.designSystem) + "/preview.html";
      try {
        const r = await fetch(
          encoded(config.designSystem) + "/tokens.json?v=" + Date.now(),
          { cache: "no-store" },
        );
        if (r.ok) {
          const tokens = await r.json();
          const primary = tokens.themes?.light?.primary;
          state.primary = /^#[0-9a-f]{6}$/i.test(
            primary || "",
          )
            ? primary
            : "#0066cc";
        }
      } catch {}
    }
    ready(true);
    state.version = Date.now();
    $("load-error").hidden = true;
    render();
  } catch (error) {
    $("load-error").hidden = false;
    $("load-error").textContent = error.message;
    if (!state.config) ready(false);
  } finally {
    $("refresh").disabled = false;
  }
}
document
  .querySelectorAll("[data-device]")
  .forEach((b) => (b.onclick = () => focusDevice(b.dataset.device)));
$("rotate").onclick = () => {
  if (!state.config) return;
  state.orientations.iphone = state.orientations.iphone === "portrait" ? "landscape" : "portrait";
  render(true);
};
document.querySelectorAll("[data-orientation]").forEach((button) => {
  button.onclick = () => {
    if (!state.config || state.orientations.ipad === button.dataset.orientation) return;
    state.orientations.ipad = button.dataset.orientation;
    render(true);
  };
});
$("compare").onclick = () => {
  if (!state.config) return;
  state.compare = !state.compare;
  render();
};
$("page-select").onchange = () => {
  state.entry = $("page-select").value;
  render();
};
$("zoom-in").onclick = () => engine.zoomBy(1.15);
$("zoom-out").onclick = () => engine.zoomBy(1 / 1.15);
$("fit").onclick = () => engine.fit();
$("actual-size").onclick = () => engine.actualSize();
$("refresh").onclick = refresh;
$("appearance").onclick = () => {
  const choices = ["system", "light", "dark"];
  state.appearance = choices[(choices.indexOf(state.appearance) + 1) % choices.length];
  try { localStorage.setItem("design-preview.appearance", state.appearance); } catch {}
  applyAppearance();
};
applyAppearance();
ready(false);
refresh();
