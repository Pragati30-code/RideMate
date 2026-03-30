export const globalStyles = `
  * { box-sizing: border-box; }

  .font-display { font-family: var(--font-playfair), Georgia, serif; }
  .font-body    { font-family: var(--font-dm), sans-serif; }

  @keyframes float-slow {
    0%, 100% { transform: translateY(0px) rotate(-1deg); }
    50%       { transform: translateY(-12px) rotate(1deg); }
  }
  @keyframes float-card {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-6px); }
  }
  @keyframes spin-wheel {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes fade-up {
    from { opacity: 0; transform: translateY(30px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes wiggle {
    0%, 100% { transform: rotate(-3deg); }
    50%       { transform: rotate(3deg); }
  }
  @keyframes dot-blink {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.3; }
  }
  @keyframes road-move {
    from { background-position: 0 0; }
    to   { background-position: 80px 0; }
  }

  .car-float    { animation: float-slow 4s ease-in-out infinite; }
  .card-float-1 { animation: float-card 3s ease-in-out infinite; }
  .card-float-2 { animation: float-card 3.5s ease-in-out infinite 0.5s; }
  .card-float-3 { animation: float-card 4s ease-in-out infinite 1s; }
  .fade-up-1    { animation: fade-up 0.7s ease-out 0.1s both; }
  .fade-up-2    { animation: fade-up 0.7s ease-out 0.25s both; }
  .fade-up-3    { animation: fade-up 0.7s ease-out 0.4s both; }
  .fade-up-4    { animation: fade-up 0.7s ease-out 0.55s both; }
  .wheel        { animation: spin-wheel 2s linear infinite; }
  .wiggle       { animation: wiggle 2s ease-in-out infinite; }
  .dot-blink    { animation: dot-blink 1.5s ease-in-out infinite; }
  .road-animate {
    background: repeating-linear-gradient(90deg, #d4b896 0px, #d4b896 40px, transparent 40px, transparent 80px);
    animation: road-move 1s linear infinite;
  }

  .btn-main {
    background: #2d2d2d;
    color: #fdf6ec;
    border: none;
    padding: 14px 32px;
    border-radius: 50px;
    font-family: var(--font-dm), sans-serif;
    font-weight: 600;
    font-size: 15px;
    cursor: pointer;
    transition: all 0.3s;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    letter-spacing: 0.3px;
  }
  .btn-main:hover {
    background: #1a1a1a;
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(45,45,45,0.25);
  }

  .btn-outline {
    background: transparent;
    color: #2d2d2d;
    border: 2px solid #2d2d2d;
    padding: 12px 30px;
    border-radius: 50px;
    font-family: var(--font-dm), sans-serif;
    font-weight: 500;
    font-size: 15px;
    cursor: pointer;
    transition: all 0.3s;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  .btn-outline:hover { background: #2d2d2d; color: #fdf6ec; transform: translateY(-2px); }

  .btn-cta {
    background: #ff9b6a;
    color: white;
    border: none;
    padding: 16px 36px;
    border-radius: 50px;
    font-family: var(--font-dm), sans-serif;
    font-weight: 700;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: 0 8px 24px rgba(255,155,106,0.35);
    display: inline-flex;
    align-items: center;
    gap: 10px;
  }
  .btn-cta:hover {
    transform: translateY(-2px);
    box-shadow: 0 14px 32px rgba(255,155,106,0.45);
  }

  .feature-card {
    background: rgba(255,255,255,0.7);
    backdrop-filter: blur(16px);
    border: 1.5px solid rgba(255,255,255,0.9);
    border-radius: 24px;
    padding: 32px;
    transition: all 0.3s;
    box-shadow: 0 4px 24px rgba(180,140,100,0.08);
  }
  .feature-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 16px 40px rgba(180,140,100,0.15);
    border-color: rgba(255,180,120,0.4);
  }

  .nav-pill {
    background: rgba(255,255,255,0.75);
    backdrop-filter: blur(20px);
    border: 1.5px solid rgba(255,255,255,0.9);
    border-radius: 50px;
    padding: 10px 20px;
    box-shadow: 0 4px 20px rgba(180,140,100,0.1);
  }

  .sticker-badge {
    background: #ff9b6a;
    color: white;
    border-radius: 50px;
    padding: 6px 16px;
    font-family: var(--font-dm), sans-serif;
    font-size: 13px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    box-shadow: 0 4px 12px rgba(255,155,106,0.35);
  }

  .floating-card {
    background: rgba(255,255,255,0.9);
    backdrop-filter: blur(20px);
    border: 1.5px solid rgba(255,255,255,1);
    border-radius: 20px;
    padding: 18px 22px;
    box-shadow: 0 8px 32px rgba(180,140,100,0.15);
    display: flex;
    align-items: center;
    gap: 14px;
    min-width: 200px;
  }

  .icon-circle {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .doodle-dot {
    position: absolute;
    border-radius: 50%;
    opacity: 0.4;
  }

  .tag-label {
    font-family: var(--font-dm), sans-serif;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    opacity: 0.55;
    margin-bottom: 3px;
  }
  .tag-value {
    font-family: var(--font-dm), sans-serif;
    font-weight: 700;
    font-size: 16px;
    color: #2d2d2d;
  }

  .section-pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(255,155,106,0.12);
    color: #cc6b3d;
    border: 1px solid rgba(255,155,106,0.25);
    padding: 6px 16px;
    border-radius: 50px;
    font-family: var(--font-dm), sans-serif;
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 16px;
  }
`;