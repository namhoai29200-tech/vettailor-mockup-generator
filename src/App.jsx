import { useState, useRef, useCallback, useEffect } from "react";

// ============================================================
// CONFIG
// ============================================================

const MOCKUP_TYPES = [
  {
    id: "on_model",
    label: "On-Model",
    icon: "👤",
    description: "Người mặc/đội sản phẩm",
    prompt:
      "Generate a photorealistic product mockup photograph. Show a confident middle-aged American male veteran wearing this exact product naturally. He has a strong build, short hair, and a proud demeanor. Background: simple clean outdoor setting with soft natural light. The product design, colors, print, and every detail must be preserved EXACTLY as shown in the reference image. Professional product photography, sharp focus on the product. High resolution. Do NOT add any text, watermarks, or logos not present in the original.",
  },
  {
    id: "on_model_female",
    label: "On-Model (Nữ)",
    icon: "👩",
    description: "Nữ mặc/đội sản phẩm",
    prompt:
      "Generate a photorealistic product mockup photograph. Show a confident American female veteran in her 40s wearing this exact product naturally. She has an athletic build and a proud, confident expression. Background: clean studio setting with soft lighting. The product design, colors, print, and every detail must be preserved EXACTLY as shown in the reference image. Professional product photography, sharp focus on the product. High resolution. Do NOT add any text, watermarks, or logos not present in the original.",
  },
  {
    id: "flat_lay",
    label: "Flat Lay",
    icon: "📐",
    description: "Sản phẩm trên background themed",
    prompt:
      "Generate a photorealistic flat lay product photography mockup. Place this exact product neatly centered on a rustic dark wooden table. Around the product, arrange themed items: a small folded American flag, metal dog tags, a vintage compass, and a worn leather notebook. Top-down camera angle. The product design, colors, and ALL details must be preserved EXACTLY as shown in the reference image. Soft warm natural lighting from the side, clean composition. Do NOT add any text, watermarks, or logos not present in the original.",
  },
  {
    id: "lifestyle_bbq",
    label: "Lifestyle - BBQ",
    icon: "🏕️",
    description: "Cảnh BBQ ngoài trời",
    prompt:
      "Generate a photorealistic lifestyle product mockup photograph. Show a person wearing this exact product at a backyard BBQ gathering. Warm golden hour lighting, American flags in background, friends gathered around a grill. The scene feels authentic, warm, and aspirational for US military veterans. The product design must be preserved EXACTLY as shown in the reference image. Cinematic photography style, natural lighting, shallow depth of field focused on the product. Do NOT add any text, watermarks, or logos not present in the original.",
  },
  {
    id: "lifestyle_outdoor",
    label: "Lifestyle - Outdoor",
    icon: "🏔️",
    description: "Outdoor, fishing, hiking",
    prompt:
      "Generate a photorealistic lifestyle product mockup photograph. Show a rugged American man wearing this exact product while enjoying outdoor activities - standing near a lake or hiking trail with mountains in the background. Morning golden light, natural wilderness setting. The product design must be preserved EXACTLY as shown in the reference image. Adventure photography style, warm natural tones. Do NOT add any text, watermarks, or logos not present in the original.",
  },
  {
    id: "lifestyle_garage",
    label: "Lifestyle - Garage",
    icon: "🔧",
    description: "Garage, workshop, xe cổ",
    prompt:
      "Generate a photorealistic lifestyle product mockup photograph. Show a strong American man wearing this exact product in a classic car garage or workshop. Vintage tools, an American muscle car in background, warm industrial lighting. The scene feels masculine, authentic, and appeals to veteran culture. The product design must be preserved EXACTLY as shown in the reference image. Cinematic moody lighting, shallow depth of field on the product. Do NOT add any text, watermarks, or logos not present in the original.",
  },
  {
    id: "closeup",
    label: "Close-up",
    icon: "🔍",
    description: "Cận cảnh chi tiết sản phẩm",
    prompt:
      "Generate a photorealistic extreme close-up product detail shot of this exact product. Dramatic studio lighting highlighting the texture, stitching, embroidery, and print quality. Macro photography style with shallow depth of field. The product fills most of the frame, showing premium craftsmanship. Every detail of the original design must be preserved EXACTLY. Professional e-commerce product photography, dark moody background. Do NOT add any text, watermarks, or logos not present in the original.",
  },
  {
    id: "white_bg",
    label: "White BG",
    icon: "⬜",
    description: "Nền trắng cho e-commerce",
    prompt:
      "Generate a photorealistic product photo on a pure white background. Show this exact product displayed cleanly as if for an e-commerce listing. The product is neatly positioned, slightly angled for depth. Clean soft studio lighting, no shadows or minimal soft shadow underneath. The product design, colors, and ALL details must be preserved EXACTLY as shown in the reference image. Amazon/Shopify product listing style photography. Do NOT add any text, watermarks, or logos not present in the original.",
  },
];

