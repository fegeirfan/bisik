<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Bisik — Ruang Ceritamu</title>
<script src="https://cdn.tailwindcss.com"></script>
<link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
<style>
  :root {
    --bg: #080e1a;
    --surface: #0d1525;
    --card: #111e35;
    --border: rgba(99,102,241,0.15);
    --accent: #6366f1;
    --accent-soft: rgba(99,102,241,0.12);
    --accent-glow: rgba(99,102,241,0.35);
    --text-primary: #e8eaf0;
    --text-secondary: #7b829e;
    --text-muted: #3d4560;
    --gold: #c9a84c;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: var(--bg);
    color: var(--text-primary);
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
    overflow-x: hidden;
  }

  /* noise overlay */
  body::before {
    content: '';
    position: fixed; inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
    pointer-events: none; z-index: 0; opacity: 0.4;
  }

  /* scrollbar */
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--text-muted); border-radius: 2px; }

  /* aurora bg */
  .aurora {
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
    overflow: hidden;
  }
  .aurora-blob {
    position: absolute; border-radius: 50%;
    filter: blur(80px); opacity: 0.07;
    animation: drift 18s ease-in-out infinite;
  }
  .aurora-blob:nth-child(1) {
    width: 600px; height: 600px;
    background: radial-gradient(circle, #6366f1, transparent);
    top: -200px; left: -100px;
    animation-delay: 0s;
  }
  .aurora-blob:nth-child(2) {
    width: 400px; height: 400px;
    background: radial-gradient(circle, #8b5cf6, transparent);
    bottom: -100px; right: -100px;
    animation-delay: -6s;
  }
  .aurora-blob:nth-child(3) {
    width: 300px; height: 300px;
    background: radial-gradient(circle, #4f46e5, transparent);
    top: 50%; left: 50%;
    animation-delay: -12s;
  }
  @keyframes drift {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(30px, -40px) scale(1.05); }
    66% { transform: translate(-20px, 30px) scale(0.95); }
  }

  /* pages */
  .page { display: none; position: relative; z-index: 1; }
  .page.active { display: flex; }

  /* HEADER */
  .header {
    position: fixed; top: 0; left: 0; right: 0;
    z-index: 50;
    padding: 0 24px;
    height: 56px;
    display: flex; align-items: center; justify-content: space-between;
    background: rgba(8,14,26,0.7);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
  }
  .logo {
    font-family: 'Lora', serif;
    font-size: 1.25rem;
    font-style: italic;
    color: var(--text-primary);
    letter-spacing: -0.01em;
  }
  .logo span { color: var(--accent); }

  /* persona selector */
  .persona-pill {
    display: flex; align-items: center; gap: 6px;
    background: var(--accent-soft);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 5px 14px;
    cursor: pointer;
    font-size: 0.8rem;
    color: var(--text-secondary);
    transition: all 0.2s;
    user-select: none;
  }
  .persona-pill:hover { border-color: var(--accent); color: var(--text-primary); }

  .persona-dropdown {
    position: absolute; top: 50px; right: 24px;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 8px;
    display: none;
    flex-direction: column; gap: 2px;
    min-width: 160px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.4);
    animation: fadeSlide 0.2s ease;
    z-index: 100;
  }
  .persona-dropdown.open { display: flex; }
  @keyframes fadeSlide {
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .persona-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.85rem;
    color: var(--text-secondary);
    transition: all 0.15s;
  }
  .persona-item:hover { background: var(--accent-soft); color: var(--text-primary); }
  .persona-item.selected { color: var(--accent); }

  /* nav icons */
  .nav-btn {
    width: 36px; height: 36px;
    display: flex; align-items: center; justify-content: center;
    border-radius: 8px;
    cursor: pointer;
    color: var(--text-muted);
    transition: all 0.2s;
    border: none; background: transparent;
  }
  .nav-btn:hover { color: var(--text-primary); background: var(--accent-soft); }
  .nav-btn.active { color: var(--accent); }

  /* ======================== HOME PAGE ======================== */
  #home {
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 80px 24px 40px;
    text-align: center;
  }

  .greeting-eyebrow {
    font-size: 0.75rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--text-muted);
    margin-bottom: 16px;
  }
  .greeting-title {
    font-family: 'Lora', serif;
    font-size: clamp(2rem, 5vw, 3.2rem);
    font-weight: 400;
    line-height: 1.25;
    color: var(--text-primary);
    margin-bottom: 12px;
    max-width: 560px;
  }
  .greeting-title em {
    color: var(--accent);
    font-style: italic;
  }
  .greeting-sub {
    color: var(--text-secondary);
    font-size: 0.95rem;
    margin-bottom: 48px;
    max-width: 380px;
    line-height: 1.6;
  }

  .cta-btn {
    display: inline-flex; align-items: center; gap: 10px;
    background: var(--accent);
    color: #fff;
    border: none;
    border-radius: 12px;
    padding: 14px 28px;
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.25s;
    position: relative;
    overflow: hidden;
    box-shadow: 0 0 0 0 var(--accent-glow);
  }
  .cta-btn::before {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent);
    border-radius: inherit;
  }
  .cta-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px var(--accent-glow);
  }
  .cta-btn:active { transform: translateY(0); }

  /* stats strip */
  .stats-strip {
    display: flex; gap: 32px; margin-top: 64px;
    align-items: center; justify-content: center;
  }
  .stat-item { text-align: center; }
  .stat-val {
    font-family: 'Lora', serif;
    font-size: 1.5rem;
    color: var(--text-primary);
  }
  .stat-label {
    font-size: 0.72rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-top: 2px;
  }
  .stat-divider { width: 1px; height: 32px; background: var(--border); }

  /* mood quick */
  .mood-quick {
    margin-top: 40px;
    display: flex; flex-direction: column; align-items: center; gap: 12px;
  }
  .mood-quick-label { font-size: 0.78rem; color: var(--text-muted); }
  .mood-quick-row { display: flex; gap: 8px; }
  .mood-quick-item {
    width: 44px; height: 44px;
    display: flex; align-items: center; justify-content: center;
    border-radius: 12px;
    font-size: 1.3rem;
    cursor: pointer;
    background: var(--card);
    border: 1px solid var(--border);
    transition: all 0.2s;
  }
  .mood-quick-item:hover {
    border-color: var(--accent);
    box-shadow: 0 0 16px var(--accent-glow);
    transform: scale(1.1);
  }

  /* recent entry card */
  .recent-card {
    margin-top: 40px;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 20px 24px;
    max-width: 480px;
    width: 100%;
    text-align: left;
    cursor: pointer;
    transition: all 0.2s;
  }
  .recent-card:hover { border-color: var(--accent); }
  .recent-card-eyebrow {
    font-size: 0.7rem; letter-spacing: 0.1em;
    text-transform: uppercase; color: var(--text-muted);
    margin-bottom: 8px;
  }
  .recent-card-text {
    font-family: 'Lora', serif;
    font-size: 1rem; color: var(--text-secondary);
    line-height: 1.5;
    font-style: italic;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .recent-card-meta {
    margin-top: 12px; display: flex; align-items: center; gap: 8px;
    font-size: 0.75rem; color: var(--text-muted);
  }

  /* ======================== WRITE PAGE ======================== */
  #write {
    flex-direction: column;
    min-height: 100vh;
    padding: 72px 0 0;
    position: relative;
  }

  .write-container {
    flex: 1; display: flex; flex-direction: column;
    max-width: 720px; width: 100%;
    margin: 0 auto;
    padding: 40px 24px;
  }

  .write-title-input {
    background: transparent;
    border: none; outline: none;
    font-family: 'Lora', serif;
    font-size: 1.6rem;
    font-weight: 500;
    color: var(--text-primary);
    width: 100%;
    margin-bottom: 20px;
    caret-color: var(--accent);
  }
  .write-title-input::placeholder { color: var(--text-muted); }

  .divider-line {
    width: 100%; height: 1px;
    background: var(--border);
    margin-bottom: 24px;
  }

  .write-textarea {
    background: transparent;
    border: none; outline: none;
    font-family: 'Lora', serif;
    font-size: 1.05rem;
    line-height: 1.85;
    color: var(--text-secondary);
    width: 100%;
    resize: none;
    min-height: 300px;
    caret-color: var(--accent);
    flex: 1;
  }
  .write-textarea::placeholder { color: var(--text-muted); font-style: italic; }

  .floating-hint {
    position: fixed; bottom: 120px;
    left: 50%; transform: translateX(-50%);
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 8px 18px;
    font-size: 0.78rem;
    color: var(--text-muted);
    font-style: italic;
    opacity: 0;
    transition: opacity 0.5s;
    pointer-events: none;
    white-space: nowrap;
  }
  .floating-hint.show { opacity: 1; }

  /* mood bar */
  .mood-bar {
    display: flex; align-items: center; gap: 8px;
    padding: 16px 0;
    border-top: 1px solid var(--border);
  }
  .mood-bar-label { font-size: 0.75rem; color: var(--text-muted); margin-right: 4px; }

  .mood-emoji {
    width: 40px; height: 40px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.2rem; border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s;
    border: 1.5px solid transparent;
    background: var(--surface);
  }
  .mood-emoji:hover { transform: scale(1.15); border-color: var(--border); }
  .mood-emoji.selected {
    border-color: var(--accent);
    background: var(--accent-soft);
    box-shadow: 0 0 12px var(--accent-glow);
  }

  .submit-btn {
    margin-left: auto;
    display: flex; align-items: center; gap: 8px;
    background: var(--accent);
    color: #fff; border: none;
    border-radius: 10px;
    padding: 10px 20px;
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }
  .submit-btn:hover { opacity: 0.88; transform: translateY(-1px); }
  .submit-btn:active { transform: translateY(0); }

  /* char counter */
  .write-footer {
    display: flex; align-items: center; justify-content: space-between;
    padding: 8px 0;
  }
  .char-count { font-size: 0.72rem; color: var(--text-muted); }

  /* ======================== CHAT PAGE ======================== */
  #chat {
    flex-direction: column;
    min-height: 100vh;
    padding: 56px 0 0;
  }

  .chat-container {
    flex: 1; display: flex; flex-direction: column;
    max-width: 720px; width: 100%;
    margin: 0 auto;
    padding: 24px 24px 0;
    overflow-y: auto;
    height: calc(100vh - 56px - 80px);
  }

  .chat-date-divider {
    text-align: center;
    font-size: 0.72rem;
    color: var(--text-muted);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin: 16px 0 24px;
    position: relative;
  }
  .chat-date-divider::before, .chat-date-divider::after {
    content: ''; position: absolute; top: 50%;
    width: calc(50% - 60px);
    height: 1px; background: var(--border);
  }
  .chat-date-divider::before { left: 0; }
  .chat-date-divider::after { right: 0; }

  .msg { display: flex; gap: 12px; margin-bottom: 20px; animation: msgIn 0.35s ease; }
  @keyframes msgIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .msg-user { flex-direction: row-reverse; }

  .msg-avatar {
    width: 36px; height: 36px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.85rem; flex-shrink: 0;
    border: 1px solid var(--border);
  }
  .msg-avatar.user { background: var(--accent); color: #fff; font-size: 0.7rem; font-weight: 600; }
  .msg-avatar.ai { background: var(--card); }

  .msg-bubble {
    max-width: 78%;
    padding: 14px 18px;
    border-radius: 14px;
    font-size: 0.92rem;
    line-height: 1.65;
  }
  .msg-bubble.user {
    background: var(--accent);
    color: #fff;
    border-bottom-right-radius: 4px;
    font-family: 'Lora', serif;
  }
  .msg-bubble.ai {
    background: var(--card);
    border: 1px solid var(--border);
    color: var(--text-secondary);
    border-bottom-left-radius: 4px;
  }
  .msg-meta {
    font-size: 0.68rem; color: var(--text-muted);
    margin-top: 4px;
    display: flex; align-items: center; gap: 6px;
  }
  .msg-meta.user { justify-content: flex-end; }

  .typing-indicator {
    display: flex; gap: 12px; margin-bottom: 20px;
    animation: msgIn 0.3s ease;
  }
  .typing-dots {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 14px;
    border-bottom-left-radius: 4px;
    padding: 14px 18px;
    display: flex; align-items: center; gap: 5px;
  }
  .dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--text-muted);
    animation: dotBounce 1.2s ease infinite;
  }
  .dot:nth-child(2) { animation-delay: 0.2s; }
  .dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes dotBounce {
    0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
    30% { transform: translateY(-6px); opacity: 1; }
  }

  /* chat input */
  .chat-input-bar {
    position: fixed; bottom: 0; left: 0; right: 0;
    padding: 16px 24px;
    background: rgba(8,14,26,0.85);
    backdrop-filter: blur(20px);
    border-top: 1px solid var(--border);
    z-index: 40;
  }
  .chat-input-inner {
    max-width: 720px; margin: 0 auto;
    display: flex; align-items: flex-end; gap: 10px;
  }
  .chat-input-wrap {
    flex: 1;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 14px;
    display: flex; align-items: flex-end;
    padding: 10px 14px;
    gap: 8px;
    transition: border-color 0.2s;
  }
  .chat-input-wrap:focus-within { border-color: var(--accent); }
  .chat-input {
    flex: 1; background: transparent; border: none; outline: none;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.92rem; color: var(--text-primary);
    resize: none; max-height: 120px; line-height: 1.5;
    caret-color: var(--accent);
  }
  .chat-input::placeholder { color: var(--text-muted); }

  .send-btn {
    width: 40px; height: 40px;
    background: var(--accent);
    border: none; border-radius: 10px;
    color: #fff; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.2s; flex-shrink: 0;
  }
  .send-btn:hover { opacity: 0.85; transform: scale(1.05); }

  /* ======================== TIMELINE PAGE ======================== */
  #timeline {
    flex-direction: column;
    min-height: 100vh;
    padding: 72px 0 40px;
  }

  .timeline-container {
    max-width: 680px; width: 100%; margin: 0 auto;
    padding: 32px 24px;
  }

  .timeline-header {
    margin-bottom: 40px;
  }
  .timeline-title {
    font-family: 'Lora', serif;
    font-size: 1.8rem; font-weight: 400;
    color: var(--text-primary);
    margin-bottom: 6px;
  }
  .timeline-sub { font-size: 0.85rem; color: var(--text-muted); }

  /* emotion trail */
  .emotion-trail {
    display: flex; gap: 3px;
    margin-bottom: 40px;
    align-items: flex-end;
    height: 48px;
  }
  .trail-bar {
    flex: 1; border-radius: 3px;
    cursor: pointer;
    transition: opacity 0.2s;
    min-height: 8px;
  }
  .trail-bar:hover { opacity: 0.7; }

  .month-group { margin-bottom: 40px; }
  .month-label {
    font-size: 0.72rem; letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--text-muted);
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--border);
  }

  .entry-card {
    display: flex; gap: 16px; align-items: flex-start;
    padding: 16px 0;
    border-bottom: 1px solid rgba(99,102,241,0.06);
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
  }
  .entry-card:hover .entry-card-inner { transform: translateX(4px); }
  .entry-card:last-child { border-bottom: none; }

  .entry-date-col {
    width: 44px; flex-shrink: 0; text-align: center;
    padding-top: 2px;
  }
  .entry-day {
    font-family: 'Lora', serif;
    font-size: 1.4rem; font-weight: 500;
    color: var(--text-primary); line-height: 1;
  }
  .entry-weekday { font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }

  .entry-card-inner { flex: 1; transition: transform 0.2s; }

  .entry-mood-row { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
  .entry-mood { font-size: 1rem; }
  .entry-preview {
    font-family: 'Lora', serif;
    font-size: 0.92rem; color: var(--text-secondary);
    line-height: 1.5; font-style: italic;
    display: -webkit-box;
    -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  }
  .entry-tag {
    display: inline-block;
    font-size: 0.68rem; padding: 2px 8px;
    border-radius: 4px; background: var(--accent-soft);
    color: var(--accent); margin-left: 4px;
  }
  .entry-insight {
    margin-top: 8px;
    font-size: 0.78rem; color: var(--text-muted);
    display: flex; align-items: center; gap: 4px;
  }

  .entry-expand {
    max-height: 0; overflow: hidden;
    transition: max-height 0.35s ease;
  }
  .entry-expand.open { max-height: 300px; }
  .entry-expand-inner {
    margin-top: 12px; padding: 16px;
    background: var(--surface);
    border-radius: 10px;
    border: 1px solid var(--border);
    font-size: 0.88rem; line-height: 1.7;
    color: var(--text-secondary);
    font-family: 'Lora', serif; font-style: italic;
  }

  /* bottom nav */
  .bottom-nav {
    position: fixed; bottom: 0; left: 0; right: 0;
    height: 64px;
    background: rgba(8,14,26,0.85);
    backdrop-filter: blur(20px);
    border-top: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    gap: 8px;
    z-index: 40;
  }
  .bnav-item {
    display: flex; flex-direction: column; align-items: center;
    gap: 3px; padding: 8px 20px; border-radius: 12px;
    cursor: pointer; transition: all 0.2s; border: none; background: transparent;
    color: var(--text-muted);
  }
  .bnav-item:hover { color: var(--text-secondary); background: var(--accent-soft); }
  .bnav-item.active { color: var(--accent); }
  .bnav-label { font-size: 0.65rem; }

  /* transitions */
  .fade-enter { animation: fadeEnter 0.3s ease; }
  @keyframes fadeEnter {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>
</head>
<body>

<!-- Aurora background -->
<div class="aurora">
  <div class="aurora-blob"></div>
  <div class="aurora-blob"></div>
  <div class="aurora-blob"></div>
</div>

<!-- HEADER -->
<header class="header">
  <div class="logo">bisik<span>.</span></div>
  <div style="display:flex;align-items:center;gap:8px;position:relative;">
    <div class="persona-pill" id="personaBtn" onclick="togglePersona()">
      <span id="personaIcon">🫂</span>
      <span id="personaName">Teman</span>
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
    </div>
    <div class="persona-dropdown" id="personaDropdown">
      <div class="persona-item selected" onclick="setPersona('🫂','Teman')">🫂 Teman</div>
      <div class="persona-item" onclick="setPersona('🧠','Mentor')">🧠 Mentor</div>
      <div class="persona-item" onclick="setPersona('🪞','Reflector')">🪞 Reflector</div>
    </div>
    <button class="nav-btn" id="historyBtn" onclick="showPage('timeline')" title="Timeline">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2.5A6.5 6.5 0 1 0 9 15.5A6.5 6.5 0 0 0 9 2.5Z" stroke="currentColor" stroke-width="1.3"/><path d="M9 5.5V9L11.5 11.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
    </button>
  </div>
</header>

<!-- ===== HOME PAGE ===== -->
<div id="home" class="page active">
  <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;padding:80px 24px 120px;text-align:center;">
    <p class="greeting-eyebrow" id="timeGreeting">Selamat Malam</p>
    <h1 class="greeting-title">Apa yang ingin kamu <em>ceritakan</em> hari ini?</h1>
    <p class="greeting-sub">Tidak perlu sempurna. Tulis saja apa yang ada di pikiranmu — bisik mendengarkan.</p>
    <button class="cta-btn" onclick="showPage('write')">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 14l3-1L13 5l-2-2-8 8-1 3z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M11 3l2 2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
      Mulai Menulis
    </button>

    <div class="stats-strip">
      <div class="stat-item">
        <div class="stat-val">12</div>
        <div class="stat-label">Entri</div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <div class="stat-val">7</div>
        <div class="stat-label">Hari berturut</div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <div class="stat-val">😐</div>
        <div class="stat-label">Mood terkini</div>
      </div>
    </div>

    <div class="mood-quick">
      <p class="mood-quick-label">Bagaimana perasaanmu sekarang?</p>
      <div class="mood-quick-row">
        <div class="mood-quick-item" onclick="selectMoodAndGo('😊')">😊</div>
        <div class="mood-quick-item" onclick="selectMoodAndGo('😐')">😐</div>
        <div class="mood-quick-item" onclick="selectMoodAndGo('😢')">😢</div>
        <div class="mood-quick-item" onclick="selectMoodAndGo('😴')">😴</div>
        <div class="mood-quick-item" onclick="selectMoodAndGo('😤')">😤</div>
      </div>
    </div>

    <div class="recent-card" onclick="showPage('chat')">
      <div class="recent-card-eyebrow">✦ Insight terakhir</div>
      <p class="recent-card-text">Kamu cenderung merasa lebih tenang di malam hari. Pola ini muncul dalam 5 entri terakhirmu.</p>
      <div class="recent-card-meta">
        <span>🪞</span> 2 jam lalu · dari entri 31 Maret
      </div>
    </div>
  </div>
</div>

<!-- ===== WRITE PAGE ===== -->
<div id="write" class="page">
  <div class="write-container fade-enter">
    <input class="write-title-input" id="writeTitle" placeholder="Judul (opsional)..." maxlength="80">
    <div class="divider-line"></div>
    <textarea class="write-textarea" id="writeArea" placeholder="Tulis apa saja yang ingin kamu ceritakan…" rows="12" oninput="onWriteInput()" onkeydown="handleWriteKey(event)"></textarea>
    <div class="write-footer">
      <span class="char-count" id="charCount">0 karakter</span>
    </div>
    <div class="divider-line"></div>
    <div class="mood-bar">
      <span class="mood-bar-label">Mood:</span>
      <div class="mood-emoji" data-mood="😊" onclick="selectMood(this)">😊</div>
      <div class="mood-emoji" data-mood="😐" onclick="selectMood(this)">😐</div>
      <div class="mood-emoji" data-mood="😢" onclick="selectMood(this)">😢</div>
      <div class="mood-emoji" data-mood="😴" onclick="selectMood(this)">😴</div>
      <div class="mood-emoji" data-mood="😤" onclick="selectMood(this)">😤</div>
      <button class="submit-btn" onclick="submitEntry()">
        Kirim
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7H12M8 3l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
    </div>
  </div>
  <div class="floating-hint" id="floatingHint">Tidak perlu sempurna, tulis saja 🌙</div>
</div>

<!-- ===== CHAT PAGE ===== -->
<div id="chat" class="page" style="flex-direction:column;">
  <div class="chat-container" id="chatMessages">
    <div class="chat-date-divider">Hari ini · 1 April 2025</div>

    <!-- user entry -->
    <div class="msg msg-user">
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;">
        <div class="msg-bubble user" id="userEntry">Hari ini capek banget. Rapat dari pagi, tugasku numpuk, dan kayaknya nggak ada yang bisa aku kontrol.</div>
        <div class="msg-meta user">22.14 · 😐</div>
      </div>
      <div class="msg-avatar user">K</div>
    </div>

    <!-- ai response -->
    <div class="msg" id="aiMsg" style="display:none;">
      <div class="msg-avatar ai">🫂</div>
      <div style="display:flex;flex-direction:column;gap:4px;">
        <div class="msg-bubble ai" id="aiMsgText"></div>
        <div class="msg-meta">22.14 · bisik</div>
      </div>
    </div>

    <!-- typing -->
    <div class="typing-indicator" id="typingIndicator" style="display:none;">
      <div class="msg-avatar ai">🫂</div>
      <div class="typing-dots">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>
    </div>
  </div>

  <!-- input bar -->
  <div class="chat-input-bar">
    <div class="chat-input-inner">
      <div class="chat-input-wrap">
        <textarea class="chat-input" id="chatInput" placeholder="Ceritakan lebih lanjut…" rows="1" oninput="autoResize(this)" onkeydown="handleChatKey(event)"></textarea>
      </div>
      <button class="send-btn" onclick="sendChat()">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 8H14M10 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
    </div>
  </div>
</div>

<!-- ===== TIMELINE PAGE ===== -->
<div id="timeline" class="page" style="flex-direction:column;">
  <div class="timeline-container fade-enter">
    <div class="timeline-header">
      <h2 class="timeline-title">Jejak Ceritamu</h2>
      <p class="timeline-sub">Setiap entri adalah versi dirimu yang berbeda.</p>
    </div>

    <!-- emotion trail -->
    <div class="emotion-trail" id="emotionTrail"></div>

    <!-- entries -->
    <div class="month-group">
      <div class="month-label">April 2025</div>
      <div class="entry-card" onclick="toggleEntry(this)">
        <div class="entry-date-col">
          <div class="entry-day">01</div>
          <div class="entry-weekday">Sel</div>
        </div>
        <div class="entry-card-inner">
          <div class="entry-mood-row">
            <span class="entry-mood">😐</span>
            <span class="entry-tag">berat</span>
          </div>
          <p class="entry-preview">Hari ini capek banget. Rapat dari pagi, tugasku numpuk, dan kayaknya nggak ada yang bisa aku kontrol...</p>
          <div class="entry-insight">✦ <span>AI: Kamu menyebut "kontrol" 3x hari ini</span></div>
          <div class="entry-expand">
            <div class="entry-expand-inner">
              Hari ini capek banget. Rapat dari pagi, tugasku numpuk, dan kayaknya nggak ada yang bisa aku kontrol. Bahkan mau minum kopi aja harus nunggu meeting selesai dulu. Rasanya kayak hari yang panjang banget, dan aku nggak tau kapan ini akan berakhir.
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="month-group">
      <div class="month-label">Maret 2025</div>

      <div class="entry-card" onclick="toggleEntry(this)">
        <div class="entry-date-col">
          <div class="entry-day">31</div>
          <div class="entry-weekday">Sen</div>
        </div>
        <div class="entry-card-inner">
          <div class="entry-mood-row">
            <span class="entry-mood">😊</span>
            <span class="entry-tag">produktif</span>
          </div>
          <p class="entry-preview">Lumayan produktif hari ini. Berhasil menyelesaikan projek yang udah stuck berminggu-minggu...</p>
          <div class="entry-insight">✦ <span>AI: Ini harimu yang paling produktif bulan ini</span></div>
          <div class="entry-expand">
            <div class="entry-expand-inner">
              Lumayan produktif hari ini. Berhasil menyelesaikan projek yang udah stuck berminggu-minggu. Rasanya lega banget, kayak ada beban yang terangkat. Besok mau lanjut yang lain, semoga bisa konsisten.
            </div>
          </div>
        </div>
      </div>

      <div class="entry-card" onclick="toggleEntry(this)">
        <div class="entry-date-col">
          <div class="entry-day">28</div>
          <div class="entry-weekday">Jum</div>
        </div>
        <div class="entry-card-inner">
          <div class="entry-mood-row">
            <span class="entry-mood">😢</span>
          </div>
          <p class="entry-preview">Ada hal yang bikin aku sedih hari ini. Nggak bisa cerita banyak, tapi rasanya berat...</p>
          <div class="entry-insight">✦ <span>AI: Kamu butuh ruang, bukan solusi</span></div>
          <div class="entry-expand">
            <div class="entry-expand-inner">
              Ada hal yang bikin aku sedih hari ini. Nggak bisa cerita banyak, tapi rasanya berat. Semoga besok lebih baik.
            </div>
          </div>
        </div>
      </div>

      <div class="entry-card" onclick="toggleEntry(this)">
        <div class="entry-date-col">
          <div class="entry-day">25</div>
          <div class="entry-weekday">Sel</div>
        </div>
        <div class="entry-card-inner">
          <div class="entry-mood-row">
            <span class="entry-mood">😴</span>
          </div>
          <p class="entry-preview">Nggak bisa tidur semalam. Pikiran terlalu ramai, akhirnya nulis ini jam 2 pagi...</p>
          <div class="entry-insight">✦ <span>AI: Malam hari sering jadi waktumu bicara</span></div>
          <div class="entry-expand">
            <div class="entry-expand-inner">
              Nggak bisa tidur semalam. Pikiran terlalu ramai, akhirnya nulis ini jam 2 pagi. Kadang nulis ini lebih melegakan daripada coba tidur paksa.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- BOTTOM NAV (kecuali write & chat, mereka punya sendiri) -->
<nav class="bottom-nav" id="bottomNav">
  <button class="bnav-item active" id="bnav-home" onclick="showPage('home')">
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 9.5L10 3l7 6.5V17a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" stroke="currentColor" stroke-width="1.3"/><path d="M7 18v-6h6v6" stroke="currentColor" stroke-width="1.3"/></svg>
    <span class="bnav-label">Beranda</span>
  </button>
  <button class="bnav-item" id="bnav-write" onclick="showPage('write')">
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 16l3-1 8-8-2-2-8 8-1 3z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M13 5l2 2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
    <span class="bnav-label">Tulis</span>
  </button>
  <button class="bnav-item" id="bnav-chat" onclick="showPage('chat')">
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 4h12a1 1 0 011 1v8a1 1 0 01-1 1H7l-4 3V5a1 1 0 011-1z" stroke="currentColor" stroke-width="1.3"/></svg>
    <span class="bnav-label">Chat</span>
  </button>
  <button class="bnav-item" id="bnav-timeline" onclick="showPage('timeline')">
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 6h12M4 10h8M4 14h6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
    <span class="bnav-label">Jejak</span>
  </button>
</nav>

<script>
// ---- state ----
let currentPage = 'home';
let selectedMood = null;
let typingTimer = null;
let hintShown = false;
let msgCount = 0;

// ---- page nav ----
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => {
    p.classList.remove('active');
    p.style.display = 'none';
  });
  const page = document.getElementById(id);
  page.classList.add('active');
  page.style.display = 'flex';
  currentPage = id;

  // update bottom nav
  document.querySelectorAll('.bnav-item').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById('bnav-' + id);
  if (btn) btn.classList.add('active');

  // hide bottom nav on chat (has its own bar)
  document.getElementById('bottomNav').style.display =
    (id === 'chat') ? 'none' : 'flex';

  // close persona dropdown
  document.getElementById('personaDropdown').classList.remove('open');

  // chat: start auto-typing
  if (id === 'chat' && !document.getElementById('aiMsg').style.display.includes('flex')) {
    triggerAIResponse("Sepertinya hari ini cukup berat ya... Mau cerita lebih? Aku di sini.");
  }

  // timeline: build trail
  if (id === 'timeline') buildTrail();
}

