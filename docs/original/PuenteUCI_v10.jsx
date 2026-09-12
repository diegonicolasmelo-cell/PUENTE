import { useState, useEffect, useRef } from "react";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --ocean:    #03045E;
    --deep:     #023E8A;
    --teal:     #0077B6;
    --sky:      #0096C7;
    --mint:     #00B4D8;
    --foam:     #90E0EF;
    --mist:     #CAF0F8;
    --warm:     #E9724C;
    --sand:     #FFF3E0;
    --white:    #FFFFFF;
    --slate:    #64748B;
    --light:    #F0F9FF;
    --text:     #0A1628;
    --radius:   16px;
    --shadow:   0 4px 24px rgba(3,4,94,0.10);
    --shadow-lg:0 12px 48px rgba(3,4,94,0.18);
  }

  html, body { height: 100%; }

  body {
    font-family: 'DM Sans', sans-serif;
    background: var(--ocean);
    color: var(--text);
    overflow-x: hidden;
  }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--mint); border-radius: 3px; }

  /* Animations */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50%       { transform: scale(1.05); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-8px); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes ripple {
    to { transform: scale(4); opacity: 0; }
  }

  .fade-up { animation: fadeUp 0.5s ease forwards; }
  .float   { animation: float 4s ease-in-out infinite; }

  /* Stagger delays */
  .delay-1 { animation-delay: 0.1s; }
  .delay-2 { animation-delay: 0.2s; }
  .delay-3 { animation-delay: 0.3s; }
  .delay-4 { animation-delay: 0.4s; }
  .delay-5 { animation-delay: 0.5s; }

  /* App shell */
  .app-root {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #0a0f1e;
  }
  .app-shell {
    width: 100%;
    max-width: 430px;
    min-height: 100vh;
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--light);
    position: relative;
    overflow: hidden;
    box-shadow: 0 0 60px rgba(0,180,216,0.15);
  }

  /* ═══════════════════════════════════════
     DESKTOP LAYOUT  (≥ 900px)
  ═══════════════════════════════════════ */
  @media (min-width: 900px) {
    body { overflow: auto; }

    .app-root {
      align-items: stretch;
      min-height: 100vh;
      background: linear-gradient(135deg, #060b1a 0%, #0a1628 50%, #030b1f 100%);
    }

    .app-shell {
      max-width: 100%;
      width: 100%;
      height: 100vh;
      flex-direction: row;
      overflow: hidden;
      box-shadow: none;
      border-radius: 0;
    }

    /* ── Desktop Sidebar Nav ── */
    .desktop-sidenav {
      display: flex !important;
      flex-direction: column;
      width: 240px;
      min-width: 240px;
      background: var(--ocean);
      height: 100vh;
      position: sticky;
      top: 0;
      z-index: 50;
      border-right: 1px solid rgba(0,180,216,0.12);
      box-shadow: 4px 0 32px rgba(0,0,0,0.35);
      overflow: hidden;
    }
    .dsk-brand {
      padding: 28px 24px 20px;
      border-bottom: 1px solid rgba(255,255,255,0.07);
      flex-shrink: 0;
    }
    .dsk-brand-title {
      font-family: 'DM Serif Display', serif;
      font-size: 1.5rem;
      color: var(--white);
      letter-spacing: 0.02em;
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
    }
    .dsk-brand-title span { color: var(--mint); }
    .dsk-brand-sub {
      font-size: 0.72rem;
      color: rgba(144,224,239,0.6);
      letter-spacing: 0.05em;
    }

    .dsk-patient-pill {
      margin: 16px 16px 0;
      background: rgba(0,180,216,0.1);
      border: 1px solid rgba(0,180,216,0.2);
      border-radius: 12px;
      padding: 12px 14px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .dsk-patient-avatar {
      width: 36px; height: 36px; border-radius: 50%;
      background: linear-gradient(135deg, var(--mint), var(--teal));
      display: flex; align-items: center; justify-content: center;
      font-size: 1rem; flex-shrink: 0;
    }
    .dsk-patient-name {
      font-size: 0.8rem; font-weight: 600; color: var(--white);
      line-height: 1.3;
    }
    .dsk-patient-status {
      font-size: 0.68rem; color: var(--mint); margin-top: 2px;
    }

    .dsk-nav-list {
      flex: 1;
      overflow-y: auto;
      padding: 20px 12px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .dsk-nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 11px 14px;
      border-radius: 12px;
      cursor: pointer;
      border: 1px solid transparent;
      transition: all 0.18s;
      color: rgba(255,255,255,0.55);
      font-size: 0.875rem;
      font-weight: 500;
      font-family: 'DM Sans', sans-serif;
      -webkit-tap-highlight-color: transparent;
    }
    .dsk-nav-item svg { width: 18px; height: 18px; flex-shrink: 0; }
    .dsk-nav-item:hover {
      background: rgba(0,180,216,0.08);
      color: var(--foam);
      border-color: rgba(0,180,216,0.15);
    }
    .dsk-nav-item.active {
      background: rgba(0,180,216,0.15);
      color: var(--mint);
      border-color: rgba(0,180,216,0.3);
    }
    .dsk-nav-item.active svg { stroke: var(--mint); }
    .dsk-nav-sep {
      height: 1px; background: rgba(255,255,255,0.06);
      margin: 8px 0;
    }
    .dsk-nav-section-label {
      font-size: 0.62rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.12em;
      color: rgba(255,255,255,0.25);
      padding: 4px 14px 2px;
    }

    .dsk-nav-footer {
      padding: 16px 12px;
      border-top: 1px solid rgba(255,255,255,0.07);
      flex-shrink: 0;
    }
    .dsk-user-row {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 12px; border-radius: 10px;
      cursor: pointer; transition: background 0.18s;
    }
    .dsk-user-row:hover { background: rgba(255,255,255,0.06); }
    .dsk-user-avatar {
      width: 34px; height: 34px; border-radius: 50%;
      background: var(--teal); border: 2px solid var(--mint);
      display: flex; align-items: center; justify-content: center;
      font-size: 0.85rem; color: white; font-weight: 600;
      flex-shrink: 0;
    }
    .dsk-user-name { font-size: 0.82rem; font-weight: 600; color: var(--white); }
    .dsk-user-role { font-size: 0.68rem; color: var(--slate); margin-top: 1px; }
    .dsk-edit-btn {
      margin-left: auto; font-size: 0.7rem; color: var(--mint);
      background: none; border: none; cursor: pointer;
      font-family: 'DM Sans', sans-serif;
      padding: 4px 8px; border-radius: 6px;
      transition: background 0.15s;
    }
    .dsk-edit-btn:hover { background: rgba(0,180,216,0.1); }

    /* ── Desktop Content Area ── */
    .desktop-content {
      flex: 1;
      display: flex !important;
      flex-direction: column;
      overflow: hidden;
      background: #f0f4f8;
      min-width: 0;
    }

    /* Top bar on desktop */
    .topnav { display: none !important; }
    .dsk-topbar {
      display: flex !important;
      align-items: center;
      justify-content: space-between;
      padding: 0 32px;
      height: 64px;
      background: white;
      border-bottom: 1px solid #e8eef4;
      flex-shrink: 0;
      box-shadow: 0 1px 8px rgba(0,0,0,0.04);
    }
    .dsk-topbar-title {
      font-family: 'DM Serif Display', serif;
      font-size: 1.2rem;
      color: var(--text);
    }
    .dsk-topbar-right {
      display: flex; align-items: center; gap: 14px;
    }
    .dsk-topbar-patient {
      background: #EFF6FF; border: 1px solid #BFDBFE;
      border-radius: 20px; padding: 5px 14px;
      font-size: 0.78rem; color: var(--teal); font-weight: 500;
    }

    /* Scrollable main on desktop */
    .main-content {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      -webkit-overflow-scrolling: touch;
      padding-bottom: 40px;
    }

    /* Hide mobile bottom nav on desktop */
    .bottom-nav { display: none !important; }

    /* Desktop screen max-width centering */
    .screen { max-width: 860px; margin: 0 auto; }
    .home-hero { border-radius: 0; }

    /* Desktop menu grid — 3 cols */
    .menu-grid { grid-template-columns: 1fr 1fr 1fr; }

    /* Make modals centered on desktop */
    .modal-overlay {
      position: fixed;
      align-items: center;
      justify-content: center;
    }
    .modal-sheet {
      border-radius: 20px;
      max-width: 540px;
      width: 100%;
    }

    /* Sidebar (edit profile) on desktop — centered modal */
    .sidebar-overlay { position: fixed; }
    .sidebar {
      position: fixed;
      top: 0; right: 0; bottom: 0;
      width: min(460px, 45vw);
    }

    /* Toast position on desktop */
    .toast { bottom: 32px; }
  }

  /* ═══════════════════════════════════════
     FICHA IMPRIMIBLE
  ═══════════════════════════════════════ */
  .print-screen {
    padding: 0 0 40px;
  }
  .print-screen-header {
    background: linear-gradient(135deg, #023E8A 0%, #0077B6 100%);
    padding: 28px 32px 36px;
    color: white;
  }
  .print-screen-header h1 {
    font-family: 'DM Serif Display', serif;
    font-size: 1.6rem; margin-bottom: 6px;
  }
  .print-screen-header p { color: #90E0EF; font-size: 0.875rem; }

  .print-preview-wrap {
    margin: -20px 24px 24px;
    background: white;
    border-radius: 20px;
    box-shadow: 0 8px 40px rgba(3,4,94,0.18);
    overflow: hidden;
  }
  .print-actions {
    margin: 0 24px 32px;
    display: flex; gap: 12px; flex-wrap: wrap;
  }
  .print-btn-primary {
    flex: 1; min-width: 160px;
    background: #0077B6; color: white;
    border: none; border-radius: 14px;
    padding: 14px 24px; font-size: 0.95rem; font-weight: 600;
    cursor: pointer; font-family: 'DM Sans', sans-serif;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: all 0.2s;
    box-shadow: 0 4px 16px rgba(0,119,182,0.35);
  }
  .print-btn-primary:hover { background: #023E8A; transform: translateY(-1px); }
  .print-btn-secondary {
    flex: 1; min-width: 160px;
    background: white; color: #0077B6;
    border: 2px solid #0077B6; border-radius: 14px;
    padding: 14px 24px; font-size: 0.95rem; font-weight: 600;
    cursor: pointer; font-family: 'DM Sans', sans-serif;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: all 0.2s;
  }
  .print-btn-secondary:hover { background: #EFF6FF; }

  .print-note {
    margin: 0 24px 20px;
    background: #EFF6FF; border: 1px solid #BFDBFE;
    border-radius: 14px; padding: 14px 16px;
    font-size: 0.82rem; color: #1E40AF; line-height: 1.6;
    display: flex; gap: 10px; align-items: flex-start;
  }

  /* ── La ficha en sí (A4 landscape simulado) ── */
  .patient-poster {
    width: 100%;
    background: #FFFFFF;
    font-family: 'DM Sans', sans-serif;
    position: relative;
    overflow: hidden;
  }

  .poster-top-bar {
    background: linear-gradient(135deg, #03045E 0%, #0077B6 100%);
    padding: 20px 28px 18px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .poster-brand {
    font-family: 'DM Serif Display', serif;
    color: white; font-size: 1.15rem;
    display: flex; align-items: center; gap: 8px;
  }
  .poster-brand span { color: #00B4D8; }
  .poster-tagline {
    font-size: 0.68rem; color: rgba(144,224,239,0.75);
    letter-spacing: 0.08em; text-transform: uppercase;
    margin-top: 2px;
  }
  .poster-uci-badge {
    background: rgba(255,255,255,0.12);
    border: 1px solid rgba(255,255,255,0.25);
    border-radius: 20px; padding: 6px 14px;
    font-size: 0.72rem; color: white; font-weight: 600;
    letter-spacing: 0.04em;
  }

  .poster-body {
    display: grid;
    grid-template-columns: 190px 1fr 200px;
    gap: 0;
    min-height: 440px;
  }

  .poster-left {
    background: linear-gradient(180deg, #F0F9FF 0%, #E0F2FE 100%);
    border-right: 1px solid #BFDBFE;
    padding: 24px 20px;
    display: flex; flex-direction: column; align-items: center;
    gap: 16px;
  }
  .poster-avatar-wrap {
    width: 100px; height: 100px; border-radius: 50%;
    background: linear-gradient(135deg, #0077B6, #00B4D8);
    display: flex; align-items: center; justify-content: center;
    font-size: 3.2rem;
    border: 4px solid white;
    box-shadow: 0 4px 20px rgba(0,119,182,0.3);
    flex-shrink: 0;
  }
  .poster-pat-name {
    text-align: center;
  }
  .poster-pat-name h2 {
    font-family: 'DM Serif Display', serif;
    font-size: 1.1rem; color: #03045E; line-height: 1.25;
    margin-bottom: 4px;
  }
  .poster-pat-name .nickname {
    font-size: 0.82rem; color: #0077B6; font-style: italic; font-weight: 500;
  }

  .poster-left-divider {
    width: 100%; height: 1px; background: #BFDBFE;
  }

  .poster-meta-item {
    width: 100%; text-align: center;
  }
  .poster-meta-label {
    font-size: 0.58rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.1em; color: #64748B; margin-bottom: 3px;
  }
  .poster-meta-value {
    font-size: 0.78rem; color: #0A1628; font-weight: 500; line-height: 1.4;
  }

  .poster-devices {
    width: 100%;
  }
  .poster-devices-title {
    font-size: 0.58rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.1em; color: #64748B; margin-bottom: 6px; text-align: center;
  }
  .poster-devices-grid {
    display: flex; flex-wrap: wrap; gap: 4px; justify-content: center;
  }
  .poster-device-tag {
    background: #EFF6FF; color: #1E40AF;
    border-radius: 8px; padding: 3px 7px;
    font-size: 0.62rem; font-weight: 500;
  }

  .poster-right {
    padding: 20px 24px 20px 22px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto auto;
    gap: 14px;
  }

  .poster-section {
    background: #F8FAFC;
    border-radius: 12px;
    padding: 14px 16px;
    border: 1px solid #E2E8F0;
  }
  .poster-section-title {
    font-size: 0.6rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.12em; color: #0077B6;
    margin-bottom: 8px; display: flex; align-items: center; gap: 5px;
  }
  .poster-tags {
    display: flex; flex-wrap: wrap; gap: 5px;
  }
  .poster-tag {
    background: #EFF6FF; color: #1E40AF;
    border-radius: 8px; padding: 3px 9px;
    font-size: 0.68rem; font-weight: 500;
  }
  .poster-tag.green  { background: #ECFDF5; color: #065F46; }
  .poster-tag.purple { background: #F5F3FF; color: #5B21B6; }
  .poster-tag.orange { background: #FFF7ED; color: #9A3412; }
  .poster-tag.teal   { background: #F0FDFA; color: #0F766E; }
  .poster-empty {
    font-size: 0.72rem; color: #94A3B8; font-style: italic;
  }

  .poster-family-list {
    display: flex; flex-direction: column; gap: 4px;
  }
  .poster-family-item {
    display: flex; align-items: center; gap: 6px;
    font-size: 0.72rem; color: #0A1628;
  }
  .poster-family-emoji { font-size: 0.85rem; }
  .poster-family-name { font-weight: 600; }
  .poster-family-role { color: #64748B; }

  .poster-phrase-section {
    grid-column: 1 / -1;
    background: linear-gradient(135deg, #03045E 0%, #023E8A 100%);
    border-radius: 12px; padding: 16px 20px;
    display: flex; align-items: center; gap: 16px;
    border: none;
  }
  .poster-phrase-icon { font-size: 1.8rem; flex-shrink: 0; }
  .poster-phrase-text {
    font-size: 0.78rem; color: #CAF0F8;
    line-height: 1.6; font-style: italic;
  }
  .poster-phrase-text strong {
    color: white; font-style: normal;
    display: block; margin-bottom: 3px; font-size: 0.68rem;
    text-transform: uppercase; letter-spacing: 0.08em;
  }

  .poster-bottom-bar {
    background: #F8FAFC;
    border-top: 1px solid #E2E8F0;
    padding: 10px 28px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .poster-bottom-left {
    font-size: 0.65rem; color: #94A3B8;
  }
  .poster-bottom-right {
    font-size: 0.65rem; color: #0077B6; font-weight: 600;
    letter-spacing: 0.04em;
  }

  /* ── Columna extra derecha ── */
  .poster-extra {
    border-left: 1px solid #E2E8F0;
    padding: 20px 16px;
    display: flex; flex-direction: column; gap: 14px;
    background: #FAFCFF;
  }
  .poster-extra-section {
    background: white; border-radius: 10px;
    padding: 12px 14px; border: 1px solid #E2E8F0;
  }
  .poster-extra-title {
    font-size: 0.58rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.12em; color: #0077B6;
    margin-bottom: 7px; display: flex; align-items: center; gap: 4px;
  }
  .poster-zona-badge {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 10px; border-radius: 20px;
    font-size: 0.68rem; font-weight: 700;
    margin-top: 6px;
  }
  .zona-urbana { background: #EFF6FF; color: #1E40AF; }
  .zona-rural  { background: #ECFDF5; color: #065F46; }
  .poster-message-lines {
    display: flex; flex-direction: column; gap: 6px; margin-top: 4px;
  }
  .poster-message-line {
    height: 1px; background: #CBD5E1; border-radius: 1px;
  }
  .poster-message-text {
    font-size: 0.72rem; color: #334155; line-height: 1.6;
    font-style: italic;
  }

  /* ── Print media ── */
  @media print {
    body * { visibility: hidden; }
    .patient-poster, .patient-poster * { visibility: visible; }
    .patient-poster {
      position: fixed; top: 0; left: 0;
      width: 297mm; height: 210mm;
      margin: 0; padding: 0;
    }
    @page { size: A4 landscape; margin: 0; }
  }

  /* Hide desktop elements on mobile */
  .desktop-sidenav { display: none; }
  .dsk-topbar { display: none; }
  .desktop-content { display: contents; }

  /* ── Desktop content improvements ── */
  @media (min-width: 900px) {
    /* Hide back buttons on desktop - nav is always visible */
    .back-btn { display: none; }

    /* Better padding for content on desktop */
    .screen-header, .faq-header, .journey-intro,
    .video-header { padding-left: 32px; padding-right: 32px; }

    .menu-grid { padding: 0 32px 32px; }
    .section-title { padding: 28px 32px 14px; }
    .faq-categories { padding: 0 32px 8px; }
    .faq-list { padding: 8px 32px 24px; }
    .video-list { padding: 16px 32px 24px; }
    .journey-map { padding: 0 32px; }
    .journey-note { margin: 24px 32px; }

    .home-hero { padding: 36px 32px 56px; }
    .status-card { margin: -28px 32px 0; }
    .quick-tip { margin: 24px 32px; }

    .content-card { margin: 0 32px 16px; }
    .checklist { padding: 0 32px; }

    .profile-header { padding: 40px 32px 72px; }
    .profile-patient-card { margin: -40px 32px 24px; }
    .profile-section { margin: 0 32px 20px; }

    /* Journey map on desktop */
    .journey-screen .journey-map { max-width: 600px; }

    /* FAQ two-column layout on wide screens */
    @media (min-width: 1200px) {
      .faq-list { columns: 2; gap: 12px; }
      .faq-item { break-inside: avoid; }
    }
  }

  /* ── TOP NAV ── */
  .topnav {
    position: sticky; top: 0; left: 0; right: 0; z-index: 100;
    height: 60px; flex-shrink: 0;
    background: var(--ocean);
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 20px;
    box-shadow: 0 2px 20px rgba(0,0,0,0.3);
  }
  .nav-brand {
    display: flex; align-items: center; gap: 10px;
    font-family: 'DM Serif Display', serif;
    font-size: 1.25rem; color: var(--white); letter-spacing: 0.02em;
  }
  .nav-brand .heart { color: var(--mint); font-size: 1.1rem; }
  .nav-avatar {
    width: 36px; height: 36px; border-radius: 50%;
    background: var(--teal); border: 2px solid var(--mint);
    display: flex; align-items: center; justify-content: center;
    font-size: 0.85rem; color: var(--white); font-weight: 600;
    cursor: pointer;
  }
  .nav-patient-tag {
    background: rgba(0,180,216,0.15);
    border: 1px solid rgba(0,180,216,0.3);
    border-radius: 20px; padding: 4px 12px;
    font-size: 0.75rem; color: var(--mint);
  }

  /* ── MAIN CONTENT ── */
  .main-content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding-bottom: 80px;
    -webkit-overflow-scrolling: touch;
  }

  /* ── BOTTOM NAV ── */
  .bottom-nav {
    position: sticky; bottom: 0; left: 0; right: 0; z-index: 100;
    height: 68px; flex-shrink: 0;
    background: var(--ocean);
    display: flex; align-items: center;
    box-shadow: 0 -2px 20px rgba(0,0,0,0.3);
  }
  .nav-tabs {
    display: flex; width: 100%; height: 100%;
  }
  .nav-tab {
    flex: 1; display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 4px;
    cursor: pointer; border: none; background: transparent;
    color: rgba(255,255,255,0.4);
    font-family: 'DM Sans', sans-serif;
    font-size: 0.65rem; font-weight: 500;
    transition: all 0.2s;
    position: relative;
    -webkit-tap-highlight-color: transparent;
  }
  .nav-tab.active { color: var(--mint); }
  .nav-tab.active::before {
    content: '';
    position: absolute; top: 0; left: 20%; right: 20%;
    height: 2px; background: var(--mint); border-radius: 0 0 2px 2px;
  }
  .nav-tab svg { width: 22px; height: 22px; }
  .nav-tab:hover { color: var(--foam); }

  /* ── SCREENS ── */
  .screen { min-height: calc(100vh - 140px); }

  /* ─────────────── ONBOARDING ─────────────── */
  .onboarding {
    min-height: 100vh; margin-top: 0;
    background: var(--ocean);
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 40px 24px;
    position: relative; overflow: hidden;
  }
  .onboarding-bg {
    position: absolute; inset: 0; pointer-events: none;
  }
  .onboarding-blob {
    position: absolute; border-radius: 50%;
    filter: blur(60px); opacity: 0.15;
  }
  .ob-step { width: 100%; max-width: 400px; opacity: 0; }
  .ob-step.active { animation: fadeUp 0.5s ease forwards; }

  .ob-logo {
    font-family: 'DM Serif Display', serif;
    font-size: 2.5rem; color: var(--white); text-align: center;
    margin-bottom: 8px;
  }
  .ob-logo span { color: var(--mint); }
  .ob-tagline {
    text-align: center; color: var(--foam);
    font-size: 0.95rem; margin-bottom: 40px; line-height: 1.6;
  }
  .ob-card {
    background: rgba(255,255,255,0.06);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 20px; padding: 28px;
    margin-bottom: 20px;
  }
  .ob-card h2 {
    font-family: 'DM Serif Display', serif;
    font-size: 1.4rem; color: var(--white); margin-bottom: 6px;
  }
  .ob-card p { color: var(--foam); font-size: 0.875rem; line-height: 1.6; margin-bottom: 20px; }

  .field-group { margin-bottom: 16px; }
  .field-label {
    display: block; font-size: 0.75rem; font-weight: 600;
    color: var(--mint); text-transform: uppercase; letter-spacing: 0.08em;
    margin-bottom: 6px;
  }
  .field-input, .field-select, .field-textarea {
    width: 100%; padding: 12px 16px;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 12px;
    color: var(--white); font-family: 'DM Sans', sans-serif; font-size: 0.925rem;
    outline: none; transition: border-color 0.2s, background 0.2s;
    -webkit-appearance: none;
  }
  .field-input::placeholder { color: rgba(255,255,255,0.3); }
  .field-input:focus, .field-select:focus, .field-textarea:focus {
    border-color: var(--mint);
    background: rgba(0,180,216,0.1);
  }
  .field-select option { background: var(--ocean); color: var(--white); }
  .field-textarea { resize: none; min-height: 80px; }

  .ob-btn {
    width: 100%; padding: 16px;
    background: var(--mint);
    border: none; border-radius: 14px;
    font-family: 'DM Sans', sans-serif; font-size: 1rem; font-weight: 600;
    color: var(--ocean); cursor: pointer;
    transition: all 0.2s; margin-top: 8px;
  }
  .ob-btn:hover { background: var(--foam); transform: translateY(-1px); box-shadow: 0 8px 24px rgba(0,180,216,0.35); }
  .ob-btn:active { transform: translateY(0); }

  .ob-btn-ghost {
    width: 100%; padding: 14px;
    background: transparent; border: 1px solid rgba(255,255,255,0.2);
    border-radius: 14px; font-family: 'DM Sans', sans-serif;
    font-size: 0.9rem; color: var(--foam); cursor: pointer;
    transition: all 0.2s; margin-top: 8px;
  }
  .ob-btn-ghost:hover { border-color: var(--mint); color: var(--mint); }

  .ob-progress {
    display: flex; gap: 8px; justify-content: center; margin-bottom: 32px;
  }
  .ob-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: rgba(255,255,255,0.2); transition: all 0.3s;
  }
  .ob-dot.active { background: var(--mint); width: 24px; border-radius: 4px; }

  .chip-grid { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
  .chip {
    padding: 8px 14px; border-radius: 20px;
    border: 1px solid rgba(255,255,255,0.2);
    background: transparent; color: var(--foam);
    font-size: 0.85rem; cursor: pointer; transition: all 0.2s;
    font-family: 'DM Sans', sans-serif;
  }
  .chip.selected { background: var(--mint); border-color: var(--mint); color: var(--ocean); font-weight: 600; }
  .chip:hover:not(.selected) { border-color: var(--mint); color: var(--mint); }

  /* ─────────────── HOME ─────────────── */
  .home-hero {
    background: linear-gradient(160deg, var(--ocean) 0%, var(--deep) 60%, #023060 100%);
    padding: 28px 20px 48px;
    position: relative; overflow: hidden;
  }
  .hero-bg-circle {
    position: absolute; border-radius: 50%; pointer-events: none;
  }
  .hero-greeting { color: var(--foam); font-size: 0.875rem; margin-bottom: 4px; }
  .hero-name {
    font-family: 'DM Serif Display', serif;
    font-size: 1.75rem; color: var(--white); margin-bottom: 4px;
  }
  .hero-sub { color: var(--mint); font-size: 0.85rem; }

  .status-card {
    margin: -28px 16px 0;
    background: var(--white);
    border-radius: 20px;
    padding: 20px;
    box-shadow: var(--shadow-lg);
    position: relative; z-index: 10;
  }
  .status-label { font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: var(--slate); margin-bottom: 12px; }
  .status-row { display: flex; align-items: center; gap: 12px; }
  .status-dot {
    width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0;
    animation: pulse 2s ease-in-out infinite;
  }
  .status-dot.active { background: #22C55E; box-shadow: 0 0 0 4px rgba(34,197,94,0.2); }
  .status-dot.caution { background: #F59E0B; box-shadow: 0 0 0 4px rgba(245,158,11,0.2); }
  .status-info h3 { font-size: 1rem; font-weight: 600; color: var(--text); }
  .status-info p  { font-size: 0.78rem; color: var(--slate); margin-top: 2px; }
  .status-badge {
    margin-left: auto; padding: 4px 10px; border-radius: 20px;
    font-size: 0.7rem; font-weight: 600; text-transform: uppercase;
  }
  .badge-uci  { background: #EFF6FF; color: var(--teal); }
  .badge-días { background: #F0FDF4; color: #16A34A; }

  .journey-mini {
    display: flex; align-items: center; gap: 6px; margin-top: 16px; padding-top: 16px;
    border-top: 1px solid #F1F5F9;
  }
  .journey-stage {
    flex: 1; text-align: center;
  }
  .j-dot {
    width: 28px; height: 28px; border-radius: 50%; margin: 0 auto 4px;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.7rem; font-weight: 700;
  }
  .j-dot.done    { background: var(--mint); color: var(--ocean); }
  .j-dot.current { background: var(--teal); color: white; box-shadow: 0 0 0 3px rgba(0,119,182,0.25); }
  .j-dot.future  { background: #F1F5F9; color: var(--slate); }
  .j-label { font-size: 0.6rem; color: var(--slate); }
  .j-connector { width: 16px; height: 2px; background: #E2E8F0; flex-shrink: 0; }
  .j-connector.done { background: var(--mint); }

  .section-title {
    font-family: 'DM Serif Display', serif;
    font-size: 1.15rem; color: var(--text);
    padding: 24px 20px 12px; display: flex; align-items: center; justify-content: space-between;
  }
  .section-title a { font-family: 'DM Sans', sans-serif; font-size: 0.8rem; color: var(--teal); text-decoration: none; font-weight: 500; }

  .menu-grid {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 12px; padding: 0 16px 24px;
  }
  .menu-card {
    background: var(--white);
    border-radius: 18px; padding: 18px 16px;
    box-shadow: var(--shadow);
    cursor: pointer; transition: all 0.22s;
    border: 1px solid transparent;
    display: flex; flex-direction: column; gap: 10px;
    position: relative; overflow: hidden;
    -webkit-tap-highlight-color: transparent;
  }
  .menu-card::before {
    content: ''; position: absolute;
    bottom: -20px; right: -20px;
    width: 80px; height: 80px; border-radius: 50%;
    opacity: 0.08; transition: all 0.3s;
  }
  .menu-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-lg); }
  .menu-card:hover::before { transform: scale(1.5); }
  .menu-card:active { transform: translateY(0) scale(0.98); }
  .menu-icon {
    width: 44px; height: 44px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.3rem;
  }
  .menu-card h3 { font-size: 0.875rem; font-weight: 600; color: var(--text); line-height: 1.3; }
  .menu-card p  { font-size: 0.72rem; color: var(--slate); line-height: 1.4; }
  .menu-arrow   { margin-top: auto; font-size: 0.75rem; color: var(--slate); }

  /* Colores temáticos tarjetas */
  .card-info    { --c: #0077B6; } .card-info .menu-icon    { background: #EFF6FF; } .card-info::before { background: #0077B6; }
  .card-journey { --c: #6D28D9; } .card-journey .menu-icon { background: #F5F3FF; } .card-journey::before { background: #6D28D9; }
  .card-video   { --c: #059669; } .card-video .menu-icon   { background: #ECFDF5; } .card-video::before { background: #059669; }
  .card-faq     { --c: #D97706; } .card-faq .menu-icon     { background: #FFFBEB; } .card-faq::before { background: #D97706; }
  .card-eol     { --c: #BE185D; } .card-eol .menu-icon     { background: #FDF2F8; } .card-eol::before { background: #BE185D; }
  .card-post    { --c: #0EA5E9; } .card-post .menu-icon    { background: #F0F9FF; } .card-post::before { background: #0EA5E9; }
  .card-print   { --c: #0F766E; } .card-print .menu-icon   { background: #F0FDFA; } .card-print::before { background: #0F766E; }

  .quick-tip {
    margin: 0 16px 24px;
    background: linear-gradient(135deg, var(--deep), var(--teal));
    border-radius: 18px; padding: 18px;
    color: var(--white); display: flex; gap: 14px; align-items: flex-start;
  }
  .tip-icon { font-size: 1.6rem; flex-shrink: 0; }
  .quick-tip h4 { font-size: 0.875rem; font-weight: 600; margin-bottom: 4px; }
  .quick-tip p  { font-size: 0.775rem; opacity: 0.85; line-height: 1.5; }

  /* ─────────────── INFO SCREEN ─────────────── */
  .screen-header {
    background: linear-gradient(160deg, var(--ocean), var(--deep));
    padding: 24px 20px 36px; color: var(--white);
  }
  .screen-header h1 {
    font-family: 'DM Serif Display', serif;
    font-size: 1.6rem; margin-bottom: 4px;
  }
  .screen-header p { color: var(--foam); font-size: 0.875rem; }

  .back-btn {
    display: inline-flex; align-items: center; gap: 6px;
    background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2);
    color: var(--white); border-radius: 20px;
    padding: 6px 14px; font-size: 0.8rem; font-weight: 500;
    cursor: pointer; margin-bottom: 14px;
    font-family: 'DM Sans', sans-serif;
    transition: all 0.2s; -webkit-tap-highlight-color: transparent;
  }
  .back-btn:hover { background: rgba(255,255,255,0.2); }
  .back-btn:active { transform: scale(0.97); }

  .content-card {
    background: var(--white); border-radius: 20px;
    margin: -20px 16px 16px; padding: 20px;
    box-shadow: var(--shadow);
  }
  .info-row {
    display: flex; align-items: center; gap: 14px; padding: 14px 0;
    border-bottom: 1px solid #F1F5F9;
  }
  .info-row:last-child { border-bottom: none; }
  .info-icon { font-size: 1.4rem; width: 36px; flex-shrink: 0; text-align: center; }
  .info-content h4 { font-size: 0.9rem; font-weight: 600; color: var(--text); }
  .info-content p  { font-size: 0.8rem; color: var(--slate); margin-top: 2px; line-height: 1.5; }

  .horario-badge {
    display: inline-flex; align-items: center; gap: 6px;
    background: var(--deep); color: var(--white);
    padding: 8px 16px; border-radius: 20px; font-size: 0.875rem; font-weight: 700;
    margin: 12px 0;
  }

  .checklist { list-style: none; display: flex; flex-direction: column; gap: 10px; margin-top: 8px; }
  .checklist li {
    display: flex; align-items: center; gap: 10px;
    font-size: 0.875rem; color: var(--text);
  }
  .check-box {
    width: 22px; height: 22px; border-radius: 6px; border: 2px solid var(--mint);
    flex-shrink: 0; display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all 0.2s;
  }
  .check-box.checked { background: var(--mint); border-color: var(--mint); }

  /* ─────────────── JOURNEY ─────────────── */
  .journey-screen { padding: 0 0 24px; }
  .journey-intro {
    background: linear-gradient(160deg, var(--ocean), #6D28D9 150%);
    padding: 24px 20px 40px; color: var(--white);
  }
  .journey-intro h1 { font-family: 'DM Serif Display', serif; font-size: 1.6rem; margin-bottom: 8px; }
  .journey-intro p  { color: var(--foam); font-size: 0.875rem; line-height: 1.6; }

  .journey-map {
    margin: -24px 16px 0; background: var(--white);
    border-radius: 20px; padding: 24px 16px;
    box-shadow: var(--shadow-lg);
  }
  .journey-step {
    display: flex; gap: 14px; margin-bottom: 8px;
    cursor: pointer;
  }
  .step-track { display: flex; flex-direction: column; align-items: center; flex-shrink: 0; }
  .step-circle {
    width: 42px; height: 42px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 0.95rem;
    transition: all 0.3s; flex-shrink: 0;
  }
  .step-line { width: 2px; flex: 1; min-height: 20px; margin: 4px 0; }
  .step-body { flex: 1; padding: 8px 0 20px; }
  .step-body h3 { font-size: 0.95rem; font-weight: 600; color: var(--text); margin-bottom: 4px; }
  .step-body p  { font-size: 0.8rem; color: var(--slate); line-height: 1.5; }

  .step-done    .step-circle { background: var(--mint); color: var(--ocean); }
  .step-done    .step-line   { background: var(--mint); }
  .step-current .step-circle { background: var(--teal); color: white; box-shadow: 0 0 0 5px rgba(0,119,182,0.2); }
  .step-current .step-line   { background: #E2E8F0; }
  .step-future  .step-circle { background: #F1F5F9; color: var(--slate); }
  .step-future  .step-line   { background: #E2E8F0; }

  .journey-note {
    margin: 16px 16px 0;
    background: #FFF8F0; border: 1px solid #FDBA74;
    border-radius: 14px; padding: 14px;
    font-size: 0.8rem; color: #92400E; line-height: 1.6;
    display: flex; gap: 10px;
  }

  /* ─────────────── FAQ ─────────────── */
  .faq-screen { padding: 0 0 24px; }
  .faq-header {
    background: linear-gradient(160deg, var(--ocean), #D97706 200%);
    padding: 24px 20px 40px; color: var(--white);
  }
  .faq-header h1 { font-family: 'DM Serif Display', serif; font-size: 1.6rem; margin-bottom: 6px; }
  .faq-header p  { color: var(--foam); font-size: 0.875rem; }

  .faq-categories {
    display: flex; gap: 8px; overflow-x: auto; padding: 16px 16px 0;
    scrollbar-width: none;
  }
  .faq-categories::-webkit-scrollbar { display: none; }
  .cat-pill {
    padding: 8px 14px; border-radius: 20px; white-space: nowrap;
    font-size: 0.78rem; font-weight: 500; cursor: pointer; border: none;
    transition: all 0.2s; font-family: 'DM Sans', sans-serif;
  }
  .cat-pill.active { background: var(--teal); color: white; }
  .cat-pill:not(.active) { background: var(--white); color: var(--slate); box-shadow: var(--shadow); }

  .faq-list { padding: 16px; display: flex; flex-direction: column; gap: 10px; }
  .faq-item {
    background: var(--white); border-radius: 16px;
    overflow: hidden; box-shadow: var(--shadow);
    transition: all 0.2s;
  }
  .faq-question {
    padding: 16px; display: flex; align-items: center; justify-content: space-between;
    cursor: pointer; gap: 12px;
  }
  .faq-q-text { font-size: 0.875rem; font-weight: 500; color: var(--text); line-height: 1.4; }
  .faq-chevron { flex-shrink: 0; transition: transform 0.3s; font-size: 0.75rem; color: var(--slate); }
  .faq-chevron.open { transform: rotate(180deg); }
  .faq-answer {
    padding: 0 16px 16px; font-size: 0.85rem; color: var(--slate); line-height: 1.7;
    border-top: 1px solid #F1F5F9;
  }
  .faq-answer-inner { padding-top: 12px; }

  /* ─────────────── PROFILE ─────────────── */
  .profile-header {
    background: linear-gradient(160deg, var(--ocean), var(--deep));
    padding: 32px 20px 60px; text-align: center; color: var(--white);
  }
  .profile-avatar {
    width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 12px;
    background: var(--teal); border: 3px solid var(--mint);
    display: flex; align-items: center; justify-content: center;
    font-size: 2rem;
  }
  .profile-header h2 { font-family: 'DM Serif Display', serif; font-size: 1.5rem; margin-bottom: 4px; }
  .profile-header p  { color: var(--foam); font-size: 0.85rem; }

  .profile-patient-card {
    margin: -32px 16px 16px; background: var(--white);
    border-radius: 20px; padding: 20px; box-shadow: var(--shadow-lg);
  }
  .patient-header { display: flex; align-items: center; gap: 14px; margin-bottom: 16px; }
  .patient-avatar {
    width: 56px; height: 56px; border-radius: 50%;
    background: linear-gradient(135deg, var(--mint), var(--teal));
    display: flex; align-items: center; justify-content: center; font-size: 1.6rem;
  }
  .patient-info h3 { font-size: 1rem; font-weight: 600; color: var(--text); }
  .patient-info p  { font-size: 0.78rem; color: var(--slate); }
  .patient-tags { display: flex; flex-wrap: wrap; gap: 6px; }
  .patient-tag {
    padding: 4px 10px; border-radius: 12px; font-size: 0.7rem; font-weight: 500;
  }

  .profile-section { margin: 0 16px 16px; background: var(--white); border-radius: 18px; overflow: hidden; box-shadow: var(--shadow); }
  .profile-section-title {
    padding: 14px 16px; font-size: 0.7rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.1em; color: var(--slate);
    border-bottom: 1px solid #F1F5F9; background: #F8FAFC;
  }
  .profile-item {
    padding: 14px 16px; display: flex; justify-content: space-between; align-items: center;
    border-bottom: 1px solid #F8FAFC; cursor: pointer;
  }
  .profile-item:last-child { border-bottom: none; }
  .profile-item-left { display: flex; align-items: center; gap: 12px; }
  .profile-item-icon { font-size: 1.2rem; width: 32px; text-align: center; }
  .profile-item h4 { font-size: 0.875rem; font-weight: 500; color: var(--text); }
  .profile-item p  { font-size: 0.75rem; color: var(--slate); margin-top: 2px; }
  .profile-item-arrow { color: var(--slate); font-size: 0.75rem; }

  /* ─────────────── MODALS ─────────────── */
  .modal-overlay {
    position: fixed; inset: 0; z-index: 200;
    background: rgba(3,4,94,0.6); backdrop-filter: blur(8px);
    display: flex; align-items: flex-end;
    animation: fadeUp 0.2s ease;
  }
  .modal-sheet {
    background: var(--white); border-radius: 24px 24px 0 0;
    padding: 24px; width: 100%;
    max-height: 85vh; overflow-y: auto;
    animation: fadeUp 0.3s ease;
  }
  .modal-handle {
    width: 36px; height: 4px; background: #E2E8F0;
    border-radius: 2px; margin: 0 auto 20px;
  }
  .modal-title {
    font-family: 'DM Serif Display', serif;
    font-size: 1.3rem; color: var(--text); margin-bottom: 8px;
  }
  .modal-body { font-size: 0.9rem; color: var(--slate); line-height: 1.7; }

  /* ─── TOAST ─── */
  .toast {
    position: fixed; bottom: 88px; left: 50%; transform: translateX(-50%);
    z-index: 300; background: var(--text); color: white;
    padding: 12px 20px; border-radius: 12px; font-size: 0.875rem;
    animation: fadeUp 0.3s ease; white-space: nowrap;
    box-shadow: 0 8px 24px rgba(0,0,0,0.2);
  }

  /* ─── UTILS ─── */
  .divider { height: 1px; background: #F1F5F9; margin: 0 16px; }
  .tag-green  { background: #ECFDF5; color: #065F46; }
  .tag-blue   { background: #EFF6FF; color: #1E40AF; }
  .tag-purple { background: #F5F3FF; color: #5B21B6; }
  .tag-orange { background: #FFF7ED; color: #9A3412; }

  .empty-state {
    text-align: center; padding: 60px 20px; color: var(--slate);
  }
  .empty-state .es-icon { font-size: 3rem; margin-bottom: 12px; }
  .empty-state h3 { font-size: 1rem; font-weight: 600; margin-bottom: 6px; color: var(--text); }
  .empty-state p  { font-size: 0.85rem; line-height: 1.6; }

  /* ─── VIDEOS SCREEN ─── */
  .video-header {
    background: linear-gradient(160deg, var(--ocean), #059669 200%);
    padding: 24px 20px 40px; color: var(--white);
  }
  .video-header h1 { font-family: 'DM Serif Display', serif; font-size: 1.6rem; margin-bottom: 6px; }
  .video-header p  { color: var(--foam); font-size: 0.875rem; }

  .video-list { padding: 16px; display: flex; flex-direction: column; gap: 10px; }
  .video-card {
    background: var(--white); border-radius: 16px;
    display: flex; gap: 14px; align-items: center; padding: 14px;
    box-shadow: var(--shadow); cursor: pointer; transition: all 0.2s;
    -webkit-tap-highlight-color: transparent;
  }
  .video-card:hover { transform: translateX(4px); box-shadow: var(--shadow-lg); }
  .video-thumb {
    width: 56px; height: 56px; border-radius: 12px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center; font-size: 1.6rem;
  }
  .play-btn {
    width: 32px; height: 32px; border-radius: 50%; background: rgba(255,255,255,0.9);
    display: flex; align-items: center; justify-content: center;
    font-size: 0.75rem; margin-top: 4px; cursor: pointer;
    transition: all 0.2s;
  }
  .video-card h4 { font-size: 0.875rem; font-weight: 600; color: var(--text); margin-bottom: 4px; line-height: 1.3; }
  .video-card p  { font-size: 0.75rem; color: var(--slate); }
  .video-duration { font-size: 0.7rem; color: var(--teal); font-weight: 600; margin-top: 4px; }

  /* Responsive */
  @media (max-width: 360px) {
    .menu-grid { gap: 8px; }
    .menu-card { padding: 14px 12px; }
  }

  /* ─────────────── ÁRBOL GENEALÓGICO ─────────────── */
  .tree-canvas {
    width: 100%; overflow-x: auto; overflow-y: hidden;
    padding: 12px 0 20px;
    -webkit-overflow-scrolling: touch;
  }
  .tree-inner {
    min-width: 340px;
    display: grid;
    grid-template-rows: repeat(3, auto);
    gap: 0;
    position: relative;
    padding: 0 16px;
  }
  .tree-row {
    display: flex;
    justify-content: center;
    gap: 10px;
    position: relative;
    padding: 8px 0;
  }
  .tree-row-label {
    font-size: 0.6rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.1em; color: rgba(255,255,255,0.3);
    text-align: center; margin-bottom: 2px;
  }
  /* SVG connector lines */
  .tree-lines {
    position: absolute; top: 0; left: 0;
    width: 100%; height: 100%;
    pointer-events: none; overflow: visible;
  }

  .tree-node {
    display: flex; flex-direction: column; align-items: center;
    gap: 6px; cursor: pointer; transition: transform 0.18s;
    min-width: 72px; max-width: 86px;
    -webkit-tap-highlight-color: transparent;
  }
  .tree-node:hover:not(.tree-node-patient) { transform: translateY(-3px); }

  .tree-node-bubble {
    width: 56px; height: 56px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.6rem;
    border: 2px solid rgba(255,255,255,0.15);
    transition: all 0.2s; position: relative;
    background: rgba(255,255,255,0.08);
  }
  .tree-node-patient .tree-node-bubble {
    width: 68px; height: 68px; font-size: 1.9rem;
    background: rgba(0,180,216,0.25);
    border: 3px solid var(--mint);
    box-shadow: 0 0 0 6px rgba(0,180,216,0.12);
  }
  .tree-node-bubble:hover { border-color: var(--mint); background: rgba(0,180,216,0.18); }
  .tree-node-add .tree-node-bubble {
    background: rgba(255,255,255,0.04);
    border: 2px dashed rgba(255,255,255,0.2);
    font-size: 1.2rem; color: rgba(255,255,255,0.3);
  }
  .tree-node-add:hover .tree-node-bubble {
    border-color: var(--mint); color: var(--mint);
  }
  .tree-node-empty .tree-node-bubble {
    background: rgba(255,255,255,0.04);
    border: 2px dashed rgba(255,255,255,0.15);
    font-size: 1.1rem; color: rgba(255,255,255,0.2);
  }
  .tree-node-name {
    font-size: 0.7rem; font-weight: 600; color: var(--white);
    text-align: center; line-height: 1.2; max-width: 80px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .tree-node-role {
    font-size: 0.62rem; color: var(--mint);
    text-align: center; margin-top: -2px;
  }

  /* Edit node modal */
  .tree-edit-panel {
    background: rgba(255,255,255,0.07);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255,255,255,0.14);
    border-radius: 20px; padding: 20px; margin-top: 12px;
    animation: fadeUp 0.25s ease;
  }
  .tree-edit-panel h3 {
    font-family: 'DM Serif Display', serif;
    font-size: 1.1rem; color: white; margin-bottom: 14px;
  }
  .tree-emoji-row {
    display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 14px;
  }
  .tree-emoji-btn {
    width: 36px; height: 36px; border-radius: 10px; font-size: 1.1rem;
    background: rgba(255,255,255,0.06); border: 2px solid transparent;
    cursor: pointer; transition: all 0.15s; display: flex;
    align-items: center; justify-content: center;
  }
  .tree-emoji-btn.sel { border-color: var(--mint); background: rgba(0,180,216,0.18); }
  .tree-btn-row { display: flex; gap: 8px; margin-top: 12px; }
  .tree-save-btn {
    flex: 1; padding: 11px; background: var(--mint); border: none;
    border-radius: 12px; font-family: 'DM Sans', sans-serif;
    font-size: 0.9rem; font-weight: 600; color: var(--ocean); cursor: pointer;
    transition: all 0.18s;
  }
  .tree-save-btn:hover { background: var(--foam); }
  .tree-del-btn {
    padding: 11px 16px; background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.3);
    border-radius: 12px; font-family: 'DM Sans', sans-serif;
    font-size: 0.85rem; color: #FCA5A5; cursor: pointer; transition: all 0.18s;
  }
  .tree-del-btn:hover { background: rgba(239,68,68,0.25); }
  .tree-cancel-btn {
    padding: 11px 14px; background: transparent;
    border: 1px solid rgba(255,255,255,0.15); border-radius: 12px;
    font-family: 'DM Sans', sans-serif; font-size: 0.85rem;
    color: rgba(255,255,255,0.5); cursor: pointer;
  }

  /* ─────────────── TARJETA DE IDENTIDAD ─────────────── */
  .id-card {
    background: linear-gradient(135deg, #023E8A 0%, #0077B6 60%, #00B4D8 100%);
    border-radius: 24px; padding: 28px 24px;
    position: relative; overflow: hidden;
    box-shadow: 0 16px 48px rgba(3,4,94,0.45);
    margin-bottom: 16px;
  }
  .id-card::before {
    content: '';
    position: absolute; top: -60px; right: -60px;
    width: 180px; height: 180px; border-radius: 50%;
    background: rgba(255,255,255,0.05);
  }
  .id-card::after {
    content: '';
    position: absolute; bottom: -40px; left: -40px;
    width: 140px; height: 140px; border-radius: 50%;
    background: rgba(255,255,255,0.04);
  }
  .id-card-badge {
    font-size: 0.62rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.15em; color: rgba(202,240,248,0.7);
    margin-bottom: 16px; display: flex; align-items: center; gap: 6px;
  }
  .id-card-avatar {
    width: 72px; height: 72px; border-radius: 50%;
    background: rgba(255,255,255,0.15);
    border: 3px solid rgba(255,255,255,0.3);
    display: flex; align-items: center; justify-content: center;
    font-size: 2.2rem; margin-bottom: 16px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.2);
  }
  .id-card-name {
    font-family: 'DM Serif Display', serif;
    font-size: 1.6rem; color: white; margin-bottom: 4px;
    line-height: 1.2;
  }
  .id-card-nickname {
    font-size: 0.85rem; color: rgba(202,240,248,0.8); margin-bottom: 20px;
  }
  .id-card-facts {
    display: flex; flex-direction: column; gap: 10px;
    position: relative; z-index: 1;
  }
  .id-card-fact {
    display: flex; align-items: flex-start; gap: 10px;
    background: rgba(255,255,255,0.1); border-radius: 12px; padding: 10px 12px;
    border: 1px solid rgba(255,255,255,0.1);
  }
  .id-card-fact-icon { font-size: 1rem; flex-shrink: 0; margin-top: 1px; }
  .id-card-fact-text { font-size: 0.82rem; color: rgba(255,255,255,0.9); line-height: 1.4; }
  .id-card-fact-label {
    font-size: 0.62rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.08em; color: rgba(144,224,239,0.7); margin-bottom: 2px;
  }

  .id-approve-row {
    background: rgba(0,180,216,0.12);
    border: 1px solid rgba(0,180,216,0.25);
    border-radius: 16px; padding: 16px;
    display: flex; align-items: flex-start; gap: 12px; margin-bottom: 16px;
  }
  .id-approve-check {
    width: 24px; height: 24px; border-radius: 8px; flex-shrink: 0;
    border: 2px solid rgba(0,180,216,0.5);
    background: transparent; cursor: pointer; transition: all 0.18s;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.85rem;
  }
  .id-approve-check.checked {
    background: var(--mint); border-color: var(--mint); color: var(--ocean);
    font-weight: 700;
  }
  .id-approve-text {
    font-size: 0.8rem; color: var(--foam); line-height: 1.6;
  }
  .id-approve-text strong { color: var(--mint); }

  /* ─────────────── SIDEBAR ─────────────── */
  .sidebar-overlay {
    position: absolute; inset: 0; z-index: 150;
    background: rgba(3,4,94,0.55);
    backdrop-filter: blur(6px);
    animation: fadeOverlay 0.25s ease;
  }
  @keyframes fadeOverlay {
    from { opacity: 0; } to { opacity: 1; }
  }
  .sidebar {
    position: absolute; top: 0; right: 0; bottom: 0; z-index: 160;
    width: min(88vw, 360px);
    background: var(--white);
    display: flex; flex-direction: column;
    box-shadow: -8px 0 48px rgba(3,4,94,0.22);
    animation: slideIn 0.3s cubic-bezier(0.32,0.72,0,1);
    overflow: hidden;
  }
  @keyframes slideIn {
    from { transform: translateX(100%); }
    to   { transform: translateX(0); }
  }
  .sidebar-head {
    background: linear-gradient(135deg, var(--ocean), var(--teal));
    padding: 48px 20px 24px; position: relative; flex-shrink: 0;
  }
  .sidebar-close {
    position: absolute; top: 14px; right: 16px;
    width: 32px; height: 32px; border-radius: 50%;
    background: rgba(255,255,255,0.15); border: none;
    color: white; font-size: 1rem; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.2s;
  }
  .sidebar-close:hover { background: rgba(255,255,255,0.25); }
  .sidebar-head h2 { font-family: 'DM Serif Display', serif; font-size: 1.3rem; color: white; margin-bottom: 4px; }
  .sidebar-head p  { font-size: 0.8rem; color: var(--foam); }
  .sidebar-body { flex: 1; overflow-y: auto; padding: 20px 16px 32px; }
  .sidebar-section { margin-bottom: 24px; }
  .sidebar-section-title {
    font-size: 0.68rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.1em; color: var(--slate);
    margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid #F1F5F9;
  }
  .sidebar-field { margin-bottom: 12px; }
  .sidebar-field label {
    display: block; font-size: 0.72rem; font-weight: 600;
    color: var(--teal); margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.06em;
  }
  .sidebar-field input, .sidebar-field select {
    width: 100%; padding: 10px 14px; border: 1.5px solid #E2E8F0; border-radius: 10px;
    font-family: 'DM Sans', sans-serif; font-size: 0.9rem;
    color: var(--text); background: #F8FAFC; outline: none; transition: border-color 0.2s;
  }
  .sidebar-field input:focus, .sidebar-field select:focus { border-color: var(--teal); background: white; }
  .sidebar-field input::placeholder { color: var(--slate); opacity: 0.5; }
  .sidebar-chip-grid { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 6px; }
  .sidebar-chip {
    padding: 6px 12px; border-radius: 16px; font-size: 0.78rem;
    border: 1.5px solid #E2E8F0; background: #F8FAFC;
    color: var(--slate); cursor: pointer; transition: all 0.18s;
    font-family: 'DM Sans', sans-serif;
  }
  .sidebar-chip.sel { background: var(--teal); border-color: var(--teal); color: white; font-weight: 600; }
  .toggle-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 11px 14px; background: #F8FAFC; border-radius: 12px;
    margin-bottom: 10px; border: 1.5px solid #E2E8F0;
  }
  .toggle-row-left span  { font-size: 0.875rem; font-weight: 500; color: var(--text); }
  .toggle-row-left small { font-size: 0.72rem; color: var(--slate); display: block; margin-top: 1px; }
  .toggle-sw {
    width: 46px; height: 26px; border-radius: 13px; border: none;
    cursor: pointer; position: relative; flex-shrink: 0; transition: background 0.3s;
  }
  .toggle-sw::after {
    content: ''; position: absolute; width: 20px; height: 20px; border-radius: 50%;
    background: white; top: 3px; transition: transform 0.3s;
    box-shadow: 0 1px 4px rgba(0,0,0,0.2);
  }
  .toggle-sw.on  { background: var(--teal); }
  .toggle-sw.on::after  { transform: translateX(20px); }
  .toggle-sw.off { background: #CBD5E1; }
  .toggle-sw.off::after { transform: translateX(3px); }
  .sidebar-save-btn {
    width: 100%; padding: 14px; background: var(--teal); color: white;
    border: none; border-radius: 12px; font-family: 'DM Sans', sans-serif;
    font-size: 0.95rem; font-weight: 600; cursor: pointer; transition: all 0.2s;
  }
  .sidebar-save-btn:hover { background: var(--deep); transform: translateY(-1px); }
  .dark-mode .app-shell    { background: #080f1e; }
  .dark-mode .main-content { background: #080f1e; }
  .dark-mode .status-card  { background: #111827; }
  .dark-mode .status-label { color: #94A3B8; }
  .dark-mode .status-info h3 { color: #F1F5F9; }
  .dark-mode .section-title  { color: #F1F5F9; }
  .dark-mode .menu-card      { background: #1E293B; border-color: #334155; }
  .dark-mode .menu-card h3   { color: #F1F5F9; }
  .dark-mode .menu-card p    { color: #94A3B8; }
  .dark-mode .menu-arrow     { color: #64748B; }
  .dark-mode .quick-tip      { background: linear-gradient(135deg,#0a1f3c,#0e3a5e); }
  .dark-mode .content-card   { background: #1E293B; }
  .dark-mode .info-content h4{ color: #F1F5F9; }
  .dark-mode .info-row       { border-color: #334155; }
  .dark-mode .checklist li   { color: #F1F5F9; }
  .dark-mode .check-box      { border-color: var(--mint); }
  .dark-mode .faq-item       { background: #1E293B; }
  .dark-mode .faq-q-text     { color: #F1F5F9; }
  .dark-mode .faq-answer     { border-color: #334155; color: #94A3B8; }
  .dark-mode .video-card     { background: #1E293B; }
  .dark-mode .video-card h4  { color: #F1F5F9; }
  .dark-mode .journey-map    { background: #1E293B; }
  .dark-mode .step-body h3   { color: #F1F5F9; }
  .dark-mode .step-body p    { color: #94A3B8; }
  .dark-mode .profile-patient-card { background: #1E293B; }
  .dark-mode .profile-section      { background: #1E293B; }
  .dark-mode .profile-item h4      { color: #F1F5F9; }
  .dark-mode .profile-item         { border-color: #334155; }
  .dark-mode .profile-section-title{ background: #0F172A; color: #64748B; }
  .dark-mode .patient-info h3      { color: #F1F5F9; }
  .dark-mode .bottom-nav           { background: #0D1526; }
  .dark-mode .topnav               { background: #0D1526; }

  /* ── Custom tag input ── */
  .custom-tag-row {
    display: flex; gap: 7px; margin-top: 8px; align-items: center;
  }
  .custom-tag-input {
    flex: 1; padding: 8px 12px;
    border: 1.5px dashed #CBD5E1; border-radius: 10px;
    font-family: 'DM Sans', sans-serif; font-size: 0.82rem;
    color: var(--text); background: #F8FAFC; outline: none;
    transition: border-color 0.2s;
  }
  .custom-tag-input:focus { border-color: var(--teal); border-style: solid; background: white; }
  .custom-tag-input::placeholder { color: #94A3B8; }
  .custom-tag-add {
    width: 34px; height: 34px; border-radius: 10px; flex-shrink: 0;
    background: var(--teal); border: none; color: white;
    font-size: 1.2rem; font-weight: 300; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.18s;
  }
  .custom-tag-add:hover { background: var(--deep); transform: scale(1.08); }
  .custom-tag-add:active { transform: scale(0.96); }
  .sidebar-chip.custom {
    display: inline-flex; align-items: center; gap: 5px;
  }
  .chip-remove {
    font-size: 0.65rem; opacity: 0.7; margin-left: 1px;
    line-height: 1; cursor: pointer;
  }
  .chip-remove:hover { opacity: 1; }
`;

// ─── DATA ─────────────────────────────────────────────────────────────────────
const FAQ_DATA = {
  "Las etapas UCI": [
    { tag:"🔴", q: "¿Qué es la Etapa Aguda?", a: "Es el momento más crítico desde que tu familiar ingresó a la UCI. Su cuerpo necesita ayuda para funciones básicas como respirar, mantener la presión arterial o proteger sus órganos. El equipo trabaja de forma intensiva con medicamentos, máquinas y monitoreo continuo las 24 horas.\n\nEs normal que en esta etapa tu familiar esté dormido o sedado — no es que esté inconsciente sin sentir nada, sino que su cuerpo necesita toda su energía para recuperarse. La sedación es un cuidado, no una señal de alarma." },
    { tag:"🟡", q: "¿Qué significa que está en Estabilización?", a: "Es una buena señal. Quiere decir que lo más crítico ya pasó y que el cuerpo de tu familiar está respondiendo al tratamiento. Los valores del monitor empiezan a normalizarse y el equipo puede ir reduciendo algunos medicamentos o ajustando el soporte.\n\nTu familiar puede comenzar a abrir los ojos, reaccionar a tu voz o mostrar pequeñas señales de mejoría. El camino no siempre es una línea recta — puede haber días mejores y días más difíciles, y eso es completamente normal." },
    { tag:"🟠", q: "¿Qué es el Destete o Weaning?", a: "Es una palabra técnica que simplemente significa: enseñarle al cuerpo a respirar solo de nuevo.\n\nCuando alguien ha necesitado una máquina para respirar (ventilador mecánico), los músculos respiratorios pueden haberse debilitado. El destete es el proceso gradual y controlado de ir retirando ese apoyo poco a poco, haciendo pruebas diarias para ver si tu familiar puede mantener la respiración por su cuenta.\n\nEs como aprender a caminar después de una lesión: requiere tiempo y paciencia. Si hay un día de retroceso, no significa que algo salió mal — el equipo simplemente ajusta el ritmo según cómo responde tu familiar ese día." },
    { tag:"🟢", q: "¿Qué pasa en la Pre-Alta UCI?", a: "Tu familiar ya no necesita el nivel de cuidado intensivo de la UCI. Esta etapa es la preparación para el traslado a una sala de hospitalización normal, donde el equipo de enfermería seguirá cuidándolo con menos máquinas y más autonomía.\n\nEl equipo de la UCI coordinará toda la información con los profesionales que lo recibirán. También es el momento para que la familia empiece a prepararse: qué cuidados puede necesitar en casa, qué medicamentos tomará y a qué controles deberá asistir." },
  ],
  "Comunicación": [
    { q: "¿Puedo hablarle a mi familiar?", a: "Sí. Aunque esté dormido, sedado o conectado a equipos, hablarle con calma y tocarle suavemente puede ser reconfortante. Explícale quién eres y que estás allí. Si tienes dudas sobre cómo hacerlo, el equipo puede orientarte." },
    { q: "¿Mi familiar me escucha?", a: "En muchos casos, incluso cuando la persona parece dormida, puede percibir voces o estímulos. Por eso es importante hablarle con tranquilidad y cariño. Si tienes dudas sobre su nivel de conciencia, consúltalo con el equipo." },
    { q: "¿Podemos llevarle música?", a: "En algunas situaciones sí es posible, especialmente si la música le resulta significativa. Antes de traer dispositivos, pregunta al equipo para asegurarte de que no interfiera con los cuidados." },
  ],
  "Conciencia y Memoria": [
    { q: "¿Por qué no recuerda lo que le pasó?", a: "La enfermedad grave, los medicamentos y el estrés pueden afectar la memoria temporalmente. Es frecuente que existan 'lagunas' de recuerdo. Con el tiempo, muchas personas recuperan parte de la memoria." },
    { q: "¿Es normal que esté desorientado/a?", a: "Sí. La desorientación o confusión es frecuente en UCI y puede deberse a la enfermedad, medicamentos o al entorno. Generalmente es transitoria, pero el equipo la vigila activamente." },
    { q: "¿Por qué está contenido/a a la cama?", a: "Las contenciones se usan solo cuando es necesario para evitar que la persona se haga daño o retire dispositivos importantes. No son un castigo. Se revisan constantemente y se retiran cuando es seguro hacerlo." },
  ],
  "Procedimientos": [
    { q: "¿Qué son los elementos invasivos?", a: "Son dispositivos que ayudan a mantener funciones vitales, como tubos para respirar, sondas o catéteres. Aunque pueden impresionar, cumplen una función muy importante en el tratamiento." },
    { q: "¿Mi familiar se está alimentando?", a: "En UCI la alimentación suele administrarse de manera especial (por sonda o vía intravenosa). Por seguridad, no se debe ofrecer comida sin indicación médica. Consulta siempre antes de traer alimentos." },
    { q: "¿Necesita ir al baño?", a: "No. El equipo controla la eliminación mediante sondas o dispositivos especiales. Esto permite mantener higiene y monitoreo adecuados." },
  ],
  "Alarmas y Seguridad": [
    { q: "Si suena una alarma, ¿debo avisar?", a: "Las alarmas forman parte del monitoreo continuo. Muchas veces el equipo ya está al tanto. Si te genera inquietud, puedes avisar con tranquilidad, pero no es necesario alarmarse." },
    { q: "¿Por qué usar elementos de protección (EPP)?", a: "El uso de EPP protege tanto a los pacientes como a los visitantes frente a infecciones. Es una medida de cuidado mutuo." },
    { q: "¿Puedo tocar a otro paciente con EPP?", a: "No. Aunque uses protección, cada paciente requiere cuidados individuales. Es importante limitar el contacto solo a tu familiar." },
  ],
};

const JOURNEY_STEPS = [
  { id: 1, label: "Etapa Aguda", sub: "Fase crítica inicial", desc: "Tu familiar ingresó a la UCI en su fase más crítica. El equipo trabaja para estabilizar sus funciones vitales: respiración, presión arterial, función del corazón y otros órganos. Es el período de mayor intervención y monitoreo continuo.", state: "done" },
  { id: 2, label: "Estabilización", sub: "Mejoría progresiva", desc: "Los signos vitales comienzan a estabilizarse. El equipo mantiene el soporte pero ya se observan señales de mejora. Tu familiar puede estar más reactivo o comenzar a abrir los ojos.", state: "done" },
  { id: 3, label: "Destete (Weaning)", sub: "Aquí estamos hoy", desc: "El destete o weaning es el proceso gradual de reducir el apoyo del ventilador mecánico para que tu familiar recupere su propia capacidad de respirar. Es una etapa delicada: se hacen pruebas diarias de respiración espontánea, siempre con supervisión. No siempre es lineal — puede haber días de avance y días de pausa, y eso es completamente normal.", state: "current" },
  { id: 4, label: "Pre-Alta UCI", sub: "Preparando la transición", desc: "Tu familiar ya no necesita el nivel de soporte intensivo. El equipo prepara su traslado a una sala de menor complejidad. Se coordinan los cuidados continuos, el plan de medicamentos y la información para el equipo que lo recibirá.", state: "future" },
];

const VIDEOS = [
  { emoji: "💊", title: "¿Qué significa que esté sedado/a?", desc: "Explicamos qué son los sedantes y por qué se usan", dur: "2:30" },
  { emoji: "🗣️", title: "¿Por qué no puede hablar?", desc: "El tubo endotraqueal y la comunicación alternativa", dur: "3:15" },
  { emoji: "🫀", title: "¿Qué es la diálisis?", desc: "Cómo funciona el riñón artificial y para qué sirve", dur: "4:00" },
  { emoji: "🫁", title: "¿Para qué sirve el ventilador mecánico?", desc: "La ventilación mecánica explicada paso a paso", dur: "3:45" },
  { emoji: "🧠", title: "¿Qué es el delirium?", desc: "Confusión en UCI: causas, señales y manejo", dur: "2:50" },
  { emoji: "🩺", title: "¿Qué es una traqueostomía?", desc: "Cuándo se hace y cómo ayuda a la recuperación", dur: "3:20" },
];

const CHECKLIST_ITEMS = ["Shampoo", "Jabón de baño", "Crema corporal", "Cepillo de dientes", "Pasta dental", "Pijama de 2 piezas", "Pantuflas"];

// ─── LOGO SVG (Puente UCI Brand) ──────────────────────────────────────────────
const PuenteLogo = ({ size = 36, showText = true }) => (
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

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Icon = {
  Home:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>,
  Journey: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>,
  FAQ:     () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  Profile: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Video:   () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23,7 16,12 23,17 23,7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>,
  Print:   () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6,9 6,2 18,2 18,9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>,
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function PuenteUCI() {
  const [phase, setPhase] = useState("onboarding");
  const [obStep, setObStep] = useState(0);
  const [activeTab, setActiveTab] = useState("home");
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [activeFaqCat, setActiveFaqCat] = useState("Las etapas UCI");
  const [openFaq, setOpenFaq] = useState(null);
  const [checklist, setChecklist] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notifs, setNotifs] = useState(true);

  const [form, setForm] = useState({
    famName: "", famPhone: "",
    patName: "", patNick: "", patJob: "",
    education: "", living: "", religion: "",
    hobbies: [], extra: "",
    musicCustom: "", musicExtra: "",
    sportCustom: "", dailyCustom: "",
    helpDevices: [],
    idCardApproved: false,
    // Nuevos campos: vivienda y mensaje familiar
    livesWith: [],
    livesWhere: "",
    zonaType: "",
    familyMessage: "",
  });

  // ── Vinculos predefinidos ──────────────────────────────────────────────────
  const VINCULOS = ["Papá","Mamá","Hermano","Hermana","Pareja","Esposo/a","Hijo","Hija","Abuelo","Abuela","Tío/a","Sobrino/a","Nieto/a","Amigo/a cercano/a","Otro"];

  const DEFAULT_TREE = [
    { id:"pat",  label:"Paciente", role:"",          gen:1, col:2, emoji:"🧑‍⚕️", photo:null, fixed:true },
    { id:"pap",  label:"",        role:"Papá",       gen:0, col:0, emoji:"👨",    photo:null, fixed:false },
    { id:"mam",  label:"",        role:"Mamá",       gen:0, col:1, emoji:"👩",    photo:null, fixed:false },
    { id:"par",  label:"",        role:"Pareja",     gen:1, col:0, emoji:"💑",    photo:null, fixed:false },
    { id:"sib1", label:"",        role:"Hermano/a",  gen:1, col:3, emoji:"🧑",    photo:null, fixed:false },
    { id:"hij1", label:"",        role:"Hijo/a",     gen:2, col:0, emoji:"🧒",    photo:null, fixed:false },
    { id:"hij2", label:"",        role:"Hijo/a",     gen:2, col:1, emoji:"🧒",    photo:null, fixed:false },
  ];
  const [treeNodes, setTreeNodes] = useState(DEFAULT_TREE);
  const [editingNode, setEditingNode] = useState(null);
  const [editBuf, setEditBuf] = useState({ label:"", role:"", emoji:"", photo:null });
  const [addingNode, setAddingNode] = useState(false);
  const [newNodeBuf, setNewNodeBuf] = useState({ label:"", role:"", gen:1, emoji:"🧑", photo:null });
  const photoInputRef = useRef(null);
  const newPhotoInputRef = useRef(null);

  const EMOJIS = ["👨","👩","🧑","👴","👵","🧒","👦","👧","💑","👶","🐾","👱","🧔","👩‍🦳","👨‍🦳"];

  const openEditNode = (node) => {
    setEditingNode(node.id);
    setEditBuf({ label: node.label, role: node.role, emoji: node.emoji, photo: node.photo });
  };
  const saveEditNode = () => {
    setTreeNodes(ns => ns.map(n => n.id===editingNode ? {...n,...editBuf} : n));
    setEditingNode(null);
  };
  const removeNode = (id) => {
    setTreeNodes(ns => ns.filter(n => n.id !== id));
    setEditingNode(null);
  };
  const addNode = () => {
    if (!newNodeBuf.label && !newNodeBuf.role) return;
    const id = "custom_" + Date.now();
    setTreeNodes(ns => [...ns, { id, fixed:false, ...newNodeBuf }]);
    setNewNodeBuf({ label:"", role:"", gen:1, emoji:"🧑", photo:null });
    setAddingNode(false);
  };

  const handlePhotoUpload = (e, target) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      if (target === "edit") setEditBuf(b => ({...b, photo: ev.target.result}));
      else setNewNodeBuf(b => ({...b, photo: ev.target.result}));
    };
    reader.readAsDataURL(file);
  };

  const [draft, setDraft] = useState(null);
  const [customInputs, setCustomInputs] = useState({ music:"", sport:"", daily:"", social:"" });

  const openSidebar = () => {
    setDraft({...form});
    setCustomInputs({ music:"", sport:"", daily:"", social:"" });
    setSidebarOpen(true);
  };
  const saveSidebar = () => {
    setForm(draft);
    setSidebarOpen(false);
    showToast("✅ Cambios guardados");
  };
  const toggleDraftChip = (key, val) => {
    setDraft(d => ({
      ...d,
      [key]: d[key].includes(val) ? d[key].filter(x => x !== val) : [...d[key], val]
    }));
  };
  const addCustomTag = (cat, prefix="") => {
    const val = customInputs[cat].trim();
    if (!val) return;
    const tagged = prefix + val;
    if (!draft.hobbies.includes(tagged)) {
      setDraft(d => ({ ...d, hobbies: [...d.hobbies, tagged] }));
    }
    setCustomInputs(c => ({ ...c, [cat]: "" }));
  };
  const removeTag = (val) => {
    setDraft(d => ({ ...d, hobbies: d.hobbies.filter(h => h !== val) }));
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const toggleChip = (key, val) => {
    setForm(f => ({
      ...f,
      [key]: f[key].includes(val) ? f[key].filter(x => x !== val) : [...f[key], val]
    }));
  };

  // ── ONBOARDING ──────────────────────────────────────────────────────────────
  if (phase === "onboarding") {
    return (
      <>
        <style>{css}</style>
        <div className="onboarding">
          <div className="onboarding-bg">
            <div className="onboarding-blob" style={{width:300,height:300,background:"#0077B6",top:-80,right:-80}}/>
            <div className="onboarding-blob" style={{width:200,height:200,background:"#02C39A",bottom:60,left:-60}}/>
            <div className="onboarding-blob" style={{width:150,height:150,background:"#6D28D9",bottom:180,right:20}}/>
          </div>

          <div className="ob-progress">
            {[0,1,2,3,4,5].map(i => <div key={i} className={`ob-dot ${obStep===i?"active":""}`}/>)}
          </div>

          {obStep === 0 && (
            <div className="ob-step active">
              <div className="float" style={{display:"flex",justifyContent:"center",marginBottom:8}}>
                <PuenteLogo size={56} showText={true} />
              </div>
              <p className="ob-tagline">Conectando familias con el cuidado humanizado.<br/>No estás solo/a en este camino.</p>
              <div className="ob-card">
                <h2>¿Quién eres?</h2>
                <p>Cuéntanos cómo te llamas y cómo contactarte. Esta información es solo para el equipo de salud.</p>
                <div className="field-group">
                  <label className="field-label">Tu nombre</label>
                  <input className="field-input" placeholder="Ej: María González" value={form.famName} onChange={e=>setForm(f=>({...f,famName:e.target.value}))}/>
                </div>
                <div className="field-group">
                  <label className="field-label">WhatsApp (opcional)</label>
                  <input className="field-input" placeholder="+56 9 1234 5678" value={form.famPhone} onChange={e=>setForm(f=>({...f,famPhone:e.target.value}))}/>
                </div>
              </div>
              <button className="ob-btn" onClick={()=>{ if(!form.famName){showToast("⚠️ Ingresa tu nombre para continuar"); return;} setObStep(1); }}>
                Continuar →
              </button>
            </div>
          )}

          {obStep === 1 && (
            <div className="ob-step active">
              <div style={{display:"flex",justifyContent:"center",marginBottom:8}}><PuenteLogo size={28} showText={true} /></div>
              <p className="ob-tagline" style={{marginBottom:24}}>Queremos conocer a tu familiar más allá de su diagnóstico</p>
              <div className="ob-card">
                <h2>¿Cómo se llama?</h2>
                <p>Saber quién es como persona nos permite brindarle un cuidado más humano y personalizado.</p>
                <div className="field-group">
                  <label className="field-label">Nombre completo</label>
                  <input className="field-input" placeholder="Ej: Carlos Pérez Soto" value={form.patName} onChange={e=>setForm(f=>({...f,patName:e.target.value}))}/>
                </div>
                <div className="field-group">
                  <label className="field-label">¿Cómo le gusta que le llamen?</label>
                  <input className="field-input" placeholder="Apodo o nombre preferido" value={form.patNick} onChange={e=>setForm(f=>({...f,patNick:e.target.value}))}/>
                </div>
                <div className="field-group">
                  <label className="field-label">¿A qué se dedica?</label>
                  <input className="field-input" placeholder="Profesión u ocupación" value={form.patJob} onChange={e=>setForm(f=>({...f,patJob:e.target.value}))}/>
                </div>
              </div>
              <button className="ob-btn" onClick={()=>{ if(!form.patName){showToast("⚠️ Ingresa el nombre del paciente"); return;} setObStep(2); }}>Continuar →</button>
              <button className="ob-btn-ghost" onClick={()=>setObStep(0)}>← Volver</button>
            </div>
          )}

          {obStep === 2 && (
            <div className="ob-step active">
              <div style={{display:"flex",justifyContent:"center",marginBottom:8}}><PuenteLogo size={28} showText={true} /></div>
              <p className="ob-tagline" style={{marginBottom:16}}>Su vida más allá de la UCI</p>
              <div className="ob-card">
                <h2>¿Qué le gusta?</h2>
                <p>Cuéntanos sobre su vida cotidiana. Esto permite al equipo personalizar su cuidado y estimulación sensorial.</p>
                <div className="field-group" style={{marginTop:16}}>
                  <label className="field-label">🎵 Música que escucha</label>
                  <div className="chip-grid">
                    {["Cumbia","Bolero","Salsa","Rock","Pop","Baladas","Música clásica","Folklore","Reggaetón","Música religiosa"].map(h=>(
                      <button key={h} className={`chip ${form.hobbies.includes(h)?"selected":""}`} onClick={()=>toggleChip("hobbies",h)}>{h}</button>
                    ))}
                  </div>
                  <input className="field-input" style={{marginTop:8}} placeholder="Otro género musical (ej: Jazz, Cueca, Tropical...)" value={form.musicCustom||""} onChange={e=>setForm(f=>({...f,musicCustom:e.target.value}))}/>
                  <input className="field-input" style={{marginTop:8}} placeholder="¿Artista o canción favorita?" value={form.musicExtra||""} onChange={e=>setForm(f=>({...f,musicExtra:e.target.value}))}/>
                </div>
                <div className="field-group">
                  <label className="field-label">🏃 Actividad física o deporte</label>
                  <div className="chip-grid">
                    {["Caminar","Fútbol","Natación","Ciclismo","Gimnasio","Baile","Yoga / Pilates","No practica"].map(h=>(
                      <button key={h} className={`chip ${form.hobbies.includes(h)?"selected":""}`} onClick={()=>toggleChip("hobbies",h)}>{h}</button>
                    ))}
                  </div>
                  <input className="field-input" style={{marginTop:8}} placeholder="Otro deporte (ej: Tenis, Golf, Boxeo...)" value={form.sportCustom||""} onChange={e=>setForm(f=>({...f,sportCustom:e.target.value}))}/>
                </div>
                <div className="field-group">
                  <label className="field-label">🌿 Actividades cotidianas</label>
                  <div className="chip-grid">
                    {["Leer","Ver TV / Series","Cocinar","Jardín / Plantas","Artesanías","Juegos de mesa","Pesca","Tejido / Bordado","Carpintería","Voluntariado"].map(h=>(
                      <button key={h} className={`chip ${form.hobbies.includes(h)?"selected":""}`} onClick={()=>toggleChip("hobbies",h)}>{h}</button>
                    ))}
                  </div>
                  <input className="field-input" style={{marginTop:8}} placeholder="Otras actividades cotidianas (ej: Pintura, Ajedrez, Fotografía...)" value={form.dailyCustom||""} onChange={e=>setForm(f=>({...f,dailyCustom:e.target.value}))}/>
                </div>
                <div className="field-group">
                  <label className="field-label">👥 Vida social y espiritual</label>
                  <div className="chip-grid">
                    {["Muy sociable","Le gusta la tranquilidad","Activo en su comunidad","Práctica religiosa regular","Reuniones familiares frecuentes","Tiene mascotas"].map(h=>(
                      <button key={h} className={`chip ${form.hobbies.includes(h)?"selected":""}`} onClick={()=>toggleChip("hobbies",h)}>{h}</button>
                    ))}
                  </div>
                  <input className="field-input" style={{marginTop:8}} placeholder="¿Algo más que quieras contarnos?" value={form.extra||""} onChange={e=>setForm(f=>({...f,extra:e.target.value}))}/>
                </div>
                <div className="field-group">
                  <label className="field-label">🦾 Ayudas técnicas (seleccione las que utilice)</label>
                  <div className="chip-grid">
                    {["Lentes 👓","Audífonos 🦻","Bastón 🦯","Andador 🚶","Silla de ruedas ♿","Prótesis dental 🦷","Marcapasos 🫀","No utiliza ninguna ✓"].map(h=>(
                      <button key={h} className={`chip ${form.helpDevices.includes(h)?"selected":""}`} onClick={()=>toggleChip("helpDevices",h)}>{h}</button>
                    ))}
                  </div>
                </div>
              </div>
              <button className="ob-btn" onClick={()=>setObStep(3)}>Continuar →</button>
              <button className="ob-btn-ghost" onClick={()=>setObStep(1)}>← Volver</button>
            </div>
          )}

          {obStep === 3 && (() => {
            const patNick = form.patNick || form.patName.split(" ")[0] || "Paciente";
            const gen0 = treeNodes.filter(n=>n.gen===0);
            const gen1 = treeNodes.filter(n=>n.gen===1);
            const gen2 = treeNodes.filter(n=>n.gen===2);

            const NodeBubble = ({ node, isEditing, onClick }) => {
              const isPatient = node.id === "pat";
              const hasPhoto = !!node.photo;
              const isEmpty = !node.label && !node.role && !isPatient;
              return (
                <div
                  onClick={onClick}
                  style={{
                    display:"flex", flexDirection:"column", alignItems:"center",
                    gap:6, cursor: isPatient ? "default" : "pointer",
                    minWidth:72, maxWidth:84,
                    WebkitTapHighlightColor:"transparent",
                  }}
                >
                  <div style={{
                    width: isPatient ? 76 : 64,
                    height: isPatient ? 76 : 64,
                    borderRadius:"50%",
                    background: hasPhoto ? "none" : isPatient ? "rgba(0,180,216,0.25)" : isEmpty ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.12)",
                    border: isEditing ? "3px solid #00B4D8" :
                            isPatient ? "3px solid #00B4D8" :
                            isEmpty ? "2px dashed rgba(255,255,255,0.2)" : "2px solid rgba(255,255,255,0.25)",
                    boxShadow: isPatient ? "0 0 0 6px rgba(0,180,216,0.15)" : isEditing ? "0 0 0 4px rgba(0,180,216,0.2)" : "none",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize: isPatient ? "2rem" : "1.5rem",
                    overflow:"hidden",
                    transition:"all 0.2s",
                    position:"relative",
                  }}>
                    {hasPhoto ? (
                      <img src={node.photo} alt={node.label} style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:"50%"}}/>
                    ) : (
                      <span>{isEmpty ? "+" : node.emoji}</span>
                    )}
                    {!isPatient && (
                      <div style={{
                        position:"absolute", bottom:0, right:0,
                        width:20, height:20, borderRadius:"50%",
                        background: isEmpty ? "rgba(255,255,255,0.15)" : "#0077B6",
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontSize:"0.6rem", border:"1.5px solid rgba(255,255,255,0.4)",
                      }}>
                        {isEmpty ? "✏️" : "✏️"}
                      </div>
                    )}
                  </div>
                  <div style={{
                    fontSize:"0.68rem", fontWeight:600, color: isEmpty ? "rgba(255,255,255,0.35)" : "white",
                    textAlign:"center", lineHeight:1.2, maxWidth:80,
                    whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
                  }}>
                    {isPatient ? patNick : (node.label || (isEmpty ? "Agregar" : "—"))}
                  </div>
                  <div style={{
                    fontSize:"0.58rem", color: isPatient ? "#00B4D8" : "rgba(144,224,239,0.7)",
                    textAlign:"center", marginTop:-2,
                  }}>
                    {isPatient ? "⭐ Paciente" : node.role}
                  </div>
                </div>
              );
            };

            const LineV = () => (
              <div style={{display:"flex",justifyContent:"center",padding:"4px 0"}}>
                <div style={{width:2,height:24,background:"rgba(255,255,255,0.2)",borderRadius:1}}/>
              </div>
            );
            const LineH = ({ count }) => count <= 1 ? null : (
              <div style={{display:"flex",justifyContent:"center",padding:"0 20px"}}>
                <div style={{height:2,background:"rgba(255,255,255,0.2)",borderRadius:1,width:`${Math.min(count * 70, 240)}px`}}/>
              </div>
            );

            return (
            <div className="ob-step active" style={{width:"100%",maxWidth:440}}>
              <div style={{display:"flex",justifyContent:"center",marginBottom:4}}>
                <PuenteLogo size={28} showText={true} />
              </div>
              <p className="ob-tagline" style={{marginBottom:16,fontSize:"0.85rem"}}>El entorno familiar de {patNick}</p>

              {/* Hidden file inputs */}
              <input ref={photoInputRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>handlePhotoUpload(e,"edit")}/>
              <input ref={newPhotoInputRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>handlePhotoUpload(e,"new")}/>

              <div className="ob-card" style={{padding:"20px 12px"}}>
                <h2 style={{marginBottom:4,fontSize:"1.2rem"}}>Árbol familiar</h2>
                <p style={{marginBottom:20,fontSize:"0.8rem"}}>Toca cada persona para agregar foto, nombre y vínculo.</p>

                {/* ── GEN 0: Padres/abuelos ── */}
                {gen0.length > 0 && (
                  <div style={{marginBottom:4}}>
                    <div style={{fontSize:"0.58rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:"rgba(255,255,255,0.3)",textAlign:"center",marginBottom:8}}>
                      Generación anterior
                    </div>
                    <div style={{display:"flex",justifyContent:"center",gap:12,flexWrap:"wrap"}}>
                      {gen0.map(node=>(
                        <NodeBubble key={node.id} node={node} isEditing={editingNode===node.id}
                          onClick={()=>editingNode===node.id?setEditingNode(null):openEditNode(node)}/>
                      ))}
                    </div>
                    <LineV/>
                  </div>
                )}

                {/* ── GEN 1: El paciente y su generación ── */}
                <div style={{marginBottom:4}}>
                  <div style={{fontSize:"0.58rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:"rgba(255,255,255,0.3)",textAlign:"center",marginBottom:8}}>
                    {patNick} y su generación
                  </div>
                  <div style={{display:"flex",justifyContent:"center",gap:10,flexWrap:"wrap"}}>
                    {gen1.map(node=>(
                      <NodeBubble key={node.id} node={node} isEditing={editingNode===node.id}
                        onClick={()=>node.id==="pat"?null:(editingNode===node.id?setEditingNode(null):openEditNode(node))}/>
                    ))}
                  </div>
                  {gen2.length > 0 && <LineV/>}
                </div>

                {/* ── GEN 2: Hijos ── */}
                {gen2.length > 0 && (
                  <div style={{marginBottom:4}}>
                    <div style={{fontSize:"0.58rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:"rgba(255,255,255,0.3)",textAlign:"center",marginBottom:8}}>
                      Hijos / generación siguiente
                    </div>
                    <div style={{display:"flex",justifyContent:"center",gap:12,flexWrap:"wrap"}}>
                      {gen2.map(node=>(
                        <NodeBubble key={node.id} node={node} isEditing={editingNode===node.id}
                          onClick={()=>editingNode===node.id?setEditingNode(null):openEditNode(node)}/>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Botón agregar ── */}
                <div style={{display:"flex",justifyContent:"center",marginTop:16}}>
                  <button onClick={()=>{setEditingNode(null);setAddingNode(v=>!v);}} style={{
                    display:"flex",alignItems:"center",gap:8,
                    background:"rgba(0,180,216,0.12)",border:"1.5px dashed rgba(0,180,216,0.4)",
                    borderRadius:12,padding:"8px 20px",cursor:"pointer",
                    color:"#00B4D8",fontSize:"0.82rem",fontWeight:600,fontFamily:"'DM Sans',sans-serif",
                    transition:"all 0.2s",
                  }}>
                    ＋ Agregar familiar
                  </button>
                </div>

                {/* ── Panel de edición ── */}
                {editingNode && editingNode !== "pat" && (() => {
                  const node = treeNodes.find(n=>n.id===editingNode);
                  return (
                    <div className="tree-edit-panel" style={{marginTop:16}}>
                      <h3 style={{fontSize:"1rem",marginBottom:14}}>✏️ Editar: {node?.role || "Familiar"}</h3>

                      {/* Foto */}
                      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
                        <div style={{
                          width:60,height:60,borderRadius:"50%",overflow:"hidden",
                          background:"rgba(255,255,255,0.08)",border:"2px dashed rgba(0,180,216,0.5)",
                          display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
                          cursor:"pointer",
                        }} onClick={()=>photoInputRef.current?.click()}>
                          {editBuf.photo
                            ? <img src={editBuf.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                            : <span style={{fontSize:"1.4rem"}}>{editBuf.emoji}</span>}
                        </div>
                        <div>
                          <button onClick={()=>photoInputRef.current?.click()} style={{
                            background:"rgba(0,180,216,0.15)",border:"1px solid rgba(0,180,216,0.35)",
                            borderRadius:10,padding:"7px 14px",color:"#00B4D8",
                            fontFamily:"'DM Sans',sans-serif",fontSize:"0.8rem",cursor:"pointer",
                            display:"block",marginBottom:6,
                          }}>📷 Subir foto</button>
                          {editBuf.photo && (
                            <button onClick={()=>setEditBuf(b=>({...b,photo:null}))} style={{
                              background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.25)",
                              borderRadius:10,padding:"5px 14px",color:"#FCA5A5",
                              fontFamily:"'DM Sans',sans-serif",fontSize:"0.75rem",cursor:"pointer",
                            }}>✕ Quitar foto</button>
                          )}
                        </div>
                      </div>

                      {/* Emoji (si no hay foto) */}
                      {!editBuf.photo && (
                        <div style={{marginBottom:12}}>
                          <div style={{fontSize:"0.68rem",color:"rgba(144,224,239,0.6)",marginBottom:6,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em"}}>
                            O elige un avatar
                          </div>
                          <div className="tree-emoji-row">
                            {EMOJIS.map(e=>(<button key={e} className={`tree-emoji-btn ${editBuf.emoji===e?"sel":""}`} onClick={()=>setEditBuf(b=>({...b,emoji:e}))}>{e}</button>))}
                          </div>
                        </div>
                      )}

                      <div className="field-group">
                        <label className="field-label">Nombre</label>
                        <input className="field-input" placeholder="Ej: Carlos, María..." value={editBuf.label}
                          onChange={e=>setEditBuf(b=>({...b,label:e.target.value}))}
                          onKeyDown={e=>{ if(e.key==="Enter") saveEditNode(); }}/>
                      </div>
                      <div className="field-group">
                        <label className="field-label">Vínculo con {patNick}</label>
                        <select className="field-select" value={editBuf.role} onChange={e=>setEditBuf(b=>({...b,role:e.target.value}))}>
                          <option value="">Selecciona el vínculo...</option>
                          {VINCULOS.map(v=><option key={v} value={v}>{v}</option>)}
                        </select>
                        {editBuf.role === "Otro" && (
                          <input className="field-input" style={{marginTop:8}} placeholder="Especifica el vínculo..." value={editBuf.roleCustom||""}
                            onChange={e=>setEditBuf(b=>({...b,roleCustom:e.target.value}))}/>
                        )}
                      </div>
                      <div className="tree-btn-row">
                        <button className="tree-save-btn" onClick={saveEditNode}>Guardar ✓</button>
                        <button className="tree-cancel-btn" onClick={()=>setEditingNode(null)}>Cancelar</button>
                        {!node?.fixed && <button className="tree-del-btn" onClick={()=>removeNode(editingNode)}>🗑</button>}
                      </div>
                    </div>
                  );
                })()}

                {/* ── Panel agregar ── */}
                {addingNode && (
                  <div className="tree-edit-panel" style={{marginTop:16}}>
                    <h3 style={{fontSize:"1rem",marginBottom:14}}>➕ Agregar familiar</h3>

                    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
                      <div style={{
                        width:60,height:60,borderRadius:"50%",overflow:"hidden",
                        background:"rgba(255,255,255,0.08)",border:"2px dashed rgba(0,180,216,0.5)",
                        display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
                        cursor:"pointer",
                      }} onClick={()=>newPhotoInputRef.current?.click()}>
                        {newNodeBuf.photo
                          ? <img src={newNodeBuf.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                          : <span style={{fontSize:"1.4rem"}}>{newNodeBuf.emoji}</span>}
                      </div>
                      <button onClick={()=>newPhotoInputRef.current?.click()} style={{
                        background:"rgba(0,180,216,0.15)",border:"1px solid rgba(0,180,216,0.35)",
                        borderRadius:10,padding:"7px 14px",color:"#00B4D8",
                        fontFamily:"'DM Sans',sans-serif",fontSize:"0.8rem",cursor:"pointer",
                      }}>📷 Subir foto</button>
                    </div>

                    {!newNodeBuf.photo && (
                      <div className="tree-emoji-row" style={{marginBottom:12}}>
                        {EMOJIS.map(e=>(<button key={e} className={`tree-emoji-btn ${newNodeBuf.emoji===e?"sel":""}`} onClick={()=>setNewNodeBuf(b=>({...b,emoji:e}))}>{e}</button>))}
                      </div>
                    )}

                    <div className="field-group">
                      <label className="field-label">Nombre</label>
                      <input className="field-input" placeholder="Ej: Ana, José..." value={newNodeBuf.label}
                        onChange={e=>setNewNodeBuf(b=>({...b,label:e.target.value}))}/>
                    </div>
                    <div className="field-group">
                      <label className="field-label">Vínculo con {patNick}</label>
                      <select className="field-select" value={newNodeBuf.role} onChange={e=>setNewNodeBuf(b=>({...b,role:e.target.value}))}>
                        <option value="">Selecciona el vínculo...</option>
                        {VINCULOS.map(v=><option key={v} value={v}>{v}</option>)}
                      </select>
                    </div>
                    <div className="field-group">
                      <label className="field-label">Generación</label>
                      <select className="field-select" value={newNodeBuf.gen} onChange={e=>setNewNodeBuf(b=>({...b,gen:Number(e.target.value)}))}>
                        <option value={0}>Generación anterior (padres, abuelos...)</option>
                        <option value={1}>Su generación (hermanos, pareja...)</option>
                        <option value={2}>Hijos / generación siguiente</option>
                      </select>
                    </div>
                    <div className="tree-btn-row">
                      <button className="tree-save-btn" onClick={addNode}>Agregar ✓</button>
                      <button className="tree-cancel-btn" onClick={()=>setAddingNode(false)}>Cancelar</button>
                    </div>
                  </div>
                )}
              </div>

              <button className="ob-btn" onClick={()=>{setEditingNode(null);setAddingNode(false);setObStep(4);}}>Continuar →</button>
              <button className="ob-btn-ghost" onClick={()=>setObStep(2)}>← Volver</button>
            </div>
            );
          })()}

          {obStep === 4 && (() => {
            const nick = form.patNick || form.patName.split(" ")[0] || "Paciente";
            const family = treeNodes.filter(n=>n.id!=="pat"&&n.label).map(n=>`${n.label} (${n.role})`);
            const hobbiesList = form.hobbies.filter(h=>!h.startsWith("[")).slice(0,3);
            const customHobbies = form.hobbies.filter(h=>h.includes("[")).map(h=>h.replace(/\[.*?\]/,"")).slice(0,2);
            const allHobbies = [...hobbiesList,...customHobbies];
            const facts = [
              form.patJob        && { icon:"💼", label:"Ocupación",  text: form.patJob },
              form.education     && { icon:"🎓", label:"Educación",  text: form.education },
              allHobbies.length  && { icon:"⭐", label:"Le gusta",   text: allHobbies.join(", ") },
              form.hobbies.includes("Tiene mascotas") && { icon:"🐾", label:"Mascotas",  text: "Tiene mascotas" },
              family.length      && { icon:"👨‍👩‍👧", label:"Su familia", text: family.slice(0,4).join(" · ") },
              (form.helpDevices||[]).filter(h=>!h.includes("No utiliza")).length &&
                { icon:"🦾", label:"Usa",        text: (form.helpDevices||[]).filter(h=>!h.includes("No utiliza")).join(", ") },
              form.extra         && { icon:"💬", label:"Nos contó",  text: form.extra },
            ].filter(Boolean);
            return (
              <div className="ob-step active">
                <div style={{display:"flex",justifyContent:"center",marginBottom:8}}><PuenteLogo size={28} showText={true} /></div>
                <p className="ob-tagline" style={{marginBottom:16}}>Así nos presentamos a {nick} ante el equipo de salud</p>
                <div className="id-card">
                  <div className="id-card-badge"><span>💙</span> Perfil Humanizado · Puente UCI</div>
                  <div className="id-card-avatar">{treeNodes.find(n=>n.id==="pat")?.emoji||"🧑‍⚕️"}</div>
                  <div className="id-card-name">{form.patName||"Paciente"}</div>
                  {form.patNick&&<div className="id-card-nickname">"{form.patNick}"</div>}
                  <div className="id-card-facts">
                    {facts.length===0&&(
                      <div className="id-card-fact">
                        <span className="id-card-fact-icon">💙</span>
                        <div><div className="id-card-fact-label">Presentación</div>
                        <div className="id-card-fact-text">Hola, soy {nick}. El equipo UCI se preocupa por conocerme como persona.</div></div>
                      </div>
                    )}
                    {facts.map((f,i)=>(
                      <div key={i} className="id-card-fact">
                        <span className="id-card-fact-icon">{f.icon}</span>
                        <div>
                          <div className="id-card-fact-label">{f.label}</div>
                          <div className="id-card-fact-text">{f.text}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="id-approve-row">
                  <div className={`id-approve-check ${form.idCardApproved?"checked":""}`} onClick={()=>setForm(f=>({...f,idCardApproved:!f.idCardApproved}))}>
                    {form.idCardApproved&&"✓"}
                  </div>
                  <div className="id-approve-text">
                    Confirmo que esta tarjeta representa bien a <strong>{nick}</strong>. Entiendo que el equipo UCI la usará para brindarle un cuidado más humano y personalizado.
                  </div>
                </div>
                <button className="ob-btn" style={{opacity:form.idCardApproved?1:0.55}} onClick={()=>{ if(!form.idCardApproved){showToast("⚠️ Confirma la tarjeta para continuar"); return;} setObStep(5); }}>
                  Confirmar y continuar →
                </button>
                <button className="ob-btn-ghost" onClick={()=>setObStep(3)}>← Volver</button>
              </div>
            );
          })()}

          {obStep === 5 && (
            <div className="ob-step active">
              <div style={{textAlign:"center",marginBottom:24}}>
                <div style={{fontSize:"4rem",marginBottom:12}} className="float">💙</div>
                <div className="ob-logo" style={{marginBottom:8}}>¡Listo, {form.famName.split(" ")[0]}!</div>
                <p className="ob-tagline">El perfil de <strong style={{color:"#00B4D8"}}>{form.patName || "tu familiar"}</strong> fue creado. Estamos aquí para acompañarte.</p>
              </div>
              <div className="ob-card" style={{textAlign:"center"}}>
                <div style={{fontSize:"2rem",marginBottom:8}}>🤝</div>
                <h2 style={{marginBottom:12}}>Tu espacio seguro</h2>
                <p>Desde aquí podrás acceder a información sobre la UCI, entender el proceso de tu familiar y resolver tus dudas en cualquier momento.</p>
              </div>
              <div className="ob-card" style={{background:"rgba(0,180,216,0.1)",border:"1px solid rgba(0,180,216,0.3)"}}>
                <p style={{color:"#CAF0F8",fontSize:"0.85rem",lineHeight:1.7}}>
                  ❤️ <em>"Cuidar a quien cuida es también cuidar al paciente. No estás solo/a en este proceso."</em>
                </p>
              </div>
              <button className="ob-btn" onClick={()=>setPhase("app")}>Entrar a Puente UCI →</button>
            </div>
          )}

          {toast && <div className="toast">{toast}</div>}
        </div>
      </>
    );
  }

  // ── APP ──────────────────────────────────────────────────────────────────────
  const firstName = form.famName.split(" ")[0] || "Familiar";
  const patFirst  = form.patName.split(" ")[0] || "Paciente";

  const TAB_LABELS = {
    home: "Inicio", journey: "El viaje UCI", faq: "Preguntas frecuentes",
    videos: "Videos informativos", profile: "Mi perfil",
    info: "Información útil", eol: "Fin de vida", post: "¿Qué viene después?",
    ficha: "Ficha del Paciente",
  };

  return (
    <>
      <style>{css}</style>
      <div className="app-root">
      <div className={`app-shell${darkMode?" dark-mode":""}`}>

        <nav className="desktop-sidenav">
          <div className="dsk-brand">
            <PuenteLogo size={34} showText={true} />
            <div className="dsk-brand-sub" style={{marginTop:8}}>Cuidado humanizado · Familia</div>
          </div>
          <div className="dsk-patient-pill">
            <div className="dsk-patient-avatar">🧑‍⚕️</div>
            <div>
              <div className="dsk-patient-name">{form.patName || "Paciente"}</div>
              <div className="dsk-patient-status">● En UCI · Destete</div>
            </div>
          </div>
          <div className="dsk-nav-list">
            <div className="dsk-nav-section-label">Principal</div>
            {[
              { id:"home",    label:"Inicio",              Icon: Icon.Home },
              { id:"journey", label:"El viaje UCI",         Icon: Icon.Journey },
              { id:"faq",     label:"Preguntas frecuentes", Icon: Icon.FAQ },
              { id:"videos",  label:"Videos",               Icon: Icon.Video },
            ].map(t => (
              <button key={t.id} className={`dsk-nav-item ${activeTab===t.id?"active":""}`} onClick={()=>setActiveTab(t.id)}>
                <t.Icon/> {t.label}
              </button>
            ))}
            <div className="dsk-nav-sep"/>
            <div className="dsk-nav-section-label">Recursos</div>
            {[
              { id:"info", label:"Información útil",    icon:"ℹ️" },
              { id:"eol",  label:"Fin de vida",          icon:"🕊️" },
              { id:"post", label:"¿Qué viene después?", icon:"🏠" },
            ].map(t => (
              <button key={t.id} className={`dsk-nav-item ${activeTab===t.id?"active":""}`} onClick={()=>setActiveTab(t.id)}>
                <span style={{fontSize:"1rem",width:18,textAlign:"center"}}>{t.icon}</span> {t.label}
              </button>
            ))}
            <div className="dsk-nav-sep"/>
            <button className={`dsk-nav-item ${activeTab==="profile"?"active":""}`} onClick={()=>setActiveTab("profile")}>
              <Icon.Profile/> Mi perfil
            </button>
            <div className="dsk-nav-sep"/>
            <button className={`dsk-nav-item ${activeTab==="ficha"?"active":""}`} onClick={()=>setActiveTab("ficha")}
              style={{background: activeTab==="ficha" ? "rgba(0,119,182,0.2)" : "rgba(0,180,216,0.06)", border: activeTab==="ficha" ? "1px solid rgba(0,180,216,0.4)" : "1px solid rgba(0,180,216,0.15)"}}>
              <Icon.Print/> <span style={{color: activeTab==="ficha" ? "#00B4D8" : "rgba(0,180,216,0.8)"}}>Ficha imprimible</span>
            </button>
          </div>
          <div className="dsk-nav-footer">
            <div className="dsk-user-row" onClick={openSidebar}>
              <div className="dsk-user-avatar">{firstName[0]}</div>
              <div>
                <div className="dsk-user-name">{form.famName || "Familiar"}</div>
                <div className="dsk-user-role">Familiar directo</div>
              </div>
              <button className="dsk-edit-btn">Editar</button>
            </div>
          </div>
        </nav>

        <div className="desktop-content">

        <nav className="topnav">
          <div className="nav-brand"><PuenteLogo size={30} showText={true} /></div>
          <div className="nav-patient-tag">👤 {patFirst}</div>
          <div className="nav-avatar" onClick={openSidebar} title="Editar perfil">{firstName[0]}</div>
        </nav>

        <div className="dsk-topbar">
          <div className="dsk-topbar-title">{TAB_LABELS[activeTab] || "Puente UCI"}</div>
          <div className="dsk-topbar-right">
            <span className="dsk-topbar-patient">👤 {patFirst} · En UCI</span>
            <div className="nav-avatar" onClick={openSidebar} style={{cursor:"pointer"}}>{firstName[0]}</div>
          </div>
        </div>

        <main className="main-content">

          {activeTab === "home" && (
            <div className="screen">
              <div className="home-hero">
                <div className="hero-bg-circle" style={{width:200,height:200,background:"rgba(0,180,216,0.08)",top:-60,right:-60,borderRadius:"50%"}}/>
                <div className="hero-bg-circle" style={{width:120,height:120,background:"rgba(0,180,216,0.06)",bottom:-20,left:20,borderRadius:"50%"}}/>
                <p className="hero-greeting fade-up">Buenos días, {firstName} 👋</p>
                <h1 className="hero-name fade-up delay-1">¿Cómo estás hoy?</h1>
                <p className="hero-sub fade-up delay-2">Estamos aquí para acompañarte</p>
              </div>
              <div className="status-card fade-up delay-2">
                <div className="status-label">Estado de tu familiar</div>
                <div className="status-row">
                  <div className="status-dot active"/>
                  <div className="status-info">
                    <h3>{form.patName || "Paciente"}</h3>
                    <p>{form.patNick ? `"${form.patNick}" · ` : ""}{form.patJob || "UCI"}</p>
                  </div>
                  <span className="status-badge badge-uci">En UCI</span>
                </div>
                <div className="journey-mini">
                  {["Etapa Aguda","Estabiliz.","Destete","Pre-Alta UCI"].map((s,i)=>(
                    <div key={s} style={{display:"flex",alignItems:"center",flex:1}}>
                      <div className="journey-stage">
                        <div className={`j-dot ${i<2?"done":i===2?"current":"future"}`}>{i<2?"✓":i+1}</div>
                        <div className="j-label">{s}</div>
                      </div>
                      {i<3 && <div className={`j-connector ${i<2?"done":""}`}/>}
                    </div>
                  ))}
                </div>
              </div>
              <div className="quick-tip fade-up delay-3">
                <div className="tip-icon">💡</div>
                <div>
                  <h4>Consejo del día</h4>
                  <p>Hablarle a tu familiar, aunque parezca dormido, puede ser reconfortante. Las palabras de amor llegan aunque los ojos estén cerrados.</p>
                </div>
              </div>
              <div className="section-title fade-up delay-3"><span>¿Qué necesitas?</span></div>
              <div className="menu-grid fade-up delay-4">
                {[
                  { cls:"card-info",    icon:"ℹ️", title:"Información de Utilidad", desc:"Horarios, útiles y trámites", tab:"info" },
                  { cls:"card-journey", icon:"🗺️", title:"El Viaje de la UCI",      desc:"Entiende cada etapa del proceso", tab:"journey" },
                  { cls:"card-video",   icon:"▶️", title:"Videos Informativos",     desc:"Cápsulas educativas en video", tab:"videos" },
                  { cls:"card-faq",     icon:"❓", title:"Preguntas Frecuentes",    desc:"Respuestas a tus dudas comunes", tab:"faq" },
                  { cls:"card-eol",     icon:"🕊️", title:"Cuidados de Fin de Vida",desc:"Acompañamiento y apoyo", tab:"eol" },
                  { cls:"card-post",    icon:"🏠", title:"¿Qué viene después?",    desc:"Preparación para el alta", tab:"post" },
                  { cls:"card-print",   icon:"🖨️", title:"Ficha del Paciente",     desc:"Imprimir para pegar en sala UCI", tab:"ficha" },
                ].map(m => (
                  <div key={m.tab} className={`menu-card ${m.cls}`} onClick={()=>setActiveTab(m.tab)}>
                    <div className="menu-icon">{m.icon}</div>
                    <h3>{m.title}</h3>
                    <p>{m.desc}</p>
                    <div className="menu-arrow">Ver más →</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "info" && (
            <div className="screen">
              <div className="screen-header">
                <button className="back-btn" onClick={()=>setActiveTab("home")}>← Inicio</button>
                <h1>Información Útil</h1>
                <p>Todo lo que necesitas saber para acompañar a {patFirst}</p>
              </div>
              <div className="content-card">
                <div className="info-row">
                  <div className="info-icon">🕐</div>
                  <div className="info-content">
                    <h4>Horario de visitas</h4>
                    <div className="horario-badge">⏰ 14:00 – 16:00 hrs</div>
                    <p>¿Necesitas horario especial? Comunícate con el equipo desde la app.</p>
                  </div>
                </div>
                <div className="info-row">
                  <div className="info-icon">🏥</div>
                  <div className="info-content">
                    <h4>Sala UCI — Piso 4</h4>
                    <p>Al llegar, identifícate en el mesón de enfermería. Recuerda usar los elementos de protección (EPP) que te entreguen.</p>
                  </div>
                </div>
                <div className="info-row">
                  <div className="info-icon">📞</div>
                  <div className="info-content">
                    <h4>Información médica</h4>
                    <p>El médico tratante informa a las 11:00 hrs. Solo puede asistir un familiar directo por día.</p>
                  </div>
                </div>
              </div>
              <div className="section-title">
                <span>Lista de útiles de aseo</span>
                <a href="#">{Object.values(checklist).filter(Boolean).length}/{CHECKLIST_ITEMS.length}</a>
              </div>
              <div className="content-card" style={{marginTop:0}}>
                <ul className="checklist">
                  {CHECKLIST_ITEMS.map(item => (
                    <li key={item} onClick={()=>setChecklist(c=>({...c,[item]:!c[item]}))}>
                      <div className={`check-box ${checklist[item]?"checked":""}`}>
                        {checklist[item] && <span style={{color:"var(--ocean)",fontSize:"0.8rem",fontWeight:700}}>✓</span>}
                      </div>
                      <span style={{textDecoration:checklist[item]?"line-through":"none",color:checklist[item]?"var(--slate)":"var(--text)"}}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="quick-tip" style={{margin:"0 16px 16px"}}>
                <div className="tip-icon">💬</div>
                <div>
                  <h4>Comunicación con el equipo</h4>
                  <p>Puedes enviar mensajes al equipo de enfermería desde la app. Próximamente disponible.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "journey" && (
            <div className="screen journey-screen">
              <div className="journey-intro">
                <button className="back-btn" onClick={()=>setActiveTab("home")}>← Inicio</button>
                <h1>El Viaje de la UCI</h1>
                <p>Cada persona recorre la UCI a su ritmo. Algunos avanzan rápido, otros se detienen o retroceden. Todos los caminos son válidos.</p>
              </div>
              <div className="journey-map">
                {JOURNEY_STEPS.map((step, i) => (
                  <div key={step.id} className={`journey-step step-${step.state}`} onClick={()=>setModal({type:"journey-step",step})}>
                    <div className="step-track">
                      <div className="step-circle">{step.state==="done" ? "✓" : step.id}</div>
                      {i < JOURNEY_STEPS.length-1 && <div className="step-line"/>}
                    </div>
                    <div className="step-body">
                      <h3>{step.label} {step.state==="current"&&<span style={{fontSize:"0.7rem",background:"var(--teal)",color:"white",padding:"2px 8px",borderRadius:10,marginLeft:6}}>Hoy</span>}</h3>
                      <p>{step.sub}</p>
                    </div>
                    <div style={{paddingTop:8,color:"var(--slate)",fontSize:"0.75rem"}}>›</div>
                  </div>
                ))}
              </div>
              <div className="journey-note">
                <span>⚠️</span>
                <span>El proceso puede tener avances y retrocesos. El equipo te acompañará y te informará en cada momento del camino.</span>
              </div>
            </div>
          )}

          {activeTab === "videos" && (
            <div className="screen">
              <div className="video-header">
                <button className="back-btn" onClick={()=>setActiveTab("home")}>← Inicio</button>
                <h1>Videos Informativos</h1>
                <p>Cápsulas educativas para entender lo que está viviendo tu familiar</p>
              </div>
              <div className="video-list" style={{marginTop:"-20px"}}>
                {VIDEOS.map((v,i) => (
                  <div key={i} className="video-card fade-up" style={{animationDelay:`${i*0.07}s`}} onClick={()=>setModal({type:"video",v})}>
                    <div className="video-thumb" style={{background:`hsl(${i*47+180},70%,92%)`}}>{v.emoji}</div>
                    <div style={{flex:1}}>
                      <h4>{v.title}</h4>
                      <p>{v.desc}</p>
                      <div className="video-duration">▶ {v.dur} min</div>
                    </div>
                    <div style={{color:"var(--slate)"}}>›</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "faq" && (
            <div className="screen faq-screen">
              <div className="faq-header">
                <button className="back-btn" onClick={()=>setActiveTab("home")}>← Inicio</button>
                <h1>Preguntas Frecuentes</h1>
                <p>Respuestas claras a las dudas más comunes</p>
              </div>
              <div className="faq-categories">
                {Object.keys(FAQ_DATA).map(cat => (
                  <button key={cat} className={`cat-pill ${activeFaqCat===cat?"active":""}`} onClick={()=>{setActiveFaqCat(cat);setOpenFaq(null);}}>
                    {cat}
                  </button>
                ))}
              </div>
              <div className="faq-list">
                {(FAQ_DATA[activeFaqCat]||[]).map((item,i) => (
                  <div key={i} className="faq-item fade-up" style={{animationDelay:`${i*0.08}s`}}>
                    <div className="faq-question" onClick={()=>setOpenFaq(openFaq===i?null:i)}>
                      <span className="faq-q-text">{item.tag && <span style={{marginRight:7}}>{item.tag}</span>}{item.q}</span>
                      <span className={`faq-chevron ${openFaq===i?"open":""}`}>▼</span>
                    </div>
                    {openFaq===i && (
                      <div className="faq-answer">
                        <div className="faq-answer-inner">
                          {item.a.split("\n\n").map((para, pi) => (
                            <p key={pi} style={{marginBottom: pi < item.a.split("\n\n").length-1 ? "10px" : 0}}>{para}</p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="screen">
              <div className="profile-header">
                <div className="profile-avatar">👤</div>
                <h2>{form.famName || "Mi perfil"}</h2>
                <p>Familiar directo</p>
              </div>
              <div className="profile-patient-card">
                <div className="patient-header">
                  <div className="patient-avatar">🧑‍⚕️</div>
                  <div className="patient-info">
                    <h3>{form.patName || "Paciente"}</h3>
                    <p>{form.patJob || "UCI · Piso 4"}</p>
                  </div>
                </div>
                <div className="patient-tags">
                  {form.patNick && <span className="patient-tag tag-blue">"{form.patNick}"</span>}
                  {form.education && <span className="patient-tag tag-green">{form.education}</span>}
                  {form.hobbies.slice(0,3).map(h=><span key={h} className="patient-tag tag-purple">{h}</span>)}
                </div>
              </div>
              <div className="profile-section">
                <div className="profile-section-title">Mi información</div>
                <div className="profile-item" onClick={()=>showToast("✏️ Edición disponible próximamente")}>
                  <div className="profile-item-left">
                    <div className="profile-item-icon">📱</div>
                    <div><h4>Teléfono</h4><p>{form.famPhone || "No registrado"}</p></div>
                  </div>
                  <span className="profile-item-arrow">›</span>
                </div>
                <div className="profile-item" onClick={()=>showToast("📋 Función próximamente")}>
                  <div className="profile-item-left">
                    <div className="profile-item-icon">🌐</div>
                    <div><h4>Idioma</h4><p>Español</p></div>
                  </div>
                  <span className="profile-item-arrow">›</span>
                </div>
              </div>
              <div className="profile-section">
                <div className="profile-section-title">Ayuda y recursos</div>
                <div className="profile-item" onClick={()=>setModal("psych")}>
                  <div className="profile-item-left">
                    <div className="profile-item-icon">🧠</div>
                    <div><h4>Apoyo psicológico</h4><p>Recursos para cuidadores</p></div>
                  </div>
                  <span className="profile-item-arrow">›</span>
                </div>
                <div className="profile-item" onClick={()=>setModal("team")}>
                  <div className="profile-item-left">
                    <div className="profile-item-icon">👨‍⚕️</div>
                    <div><h4>El equipo UCI</h4><p>Roles y funciones del equipo</p></div>
                  </div>
                  <span className="profile-item-arrow">›</span>
                </div>
                <div className="profile-item" onClick={()=>showToast("📞 +56 2 2000 0000")}>
                  <div className="profile-item-left">
                    <div className="profile-item-icon">📞</div>
                    <div><h4>Contacto UCI</h4><p>Línea directa de enfermería</p></div>
                  </div>
                  <span className="profile-item-arrow">›</span>
                </div>
              </div>
              <div className="profile-section">
                <div className="profile-section-title">Sesión</div>
                <div className="profile-item" onClick={()=>{ if(confirm("¿Seguro que quieres salir?")) setPhase("onboarding"); }}>
                  <div className="profile-item-left">
                    <div className="profile-item-icon">🚪</div>
                    <div><h4 style={{color:"#EF4444"}}>Cerrar sesión</h4></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "eol" && (
            <div className="screen">
              <div className="screen-header" style={{background:"linear-gradient(160deg,#1a0533,#4a1060)"}}>
                <button className="back-btn" onClick={()=>setActiveTab("home")}>← Inicio</button>
                <h1>Cuidados de Fin de Vida</h1>
                <p>Acompañamiento con dignidad y respeto</p>
              </div>
              <div style={{padding:"20px 16px",display:"flex",flexDirection:"column",gap:14}}>
                <div style={{background:"#FFF8F0",borderRadius:16,padding:20,border:"1px solid #FDE8D0"}}>
                  <div style={{fontSize:"2rem",marginBottom:10}}>🕊️</div>
                  <p style={{fontSize:"0.875rem",color:"#64748B",lineHeight:1.7}}>Cuando el momento llega, nuestro equipo se enfoca en garantizar el bienestar, la dignidad y el acompañamiento de tu familiar y de toda la familia.</p>
                </div>
                {[
                  { icon:"💊", title:"Manejo del dolor", color:"#FFF0F0", border:"#FFD0D0", desc:"Nos aseguramos que tu familiar esté cómodo. El equipo evalúa y trata el dolor de forma continua. El objetivo es garantizar su bienestar y dignidad en todo momento." },
                  { icon:"🙏", title:"Apoyo espiritual", color:"#F5F0FF", border:"#DDD0FF", desc:"Respetamos profundamente las creencias de cada persona. Puedes solicitar acompañamiento espiritual o religioso en cualquier momento, independientemente de la fe o creencia." },
                  { icon:"💙", title:"Acompañamiento en el duelo", color:"#F0F7FF", border:"#C0D8FF", desc:"El duelo puede comenzar antes de la pérdida. El equipo de psicología y trabajo social está disponible para ti y tu familia. No tienes que atravesar este proceso solo/a." },
                ].map(({icon,title,color,border,desc})=>(
                  <div key={title} style={{background:color,borderRadius:16,padding:20,border:`1px solid ${border}`}}>
                    <div style={{fontSize:"1.8rem",marginBottom:8}}>{icon}</div>
                    <h3 style={{fontSize:"1rem",fontWeight:700,color:"#0A1628",marginBottom:8}}>{title}</h3>
                    <p style={{fontSize:"0.85rem",color:"#64748B",lineHeight:1.7}}>{desc}</p>
                  </div>
                ))}
                <div style={{background:"rgba(0,180,216,0.08)",borderRadius:16,padding:16,border:"1px solid rgba(0,180,216,0.2)",marginTop:4}}>
                  <p style={{fontSize:"0.82rem",color:"#0077B6",lineHeight:1.7,textAlign:"center"}}>
                    💙 <em>"El cuidado no termina cuando la medicina llega a su límite. Comienza una nueva forma de cuidar."</em>
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "post" && (
            <div className="screen">
              <div className="screen-header" style={{background:"linear-gradient(160deg,#064e3b,#059669)"}}>
                <button className="back-btn" onClick={()=>setActiveTab("home")}>← Inicio</button>
                <h1>¿Qué viene después?</h1>
                <p>Preparación para la vida post-UCI</p>
              </div>
              <div style={{padding:"20px 16px",display:"flex",flexDirection:"column",gap:14}}>
                <div style={{background:"#ECFDF5",borderRadius:16,padding:16,border:"1px solid #A7F3D0"}}>
                  <p style={{fontSize:"0.875rem",color:"#065F46",lineHeight:1.7}}>🌱 <strong>¡Una buena noticia!</strong> Si tu familiar está acercándose al alta de la UCI, significa que su estado ha mejorado significativamente. El equipo ya está planificando los siguientes pasos.</p>
                </div>
                {[
                  { n:"1", icon:"🏥", title:"Traslado a sala general", desc:"Cuando la condición se estabiliza, tu familiar será trasladado a un servicio de menor complejidad. Habrá menos máquinas y más autonomía. El equipo de la UCI entregará toda la información al equipo que lo recibirá." },
                  { n:"2", icon:"💪", title:"Rehabilitación", desc:"Es frecuente necesitar rehabilitación física, respiratoria, cognitiva o del habla tras una estadía en UCI. El equipo de kinesiología y terapia ocupacional diseñará un plan personalizado." },
                  { n:"3", icon:"📋", title:"Planificación del alta hospitalaria", desc:"El equipo preparará un plan de cuidados para el hogar con instrucciones claras: medicamentos, curaciones, signos de alarma y a qué servicio acudir si es necesario." },
                  { n:"4", icon:"🩺", title:"Seguimiento ambulatorio", desc:"El alta hospitalaria no es el fin del cuidado. Habrá controles médicos programados y apoyo profesional según las necesidades específicas de tu familiar." },
                ].map(s=>(
                  <div key={s.n} style={{background:"white",borderRadius:16,padding:18,boxShadow:"0 2px 12px rgba(0,0,0,0.06)",display:"flex",gap:14,alignItems:"flex-start"}}>
                    <div style={{width:38,height:38,borderRadius:"50%",background:"#059669",color:"white",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.1rem",fontWeight:700,flexShrink:0}}>{s.icon}</div>
                    <div>
                      <div style={{fontSize:"0.65rem",fontWeight:700,color:"#059669",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4}}>Paso {s.n}</div>
                      <h3 style={{fontSize:"0.95rem",fontWeight:700,color:"#0A1628",marginBottom:6}}>{s.title}</h3>
                      <p style={{fontSize:"0.82rem",color:"#64748B",lineHeight:1.6}}>{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "ficha" && (() => {
            const nick       = form.patNick || patFirst;
            const allHobbies = form.hobbies.filter(h => !h.startsWith("["));
            const music      = allHobbies.filter(h => ["Cumbia","Bolero","Salsa","Rock","Pop","Baladas","Música clásica","Folklore","Reggaetón","Música religiosa","Clásica","Religiosa"].includes(h));
            const sport      = allHobbies.filter(h => ["Caminar","Fútbol","Natación","Ciclismo","Gimnasio","Baile","Yoga / Pilates","Yoga","No practica"].includes(h));
            const daily      = allHobbies.filter(h => ["Leer","Ver TV / Series","Ver TV","Cocinar","Jardín / Plantas","Jardín","Artesanías","Juegos de mesa","Pesca","Tejido / Bordado","Tejido","Carpintería","Voluntariado"].includes(h));
            const social     = allHobbies.filter(h => ["Muy sociable","Le gusta la tranquilidad","Activo en su comunidad","Comunidad activa","Práctica religiosa regular","Práctica religiosa","Reuniones familiares frecuentes","Reuniones familiares","Tiene mascotas"].includes(h));
            const devices    = (form.helpDevices||[]).filter(h => !h.includes("No utiliza"));
            const familyList = treeNodes.filter(n => n.id !== "pat" && n.label);
            const musicDisplay = [...music, ...(form.musicCustom ? [form.musicCustom] : [])];
            const sportDisplay = [...sport, ...(form.sportCustom ? [form.sportCustom] : [])];
            const dailyDisplay = [...daily, ...(form.dailyCustom ? [form.dailyCustom] : [])];
            const livesWith  = form.livesWith || [];
            const livesWhere = form.livesWhere || "";
            const zonaType   = form.zonaType || "";
            const familyMsg  = form.familyMessage || "";
            const today = new Date().toLocaleDateString("es-CL", { day:"2-digit", month:"long", year:"numeric" });
            return (
              <div className="screen print-screen">
                <div className="print-screen-header">
                  <button className="back-btn" onClick={()=>setActiveTab("home")}>← Inicio</button>
                  <h1>🖨️ Ficha del Paciente</h1>
                  <p>Vista previa de la ficha humanizada para imprimir y pegar en sala UCI</p>
                </div>
                <div className="print-note" style={{margin:"20px 24px 0"}}>
                  <span style={{fontSize:"1.1rem",flexShrink:0}}>💡</span>
                  <span>Esta ficha resume quién es <strong>{form.patName || "el paciente"}</strong> más allá de su diagnóstico. Imprímela en hoja A4 horizontal y pégala en la cabecera de su cama para que todo el equipo pueda conocerle como persona.</span>
                </div>
                <div className="print-preview-wrap" id="patient-poster-root">
                  <div className="patient-poster">
                    <div className="poster-top-bar">
                      <div>
                        <div className="poster-brand">💙 Puente <span>UCI</span></div>
                        <div className="poster-tagline">Humanización del Cuidado Intensivo</div>
                      </div>
                      <div className="poster-uci-badge">📋 Ficha Humanizada · {today}</div>
                    </div>
                    <div className="poster-body">
                      <div className="poster-left">
                        <div className="poster-avatar-wrap">{treeNodes.find(n=>n.id==="pat")?.emoji || "🧑‍⚕️"}</div>
                        <div className="poster-pat-name">
                          <h2>{form.patName || "Nombre del Paciente"}</h2>
                          {nick !== patFirst && <div className="nickname">"{nick}"</div>}
                        </div>
                        <div className="poster-left-divider"/>
                        {form.patJob && (<div className="poster-meta-item"><div className="poster-meta-label">💼 Ocupación</div><div className="poster-meta-value">{form.patJob}</div></div>)}
                        {form.education && (<div className="poster-meta-item"><div className="poster-meta-label">🎓 Educación</div><div className="poster-meta-value">{form.education}</div></div>)}
                        {devices.length > 0 && (<><div className="poster-left-divider"/><div className="poster-devices"><div className="poster-devices-title">🦾 Ayudas técnicas</div><div className="poster-devices-grid">{devices.map(d=>(<span key={d} className="poster-device-tag">{d}</span>))}</div></div></>)}
                        {familyList.length > 0 && (<><div className="poster-left-divider"/><div className="poster-devices" style={{width:"100%"}}><div className="poster-devices-title">👨‍👩‍👧 Su familia</div><div className="poster-family-list">{familyList.slice(0,5).map(n=>(<div key={n.id} className="poster-family-item">{n.photo ? <img src={n.photo} alt={n.label} style={{width:22,height:22,borderRadius:"50%",objectFit:"cover",flexShrink:0}}/> : <span className="poster-family-emoji">{n.emoji}</span>}<span className="poster-family-name">{n.label}</span><span className="poster-family-role">· {n.role}</span></div>))}</div></div></>)}
                      </div>
                      <div className="poster-right">
                        <div className="poster-section">
                          <div className="poster-section-title">🎵 Música que le gusta</div>
                          {musicDisplay.length > 0 ? (<div className="poster-tags">{musicDisplay.map(t=><span key={t} className="poster-tag">{t}</span>)}{form.musicExtra && <span className="poster-tag teal">🎤 {form.musicExtra}</span>}</div>) : (form.musicExtra ? <div className="poster-tags"><span className="poster-tag teal">🎤 {form.musicExtra}</span></div> : <div className="poster-empty">No especificado</div>)}
                        </div>
                        <div className="poster-section">
                          <div className="poster-section-title">🏃 Actividad física</div>
                          {sportDisplay.length > 0 ? (<div className="poster-tags">{sportDisplay.map(t=><span key={t} className="poster-tag green">{t}</span>)}</div>) : (<div className="poster-empty">No especificado</div>)}
                        </div>
                        <div className="poster-section">
                          <div className="poster-section-title">🌿 Actividades cotidianas</div>
                          {dailyDisplay.length > 0 ? (<div className="poster-tags">{dailyDisplay.map(t=><span key={t} className="poster-tag purple">{t}</span>)}</div>) : (<div className="poster-empty">No especificado</div>)}
                        </div>
                        <div className="poster-section">
                          <div className="poster-section-title">👥 Vida social y espiritual</div>
                          {social.length > 0 ? (<div className="poster-tags">{social.map(t=><span key={t} className="poster-tag orange">{t}</span>)}</div>) : form.extra ? (<div className="poster-tags"><span className="poster-tag orange">{form.extra}</span></div>) : (<div className="poster-empty">No especificado</div>)}
                          {form.extra && social.length > 0 && (<div style={{marginTop:6}} className="poster-tags"><span className="poster-tag orange">💬 {form.extra}</span></div>)}
                        </div>
                        <div className="poster-phrase-section">
                          <div className="poster-phrase-icon">💙</div>
                          <div className="poster-phrase-text">
                            <strong>Nuestro compromiso con {nick}</strong>
                            "Detrás de cada paciente hay una persona con una historia única. Conocerte nos permite cuidarte mejor. Estamos aquí para acompañarte en cada etapa de este camino."
                          </div>
                        </div>
                      </div>{/* end poster-right */}

                      {/* ── COLUMNA 3: Vivienda + Mensaje familiar ── */}
                      <div className="poster-extra">

                        {/* Con quién vive */}
                        <div className="poster-extra-section">
                          <div className="poster-extra-title">🏠 Con quién vive</div>
                          {livesWith.length > 0 ? (
                            <div className="poster-tags">
                              {livesWith.map(t=><span key={t} className="poster-tag">{t}</span>)}
                            </div>
                          ) : (
                            <div className="poster-empty">No especificado</div>
                          )}
                        </div>

                        {/* Dónde vive + zona */}
                        <div className="poster-extra-section">
                          <div className="poster-extra-title">📍 Dónde vive</div>
                          {livesWhere ? (
                            <div style={{fontSize:"0.72rem",color:"#334155",lineHeight:1.5,marginBottom:4}}>{livesWhere}</div>
                          ) : (
                            <div className="poster-empty" style={{marginBottom:4}}>No especificado</div>
                          )}
                          {zonaType && (
                            <span className={`poster-zona-badge ${zonaType==="Urbana"?"zona-urbana":"zona-rural"}`}>
                              {zonaType==="Urbana" ? "🏙️" : "🌄"} Zona {zonaType}
                            </span>
                          )}
                        </div>

                        {/* Mensaje libre de la familia */}
                        <div className="poster-extra-section" style={{flex:1,display:"flex",flexDirection:"column"}}>
                          <div className="poster-extra-title">💬 La familia nos cuenta</div>
                          {familyMsg ? (
                            <>
                              <div className="poster-message-text">"{familyMsg}"</div>
                              <div className="poster-message-lines" style={{marginTop:"auto",paddingTop:8}}>
                                {[...Array(3)].map((_,i)=><div key={i} className="poster-message-line"/>)}
                              </div>
                            </>
                          ) : (
                            <>
                              <div style={{fontSize:"0.6rem",color:"#94A3B8",marginBottom:8,fontStyle:"italic"}}>
                                Espacio libre para que la familia comparta algo especial sobre {nick}
                              </div>
                              <div className="poster-message-lines">
                                {[...Array(7)].map((_,i)=><div key={i} className="poster-message-line"/>)}
                              </div>
                            </>
                          )}
                        </div>

                      </div>{/* end poster-extra */}
                    </div>{/* end poster-body */}
                    <div className="poster-bottom-bar">
                      <div className="poster-bottom-left">Información proporcionada por la familia · Puente UCI · Humanización del Cuidado Intensivo</div>
                      <div className="poster-bottom-right">🏥 Unidad de Cuidados Intensivos</div>
                    </div>
                  </div>{/* end patient-poster */}
                </div>
                <div className="print-actions">
                  <button className="print-btn-primary" onClick={()=>window.print()}>🖨️ Imprimir ficha</button>
                  <button className="print-btn-secondary" onClick={()=>{
                    const el = document.getElementById("patient-poster-root");
                    if (el) {
                      const w = window.open("","_blank");
                      w.document.write(`<html><head><title>Ficha ${form.patName}</title><style>@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');@page { size: A4 landscape; margin: 0; }body { margin: 0; font-family: 'DM Sans', sans-serif; }</style></head><body>${el.innerHTML}</body></html>`);
                      w.document.close();
                      setTimeout(()=>w.print(), 800);
                    }
                  }}>🗂️ Abrir en nueva ventana</button>
                </div>
                <div className="print-note">
                  <span style={{fontSize:"1rem",flexShrink:0}}>⚙️</span>
                  <span>Para mejores resultados: imprime en <strong>A4 horizontal</strong>, activa <strong>"Más opciones → Ajustar al tamaño de página"</strong> en el diálogo de impresión, y desactiva los márgenes para que ocupe la hoja completa.</span>
                </div>
              </div>
            );
          })()}
        </main>

        <nav className="bottom-nav">
          <div className="nav-tabs">
            {[
              { id:"home",    label:"Inicio",   Icon: Icon.Home },
              { id:"journey", label:"Mi camino", Icon: Icon.Journey },
              { id:"faq",     label:"Preguntas", Icon: Icon.FAQ },
              { id:"videos",  label:"Videos",   Icon: Icon.Video },
              { id:"profile", label:"Perfil",   Icon: Icon.Profile },
            ].map(t => (
              <button key={t.id} className={`nav-tab ${activeTab===t.id?"active":""}`} onClick={()=>setActiveTab(t.id)}>
                <t.Icon/>
                {t.label}
              </button>
            ))}
          </div>
        </nav>

        </div>

        {modal && (
          <div className="modal-overlay" onClick={()=>setModal(null)}>
            <div className="modal-sheet" onClick={e=>e.stopPropagation()}>
              <div className="modal-handle"/>
              {modal?.type === "journey-step" && (
                <>
                  <div className="modal-title">{modal.step.label}</div>
                  <p style={{fontSize:"0.8rem",color:"var(--teal)",marginBottom:12,fontWeight:600}}>{modal.step.sub}</p>
                  <div className="modal-body">{modal.step.desc}</div>
                  <div style={{marginTop:20,padding:14,background:"var(--light)",borderRadius:14,fontSize:"0.8rem",color:"var(--slate)",lineHeight:1.6}}>
                    💙 Cada etapa es diferente. Tu familiar puede estar en cualquiera de estos momentos, y el equipo adapta el cuidado a su necesidad específica del día.
                  </div>
                </>
              )}
              {modal?.type === "video" && (
                <>
                  <div style={{fontSize:"3rem",textAlign:"center",marginBottom:12}}>{modal.v.emoji}</div>
                  <div className="modal-title">{modal.v.title}</div>
                  <p style={{fontSize:"0.8rem",color:"var(--slate)",marginBottom:16}}>{modal.v.desc} · {modal.v.dur} min</p>
                  <div style={{background:"#F0F9FF",borderRadius:16,padding:24,textAlign:"center",marginBottom:16}}>
                    <div style={{fontSize:"2.5rem",marginBottom:8}}>▶️</div>
                    <p style={{fontSize:"0.85rem",color:"var(--slate)"}}>Esta cápsula estará disponible en la versión completa de la app.</p>
                  </div>
                  <div className="modal-body">Mientras tanto, puedes preguntar directamente al equipo de enfermería o al médico tratante sobre este tema.</div>
                </>
              )}
              {modal === "psych" && (
                <>
                  <div className="modal-title">🧠 Apoyo para cuidadores</div>
                  <div className="modal-body">
                    <p style={{marginBottom:16}}>Cuidar a un familiar en UCI es emocionalmente agotador. Es normal sentir miedo, tristeza, frustración o culpa. Aquí hay recursos para ti:</p>
                    {["Psicólogo/a del equipo UCI · Solicitar a enfermería","Grupos de apoyo a familias · Cada jueves 18hrs","Línea de escucha 24/7 · Fono Salud Mental: 600 360 7777"].map(r=>(
                      <div key={r} style={{padding:"12px 14px",background:"var(--light)",borderRadius:12,marginBottom:8,fontSize:"0.85rem",color:"var(--text)",lineHeight:1.5}}>💙 {r}</div>
                    ))}
                  </div>
                </>
              )}
              {modal === "team" && (
                <>
                  <div className="modal-title">👨‍⚕️ El equipo UCI</div>
                  <div className="modal-body">
                    {[
                      {r:"Médico/a tratante",d:"Lidera el diagnóstico y plan de tratamiento. Informa a las 11:00 hrs."},
                      {r:"Enfermero/a",d:"Cuidado directo y continuo. Tu principal punto de contacto en la UCI."},
                      {r:"Kinesiólogo/a",d:"Manejo respiratorio y movilización progresiva del paciente."},
                      {r:"TENS",d:"Apoyo en cuidados básicos: higiene, posición, confort."},
                      {r:"Psicólogo/a",d:"Apoyo emocional para el paciente y la familia."},
                      {r:"Trabajador/a Social",d:"Orientación en recursos, trámites y red de apoyo familiar."},
                    ].map(({r,d})=>(
                      <div key={r} style={{display:"flex",gap:10,marginBottom:12,alignItems:"flex-start"}}>
                        <span style={{fontSize:"1.1rem",flexShrink:0}}>🏥</span>
                        <div><strong style={{fontSize:"0.875rem",color:"var(--text)"}}>{r}</strong><p style={{fontSize:"0.78rem",color:"var(--slate)",marginTop:2,lineHeight:1.5}}>{d}</p></div>
                      </div>
                    ))}
                  </div>
                </>
              )}
              <button className="ob-btn" style={{marginTop:20}} onClick={()=>setModal(null)}>Cerrar</button>
            </div>
          </div>
        )}

        {toast && <div className="toast">{toast}</div>}

        {sidebarOpen && draft && (
          <>
            <div className="sidebar-overlay" onClick={()=>setSidebarOpen(false)}/>
            <aside className="sidebar">
              <div className="sidebar-head">
                <button className="sidebar-close" onClick={()=>setSidebarOpen(false)}>✕</button>
                <h2>Editar perfil</h2>
                <p>Los cambios se aplican al guardar</p>
              </div>
              <div className="sidebar-body">
                <div className="sidebar-section">
                  <div className="sidebar-section-title">👤 Mis datos (familiar)</div>
                  <div className="sidebar-field"><label>Nombre</label><input value={draft.famName} onChange={e=>setDraft(d=>({...d,famName:e.target.value}))} placeholder="Tu nombre completo"/></div>
                  <div className="sidebar-field"><label>WhatsApp</label><input value={draft.famPhone} onChange={e=>setDraft(d=>({...d,famPhone:e.target.value}))} placeholder="+56 9 1234 5678"/></div>
                </div>
                <div className="sidebar-section">
                  <div className="sidebar-section-title">🧑‍⚕️ Datos del paciente</div>
                  <div className="sidebar-field"><label>Nombre completo</label><input value={draft.patName} onChange={e=>setDraft(d=>({...d,patName:e.target.value}))} placeholder="Nombre del paciente"/></div>
                  <div className="sidebar-field"><label>¿Cómo le llaman?</label><input value={draft.patNick} onChange={e=>setDraft(d=>({...d,patNick:e.target.value}))} placeholder="Apodo o nombre preferido"/></div>
                  <div className="sidebar-field"><label>Ocupación</label><input value={draft.patJob} onChange={e=>setDraft(d=>({...d,patJob:e.target.value}))} placeholder="Profesión u oficio"/></div>
                  <div className="sidebar-field"><label>Nivel educacional</label>
                    <select value={draft.education} onChange={e=>setDraft(d=>({...d,education:e.target.value}))}>
                      <option value="">Selecciona...</option>
                      {["Básica","Media","Técnica","Universitaria","Postgrado"].map(o=><option key={o}>{o}</option>)}
                    </select>
                  </div>
                </div>
                <div className="sidebar-section">
                  <div className="sidebar-section-title">🎵 Música</div>
                  <div className="sidebar-chip-grid">
                    {["Cumbia","Bolero","Salsa","Rock","Pop","Baladas","Clásica","Folklore","Reggaetón","Religiosa"].map(h=>(
                      <button key={h} className={`sidebar-chip${draft.hobbies.includes(h)?" sel":""}`} onClick={()=>toggleDraftChip("hobbies",h)}>{h}</button>
                    ))}
                    {draft.hobbies.filter(h=>h.startsWith("[music]")).map(h=>(
                      <button key={h} className="sidebar-chip sel custom">{h.replace("[music]","")} <span className="chip-remove" onClick={e=>{e.stopPropagation();removeTag(h);}}>✕</span></button>
                    ))}
                  </div>
                  <div className="custom-tag-row">
                    <input className="custom-tag-input" placeholder="Ej: Jazz, Cueca, Trap..." value={customInputs.music} onChange={e=>setCustomInputs(c=>({...c,music:e.target.value}))} onKeyDown={e=>{if(e.key==="Enter"){addCustomTag("music","[music]");e.preventDefault();}}} />
                    <button className="custom-tag-add" onClick={()=>addCustomTag("music","[music]")}>+</button>
                  </div>
                  <div className="sidebar-field" style={{marginTop:8}}><label>Artista o canción favorita</label><input value={draft.musicExtra||""} onChange={e=>setDraft(d=>({...d,musicExtra:e.target.value}))} placeholder="Ej: Los Jaivas, La Joya del Pacífico..."/></div>
                </div>
                <div className="sidebar-section">
                  <div className="sidebar-section-title">🏃 Actividad física</div>
                  <div className="sidebar-chip-grid">
                    {["Caminar","Fútbol","Natación","Ciclismo","Gimnasio","Baile","Yoga","No practica"].map(h=>(
                      <button key={h} className={`sidebar-chip${draft.hobbies.includes(h)?" sel":""}`} onClick={()=>toggleDraftChip("hobbies",h)}>{h}</button>
                    ))}
                    {draft.hobbies.filter(h=>h.startsWith("[sport]")).map(h=>(
                      <button key={h} className="sidebar-chip sel custom">{h.replace("[sport]","")} <span className="chip-remove" onClick={e=>{e.stopPropagation();removeTag(h);}}>✕</span></button>
                    ))}
                  </div>
                  <div className="custom-tag-row">
                    <input className="custom-tag-input" placeholder="Ej: Tenis, Golf, Boxeo..." value={customInputs.sport} onChange={e=>setCustomInputs(c=>({...c,sport:e.target.value}))} onKeyDown={e=>{if(e.key==="Enter"){addCustomTag("sport","[sport]");e.preventDefault();}}} />
                    <button className="custom-tag-add" onClick={()=>addCustomTag("sport","[sport]")}>+</button>
                  </div>
                </div>
                <div className="sidebar-section">
                  <div className="sidebar-section-title">🌿 Actividades cotidianas</div>
                  <div className="sidebar-chip-grid">
                    {["Leer","Ver TV","Cocinar","Jardín","Artesanías","Pesca","Tejido","Carpintería","Voluntariado"].map(h=>(
                      <button key={h} className={`sidebar-chip${draft.hobbies.includes(h)?" sel":""}`} onClick={()=>toggleDraftChip("hobbies",h)}>{h}</button>
                    ))}
                    {draft.hobbies.filter(h=>h.startsWith("[daily]")).map(h=>(
                      <button key={h} className="sidebar-chip sel custom">{h.replace("[daily]","")} <span className="chip-remove" onClick={e=>{e.stopPropagation();removeTag(h);}}>✕</span></button>
                    ))}
                  </div>
                  <div className="custom-tag-row">
                    <input className="custom-tag-input" placeholder="Ej: Pintura, Ajedrez, Fotografía..." value={customInputs.daily} onChange={e=>setCustomInputs(c=>({...c,daily:e.target.value}))} onKeyDown={e=>{if(e.key==="Enter"){addCustomTag("daily","[daily]");e.preventDefault();}}} />
                    <button className="custom-tag-add" onClick={()=>addCustomTag("daily","[daily]")}>+</button>
                  </div>
                </div>
                <div className="sidebar-section">
                  <div className="sidebar-section-title">👥 Vida social y espiritual</div>
                  <div className="sidebar-chip-grid">
                    {["Muy sociable","Le gusta la tranquilidad","Comunidad activa","Práctica religiosa","Reuniones familiares","Tiene mascotas"].map(h=>(
                      <button key={h} className={`sidebar-chip${draft.hobbies.includes(h)?" sel":""}`} onClick={()=>toggleDraftChip("hobbies",h)}>{h}</button>
                    ))}
                    {draft.hobbies.filter(h=>h.startsWith("[social]")).map(h=>(
                      <button key={h} className="sidebar-chip sel custom">{h.replace("[social]","")} <span className="chip-remove" onClick={e=>{e.stopPropagation();removeTag(h);}}>✕</span></button>
                    ))}
                  </div>
                  <div className="custom-tag-row">
                    <input className="custom-tag-input" placeholder="Ej: Club de adultos mayores, Coro..." value={customInputs.social} onChange={e=>setCustomInputs(c=>({...c,social:e.target.value}))} onKeyDown={e=>{if(e.key==="Enter"){addCustomTag("social","[social]");e.preventDefault();}}} />
                    <button className="custom-tag-add" onClick={()=>addCustomTag("social","[social]")}>+</button>
                  </div>
                  <div className="sidebar-field" style={{marginTop:10}}><label>Comentario adicional</label><input value={draft.extra||""} onChange={e=>setDraft(d=>({...d,extra:e.target.value}))} placeholder="Algo más que quieras contarnos..."/></div>
                </div>
                <div className="sidebar-section">
                  <div className="sidebar-section-title">🦾 Ayudas técnicas</div>
                  <div className="sidebar-chip-grid">
                    {["Lentes 👓","Audífonos 🦻","Bastón 🦯","Andador 🚶","Silla de ruedas ♿","Prótesis dental 🦷","Marcapasos 🫀","No utiliza ninguna ✓"].map(h=>(
                      <button key={h} className={`sidebar-chip${draft.helpDevices.includes(h)?" sel":""}`} onClick={()=>toggleDraftChip("helpDevices",h)}>{h}</button>
                    ))}
                  </div>
                </div>
                <div className="sidebar-section">
                  <div className="sidebar-section-title">🏠 Vivienda del paciente</div>

                  <div className="sidebar-field">
                    <label>Con quién vive</label>
                    <div className="sidebar-chip-grid" style={{marginBottom:0}}>
                      {["Solo/a","Con pareja","Con hijos","Con padres","Con hermanos","Con nietos","Con cuidador/a","En hogar de adulto mayor"].map(h=>(
                        <button key={h}
                          className={`sidebar-chip${(draft.livesWith||[]).includes(h)?" sel":""}`}
                          onClick={()=>{
                            const cur = draft.livesWith||[];
                            setDraft(d=>({...d, livesWith: cur.includes(h) ? cur.filter(x=>x!==h) : [...cur,h]}));
                          }}>{h}</button>
                      ))}
                    </div>
                  </div>

                  <div className="sidebar-field" style={{marginTop:10}}>
                    <label>Dónde vive (ciudad, comuna, sector)</label>
                    <input
                      value={draft.livesWhere||""}
                      onChange={e=>setDraft(d=>({...d,livesWhere:e.target.value}))}
                      placeholder="Ej: Pudahuel, Santiago / Sector rural Los Maitenes..."/>
                  </div>

                  <div className="sidebar-field" style={{marginTop:10}}>
                    <label>Tipo de zona</label>
                    <div style={{display:"flex",gap:8,marginTop:4}}>
                      {["Urbana","Rural"].map(z=>(
                        <button key={z}
                          onClick={()=>setDraft(d=>({...d,zonaType:d.zonaType===z?"":z}))}
                          style={{
                            flex:1, padding:"10px 8px", borderRadius:10, cursor:"pointer",
                            fontFamily:"'DM Sans',sans-serif", fontSize:"0.85rem", fontWeight:600,
                            border: draft.zonaType===z ? "2px solid var(--teal)" : "1.5px solid #E2E8F0",
                            background: draft.zonaType===z ? "var(--teal)" : "#F8FAFC",
                            color: draft.zonaType===z ? "white" : "var(--slate)",
                            transition:"all 0.18s",
                          }}>
                          {z==="Urbana" ? "🏙️ Urbana" : "🌄 Rural"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="sidebar-section">
                  <div className="sidebar-section-title">💬 Mensaje de la familia</div>
                  <div className="sidebar-field">
                    <label>¿Hay algo más que quieran contarnos sobre {draft.patNick||draft.patName||"el paciente"}?</label>
                    <textarea
                      value={draft.familyMessage||""}
                      onChange={e=>setDraft(d=>({...d,familyMessage:e.target.value}))}
                      placeholder="Escribe aquí cualquier cosa que consideres importante que el equipo de salud sepa: rasgos de personalidad, miedos, esperanzas, anécdotas, creencias, cosas que le dan ánimo..."
                      style={{
                        width:"100%", padding:"10px 14px",
                        border:"1.5px solid #E2E8F0", borderRadius:10,
                        fontFamily:"'DM Sans',sans-serif", fontSize:"0.875rem",
                        color:"var(--text)", background:"#F8FAFC",
                        outline:"none", resize:"vertical", minHeight:110,
                        lineHeight:1.6, transition:"border-color 0.2s",
                      }}
                      onFocus={e=>e.target.style.borderColor="var(--teal)"}
                      onBlur={e=>e.target.style.borderColor="#E2E8F0"}
                    />
                    <div style={{fontSize:"0.7rem",color:"var(--slate)",marginTop:5,textAlign:"right"}}>
                      {(draft.familyMessage||"").length} caracteres
                    </div>
                  </div>
                  <div style={{
                    background:"#EFF6FF",border:"1px solid #BFDBFE",
                    borderRadius:10,padding:"10px 12px",
                    fontSize:"0.75rem",color:"#1E40AF",lineHeight:1.6,
                  }}>
                    💙 Este mensaje aparecerá en la ficha imprimible para que todo el equipo pueda leerlo.
                  </div>
                </div>

                <div className="sidebar-section">
                  <div className="sidebar-section-title">⚙️ Preferencias</div>
                  <div className="toggle-row">
                    <div className="toggle-row-left"><span>{darkMode ? "🌙 Modo noche" : "☀️ Modo día"}</span><small>{darkMode ? "Pantalla oscura, ideal de noche" : "Pantalla clara, ideal de día"}</small></div>
                    <button className={`toggle-sw ${darkMode?"on":"off"}`} onClick={()=>setDarkMode(v=>!v)}/>
                  </div>
                  <div className="toggle-row">
                    <div className="toggle-row-left"><span>🔔 Notificaciones</span><small>{notifs ? "Recibirás avisos del equipo" : "Notificaciones desactivadas"}</small></div>
                    <button className={`toggle-sw ${notifs?"on":"off"}`} onClick={()=>setNotifs(v=>!v)}/>
                  </div>
                </div>
                <button className="sidebar-save-btn" onClick={saveSidebar}>Guardar cambios ✓</button>
              </div>
            </aside>
          </>
        )}
      </div>
      </div>
    </>
  );
}