const MODEL_OPTIONS = [
  { id: "gemini-2.5-flash-image", label: "Nano Banana", detail: "Free ~500/day · $0.039/img", tier: "free" },
  { id: "gemini-3.1-flash-image-preview", label: "Nano Banana 2", detail: "Free · Mới nhất", tier: "free" },
  { id: "gemini-3-pro-image-preview", label: "Nano Banana Pro", detail: "$0.134/img · Chất lượng cao nhất", tier: "paid" },
];

const PRESETS = {
  quick: { label: "⚡ Quick (4)", types: ["on_model", "flat_lay", "lifestyle_bbq", "closeup"] },
  full: { label: "🎯 Full (8)", types: MOCKUP_TYPES.map((m) => m.id) },
  ecommerce: { label: "🛒 E-commerce (3)", types: ["on_model", "closeup", "white_bg"] },
  social: { label: "📱 Social (4)", types: ["on_model", "lifestyle_bbq", "lifestyle_outdoor", "lifestyle_garage"] },
};

const STATUS = { IDLE: "idle", GENERATING: "generating", SUCCESS: "success", ERROR: "error" };

// ============================================================
// HELPERS
// ============================================================

function saveApiKey(key) {
  try { localStorage.setItem("vettailor_api_key", key); } catch {}
}
function loadApiKey() {
  try { return localStorage.getItem("vettailor_api_key") || ""; } catch { return ""; }
}