// initial state
document.getElementById('home').style.display = 'flex';
document.getElementById('write').style.display = 'none';
document.getElementById('chat').style.display = 'none';
document.getElementById('timeline').style.display = 'none';

// ---- greeting ----
function setGreeting() {
  const h = new Date().getHours();
  const el = document.getElementById('timeGreeting');
  if (h < 5) el.textContent = 'Malam yang sunyi';
  else if (h < 11) el.textContent = 'Selamat Pagi';
  else if (h < 15) el.textContent = 'Selamat Siang';
  else if (h < 18) el.textContent = 'Selamat Sore';
  else el.textContent = 'Selamat Malam';
}
setGreeting();

// ---- persona ----
function togglePersona() {
  document.getElementById('personaDropdown').classList.toggle('open');
}
function setPersona(icon, name) {
  document.getElementById('personaIcon').textContent = icon;
  document.getElementById('personaName').textContent = name;
  document.querySelectorAll('.persona-item').forEach(el => {
    el.classList.toggle('selected', el.textContent.trim().startsWith(icon));
  });
  document.getElementById('personaDropdown').classList.remove('open');
}
document.addEventListener('click', e => {
  if (!document.getElementById('personaBtn').contains(e.target)) {
    document.getElementById('personaDropdown').classList.remove('open');
  }
});

