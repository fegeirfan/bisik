<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Bisik — Admin Panel</title>
<script src="https://cdn.tailwindcss.com"></script>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700&family=JetBrains+Mono:wght@300;400;500&display=swap" rel="stylesheet">
<style>
  :root {
    --bg:        #060910;
    --surface:   #0b0f1a;
    --card:      #0f1524;
    --card2:     #131929;
    --border:    rgba(56,189,248,0.1);
    --border2:   rgba(56,189,248,0.18);
    --accent:    #38bdf8;
    --accent2:   #0ea5e9;
    --accent-g:  rgba(56,189,248,0.15);
    --accent-glow: rgba(56,189,248,0.3);
    --danger:    #f43f5e;
    --danger-g:  rgba(244,63,94,0.12);
    --success:   #34d399;
    --success-g: rgba(52,211,153,0.12);
    --warn:      #fbbf24;
    --warn-g:    rgba(251,191,36,0.12);
    --purple:    #a78bfa;
    --t1: #e2e8f0;
    --t2: #94a3b8;
    --t3: #475569;
    --t4: #1e293b;
    --mono: 'JetBrains Mono', monospace;
    --sans: 'Syne', sans-serif;
    --sidebar: 220px;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { height: 100%; }

  body {
    background: var(--bg);
    color: var(--t1);
    font-family: var(--sans);
    display: flex;
    overflow: hidden;
  }

  /* scrollbar */
  ::-webkit-scrollbar { width: 3px; height: 3px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--t3); border-radius: 2px; }

  /* ====== GRID TEXTURE ====== */
  body::before {
    content: '';
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
    background-image:
      linear-gradient(rgba(56,189,248,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(56,189,248,0.025) 1px, transparent 1px);
    background-size: 40px 40px;
  }

  /* glow blob */
  .glow-blob {
    position: fixed; pointer-events: none; z-index: 0;
    border-radius: 50%; filter: blur(100px); opacity: 0.06;
  }

  /* ====== SIDEBAR ====== */
  .sidebar {
    width: var(--sidebar); height: 100vh;
    background: var(--surface);
    border-right: 1px solid var(--border);
    display: flex; flex-direction: column;
    position: fixed; left: 0; top: 0; z-index: 50;
    flex-shrink: 0;
  }

  .sidebar-logo {
    padding: 24px 20px 20px;
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; gap: 10px;
  }
  .logo-mark {
    width: 32px; height: 32px;
    background: var(--accent);
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    color: var(--bg);
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: -0.03em;
    box-shadow: 0 0 20px var(--accent-glow);
    flex-shrink: 0;
  }
  .logo-text {
    font-size: 1rem; font-weight: 600;
    color: var(--t1); letter-spacing: -0.01em;
  }
  .logo-badge {
    font-size: 0.6rem; color: var(--accent);
    font-family: var(--mono);
    background: var(--accent-g);
    border: 1px solid var(--border2);
    border-radius: 4px; padding: 1px 6px;
  }

  .sidebar-nav { flex: 1; padding: 16px 12px; overflow-y: auto; }

  .nav-section-label {
    font-size: 0.62rem; letter-spacing: 0.12em;
    text-transform: uppercase; color: var(--t3);
    padding: 0 8px; margin: 16px 0 6px;
  }
  .nav-section-label:first-child { margin-top: 0; }

  .nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 10px; border-radius: 8px;
    cursor: pointer; transition: all 0.18s;
    color: var(--t2); font-size: 0.85rem; font-weight: 500;
    border: 1px solid transparent;
    margin-bottom: 2px; user-select: none;
    position: relative;
  }
  .nav-item:hover { color: var(--t1); background: var(--card); }
  .nav-item.active {
    color: var(--accent); background: var(--accent-g);
    border-color: var(--border2);
  }
  .nav-item.active .nav-icon { color: var(--accent); }
  .nav-icon { width: 16px; flex-shrink: 0; opacity: 0.7; }
  .nav-item.active .nav-icon { opacity: 1; }
  .nav-badge {
    margin-left: auto; font-family: var(--mono);
    font-size: 0.65rem; padding: 1px 6px;
    border-radius: 4px;
    background: var(--danger-g); color: var(--danger);
    border: 1px solid rgba(244,63,94,0.2);
  }
  .nav-badge.green { background: var(--success-g); color: var(--success); border-color: rgba(52,211,153,0.2); }

  .sidebar-footer {
    padding: 16px 12px;
    border-top: 1px solid var(--border);
  }
  .admin-profile {
    display: flex; align-items: center; gap: 10px;
    padding: 8px 10px; border-radius: 8px;
    cursor: pointer; transition: background 0.15s;
  }
  .admin-profile:hover { background: var(--card); }
  .admin-avatar {
    width: 30px; height: 30px; border-radius: 8px;
    background: linear-gradient(135deg, var(--accent), var(--purple));
    display: flex; align-items: center; justify-content: center;
    font-size: 0.72rem; font-weight: 700; color: #fff; flex-shrink: 0;
  }
  .admin-name { font-size: 0.8rem; font-weight: 600; color: var(--t1); }
  .admin-role { font-size: 0.68rem; color: var(--t3); font-family: var(--mono); }

  /* ====== MAIN ====== */
  .main {
    margin-left: var(--sidebar);
    flex: 1; height: 100vh;
    overflow-y: auto;
    position: relative; z-index: 1;
  }

  /* topbar */
  .topbar {
    position: sticky; top: 0; z-index: 30;
    background: rgba(6,9,16,0.8);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--border);
    padding: 0 28px;
    height: 56px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .topbar-title {
    font-size: 0.95rem; font-weight: 600; color: var(--t1);
    display: flex; align-items: center; gap: 10px;
  }
  .topbar-crumb { color: var(--t3); font-size: 0.8rem; font-family: var(--mono); }
  .topbar-right { display: flex; align-items: center; gap: 10px; }

  .topbar-btn {
    height: 32px; border-radius: 7px;
    border: 1px solid var(--border); background: var(--card);
    color: var(--t2); font-family: var(--sans);
    font-size: 0.78rem; cursor: pointer; transition: all 0.15s;
    padding: 0 12px; display: flex; align-items: center; gap: 6px;
  }
  .topbar-btn:hover { border-color: var(--accent); color: var(--accent); }
  .topbar-btn.primary {
    background: var(--accent); border-color: var(--accent);
    color: var(--bg); font-weight: 600;
  }
  .topbar-btn.primary:hover { opacity: 0.85; }

  .status-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: var(--success);
    box-shadow: 0 0 8px var(--success);
    animation: pulse 2s ease-in-out infinite;
  }
  @keyframes pulse {
    0%,100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  /* ====== CONTENT PAGES ====== */
  .page { display: none; padding: 28px; animation: pageIn 0.25s ease; }
  .page.active { display: block; }
  @keyframes pageIn {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* ====== CARDS ====== */
  .card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px; padding: 20px;
  }
  .card-sm { padding: 16px; }

  /* stat cards */
  .stat-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; margin-bottom: 24px; }
  .stat-card {
    background: var(--card); border: 1px solid var(--border);
    border-radius: 12px; padding: 18px 20px;
    position: relative; overflow: hidden;
    transition: border-color 0.2s, transform 0.2s;
    cursor: default;
  }
  .stat-card:hover { border-color: var(--border2); transform: translateY(-2px); }
  .stat-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
  }
  .stat-card.blue::before { background: linear-gradient(90deg, var(--accent), transparent); }
  .stat-card.green::before { background: linear-gradient(90deg, var(--success), transparent); }
  .stat-card.purple::before { background: linear-gradient(90deg, var(--purple), transparent); }
  .stat-card.red::before { background: linear-gradient(90deg, var(--danger), transparent); }

  .stat-label { font-size: 0.7rem; color: var(--t3); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 10px; }
  .stat-value { font-size: 2rem; font-weight: 700; color: var(--t1); line-height: 1; margin-bottom: 6px; font-family: var(--mono); }
  .stat-delta {
    font-size: 0.72rem; font-family: var(--mono);
    display: flex; align-items: center; gap: 4px;
  }
  .stat-delta.up { color: var(--success); }
  .stat-delta.down { color: var(--danger); }
  .stat-icon {
    position: absolute; right: 16px; top: 16px;
    font-size: 1.4rem; opacity: 0.12;
  }

  /* ====== SECTION HEADER ====== */
  .sec-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 16px;
  }
  .sec-title { font-size: 0.88rem; font-weight: 600; color: var(--t1); }
  .sec-sub { font-size: 0.72rem; color: var(--t3); margin-top: 2px; font-family: var(--mono); }

  /* ====== TABLE ====== */
  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; }
  th {
    font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.08em;
    color: var(--t3); text-align: left; padding: 10px 14px;
    border-bottom: 1px solid var(--border); font-weight: 500; font-family: var(--mono);
    white-space: nowrap;
  }
  td {
    padding: 12px 14px; font-size: 0.82rem; color: var(--t2);
    border-bottom: 1px solid rgba(56,189,248,0.05);
    transition: background 0.15s;
  }
  tr:hover td { background: var(--card2); }
  tr:last-child td { border-bottom: none; }
  td .user-cell { display: flex; align-items: center; gap: 10px; }
  td .u-avatar {
    width: 28px; height: 28px; border-radius: 7px;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.68rem; font-weight: 700; flex-shrink: 0;
  }
  td .u-name { font-weight: 600; color: var(--t1); font-size: 0.83rem; }
  td .u-email { font-size: 0.7rem; color: var(--t3); font-family: var(--mono); }

  /* badge */
  .badge {
    display: inline-block; font-size: 0.66rem; font-family: var(--mono);
    padding: 2px 8px; border-radius: 4px; font-weight: 500;
  }
  .badge-green { background: var(--success-g); color: var(--success); border: 1px solid rgba(52,211,153,0.2); }
  .badge-red { background: var(--danger-g); color: var(--danger); border: 1px solid rgba(244,63,94,0.2); }
  .badge-blue { background: var(--accent-g); color: var(--accent); border: 1px solid var(--border2); }
  .badge-warn { background: var(--warn-g); color: var(--warn); border: 1px solid rgba(251,191,36,0.2); }
  .badge-purple { background: rgba(167,139,250,0.1); color: var(--purple); border: 1px solid rgba(167,139,250,0.2); }

  /* action btn */
  .action-btn {
    height: 26px; padding: 0 10px; border-radius: 6px; font-size: 0.72rem;
    border: 1px solid var(--border); background: transparent;
    color: var(--t2); cursor: pointer; transition: all 0.15s; font-family: var(--sans);
    white-space: nowrap;
  }
  .action-btn:hover { border-color: var(--accent); color: var(--accent); }
  .action-btn.danger:hover { border-color: var(--danger); color: var(--danger); }

  /* ====== SEARCH BAR ====== */
  .search-bar {
    display: flex; align-items: center; gap: 8px;
    background: var(--card); border: 1px solid var(--border);
    border-radius: 8px; padding: 7px 12px;
    transition: border-color 0.2s;
  }
  .search-bar:focus-within { border-color: var(--accent); }
  .search-bar input {
    background: transparent; border: none; outline: none;
    color: var(--t1); font-family: var(--mono); font-size: 0.8rem;
    width: 220px;
  }
  .search-bar input::placeholder { color: var(--t3); }
  .search-bar svg { color: var(--t3); flex-shrink: 0; }

  /* ====== TWO COL ====== */
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .three-col { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; }

  /* ====== ACTIVITY LIST ====== */
  .activity-item {
    display: flex; gap: 12px; align-items: flex-start;
    padding: 10px 0; border-bottom: 1px solid rgba(56,189,248,0.05);
  }
  .activity-item:last-child { border-bottom: none; }
  .activity-dot {
    width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 5px;
  }
  .activity-msg { font-size: 0.8rem; color: var(--t2); line-height: 1.4; }
  .activity-msg strong { color: var(--t1); font-weight: 600; }
  .activity-time { font-size: 0.68rem; color: var(--t3); font-family: var(--mono); margin-top: 2px; }

  /* ====== MOOD CHART (CSS only bar) ====== */
  .mood-chart { display: flex; align-items: flex-end; gap: 6px; height: 80px; padding: 0 4px; }
  .mood-bar {
    flex: 1; border-radius: 4px 4px 0 0;
    background: var(--accent); opacity: 0.6;
    transition: opacity 0.2s; cursor: pointer; position: relative;
  }
  .mood-bar:hover { opacity: 1; }
  .mood-bar.sad { background: var(--danger); }
  .mood-bar.meh { background: var(--warn); }
  .mood-bar.good { background: var(--success); }
  .mood-bar.tired { background: var(--purple); }
  .mood-labels { display: flex; gap: 6px; padding: 4px 4px 0; }
  .mood-lbl { flex: 1; text-align: center; font-size: 0.6rem; color: var(--t3); font-family: var(--mono); }

  /* ====== PERSONA CARDS ====== */
  .persona-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; }
  .persona-card {
    background: var(--card); border: 1px solid var(--border);
    border-radius: 12px; padding: 20px;
    transition: border-color 0.2s, transform 0.2s;
    cursor: default; position: relative;
  }
  .persona-card:hover { border-color: var(--border2); transform: translateY(-2px); }
  .persona-card.disabled { opacity: 0.45; }
  .persona-card.active-persona { border-color: var(--accent); }

  .p-icon { font-size: 2rem; margin-bottom: 12px; display: block; }
  .p-name { font-size: 1rem; font-weight: 700; color: var(--t1); margin-bottom: 4px; }
  .p-desc { font-size: 0.78rem; color: var(--t3); line-height: 1.5; margin-bottom: 14px; }
  .p-tags { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 16px; }
  .p-tag {
    font-size: 0.62rem; font-family: var(--mono);
    padding: 2px 7px; border-radius: 4px;
    background: var(--card2); border: 1px solid var(--border); color: var(--t3);
  }
  .p-actions { display: flex; gap: 6px; }
  .p-status {
    position: absolute; top: 16px; right: 16px;
  }
  .p-users { font-size: 0.7rem; color: var(--t3); font-family: var(--mono); margin-bottom: 14px; }

  /* ====== AI CONFIG ====== */
  .config-group { margin-bottom: 24px; }
  .config-label {
    font-size: 0.72rem; color: var(--t3); text-transform: uppercase;
    letter-spacing: 0.08em; margin-bottom: 6px; font-family: var(--mono);
    display: flex; align-items: center; justify-content: space-between;
  }
  .config-input {
    width: 100%; background: var(--card2); border: 1px solid var(--border);
    border-radius: 8px; padding: 10px 12px;
    color: var(--t1); font-family: var(--mono); font-size: 0.82rem;
    outline: none; transition: border-color 0.2s;
    resize: none;
  }
  .config-input:focus { border-color: var(--accent); }
  .config-input::placeholder { color: var(--t3); }

  .range-wrap { display: flex; align-items: center; gap: 12px; }
  input[type=range] {
    flex: 1; appearance: none; height: 4px;
    background: var(--card2); border-radius: 2px; outline: none;
    border: 1px solid var(--border);
  }
  input[type=range]::-webkit-slider-thumb {
    appearance: none; width: 14px; height: 14px;
    border-radius: 50%; background: var(--accent);
    cursor: pointer; box-shadow: 0 0 8px var(--accent-glow);
  }
  .range-val {
    font-family: var(--mono); font-size: 0.8rem; color: var(--accent);
    min-width: 32px; text-align: right;
  }

  .toggle-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 14px; background: var(--card2); border-radius: 8px;
    border: 1px solid var(--border); margin-bottom: 8px;
  }
  .toggle-info .t-title { font-size: 0.83rem; color: var(--t1); font-weight: 500; }
  .toggle-info .t-desc { font-size: 0.72rem; color: var(--t3); margin-top: 2px; }
  .toggle {
    width: 36px; height: 20px; border-radius: 10px;
    background: var(--card); border: 1px solid var(--border);
    cursor: pointer; position: relative; transition: background 0.2s;
    flex-shrink: 0;
  }
  .toggle.on { background: var(--accent); border-color: var(--accent); }
  .toggle::after {
    content: ''; position: absolute; top: 2px; left: 2px;
    width: 14px; height: 14px; border-radius: 50%; background: var(--t3);
    transition: transform 0.2s, background 0.2s;
  }
  .toggle.on::after { transform: translateX(16px); background: var(--bg); }

  /* prompt tester */
  .prompt-tester {
    background: var(--card2); border: 1px solid var(--border);
    border-radius: 10px; overflow: hidden;
  }
  .pt-header {
    padding: 10px 14px; border-bottom: 1px solid var(--border);
    font-size: 0.72rem; color: var(--t3); font-family: var(--mono);
    display: flex; align-items: center; justify-content: space-between;
  }
  .pt-body { padding: 14px; }
  .pt-input {
    width: 100%; background: transparent; border: none; outline: none;
    color: var(--t1); font-family: var(--mono); font-size: 0.8rem;
    resize: none; line-height: 1.6;
  }
  .pt-output {
    margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--border);
    font-size: 0.8rem; color: var(--t2); font-family: var(--mono);
    line-height: 1.6; display: none;
  }
  .pt-output.show { display: block; }

  /* ====== MODAL ====== */
  .modal-overlay {
    display: none; position: fixed; inset: 0; z-index: 200;
    background: rgba(0,0,0,0.7); backdrop-filter: blur(4px);
    align-items: center; justify-content: center;
  }
  .modal-overlay.open { display: flex; }
  .modal {
    background: var(--card); border: 1px solid var(--border);
    border-radius: 16px; padding: 28px; width: 480px; max-width: 90vw;
    animation: modalIn 0.25s ease;
    box-shadow: 0 40px 80px rgba(0,0,0,0.5);
  }
  @keyframes modalIn {
    from { opacity: 0; transform: scale(0.96) translateY(10px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }
  .modal-title { font-size: 1.05rem; font-weight: 700; color: var(--t1); margin-bottom: 6px; }
  .modal-sub { font-size: 0.8rem; color: var(--t3); margin-bottom: 20px; }
  .modal-footer { display: flex; gap: 8px; justify-content: flex-end; margin-top: 24px; }

  /* ====== TOAST ====== */
  .toast-container {
    position: fixed; top: 16px; right: 16px; z-index: 999;
    display: flex; flex-direction: column; gap: 8px; pointer-events: none;
  }
  .toast {
    background: var(--card); border: 1px solid var(--border2);
    border-radius: 10px; padding: 12px 16px;
    font-size: 0.8rem; color: var(--t1);
    display: flex; align-items: center; gap: 10px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.4);
    animation: toastIn 0.25s ease;
    pointer-events: all;
  }
  @keyframes toastIn {
    from { opacity: 0; transform: translateX(20px); }
    to { opacity: 1; transform: translateX(0); }
  }
  .toast-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

  /* misc */
  .divider { height: 1px; background: var(--border); margin: 20px 0; }
  .empty-state {
    text-align: center; padding: 48px;
    color: var(--t3); font-size: 0.82rem;
  }
  .empty-state .e-icon { font-size: 2rem; margin-bottom: 12px; opacity: 0.4; }

  /* mini chart inline */
  .sparkline {
    display: flex; align-items: flex-end; gap: 2px; height: 24px;
  }
  .spark-bar {
    width: 4px; border-radius: 2px 2px 0 0;
    background: var(--accent); opacity: 0.5;
    transition: opacity 0.2s;
  }
  .spark-bar:hover { opacity: 1; }

  @media (max-width: 768px) {
    .stat-grid { grid-template-columns: 1fr 1fr; }
    .persona-grid { grid-template-columns: 1fr; }
    .two-col, .three-col { grid-template-columns: 1fr; }
  }
</style>
</head>
<body>

<!-- Glow blobs -->
<div class="glow-blob" style="width:500px;height:500px;background:radial-gradient(#38bdf8,transparent);top:-200px;left:100px;"></div>
<div class="glow-blob" style="width:400px;height:400px;background:radial-gradient(#a78bfa,transparent);bottom:-100px;right:0;opacity:0.04;"></div>

<!-- Toast container -->
<div class="toast-container" id="toastContainer"></div>

<!-- Modal -->
<div class="modal-overlay" id="modalOverlay" onclick="if(event.target===this) closeModal()">
  <div class="modal" id="modalContent"></div>
</div>

<!-- ====== SIDEBAR ====== -->
<aside class="sidebar">
  <div class="sidebar-logo">
    <div class="logo-mark">B</div>
    <div>
      <div class="logo-text">bisik</div>
    </div>
    <div class="logo-badge">ADMIN</div>
  </div>

  <nav class="sidebar-nav">
    <div class="nav-section-label">Overview</div>
    <div class="nav-item active" onclick="navTo('dashboard', this)">
      <svg class="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="1" y="1" width="6" height="6" rx="1.5"/><rect x="9" y="1" width="6" height="6" rx="1.5"/><rect x="1" y="9" width="6" height="6" rx="1.5"/><rect x="9" y="9" width="6" height="6" rx="1.5"/></svg>
      Dashboard
    </div>

    <div class="nav-section-label">Manajemen</div>
    <div class="nav-item" onclick="navTo('users', this)">
      <svg class="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="6" cy="4.5" r="2.5"/><path d="M1 13c0-2.8 2.2-5 5-5s5 2.2 5 5"/><circle cx="12" cy="5" r="2"/><path d="M12 9a4 4 0 0 1 3 4"/></svg>
      Users
      <span class="nav-badge">3</span>
    </div>
    <div class="nav-item" onclick="navTo('entries', this)">
      <svg class="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3 2h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z"/><path d="M5 5h6M5 8h4M5 11h3"/></svg>
      Diary Entries
    </div>
    <div class="nav-item" onclick="navTo('personas', this)">
      <svg class="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="8" cy="5" r="3"/><path d="M2 14c0-2 2-4 6-4s6 2 6 4"/><path d="M11 3l1 1-4 4-2-2 1-1 1 1z" fill="currentColor" stroke="none"/></svg>
      Personas
      <span class="nav-badge green">4</span>
    </div>

    <div class="nav-section-label">Konfigurasi</div>
    <div class="nav-item" onclick="navTo('ai-config', this)">
      <svg class="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M8 1l1.5 3 3.5.5-2.5 2.5.6 3.5L8 9l-3.1 1.5.6-3.5L3 4.5 6.5 4z"/><circle cx="8" cy="8" r="2.5"/></svg>
      AI Config
    </div>
    <div class="nav-item" onclick="navTo('settings', this)">
      <svg class="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="8" cy="8" r="2"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41"/></svg>
      Settings
    </div>
  </nav>

  <div class="sidebar-footer">
    <div class="admin-profile">
      <div class="admin-avatar">AD</div>
      <div>
        <div class="admin-name">Admin</div>
        <div class="admin-role">super_admin</div>
      </div>
      <svg style="margin-left:auto;color:var(--t3)" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M2 5l5 4 5-4"/></svg>
    </div>
  </div>
</aside>

<!-- ====== MAIN ====== -->
<main class="main">

  <!-- Topbar -->
  <div class="topbar">
    <div class="topbar-title">
      <div class="status-dot"></div>
      <span id="pageTitle">Dashboard</span>
      <span class="topbar-crumb" id="pageCrumb">/ overview</span>
    </div>
    <div class="topbar-right">
      <button class="topbar-btn" onclick="showToast('Sistem dalam kondisi normal ✓', 'green')">
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="6.5" cy="6.5" r="5.5"/><path d="M4 6.5l2 2 3-3"/></svg>
        System Health
      </button>
      <button class="topbar-btn primary" onclick="showToast('Laporan dikirim ke email', 'blue')">Export</button>
    </div>
  </div>

  <!-- ====== DASHBOARD ====== -->
  <div class="page active" id="page-dashboard">
    <!-- stat cards -->
    <div class="stat-grid">
      <div class="stat-card blue">
        <div class="stat-icon">👤</div>
        <div class="stat-label">Total Users</div>
        <div class="stat-value" id="cnt-users">847</div>
        <div class="stat-delta up">▲ 12 hari ini</div>
      </div>
      <div class="stat-card green">
        <div class="stat-icon">📖</div>
        <div class="stat-label">Total Entri</div>
        <div class="stat-value">4.2K</div>
        <div class="stat-delta up">▲ 89 hari ini</div>
      </div>
      <div class="stat-card purple">
        <div class="stat-icon">🎭</div>
        <div class="stat-label">Persona Aktif</div>
        <div class="stat-value">3</div>
        <div class="stat-delta" style="color:var(--t3)">dari 4 total</div>
      </div>
      <div class="stat-card red">
        <div class="stat-icon">⚠️</div>
        <div class="stat-label">Perlu Perhatian</div>
        <div class="stat-value">3</div>
        <div class="stat-delta down">user terblokir</div>
      </div>
    </div>

    <div class="two-col">
      <!-- activity -->
      <div class="card">
        <div class="sec-header">
          <div>
            <div class="sec-title">Aktivitas Terkini</div>
            <div class="sec-sub">real-time · 30 menit terakhir</div>
          </div>
        </div>
        <div class="activity-item">
          <div class="activity-dot" style="background:var(--success)"></div>
          <div>
            <div class="activity-msg"><strong>rani@gmail.com</strong> mendaftar akun baru</div>
            <div class="activity-time">2 menit lalu</div>
          </div>
        </div>
        <div class="activity-item">
          <div class="activity-dot" style="background:var(--accent)"></div>
          <div>
            <div class="activity-msg"><strong>budi_s</strong> menulis entri diary ke-47</div>
            <div class="activity-time">7 menit lalu</div>
          </div>
        </div>
        <div class="activity-item">
          <div class="activity-dot" style="background:var(--warn)"></div>
          <div>
            <div class="activity-msg">Persona <strong>Reflector</strong> dipilih 23x dalam 1 jam</div>
            <div class="activity-time">12 menit lalu</div>
          </div>
        </div>
        <div class="activity-item">
          <div class="activity-dot" style="background:var(--danger)"></div>
          <div>
            <div class="activity-msg"><strong>user_xyz</strong> gagal login 5x berturut-turut</div>
            <div class="activity-time">18 menit lalu</div>
          </div>
        </div>
        <div class="activity-item">
          <div class="activity-dot" style="background:var(--success)"></div>
          <div>
            <div class="activity-msg">AI Config <strong>temperature</strong> diperbarui ke 0.7</div>
            <div class="activity-time">25 menit lalu</div>
          </div>
        </div>
      </div>

      <!-- mood chart -->
      <div class="card">
        <div class="sec-header">
          <div>
            <div class="sec-title">Distribusi Mood</div>
            <div class="sec-sub">7 hari terakhir · semua user</div>
          </div>
        </div>
        <div style="display:flex;gap:8px;margin-bottom:16px;">
          <span class="badge badge-green">😊 31%</span>
          <span class="badge badge-warn">😐 28%</span>
          <span class="badge badge-red">😢 18%</span>
          <span class="badge badge-purple">😴 23%</span>
        </div>
        <div class="mood-chart">
          <div class="mood-bar good" style="height:80%"></div>
          <div class="mood-bar meh" style="height:55%"></div>
          <div class="mood-bar sad" style="height:35%"></div>
          <div class="mood-bar good" style="height:70%"></div>
          <div class="mood-bar tired" style="height:45%"></div>
          <div class="mood-bar good" style="height:90%"></div>
          <div class="mood-bar meh" style="height:60%"></div>
        </div>
        <div class="mood-labels">
          <div class="mood-lbl">Sen</div><div class="mood-lbl">Sel</div>
          <div class="mood-lbl">Rab</div><div class="mood-lbl">Kam</div>
          <div class="mood-lbl">Jum</div><div class="mood-lbl">Sab</div>
          <div class="mood-lbl">Min</div>
        </div>

        <div class="divider"></div>
        <div class="sec-title" style="margin-bottom:10px;font-size:0.8rem;">Persona Usage</div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          <div style="display:flex;align-items:center;gap:10px;">
            <span style="font-size:0.75rem;color:var(--t3);width:72px;font-family:var(--mono)">🫂 Teman</span>
            <div style="flex:1;height:6px;background:var(--card2);border-radius:3px;overflow:hidden;">
              <div style="width:68%;height:100%;background:var(--accent);border-radius:3px;"></div>
            </div>
            <span style="font-size:0.7rem;color:var(--accent);font-family:var(--mono)">68%</span>
          </div>
          <div style="display:flex;align-items:center;gap:10px;">
            <span style="font-size:0.75rem;color:var(--t3);width:72px;font-family:var(--mono)">🧠 Mentor</span>
            <div style="flex:1;height:6px;background:var(--card2);border-radius:3px;overflow:hidden;">
              <div style="width:20%;height:100%;background:var(--purple);border-radius:3px;"></div>
            </div>
            <span style="font-size:0.7rem;color:var(--purple);font-family:var(--mono)">20%</span>
          </div>
          <div style="display:flex;align-items:center;gap:10px;">
            <span style="font-size:0.75rem;color:var(--t3);width:72px;font-family:var(--mono)">🪞 Reflect</span>
            <div style="flex:1;height:6px;background:var(--card2);border-radius:3px;overflow:hidden;">
              <div style="width:12%;height:100%;background:var(--success);border-radius:3px;"></div>
            </div>
            <span style="font-size:0.7rem;color:var(--success);font-family:var(--mono)">12%</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ====== USERS ====== -->
  <div class="page" id="page-users">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
      <div>
        <div style="font-size:1.1rem;font-weight:700;color:var(--t1);">User Management</div>
        <div style="font-size:0.75rem;color:var(--t3);font-family:var(--mono);margin-top:3px;">847 total · 3 suspended</div>
      </div>
      <div style="display:flex;gap:8px;align-items:center;">
        <div class="search-bar">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="6" cy="6" r="4"/><path d="M10 10l2.5 2.5"/></svg>
          <input type="text" placeholder="Cari user..." oninput="filterUsers(this.value)">
        </div>
        <select style="background:var(--card);border:1px solid var(--border);color:var(--t2);padding:6px 10px;border-radius:8px;font-size:0.78rem;outline:none;font-family:var(--sans);cursor:pointer;">
          <option>Semua Status</option>
          <option>Aktif</option>
          <option>Suspended</option>
        </select>
      </div>
    </div>

    <div class="card" style="padding:0;">
      <div class="table-wrap">
        <table id="usersTable">
          <thead>
            <tr>
              <th>User</th>
              <th>Status</th>
              <th>Entri</th>
              <th>Bergabung</th>
              <th>Terakhir aktif</th>
              <th>Mood dominan</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody id="usersBody"></tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- ====== DIARY ENTRIES ====== -->
  <div class="page" id="page-entries">
    <div style="background:var(--warn-g);border:1px solid rgba(251,191,36,0.2);border-radius:10px;padding:14px 16px;margin-bottom:20px;display:flex;gap:12px;align-items:flex-start;">
      <span style="font-size:1.1rem;">⚠️</span>
      <div>
        <div style="font-size:0.83rem;color:var(--warn);font-weight:600;margin-bottom:3px;">Mode Privacy Aktif</div>
        <div style="font-size:0.75rem;color:var(--t3);">Isi diary disembunyikan. Hanya metadata & anonymized preview yang ditampilkan untuk melindungi privasi user.</div>
      </div>
    </div>

    <div class="stat-grid" style="margin-bottom:20px;">
      <div class="stat-card blue" style="padding:14px 16px;">
        <div class="stat-label">Total Entri</div>
        <div class="stat-value" style="font-size:1.5rem;">4,218</div>
      </div>
      <div class="stat-card green" style="padding:14px 16px;">
        <div class="stat-label">Hari Ini</div>
        <div class="stat-value" style="font-size:1.5rem;">89</div>
      </div>
      <div class="stat-card purple" style="padding:14px 16px;">
        <div class="stat-label">Avg / User</div>
        <div class="stat-value" style="font-size:1.5rem;">4.9</div>
      </div>
      <div class="stat-card red" style="padding:14px 16px;">
        <div class="stat-label">Flagged</div>
        <div class="stat-value" style="font-size:1.5rem;">0</div>
      </div>
    </div>

    <div class="card" style="padding:0;">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID Entri</th>
              <th>User (anon)</th>
              <th>Mood</th>
              <th>Persona</th>
              <th>Panjang</th>
              <th>Waktu</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><span style="font-family:var(--mono);font-size:0.75rem;color:var(--t3)">#e-4218</span></td><td><span style="font-family:var(--mono);color:var(--t3)">usr_8a2f</span></td><td>😐</td><td><span class="badge badge-blue">Teman</span></td><td><span style="font-family:var(--mono)">342 chr</span></td><td><span style="font-family:var(--mono);font-size:0.72rem;color:var(--t3)">22:14 · Hari ini</span></td><td><span class="badge badge-green">normal</span></td></tr>
            <tr><td><span style="font-family:var(--mono);font-size:0.75rem;color:var(--t3)">#e-4217</span></td><td><span style="font-family:var(--mono);color:var(--t3)">usr_3c1e</span></td><td>😊</td><td><span class="badge badge-purple">Mentor</span></td><td><span style="font-family:var(--mono)">521 chr</span></td><td><span style="font-family:var(--mono);font-size:0.72rem;color:var(--t3)">21:50 · Hari ini</span></td><td><span class="badge badge-green">normal</span></td></tr>
            <tr><td><span style="font-family:var(--mono);font-size:0.75rem;color:var(--t3)">#e-4216</span></td><td><span style="font-family:var(--mono);color:var(--t3)">usr_7b9d</span></td><td>😢</td><td><span class="badge badge-blue">Teman</span></td><td><span style="font-family:var(--mono)">189 chr</span></td><td><span style="font-family:var(--mono);font-size:0.72rem;color:var(--t3)">21:33 · Hari ini</span></td><td><span class="badge badge-warn">review</span></td></tr>
            <tr><td><span style="font-family:var(--mono);font-size:0.75rem;color:var(--t3)">#e-4215</span></td><td><span style="font-family:var(--mono);color:var(--t3)">usr_2a4f</span></td><td>😴</td><td><span class="badge badge-green">Reflect</span></td><td><span style="font-family:var(--mono)">78 chr</span></td><td><span style="font-family:var(--mono);font-size:0.72rem;color:var(--t3)">21:10 · Hari ini</span></td><td><span class="badge badge-green">normal</span></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- ====== PERSONAS ====== -->
  <div class="page" id="page-personas">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
      <div>
        <div style="font-size:1.1rem;font-weight:700;color:var(--t1);">Persona Management</div>
        <div style="font-size:0.75rem;color:var(--t3);font-family:var(--mono);margin-top:3px;">4 persona · 3 aktif</div>
      </div>
      <button class="topbar-btn primary" onclick="openPersonaModal()">+ Persona Baru</button>
    </div>

    <div class="persona-grid">
      <div class="persona-card active-persona">
        <span class="p-icon">🫂</span>
        <div class="p-status"><span class="badge badge-green">aktif</span></div>
        <div class="p-name">Teman Hangat</div>
        <div class="p-users">👥 578 users menggunakan ini</div>
        <div class="p-desc">Responsif, empatik, tidak menghakimi. Cocok untuk curhat sehari-hari.</div>
        <div class="p-tags">
          <span class="p-tag">tone: santai</span>
          <span class="p-tag">empati tinggi</span>
          <span class="p-tag">default</span>
        </div>
        <div class="p-actions">
          <button class="action-btn" onclick="openEditPersona('Teman Hangat')">Edit</button>
          <button class="action-btn" onclick="showToast('Persona bawaan tidak dapat dinonaktifkan','warn')">Nonaktifkan</button>
        </div>
      </div>

      <div class="persona-card">
        <span class="p-icon">🧠</span>
        <div class="p-status"><span class="badge badge-green">aktif</span></div>
        <div class="p-name">Mentor</div>
        <div class="p-users">👥 169 users menggunakan ini</div>
        <div class="p-desc">Analitis, berbasis insight, mendorong refleksi mendalam & pertumbuhan.</div>
        <div class="p-tags">
          <span class="p-tag">tone: logis</span>
          <span class="p-tag">insight</span>
          <span class="p-tag">structured</span>
        </div>
        <div class="p-actions">
          <button class="action-btn" onclick="openEditPersona('Mentor')">Edit</button>
          <button class="action-btn danger" onclick="showToast('Persona Mentor dinonaktifkan','red')">Nonaktifkan</button>
        </div>
      </div>

      <div class="persona-card">
        <span class="p-icon">🪞</span>
        <div class="p-status"><span class="badge badge-green">aktif</span></div>
        <div class="p-name">Reflector</div>
        <div class="p-users">👥 100 users menggunakan ini</div>
        <div class="p-desc">Memantulkan kembali apa yang user ceritakan — tanpa judgment, tanpa saran.</div>
        <div class="p-tags">
          <span class="p-tag">tone: netral</span>
          <span class="p-tag">mirror</span>
          <span class="p-tag">minimal</span>
        </div>
        <div class="p-actions">
          <button class="action-btn" onclick="openEditPersona('Reflector')">Edit</button>
          <button class="action-btn danger" onclick="showToast('Persona Reflector dinonaktifkan','red')">Nonaktifkan</button>
        </div>
      </div>

      <div class="persona-card disabled">
        <span class="p-icon">🌙</span>
        <div class="p-status"><span class="badge badge-red">nonaktif</span></div>
        <div class="p-name">Night Mode</div>
        <div class="p-users">👥 0 users</div>
        <div class="p-desc">Versi lebih sunyi & meditatif untuk malam hari. Masih dalam pengembangan.</div>
        <div class="p-tags">
          <span class="p-tag">tone: pelan</span>
          <span class="p-tag">malam</span>
          <span class="p-tag">beta</span>
        </div>
        <div class="p-actions">
          <button class="action-btn" onclick="openEditPersona('Night Mode')">Edit</button>
          <button class="action-btn" onclick="showToast('Persona Night Mode diaktifkan','green')">Aktifkan</button>
        </div>
      </div>
    </div>
  </div>

  <!-- ====== AI CONFIG ====== -->
  <div class="page" id="page-ai-config">
    <div style="display:flex;gap:20px;align-items:flex-start;">
      <!-- left col -->
      <div style="flex:1;">
        <div class="card" style="margin-bottom:14px;">
          <div class="sec-header"><div><div class="sec-title">System Prompt Global</div><div class="sec-sub">Berlaku untuk semua persona sebagai base</div></div><span class="badge badge-blue">v1.4</span></div>
          <div class="config-group">
            <div class="config-label">Prompt Utama<span style="color:var(--success)">● live</span></div>
            <textarea class="config-input" rows="6" id="systemPrompt">Kamu adalah Bisik, pendamping diary AI yang hangat, empatik, dan tidak menghakimi. Tugasmu adalah mendengarkan dengan penuh perhatian dan merespons dengan cara yang membuat user merasa dipahami — bukan dinasihati.

Gunakan bahasa Indonesia yang santai dan natural. Jangan terlalu formal. Jangan berikan solusi kecuali diminta secara eksplisit.

Prioritaskan validasi perasaan di atas segalanya.</textarea>
          </div>
          <div style="display:flex;gap:8px;">
            <button class="topbar-btn primary" onclick="saveConfig()">Simpan Perubahan</button>
            <button class="topbar-btn" onclick="document.getElementById('systemPrompt').value='Kamu adalah Bisik...'">Reset Default</button>
          </div>
        </div>

        <!-- prompt tester -->
        <div class="card">
          <div class="sec-header"><div><div class="sec-title">Live Prompt Tester</div><div class="sec-sub">Uji output AI langsung dari sini</div></div></div>
          <div class="prompt-tester">
            <div class="pt-header">
              <span>▶ test input</span>
              <span style="color:var(--success)">model: claude-sonnet</span>
            </div>
            <div class="pt-body">
              <textarea class="pt-input" rows="2" id="testInput" placeholder="Ketik pesan test... e.g. 'hari ini aku sedih banget'"></textarea>
              <div class="pt-output" id="testOutput"></div>
            </div>
          </div>
          <div style="margin-top:12px;display:flex;gap:8px;">
            <button class="topbar-btn primary" onclick="runTest()">▶ Run Test</button>
            <button class="topbar-btn" onclick="document.getElementById('testOutput').className='pt-output'">Clear</button>
          </div>
        </div>
      </div>

      <!-- right col -->
      <div style="width:280px;flex-shrink:0;">
        <div class="card" style="margin-bottom:14px;">
          <div class="sec-title" style="margin-bottom:16px;">Parameter AI</div>

          <div class="config-group">
            <div class="config-label">Temperature (Kreativitas)</div>
            <div class="range-wrap">
              <input type="range" min="0" max="100" value="70" oninput="this.nextElementSibling.textContent=(this.value/100).toFixed(1)">
              <div class="range-val">0.7</div>
            </div>
          </div>

          <div class="config-group">
            <div class="config-label">Max Response Length</div>
            <div class="range-wrap">
              <input type="range" min="100" max="1000" value="400" step="50" oninput="this.nextElementSibling.textContent=this.value">
              <div class="range-val">400</div>
            </div>
          </div>

          <div class="config-group">
            <div class="config-label">Response Delay (ms)</div>
            <div class="range-wrap">
              <input type="range" min="500" max="3000" value="1800" step="100" oninput="this.nextElementSibling.textContent=this.value">
              <div class="range-val">1800</div>
            </div>
          </div>

          <div class="config-group" style="margin-bottom:0;">
            <div class="config-label">Rate Limit (req/jam/user)</div>
            <input class="config-input" type="number" value="60" style="padding:8px 10px;">
          </div>
        </div>

        <div class="card">
          <div class="sec-title" style="margin-bottom:14px;">Fitur Toggle</div>
          <div class="toggle-row">
            <div class="toggle-info">
              <div class="t-title">Memory Hint</div>
              <div class="t-desc">AI referensikan entri lama</div>
            </div>
            <div class="toggle on" onclick="this.classList.toggle('on')"></div>
          </div>
          <div class="toggle-row">
            <div class="toggle-info">
              <div class="t-title">Mood Detection</div>
              <div class="t-desc">Auto-deteksi mood dari teks</div>
            </div>
            <div class="toggle on" onclick="this.classList.toggle('on')"></div>
          </div>
          <div class="toggle-row">
            <div class="toggle-info">
              <div class="t-title">Adaptive Tone</div>
              <div class="t-desc">Tone menyesuaikan pola user</div>
            </div>
            <div class="toggle" onclick="this.classList.toggle('on')"></div>
          </div>
          <div class="toggle-row" style="margin-bottom:0;">
            <div class="toggle-info">
              <div class="t-title">Night Mode AI</div>
              <div class="t-desc">Lebih pelan setelah jam 21</div>
            </div>
            <div class="toggle on" onclick="this.classList.toggle('on')"></div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ====== SETTINGS ====== -->
  <div class="page" id="page-settings">
    <div style="max-width:600px;">
      <div class="card" style="margin-bottom:14px;">
        <div class="sec-title" style="margin-bottom:16px;">General Settings</div>
        <div class="config-group">
          <div class="config-label">Nama Aplikasi</div>
          <input class="config-input" type="text" value="bisik">
        </div>
        <div class="config-group">
          <div class="config-label">Tagline</div>
          <input class="config-input" type="text" value="Ruang ceritamu yang tenang">
        </div>
        <div class="config-group" style="margin-bottom:0;">
          <div class="config-label">Maintenance Mode</div>
          <div class="toggle-row" style="margin-bottom:0;">
            <div class="toggle-info">
              <div class="t-title">Aktifkan Maintenance Mode</div>
              <div class="t-desc">User tidak bisa login saat mode ini aktif</div>
            </div>
            <div class="toggle" onclick="this.classList.toggle('on');showToast('Maintenance mode diperbarui','blue')"></div>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="sec-title" style="margin-bottom:16px;">Danger Zone</div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          <div class="toggle-row">
            <div class="toggle-info">
              <div class="t-title" style="color:var(--danger);">Reset Semua AI Config</div>
              <div class="t-desc">Kembalikan ke pengaturan default pabrik</div>
            </div>
            <button class="action-btn danger" onclick="showToast('Config direset ke default','red')">Reset</button>
          </div>
          <div class="toggle-row" style="margin-bottom:0;">
            <div class="toggle-info">
              <div class="t-title" style="color:var(--danger);">Clear All Cache</div>
              <div class="t-desc">Hapus semua cache sistem</div>
            </div>
            <button class="action-btn danger" onclick="showToast('Cache berhasil dibersihkan','green')">Clear</button>
          </div>
        </div>
      </div>
    </div>
  </div>

</main>

<script>
// ====== USERS DATA ======
const users = [
  {id:'usr_8a2f',name:'Rani Pratiwi',email:'rani@gmail.com',status:'active',entries:47,joined:'12 Mar 2025',lastActive:'Baru saja',mood:'😊',color:'#38bdf8'},
  {id:'usr_3c1e',name:'Budi Santoso',email:'budi_s@mail.com',status:'active',entries:128,joined:'1 Jan 2025',lastActive:'2j lalu',mood:'😐',color:'#a78bfa'},
  {id:'usr_7b9d',name:'Dewi Lestari',email:'dewi@email.com',status:'active',entries:23,joined:'20 Mar 2025',lastActive:'5j lalu',mood:'😢',color:'#34d399'},
  {id:'usr_2a4f',name:'Ahmad Fauzi',email:'ahmad.f@mail.com',status:'suspended',entries:8,joined:'5 Feb 2025',lastActive:'2h lalu',mood:'😤',color:'#fbbf24'},
  {id:'usr_5k2m',name:'Sari Dewi',email:'sari@gmail.com',status:'active',entries:64,joined:'15 Feb 2025',lastActive:'1h lalu',mood:'😴',color:'#f43f5e'},
  {id:'usr_9p1q',name:'Riko Firmansyah',email:'riko@mail.id',status:'suspended',entries:3,joined:'28 Mar 2025',lastActive:'3h lalu',mood:'😐',color:'#38bdf8'},
];

function renderUsers(list) {
  const tbody = document.getElementById('usersBody');
  tbody.innerHTML = list.map(u => `
    <tr>
      <td>
        <div class="user-cell">
          <div class="u-avatar" style="background:${u.color}22;color:${u.color}">${u.name[0]}</div>
          <div>
            <div class="u-name">${u.name}</div>
            <div class="u-email">${u.email}</div>
          </div>
        </div>
      </td>
      <td>${u.status==='active'?'<span class="badge badge-green">aktif</span>':'<span class="badge badge-red">suspended</span>'}</td>
      <td><span style="font-family:var(--mono)">${u.entries}</span></td>
      <td><span style="font-family:var(--mono);font-size:0.75rem;color:var(--t3)">${u.joined}</span></td>
      <td><span style="font-family:var(--mono);font-size:0.75rem">${u.lastActive}</span></td>
      <td>${u.mood}</td>
      <td style="display:flex;gap:5px;align-items:center;">
        <button class="action-btn" onclick="showUserModal('${u.id}')">Detail</button>
        <button class="action-btn danger" onclick="toggleSuspend('${u.id}')">${u.status==='active'?'Suspend':'Unsuspend'}</button>
      </td>
    </tr>`).join('');
}

function filterUsers(q) {
  renderUsers(users.filter(u =>
    u.name.toLowerCase().includes(q.toLowerCase()) ||
    u.email.toLowerCase().includes(q.toLowerCase())
  ));
}

function toggleSuspend(id) {
  const u = users.find(x => x.id === id);
  u.status = u.status === 'active' ? 'suspended' : 'active';
  renderUsers(users);
  showToast(`${u.name} ${u.status === 'suspended' ? 'disuspend' : 'diaktifkan kembali'}`, u.status === 'suspended' ? 'red' : 'green');
}

function showUserModal(id) {
  const u = users.find(x => x.id === id);
  document.getElementById('modalContent').innerHTML = `
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:20px;">
      <div style="width:48px;height:48px;border-radius:12px;background:${u.color}22;color:${u.color};display:flex;align-items:center;justify-content:center;font-size:1.3rem;font-weight:700;">${u.name[0]}</div>
      <div>
        <div class="modal-title" style="margin-bottom:2px;">${u.name}</div>
        <div style="font-size:0.75rem;color:var(--t3);font-family:var(--mono)">${u.id} · ${u.email}</div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;">
      <div style="background:var(--card2);border-radius:8px;padding:12px;border:1px solid var(--border);">
        <div style="font-size:0.65rem;color:var(--t3);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px;">Total Entri</div>
        <div style="font-size:1.4rem;font-weight:700;color:var(--t1);font-family:var(--mono)">${u.entries}</div>
      </div>
      <div style="background:var(--card2);border-radius:8px;padding:12px;border:1px solid var(--border);">
        <div style="font-size:0.65rem;color:var(--t3);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px;">Mood Dominan</div>
        <div style="font-size:1.4rem;">${u.mood}</div>
      </div>
    </div>
    <div style="font-size:0.78rem;color:var(--t3);margin-bottom:4px;">Bergabung</div>
    <div style="font-size:0.85rem;color:var(--t2);margin-bottom:16px;font-family:var(--mono)">${u.joined}</div>
    <div class="modal-footer">
      <button class="topbar-btn" onclick="closeModal()">Tutup</button>
      <button class="topbar-btn danger" style="border-color:var(--danger);color:var(--danger);" onclick="toggleSuspend('${u.id}');closeModal();">${u.status==='active'?'Suspend User':'Unsuspend'}</button>
    </div>
  `;
  document.getElementById('modalOverlay').classList.add('open');
}

// ====== PERSONA MODAL ======
function openPersonaModal() {
  document.getElementById('modalContent').innerHTML = `
    <div class="modal-title">Persona Baru</div>
    <div class="modal-sub">Buat karakter AI baru untuk user</div>
    <div class="config-group">
      <div class="config-label">Nama Persona</div>
      <input class="config-input" type="text" placeholder="e.g. Sahabat Malam">
    </div>
    <div class="config-group">
      <div class="config-label">Emoji Icon</div>
      <input class="config-input" type="text" placeholder="🌙" style="font-size:1.2rem;width:60px;">
    </div>
    <div class="config-group">
      <div class="config-label">Deskripsi</div>
      <input class="config-input" type="text" placeholder="Karakter ini cocok untuk...">
    </div>
    <div class="config-group" style="margin-bottom:0;">
      <div class="config-label">Tone Dasar</div>
      <select class="config-input" style="padding:8px 10px;">
        <option>Santai & Hangat</option>
        <option>Logis & Analitis</option>
        <option>Netral & Reflektif</option>
        <option>Pelan & Meditatif</option>
      </select>
    </div>
    <div class="modal-footer">
      <button class="topbar-btn" onclick="closeModal()">Batal</button>
      <button class="topbar-btn primary" onclick="closeModal();showToast('Persona baru berhasil dibuat','green')">Buat Persona</button>
    </div>
  `;
  document.getElementById('modalOverlay').classList.add('open');
}

function openEditPersona(name) {
  document.getElementById('modalContent').innerHTML = `
    <div class="modal-title">Edit Persona: ${name}</div>
    <div class="modal-sub">Perubahan akan berlaku langsung ke semua user</div>
    <div class="config-group">
      <div class="config-label">System Prompt Override</div>
      <textarea class="config-input" rows="5" placeholder="Tambahkan instruksi spesifik untuk persona ini...">Kamu adalah ${name}. Kamu berbicara dengan cara yang hangat dan empatik...</textarea>
    </div>
    <div class="config-group" style="margin-bottom:0;">
      <div class="config-label">Tone Modifier</div>
      <div class="range-wrap">
        <input type="range" min="0" max="100" value="65" oninput="this.nextElementSibling.textContent=(this.value/100).toFixed(1)">
        <div class="range-val">0.65</div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="topbar-btn" onclick="closeModal()">Batal</button>
      <button class="topbar-btn primary" onclick="closeModal();showToast('Persona ${name} diperbarui','green')">Simpan</button>
    </div>
  `;
  document.getElementById('modalOverlay').classList.add('open');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
}

// ====== NAVIGATION ======
function navTo(id, el) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');

  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  el.classList.add('active');

  const titles = {
    'dashboard':'Dashboard','users':'User Management',
    'entries':'Diary Entries','personas':'Personas',
    'ai-config':'AI Config','settings':'Settings'
  };
  const crumbs = {
    'dashboard':'/ overview','users':'/ manajemen',
    'entries':'/ monitoring','personas':'/ manajemen',
    'ai-config':'/ konfigurasi','settings':'/ sistem'
  };
  document.getElementById('pageTitle').textContent = titles[id] || id;
  document.getElementById('pageCrumb').textContent = crumbs[id] || '';
}

