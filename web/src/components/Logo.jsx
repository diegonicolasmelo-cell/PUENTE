// Logo SVG de Puente UCI (del prototipo v10)
export const PuenteLogo = ({ size = 36, showText = true }) => (
  <div style={{ display:"flex", alignItems:"center", gap: showText ? 10 : 0 }}>
    <svg width={size} height={size * 0.65} viewBox="0 0 220 143" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Arco izquierdo (familia - gris azulado) */}
      <path d="M10 130 Q55 30 110 72 Q55 30 10 130Z" fill="#5a6a7a" opacity="0.85"/>
      <path d="M10 130 Q55 28 110 72" stroke="#4a5a6a" strokeWidth="3" fill="none"/>
      {/* Arco derecho (equipo médico - verde oliva) */}
      <path d="M210 130 Q165 30 110 72 Q165 30 210 130Z" fill="#5a6e4a" opacity="0.85"/>
      <path d="M210 130 Q165 28 110 72" stroke="#4a5e3a" strokeWidth="3" fill="none"/>
      {/* Personas familia (izquierda) */}
      <circle cx="30" cy="62" r="10" fill="#6b7c8d"/>
      <circle cx="55" cy="42" r="12" fill="#7a8d9e"/>
      <circle cx="82" cy="30" r="11" fill="#8a9dae"/>
      {/* Silueta familiar */}
      <circle cx="42" cy="98" r="9" fill="#e8edf2"/>
      <ellipse cx="42" cy="116" rx="12" ry="8" fill="#e8edf2"/>
      <circle cx="62" cy="102" r="6" fill="#e8edf2"/>
      {/* Personas equipo médico (derecha) */}
      <circle cx="190" cy="62" r="10" fill="#6b7e5a"/>
      <circle cx="165" cy="42" r="12" fill="#7a8e6a"/>
      <circle cx="138" cy="30" r="11" fill="#8a9e7a"/>
      {/* Silueta médico/enfermera */}
      <circle cx="172" cy="94" r="9" fill="#e8ede0"/>
      <path d="M163 102 Q172 98 181 102 L184 120 L160 120Z" fill="#e8ede0"/>
      {/* Cruz médica */}
      <rect x="169" y="84" width="6" height="14" rx="1" fill="#5a6e4a"/>
      <rect x="165" y="88" width="14" height="6" rx="1" fill="#5a6e4a"/>
      {/* Burbuja de diálogo central */}
      <ellipse cx="110" cy="90" rx="28" ry="20" fill="white" opacity="0.95"/>
      <path d="M98 108 L110 118 L122 108" fill="white" opacity="0.95"/>
      {/* Base */}
      <line x1="5" y1="130" x2="215" y2="130" stroke="#333" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
    {showText && (
      <span style={{
        fontFamily:"'DM Serif Display', serif",
        fontSize: size * 0.44,
        color: "white",
        letterSpacing: "0.02em",
        lineHeight: 1,
      }}>
        Puente <span style={{color:"#00B4D8"}}>UCI</span>
      </span>
    )}
  </div>
);
export default PuenteLogo;
