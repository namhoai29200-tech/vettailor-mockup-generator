import { useState, useRef, useCallback, useEffect } from "react";

const PLATFORMS = {
  gemini: { id: "gemini", label: "Google Gemini", icon: "✦", color: "#4285f4", keyPlaceholder: "AIzaSy...", keyHelp: "Free tại aistudio.google.com → Get API Key", keyLink: "https://aistudio.google.com",
    models: [{ id: "gemini-2.5-flash-image", label: "Nano Banana", detail: "Free ~500/day", tier: "free" }, { id: "gemini-3.1-flash-image-preview", label: "Nano Banana 2", detail: "Free · Mới nhất", tier: "free" }, { id: "gemini-3-pro-image-preview", label: "Nano Banana Pro", detail: "$0.134/img", tier: "paid" }], supportsImageInput: true },
  openai: { id: "openai", label: "OpenAI GPT Image", icon: "◎", color: "#10a37f", keyPlaceholder: "sk-...", keyHelp: "Lấy tại platform.openai.com → API Keys", keyLink: "https://platform.openai.com/api-keys",
    models: [{ id: "gpt-image-1", label: "GPT Image 1", detail: "$0.02-0.19/img", tier: "paid" }, { id: "gpt-image-1-mini", label: "GPT Image 1 Mini", detail: "Rẻ hơn 50-70%", tier: "paid" }], supportsImageInput: true },
  ideogram: { id: "ideogram", label: "Ideogram", icon: "◆", color: "#8b5cf6", keyPlaceholder: "ig-...", keyHelp: "Lấy tại developer.ideogram.ai", keyLink: "https://developer.ideogram.ai",
    models: [{ id: "V_3", label: "Ideogram v3", detail: "$0.03-0.06/img · Typography tốt nhất", tier: "paid" }, { id: "V_2_TURBO", label: "v2 Turbo", detail: "Nhanh hơn", tier: "paid" }], supportsImageInput: false },
};

const MOCKUP_TYPES = [
  { id: "on_model", label: "On-Model", icon: "👤", description: "Người mặc/đội sản phẩm", prompt: "Generate a photorealistic product mockup photograph. Show a confident middle-aged American male veteran wearing this exact product naturally. He has a strong build, short hair, and a proud demeanor. Background: simple clean outdoor setting with soft natural light. The product design, colors, print, and every detail must be preserved EXACTLY as shown in the reference image. Professional product photography, sharp focus on the product. High resolution. Do NOT add any text, watermarks, or logos not present in the original." },
  { id: "on_model_female", label: "On-Model (Nữ)", icon: "👩", description: "Nữ mặc/đội sản phẩm", prompt: "Generate a photorealistic product mockup photograph. Show a confident American female veteran in her 40s wearing this exact product naturally. She has an athletic build and a proud, confident expression. Background: clean studio setting with soft lighting. The product design, colors, print, and every detail must be preserved EXACTLY as shown in the reference image. Professional product photography, sharp focus on the product. High resolution. Do NOT add any text, watermarks, or logos not present in the original." },
  { id: "flat_lay", label: "Flat Lay", icon: "📐", description: "Background themed", prompt: "Generate a photorealistic flat lay product photography mockup. Place this exact product neatly centered on a rustic dark wooden table. Around the product, arrange themed items: a small folded American flag, metal dog tags, a vintage compass, and a worn leather notebook. Top-down camera angle. The product design, colors, and ALL details must be preserved EXACTLY as shown in the reference image. Soft warm natural lighting. Do NOT add any text, watermarks, or logos not present in the original." },
  { id: "lifestyle_bbq", label: "Lifestyle - BBQ", icon: "🏕️", description: "Cảnh BBQ", prompt: "Generate a photorealistic lifestyle product mockup photograph. Show a person wearing this exact product at a backyard BBQ gathering. Warm golden hour lighting, American flags in background, friends gathered around a grill. The product design must be preserved EXACTLY as shown in the reference image. Cinematic photography style. Do NOT add any text, watermarks, or logos not present in the original." },
  { id: "lifestyle_outdoor", label: "Lifestyle - Outdoor", icon: "🏔️", description: "Outdoor, hiking", prompt: "Generate a photorealistic lifestyle product mockup photograph. Show a rugged American man wearing this exact product while enjoying outdoor activities near a lake with mountains. Morning golden light. The product design must be preserved EXACTLY as shown in the reference image. Do NOT add any text, watermarks, or logos not present in the original." },
  { id: "lifestyle_garage", label: "Lifestyle - Garage", icon: "🔧", description: "Garage, workshop", prompt: "Generate a photorealistic lifestyle product mockup photograph. Show a strong American man wearing this exact product in a classic car garage. Vintage tools, American muscle car in background, warm industrial lighting. The product design must be preserved EXACTLY as shown in the reference image. Do NOT add any text, watermarks, or logos not present in the original." },
  { id: "closeup", label: "Close-up", icon: "🔍", description: "Cận cảnh chi tiết", prompt: "Generate a photorealistic extreme close-up product detail shot of this exact product. Dramatic studio lighting highlighting texture, stitching, and print quality. Macro photography style. Every detail of the original design must be preserved EXACTLY. Do NOT add any text, watermarks, or logos not present in the original." },
  { id: "white_bg", label: "White BG", icon: "⬜", description: "Nền trắng e-commerce", prompt: "Generate a photorealistic product photo on a pure white background for e-commerce listing. Clean soft studio lighting. The product design, colors, and ALL details must be preserved EXACTLY as shown in the reference image. Do NOT add any text, watermarks, or logos not present in the original." },
];

