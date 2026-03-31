export const authStyles = `
  .font-display { font-family: var(--font-playfair), Georgia, serif; }
  .font-body    { font-family: var(--font-dm), sans-serif; }

  @keyframes fade-up {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .fade-up-1 { animation: fade-up 0.55s ease-out 0.05s both; }
  .fade-up-2 { animation: fade-up 0.55s ease-out 0.15s both; }
  .fade-up-3 { animation: fade-up 0.55s ease-out 0.25s both; }
  .spin      { animation: spin 0.8s linear infinite; }

  .auth-input {
    width: 100%;
    background: rgba(255,255,255,0.65);
    border: 1.5px solid rgba(45,45,45,0.1);
    border-radius: 14px;
    padding: 13px 16px;
    font-family: var(--font-dm), sans-serif;
    font-size: 15px;
    color: #1e1e1e;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    backdrop-filter: blur(8px);
    box-sizing: border-box;
  }
  .auth-input::placeholder { color: #c0b8b2; }
  .auth-input:focus {
    border-color: #ff9b6a;
    box-shadow: 0 0 0 3px rgba(255,155,106,0.12);
  }

  .auth-label {
    display: block;
    font-family: var(--font-dm), sans-serif;
    font-size: 12.5px;
    font-weight: 600;
    color: #7a7370;
    margin-bottom: 7px;
    letter-spacing: 0.4px;
    text-transform: uppercase;
  }

  .auth-btn {
    width: 100%;
    background: #2d2d2d;
    color: #fdf6ec;
    border: none;
    border-radius: 50px;
    padding: 14px;
    font-family: var(--font-dm), sans-serif;
    font-weight: 600;
    font-size: 15px;
    cursor: pointer;
    transition: all 0.25s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  .auth-btn:hover:not(:disabled) {
    background: #1a1a1a;
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(45,45,45,0.2);
  }
  .auth-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .error-box {
    background: rgba(220,80,80,0.07);
    border: 1.5px solid rgba(220,80,80,0.18);
    border-radius: 12px;
    padding: 10px 14px;
    font-family: var(--font-dm), sans-serif;
    font-size: 13px;
    color: #c0392b;
    text-align: center;
  }
  .field-error {
    font-family: var(--font-dm), sans-serif;
    font-size: 12px;
    color: #c0392b;
    margin-top: 5px;
  }

  [data-radix-select-trigger] {
    background: rgba(255,255,255,0.65) !important;
    border: 1.5px solid rgba(45,45,45,0.1) !important;
    border-radius: 14px !important;
    padding: 13px 16px !important;
    font-family: var(--font-dm), sans-serif !important;
    font-size: 15px !important;
    color: #1e1e1e !important;
    height: auto !important;
    box-shadow: none !important;
  }
  [data-radix-select-trigger]:focus {
    border-color: #ff9b6a !important;
    box-shadow: 0 0 0 3px rgba(255,155,106,0.12) !important;
    outline: none !important;
  }
  [data-radix-select-trigger][data-placeholder] { color: #c0b8b2 !important; }

  /* ---- Mobile overrides ---- */
  @media (max-width: 480px) {
    .auth-input { font-size: 14px; padding: 12px 14px; }
    .auth-btn   { font-size: 14px; padding: 13px; }
    .auth-label { font-size: 11.5px; }
    [data-radix-select-trigger] { font-size: 14px !important; padding: 12px 14px !important; }
  }
`;
