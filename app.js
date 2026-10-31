(() => {
  "use strict";

  /* ---------- DOM ---------- */
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const stageArea = $("#stageArea");
  const stage = $("#stage");
  const certScaler = $("#certScaler");
  const cert = $("#cert");
  const toast = $("#toast");

  const titleView = $("#titleView");
  const numberView = $("#numberView");
  const bodyView = $("#bodyView");
  const issuerView = $("#issuerView");
  const dateView = $("#dateView");
  const footerView = $("#footerView");
  const seal = $("#seal");
  const sealText = $("#sealText");

  const photoModule = $("#photoModule");
  const fishModule = $("#fishModule");
  const portraitImg = $("#portraitImg");
  const fishImg = $("#fishImg");
  const photoLabel = $("#photoLabel");
  const fishLabel = $("#fishLabel");
  const ownerView = $("#ownerView");
  const fishNameView = $("#fishNameView");
  const signBlock = $("#signBlock");

  const titleInput = $("#titleInput");
  const numberInput = $("#numberInput");
  const bodyInput = $("#bodyInput");
  const issuerInput = $("#issuerInput");
  const dateInput = $("#dateInput");
  const ownerInput = $("#ownerInput");
  const fishNameInput = $("#fishNameInput");
  const footerInput = $("#footerInput");
  const sealInput = $("#sealInput");

  const titleFont = $("#titleFont");
  const bodyFont = $("#bodyFont");
  const titleColor = $("#titleColor");
  const bodyColor = $("#bodyColor");
  const paperColor = $("#paperColor");
  const sealColor = $("#sealColor");
  const titleSize = $("#titleSize");
  const bodySize = $("#bodySize");
  const titleSizeView = $("#titleSizeView");
  const bodySizeView = $("#bodySizeView");

  const portraitFile = $("#portraitFile");
  const fishFile = $("#fishFile");
  const photoToggle = $("#photoToggle");
  const fishToggle = $("#fishToggle");
  const photoRatio = $("#photoRatio");
  const fishRatio = $("#fishRatio");
  const photoLabelInput = $("#photoLabelInput");
  const fishLabelInput = $("#fishLabelInput");
  const photoLabelToggle = $("#photoLabelToggle");
  const fishLabelToggle = $("#fishLabelToggle");
  const photoScale = $("#photoScale");
  const fishScale = $("#fishScale");
  const photoScaleView = $("#photoScaleView");
  const fishScaleView = $("#fishScaleView");

  const signLayout = $("#signLayout");
  const signFont = $("#signFont");
  const signColor = $("#signColor");
  const signToggle = $("#signToggle");

  const soundToggle = $("#soundToggle");
  const stampBtn = $("#stampBtn");
  const saveBtn = $("#saveBtn");
  const resetBtn = $("#resetBtn");
  const centerBtn = $("#centerBtn");
  const previewBtn = $("#previewBtn");
  const exportBtn = $("#exportBtn");

  const modules = [photoModule, fishModule];
  const STORAGE_KEY = "feiyu-cert-draft-v1";

  const DEFAULT_PHOTO = {
    x: 74,
    y: 640,
    scale: 100,
    visible: true,
    ratio: "1 / 1",
    label: "照片",
    labelVisible: true
  };
  const DEFAULT_FISH = {
    x: 500,
    y: 645,
    scale: 100,
    visible: true,
    ratio: "4 / 3",
    label: "附图",
    labelVisible: true
  };

  const DEFAULTS = {
    title: "肥鱼证",
    number: "No. 0001",
    body: "兹证明\n本鱼\n已有主人\n图片为证",
    issuer: "肥鱼事务所",
    date: "2026 年 11 月",
    owner: "",
    fishName: "",
    signLayout: "below",
    signFont: "'STSong','SimSun',serif",
    signColor: "#6f6256",
    signVisible: true,
    footer: "本证永久有效，遗失不补",
    seal: "鱼印",
    titleFont: "'Ma Shan Zheng','STXingkai','KaiTi','STKaiti',serif",
    bodyFont: "'ZCOOL XiaoWei','STSong','SimSun',serif",
    titleColor: "#5b6798",
    bodyColor: "#6b6570",
    paperColor: "#f8ecdd",
    sealColor: "#c8453a",
    titleSize: 112,
    bodySize: 46,
    photo: { ...DEFAULT_PHOTO },
    fish: { ...DEFAULT_FISH },
    sound: false
  };

  /* ---------- 小工具 ---------- */
  const ESCAPE_MAP = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  };
  const escapeHtml = (value) =>
    String(value).replace(/[&<>"']/g, (ch) => ESCAPE_MAP[ch]);

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  let toastTimer = 0;
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2600);
  }

  /* ---------- 字体缩放适配 ---------- */
  function fitStage() {
    if (!stageArea || !stage || !certScaler) return;
    const rect = stageArea.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const pad = 4;
    const scale = Math.max(
      0.08,
      Math.min((rect.width - pad * 2) / 1000, (rect.height - pad * 2) / 1400)
    );
    stage.style.width = `${1000 * scale}px`;
    stage.style.height = `${1400 * scale}px`;
    certScaler.style.transform = `scale(${scale})`;
    stage.dataset.scale = String(scale);
  }

  /* ---------- 渲染 ---------- */
  function renderTitle(value) {
    const chars = Array.from((value || "肥鱼证").trim() || "肥鱼证");
    titleView.innerHTML = chars
      .map((ch) => `<span>${escapeHtml(ch)}</span>`)
      .join("");
  }

  function renderBody(value) {
    const lines = String(value || "").split(/\r?\n/).slice(0, 6);
    if (!lines.length) lines.push("");
    bodyView.innerHTML = lines
      .map((line) => {
        const chars = Array.from(line);
        const content = chars.length
          ? chars
              .map((ch) =>
                ch === " " ? `<span>&nbsp;</span>` : `<span>${escapeHtml(ch)}</span>`
              )
              .join("")
          : "&nbsp;";
        return `<div class="cert-line">${content}</div>`;
      })
      .join("");
  }

  function renderSeal(value) {
    const chars = Array.from((value || "鱼印").trim() || "鱼印").slice(0, 4);
    sealText.innerHTML = chars
      .map((ch) => `<span>${escapeHtml(ch)}</span>`)
      .join("");
    sealText.classList.toggle("grid", chars.length > 2);
  }

  function applyStyles() {
    cert.style.setProperty("--title-color", titleColor.value);
    cert.style.setProperty("--body-color", bodyColor.value);
    cert.style.setProperty("--paper", paperColor.value);
    cert.style.setProperty("--seal-color", sealColor.value);

    titleView.style.fontFamily = titleFont.value;
    bodyView.style.fontFamily = bodyFont.value;

    const ts = Number(titleSize.value);
    const bs = Number(bodySize.value);
    titleView.style.fontSize = `${ts}px`;
    bodyView.style.fontSize = `${bs}px`;
    bodyView.style.setProperty("--body-gap", `${Math.round(bs * 0.6)}px`);
    bodyView.style.gap = `${Math.round(bs * 0.78)}px`;

    titleSizeView.textContent = String(ts);
    bodySizeView.textContent = String(bs);
  }

  function applyImageScales() {
    const ps = Number(photoScale.value);
    const fs = Number(fishScale.value);
    portraitImg.style.transform = `scale(${ps / 100})`;
    fishImg.style.transform = `scale(${fs / 100})`;
    photoScaleView.textContent = `${ps}%`;
    fishScaleView.textContent = `${fs}%`;
  }

  function applyImageRatios() {
    const fittedWidth = (baseWidth, ratio, maxHeight = 360) => {
      const [rw, rh] = String(ratio)
        .split("/")
        .map((part) => Number.parseFloat(part));
      if (!rw || !rh) return baseWidth;
      const height = (baseWidth * rh) / rw;
      return height > maxHeight ? Math.round((maxHeight * rw) / rh) : baseWidth;
    };

    photoModule.style.width = `${fittedWidth(280, photoRatio.value)}px`;
    fishModule.style.width = `${fittedWidth(360, fishRatio.value)}px`;
    portraitImg.style.aspectRatio = photoRatio.value;
    fishImg.style.aspectRatio = fishRatio.value;
    refreshModuleBounds();
  }

  function refreshModuleBounds() {
    window.requestAnimationFrame(() => {
      setModulePos(
        photoModule,
        Number(photoModule.dataset.x) || DEFAULT_PHOTO.x,
        Number(photoModule.dataset.y) || DEFAULT_PHOTO.y
      );
      setModulePos(
        fishModule,
        Number(fishModule.dataset.x) || DEFAULT_FISH.x,
        Number(fishModule.dataset.y) || DEFAULT_FISH.y
      );
    });
  }

  function applyLabels() {
    photoLabel.textContent = photoLabelInput.value.trim() || "照片";
    fishLabel.textContent = fishLabelInput.value.trim() || "附图";
    photoLabel.classList.toggle("is-hidden", !photoLabelToggle.checked);
    fishLabel.classList.toggle("is-hidden", !fishLabelToggle.checked);
  }

  function applySignatures() {
    ownerView.textContent = ownerInput.value.trim() || "________";
    fishNameView.textContent = fishNameInput.value.trim() || "________";
    signBlock.style.fontFamily = signFont.value;
    signBlock.style.color = signColor.value;
    cert.classList.toggle("sign-left", signLayout.value === "left");
    signBlock.classList.toggle("is-hidden", !signToggle.checked);
  }

  function applyVisibility() {
    photoModule.classList.toggle("is-hidden", !photoToggle.checked);
    fishModule.classList.toggle("is-hidden", !fishToggle.checked);
  }

  function renderAll() {
    renderTitle(titleInput.value);
    numberView.textContent = numberInput.value.trim() || "No. 0001";
    renderBody(bodyInput.value);
    issuerView.textContent = issuerInput.value.trim() || "肥鱼事务所";
    dateView.textContent = dateInput.value.trim() || "年 月";
    footerView.textContent = footerInput.value.trim();
    renderSeal(sealInput.value);
    applyStyles();
    applyImageScales();
    applyLabels();
    applySignatures();
    applyVisibility();
  }

  /* ---------- 模块位置 ---------- */
  function setModulePos(mod, x, y) {
    if (!mod) return;
    const isFish = mod === fishModule;
    const fallbackWidth = isFish ? 360 : 280;
    const fallbackHeight = isFish ? 315 : 331;
    const w = mod.offsetWidth || fallbackWidth;
    const h = mod.offsetHeight || fallbackHeight;
    const margin = 54;

    const safeX = Number.isFinite(Number(x)) ? Number(x) : 0;
    const safeY = Number.isFinite(Number(y)) ? Number(y) : 0;

    const nx = clamp(safeX, margin, 1000 - margin - w);
    const ny = clamp(safeY, margin, 1400 - margin - h);

    mod.style.left = `${Math.round(nx)}px`;
    mod.style.top = `${Math.round(ny)}px`;
    mod.dataset.x = String(Math.round(nx));
    mod.dataset.y = String(Math.round(ny));
  }

  function resetLayout() {
    setModulePos(photoModule, DEFAULT_PHOTO.x, DEFAULT_PHOTO.y);
    setModulePos(fishModule, DEFAULT_FISH.x, DEFAULT_FISH.y);
    showToast("排版已复位");
  }

  function selectModule(mod) {
    modules.forEach((item) => item.classList.toggle("selected", item === mod));
    try {
      mod.focus({ preventScroll: true });
    } catch (error) {
      mod.focus();
    }
  }

  function makeDraggable(mod) {
    let drag = null;

    mod.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      if (event.target.closest("input, button, a, select, textarea")) return;
      event.preventDefault();
      selectModule(mod);

      const scale = Number(stage.dataset.scale) || 1;
      const startLeft = Number.parseFloat(mod.style.left) || mod.offsetLeft || 0;
      const startTop = Number.parseFloat(mod.style.top) || mod.offsetTop || 0;

      drag = {
        pointerId: event.pointerId,
        startClientX: event.clientX,
        startClientY: event.clientY,
        startLeft,
        startTop,
        scale: scale || 1
      };

      try {
        mod.setPointerCapture(event.pointerId);
      } catch (error) {
        /* 某些浏览器不支持捕获，仍可继续用指针事件 */
      }
      mod.classList.add("dragging");
    });

    mod.addEventListener("pointermove", (event) => {
      if (!drag || event.pointerId !== drag.pointerId) return;
      event.preventDefault();
      const dx = (event.clientX - drag.startClientX) / drag.scale;
      const dy = (event.clientY - drag.startClientY) / drag.scale;
      setModulePos(mod, drag.startLeft + dx, drag.startTop + dy);
    });

    const endDrag = (event) => {
      if (!drag || (event && event.pointerId !== drag.pointerId)) return;
      drag = null;
      mod.classList.remove("dragging");
      try {
        if (event) mod.releasePointerCapture(event.pointerId);
      } catch (error) {
        /* ignore */
      }
    };

    mod.addEventListener("pointerup", endDrag);
    mod.addEventListener("pointercancel", endDrag);
    mod.addEventListener("lostpointercapture", () => {
      drag = null;
      mod.classList.remove("dragging");
    });
  }

  /* ---------- 图片上传 ---------- */
  function readImageFile(file, img, label) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("请选择图片文件");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      showToast("图片超过 15MB，先换一张小一点的吧");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      img.src = String(reader.result || "");
      img.alt = label;
      img.dataset.uploaded = "1";
      applyImageScales();
      showToast(`${label}已换上`);
    };
    reader.onerror = () => showToast("图片读取失败，换一张试试");
    reader.readAsDataURL(file);
  }

  /* ---------- 盖章 ---------- */
  let audioCtx = null;
  let stampTimer = 0;
  let shakeTimer = 0;

  function playThud() {
    try {
      const AudioCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtor) return;
      audioCtx = audioCtx || new AudioCtor();
      if (audioCtx.state === "suspended") audioCtx.resume();

      const t = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(150, t);
      osc.frequency.exponentialRampToValueAtTime(48, t + 0.18);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.18, t + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.32);

      const duration = 0.055;
      const bufferSize = Math.max(1, Math.floor(audioCtx.sampleRate * duration));
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i += 1) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 3);
      }
      const noise = audioCtx.createBufferSource();
      const noiseGain = audioCtx.createGain();
      noise.buffer = buffer;
      noiseGain.gain.value = 0.05;
      noise.connect(noiseGain).connect(audioCtx.destination);
      noise.start(t);
    } catch (error) {
      /* 音效不可用时静默 */
    }
  }

  function stampCertificate() {
    window.clearTimeout(stampTimer);
    window.clearTimeout(shakeTimer);

    seal.classList.remove("stamped", "stamping");
    void seal.offsetWidth;
    seal.classList.add("stamping");

    cert.classList.remove("shake");
    void cert.offsetWidth;
    cert.classList.add("shake");

    if (soundToggle.checked) playThud();

    stampTimer = window.setTimeout(() => {
      seal.classList.remove("stamping");
      seal.classList.add("stamped");
    }, 680);

    shakeTimer = window.setTimeout(() => cert.classList.remove("shake"), 340);
  }

  /* ---------- 草稿 ---------- */
  function collectState() {
    return {
      title: titleInput.value,
      number: numberInput.value,
      body: bodyInput.value,
      issuer: issuerInput.value,
      date: dateInput.value,
      owner: ownerInput.value,
      fishName: fishNameInput.value,
      signLayout: signLayout.value,
      signFont: signFont.value,
      signColor: signColor.value,
      signVisible: signToggle.checked,
      footer: footerInput.value,
      seal: sealInput.value,
      titleFont: titleFont.value,
      bodyFont: bodyFont.value,
      titleColor: titleColor.value,
      bodyColor: bodyColor.value,
      paperColor: paperColor.value,
      sealColor: sealColor.value,
      titleSize: Number(titleSize.value),
      bodySize: Number(bodySize.value),
      photo: {
        x: Number(photoModule.dataset.x) || DEFAULT_PHOTO.x,
        y: Number(photoModule.dataset.y) || DEFAULT_PHOTO.y,
        scale: Number(photoScale.value),
        visible: photoToggle.checked,
        ratio: photoRatio.value,
        label: photoLabelInput.value,
        labelVisible: photoLabelToggle.checked
      },
      fish: {
        x: Number(fishModule.dataset.x) || DEFAULT_FISH.x,
        y: Number(fishModule.dataset.y) || DEFAULT_FISH.y,
        scale: Number(fishScale.value),
        visible: fishToggle.checked,
        ratio: fishRatio.value,
        label: fishLabelInput.value,
        labelVisible: fishLabelToggle.checked
      },
      sound: soundToggle.checked
    };
  }

  function loadDraft() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return null;
      return parsed;
    } catch (error) {
      return null;
    }
  }

  function saveDraft() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(collectState()));
      showToast("草稿已保存到本机（图片不保存）");
    } catch (error) {
      showToast("保存失败：浏览器存储空间不足");
    }
  }

  function applyState(state) {
    const s = state || DEFAULTS;
    const p = s.photo || {};
    const f = s.fish || {};

    titleInput.value = s.title;
    numberInput.value = s.number;
    bodyInput.value = s.body;
    issuerInput.value = s.issuer;
    dateInput.value = s.date;
    ownerInput.value = s.owner || "";
    fishNameInput.value = s.fishName || "";
    signLayout.value = s.signLayout || "below";
    signFont.value = s.signFont || DEFAULTS.signFont;
    signColor.value = s.signColor || DEFAULTS.signColor;
    signToggle.checked = s.signVisible !== false;
    footerInput.value = s.footer;
    sealInput.value = s.seal;

    titleFont.value = s.titleFont;
    bodyFont.value = s.bodyFont;
    titleColor.value = s.titleColor;
    bodyColor.value = s.bodyColor;
    paperColor.value = s.paperColor;
    sealColor.value = s.sealColor;
    titleSize.value = s.titleSize;
    bodySize.value = s.bodySize;

    photoScale.value = p.scale ?? DEFAULT_PHOTO.scale;
    fishScale.value = f.scale ?? DEFAULT_FISH.scale;
    photoToggle.checked = p.visible !== false;
    fishToggle.checked = f.visible !== false;
    photoRatio.value = p.ratio || DEFAULT_PHOTO.ratio;
    fishRatio.value = f.ratio || DEFAULT_FISH.ratio;
    photoLabelInput.value = p.label || DEFAULT_PHOTO.label;
    fishLabelInput.value = f.label || DEFAULT_FISH.label;
    photoLabelToggle.checked = p.labelVisible !== false;
    fishLabelToggle.checked = f.labelVisible !== false;
    soundToggle.checked = Boolean(s.sound);

    applyImageRatios();
    renderAll();
    applyVisibility();
    setModulePos(photoModule, p.x ?? DEFAULT_PHOTO.x, p.y ?? DEFAULT_PHOTO.y);
    setModulePos(fishModule, f.x ?? DEFAULT_FISH.x, f.y ?? DEFAULT_FISH.y);
  }

  function resetAll() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      /* ignore */
    }
    portraitImg.src = "assets/portrait-placeholder.svg";
    portraitImg.alt = "照片";
    delete portraitImg.dataset.uploaded;
    fishImg.src = "assets/fish-placeholder.svg";
    fishImg.alt = "附图";
    delete fishImg.dataset.uploaded;

    seal.classList.remove("stamping");
    seal.classList.add("stamped");
    cert.classList.remove("shake");

    applyState(DEFAULTS);
    fitStage();
    showToast("已恢复默认模板");
  }

  /* ---------- 导出 PNG ---------- */
  function waitForCanvasImage(img) {
    if (!img) return Promise.resolve(null);
    if (img.complete && img.naturalWidth) return Promise.resolve(img);
    return new Promise((resolve) => {
      const finish = () => resolve(img.naturalWidth ? img : null);
      img.addEventListener("load", finish, { once: true });
      img.addEventListener("error", finish, { once: true });
    });
  }

  function makePaperNoise(ctx) {
    const tile = document.createElement("canvas");
    tile.width = 180;
    tile.height = 180;
    const tctx = tile.getContext("2d");
    const data = tctx.createImageData(tile.width, tile.height);
    let seed = 20261101;
    const random = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    for (let i = 0; i < data.data.length; i += 4) {
      const v = Math.floor(random() * 255);
      data.data[i] = v;
      data.data[i + 1] = v;
      data.data[i + 2] = v;
      data.data[i + 3] = Math.floor(random() * 28);
    }
    tctx.putImageData(data, 0, 0);
    return ctx.createPattern(tile, "repeat");
  }

  function measureSpaced(ctx, text, spacing) {
    const chars = Array.from(String(text));
    if (!chars.length) return 0;
    return (
      chars.reduce((sum, ch) => sum + ctx.measureText(ch).width, 0) +
      Math.max(0, chars.length - 1) * spacing
    );
  }

  function drawSpacedText(ctx, text, x, y, options = {}) {
    const chars = Array.from(String(text));
    if (!chars.length) return;
    const spacing = options.spacing || 0;
    const widths = chars.map((ch) => ctx.measureText(ch).width);
    const total = widths.reduce((a, b) => a + b, 0) + Math.max(0, chars.length - 1) * spacing;
    let cursor =
      options.align === "right" ? x - total : options.align === "center" ? x - total / 2 : x;

    ctx.save();
    if (options.font) ctx.font = options.font;
    ctx.fillStyle = options.color || "#000";
    ctx.textAlign = "center";
    ctx.textBaseline = options.baseline || "middle";
    ctx.globalAlpha = options.alpha == null ? 1 : options.alpha;
    chars.forEach((ch, i) => {
      const width = widths[i];
      if (ch !== " ") ctx.fillText(ch, cursor + width / 2, y);
      cursor += width + spacing;
    });
    ctx.restore();
  }

  function drawCoverImage(ctx, img, x, y, w, h, scale) {
    if (!img || !img.naturalWidth) return;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const ratio = Math.max(w / iw, h / ih);
    const dw = iw * ratio;
    const dh = ih * ratio;
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.translate(x + w / 2, y + h / 2);
    ctx.scale(scale || 1, scale || 1);
    ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
    ctx.restore();
  }

  function drawPaper(ctx) {
    ctx.fillStyle = paperColor.value || "#f8ecdd";
    ctx.fillRect(0, 0, 1000, 1400);

    let glow = ctx.createRadialGradient(280, 112, 0, 280, 112, 760);
    glow.addColorStop(0, "rgba(255,255,255,.52)");
    glow.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, 1000, 1400);

    glow = ctx.createRadialGradient(820, 1344, 0, 820, 1344, 620);
    glow.addColorStop(0, "rgba(160,130,100,.09)");
    glow.addColorStop(1, "rgba(160,130,100,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, 1000, 1400);

    const noise = makePaperNoise(ctx);
    if (noise) {
      ctx.save();
      ctx.globalAlpha = 0.07;
      ctx.fillStyle = noise;
      ctx.fillRect(0, 0, 1000, 1400);
      ctx.restore();
    }

    const edges = [
      [0, 0, 90, 0, 0, 0, 90, 1400],
      [1000, 0, 910, 0, 910, 0, 90, 1400],
      [0, 0, 0, 90, 0, 0, 1000, 90],
      [0, 1400, 0, 1310, 0, 1310, 1000, 90]
    ];
    edges.forEach(([x0, y0, x1, y1, rx, ry, rw, rh]) => {
      const edge = ctx.createLinearGradient(x0, y0, x1, y1);
      edge.addColorStop(0, "rgba(120,90,60,.055)");
      edge.addColorStop(1, "rgba(120,90,60,0)");
      ctx.fillStyle = edge;
      ctx.fillRect(rx, ry, rw, rh);
    });

    ctx.strokeStyle = "rgba(120,100,80,.22)";
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, 999, 1399);
  }

  function drawBorders(ctx) {
    const style = window.getComputedStyle(cert);
    const border = style.getPropertyValue("--border-color").trim() || "#4f5c88";
    const inner = style.getPropertyValue("--inner-border").trim() || "#9aa9c4";

    ctx.strokeStyle = border;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(26.75, 26.75, 946.5, 1346.5);

    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.strokeStyle = inner;
    ctx.lineWidth = 1;
    ctx.strokeRect(42.5, 42.5, 915, 1315);
    ctx.restore();
  }

  function drawTitle(ctx) {
    const chars = Array.from(titleInput.value.trim() || "肥鱼证");
    const size = Number(titleSize.value);
    const font = `700 ${size}px ${titleFont.value}`;
    ctx.font = font;
    const widths = chars.map((ch) => ctx.measureText(ch).width);
    const total = widths.reduce((a, b) => a + b, 0) + chars.length * 10;
    let cursor = 500 - total / 2;
    const rotations = [-2, 1.5, -1];
    const offsets = [6, -4, 4];

    chars.forEach((ch, i) => {
      const width = widths[i];
      const cx = cursor + 5 + width / 2;
      const cy = 84 + size / 2 + (offsets[i] == null ? 2 : offsets[i]);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(((rotations[i] || 0) * Math.PI) / 180);
      ctx.font = font;
      ctx.fillStyle = titleColor.value;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowColor = "rgba(255,255,255,.38)";
      ctx.shadowOffsetY = 1;
      ctx.fillText(ch, 0, 0);
      ctx.restore();
      cursor += 10 + width;
    });

    const style = window.getComputedStyle(cert);
    ctx.save();
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = style.getPropertyValue("--border-color").trim() || "#4f5c88";
    ctx.fillRect(290, 228, 420, 1.5);
    ctx.restore();
  }

  function drawNumber(ctx) {
    const serif = '"Times New Roman", "STSong", "SimSun", serif';
    const prefixFont = `400 22px ${serif}`;
    const valueFont = `italic 22px ${serif}`;
    const prefix = "编号 ";
    const value = numberInput.value.trim() || "No. 0001";

    ctx.font = prefixFont;
    const prefixWidth = measureSpaced(ctx, prefix, 1);
    ctx.font = valueFont;
    const valueWidth = measureSpaced(ctx, value, 1);
    const total = prefixWidth + valueWidth + 1;
    const start = 928 - total;

    drawSpacedText(ctx, prefix, start, 67, {
      font: prefixFont,
      spacing: 1,
      color: "#6d7ea6"
    });
    drawSpacedText(ctx, value, start + prefixWidth + 1, 67, {
      font: valueFont,
      spacing: 1,
      color: "#6d7ea6"
    });
  }

  function drawBody(ctx) {
    const lines = String(bodyInput.value || "").split(/\r?\n/).slice(0, 6);
    const size = Number(bodySize.value);
    const gap = Math.round(size * 0.78);
    const font = `400 ${size}px ${bodyFont.value}`;
    const spacing = Math.round(size * 0.6);
    ctx.font = font;

    lines.forEach((line, i) => {
      const y = 276 + i * (size + gap) + size / 2;
      drawSpacedText(ctx, line, 500, y, {
        font,
        spacing,
        color: bodyColor.value,
        align: "center",
        baseline: "middle"
      });
    });
  }

  function drawImageModule(ctx, module, frame, img, options) {
    if (!module || module.classList.contains("is-hidden")) return;
    const x = Number(module.dataset.x) || module.offsetLeft;
    const y = Number(module.dataset.y) || module.offsetTop;
    const fw = frame.offsetWidth;
    const fh = frame.offsetHeight;

    ctx.save();
    ctx.shadowColor = "rgba(70,55,40,.13)";
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 3;
    ctx.fillStyle = options.background;
    ctx.fillRect(x, y, fw, fh);
    ctx.restore();

    ctx.strokeStyle = options.border;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x + 0.75, y + 0.75, fw - 1.5, fh - 1.5);

    const inset = 1.5 + options.padding;
    drawCoverImage(
      ctx,
      img,
      x + inset,
      y + inset,
      fw - inset * 2,
      fh - inset * 2,
      options.scale
    );

    const label = module.querySelector(".module-label");
    if (label && !label.classList.contains("is-hidden")) {
      const style = window.getComputedStyle(label);
      const labelHeight = label.offsetHeight || 24;
      const labelY = y + fh + 10 + labelHeight / 2;
      drawSpacedText(ctx, label.textContent, x + fw / 2, labelY, {
        font: `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`,
        spacing: Number.parseFloat(style.letterSpacing) || 0,
        color: style.color,
        align: "center"
      });
    }
  }

  function drawIssuerLine(ctx, label, value, y) {
    const font = '400 25px "STSong", "SimSun", serif';
    const spacing = 1.5;
    ctx.font = font;
    const labelWidth = measureSpaced(ctx, label, spacing);
    drawSpacedText(ctx, label, 490, y, {
      font,
      spacing,
      color: "#7d7166",
      align: "left"
    });
    drawSpacedText(ctx, value, 490 + labelWidth + spacing, y, {
      font,
      spacing,
      color: "#6f6256",
      align: "left"
    });
  }

  function drawIssuer(ctx) {
    const issuer = issuerInput.value.trim() || "肥鱼事务所";
    const date = dateInput.value.trim() || "年 月";
    const lineHeight = 25 * 1.95;
    drawIssuerLine(ctx, "发证：", issuer, 1062 + lineHeight / 2);
    drawIssuerLine(ctx, "日期：", date, 1062 + lineHeight * 1.5);
  }

  function drawSignatureLine(ctx, label, value, x, y) {
    const font = `400 25px ${signFont.value}`;
    const spacing = 1.5;
    ctx.font = font;
    const labelWidth = measureSpaced(ctx, label, spacing);
    drawSpacedText(ctx, label, x, y, {
      font,
      spacing,
      color: signColor.value,
      align: "left",
      alpha: 0.82
    });
    drawSpacedText(ctx, value, x + labelWidth + spacing, y, {
      font,
      spacing,
      color: signColor.value,
      align: "left"
    });
  }

  function drawSignatures(ctx) {
    if (!signToggle.checked) return;
    const below = signLayout.value !== "left";
    const x = below ? 490 : 90;
    const top = below ? 1196 : 1062;
    const lineHeight = 25 * 1.95;
    drawSignatureLine(
      ctx,
      "主人：",
      ownerInput.value.trim() || "________",
      x,
      top + lineHeight / 2
    );
    drawSignatureLine(
      ctx,
      "大肥鱼：",
      fishNameInput.value.trim() || "________",
      x,
      top + lineHeight * 1.5
    );
  }

  function drawSeal(ctx) {
    const chars = Array.from(sealInput.value.trim() || "鱼印").slice(0, 4);
    const color = sealColor.value || "#c8453a";
    const cx = 772 + 59;
    const cy = 1048 + 64;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((-3 * Math.PI) / 180);
    ctx.globalAlpha = 0.86;
    ctx.strokeStyle = color;

    ctx.save();
    ctx.globalAlpha = 0.16;
    ctx.lineWidth = 5;
    ctx.translate(-0.6, 0.4);
    ctx.strokeRect(-56.5, -61.5, 113, 123);
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = 0.16;
    ctx.lineWidth = 5;
    ctx.translate(0.5, -0.3);
    ctx.strokeRect(-56.5, -61.5, 113, 123);
    ctx.restore();

    ctx.globalAlpha = 0.86;
    ctx.lineWidth = 5;
    ctx.strokeRect(-56.5, -61.5, 113, 123);

    ctx.globalAlpha = 0.45;
    ctx.lineWidth = 2;
    ctx.strokeRect(-54, -59, 108, 118);

    ctx.globalAlpha = 0.86;
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    if (chars.length <= 2) {
      const font = 46;
      const lineHeight = font * 1.02;
      ctx.font = `700 ${font}px "STKaiti", "KaiTi", serif`;
      const start = -((chars.length - 1) * lineHeight) / 2;
      chars.forEach((ch, i) => ctx.fillText(ch, 0, start + i * lineHeight));
    } else {
      const font = 36;
      ctx.font = `700 ${font}px "STKaiti", "KaiTi", serif`;
      const positions =
        chars.length === 3
          ? [
              [-18, -18],
              [18, -18],
              [0, 18]
            ]
          : [
              [-18, -18],
              [18, -18],
              [-18, 18],
              [18, 18]
            ];
      chars.forEach((ch, i) => {
        const [px, py] = positions[i];
        ctx.fillText(ch, px, py);
      });
    }

    ctx.restore();
  }

  function drawFooter(ctx) {
    const text = footerInput.value.trim();
    if (!text) return;
    drawSpacedText(ctx, text, 90, 1314.5, {
      font: '400 19px "STSong", "SimSun", serif',
      spacing: 4,
      color: "#8f7b68",
      align: "left",
      alpha: 0.9
    });
  }

  async function renderCertificateCanvas(scale = 2) {
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    const [portrait, fish] = await Promise.all([
      waitForCanvasImage(portraitImg),
      waitForCanvasImage(fishImg)
    ]);

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(1000 * scale);
    canvas.height = Math.round(1400 * scale);
    const ctx = canvas.getContext("2d");
    ctx.scale(scale, scale);

    drawPaper(ctx);
    drawBorders(ctx);
    drawNumber(ctx);
    drawTitle(ctx);
    drawBody(ctx);
    drawImageModule(ctx, photoModule, $(".photo-frame", photoModule), portrait, {
      background: "#fffaf1",
      border: "#8fa3c4",
      padding: 9,
      scale: Number(photoScale.value) / 100
    });
    drawImageModule(ctx, fishModule, $(".fish-frame", fishModule), fish, {
      background: "#1c2c46",
      border: "#8fa3c4",
      padding: 6,
      scale: Number(fishScale.value) / 100
    });
    drawIssuer(ctx);
    drawSignatures(ctx);
    drawSeal(ctx);
    drawFooter(ctx);

    return canvas;
  }

  async function exportPng() {
    if (!exportBtn || exportBtn.disabled) return;
    const originalText = exportBtn.textContent;
    exportBtn.disabled = true;
    exportBtn.textContent = "正在生成…";
    showToast("正在生成高清 PNG…");

    try {
      const canvas = await renderCertificateCanvas(2);
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("PNG 生成失败");

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const safeNumber = (numberInput.value.trim() || "No.0001").replace(/[\\/:*?"<>|]/g, "-");
      link.href = url;
      link.download = `肥鱼证-${safeNumber}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 4000);
      showToast("高清 PNG 已导出（2000 × 2800）");
    } catch (error) {
      console.error(error);
      showToast("导出失败，再试一次");
    } finally {
      exportBtn.disabled = false;
      exportBtn.textContent = originalText;
    }
  }

  /* ---------- 全屏预览 ---------- */
  function setPreview(on) {
    const active =
      typeof on === "boolean" ? on : !document.body.classList.contains("preview-mode");
    document.body.classList.toggle("preview-mode", active);
    previewBtn.textContent = active ? "退出预览" : "放大预览";
    previewBtn.setAttribute("aria-pressed", String(active));
    if (active) window.scrollTo(0, 0);
    window.requestAnimationFrame(() => {
      fitStage();
      window.setTimeout(fitStage, 80);
    });
  }

  /* ---------- 事件绑定 ---------- */
  function bindEvents() {
    [titleInput, numberInput, bodyInput, issuerInput, dateInput, footerInput, sealInput].forEach(
      (input) => input.addEventListener("input", renderAll)
    );
    [ownerInput, fishNameInput, photoLabelInput, fishLabelInput].forEach((input) =>
      input.addEventListener("input", () => {
        renderAll();
        refreshModuleBounds();
      })
    );

    [titleFont, bodyFont].forEach((select) =>
      select.addEventListener("change", applyStyles)
    );
    [titleColor, bodyColor, paperColor, sealColor].forEach((input) =>
      input.addEventListener("input", applyStyles)
    );
    [titleSize, bodySize].forEach((input) =>
      input.addEventListener("input", applyStyles)
    );
    [photoScale, fishScale].forEach((input) =>
      input.addEventListener("input", applyImageScales)
    );
    [photoRatio, fishRatio].forEach((select) =>
      select.addEventListener("change", applyImageRatios)
    );
    [photoLabelToggle, fishLabelToggle].forEach((input) =>
      input.addEventListener("change", () => {
        applyLabels();
        refreshModuleBounds();
      })
    );
    [signLayout, signFont, signColor].forEach((input) =>
      input.addEventListener("input", applySignatures)
    );
    [signLayout, signFont].forEach((select) =>
      select.addEventListener("change", applySignatures)
    );
    signToggle.addEventListener("change", applySignatures);

    [photoToggle, fishToggle].forEach((input) =>
      input.addEventListener("change", applyVisibility)
    );

    portraitFile.addEventListener("change", (event) => {
      readImageFile(event.target.files && event.target.files[0], portraitImg, "照片");
      event.target.value = "";
    });
    fishFile.addEventListener("change", (event) => {
      readImageFile(event.target.files && event.target.files[0], fishImg, "鱼图");
      event.target.value = "";
    });

    stampBtn.addEventListener("click", stampCertificate);
    saveBtn.addEventListener("click", saveDraft);
    resetBtn.addEventListener("click", resetAll);
    centerBtn.addEventListener("click", resetLayout);
    previewBtn.addEventListener("click", () => setPreview());
    if (exportBtn) exportBtn.addEventListener("click", exportPng);

    cert.addEventListener("pointerdown", (event) => {
      if (!event.target.closest(".module")) {
        modules.forEach((mod) => mod.classList.remove("selected"));
      }
    });

    modules.forEach(makeDraggable);

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && document.body.classList.contains("preview-mode")) {
        setPreview(false);
        return;
      }
      const active = document.activeElement;
      if (
        active &&
        (active.tagName === "INPUT" ||
          active.tagName === "TEXTAREA" ||
          active.tagName === "SELECT" ||
          active.tagName === "BUTTON" ||
          active.tagName === "A")
      ) {
        return;
      }

      const selected = modules.find((mod) => mod.classList.contains("selected"));
      if (!selected) return;

      if (event.key === "Escape") {
        selected.classList.remove("selected");
        return;
      }

      const step = event.shiftKey ? 10 : 2;
      let dx = 0;
      let dy = 0;
      if (event.key === "ArrowLeft") dx = -step;
      else if (event.key === "ArrowRight") dx = step;
      else if (event.key === "ArrowUp") dy = -step;
      else if (event.key === "ArrowDown") dy = step;
      else return;

      event.preventDefault();
      const x = Number.parseFloat(selected.style.left) || 0;
      const y = Number.parseFloat(selected.style.top) || 0;
      setModulePos(selected, x + dx, y + dy);
    });

    window.addEventListener("resize", fitStage);

    if ("ResizeObserver" in window) {
      const observer = new ResizeObserver(() => fitStage());
      observer.observe(stageArea);
    }

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(fitStage).catch(() => {});
    }
  }

  /* ---------- 启动 ---------- */
  function init() {
    bindEvents();
    const saved = loadDraft();
    applyState(saved ? { ...DEFAULTS, ...saved } : DEFAULTS);
    seal.classList.add("stamped");
    fitStage();
    window.requestAnimationFrame(fitStage);
    window.setTimeout(fitStage, 120);

    if (saved) {
      window.setTimeout(() => showToast("已恢复上次保存的草稿"), 500);
    }

    if (new URLSearchParams(window.location.search).get("debug") === "1") {
      window.__feiyuRenderCertificate = renderCertificateCanvas;
    }
  }

  init();
})();