const PRESETS = {
  quick: { label: "⚡ Quick (4)", types: ["on_model", "flat_lay", "lifestyle_bbq", "closeup"] },
  full: { label: "🎯 Full (8)", types: MOCKUP_TYPES.map((m) => m.id) },
  ecommerce: { label: "🛒 E-com (3)", types: ["on_model", "closeup", "white_bg"] },
  social: { label: "📱 Social (4)", types: ["on_model", "lifestyle_bbq", "lifestyle_outdoor", "lifestyle_garage"] },
};

const STATUS = { IDLE: "idle", GENERATING: "generating", SUCCESS: "success", ERROR: "error" };

// ── API ADAPTERS ──

async function callGemini(key, model, b64, mime, prompt, sig) {
  const parts = [{ text: prompt }];
  if (b64) parts.unshift({ inline_data: { mime_type: mime, data: b64 } });
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ role: "user", parts }], generationConfig: { responseModalities: ["TEXT", "IMAGE"] } }), signal: sig });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e?.error?.message || `Gemini ${res.status}`); }
  const data = await res.json();
  const ps = data?.candidates?.[0]?.content?.parts || [];
  const img = ps.find((p) => p.inlineData || p.inline_data);
  if (!img) throw new Error(ps.find((p) => p.text)?.text?.slice(0, 120) || "No image");
  const d = img.inlineData || img.inline_data;
  return `data:${d.mimeType || d.mime_type};base64,${d.data}`;
}

