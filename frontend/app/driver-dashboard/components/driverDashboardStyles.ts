export const driverDashboardStyles = `
  .font-display { font-family: var(--font-playfair), Georgia, serif; }
  .font-body    { font-family: var(--font-dm), sans-serif; }

  @keyframes fade-up {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .fade-up { animation: fade-up 0.5s ease-out both; }
  .spin    { animation: spin 0.8s linear infinite; }

  .dd-card {
    background: rgba(255,255,255,0.68);
    backdrop-filter: blur(20px);
    border: 1.5px solid rgba(255,255,255,0.95);
    border-radius: 20px;
    padding: 22px;
    box-shadow: 0 4px 20px rgba(180,140,100,0.08);
  }

  .dd-section {
    background: rgba(255,255,255,0.55);
    backdrop-filter: blur(16px);
    border: 1.5px solid rgba(255,255,255,0.9);
    border-radius: 24px;
    padding: 28px;
    box-shadow: 0 4px 24px rgba(180,140,100,0.07);
  }

  .dd-label {
    font-family: var(--font-dm), sans-serif;
    font-size: 11px;
    font-weight: 600;
    color: #8a8380;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    display: block;
    margin-bottom: 4px;
  }

  .dd-value {
    font-family: var(--font-dm), sans-serif;
    font-size: 14px;
    color: #3a3530;
  }

  .dd-btn {
    display: inline-flex; align-items: center; gap: 7px;
    border: none; border-radius: 50px; cursor: pointer;
    font-family: var(--font-dm), sans-serif; font-weight: 600;
    font-size: 13px; padding: 9px 20px; transition: all 0.22s;
    white-space: nowrap;
  }
  .dd-btn:disabled { opacity: 0.45; cursor: not-allowed; }
  .dd-btn-dark  { background: #2d2d2d; color: #fdf6ec; }
  .dd-btn-dark:hover:not(:disabled)  { background: #1a1a1a; transform: translateY(-1px); box-shadow: 0 6px 18px rgba(45,45,45,0.18); }
  .dd-btn-green { background: rgba(100,200,120,0.12); color: #2e7d32; border: 1.5px solid rgba(100,200,120,0.3); }
  .dd-btn-green:hover:not(:disabled) { background: rgba(100,200,120,0.2); transform: translateY(-1px); }
  .dd-btn-red   { background: rgba(220,80,80,0.1);  color: #b71c1c; border: 1.5px solid rgba(220,80,80,0.25); }
  .dd-btn-red:hover:not(:disabled)   { background: rgba(220,80,80,0.18); transform: translateY(-1px); }
  .dd-btn-blue  { background: rgba(80,150,220,0.1); color: #1a5ea8; border: 1.5px solid rgba(80,150,220,0.25); }
  .dd-btn-blue:hover:not(:disabled)  { background: rgba(80,150,220,0.18); transform: translateY(-1px); }

  .dd-stat-card {
    background: rgba(255,255,255,0.68);
    backdrop-filter: blur(16px);
    border: 1.5px solid rgba(255,255,255,0.95);
    border-radius: 18px;
    padding: 18px 20px;
    box-shadow: 0 4px 16px rgba(180,140,100,0.07);
  }

  .dd-map {
    height: 300px; overflow: hidden;
    border-radius: 16px;
    border: 1.5px solid rgba(45,45,45,0.1);
  }

  .dd-table { width: 100%; border-collapse: collapse; }
  .dd-table th {
    font-family: var(--font-dm), sans-serif;
    font-size: 11px; font-weight: 600; letter-spacing: 0.4px;
    text-transform: uppercase; color: #8a8380;
    padding: 12px 16px; text-align: left;
    background: rgba(255,255,255,0.6);
    border-bottom: 1.5px solid rgba(45,45,45,0.07);
  }
  .dd-table td {
    font-family: var(--font-dm), sans-serif;
    font-size: 13px; color: #3a3530;
    padding: 12px 16px;
    border-bottom: 1px solid rgba(45,45,45,0.06);
  }
  .dd-table tr:last-child td { border-bottom: none; }
  .dd-table tr:hover td { background: rgba(255,155,106,0.04); }

  .dd-route-block {
    background: rgba(255,255,255,0.7);
    border: 1.5px solid rgba(45,45,45,0.08);
    border-radius: 12px; padding: 10px 14px;
  }

  .dd-status-badge {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 3px 10px; border-radius: 50px;
    font-family: var(--font-dm), sans-serif;
    font-size: 11px; font-weight: 600; letter-spacing: 0.3px;
    text-transform: uppercase;
  }
  .badge-active     { background: rgba(100,200,120,0.12); color: #2e7d32; border: 1px solid rgba(100,200,120,0.28); }
  .badge-progress   { background: rgba(80,150,220,0.12);  color: #1a5ea8; border: 1px solid rgba(80,150,220,0.28); }
  .badge-ended      { background: rgba(45,45,45,0.07);    color: #7a7370; border: 1px solid rgba(45,45,45,0.12); }
  .badge-confirmed  { background: rgba(80,150,220,0.1);   color: #1a5ea8; border: 1px solid rgba(80,150,220,0.2); }
  .badge-picked     { background: rgba(255,180,50,0.12);  color: #a07010; border: 1px solid rgba(255,180,50,0.25); }
  .badge-dropped    { background: rgba(100,200,120,0.12); color: #2e7d32; border: 1px solid rgba(100,200,120,0.25); }

  .dd-divider { border: none; border-top: 1.5px solid rgba(45,45,45,0.07); margin: 0; }

  /* ---- Mobile overrides ---- */
  @media (max-width: 640px) {
    .dd-section {
      padding: 16px;
      border-radius: 18px;
    }
    .dd-card {
      padding: 14px;
      border-radius: 16px;
    }
    .dd-map { height: 220px; }
    .dd-btn { font-size: 12px; padding: 8px 14px; }
    .dd-table th { padding: 10px 10px; font-size: 10px; }
    .dd-table td { padding: 10px 10px; font-size: 12px; }
  }
`;
