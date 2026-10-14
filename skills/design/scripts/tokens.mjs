const colors = [
  "background",
  "surface",
  "ink",
  "muted",
  "border",
  "primary",
  "on-primary",
  "primary-soft",
  "accent",
  "ring",
];
const typeStyles = ["body", "title", "display", "caption", "code"];
const typeProperties = ["fontFamily", "fontSize", "lineHeight", "fontWeight"];
const isObject = (value) =>
  value && typeof value === "object" && !Array.isArray(value);
const isKey = (value) => /^[a-z][a-z0-9-]{0,40}$/.test(value);
const isColor = (value) =>
  typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value);
const isLength = (value) =>
  typeof value === "string" &&
  /^\d+(\.\d+)?px$/.test(value) &&
  parseFloat(value) <= 256;

function requireValue(condition, message) {
  if (!condition) throw new Error("Design system: " + message);
}

function validate(tokens) {
  requireValue(
    isObject(tokens) &&
      typeof tokens.name === "string" &&
      tokens.name.trim() &&
      tokens.name.length <= 100,
    "name must contain 1–100 characters",
  );
  requireValue(
    isObject(tokens.themes) &&
      isObject(tokens.themes.light) &&
      Object.keys(tokens.themes).length <= 8,
    "a light theme is required; at most eight themes",
  );
  for (const [theme, values] of Object.entries(tokens.themes)) {
    requireValue(isKey(theme) && isObject(values), "invalid theme: " + theme);
    for (const name of colors) {
      requireValue(
        isColor(values[name]),
        `${theme}.${name} requires a six-digit HEX color`,
      );
    }
    for (const [name, value] of Object.entries(values)) {
      requireValue(
        isKey(name) && isColor(value),
        "only named HEX colors are supported",
      );
    }
  }
  for (const [group, required] of [
    ["spacing", ["space-1", "space-2", "space-3", "space-4"]],
    ["radius", ["radius-sm", "radius-md", "radius-lg"]],
  ]) {
    requireValue(isObject(tokens[group]), "missing " + group);
    for (const name of required)
      requireValue(isLength(tokens[group][name]), "missing " + name);
    for (const [name, value] of Object.entries(tokens[group])) {
      requireValue(
        isKey(name) && isLength(value),
        `${group}.${name} requires 0–256px`,
      );
    }
  }
  requireValue(isObject(tokens.typography), "missing typography");
  for (const name of typeStyles)
    requireValue(isObject(tokens.typography[name]), "missing " + name);
  for (const [name, value] of Object.entries(tokens.typography)) {
    requireValue(
      isKey(name) &&
        isObject(value) &&
        isLength(value.fontSize) &&
        Number.isFinite(Number(value.lineHeight)) &&
        Number(value.lineHeight) >= 1 &&
        Number(value.lineHeight) <= 3 &&
        Number.isFinite(Number(value.fontWeight)) &&
        Number(value.fontWeight) >= 100 &&
        Number(value.fontWeight) <= 900 &&
        typeof value.fontFamily === "string" &&
        /^[\p{L}\p{N} ,'"._-]{1,180}$/u.test(value.fontFamily),
      "invalid text style: " + name,
    );
  }
}

export function buildTokens(tokens) {
  validate(tokens);
  const lines = [
    "/* Generated from tokens.json. Rebuild with design.mjs tokens <project>. */",
  ];
  for (const [theme, values] of Object.entries(tokens.themes)) {
    lines.push(
      `${theme === "light" ? ":root, " : ""}[data-ds-theme="${theme}"] {`,
    );
    for (const [name, value] of Object.entries(values))
      lines.push(`  --ds-${name}: ${value};`);
    lines.push("}");
  }
  lines.push(":root {");
  for (const group of ["spacing", "radius"]) {
    for (const [name, value] of Object.entries(tokens[group]))
      lines.push(`  --ds-${name}: ${value};`);
  }
  for (const [name, style] of Object.entries(tokens.typography)) {
    for (const property of typeProperties) {
      const cssName = property.replace(
        /[A-Z]/g,
        (letter) => "-" + letter.toLowerCase(),
      );
      lines.push(`  --ds-${name}-${cssName}: ${style[property]};`);
    }
  }
  lines.push("}");
  return { css: lines.join("\n") + "\n", contrast: contrastReport(tokens) };
}

function luminance(hex) {
  const values = [1, 3, 5]
    .map((index) => parseInt(hex.slice(index, index + 2), 16) / 255)
    .map((value) =>
      value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
    );
  return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722;
}

function contrastReport(tokens) {
  const failures = [];
  for (const [theme, values] of Object.entries(tokens.themes)) {
    for (const [foreground, background, target] of [
      ["ink", "surface", 4.5],
      ["ink", "background", 4.5],
      ["muted", "surface", 4.5],
      ["muted", "background", 4.5],
      ["on-primary", "primary", 4.5],
      ["ring", "surface", 3],
    ]) {
      const a = luminance(values[foreground]),
        b = luminance(values[background]);
      const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
      if (ratio < target)
        failures.push({
          theme,
          foreground,
          background,
          ratio: Number(ratio.toFixed(2)),
          target,
        });
    }
  }
  return { pass: failures.length === 0, failures };
}