// ====== TOAST ======
function showToast(msg, type='blue') {
  const colors = {green:'#34d399',red:'#f43f5e',blue:'#38bdf8',warn:'#fbbf24'};
  const c = document.getElementById('toastContainer');
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `<div class="toast-dot" style="background:${colors[type]||colors.blue};box-shadow:0 0 8px ${colors[type]||colors.blue}"></div><span>${msg}</span>`;
  c.appendChild(t);
  setTimeout(() => { t.style.opacity='0'; t.style.transform='translateX(20px)'; t.style.transition='all 0.3s'; setTimeout(()=>t.remove(),300); }, 3000);
}

// ====== AI CONFIG ======
function saveConfig() { showToast('System prompt berhasil disimpan ✓','green'); }

const mockResponses = [
  'Kedengarannya berat ya... Mau cerita lebih lanjut? Aku di sini dan tidak kemana-mana. 💙',
  'Wajar kalau kamu merasa seperti itu. Perasaanmu valid sepenuhnya.',
  'Aku dengar kamu. Kadang hari memang seperti itu — dan itu oke.',
];
let responseIdx = 0;

function runTest() {
  const input = document.getElementById('testInput').value.trim();
  if (!input) { showToast('Ketik pesan test dulu','warn'); return; }
  const out = document.getElementById('testOutput');
  out.className = 'pt-output';
  out.innerHTML = '<span style="color:var(--t3)">⟳ memproses...</span>';
  out.className = 'pt-output show';
  setTimeout(() => {
    out.innerHTML = `<span style="color:var(--success)">▶ output:</span><br><br>${mockResponses[responseIdx++ % mockResponses.length]}`;
  }, 1200);
}

// ====== INIT ======
renderUsers(users);
</script>
</body>
</html>