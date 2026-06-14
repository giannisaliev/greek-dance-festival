// Client-side certificate rendering. Each template draws onto a <canvas> at A4
// portrait resolution so it can be exported to a crisp PDF. These functions use
// the DOM Canvas/Image APIs and must only run in the browser.

export type CertificateTemplateId = "classic" | "flyer" | "elegant" | "festive";

export const CERTIFICATE_TEMPLATES: {
  id: CertificateTemplateId;
  name: string;
  description: string;
}[] = [
  { id: "classic", name: "Classic Gold", description: "Cream parchment with a gold frame and the flyer at the bottom." },
  { id: "flyer", name: "Full Flyer", description: "The event flyer fills the whole page with the name in white over it." },
  { id: "elegant", name: "Elegant Navy", description: "Deep navy with gold accents — minimal and formal, no flyer." },
  { id: "festive", name: "Festival Blue", description: "Blue festival gradient with gold and the flyer framed below." },
];

export const DEFAULT_CERTIFICATE_TEMPLATE: CertificateTemplateId = "classic";

export const EVENT_DATE = "14th June 2026";
export const EVENT_LOCATION = "Thessaloniki, Greece";
export const DANCE_NAME = "Zeibekiko";

const FLYER_SRC = "/Guiness%20flyer.png";
const CERTIFICATE_SRC = "/Certificate.jpg";
const LOGO_SRC = "/GUINESS.png";

// A4 portrait at ~300 DPI (logical drawing size)
const W = 2480;
const H = 3508;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// Centered text with manual letter spacing.
function drawSpacedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  y: number,
  spacing: number
) {
  const chars = [...text];
  const widths = chars.map((ch) => ctx.measureText(ch).width + spacing);
  const total = widths.reduce((a, b) => a + b, 0) - spacing;
  let x = centerX - total / 2;
  const prevAlign = ctx.textAlign;
  ctx.textAlign = "left";
  chars.forEach((ch, i) => {
    ctx.fillText(ch, x, y);
    x += widths[i];
  });
  ctx.textAlign = prevAlign;
}

// Set a serif font that shrinks until the text fits within maxWidth.
function fitName(
  ctx: CanvasRenderingContext2D,
  text: string,
  basePx: number,
  minPx: number,
  maxWidth: number
) {
  let size = basePx;
  ctx.font = `bold ${size}px ${SERIF}`;
  while (ctx.measureText(text).width > maxWidth && size > minPx) {
    size -= 6;
    ctx.font = `bold ${size}px ${SERIF}`;
  }
  return size;
}