// ---- mood ----
function selectMood(el) {
  document.querySelectorAll('.mood-emoji').forEach(e => e.classList.remove('selected'));
  el.classList.add('selected');
  selectedMood = el.dataset.mood;
}
function selectMoodAndGo(mood) {
  selectedMood = mood;
  showPage('write');
  // auto-select
  setTimeout(() => {
    document.querySelectorAll('.mood-emoji').forEach(e => {
      if (e.dataset.mood === mood) e.classList.add('selected');
    });
  }, 100);
}

// ---- write ----
function onWriteInput() {
  const txt = document.getElementById('writeArea').value;
  document.getElementById('charCount').textContent = txt.length + ' karakter';

  if (txt.length > 80 && !hintShown) {
    hintShown = true;
    const hint = document.getElementById('floatingHint');
    hint.classList.add('show');
    setTimeout(() => hint.classList.remove('show'), 4000);
  }
}
function handleWriteKey(e) {
  if (e.key === 'Enter' && e.ctrlKey) submitEntry();
}
function submitEntry() {
  const txt = document.getElementById('writeArea').value.trim();
  const title = document.getElementById('writeTitle').value.trim();
  if (!txt) return;

  // put text in chat
  const entryEl = document.getElementById('userEntry');
  entryEl.textContent = txt || 'Hari ini capek banget...';

  // reset
  document.getElementById('writeArea').value = '';
  document.getElementById('writeTitle').value = '';
  document.getElementById('charCount').textContent = '0 karakter';
  document.querySelectorAll('.mood-emoji').forEach(e => e.classList.remove('selected'));
  hintShown = false;

  showPage('chat');
  document.getElementById('aiMsg').style.display = 'none';
  triggerAIResponse(getAIReply());
}

