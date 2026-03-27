import { useState, useRef, useEffect, useCallback } from "react";

const fabric = window.fabric;

const FONTS = ["Arial", "Impact", "Georgia", "Courier New", "Trebuchet MS", "Verdana", "Times New Roman"];
const FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32, 36, 42, 48, 56, 64, 72, 84, 96];
const COLORS = ["#ffffff", "#000000", "#cc0000", "#ff6600", "#ffd700", "#4B5320", "#000080", "#c0c0c0", "#c5a229", "#1a1a2e", "#0f6e56", "#7c3aed"];

const BADGE_PRESETS = [
  { id: "bestseller", label: "BEST SELLER", bg: "#c5a229", color: "#000", rx: 20, px: 18, py: 8, fontSize: 16, fontWeight: "bold" },
  { id: "freeship", label: "FREE SHIPPING", bg: "#059669", color: "#fff", rx: 20, px: 16, py: 8, fontSize: 14, fontWeight: "bold" },
  { id: "bogo", label: "BUY 1 GET 1 FREE", bg: "#cc0000", color: "#fff", rx: 6, px: 16, py: 10, fontSize: 18, fontWeight: "bold" },
  { id: "limited", label: "LIMITED TIME", bg: "#ff6600", color: "#fff", rx: 20, px: 16, py: 8, fontSize: 14, fontWeight: "bold" },
  { id: "new", label: "NEW", bg: "#7c3aed", color: "#fff", rx: 20, px: 20, py: 8, fontSize: 16, fontWeight: "bold" },
  { id: "50off", label: "50% OFF", bg: "#cc0000", color: "#fff", rx: 6, px: 20, py: 12, fontSize: 28, fontWeight: "bold" },
  { id: "trusted", label: "★ TRUSTED BY 20,000+ VETERANS", bg: "rgba(0,0,0,0.7)", color: "#c5a229", rx: 8, px: 14, py: 8, fontSize: 12, fontWeight: "bold" },
  { id: "cta_shop", label: "SHOP NOW →", bg: "#4B5320", color: "#fff", rx: 8, px: 30, py: 14, fontSize: 20, fontWeight: "bold" },
  { id: "cta_claim", label: "CLAIM YOURS NOW →", bg: "#c5a229", color: "#1a1a2e", rx: 8, px: 24, py: 14, fontSize: 18, fontWeight: "bold" },
  { id: "cta_custom", label: "CUSTOMIZE YOURS →", bg: "#cc0000", color: "#fff", rx: 8, px: 24, py: 14, fontSize: 18, fontWeight: "bold" },
  { id: "star_badge", label: "★★★★★ 4.9/5", bg: "rgba(0,0,0,0.6)", color: "#ffd700", rx: 20, px: 14, py: 6, fontSize: 14, fontWeight: "bold" },
  { id: "veteran_day", label: "VETERANS DAY SALE", bg: "#000080", color: "#ffd700", rx: 6, px: 18, py: 10, fontSize: 16, fontWeight: "bold" },
];

const SHAPE_PRESETS = [
  { id: "rect", label: "Rectangle", type: "rect" },
  { id: "circle", label: "Circle", type: "circle" },
  { id: "line_h", label: "Line (horizontal)", type: "line_h" },
  { id: "line_v", label: "Line (vertical)", type: "line_v" },
  { id: "divider", label: "Divider strip", type: "divider" },
];