async function callOpenAI(key, model, b64, mime, prompt, sig) {
  if (b64) {
    const bytes = atob(b64); const ab = new ArrayBuffer(bytes.length); const ia = new Uint8Array(ab);
    for (let i = 0; i < bytes.length; i++) ia[i] = bytes.charCodeAt(i);
    const form = new FormData();
    form.append("image", new Blob([ab], { type: mime }), `product.${mime.includes("png") ? "png" : "jpg"}`);
    form.append("prompt", prompt); form.append("model", model); form.append("size", "1024x1024"); form.append("response_format", "b64_json");
    const res = await fetch("https://api.openai.com/v1/images/edits", { method: "POST", headers: { Authorization: `Bearer ${key}` }, body: form, signal: sig });
    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e?.error?.message || `OpenAI ${res.status}`); }
    const data = await res.json();
    return `data:image/png;base64,${data.data[0].b64_json}`;
  } else {
    const res = await fetch("https://api.openai.com/v1/images/generations", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` }, body: JSON.stringify({ model, prompt, size: "1024x1024", response_format: "b64_json", n: 1 }), signal: sig });
    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e?.error?.message || `OpenAI ${res.status}`); }
    const data = await res.json();
    return `data:image/png;base64,${data.data[0].b64_json}`;
  }
}

async function callIdeogram(key, model, b64, mime, prompt, sig) {
  const res = await fetch("https://api.ideogram.ai/generate", { method: "POST", headers: { "Content-Type": "application/json", "Api-Key": key }, body: JSON.stringify({ image_request: { prompt, model, magic_prompt_option: "AUTO", aspect_ratio: "ASPECT_1_1" } }), signal: sig });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e?.message || `Ideogram ${res.status}`); }
  const data = await res.json();
  const url = data?.data?.[0]?.url;
  if (!url) throw new Error("No image URL from Ideogram");
  const imgRes = await fetch(url, { signal: sig }); const blob = await imgRes.blob();
  return new Promise((ok, fail) => { const r = new FileReader(); r.onloadend = () => ok(r.result); r.onerror = fail; r.readAsDataURL(blob); });
}

async function gen(platform, key, model, b64, mime, prompt, sig) {
  if (platform === "gemini") return callGemini(key, model, b64, mime, prompt, sig);
  if (platform === "openai") return callOpenAI(key, model, b64, mime, prompt, sig);
  if (platform === "ideogram") return callIdeogram(key, model, b64, mime, prompt, sig);
  throw new Error("Unknown platform");
}

function Badge({ status }) {
  const m = { idle: { bg: "#374151", c: "#d1d5db", t: "Chờ" }, generating: { bg: "#7c3aed", c: "#ddd6fe", t: "Đang tạo..." }, success: { bg: "#059669", c: "#a7f3d0", t: "✓ Xong" }, error: { bg: "#dc2626", c: "#fecaca", t: "Lỗi" } };
  const s = m[status] || m.idle;
  return <span style={{ padding: "2px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600, background: s.bg, color: s.c, whiteSpace: "nowrap" }}>{status === "generating" && <span style={{ display: "inline-block", animation: "spin 1s linear infinite", marginRight: 4 }}>◌</span>}{s.t}</span>;
}

function dl(url, name) { const a = document.createElement("a"); a.href = url; a.download = name; document.body.appendChild(a); a.click(); document.body.removeChild(a); }

// ── MAIN APP ──

export default function App() {
  const [plat, setPlat] = useState(() => localStorage.getItem("vt_plat") || "gemini");
  const [keys, setKeys] = useState(() => { try { return JSON.parse(localStorage.getItem("vt_keys") || "{}"); } catch { return {}; } });
  const [showKey, setShowKey] = useState(false);
  const [model, setModel] = useState("");
  const [imgs, setImgs] = useState([]);
  const [selTypes, setSelTypes] = useState(PRESETS.quick.types);
  const [custPrompts, setCustPrompts] = useState({});
  const [queue, setQueue] = useState([]);
  const [results, setResults] = useState([]);
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState([]);
  const [prog, setProg] = useState({ c: 0, t: 0 });
  const [tab, setTab] = useState("setup");
  const [delay, setDelay] = useState(4);
  const fileRef = useRef(null);
  const abortRef = useRef(null);
  const logEnd = useRef(null);

  const pf = PLATFORMS[plat];
  const key = keys[plat] || "";

  useEffect(() => { try { localStorage.setItem("vt_keys", JSON.stringify(keys)); } catch {} }, [keys]);
  useEffect(() => { localStorage.setItem("vt_plat", plat); const ms = PLATFORMS[plat]?.models; if (ms?.length) setModel(ms[0].id); }, [plat]);
  useEffect(() => { logEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [logs]);

  const setKey = (v) => setKeys((p) => ({ ...p, [plat]: v }));
  const log = useCallback((msg, type = "info") => setLogs((p) => [...p, { t: new Date().toLocaleTimeString(), msg, type }]), []);

  const onUpload = (e) => {
    Array.from(e.target.files).forEach((f) => {
      const r = new FileReader();
      r.onload = (ev) => setImgs((p) => [...p, { id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, name: f.name, url: ev.target.result, b64: ev.target.result.split(",")[1], mime: f.type }]);
      r.readAsDataURL(f);
    });
    e.target.value = "";
  };

  const toggleType = (id) => setSelTypes((p) => p.includes(id) ? p.filter((t) => t !== id) : [...p, id]);

  const startGen = async () => {
    if (!key) return log("Chưa nhập API Key!", "error");
    if (!imgs.length) return log("Chưa upload ảnh!", "error");
    if (!selTypes.length) return log("Chưa chọn mockup!", "error");
    const q = []; imgs.forEach((img) => selTypes.forEach((tid) => { const mt = MOCKUP_TYPES.find((m) => m.id === tid); q.push({ id: `${img.id}_${tid}`, img, mt, status: STATUS.IDLE, result: null, error: null }); }));
    setQueue(q); setResults([]); setRunning(true); setTab("generate"); setProg({ c: 0, t: q.length });
    const ctrl = new AbortController(); abortRef.current = ctrl;
    log(`🚀 ${q.length} mockups · ${pf.label} · ${model}`);
    const u = [...q]; let ok = 0;
    for (let i = 0; i < q.length; i++) {
      if (ctrl.signal.aborted) { log("⏹ Dừng.", "warn"); break; }
      u[i] = { ...u[i], status: STATUS.GENERATING }; setQueue([...u]); setProg({ c: i + 1, t: q.length });
      const prompt = custPrompts[q[i].mt.id] || q[i].mt.prompt;
      const b64 = pf.supportsImageInput ? q[i].img.b64 : null;
      const fp = pf.supportsImageInput ? prompt : `${prompt}\n\nProduct: ${q[i].img.name}`;
      log(`[${i + 1}/${q.length}] ${q[i].img.name} → ${q[i].mt.label}`);
      try {
        const url = await gen(plat, key, model, b64, q[i].img.mime, fp, ctrl.signal);
        u[i] = { ...u[i], status: STATUS.SUCCESS, result: url };
        setResults((p) => [...p, { id: q[i].id, url, src: q[i].img.name, type: q[i].mt.label, tid: q[i].mt.id }]);
        ok++; log(`✅ ${q[i].mt.label}`, "success");
      } catch (err) {
        if (err.name === "AbortError") break;
        u[i] = { ...u[i], status: STATUS.ERROR, error: err.message }; log(`❌ ${err.message}`, "error");
        if (err.message.match(/429|quota|rate/i)) {
          log("⏳ Rate limit — 30s...", "warn"); await new Promise((r) => setTimeout(r, 30000));
          if (ctrl.signal.aborted) break;
          try { const url = await gen(plat, key, model, b64, q[i].img.mime, fp, ctrl.signal); u[i] = { ...u[i], status: STATUS.SUCCESS, result: url, error: null }; setResults((p) => [...p, { id: q[i].id, url, src: q[i].img.name, type: q[i].mt.label, tid: q[i].mt.id }]); ok++; log(`✅ Retry OK`, "success"); } catch (re) { if (re.name === "AbortError") break; log(`❌ ${re.message}`, "error"); }
        }
      }
      setQueue([...u]);
      if (i < q.length - 1 && !ctrl.signal.aborted) await new Promise((r) => setTimeout(r, delay * 1000));
    }
    setRunning(false); log(`🏁 ${ok}/${q.length} thành công.`);
  };

  const dlAll = () => results.forEach((r, i) => setTimeout(() => dl(r.url, `vettailor_${r.tid}_${r.src.replace(/\.[^.]+$/, "")}.png`), i * 400));
  const total = imgs.length * selTypes.length;
  const tabs = [{ id: "setup", l: "Setup", i: "⚙️" }, { id: "upload", l: "Upload", i: "📤" }, { id: "config", l: "Config", i: "🎨" }, { id: "generate", l: "Generate", i: "🚀" }, { id: "results", l: `Results${results.length ? ` (${results.length})` : ""}`, i: "🖼️" }];

  return (
    <div style={{ fontFamily: "'Segoe UI',-apple-system,system-ui,sans-serif", background: "linear-gradient(145deg,#0a0a15,#111827,#0f172a)", color: "#e2e8f0", minHeight: "100vh" }}>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}*{box-sizing:border-box}::selection{background:#7c3aed;color:#fff}::-webkit-scrollbar{width:6px}::-webkit-scrollbar-thumb{background:#374151;border-radius:3px}.card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:20px;margin-bottom:14px}.inp{background:rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.1);color:#e2e8f0;padding:10px 14px;border-radius:8px;font-size:14px;width:100%;outline:none}.inp:focus{border-color:#7c3aed}.inp::placeholder{color:#4b5563}textarea.inp{resize:vertical;min-height:50px}.btn{border:none;cursor:pointer;font-weight:600;border-radius:8px;font-size:14px;display:inline-flex;align-items:center;gap:6px;transition:all .15s}.btn-p{background:linear-gradient(135deg,#7c3aed,#6d28d9);color:#fff;padding:11px 22px}.btn-p:hover{box-shadow:0 4px 20px rgba(124,58,237,.4)}.btn-p:disabled{opacity:.4;cursor:not-allowed}.btn-s{background:rgba(255,255,255,.07);color:#c0c8d8;border:1px solid rgba(255,255,255,.1);padding:8px 14px;font-size:13px}.btn-s:hover{background:rgba(255,255,255,.12)}.btn-d{background:rgba(220,38,38,.15);color:#fca5a5;border:1px solid rgba(220,38,38,.25);padding:10px 20px}.tab{padding:10px 16px;border:none;cursor:pointer;font-size:13px;font-weight:600;border-radius:10px 10px 0 0;display:flex;align-items:center;gap:6px;background:transparent;color:#64748b;transition:all .2s}.tab:hover{color:#94a3b8}.tab.on{background:rgba(124,58,237,.15);color:#c4b5fd;border-bottom:2px solid #7c3aed}.mcard{border:2px solid rgba(255,255,255,.06);border-radius:12px;padding:14px;cursor:pointer;transition:all .2s;background:rgba(0,0,0,.15)}.mcard:hover{border-color:rgba(124,58,237,.3)}.mcard.on{border-color:#7c3aed;background:rgba(124,58,237,.08)}.pbar{height:5px;background:rgba(255,255,255,.06);border-radius:3px;overflow:hidden}.pfill{height:100%;background:linear-gradient(90deg,#7c3aed,#a78bfa);border-radius:3px;transition:width .4s}.log{padding:3px 0;font-size:12px;font-family:Consolas,monospace;animation:fadeIn .25s}.log-info{color:#94a3b8}.log-success{color:#6ee7b7}.log-error{color:#fca5a5}.log-warn{color:#fcd34d}.rcard{border-radius:12px;overflow:hidden;background:rgba(0,0,0,.25);border:1px solid rgba(255,255,255,.06);transition:all .2s}.rcard:hover{transform:translateY(-3px);box-shadow:0 8px 30px rgba(0,0,0,.4)}.pfb{padding:12px 16px;border-radius:10px;cursor:pointer;border:2px solid rgba(255,255,255,.06);background:rgba(0,0,0,.2);display:flex;align-items:center;gap:10px;width:100%;transition:all .2s}.pfb:hover{border-color:rgba(255,255,255,.15)}.pfb.on{border-color:var(--pc);background:rgba(255,255,255,.04)}`}</style>

      <header style={{ padding: "18px 24px 0", borderBottom: "1px solid rgba(255,255,255,.05)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 21, fontWeight: 700, color: "#f1f5f9", display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 26 }}>🎖️</span> Vettailor Mockup Generator</h1>
            <p style={{ margin: "3px 0 0", fontSize: 12, color: "#64748b" }}>Multi-platform AI mockup · <span style={{ color: pf.color }}>{pf.icon} {pf.label}</span></p>
          </div>
          {running && <div style={{ textAlign: "right" }}><div style={{ fontSize: 12, color: "#a78bfa", fontWeight: 600, marginBottom: 3 }}>{prog.c}/{prog.t}</div><div className="pbar" style={{ width: 110 }}><div className="pfill" style={{ width: `${prog.t ? (prog.c / prog.t) * 100 : 0}%` }} /></div></div>}
        </div>
        <div style={{ display: "flex", gap: 3, overflowX: "auto" }}>{tabs.map((t) => <button key={t.id} className={`tab ${tab === t.id ? "on" : ""}`} onClick={() => setTab(t.id)}><span>{t.i}</span><span style={{ whiteSpace: "nowrap" }}>{t.l}</span></button>)}</div>
      </header>

      <main style={{ padding: "20px 24px 40px", maxWidth: 920, margin: "0 auto" }}>

        {tab === "setup" && (<>
          <div className="card">
            <h3 style={{ margin: "0 0 12px", fontSize: 15, color: "#c4b5fd" }}>🌐 Chọn nền tảng AI</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {Object.values(PLATFORMS).map((p) => (
                <button key={p.id} className={`pfb ${plat === p.id ? "on" : ""}`} style={{ "--pc": p.color }} onClick={() => setPlat(p.id)}>
                  <span style={{ fontSize: 22, color: p.color, width: 30, textAlign: "center" }}>{p.icon}</span>
                  <div style={{ flex: 1, textAlign: "left" }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>{p.label}</div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>{p.models.map((m) => m.label).join(" · ")}{!p.supportsImageInput && <span style={{ color: "#fcd34d", marginLeft: 6 }}>⚠ Text-only</span>}</div>
                  </div>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${plat === p.id ? p.color : "rgba(255,255,255,.15)"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>{plat === p.id && <div style={{ width: 10, height: 10, borderRadius: "50%", background: p.color }} />}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 style={{ margin: "0 0 4px", fontSize: 15, color: "#c4b5fd" }}>🔑 {pf.label} API Key</h3>
            <p style={{ margin: "0 0 12px", fontSize: 12, color: "#64748b" }}>{pf.keyHelp} <a href={pf.keyLink} target="_blank" rel="noopener noreferrer" style={{ color: pf.color, textDecoration: "none" }}>↗ Mở</a></p>
            <div style={{ display: "flex", gap: 8 }}><input className="inp" type={showKey ? "text" : "password"} placeholder={pf.keyPlaceholder} value={key} onChange={(e) => setKey(e.target.value)} style={{ flex: 1 }} /><button className="btn btn-s" onClick={() => setShowKey(!showKey)}>{showKey ? "🙈" : "👁️"}</button></div>
            <div style={{ marginTop: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 5, display: "block" }}>Model</label>
              {pf.models.map((m) => (
                <label key={m.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 8, cursor: "pointer", marginBottom: 4, background: model === m.id ? "rgba(124,58,237,.12)" : "rgba(0,0,0,.2)", border: `1px solid ${model === m.id ? "rgba(124,58,237,.35)" : "rgba(255,255,255,.05)"}` }}>
                  <input type="radio" name="model" checked={model === m.id} onChange={() => setModel(m.id)} style={{ accentColor: "#7c3aed" }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{m.label}</span>
                  <span style={{ fontSize: 11, color: "#64748b" }}>{m.detail}</span>
                  {m.tier === "free" && <span style={{ marginLeft: "auto", fontSize: 10, padding: "2px 8px", borderRadius: 99, background: "rgba(5,150,105,.15)", color: "#6ee7b7", fontWeight: 600 }}>FREE</span>}
                </label>
              ))}
            </div>
            <div style={{ marginTop: 14, display: "flex", gap: 16, alignItems: "center" }}>
              <div><label style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: 4 }}>Delay (s)</label><input className="inp" type="number" min={1} max={30} value={delay} onChange={(e) => setDelay(Math.max(1, +e.target.value))} style={{ width: 80 }} /></div>
              <div style={{ fontSize: 11, color: "#4b5563", marginTop: 16 }}>Tránh rate limit</div>
            </div>
          </div>
          {!pf.supportsImageInput && <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(250,204,21,.08)", border: "1px solid rgba(250,204,21,.2)", marginBottom: 14, fontSize: 12, color: "#fcd34d" }}>⚠ {pf.label} không nhận ảnh gốc. App dùng prompt mô tả để generate — kết quả có thể khác design gốc.</div>}
          <button className="btn btn-p" onClick={() => key && setTab("upload")} disabled={!key} style={{ width: "100%" }}>Tiếp → Upload ảnh</button>
        </>)}

        {tab === "upload" && (<>
          <div className="card">
            <h3 style={{ margin: "0 0 14px", fontSize: 15, color: "#c4b5fd" }}>📤 Upload ảnh sản phẩm</h3>
            <div style={{ border: "2px dashed rgba(255,255,255,.12)", borderRadius: 14, padding: 36, textAlign: "center", cursor: "pointer", background: "rgba(0,0,0,.1)" }} onClick={() => fileRef.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); onUpload({ target: { files: e.dataTransfer.files }, value: "" }); }}>
              <div style={{ fontSize: 34, marginBottom: 6 }}>📁</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#c0c8d8" }}>Click hoặc kéo thả ảnh</div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}>PNG, JPG, WEBP</div>
              <input ref={fileRef} type="file" accept="image/*" multiple onChange={onUpload} style={{ display: "none" }} />
            </div>
            {imgs.length > 0 && <div style={{ marginTop: 16 }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><span style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8" }}>{imgs.length} ảnh</span><button className="btn btn-s" onClick={() => setImgs([])} style={{ fontSize: 11 }}>Xoá tất cả</button></div><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(90px,1fr))", gap: 8 }}>{imgs.map((img) => <div key={img.id} style={{ position: "relative" }}><img src={img.url} alt="" style={{ width: "100%", height: 90, objectFit: "cover", borderRadius: 8, border: "1px solid rgba(255,255,255,.08)" }} /><button onClick={() => setImgs((p) => p.filter((i) => i.id !== img.id))} style={{ position: "absolute", top: 3, right: 3, width: 20, height: 20, borderRadius: "50%", border: "none", background: "rgba(220,38,38,.8)", color: "#fff", fontSize: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button><div style={{ fontSize: 9, color: "#64748b", marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{img.name}</div></div>)}</div></div>}
          </div>
          <button className="btn btn-p" onClick={() => imgs.length && setTab("config")} disabled={!imgs.length} style={{ width: "100%" }}>Tiếp → Chọn mockup</button>
        </>)}

        {tab === "config" && (<>
          <div className="card">
            <h3 style={{ margin: "0 0 4px", fontSize: 15, color: "#c4b5fd" }}>🎨 Chọn loại mockup</h3>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>{Object.entries(PRESETS).map(([k, v]) => <button key={k} className="btn btn-s" onClick={() => setSelTypes([...v.types])} style={{ fontSize: 12 }}>{v.label}</button>)}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {MOCKUP_TYPES.map((m) => (
                <div key={m.id} className={`mcard ${selTypes.includes(m.id) ? "on" : ""}`} onClick={() => toggleType(m.id)}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 20 }}>{m.icon}</span>
                    <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{m.label}</div><div style={{ fontSize: 11, color: "#64748b" }}>{m.description}</div></div>
                    <div style={{ width: 20, height: 20, borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, background: selTypes.includes(m.id) ? "#7c3aed" : "rgba(255,255,255,.06)", border: `1px solid ${selTypes.includes(m.id) ? "#7c3aed" : "rgba(255,255,255,.1)"}`, color: "#fff", flexShrink: 0 }}>{selTypes.includes(m.id) ? "✓" : ""}</div>
                  </div>
                  {selTypes.includes(m.id) && <div onClick={(e) => e.stopPropagation()} style={{ marginTop: 8 }}><textarea className="inp" placeholder="Custom prompt (trống = mặc định)..." value={custPrompts[m.id] || ""} onChange={(e) => setCustPrompts((p) => ({ ...p, [m.id]: e.target.value }))} rows={2} style={{ fontSize: 11 }} /></div>}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14, padding: "12px 14px", borderRadius: 10, background: "rgba(124,58,237,.06)", border: "1px solid rgba(124,58,237,.12)" }}>
              <span style={{ fontSize: 13, color: "#94a3b8" }}>{imgs.length} ảnh × {selTypes.length} loại = </span><strong style={{ color: "#c4b5fd", fontSize: 15 }}>{total} mockups</strong>
              <span style={{ fontSize: 12, color: "#64748b", marginLeft: 8 }}>~{Math.ceil((total * (delay + 5)) / 60)} phút</span>
              <span style={{ fontSize: 11, color: pf.color, marginLeft: 8 }}>{pf.icon} {pf.label}</span>
            </div>
          </div>
          <button className="btn btn-p" onClick={startGen} disabled={running || !total} style={{ width: "100%" }}>🚀 Generate {total} mockups</button>
        </>)}

        {tab === "generate" && (<>
          <div className="card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 15, color: "#c4b5fd" }}>{running ? "⚡ Generating..." : "📋 Queue"}</h3>
              {running && <button className="btn btn-d" onClick={() => abortRef.current?.abort()}>⏹ Dừng</button>}
            </div>
            {prog.t > 0 && <div style={{ marginBottom: 14 }}><div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginBottom: 3 }}><span>Tiến độ</span><span>{Math.round((prog.c / prog.t) * 100)}%</span></div><div className="pbar"><div className="pfill" style={{ width: `${(prog.c / prog.t) * 100}%` }} /></div></div>}
            <div style={{ maxHeight: 260, overflowY: "auto" }}>{queue.map((q) => <div key={q.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,.03)" }}><img src={q.img.url} alt="" style={{ width: 34, height: 34, objectFit: "cover", borderRadius: 6 }} /><div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 12, fontWeight: 500, color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{q.img.name} → {q.mt.icon} {q.mt.label}</div>{q.error && <div style={{ fontSize: 10, color: "#fca5a5", marginTop: 1 }}>{q.error}</div>}</div><Badge status={q.status} /></div>)}</div>
          </div>
          <div className="card"><h4 style={{ margin: "0 0 6px", fontSize: 13, color: "#94a3b8" }}>📝 Logs</h4><div style={{ maxHeight: 180, overflowY: "auto", background: "rgba(0,0,0,.25)", borderRadius: 8, padding: 10, fontFamily: "Consolas,monospace" }}>{logs.length === 0 ? <div style={{ fontSize: 11, color: "#374151" }}>...</div> : logs.map((l, i) => <div key={i} className={`log log-${l.type}`}><span style={{ color: "#374151" }}>[{l.t}]</span> {l.msg}</div>)}<div ref={logEnd} /></div></div>
          {!running && results.length > 0 && <button className="btn btn-p" onClick={() => setTab("results")} style={{ width: "100%" }}>Xem {results.length} kết quả →</button>}
        </>)}

        {tab === "results" && (<>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}><h3 style={{ margin: 0, fontSize: 15, color: "#c4b5fd" }}>🖼️ {results.length} mockups</h3>{results.length > 0 && <button className="btn btn-p" onClick={dlAll} style={{ padding: "8px 16px", fontSize: 13 }}>⬇️ Download all</button>}</div>
          {!results.length ? <div className="card" style={{ textAlign: "center", padding: 40 }}><div style={{ fontSize: 34, marginBottom: 6 }}>🎨</div><div style={{ fontSize: 13, color: "#64748b" }}>Chưa có kết quả</div></div>
          : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 14 }}>{results.map((r) => <div key={r.id} className="rcard"><img src={r.url} alt="" style={{ width: "100%", height: 190, objectFit: "cover", display: "block" }} /><div style={{ padding: 10 }}><div style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0" }}>{r.type}</div><div style={{ fontSize: 10, color: "#64748b", marginTop: 1 }}>{r.src}</div><button className="btn btn-s" onClick={() => dl(r.url, `vettailor_${r.tid}_${r.src.replace(/\.[^.]+$/, "")}.png`)} style={{ width: "100%", marginTop: 8, fontSize: 11, padding: "6px", justifyContent: "center" }}>⬇️ Download</button></div></div>)}</div>}
        </>)}
      </main>
    </div>
  );
}
