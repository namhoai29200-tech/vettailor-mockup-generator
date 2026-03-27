// ═══════════════════════════════════════════════════════
// CHỖ 1: Thêm import ở đầu file App.jsx (dòng 1)
// ═══════════════════════════════════════════════════════

import BannerEditor from "./BannerEditor.jsx";

// ═══════════════════════════════════════════════════════
// CHỖ 2: Thêm state trong function App() 
// (cạnh các state khác như results, running, etc.)
// ═══════════════════════════════════════════════════════

const [editingImage, setEditingImage] = useState(null); // URL of image being edited

// ═══════════════════════════════════════════════════════
// CHỖ 3: Thay thế TOÀN BỘ section RESULTS trong return()
// Tìm: {tab === "results" && (<> ... </>)}
// Thay bằng code dưới đây:
// ═══════════════════════════════════════════════════════

{tab === "results" && (<>
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
    <h3 style={{ margin: 0, fontSize: 15, color: "#c4b5fd" }}>🖼️ {results.length} {bannerMode ? "banners" : "mockups"}</h3>
    {results.length > 0 && <button className="btn btn-p" onClick={dlAll} style={{ padding: "8px 16px", fontSize: 13 }}>⬇️ Download all</button>}
  </div>
  {!results.length
    ? <div className="card" style={{ textAlign: "center", padding: 40 }}><div style={{ fontSize: 34, marginBottom: 6 }}>🎨</div><div style={{ fontSize: 13, color: "#64748b" }}>Chưa có kết quả</div></div>
    : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 14 }}>
        {results.map(r => (
          <div key={r.id} className="rcard">
            <img src={r.url} alt="" style={{ width: "100%", height: 200, objectFit: "cover", display: "block" }} />
            <div style={{ padding: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0" }}>{r.type}</div>
              <div style={{ fontSize: 10, color: "#64748b", marginTop: 1 }}>{r.src}</div>
              <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                <button className="btn btn-s" onClick={() => dl(r.url, `vettailor_${r.tid}_${r.src.replace(/\.[^.]+$/, "")}.png`)} style={{ flex: 1, fontSize: 11, padding: "6px", justifyContent: "center" }}>⬇️ Download</button>
                <button className="btn btn-s" onClick={() => setEditingImage(r.url)} style={{ flex: 1, fontSize: 11, padding: "6px", justifyContent: "center", borderColor: "rgba(124,58,237,.4)", color: "#c4b5fd" }}>✏️ Edit</button>
              </div>
            </div>
          </div>
        ))}
      </div>
  }

  {/* Banner Editor Overlay */}
  {editingImage && (
    <BannerEditor
      imageUrl={editingImage}
      onClose={() => setEditingImage(null)}
    />
  )}
</>)}
