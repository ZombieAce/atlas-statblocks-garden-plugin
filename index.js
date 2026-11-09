/**
 * Build hooks for the Atlas Statblocks garden plugin (AGPL-3.0-only).
 *
 * - setupMarkdown: an `atlas-statblock` code fence becomes a mount point that
 *   carries its note's properties; the browser bundle draws the statblock there.
 * - setupEleventy: after the build, writes two small files beside the bundle:
 *     links.json      note path -> URL, so links inside statblocks resolve
 *     templates.json  custom statblock templates (see README)
 *
 * Runs at build time in Node. Uses only fs/path.
 */
const fs = require("fs");
const path = require("path");

const FENCE = "atlas-statblock";
const TEMPLATE_FENCE = "atlas-template";
const OUT_DIR = "plugins/atlas-statblocks";

/**
 * The payload goes in an attribute, not in the page's text: the garden builds
 * its search index from the text, and statblock JSON does not belong in it.
 */
function attributeJson(value) {
  return JSON.stringify(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** The note's path in the vault, as the statblock resolves its own links and images from. */
function vaultPathOf(page) {
  const stem = (page && (page.filePathStem || page.inputPath)) || "";
  return stem.replace(/^\.?\/?(src\/site\/)?notes\//, "").replace(/\.md$/i, "") + ".md";
}

function setupMarkdown(md) {
  const original =
    md.renderer.rules.fence ||
    ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options));

  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const language = (token.info || "").trim().split(/\s+/)[0];

    if (language === TEMPLATE_FENCE) {
      return ""; // a template note: its text is read by the build, never shown
    }
    if (language !== FENCE) {
      return original(tokens, idx, options, env, self);
    }

    const data = env || {};
    const payload = { path: vaultPathOf(data.page), frontmatter: data["dg-note-properties"] || {} };
    return `<div class="atlas-statblock-mount" data-statblock="${attributeJson(payload)}"></div>\n`;
  };
}

function walk(dir, found = []) {
  if (!fs.existsSync(dir)) return found;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, found);
    else found.push(full);
  }
  return found;
}

/** Templates shipped in this plugin's custom-templates/ folder plus any pasted into notes. */
function collectTemplates(pluginDir, notesDir) {
  const templates = [];

  for (const file of walk(path.join(pluginDir, "custom-templates"))) {
    if (file.endsWith(".atlastemplate")) {
      templates.push({ path: path.basename(file), text: fs.readFileSync(file, "utf8") });
    }
  }

  const fence = new RegExp("^[ \\t]*(`{3,}|~{3,})[ \\t]*" + TEMPLATE_FENCE + "[ \\t]*\\n([\\s\\S]*?)^[ \\t]*\\1[ \\t]*$", "gm");
  for (const file of walk(notesDir)) {
    if (!file.endsWith(".md")) continue;
    const text = fs.readFileSync(file, "utf8");
    if (!text.includes(TEMPLATE_FENCE)) continue;
    const base = path.basename(file, ".md");
    let n = 0;
    for (const match of text.matchAll(fence)) {
      n += 1;
      templates.push({ path: `${base}${n > 1 ? `-${n}` : ""}.atlastemplate`, text: match[2] });
    }
  }
  return templates;
}

const TEMPLATE_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*-[a-z0-9]{6}$/;

/** Warns at build time about a template the browser would refuse, so it is found here and not by a missing layout. */
function checkTemplate({ path: name, text }) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    console.warn(`[atlas-statblocks] ${name}: not valid JSON (${error.message}); it will be ignored`);
    return;
  }
  if (!parsed || parsed.format !== "atlas-statblock-template") {
    console.warn(`[atlas-statblocks] ${name}: not an Atlas statblock template (format is "${parsed && parsed.format}")`);
  } else if (!TEMPLATE_ID.test(String(parsed.id))) {
    console.warn(`[atlas-statblocks] ${name}: template id "${parsed.id}" is not an Atlas id (like "custom-j76sqt"); statblocks using it will fall back to the auto layout`);
  }
}

function setupEleventy(eleventyConfig, context) {
  const notesDir = path.join(process.cwd(), "src", "site", "notes");
  const templates = collectTemplates(context.pluginDir, notesDir);
  templates.forEach(checkTemplate);

  eleventyConfig.on("eleventy.after", ({ dir, results }) => {
    const out = path.join(dir.output, OUT_DIR);
    fs.mkdirSync(out, { recursive: true });

    const links = {};
    for (const result of results || []) {
      if (!result.url || !/[\\/]notes[\\/]/.test(result.inputPath || "")) continue;
      const key = result.inputPath
        .replace(/\\/g, "/")
        .replace(/^.*\/notes\//, "")
        .replace(/\.md$/i, "")
        .toLowerCase();
      links[key] = result.url;
    }
    fs.writeFileSync(path.join(out, "links.json"), JSON.stringify(links));
    fs.writeFileSync(path.join(out, "templates.json"), JSON.stringify(templates));
  });
}

module.exports = { setupMarkdown, setupEleventy };