export default function BannerEditor({ imageUrl, onClose }) {
  const canvasEl = useRef(null);
  const fc = useRef(null);
  const wrapRef = useRef(null);
  const fileRef = useRef(null);
  const [sel, setSel] = useState(null);
  const [layers, setLayers] = useState([]);
  const [tool, setTool] = useState("select");
  const [zoom, setZoom] = useState(1);
  const [canvasSize, setCanvasSize] = useState({ w: 1080, h: 1080 });
  const [history, setHistory] = useState([]);
  const [hIdx, setHIdx] = useState(-1);
  const [showBadges, setShowBadges] = useState(false);
  const [showShapes, setShowShapes] = useState(false);

  // ── Init canvas ──
  useEffect(() => {
    if (!canvasEl.current || fc.current) return;
    const c = new fabric.Canvas(canvasEl.current, {
      width: canvasSize.w, height: canvasSize.h,
      backgroundColor: "#111", preserveObjectStacking: true,
      selection: true,
    });
    fc.current = c;

    // Load background
    fabric.Image.fromURL(imageUrl, (img) => {
      if (!img) return;
      const sw = canvasSize.w / img.width, sh = canvasSize.h / img.height;
      const scale = Math.max(sw, sh);
      c.setBackgroundImage(img, c.renderAll.bind(c), {
        scaleX: scale, scaleY: scale,
        left: (canvasSize.w - img.width * scale) / 2,
        top: (canvasSize.h - img.height * scale) / 2,
      });
      saveHistory(c);
    }, { crossOrigin: "anonymous" });

    c.on("selection:created", (e) => onSelect(e.selected?.[0]));
    c.on("selection:updated", (e) => onSelect(e.selected?.[0]));
    c.on("selection:cleared", () => setSel(null));
    c.on("object:modified", () => { refreshLayers(); saveHistory(c); });
    c.on("object:added", () => refreshLayers());
    c.on("object:removed", () => refreshLayers());

    fitCanvas();
    return () => { c.dispose(); fc.current = null; };
  }, [imageUrl]);

  // ── Fit canvas to viewport ──
  const fitCanvas = useCallback(() => {
    if (!wrapRef.current || !fc.current) return;
    const wrap = wrapRef.current;
    const maxW = wrap.clientWidth - 20, maxH = wrap.clientHeight - 20;
    const scale = Math.min(maxW / canvasSize.w, maxH / canvasSize.h, 1);
    setZoom(scale);
    const outer = fc.current.wrapperEl;
    if (outer) { outer.style.transform = `scale(${scale})`; outer.style.transformOrigin = "top left"; }
  }, [canvasSize]);

  useEffect(() => { fitCanvas(); window.addEventListener("resize", fitCanvas); return () => window.removeEventListener("resize", fitCanvas); }, [fitCanvas]);

  // ── Selection ──
  const onSelect = (obj) => {
    if (!obj) { setSel(null); return; }
    setSel({
      type: obj.type, left: Math.round(obj.left), top: Math.round(obj.top),
      width: Math.round(obj.getScaledWidth()), height: Math.round(obj.getScaledHeight()),
      angle: Math.round(obj.angle || 0), opacity: Math.round((obj.opacity || 1) * 100),
      fill: obj.fill || "#fff", fontSize: obj.fontSize, fontFamily: obj.fontFamily,
      fontWeight: obj.fontWeight, fontStyle: obj.fontStyle, textAlign: obj.textAlign,
      text: obj.text, stroke: obj.stroke, strokeWidth: obj.strokeWidth,
      _obj: obj,
    });
  };

  const updateSel = (key, val) => {
    if (!sel?._obj) return;
    const o = sel._obj;
    if (key === "left" || key === "top") o.set(key, +val);
    else if (key === "angle") o.set("angle", +val);
    else if (key === "opacity") o.set("opacity", +val / 100);
    else if (key === "fontSize") o.set("fontSize", +val);
    else if (key === "fontFamily") o.set("fontFamily", val);
    else if (key === "fontWeight") o.set("fontWeight", val === "bold" ? "bold" : "normal");
    else if (key === "fontStyle") o.set("fontStyle", val === "italic" ? "italic" : "normal");
    else if (key === "textAlign") o.set("textAlign", val);
    else if (key === "fill") o.set("fill", val);
    else if (key === "text") o.set("text", val);
    else if (key === "stroke") o.set("stroke", val);
    else if (key === "strokeWidth") o.set("strokeWidth", +val);
    else if (key === "width") { o.set("scaleX", +val / (o.width || 1)); }
    else if (key === "height") { o.set("scaleY", +val / (o.height || 1)); }
    o.setCoords();
    fc.current.renderAll();
    onSelect(o);
  };

  // ── Layers ──
  const refreshLayers = () => {
    if (!fc.current) return;
    const objs = fc.current.getObjects().map((o, i) => ({
      id: i, name: o._editorName || `${o.type} ${i + 1}`, type: o.type,
      visible: o.visible !== false, locked: !!o.lockMovementX, _obj: o,
    }));
    setLayers(objs.reverse());
  };

  const toggleVis = (i) => { const o = fc.current.getObjects()[i]; if (o) { o.visible = !o.visible; fc.current.renderAll(); refreshLayers(); } };
  const toggleLock = (i) => {
    const o = fc.current.getObjects()[i];
    if (!o) return;
    const lock = !o.lockMovementX;
    o.set({ lockMovementX: lock, lockMovementY: lock, lockRotation: lock, lockScalingX: lock, lockScalingY: lock, hasControls: !lock, selectable: !lock });
    fc.current.renderAll(); refreshLayers();
  };
  const removeObj = (i) => { const o = fc.current.getObjects()[i]; if (o) { fc.current.remove(o); saveHistory(fc.current); } };
  const moveLayer = (i, dir) => {
    const o = fc.current.getObjects()[i];
    if (!o) return;
    if (dir === "up") fc.current.bringForward(o);
    else fc.current.sendBackwards(o);
    fc.current.renderAll(); refreshLayers();
  };

  // ── History ──
  const saveHistory = (c) => {
    const json = c.toJSON();
    setHistory(p => { const n = [...p.slice(0, hIdx + 1), json]; setHIdx(n.length - 1); return n.slice(-30); });
  };
  const undo = () => {
    if (hIdx <= 0 || !fc.current) return;
    const ni = hIdx - 1;
    fc.current.loadFromJSON(history[ni], () => { fc.current.renderAll(); refreshLayers(); });
    setHIdx(ni);
  };
  const redo = () => {
    if (hIdx >= history.length - 1 || !fc.current) return;
    const ni = hIdx + 1;
    fc.current.loadFromJSON(history[ni], () => { fc.current.renderAll(); refreshLayers(); });
    setHIdx(ni);
  };

  // ── Tools ──
  const addText = () => {
    const t = new fabric.IText("YOUR TEXT HERE", {
      left: canvasSize.w / 2 - 100, top: canvasSize.h / 2 - 20,
      fontSize: 36, fontFamily: "Impact", fill: "#ffffff", fontWeight: "bold",
      textAlign: "center", stroke: "#000", strokeWidth: 1,
      shadow: new fabric.Shadow({ color: "rgba(0,0,0,0.5)", blur: 4, offsetX: 2, offsetY: 2 }),
    });
    t._editorName = "Text";
    fc.current.add(t); fc.current.setActiveObject(t); fc.current.renderAll();
    setTool("select"); saveHistory(fc.current);
  };

  const addImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      fabric.Image.fromURL(ev.target.result, (img) => {
        const maxDim = canvasSize.w * 0.4;
        const scale = Math.min(maxDim / img.width, maxDim / img.height, 1);
        img.set({ left: canvasSize.w / 2 - (img.width * scale) / 2, top: canvasSize.h / 2 - (img.height * scale) / 2, scaleX: scale, scaleY: scale });
        img._editorName = file.name.slice(0, 20);
        fc.current.add(img); fc.current.setActiveObject(img); fc.current.renderAll();
        saveHistory(fc.current);
      }, { crossOrigin: "anonymous" });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const addBadge = (preset) => {
    const txt = new fabric.Text(preset.label, {
      fontSize: preset.fontSize, fontFamily: "Arial", fontWeight: preset.fontWeight,
      fill: preset.color, textAlign: "center",
    });
    const pad = { x: preset.px, y: preset.py };
    const bg = new fabric.Rect({
      width: txt.width + pad.x * 2, height: txt.height + pad.y * 2,
      fill: preset.bg, rx: preset.rx, ry: preset.rx, originX: "center", originY: "center",
    });
    txt.set({ originX: "center", originY: "center" });
    const group = new fabric.Group([bg, txt], {
      left: canvasSize.w / 2 - (txt.width + pad.x * 2) / 2,
      top: canvasSize.h / 2 - (txt.height + pad.y * 2) / 2,
    });
    group._editorName = preset.label.slice(0, 20);
    fc.current.add(group); fc.current.setActiveObject(group); fc.current.renderAll();
    setShowBadges(false); saveHistory(fc.current);
  };

  const addShape = (type) => {
    let obj;
    if (type === "rect") {
      obj = new fabric.Rect({ left: 100, top: 100, width: 200, height: 100, fill: "rgba(0,0,0,0.5)", stroke: "#fff", strokeWidth: 1, rx: 8, ry: 8 });
      obj._editorName = "Rectangle";
    } else if (type === "circle") {
      obj = new fabric.Circle({ left: 100, top: 100, radius: 60, fill: "rgba(0,0,0,0.5)", stroke: "#fff", strokeWidth: 1 });
      obj._editorName = "Circle";
    } else if (type === "line_h") {
      obj = new fabric.Line([50, 0, 400, 0], { left: 100, top: canvasSize.h / 2, stroke: "#fff", strokeWidth: 2 });
      obj._editorName = "Horizontal line";
    } else if (type === "line_v") {
      obj = new fabric.Line([0, 50, 0, 300], { left: canvasSize.w / 2, top: 100, stroke: "#fff", strokeWidth: 2 });
      obj._editorName = "Vertical line";
    } else if (type === "divider") {
      obj = new fabric.Rect({ left: 0, top: canvasSize.h - 80, width: canvasSize.w, height: 60, fill: "rgba(0,0,0,0.7)" });
      obj._editorName = "Divider strip";
    }
    if (obj) { fc.current.add(obj); fc.current.setActiveObject(obj); fc.current.renderAll(); setShowShapes(false); saveHistory(fc.current); }
  };

  const duplicateSel = () => {
    if (!sel?._obj) return;
    sel._obj.clone((cloned) => {
      cloned.set({ left: cloned.left + 20, top: cloned.top + 20 });
      cloned._editorName = (sel._obj._editorName || "Copy") + " copy";
      fc.current.add(cloned); fc.current.setActiveObject(cloned); fc.current.renderAll();
      saveHistory(fc.current);
    });
  };

  const deleteSel = () => {
    if (!sel?._obj) return;
    fc.current.remove(sel._obj); setSel(null); saveHistory(fc.current);
  };

  // ── Filters (for images) ──
  const applyFilter = (type, val) => {
    if (!sel?._obj || sel._obj.type !== "image") return;
    const img = sel._obj;
    const filters = img.filters || [];
    if (type === "brightness") {
      const f = filters.find(f => f.type === "Brightness");
      if (f) f.brightness = val; else filters.push(new fabric.Image.filters.Brightness({ brightness: val }));
    } else if (type === "contrast") {
      const f = filters.find(f => f.type === "Contrast");
      if (f) f.contrast = val; else filters.push(new fabric.Image.filters.Contrast({ contrast: val }));
    }
    img.filters = filters;
    img.applyFilters();
    fc.current.renderAll();
  };

  // ── Export ──
  const exportPNG = () => {
    if (!fc.current) return;
    fc.current.discardActiveObject().renderAll();
    const dataUrl = fc.current.toDataURL({ format: "png", quality: 1, multiplier: 1 });
    const a = document.createElement("a");
    a.href = dataUrl; a.download = `vettailor_banner_${Date.now()}.png`; a.click();
  };

  // ── Zoom ──
  const setZoomLevel = (z) => {
    setZoom(z);
    const outer = fc.current?.wrapperEl;
    if (outer) { outer.style.transform = `scale(${z})`; outer.style.transformOrigin = "top left"; }
  };

  // ── Delete key ──
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        const ae = document.activeElement;
        if (ae && (ae.tagName === "INPUT" || ae.tagName === "TEXTAREA" || ae.isContentEditable)) return;
        if (fc.current?.getActiveObject()?.isEditing) return;
        deleteSel();
      }
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "z") { e.preventDefault(); undo(); }
        if (e.key === "y") { e.preventDefault(); redo(); }
        if (e.key === "d") { e.preventDefault(); duplicateSel(); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sel, hIdx]);

  // ── UI ──
  const TB = ({ icon, label, onClick, active, disabled }) => (
    <button onClick={onClick} disabled={disabled} title={label} style={{
      padding: "6px 10px", borderRadius: 6, border: `1px solid ${active ? "#7c3aed" : "rgba(255,255,255,.1)"}`,
      background: active ? "rgba(124,58,237,.15)" : "rgba(0,0,0,.2)", color: active ? "#c4b5fd" : disabled ? "#4b5563" : "#c0c8d8",
      fontSize: 12, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap",
      fontFamily: "'Segoe UI',sans-serif",
    }}>{icon} {label}</button>
  );

  const PropField = ({ label, value, onChange, type = "text", min, max, step, options }) => (
    <div style={{ marginBottom: 6 }}>
      <label style={{ fontSize: 10, color: "#64748b", display: "block", marginBottom: 2 }}>{label}</label>
      {options ? (
        <select value={value || ""} onChange={(e) => onChange(e.target.value)} style={inputStyle}>{options.map(o => <option key={o} value={o}>{o}</option>)}</select>
      ) : (
        <input type={type} value={value ?? ""} onChange={(e) => onChange(e.target.value)} min={min} max={max} step={step} style={inputStyle} />
      )}
    </div>
  );

  const inputStyle = { background: "rgba(0,0,0,.35)", border: "1px solid rgba(255,255,255,.1)", color: "#e2e8f0", padding: "5px 8px", borderRadius: 4, fontSize: 11, width: "100%", outline: "none" };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "#0a0a15", display: "flex", flexDirection: "column", fontFamily: "'Segoe UI',sans-serif", color: "#e2e8f0" }}>
      {/* ── Toolbar ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderBottom: "1px solid rgba(255,255,255,.08)", background: "rgba(0,0,0,.3)", flexWrap: "wrap" }}>
        <TB icon="↖" label="Select" onClick={() => setTool("select")} active={tool === "select"} />
        <div style={{ width: 1, height: 24, background: "rgba(255,255,255,.08)" }} />
        <TB icon="T" label="Text" onClick={addText} />
        <TB icon="🖼" label="Image" onClick={() => fileRef.current?.click()} />
        <input ref={fileRef} type="file" accept="image/*" onChange={addImage} style={{ display: "none" }} />
        <div style={{ position: "relative" }}>
          <TB icon="🏷" label="Badge" onClick={() => { setShowBadges(!showBadges); setShowShapes(false); }} active={showBadges} />
          {showBadges && (
            <div style={{ position: "absolute", top: "100%", left: 0, zIndex: 10, background: "#1a1a26", border: "1px solid rgba(255,255,255,.1)", borderRadius: 8, padding: 8, width: 260, maxHeight: 300, overflowY: "auto", marginTop: 4 }}>
              {BADGE_PRESETS.map(b => (
                <button key={b.id} onClick={() => addBadge(b)} style={{ display: "block", width: "100%", textAlign: "left", padding: "6px 10px", marginBottom: 3, borderRadius: 6, border: "none", background: "rgba(255,255,255,.04)", color: "#e2e8f0", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                  <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: b.rx, background: b.bg, color: b.color, fontSize: 10, fontWeight: 700, marginRight: 8 }}>{b.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div style={{ position: "relative" }}>
          <TB icon="⬜" label="Shape" onClick={() => { setShowShapes(!showShapes); setShowBadges(false); }} active={showShapes} />
          {showShapes && (
            <div style={{ position: "absolute", top: "100%", left: 0, zIndex: 10, background: "#1a1a26", border: "1px solid rgba(255,255,255,.1)", borderRadius: 8, padding: 8, width: 180, marginTop: 4 }}>
              {SHAPE_PRESETS.map(s => (
                <button key={s.id} onClick={() => addShape(s.type)} style={{ display: "block", width: "100%", textAlign: "left", padding: "6px 10px", marginBottom: 3, borderRadius: 4, border: "none", background: "rgba(255,255,255,.04)", color: "#e2e8f0", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>{s.label}</button>
              ))}
            </div>
          )}
        </div>
        <div style={{ width: 1, height: 24, background: "rgba(255,255,255,.08)" }} />
        {sel && <><TB icon="📋" label="Duplicate" onClick={duplicateSel} /><TB icon="🗑" label="Delete" onClick={deleteSel} /></>}
        <div style={{ width: 1, height: 24, background: "rgba(255,255,255,.08)" }} />
        <TB icon="↩" label="Undo" onClick={undo} disabled={hIdx <= 0} />
        <TB icon="↪" label="Redo" onClick={redo} disabled={hIdx >= history.length - 1} />
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#64748b" }}>
          <TB icon="−" label="" onClick={() => setZoomLevel(Math.max(0.2, zoom - 0.1))} />
          <span style={{ minWidth: 40, textAlign: "center" }}>{Math.round(zoom * 100)}%</span>
          <TB icon="+" label="" onClick={() => setZoomLevel(Math.min(2, zoom + 0.1))} />
          <TB icon="⤢" label="Fit" onClick={fitCanvas} />
        </div>
        <div style={{ width: 1, height: 24, background: "rgba(255,255,255,.08)" }} />
        <TB icon="⬇" label="Export PNG" onClick={exportPNG} />
        <button onClick={onClose} style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid rgba(220,38,38,.3)", background: "rgba(220,38,38,.1)", color: "#fca5a5", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>✕ Close</button>
      </div>

      {/* ── Main area ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Canvas */}
        <div ref={wrapRef} style={{ flex: 1, overflow: "auto", background: "#0f0f1a", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: 20 }}>
          <div style={{ width: canvasSize.w * zoom, height: canvasSize.h * zoom, flexShrink: 0 }}>
            <canvas ref={canvasEl} />
          </div>
        </div>

        {/* Right panel */}
        <div style={{ width: 260, borderLeft: "1px solid rgba(255,255,255,.08)", background: "rgba(0,0,0,.2)", overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Properties */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#7c3aed", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Properties</div>
            {sel ? (<>
              <div style={{ fontSize: 11, color: "#6ee7b7", marginBottom: 8 }}>{sel._obj._editorName || sel.type}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                <PropField label="X" value={sel.left} onChange={v => updateSel("left", v)} type="number" />
                <PropField label="Y" value={sel.top} onChange={v => updateSel("top", v)} type="number" />
                <PropField label="W" value={sel.width} onChange={v => updateSel("width", v)} type="number" />
                <PropField label="H" value={sel.height} onChange={v => updateSel("height", v)} type="number" />
                <PropField label="Rotation" value={sel.angle} onChange={v => updateSel("angle", v)} type="number" min={0} max={360} />
                <PropField label="Opacity %" value={sel.opacity} onChange={v => updateSel("opacity", v)} type="number" min={0} max={100} />
              </div>

              {/* Text properties */}
              {(sel.type === "i-text" || sel.type === "text") && (<>
                <div style={{ marginTop: 8, fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>Text</div>
                <textarea value={sel.text || ""} onChange={e => updateSel("text", e.target.value)} rows={2} style={{ ...inputStyle, resize: "vertical", marginBottom: 4 }} />
                <PropField label="Font" value={sel.fontFamily} onChange={v => updateSel("fontFamily", v)} options={FONTS} />
                <PropField label="Size" value={sel.fontSize} onChange={v => updateSel("fontSize", v)} options={FONT_SIZES.map(String)} />
                <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                  <button onClick={() => updateSel("fontWeight", sel.fontWeight === "bold" ? "normal" : "bold")} style={{ ...inputStyle, width: "auto", padding: "4px 10px", cursor: "pointer", fontWeight: 700, background: sel.fontWeight === "bold" ? "rgba(124,58,237,.2)" : undefined }}>B</button>
                  <button onClick={() => updateSel("fontStyle", sel.fontStyle === "italic" ? "normal" : "italic")} style={{ ...inputStyle, width: "auto", padding: "4px 10px", cursor: "pointer", fontStyle: "italic", background: sel.fontStyle === "italic" ? "rgba(124,58,237,.2)" : undefined }}>I</button>
                  {["left", "center", "right"].map(a => (
                    <button key={a} onClick={() => updateSel("textAlign", a)} style={{ ...inputStyle, width: "auto", padding: "4px 8px", cursor: "pointer", fontSize: 10, background: sel.textAlign === a ? "rgba(124,58,237,.2)" : undefined }}>{a === "left" ? "◀" : a === "center" ? "◆" : "▶"}</button>
                  ))}
                </div>
              </>)}

              {/* Fill color */}
              <div style={{ marginTop: 6 }}>
                <label style={{ fontSize: 10, color: "#64748b", display: "block", marginBottom: 2 }}>Fill color</label>
                <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                  {COLORS.map(c => (
                    <button key={c} onClick={() => updateSel("fill", c)} style={{ width: 20, height: 20, borderRadius: 4, border: sel.fill === c ? "2px solid #7c3aed" : "1px solid rgba(255,255,255,.15)", background: c, cursor: "pointer" }} />
                  ))}
                  <input type="color" value={sel.fill || "#ffffff"} onChange={e => updateSel("fill", e.target.value)} style={{ width: 20, height: 20, border: "none", cursor: "pointer", borderRadius: 4 }} />
                </div>
              </div>

              {/* Stroke */}
              <div style={{ marginTop: 6 }}>
                <label style={{ fontSize: 10, color: "#64748b", display: "block", marginBottom: 2 }}>Stroke</label>
                <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                  <input type="color" value={sel.stroke || "#000000"} onChange={e => updateSel("stroke", e.target.value)} style={{ width: 24, height: 24, border: "none", cursor: "pointer", borderRadius: 4 }} />
                  <input type="number" value={sel.strokeWidth || 0} onChange={e => updateSel("strokeWidth", e.target.value)} min={0} max={20} style={{ ...inputStyle, width: 50 }} />
                </div>
              </div>

              {/* Image filters */}
              {sel.type === "image" && (<>
                <div style={{ marginTop: 8, fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>Filters</div>
                <div style={{ marginBottom: 4 }}>
                  <label style={{ fontSize: 10, color: "#64748b" }}>Brightness</label>
                  <input type="range" min={-0.5} max={0.5} step={0.05} defaultValue={0} onChange={e => applyFilter("brightness", +e.target.value)} style={{ width: "100%" }} />
                </div>
                <div>
                  <label style={{ fontSize: 10, color: "#64748b" }}>Contrast</label>
                  <input type="range" min={-0.5} max={0.5} step={0.05} defaultValue={0} onChange={e => applyFilter("contrast", +e.target.value)} style={{ width: "100%" }} />
                </div>
              </>)}
            </>) : (
              <div style={{ fontSize: 11, color: "#4b5563", textAlign: "center", padding: 20 }}>Click an element to edit</div>
            )}
          </div>

          {/* Layers */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#7c3aed", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Layers ({layers.length})</div>
            {layers.length === 0 ? (
              <div style={{ fontSize: 11, color: "#4b5563", textAlign: "center", padding: 12 }}>No layers yet</div>
            ) : layers.map((l) => {
              const realIdx = fc.current ? fc.current.getObjects().indexOf(l._obj) : -1;
              return (
                <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 6px", marginBottom: 3, borderRadius: 6, background: sel?._obj === l._obj ? "rgba(124,58,237,.12)" : "rgba(0,0,0,.15)", border: `1px solid ${sel?._obj === l._obj ? "rgba(124,58,237,.3)" : "rgba(255,255,255,.04)"}`, cursor: "pointer" }}
                  onClick={() => { if (l._obj.selectable !== false) { fc.current.setActiveObject(l._obj); fc.current.renderAll(); } }}>
                  <span style={{ fontSize: 9, color: "#64748b", width: 14 }}>
                    {l.type === "i-text" || l.type === "text" ? "T" : l.type === "image" ? "🖼" : l.type === "group" ? "🏷" : "⬜"}
                  </span>
                  <span style={{ flex: 1, fontSize: 11, color: l.visible ? "#e2e8f0" : "#4b5563", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.name}</span>
                  <button onClick={(e) => { e.stopPropagation(); moveLayer(realIdx, "up"); }} style={layerBtnStyle} title="Up">↑</button>
                  <button onClick={(e) => { e.stopPropagation(); moveLayer(realIdx, "down"); }} style={layerBtnStyle} title="Down">↓</button>
                  <button onClick={(e) => { e.stopPropagation(); toggleVis(realIdx); }} style={layerBtnStyle} title="Visibility">{l.visible ? "👁" : "👁‍🗨"}</button>
                  <button onClick={(e) => { e.stopPropagation(); toggleLock(realIdx); }} style={layerBtnStyle} title="Lock">{l.locked ? "🔒" : "🔓"}</button>
                  <button onClick={(e) => { e.stopPropagation(); removeObj(realIdx); }} style={{ ...layerBtnStyle, color: "#fca5a5" }} title="Delete">✕</button>
                </div>
              );
            })}
          </div>

          {/* Keyboard shortcuts */}
          <div style={{ fontSize: 10, color: "#374151", lineHeight: 1.6, padding: "8px 0", borderTop: "1px solid rgba(255,255,255,.05)" }}>
            <div style={{ color: "#4b5563", fontWeight: 600, marginBottom: 4 }}>Shortcuts</div>
            <div>Delete — remove selected</div>
            <div>Ctrl+Z — undo</div>
            <div>Ctrl+Y — redo</div>
            <div>Ctrl+D — duplicate</div>
            <div>Double-click text — edit inline</div>
          </div>
        </div>
      </div>
    </div>
  );
}

const layerBtnStyle = {
  width: 20, height: 20, borderRadius: 4, border: "none",
  background: "transparent", color: "#64748b", cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, padding: 0,
};