// ---- chat ----
const aiReplies = [
  "Sepertinya hari ini cukup berat ya... Mau cerita lebih? Aku di sini.",
  "Wajar kalau kamu merasa seperti itu. Kamu tidak sendirian.",
  "Aku dengar kamu. Istirahat sejenak itu boleh, lho.",
  "Terima kasih sudah mau bercerita. Perasaanmu valid.",
  "Kamu sudah melakukan banyak hal hari ini. Beri dirimu credit untuk itu.",
];
let aiReplyIdx = 0;
function getAIReply() { return aiReplies[aiReplyIdx++ % aiReplies.length]; }

function triggerAIResponse(text) {
  const typing = document.getElementById('typingIndicator');
  typing.style.display = 'flex';
  scrollChat();

  setTimeout(() => {
    typing.style.display = 'none';
    const aiMsg = document.getElementById('aiMsg');
    document.getElementById('aiMsgText').textContent = text;
    aiMsg.style.display = 'flex';
    scrollChat();
  }, 1800);
}

function sendChat() {
  const input = document.getElementById('chatInput');
  const txt = input.value.trim();
  if (!txt) return;

  // add user msg
  const container = document.getElementById('chatMessages');
  const msgDiv = document.createElement('div');
  msgDiv.className = 'msg msg-user';
  msgDiv.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;">
      <div class="msg-bubble user">${escHtml(txt)}</div>
      <div class="msg-meta user">${getTime()}</div>
    </div>
    <div class="msg-avatar user">K</div>`;
  container.insertBefore(msgDiv, document.getElementById('typingIndicator'));

  input.value = '';
  input.style.height = 'auto';

  // show typing then reply
  const typing = document.getElementById('typingIndicator');
  typing.style.display = 'flex';
  scrollChat();

  setTimeout(() => {
    typing.style.display = 'none';
    const reply = document.createElement('div');
    reply.className = 'msg';
    reply.innerHTML = `
      <div class="msg-avatar ai">${document.getElementById('personaIcon').textContent}</div>
      <div style="display:flex;flex-direction:column;gap:4px;">
        <div class="msg-bubble ai">${getAIReply()}</div>
        <div class="msg-meta">${getTime()} · bisik</div>
      </div>`;
    container.insertBefore(reply, typing);
    scrollChat();
  }, 1600 + Math.random() * 800);
}

function handleChatKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(); }
}
function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}
function scrollChat() {
  const c = document.getElementById('chatMessages');
  c.scrollTop = c.scrollHeight;
}
function getTime() {
  return new Date().toLocaleTimeString('id-ID', {hour:'2-digit',minute:'2-digit'});
}
function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ---- timeline ----
const trailData = [
  {h:20,c:'#6366f1'},{h:60,c:'#4ade80'},{h:30,c:'#6366f1'},
  {h:80,c:'#4ade80'},{h:25,c:'#f87171'},{h:45,c:'#6366f1'},
  {h:70,c:'#4ade80'},{h:15,c:'#f87171'},{h:55,c:'#6366f1'},
  {h:85,c:'#4ade80'},{h:40,c:'#facc15'},{h:20,c:'#f87171'},
  {h:65,c:'#4ade80'},{h:30,c:'#6366f1'}
];

function buildTrail() {
  const trail = document.getElementById('emotionTrail');
  if (trail.childElementCount > 0) return;
  trailData.forEach(d => {
    const bar = document.createElement('div');
    bar.className = 'trail-bar';
    bar.style.background = d.c;
    bar.style.height = d.h + '%';
    bar.style.opacity = '0.6';
    trail.appendChild(bar);
  });
}

function toggleEntry(card) {
  const expand = card.querySelector('.entry-expand');
  expand.classList.toggle('open');
}
</script>
</body>
</html>