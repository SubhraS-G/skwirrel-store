/**
 * Generates the static assets referenced by the app (favicon, apple touch
 * icon, logo, OG image, hero poster and seed placeholders).
 *
 * The repository shipped with an empty `public/` folder, so every image
 * reference 404'd. These are branded placeholders — swap them for real
 * photography/artwork when available, keeping the same file names.
 *
 * Run: node scripts/generate-assets.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  ORANGE,
  IVORY,
  BLACK,
  DARK,
  canvas,
  fillRect,
  drawText,
  drawCenteredText,
  measureText,
  encodePng,
  encodeIco,
} from "./lib/raster.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function save(relPath, buffer) {
  const fullPath = join(root, relPath);
  mkdirSync(dirname(fullPath), { recursive: true });
  writeFileSync(fullPath, buffer);
  console.log(`✓ ${relPath} (${buffer.length} bytes)`);
}

// ---------------------------------------------------------------------------
// Asset definitions
// ---------------------------------------------------------------------------

/** Orange square with an ivory "S" monogram — used for app icons. */
function monogram(size, bg = ORANGE, fg = IVORY) {
  const buf = canvas(size, size, bg);
  const scale = Math.floor(size / 8.6);
  const textW = measureText("S", scale);
  const textH = 7 * scale;
  drawText(buf, size, size, "S", Math.round((size - textW) / 2), Math.round((size - textH) / 2), scale, fg);
  return buf;
}

// favicon (48x48) — written to both /icons (linked from metadata) and /
// (the path browsers request by default)
{
  const size = 48;
  const png = encodePng(size, size, monogram(size));
  const ico = encodeIco(png, size);
  save("public/icons/favicon.ico", ico);
  save("public/favicon.ico", ico);
}

// apple touch icon (180x180)
{
  const size = 180;
  save("public/icons/apple-touch-icon.png", encodePng(size, size, monogram(size)));
}

// logo (512x512) — dark wordmark tile
{
  const size = 512;
  const buf = canvas(size, size, BLACK);
  const scale = 10;
  const textW = measureText("SKWIRREL", scale);
  const x = Math.round((size - textW) / 2);
  const y = 216;
  drawText(buf, size, size, "SK", x, y, scale, IVORY);
  drawText(buf, size, size, "W", x + 2 * 6 * scale, y, scale, ORANGE);
  drawText(buf, size, size, "IRREL", x + 3 * 6 * scale, y, scale, IVORY);
  fillRect(buf, size, size, x, y + 7 * scale + 24, textW, 6, ORANGE);
  save("public/icons/logo.png", encodePng(size, size, buf));
}

// social share / OG image (1200x630)
{
  const width = 1200;
  const height = 630;
  const buf = canvas(width, height, BLACK);
  fillRect(buf, width, height, 0, 0, width, 14, ORANGE);
  fillRect(buf, width, height, 0, height - 14, width, 14, ORANGE);

  const scale = 20;
  const textW = measureText("SKWIRREL", scale);
  const x = Math.round((width - textW) / 2);
  const y = 216;
  drawText(buf, width, height, "SK", x, y, scale, IVORY);
  drawText(buf, width, height, "W", x + 2 * 6 * scale, y, scale, ORANGE);
  drawText(buf, width, height, "IRREL", x + 3 * 6 * scale, y, scale, IVORY);

  fillRect(buf, width, height, x, y + 7 * scale + 40, textW, 8, ORANGE);

  drawCenteredText(
    buf,
    width,
    height,
    "BORN FROM ODISHA. MADE FOR THE WORLD.",
    y + 7 * scale + 90,
    4,
    IVORY
  );
  save("public/images/og/og-default.png", encodePng(width, height, buf));
}

// hero video poster (1920x1080)
{
  const width = 1920;
  const height = 1080;
  const buf = canvas(width, height, BLACK);
  fillRect(buf, width, height, 0, height - 40, width, 40, DARK);
  fillRect(buf, width, height, 0, height - 40, width, 6, ORANGE);

  const scale = 24;
  const textW = measureText("SKWIRREL", scale);
  const x = Math.round((width - textW) / 2);
  const y = 440;
  drawText(buf, width, height, "SK", x, y, scale, IVORY);
  drawText(buf, width, height, "W", x + 2 * 6 * scale, y, scale, ORANGE);
  drawText(buf, width, height, "IRREL", x + 3 * 6 * scale, y, scale, IVORY);
  fillRect(buf, width, height, x, y + 7 * scale + 36, textW, 8, ORANGE);
  drawCenteredText(buf, width, height, "VIDEO COMING SOON", y + 7 * scale + 80, 6, IVORY);
  save("public/images/hero-poster.png", encodePng(width, height, buf));
}

// Seed placeholders — product shots (portrait) and a blog cover (landscape)
function productPlaceholder(label) {
  const width = 1200;
  const height = 1500;
  const buf = canvas(width, height, DARK);
  // frame
  fillRect(buf, width, height, 60, 60, width - 120, 8, ORANGE);
  fillRect(buf, width, height, 60, height - 68, width - 120, 8, ORANGE);
  fillRect(buf, width, height, 60, 60, 8, height - 120, ORANGE);
  fillRect(buf, width, height, width - 68, 60, 8, height - 120, ORANGE);
  // centre mark
  const scale = 14;
  const textW = measureText(label, scale);
  drawText(
    buf,
    width,
    height,
    label,
    Math.round((width - textW) / 2),
    Math.round((height - 7 * scale) / 2),
    scale,
    IVORY
  );
  return buf;
}

save(
  "public/images/products/temple-gate-tee-1.png",
  encodePng(1200, 1500, productPlaceholder("TGT"))
);
save(
  "public/images/products/temple-gate-tee-2.png",
  encodePng(1200, 1500, productPlaceholder("TGT"))
);
save(
  "public/images/products/wheel-hoodie-1.png",
  encodePng(1200, 1500, productPlaceholder("WTH"))
);

{
  const width = 1200;
  const height = 630;
  const buf = canvas(width, height, DARK);
  fillRect(buf, width, height, 0, 0, width, 10, ORANGE);
  fillRect(buf, width, height, 0, height - 10, width, 10, ORANGE);
  const scale = 12;
  const textW = measureText("SAMBALPURI STORY", scale);
  drawText(
    buf,
    width,
    height,
    "SAMBALPURI STORY",
    Math.round((width - textW) / 2),
    Math.round((height - 7 * scale) / 2),
    scale,
    IVORY
  );
  save("public/images/blog/sambalpuri-story.png", encodePng(width, height, buf));
}

// Web app manifest (referenced from app/layout.tsx metadata)
save(
  "public/site.webmanifest",
  Buffer.from(
    JSON.stringify(
      {
        name: "SKWIRREL — Born From Odisha. Made For The World.",
        short_name: "SKWIRREL",
        description:
          "Premium cultural streetwear from Odisha, India. Every stitch tells a story of memory, music, language, and pride.",
        start_url: "/",
        display: "standalone",
        background_color: "#0A0A0A",
        theme_color: "#E85A1C",
        icons: [
          { src: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
          { src: "/icons/logo.png", sizes: "512x512", type: "image/png", purpose: "any" },
        ],
      },
      null,
      2
    )
  )
);

console.log("Done.");