// Draw an image so it covers the whole target rectangle (like CSS object-fit: cover).
function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const scale = Math.max(w / img.width, h / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

const SERIF = "Georgia, 'Times New Roman', serif";

/* ---------------- Templates ---------------- */

async function drawClassic(ctx: CanvasRenderingContext2D, name: string) {
  const cx = W / 2;
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#fffdf8");
  bg.addColorStop(1, "#fbf3e3");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const gold = "#b8860b";
  const goldLight = "#d4af37";
  ctx.strokeStyle = gold;
  ctx.lineWidth = 14;
  ctx.strokeRect(90, 90, W - 180, H - 180);
  ctx.strokeStyle = goldLight;
  ctx.lineWidth = 5;
  ctx.strokeRect(130, 130, W - 260, H - 260);

  ctx.fillStyle = goldLight;
  const corner = (x: number, y: number, dx: number, dy: number) => {
    ctx.beginPath();
    ctx.arc(x, y, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(x, y - 4, dx, 8);
    ctx.fillRect(x - 4, y, 8, dy);
  };
  corner(170, 170, 120, 120);
  corner(W - 170, 170, -120, 120);
  corner(170, H - 170, 120, -120);
  corner(W - 170, H - 170, -120, -120);

  try {
    const logo = await loadImage(LOGO_SRC);
    const lh = 300;
    const lw = (logo.width / logo.height) * lh;
    ctx.drawImage(logo, cx - lw / 2, 250, lw, lh);
  } catch {}

  ctx.textAlign = "center";
  ctx.fillStyle = "#7a5b10";
  ctx.font = `bold 150px ${SERIF}`;
  drawSpacedText(ctx, "CERTIFICATE", cx, 720, 6);
  ctx.fillStyle = gold;
  ctx.font = `bold 70px ${SERIF}`;
  drawSpacedText(ctx, "OF ACHIEVEMENT", cx, 820, 22);

  ctx.strokeStyle = goldLight;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(cx - 360, 900);
  ctx.lineTo(cx + 360, 900);
  ctx.stroke();
  ctx.fillStyle = goldLight;
  ctx.beginPath();
  ctx.arc(cx, 900, 12, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#444";
  ctx.font = `italic 64px ${SERIF}`;
  ctx.fillText("This is proudly presented to", cx, 1050);

  ctx.fillStyle = "#1a2a44";
  fitName(ctx, name, 150, 70, W - 600);
  ctx.fillText(name, cx, 1250);

  const nameW = Math.min(ctx.measureText(name).width + 120, W - 500);
  ctx.strokeStyle = goldLight;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(cx - nameW / 2, 1320);
  ctx.lineTo(cx + nameW / 2, 1320);
  ctx.stroke();

  ctx.fillStyle = "#333";
  ctx.font = `52px ${SERIF}`;
  ctx.fillText("for being part of the official", cx, 1470);
  ctx.fillStyle = gold;
  ctx.font = `bold 96px ${SERIF}`;
  drawSpacedText(ctx, "GUINNESS WORLD RECORD", cx, 1600, 4);
  ctx.fillStyle = "#333";
  ctx.font = `52px ${SERIF}`;
  ctx.fillText(`in ${DANCE_NAME}`, cx, 1700);

  ctx.fillStyle = "#1a2a44";
  ctx.font = `bold 58px ${SERIF}`;
  ctx.fillText(`${EVENT_DATE}   •   ${EVENT_LOCATION}`, cx, 1830);

  try {
    const flyer = await loadImage(FLYER_SRC);
    const fh = 1180;
    const fw = (flyer.width / flyer.height) * fh;
    const fx = cx - fw / 2;
    const fy = 1930;
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.25)";
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 12;
    ctx.fillStyle = "#fff";
    ctx.fillRect(fx - 16, fy - 16, fw + 32, fh + 32);
    ctx.restore();
    ctx.drawImage(flyer, fx, fy, fw, fh);
    ctx.strokeStyle = goldLight;
    ctx.lineWidth = 4;
    ctx.strokeRect(fx - 16, fy - 16, fw + 32, fh + 32);
  } catch {}

  ctx.fillStyle = "#7a5b10";
  ctx.font = `bold 50px ${SERIF}`;
  ctx.fillText("Greek Dance Festival 2026", cx, H - 240);
  ctx.fillStyle = "#999";
  ctx.font = `italic 38px ${SERIF}`;
  ctx.fillText(`${DANCE_NAME} Guinness World Record Attempt`, cx, H - 180);
}

async function drawFlyer(ctx: CanvasRenderingContext2D, name: string) {
  const cx = W / 2;
  // Certificate.jpg fills the whole page
  ctx.fillStyle = "#0a142c";
  ctx.fillRect(0, 0, W, H);
  try {
    const cert = await loadImage(CERTIFICATE_SRC);
    drawImageCover(ctx, cert, 0, 0, W, H);
  } catch {}

  // Translucent panel over the artwork so white text stays legible
  const panelY = H * 0.5;
  const panelH = H * 0.31;
  const panelX = W * 0.08;
  const panelW = W * 0.84;
  ctx.save();
  ctx.fillStyle = "rgba(8, 16, 36, 0.80)";
  roundRect(ctx, panelX, panelY, panelW, panelH, 50);
  ctx.fill();
  ctx.strokeStyle = "rgba(212,175,55,0.85)";
  ctx.lineWidth = 5;
  roundRect(ctx, panelX + 18, panelY + 18, panelW - 36, panelH - 36, 38);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.textAlign = "center";
  ctx.shadowColor = "rgba(0,0,0,0.6)";
  ctx.shadowBlur = 12;

  let y = panelY + 130;
  ctx.fillStyle = "#f5e3a3";
  ctx.font = `bold 56px ${SERIF}`;
  drawSpacedText(ctx, "THIS CERTIFIES THAT", cx, y, 14);

  y += 200;
  ctx.fillStyle = "#ffffff";
  fitName(ctx, name, 150, 70, panelW - 200);
  ctx.fillText(name, cx, y);

  y += 150;
  ctx.fillStyle = "#ffffff";
  ctx.font = `48px ${SERIF}`;
  ctx.fillText("broke the Guinness World Record in", cx, y);
  y += 90;
  ctx.fillStyle = "#f5e3a3";
  ctx.font = `bold 70px ${SERIF}`;
  ctx.fillText(DANCE_NAME, cx, y);

  y += 100;
  ctx.fillStyle = "#ffffff";
  ctx.font = `40px ${SERIF}`;
  ctx.fillText(`${EVENT_DATE}  ·  ${EVENT_LOCATION}`, cx, y);

  y += 90;
  ctx.fillStyle = "#f5e3a3";
  ctx.font = `italic 44px ${SERIF}`;
  ctx.fillText("Number of participants: 830", cx, y);
  ctx.restore();
}

async function drawElegant(ctx: CanvasRenderingContext2D, name: string) {
  const cx = W / 2;
  const navy = "#0f1f3d";
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#13294f");
  bg.addColorStop(1, "#0a1730");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const goldLight = "#d4af37";
  // Thin gold frame
  ctx.strokeStyle = goldLight;
  ctx.lineWidth = 6;
  ctx.strokeRect(110, 110, W - 220, H - 220);
  ctx.lineWidth = 2;
  ctx.strokeRect(150, 150, W - 300, H - 300);

  try {
    const logo = await loadImage(LOGO_SRC);
    const lh = 320;
    const lw = (logo.width / logo.height) * lh;
    ctx.drawImage(logo, cx - lw / 2, 360, lw, lh);
  } catch {}

  ctx.textAlign = "center";
  ctx.fillStyle = goldLight;
  ctx.font = `bold 130px ${SERIF}`;
  drawSpacedText(ctx, "CERTIFICATE", cx, 980, 10);
  ctx.fillStyle = "#cdd7e6";
  ctx.font = `48px ${SERIF}`;
  drawSpacedText(ctx, "OF ACHIEVEMENT", cx, 1070, 26);

  // ornamental divider
  ctx.strokeStyle = goldLight;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx - 300, 1170);
  ctx.lineTo(cx - 40, 1170);
  ctx.moveTo(cx + 40, 1170);
  ctx.lineTo(cx + 300, 1170);
  ctx.stroke();
  ctx.fillStyle = goldLight;
  ctx.save();
  ctx.translate(cx, 1170);
  ctx.rotate(Math.PI / 4);
  ctx.fillRect(-18, -18, 36, 36);
  ctx.restore();

  ctx.fillStyle = "#aebbcf";
  ctx.font = `italic 60px ${SERIF}`;
  ctx.fillText("Awarded to", cx, 1450);

  ctx.fillStyle = "#ffffff";
  fitName(ctx, name, 170, 80, W - 600);
  ctx.fillText(name, cx, 1660);

  const nameW = Math.min(ctx.measureText(name).width + 140, W - 500);
  ctx.strokeStyle = goldLight;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx - nameW / 2, 1740);
  ctx.lineTo(cx + nameW / 2, 1740);
  ctx.stroke();

  ctx.fillStyle = "#cdd7e6";
  ctx.font = `54px ${SERIF}`;
  ctx.fillText("for taking part in setting the", cx, 1920);
  ctx.fillStyle = goldLight;
  ctx.font = `bold 92px ${SERIF}`;
  drawSpacedText(ctx, "GUINNESS WORLD RECORD", cx, 2060, 4);
  ctx.fillStyle = "#cdd7e6";
  ctx.font = `54px ${SERIF}`;
  ctx.fillText(`in ${DANCE_NAME}`, cx, 2170);

  // Date / location cards
  ctx.fillStyle = "#ffffff";
  ctx.font = `bold 56px ${SERIF}`;
  ctx.fillText(EVENT_DATE, cx, 2560);
  ctx.fillStyle = goldLight;
  ctx.font = `40px ${SERIF}`;
  ctx.fillText("DATE", cx, 2480);
  ctx.fillStyle = "#ffffff";
  ctx.font = `bold 56px ${SERIF}`;
  ctx.fillText(EVENT_LOCATION, cx, 2760);
  ctx.fillStyle = goldLight;
  ctx.font = `40px ${SERIF}`;
  ctx.fillText("LOCATION", cx, 2680);

  ctx.fillStyle = "#8c9bb5";
  ctx.font = `italic 40px ${SERIF}`;
  ctx.fillText("Greek Dance Festival 2026", cx, H - 260);
}

