/**
 * Generates public/videos/hero.mp4 — the background video for the homepage
 * hero. The <video> in HeroSection.tsx points at this file; without it the
 * browser logs a 404 on every home page load.
 *
 * This renders a seamless looping animation (drifting orange glow behind the
 * wordmark) entirely in Node and pipes the frames into ffmpeg.
 *
 * Requires ffmpeg: either `npm i ffmpeg-static` or ffmpeg on PATH.
 *
 * Run: node scripts/generate-hero-video.mjs
 */
import { spawn, execSync } from "node:child_process";
import { createRequire } from "node:module";
import { existsSync, mkdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  ORANGE,
  IVORY,
  BLACK,
  canvas,
  fillRect,
  drawText,
  measureText,
  encodePng,
} from "./lib/raster.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);

function resolveFfmpeg() {
  try {
    const p = require("ffmpeg-static");
    if (p && existsSync(p)) return p;
  } catch {}
  try {
    execSync("ffmpeg -version", { stdio: "ignore" });
    return "ffmpeg";
  } catch {}
  return null;
}

const ffmpeg = resolveFfmpeg();
if (!ffmpeg) {
  console.error("ffmpeg not found. Install it with: npm i ffmpeg-static");
  process.exit(1);
}

const WIDTH = 1280;
const HEIGHT = 720;
const FPS = 24;
const SECONDS = 8; // multiple of the glow orbit period → seamless loop
const FRAMES = FPS * SECONDS;

const outPath = join(root, "public/videos/hero.mp4");
mkdirSync(dirname(outPath), { recursive: true });

const ff = spawn(
  ffmpeg,
  [
    "-y",
    "-f", "image2pipe",
    "-framerate", String(FPS),
    "-i", "-",
    "-c:v", "libx264",
    "-preset", "slow",
    "-crf", "30",
    "-pix_fmt", "yuv420p",
    "-movflags", "+faststart",
    outPath,
  ],
  { stdio: ["pipe", "ignore", "pipe"] }
);

let ffErr = "";
ff.stderr.on("data", (d) => (ffErr += d.toString()));

const ffDone = new Promise((resolve, reject) => {
  ff.on("close", (code) =>
    code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${ffErr.slice(-800)}`))
  );
  ff.on("error", reject);
});

const scale = 16;
const textW = measureText("SKWIRREL", scale);
const textX = Math.round((WIDTH - textW) / 2);
const textY = 300;
const barY = textY + 7 * scale + 40;

// Pre-render the static foreground (text + bar) on its own layer so per-frame
// work is just the glow composite.
const foreground = canvas(WIDTH, HEIGHT, null);
drawText(foreground, WIDTH, HEIGHT, "SK", textX, textY, scale, IVORY);
drawText(foreground, WIDTH, HEIGHT, "W", textX + 2 * 6 * scale, textY, scale, ORANGE);
drawText(foreground, WIDTH, HEIGHT, "IRREL", textX + 3 * 6 * scale, textY, scale, IVORY);
fillRect(foreground, WIDTH, HEIGHT, textX, barY, textW, 8, ORANGE);

const subScale = 4;
const subText = "BORN FROM ODISHA. MADE FOR THE WORLD.";
const subW = measureText(subText, subScale);
const subX = Math.round((WIDTH - subW) / 2);
const subY = barY + 56;
drawText(foreground, WIDTH, HEIGHT, subText, subX, subY, subScale, IVORY);

function renderFrame(frame) {
  const buf = canvas(WIDTH, HEIGHT, BLACK);
  const t = (frame / FRAMES) * Math.PI * 2;

  // Two orange glows orbiting with an integer number of cycles per loop.
  const glows = [
    {
      x: WIDTH * 0.5 + Math.cos(t) * WIDTH * 0.22,
      y: HEIGHT * 0.5 + Math.sin(t) * HEIGHT * 0.18,
      radius: WIDTH * 0.55,
      strength: 0.22,
    },
    {
      x: WIDTH * 0.5 - Math.cos(t * 2) * WIDTH * 0.28,
      y: HEIGHT * 0.45 - Math.sin(t * 2) * HEIGHT * 0.22,
      radius: WIDTH * 0.4,
      strength: 0.14,
    },
  ];

  for (const glow of glows) {
    const x0 = Math.max(0, Math.floor(glow.x - glow.radius));
    const x1 = Math.min(WIDTH, Math.ceil(glow.x + glow.radius));
    const y0 = Math.max(0, Math.floor(glow.y - glow.radius));
    const y1 = Math.min(HEIGHT, Math.ceil(glow.y + glow.radius));
    for (let y = y0; y < y1; y++) {
      const dy = y - glow.y;
      for (let x = x0; x < x1; x++) {
        const dx = x - glow.x;
        const d = Math.sqrt(dx * dx + dy * dy) / glow.radius;
        if (d >= 1) continue;
        const falloff = (1 - d) * (1 - d) * glow.strength;
        const i = (y * WIDTH + x) * 4;
        buf[i] = Math.min(255, buf[i] + ORANGE[0] * falloff);
        buf[i + 1] = Math.min(255, buf[i + 1] + ORANGE[1] * falloff);
        buf[i + 2] = Math.min(255, buf[i + 2] + ORANGE[2] * falloff);
      }
    }
  }

  // Composite the foreground over the glow (alpha = presence of the glyph).
  for (let i = 0; i < buf.length; i += 4) {
    const a = foreground[i + 3] / 255;
    if (a === 0) continue;
    buf[i] = buf[i] * (1 - a) + foreground[i] * a;
    buf[i + 1] = buf[i + 1] * (1 - a) + foreground[i + 1] * a;
    buf[i + 2] = buf[i + 2] * (1 - a) + foreground[i + 2] * a;
    buf[i + 3] = 255;
  }

  return buf;
}

async function main() {
  for (let frame = 0; frame < FRAMES; frame++) {
    const png = encodePng(WIDTH, HEIGHT, renderFrame(frame));
    if (!ff.stdin.write(png)) {
      await new Promise((r) => ff.stdin.once("drain", r));
    }
  }
  ff.stdin.end();
  await ffDone;
  console.log(
    `✓ public/videos/hero.mp4 (${(statSync(outPath).size / 1024 / 1024).toFixed(2)} MB, ${SECONDS}s @ ${FPS}fps)`
  );
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
