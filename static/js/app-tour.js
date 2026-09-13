/* =========================================================================
   app-tour.js — First-run feature tour for SmartAgro
   Shows a step-by-step modal guide the very first time the app is opened.
   Checks localStorage('smartagro_tour_done') and never shows again after.
   ========================================================================= */
(function () {
  const TOUR_KEY = 'smartagro_tour_done';
  if (localStorage.getItem(TOUR_KEY) === '1') return; // already done

  const TOUR_STEPS = [
    {
      icon: 'fa-th-large',
      color: '#4ade80',
      title: 'Welcome to SmartAgro! 🌾',
      desc: 'Your AI-powered farming companion. This quick tour will show you all the key features so you can get the most out of the app.',
      hint: '',
    },
    {
      icon: 'fa-cloud-sun',
      color: '#60a5fa',
      title: 'Dashboard — Your Farming HQ',
      desc: 'The <b>Dashboard</b> shows real-time weather, 7-day forecast, AI crop recommendations, satellite vegetation health, and quick actions — all based on your location.',
      hint: '📍 Tap "Get My Location" on the Dashboard to personalise everything.',
    },
    {
      icon: 'fa-microscope',
      color: '#34d399',
      title: 'Diagnose Crop Disease',
      desc: 'Go to <b>Diagnose Crop</b> and upload or take a photo of your affected plant. Our AI instantly identifies the disease and suggests eco-friendly and chemical remedies.',
      hint: '📸 Works best with a close-up photo in natural daylight.',
    },
    {
      icon: 'fa-chart-line',
      color: '#f59e0b',
      title: 'Market Prices — Live Mandi Rates',
      desc: 'The <b>Market Prices</b> page shows live mandi rates from across India, so you always know the best time and place to sell your produce.',
      hint: '🔍 Use the search bar to find your city or commodity instantly.',
    },
    {
      icon: 'fa-bell',
      color: '#f87171',
      title: 'Alerts — Weather and Pest Warnings',
      desc: '<b>Alerts</b> gives you real-time weather risk warnings, pest outbreak advisories, and a detailed 7-day agricultural forecast for your region.',
      hint: '🔔 Enable device notifications for alerts even when the app is closed.',
    },
    {
      icon: 'fa-microphone',
      color: '#a78bfa',
      title: 'Kisan Helper — Your AI Assistant',
      desc: 'Tap the <b>green mic button</b> at the bottom-right corner on any page to open the Kisan Helper chatbot. Ask farming questions in any of 23 Indian languages by voice or text!',
      hint: '💬 Ask: "My crop was diagnosed — what remedy should I use?"',
    },
    {
      icon: 'fa-phone',
      color: '#22d3ee',
      title: 'Kisan Helpline — Expert Support',
      desc: 'Need to speak to a real expert? Tap the <b>green phone button</b> at the bottom-left corner to call the toll-free Kisan Helpline: <b>1800-180-1551</b>.',
      hint: '☎️ Free expert advice on crops, loans, and government schemes.',
    },
  ];

  let currentStep = 0;

  /* -- Inject styles -------------------------------------------------------- */
  const style = document.createElement('style');
  style.textContent = `
  .agrotour-overlay {
    position: fixed; inset: 0; z-index: 19999;
    background: rgba(5, 12, 7, 0.78);
    backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
    opacity: 0; transition: opacity 0.3s ease;
    pointer-events: none;
  }
  .agrotour-overlay.visible { opacity: 1; pointer-events: all; }
  .agrotour-card {
    background: linear-gradient(145deg, #0e1f11, #0a1a0c);
    border: 1px solid rgba(74,222,128,0.28);
    border-radius: 22px;
    padding: 32px 28px 24px;
    max-width: 400px; width: 100%;
    box-shadow: 0 24px 64px rgba(0,0,0,0.55), 0 0 48px rgba(74,222,128,0.07);
    animation: tourCardIn 0.38s cubic-bezier(0.34,1.56,0.64,1);
  }
  @keyframes tourCardIn {
    from { transform: scale(0.88) translateY(28px); opacity: 0; }
    to   { transform: scale(1) translateY(0);        opacity: 1; }
  }
  .agrotour-icon-wrap {
    width: 68px; height: 68px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 16px; font-size: 1.65rem;
    transition: transform 0.2s;
  }
  .agrotour-step-dots {
    display: flex; justify-content: center; gap: 6px; margin-bottom: 20px;
  }
  .agrotour-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: rgba(74,222,128,0.18); transition: all 0.3s ease;
  }
  .agrotour-dot.active {
    background: #4ade80; width: 22px; border-radius: 4px;
  }
  .agrotour-title {
    font-family: 'Syne', sans-serif;
    font-weight: 700; font-size: 1.08rem;
    color: #f0f4f0; text-align: center; margin-bottom: 12px;
  }
  .agrotour-desc {
    font-size: 0.845rem; line-height: 1.75; color: #a7c4a8;
    text-align: center; margin-bottom: 14px;
  }
  .agrotour-desc b { color: #e8f5e9; }
  .agrotour-hint {
    background: rgba(74,222,128,0.07);
    border: 1px solid rgba(74,222,128,0.18);
    border-radius: 10px; padding: 9px 14px;
    font-size: 0.78rem; color: #86c994;
    text-align: center; margin-bottom: 22px; line-height: 1.55;
  }
  .agrotour-actions {
    display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;
  }
  .agrotour-btn-next {
    background: linear-gradient(135deg, #15803d, #22c55e);
    color: #fff; border: none; border-radius: 12px;
    padding: 12px 28px; font-size: 0.88rem; font-weight: 600;
    cursor: pointer; transition: transform 0.18s, box-shadow 0.18s;
    box-shadow: 0 4px 18px rgba(74,222,128,0.3); font-family: inherit;
    -webkit-tap-highlight-color: transparent;
  }
  .agrotour-btn-next:active { transform: scale(0.96); }
  .agrotour-btn-skip {
    background: rgba(255,255,255,0.05); color: #6b8c6c;
    border: 1px solid rgba(74,222,128,0.15); border-radius: 12px;
    padding: 12px 18px; font-size: 0.82rem;
    cursor: pointer; transition: background 0.18s, color 0.18s;
    font-family: inherit; -webkit-tap-highlight-color: transparent;
  }
  .agrotour-btn-skip:hover { background: rgba(248,113,113,0.1); color: #f87171; }
  .agrotour-progress {
    font-size: 0.68rem; color: #4b6e50; text-align: center;
    margin-top: 14px; letter-spacing: 0.05em;
  }
  @media (max-width: 440px) {
    .agrotour-card { padding: 24px 18px 18px; }
    .agrotour-title { font-size: 1rem; }
  }`;
  document.head.appendChild(style);

  /* -- Build overlay -------------------------------------------------------- */
  function buildOverlay() {
    let overlay = document.getElementById('agrotourOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'agrotourOverlay';
      overlay.className = 'agrotour-overlay';
      document.body.appendChild(overlay);
    }
    return overlay;
  }

  function renderStep(n) {
    const step = TOUR_STEPS[n];
    const isLast = n === TOUR_STEPS.length - 1;
    const overlay = buildOverlay();

    const dots = TOUR_STEPS.map((_, i) =>
      `<div class="agrotour-dot ${i === n ? 'active' : ''}"></div>`
    ).join('');

    overlay.innerHTML = `
      <div class="agrotour-card">
        <div class="agrotour-icon-wrap" style="background:${step.color}1a;border:1.5px solid ${step.color}44;">
          <i class="fas ${step.icon}" style="color:${step.color}"></i>
        </div>
        <div class="agrotour-step-dots">${dots}</div>
        <div class="agrotour-title">${step.title}</div>
        <div class="agrotour-desc">${step.desc}</div>
        ${step.hint ? `<div class="agrotour-hint">${step.hint}</div>` : '<div style="height:8px"></div>'}
        <div class="agrotour-actions">
          <button class="agrotour-btn-next" id="agrotourNext">
            ${isLast ? '🌾 Get Started!' : 'Next &nbsp;<i class="fas fa-arrow-right" style="font-size:.8rem"></i>'}
          </button>
          ${!isLast ? `<button class="agrotour-btn-skip" id="agrotourSkip">Skip Tour</button>` : ''}
        </div>
        <div class="agrotour-progress">Step ${n + 1} of ${TOUR_STEPS.length}</div>
      </div>`;

    requestAnimationFrame(() => overlay.classList.add('visible'));

    document.getElementById('agrotourNext').addEventListener('click', () => {
      if (isLast) { endTour(); } else { goToStep(n + 1); }
    });
    const skipBtn = document.getElementById('agrotourSkip');
    if (skipBtn) skipBtn.addEventListener('click', endTour);
  }

  function goToStep(n) {
    currentStep = n;
    const overlay = document.getElementById('agrotourOverlay');
    if (overlay) {
      overlay.classList.remove('visible');
      setTimeout(() => renderStep(n), 200);
    }
  }

  function endTour() {
    localStorage.setItem(TOUR_KEY, '1');
    const overlay = document.getElementById('agrotourOverlay');
    if (overlay) {
      overlay.classList.remove('visible');
      setTimeout(() => overlay.remove(), 300);
    }
  }

  /* -- Start tour after short delay (let page paint first) ----------------- */
  function startTour() { setTimeout(() => renderStep(0), 1500); }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startTour);
  } else {
    startTour();
  }
})();
