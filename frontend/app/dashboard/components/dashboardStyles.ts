export const dashboardStyles = `
  .font-display { font-family: var(--font-playfair), Georgia, serif; }
  .font-body    { font-family: var(--font-dm), sans-serif; }

  @keyframes fade-up {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .fade-up { animation: fade-up 0.5s ease-out both; }
  .spin     { animation: spin 0.8s linear infinite; }

  /* ---- Inputs ---- */
  .d-input {
    width: 100%;
    background: rgba(255,255,255,0.65);
    border: 1.5px solid rgba(45,45,45,0.1);
    border-radius: 14px;
    padding: 12px 16px;
    font-family: var(--font-dm), sans-serif;
    font-size: 14px;
    color: #1e1e1e;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    box-sizing: border-box;
  }
  .d-input::placeholder { color: #c0b8b2; }
  .d-input:focus {
    border-color: #ff9b6a;
    box-shadow: 0 0 0 3px rgba(255,155,106,0.12);
  }
  input[type="datetime-local"].d-input { color-scheme: light; }

  .d-label {
    display: block;
    font-family: var(--font-dm), sans-serif;
    font-size: 11.5px;
    font-weight: 600;
    color: #8a8380;
    margin-bottom: 6px;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }

  /* ---- Buttons ---- */
  .d-btn {
    background: #2d2d2d;
    color: #fdf6ec;
    border: none;
    border-radius: 50px;
    padding: 11px 24px;
    font-family: var(--font-dm), sans-serif;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.25s;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    white-space: nowrap;
  }
  .d-btn:hover:not(:disabled) {
    background: #1a1a1a;
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(45,45,45,0.18);
  }
  .d-btn:disabled { opacity: 0.45; cursor: not-allowed; }

  .d-btn-accent {
    background: #ff9b6a;
    color: white;
    border: none;
    border-radius: 50px;
    padding: 11px 24px;
    font-family: var(--font-dm), sans-serif;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.25s;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    white-space: nowrap;
  }
  .d-btn-accent:hover:not(:disabled) {
    background: #f08550;
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(255,155,106,0.28);
  }
  .d-btn-accent:disabled { opacity: 0.45; cursor: not-allowed; }

  .d-btn-ghost {
    background: transparent;
    color: #2d2d2d;
    border: 1.5px solid rgba(45,45,45,0.18);
    border-radius: 50px;
    padding: 9px 20px;
    font-family: var(--font-dm), sans-serif;
    font-weight: 500;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
  }
  .d-btn-ghost:hover { background: rgba(45,45,45,0.06); }

  /* ---- Cards ---- */
  .d-card {
    background: rgba(255,255,255,0.68);
    backdrop-filter: blur(20px);
    border: 1.5px solid rgba(255,255,255,0.95);
    border-radius: 20px;
    padding: 20px;
    box-shadow: 0 4px 20px rgba(180,140,100,0.08);
    transition: box-shadow 0.2s;
  }
  .d-card:hover {
    box-shadow: 0 8px 32px rgba(180,140,100,0.13);
  }

  .d-section {
    background: rgba(255,255,255,0.55);
    backdrop-filter: blur(16px);
    border: 1.5px solid rgba(255,255,255,0.9);
    border-radius: 24px;
    padding: 28px;
    box-shadow: 0 4px 24px rgba(180,140,100,0.07);
  }

  /* ---- Suggestion dropdown ---- */
  .d-suggestions {
    position: absolute;
    z-index: 30;
    top: calc(100% + 4px);
    left: 0; right: 0;
    background: rgba(255,255,255,0.97);
    border: 1.5px solid rgba(45,45,45,0.1);
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(180,140,100,0.14);
  }
  .d-suggestion-item {
    display: block;
    width: 100%;
    text-align: left;
    padding: 10px 14px;
    background: transparent;
    border: none;
    font-family: var(--font-dm), sans-serif;
    font-size: 13px;
    color: #3a3530;
    cursor: pointer;
    transition: background 0.15s;
    border-bottom: 1px solid rgba(45,45,45,0.05);
  }
  .d-suggestion-item:last-child { border-bottom: none; }
  .d-suggestion-item:hover { background: rgba(255,155,106,0.08); }

  /* ---- Status badge ---- */
  .d-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 3px 10px;
    border-radius: 50px;
    font-family: var(--font-dm), sans-serif;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.3px;
    text-transform: uppercase;
  }
  .d-badge-active  { background: rgba(120,200,120,0.15); color: #3a8a3a; border: 1px solid rgba(120,200,120,0.3); }
  .d-badge-warning { background: rgba(255,180,50,0.12);  color: #a07010; border: 1px solid rgba(255,180,50,0.25); }
  .d-badge-muted   { background: rgba(45,45,45,0.07);    color: #7a7370; border: 1px solid rgba(45,45,45,0.12); }

  /* ---- Map container ---- */
  .d-map {
    height: 280px;
    overflow: hidden;
    border-radius: 16px;
    border: 1.5px solid rgba(45,45,45,0.1);
  }

  /* ---- Divider ---- */
  .d-divider { border: none; border-top: 1.5px solid rgba(45,45,45,0.07); margin: 20px 0; }

  /* ---- Section heading ---- */
  .d-section-title {
    font-family: var(--font-playfair), Georgia, serif;
    font-size: 20px;
    font-weight: 800;
    color: #1e1e1e;
    letter-spacing: -0.5px;
    margin-bottom: 20px;
  }
  .d-subsection-title {
    font-family: var(--font-dm), sans-serif;
    font-size: 14px;
    font-weight: 700;
    color: #3a3530;
    letter-spacing: 0.2px;
    margin-bottom: 14px;
  }

  /* ---- Info text ---- */
  .d-muted {
    font-family: var(--font-dm), sans-serif;
    font-size: 13px;
    color: #a09890;
    line-height: 1.6;
  }
  .d-accent-text {
    font-family: var(--font-dm), sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: #cc6b3d;
  }

  /* ---- Warning box ---- */
  .d-warn-box {
    background: rgba(255,200,80,0.08);
    border: 1.5px solid rgba(255,180,50,0.22);
    border-radius: 16px;
    padding: 20px;
  }
  .d-error-text {
    font-family: var(--font-dm), sans-serif;
    font-size: 12px;
    color: #c0392b;
    margin-top: 4px;
  }
`;