async function generateMockup(apiKey, model, imageBase64, mimeType, prompt, signal) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const body = {
    contents: [{ role: "user", parts: [{ inline_data: { mime_type: mimeType, data: imageBase64 } }, { text: prompt }] }],
    generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API Error ${res.status}`);
  }

  const data = await res.json();
  const parts = data?.candidates?.[0]?.content?.parts || [];
  const imgPart = parts.find((p) => p.inlineData || p.inline_data);
  if (!imgPart) {
    const txt = parts.find((p) => p.text);
    throw new Error(txt?.text?.slice(0, 150) || "No image in response");
  }
  const d = imgPart.inlineData || imgPart.inline_data;
  return `data:${d.mimeType || d.mime_type};base64,${d.data}`;
}

function downloadDataUrl(dataUrl, filename) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// ============================================================
// COMPONENTS
// ============================================================

function Badge({ status }) {
  const map = {
    idle: { bg: "#374151", c: "#d1d5db", t: "Chờ" },
    generating: { bg: "#7c3aed", c: "#ddd6fe", t: "Đang tạo..." },
    success: { bg: "#059669", c: "#a7f3d0", t: "✓ Xong" },
    error: { bg: "#dc2626", c: "#fecaca", t: "Lỗi" },
  };
  const s = map[status] || map.idle;
  return (
    <span style={{ padding: "2px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600, background: s.bg, color: s.c, whiteSpace: "nowrap" }}>
      {status === "generating" && <span style={{ display: "inline-block", animation: "spin 1s linear infinite", marginRight: 4 }}>◌</span>}
      {s.t}
    </span>
  );
}

// ============================================================
// MAIN APP
// ============================================================

export default function App() {
  const [apiKey, setApiKey] = useState(loadApiKey);
  const [showKey, setShowKey] = useState(false);
  const [model, setModel] = useState(MODEL_OPTIONS[0].id);
  const [images, setImages] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState(PRESETS.quick.types);
  const [customPrompts, setCustomPrompts] = useState({});
  const [queue, setQueue] = useState([]);
  const [results, setResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState({ cur: 0, total: 0 });
  const [tab, setTab] = useState("setup");
  const [delay, setDelay] = useState(4);
  const fileRef = useRef(null);
  const abortRef = useRef(null);
  const logsEndRef = useRef(null);

  useEffect(() => { saveApiKey(apiKey); }, [apiKey]);
  useEffect(() => { logsEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [logs]);

  const log = useCallback((msg, type = "info") => {
    setLogs((p) => [...p, { t: new Date().toLocaleTimeString(), msg, type }]);
  }, []);

  // Upload
  const onUpload = (e) => {
    Array.from(e.target.files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImages((p) => [
          ...p,
          { id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, name: file.name, url: ev.target.result, b64: ev.target.result.split(",")[1], mime: file.type },
        ]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const toggleType = (id) => setSelectedTypes((p) => (p.includes(id) ? p.filter((t) => t !== id) : [...p, id]));

  const applyPreset = (key) => setSelectedTypes([...PRESETS[key].types]);

  // Generation
  const startGen = async () => {
    if (!apiKey) return log("❌ Chưa nhập API Key!", "error");
    if (!images.length) return log("❌ Chưa upload ảnh!", "error");
    if (!selectedTypes.length) return log("❌ Chưa chọn mockup type!", "error");

    const q = [];
    images.forEach((img) => {
      selectedTypes.forEach((tid) => {
        const mt = MOCKUP_TYPES.find((m) => m.id === tid);
        q.push({ id: `${img.id}_${tid}`, img, mt, status: STATUS.IDLE, result: null, error: null });
      });
    });

    setQueue(q);
    setResults([]);
    setIsRunning(true);
    setTab("generate");
    setProgress({ cur: 0, total: q.length });

    const controller = new AbortController();
    abortRef.current = controller;

    log(`🚀 Bắt đầu generate ${q.length} mockups (model: ${model})...`);

    const updated = [...q];
    let successCount = 0;

    for (let i = 0; i < q.length; i++) {
      if (controller.signal.aborted) {
        log("⏹ Đã dừng.", "warn");
        break;
      }

      updated[i] = { ...updated[i], status: STATUS.GENERATING };
      setQueue([...updated]);
      setProgress({ cur: i + 1, total: q.length });

      const prompt = customPrompts[q[i].mt.id] || q[i].mt.prompt;
      log(`[${i + 1}/${q.length}] ${q[i].img.name} → ${q[i].mt.label}`);

      try {
        const url = await generateMockup(apiKey, model, q[i].img.b64, q[i].img.mime, prompt, controller.signal);
        updated[i] = { ...updated[i], status: STATUS.SUCCESS, result: url };
        setResults((p) => [...p, { id: q[i].id, url, src: q[i].img.name, type: q[i].mt.label, typeId: q[i].mt.id }]);
        successCount++;
        log(`✅ ${q[i].img.name} → ${q[i].mt.label}`, "success");
      } catch (err) {
        if (err.name === "AbortError") break;
        updated[i] = { ...updated[i], status: STATUS.ERROR, error: err.message };
        log(`❌ ${err.message}`, "error");

        // Auto retry once on rate limit
        if (err.message.includes("429") || err.message.toLowerCase().includes("quota") || err.message.toLowerCase().includes("rate")) {
          log(`⏳ Rate limited — chờ 30s rồi retry...`, "warn");
          await new Promise((r) => setTimeout(r, 30000));
          if (controller.signal.aborted) break;
          try {
            const url = await generateMockup(apiKey, model, q[i].img.b64, q[i].img.mime, prompt, controller.signal);
            updated[i] = { ...updated[i], status: STATUS.SUCCESS, result: url, error: null };
            setResults((p) => [...p, { id: q[i].id, url, src: q[i].img.name, type: q[i].mt.label, typeId: q[i].mt.id }]);
            successCount++;
            log(`✅ Retry thành công: ${q[i].img.name} → ${q[i].mt.label}`, "success");
          } catch (retryErr) {
            if (retryErr.name === "AbortError") break;
            updated[i] = { ...updated[i], status: STATUS.ERROR, error: retryErr.message };
            log(`❌ Retry thất bại: ${retryErr.message}`, "error");
          }
        }
      }

      setQueue([...updated]);
      if (i < q.length - 1 && !controller.signal.aborted) {
        await new Promise((r) => setTimeout(r, delay * 1000));
      }
    }

    setIsRunning(false);
    log(`🏁 Hoàn tất! ${successCount}/${q.length} thành công.`);
  };

  const stopGen = () => { abortRef.current?.abort(); };

  const downloadAll = () => {
    results.forEach((r, i) => setTimeout(() => downloadDataUrl(r.url, `vettailor_${r.typeId}_${r.src.replace(/\.[^.]+$/, "")}.png`), i * 400));
  };

  const totalMockups = images.length * selectedTypes.length;

  const tabs = [
    { id: "setup", label: "Setup", icon: "⚙️" },
    { id: "upload", label: "Upload", icon: "📤" },
    { id: "config", label: "Config", icon: "🎨" },
    { id: "generate", label: "Generate", icon: "🚀" },
    { id: "results", label: `Results${results.length ? ` (${results.length})` : ""}`, icon: "🖼️" },
  ];

  return (
    <div style={{ fontFamily: "'Segoe UI',-apple-system,system-ui,sans-serif", background: "linear-gradient(145deg,#0a0a15,#111827,#0f172a)", color: "#e2e8f0", minHeight: "100vh" }}>
      <style>{`
        @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        *{box-sizing:border-box}
        ::selection{background:#7c3aed;color:#fff}
        ::-webkit-scrollbar{width:6px;height:6px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:#374151;border-radius:3px}
        .card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:22px;margin-bottom:16px;backdrop-filter:blur(12px)}
        .inp{background:rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.1);color:#e2e8f0;padding:10px 14px;border-radius:8px;font-size:14px;width:100%;outline:none;transition:border .2s}
        .inp:focus{border-color:#7c3aed}
        .inp::placeholder{color:#4b5563}
        textarea.inp{resize:vertical;min-height:56px}
        .btn{border:none;cursor:pointer;font-weight:600;border-radius:8px;transition:all .15s;font-size:14px;display:inline-flex;align-items:center;gap:6px}
        .btn:active{transform:scale(.97)}
        .btn-p{background:linear-gradient(135deg,#7c3aed,#6d28d9);color:#fff;padding:11px 22px;box-shadow:0 2px 12px rgba(124,58,237,.25)}
        .btn-p:hover{box-shadow:0 4px 20px rgba(124,58,237,.4);transform:translateY(-1px)}
        .btn-p:disabled{opacity:.45;cursor:not-allowed;transform:none;box-shadow:none}
        .btn-s{background:rgba(255,255,255,.07);color:#c0c8d8;border:1px solid rgba(255,255,255,.1);padding:8px 14px;font-size:13px}
        .btn-s:hover{background:rgba(255,255,255,.12)}
        .btn-d{background:rgba(220,38,38,.15);color:#fca5a5;border:1px solid rgba(220,38,38,.25);padding:10px 20px}
        .tab{padding:10px 16px;border:none;cursor:pointer;font-size:13px;font-weight:600;border-radius:10px 10px 0 0;transition:all .2s;display:flex;align-items:center;gap:6px;background:transparent;color:#64748b}
        .tab:hover{color:#94a3b8;background:rgba(255,255,255,.04)}
        .tab.on{background:rgba(124,58,237,.15);color:#c4b5fd;border-bottom:2px solid #7c3aed}
        .chip{padding:6px 14px;border-radius:8px;cursor:pointer;transition:all .15s;font-size:13px;font-weight:500;border:1px solid rgba(255,255,255,.08);background:rgba(0,0,0,.2);color:#94a3b8;display:inline-flex;align-items:center;gap:5px}
        .chip:hover{border-color:rgba(124,58,237,.3)}
        .chip.on{background:rgba(124,58,237,.15);border-color:rgba(124,58,237,.4);color:#c4b5fd}
        .mcard{border:2px solid rgba(255,255,255,.06);border-radius:12px;padding:14px;cursor:pointer;transition:all .2s;background:rgba(0,0,0,.15)}
        .mcard:hover{border-color:rgba(124,58,237,.3)}
        .mcard.on{border-color:#7c3aed;background:rgba(124,58,237,.08)}
        .pbar{height:5px;background:rgba(255,255,255,.06);border-radius:3px;overflow:hidden}
        .pfill{height:100%;background:linear-gradient(90deg,#7c3aed,#a78bfa);border-radius:3px;transition:width .4s}
        .log{padding:3px 0;font-size:12px;font-family:'SF Mono',Consolas,monospace;animation:fadeIn .25s}
        .log-info{color:#94a3b8}.log-success{color:#6ee7b7}.log-error{color:#fca5a5}.log-warn{color:#fcd34d}
        .rcard{border-radius:12px;overflow:hidden;background:rgba(0,0,0,.25);border:1px solid rgba(255,255,255,.06);transition:all .2s}
        .rcard:hover{transform:translateY(-3px);box-shadow:0 8px 30px rgba(0,0,0,.4)}
      `}</style>

      {/* HEADER */}
      <header style={{ padding: "18px 24px 0", borderBottom: "1px solid rgba(255,255,255,.05)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 21, fontWeight: 700, color: "#f1f5f9", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 26 }}>🎖️</span> Vettailor Mockup Generator
            </h1>
            <p style={{ margin: "3px 0 0", fontSize: 12, color: "#64748b" }}>Bulk AI mockup generation for US Veterans apparel · Powered by Gemini API</p>
          </div>
          {isRunning && (
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 12, color: "#a78bfa", fontWeight: 600, marginBottom: 3 }}>{progress.cur}/{progress.total}</div>
              <div className="pbar" style={{ width: 110 }}>
                <div className="pfill" style={{ width: `${progress.total ? (progress.cur / progress.total) * 100 : 0}%` }} />
              </div>
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 3, overflowX: "auto", paddingBottom: 0 }}>
          {tabs.map((t) => (
            <button key={t.id} className={`tab ${tab === t.id ? "on" : ""}`} onClick={() => setTab(t.id)}>
              <span>{t.icon}</span><span style={{ whiteSpace: "nowrap" }}>{t.label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* CONTENT */}
      <main style={{ padding: "20px 24px 40px", maxWidth: 920, margin: "0 auto" }}>

        {/* ── SETUP ── */}
        {tab === "setup" && (
          <>
            <div className="card">
              <h3 style={{ margin: "0 0 3px", fontSize: 15, color: "#c4b5fd" }}>📋 Lấy Gemini API Key (miễn phí)</h3>
              <p style={{ margin: "0 0 16px", fontSize: 12, color: "#64748b" }}>Chỉ 1 phút, không cần thẻ tín dụng</p>
              {[
                { s: 1, t: "Truy cập Google AI Studio", l: "https://aistudio.google.com", d: "Đăng nhập Google" },
                { s: 2, t: "Click \"Get API Key\" → \"Create API Key\"", d: "Chọn hoặc tạo project mới" },
                { s: 3, t: "Copy key dán vào ô bên dưới", d: "Key bắt đầu bằng AIza..." },
              ].map((s) => (
                <div key={s.s} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 10 }}>
                  <div style={{ width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0, background: "linear-gradient(135deg,#7c3aed,#6d28d9)", color: "#fff" }}>{s.s}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>
                      {s.t}
                      {s.l && <a href={s.l} target="_blank" rel="noopener noreferrer" style={{ color: "#a78bfa", marginLeft: 6, fontSize: 11, textDecoration: "none" }}>↗ Mở</a>}
                    </div>
                    <div style={{ fontSize: 11, color: "#64748b", marginTop: 1 }}>{s.d}</div>
                  </div>
                </div>
              ))}

              <div style={{ marginTop: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 5, display: "block" }}>API Key</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input className="inp" type={showKey ? "text" : "password"} placeholder="AIzaSy..." value={apiKey} onChange={(e) => setApiKey(e.target.value)} style={{ flex: 1 }} />
                  <button className="btn btn-s" onClick={() => setShowKey(!showKey)}>{showKey ? "🙈" : "👁️"}</button>
                </div>
                <div style={{ fontSize: 11, color: "#4b5563", marginTop: 4 }}>Key được lưu trong browser (localStorage), không gửi đi đâu ngoài Google API.</div>
              </div>

              <div style={{ marginTop: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 5, display: "block" }}>Model</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {MODEL_OPTIONS.map((m) => (
                    <label key={m.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 8, cursor: "pointer", background: model === m.id ? "rgba(124,58,237,.12)" : "rgba(0,0,0,.2)", border: `1px solid ${model === m.id ? "rgba(124,58,237,.35)" : "rgba(255,255,255,.05)"}`, transition: "all .15s" }}>
                      <input type="radio" name="model" checked={model === m.id} onChange={() => setModel(m.id)} style={{ accentColor: "#7c3aed" }} />
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{m.label}</span>
                        <span style={{ fontSize: 11, color: "#64748b", marginLeft: 8 }}>{m.detail}</span>
                      </div>
                      {m.tier === "free" && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 99, background: "rgba(5,150,105,.15)", color: "#6ee7b7", fontWeight: 600 }}>FREE</span>}
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 5, display: "block" }}>Delay giữa requests (giây)</label>
                <input className="inp" type="number" min={1} max={30} value={delay} onChange={(e) => setDelay(Math.max(1, +e.target.value))} style={{ width: 100 }} />
                <span style={{ fontSize: 11, color: "#4b5563", marginLeft: 8 }}>Tránh rate limit. Khuyến nghị: 3-5s</span>
              </div>
            </div>
            <button className="btn btn-p" onClick={() => apiKey && setTab("upload")} disabled={!apiKey} style={{ width: "100%" }}>Tiếp theo → Upload ảnh</button>
          </>
        )}

        {/* ── UPLOAD ── */}
        {tab === "upload" && (
          <>
            <div className="card">
              <h3 style={{ margin: "0 0 14px", fontSize: 15, color: "#c4b5fd" }}>📤 Upload ảnh sản phẩm gốc</h3>
              <div
                style={{ border: "2px dashed rgba(255,255,255,.12)", borderRadius: 14, padding: 36, textAlign: "center", cursor: "pointer", background: "rgba(0,0,0,.1)", transition: "all .2s" }}
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); onUpload({ target: { files: e.dataTransfer.files }, value: "" }); }}
              >
                <div style={{ fontSize: 34, marginBottom: 6 }}>📁</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#c0c8d8" }}>Click hoặc kéo thả ảnh</div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}>PNG, JPG, WEBP — nhiều ảnh cùng lúc</div>
                <input ref={fileRef} type="file" accept="image/*" multiple onChange={onUpload} style={{ display: "none" }} />
              </div>

              {images.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8" }}>{images.length} ảnh</span>
                    <button className="btn btn-s" onClick={() => setImages([])} style={{ fontSize: 11 }}>Xoá tất cả</button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(90px,1fr))", gap: 8 }}>
                    {images.map((img) => (
                      <div key={img.id} style={{ position: "relative" }}>
                        <img src={img.url} alt="" style={{ width: "100%", height: 90, objectFit: "cover", borderRadius: 8, border: "1px solid rgba(255,255,255,.08)" }} />
                        <button onClick={() => setImages((p) => p.filter((i) => i.id !== img.id))} style={{ position: "absolute", top: 3, right: 3, width: 20, height: 20, borderRadius: "50%", border: "none", background: "rgba(220,38,38,.8)", color: "#fff", fontSize: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                        <div style={{ fontSize: 9, color: "#64748b", marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{img.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button className="btn btn-p" onClick={() => images.length && setTab("config")} disabled={!images.length} style={{ width: "100%" }}>Tiếp theo → Chọn mockup</button>
          </>
        )}

        {/* ── CONFIG ── */}
        {tab === "config" && (
          <>
            <div className="card">
              <h3 style={{ margin: "0 0 4px", fontSize: 15, color: "#c4b5fd" }}>🎨 Chọn loại mockup</h3>
              <p style={{ margin: "0 0 12px", fontSize: 12, color: "#64748b" }}>Chọn preset hoặc pick từng loại. Click vào mockup để tuỳ chỉnh prompt.</p>

              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                {Object.entries(PRESETS).map(([k, v]) => (
                  <button key={k} className="btn btn-s" onClick={() => applyPreset(k)} style={{ fontSize: 12 }}>{v.label}</button>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {MOCKUP_TYPES.map((m) => (
                  <div key={m.id} className={`mcard ${selectedTypes.includes(m.id) ? "on" : ""}`} onClick={() => toggleType(m.id)}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 20 }}>{m.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{m.label}</div>
                        <div style={{ fontSize: 11, color: "#64748b" }}>{m.description}</div>
                      </div>
                      <div style={{ width: 20, height: 20, borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, background: selectedTypes.includes(m.id) ? "#7c3aed" : "rgba(255,255,255,.06)", border: `1px solid ${selectedTypes.includes(m.id) ? "#7c3aed" : "rgba(255,255,255,.1)"}`, color: "#fff", flexShrink: 0 }}>
                        {selectedTypes.includes(m.id) ? "✓" : ""}
                      </div>
                    </div>
                    {selectedTypes.includes(m.id) && (
                      <div onClick={(e) => e.stopPropagation()} style={{ marginTop: 8 }}>
                        <textarea className="inp" placeholder="Tuỳ chỉnh prompt (để trống = dùng mặc định)..." value={customPrompts[m.id] || ""} onChange={(e) => setCustomPrompts((p) => ({ ...p, [m.id]: e.target.value }))} rows={2} style={{ fontSize: 11 }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 14, padding: "12px 14px", borderRadius: 10, background: "rgba(124,58,237,.06)", border: "1px solid rgba(124,58,237,.12)" }}>
                <span style={{ fontSize: 13, color: "#94a3b8" }}>{images.length} ảnh × {selectedTypes.length} loại = </span>
                <strong style={{ color: "#c4b5fd", fontSize: 15 }}>{totalMockups} mockups</strong>
                <span style={{ fontSize: 12, color: "#64748b", marginLeft: 8 }}>~{Math.ceil((totalMockups * (delay + 5)) / 60)} phút</span>
              </div>
            </div>
            <button className="btn btn-p" onClick={startGen} disabled={isRunning || !totalMockups} style={{ width: "100%" }}>🚀 Generate {totalMockups} mockups</button>
          </>
        )}

        {/* ── GENERATE ── */}
        {tab === "generate" && (
          <>
            <div className="card">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: 15, color: "#c4b5fd" }}>{isRunning ? "⚡ Đang generate..." : "📋 Queue"}</h3>
                {isRunning && <button className="btn btn-d" onClick={stopGen}>⏹ Dừng</button>}
              </div>
              {progress.total > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginBottom: 3 }}>
                    <span>Tiến độ</span><span>{Math.round((progress.cur / progress.total) * 100)}%</span>
                  </div>
                  <div className="pbar"><div className="pfill" style={{ width: `${(progress.cur / progress.total) * 100}%` }} /></div>
                </div>
              )}
              <div style={{ maxHeight: 260, overflowY: "auto" }}>
                {queue.map((q) => (
                  <div key={q.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,.03)" }}>
                    <img src={q.img.url} alt="" style={{ width: 34, height: 34, objectFit: "cover", borderRadius: 6 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 500, color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{q.img.name} → {q.mt.icon} {q.mt.label}</div>
                      {q.error && <div style={{ fontSize: 10, color: "#fca5a5", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{q.error}</div>}
                    </div>
                    <Badge status={q.status} />
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h4 style={{ margin: "0 0 6px", fontSize: 13, color: "#94a3b8" }}>📝 Logs</h4>
              <div style={{ maxHeight: 180, overflowY: "auto", background: "rgba(0,0,0,.25)", borderRadius: 8, padding: 10, fontFamily: "'SF Mono',Consolas,monospace" }}>
                {logs.length === 0 ? <div style={{ fontSize: 11, color: "#374151" }}>Chưa có log...</div> : logs.map((l, i) => (
                  <div key={i} className={`log log-${l.type}`}><span style={{ color: "#374151" }}>[{l.t}]</span> {l.msg}</div>
                ))}
                <div ref={logsEndRef} />
              </div>
            </div>

            {!isRunning && results.length > 0 && <button className="btn btn-p" onClick={() => setTab("results")} style={{ width: "100%" }}>Xem {results.length} kết quả →</button>}
          </>
        )}

        {/* ── RESULTS ── */}
        {tab === "results" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontSize: 15, color: "#c4b5fd" }}>🖼️ {results.length} mockups</h3>
              {results.length > 0 && <button className="btn btn-p" onClick={downloadAll} style={{ padding: "8px 16px", fontSize: 13 }}>⬇️ Download tất cả</button>}
            </div>
            {!results.length ? (
              <div className="card" style={{ textAlign: "center", padding: 40 }}>
                <div style={{ fontSize: 34, marginBottom: 6 }}>🎨</div>
                <div style={{ fontSize: 13, color: "#64748b" }}>Chưa có kết quả</div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 14 }}>
                {results.map((r) => (
                  <div key={r.id} className="rcard">
                    <img src={r.url} alt="" style={{ width: "100%", height: 190, objectFit: "cover", display: "block" }} />
                    <div style={{ padding: 10 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0" }}>{r.type}</div>
                      <div style={{ fontSize: 10, color: "#64748b", marginTop: 1 }}>{r.src}</div>
                      <button className="btn btn-s" onClick={() => downloadDataUrl(r.url, `vettailor_${r.typeId}_${r.src.replace(/\.[^.]+$/, "")}.png`)} style={{ width: "100%", marginTop: 8, fontSize: 11, padding: "6px", justifyContent: "center" }}>⬇️ Download</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
