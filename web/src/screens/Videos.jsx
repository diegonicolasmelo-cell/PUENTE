export default function Videos({ videos, onOpenVideo, onBack }) {
  return (
    <div className="screen">
      <div className="video-header">
        <button className="back-btn" onClick={onBack}>← Inicio</button>
        <h1>Videos Informativos</h1>
        <p>Cápsulas educativas para entender lo que está viviendo tu familiar</p>
      </div>
      <div className="video-list" style={{ marginTop: "-20px" }}>
        {videos.map((v, i) => (
          <div key={v.title + i} className="video-card fade-up" style={{ animationDelay: `${i * 0.07}s` }} role="button" tabIndex={0} onClick={() => onOpenVideo(v)} onKeyDown={(e) => { if (e.key === "Enter") onOpenVideo(v); }}>
            <div className="video-thumb" style={{ background: `hsl(${i * 47 + 180},70%,92%)` }}>{v.emoji}</div>
            <div style={{ flex: 1 }}>
              <h4>{v.title}</h4>
              <p>{v.desc}</p>
              <div className="video-duration">▶ {v.dur} min{!v.url && " · próximamente"}</div>
            </div>
            <div style={{ color: "var(--slate)" }}>›</div>
          </div>
        ))}
      </div>
    </div>
  );
}
