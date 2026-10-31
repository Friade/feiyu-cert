import { spawn } from "node:child_process";
import { writeFileSync, mkdtempSync, rmSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const EDGE =
  process.env.EDGE ||
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const argv = process.argv.slice(2);
const url = argv[0] || "http://127.0.0.1:8765/";
const width = Number(argv[1] || 1440);
const height = Number(argv[2] || 1000);
const out = argv[3] || "ref/cdp-shot.png";
const preview = argv.includes("--preview");
const stamp = argv.includes("--stamp");
const exportMode = argv.includes("--export");
const downloadMode = argv.includes("--download");
const scriptArg = argv.find((item) => item.startsWith("--script="));
const scriptPath = scriptArg ? scriptArg.slice("--script=".length) : null;
const mobile = argv.includes("--mobile") || width <= 560;
const port = 9300 + Math.floor(Math.random() * 500);
const profile = mkdtempSync(join(tmpdir(), "feiyu-edge-"));

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const child = spawn(
  EDGE,
  [
    "--headless=new",
    "--no-sandbox",
    "--disable-gpu",
    "--hide-scrollbars",
    "--no-first-run",
    "--no-default-browser-check",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    `--window-size=${width},${height}`,
    "about:blank"
  ],
  { stdio: "ignore", windowsHide: true }
);

let ws;
let seq = 0;
const pending = new Map();

function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++seq;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
}

function logEvent(message) {
  if (message.method === "Runtime.exceptionThrown") {
    const detail = message.params.exceptionDetails;
    console.error("PAGE EXCEPTION:", detail.text, detail.exception?.description || "");
  }
  if (message.method === "Log.entryAdded") {
    const entry = message.params.entry;
    if (entry.level === "error" || entry.level === "warning") {
      console.error(`PAGE ${entry.level.toUpperCase()}:`, entry.text, entry.url || "");
    }
  }
  if (message.method === "Runtime.consoleAPICalled") {
    const type = message.params.type;
    if (type === "error" || type === "warning") {
      const text = message.params.args
        .map((arg) => arg.value ?? arg.description ?? "")
        .join(" ");
      console.error(`CONSOLE ${type.toUpperCase()}:`, text);
    }
  }
}

async function waitForCdp() {
  for (let i = 0; i < 80; i += 1) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (res.ok) return;
    } catch {
      /* retry */
    }
    await sleep(150);
  }
  throw new Error("CDP endpoint did not start");
}

async function loadPage() {
  await waitForCdp();
  const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const page = list.find((target) => target.type === "page");
  if (!page) throw new Error("No page target");
  ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve, { once: true });
    ws.addEventListener("error", reject, { once: true });
  });
  ws.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message));
      else resolve(message.result);
      return;
    }
    logEvent(message);
  });

  await send("Page.enable");
  await send("Runtime.enable");
  await send("Log.enable");
  await send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile
  });
  if (mobile) {
    await send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
  }
  await send("Page.navigate", { url });
  await sleep(1600);
  await send("Runtime.evaluate", {
    expression: "document.fonts && document.fonts.ready",
    awaitPromise: true
  });
  await sleep(300);
}

async function capture(path) {
  const shot = await send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
    captureBeyondViewport: false
  });
  writeFileSync(path, Buffer.from(shot.data, "base64"));
  console.log("wrote", path);
}

async function metrics() {
  const result = await send("Runtime.evaluate", {
    returnByValue: true,
    expression: `(() => {
      const rect = (sel) => {
        const el = document.querySelector(sel);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
      };
      return {
        inner: [innerWidth, innerHeight],
        client: [document.documentElement.clientWidth, document.documentElement.clientHeight],
        scrollWidth: document.documentElement.scrollWidth,
        bodyScrollWidth: document.body.scrollWidth,
        dpr: devicePixelRatio,
        stage: rect("#stage"),
        panel: rect(".panel"),
        toolbar: rect(".stage-toolbar"),
        actions: rect(".stage-actions"),
        input: rect("#titleInput"),
        title: rect(".cert-title"),
        photo: rect("#photoModule"),
        photoFrame: rect(".photo-frame"),
        photoLabel: rect("#photoModule .module-label"),
        fish: rect("#fishModule"),
        fishFrame: rect(".fish-frame"),
        fishLabel: rect("#fishModule .module-label"),
        preview: document.body.classList.contains("preview-mode")
      };
    })()`
  });
  console.log(JSON.stringify(result.result.value, null, 2));
}

try {
  await loadPage();
  if (scriptPath) {
    const expression = readFileSync(scriptPath, "utf8");
    await send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true
    });
    await sleep(500);
  }
  await metrics();
  await capture(out);
  if (exportMode) {
    const result = await send("Runtime.evaluate", {
      expression: "window.__feiyuRenderCertificate(2).then((canvas) => canvas.toDataURL('image/png'))",
      awaitPromise: true,
      returnByValue: true
    });
    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.text || "export render failed");
    }
    const dataUrl = result.result && result.result.value;
    if (!dataUrl) throw new Error("empty export data");
    const exportPath = out.replace(/\.png$/i, "-export.png");
    const bytes = Buffer.from(dataUrl.split(",")[1], "base64");
    writeFileSync(exportPath, bytes);
    console.log("wrote", exportPath, bytes.length, "bytes");
  }
  if (downloadMode) {
    const downloadPath = out.replace(/\.png$/i, "-downloads");
    mkdirSync(downloadPath, { recursive: true });
    await send("Browser.setDownloadBehavior", {
      behavior: "allow",
      downloadPath,
      eventsEnabled: true
    });
    await send("Runtime.evaluate", {
      expression: "document.getElementById('exportBtn').click()"
    });
    await sleep(3500);
    console.log("downloads:", readdirSync(downloadPath));
  }
  if (stamp) {
    await send("Runtime.evaluate", {
      expression: "document.getElementById('stampBtn').click()"
    });
    await sleep(120);
    await capture(out.replace(/\.png$/i, "-stamp1.png"));
    await sleep(260);
    await capture(out.replace(/\.png$/i, "-stamp2.png"));
    await sleep(460);
    await capture(out.replace(/\.png$/i, "-stamp3.png"));
  }
  if (preview) {
    await send("Runtime.evaluate", {
      expression: "document.getElementById('previewBtn').click()"
    });
    await sleep(700);
    await metrics();
    await capture(out.replace(/\.png$/i, "-preview.png"));
  }
} finally {
  try {
    await send("Browser.close");
  } catch {
    /* ignore */
  }
  if (ws) ws.close();
  child.kill();
  await sleep(200);
  try {
    rmSync(profile, { recursive: true, force: true });
  } catch {
    /* ignore */
  }
}