async function drawFestive(ctx: CanvasRenderingContext2D, name: string) {
  const cx = W / 2;
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#1e3a8a");
  bg.addColorStop(0.5, "#1d4ed8");
  bg.addColorStop(1, "#2563eb");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const goldLight = "#fcd34d";
  // gold double frame
  ctx.strokeStyle = goldLight;
  ctx.lineWidth = 12;
  ctx.strokeRect(100, 100, W - 200, H - 200);
  ctx.strokeStyle = "rgba(255,255,255,0.5)";
  ctx.lineWidth = 3;
  ctx.strokeRect(140, 140, W - 280, H - 280);

  ctx.textAlign = "center";
  ctx.fillStyle = goldLight;
  ctx.font = `bold 150px ${SERIF}`;
  ctx.fillText("🏆", cx, 470);

  ctx.fillStyle = "#ffffff";
  ctx.font = `bold 130px ${SERIF}`;
  drawSpacedText(ctx, "CERTIFICATE", cx, 700, 8);
  ctx.fillStyle = goldLight;
  ctx.font = `bold 62px ${SERIF}`;
  drawSpacedText(ctx, "OF ACHIEVEMENT", cx, 800, 22);

  ctx.fillStyle = "#dbe7ff";
  ctx.font = `italic 58px ${SERIF}`;
  ctx.fillText("This certifies that", cx, 990);

  ctx.fillStyle = "#ffffff";
  fitName(ctx, name, 150, 70, W - 600);
  ctx.fillText(name, cx, 1180);

  const nameW = Math.min(ctx.measureText(name).width + 120, W - 500);
  ctx.strokeStyle = goldLight;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(cx - nameW / 2, 1250);
  ctx.lineTo(cx + nameW / 2, 1250);
  ctx.stroke();

  ctx.fillStyle = "#dbe7ff";
  ctx.font = `50px ${SERIF}`;
  ctx.fillText("broke the", cx, 1390);
  ctx.fillStyle = goldLight;
  ctx.font = `bold 90px ${SERIF}`;
  drawSpacedText(ctx, "GUINNESS WORLD RECORD", cx, 1510, 4);
  ctx.fillStyle = "#dbe7ff";
  ctx.font = `50px ${SERIF}`;
  ctx.fillText(`in ${DANCE_NAME}  ·  ${EVENT_DATE}  ·  ${EVENT_LOCATION}`, cx, 1610);

  try {
    const flyer = await loadImage(FLYER_SRC);
    const fh = 1450;
    const fw = (flyer.width / flyer.height) * fh;
    const fx = cx - fw / 2;
    const fy = 1730;
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.35)";
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 16;
    ctx.fillStyle = "#fff";
    roundRect(ctx, fx - 18, fy - 18, fw + 36, fh + 36, 24);
    ctx.fill();
    ctx.restore();
    ctx.save();
    roundRect(ctx, fx, fy, fw, fh, 14);
    ctx.clip();
    ctx.drawImage(flyer, fx, fy, fw, fh);
    ctx.restore();
    ctx.strokeStyle = goldLight;
    ctx.lineWidth = 5;
    roundRect(ctx, fx - 18, fy - 18, fw + 36, fh + 36, 24);
    ctx.stroke();
  } catch {}

  ctx.fillStyle = "#ffffff";
  ctx.font = `bold 48px ${SERIF}`;
  ctx.fillText("Greek Dance Festival 2026", cx, H - 230);
}

const DRAWERS: Record<
  CertificateTemplateId,
  (ctx: CanvasRenderingContext2D, name: string) => Promise<void>
> = {
  classic: drawClassic,
  flyer: drawFlyer,
  elegant: drawElegant,
  festive: drawFestive,
};

export async function buildCertificateCanvas(
  templateId: CertificateTemplateId,
  name: string,
  scale = 1
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(W * scale);
  canvas.height = Math.round(H * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.scale(scale, scale);
  const draw = DRAWERS[templateId] || drawClassic;
  await draw(ctx, name);
  return canvas;
}
