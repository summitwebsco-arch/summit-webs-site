(function () {
  'use strict';

  const canvas = document.getElementById('showcase3d');
  if (!canvas || typeof THREE === 'undefined') return;

  // ─── Renderer ───────────────────────────────────────────────────────────────
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  function resize() {
    const w = canvas.offsetWidth  || 920;
    const h = canvas.offsetHeight || 518;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  // ─── Scene ──────────────────────────────────────────────────────────────────
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000a16, 0.010);

  // ─── Camera ─────────────────────────────────────────────────────────────────
  const camera = new THREE.PerspectiveCamera(50, 16 / 9, 0.05, 300);
  camera.position.set(0, 2.0, 10);

  // ─── Lighting ───────────────────────────────────────────────────────────────
  scene.add(new THREE.AmbientLight(0x08111e, 3));

  const greenLight  = new THREE.PointLight(0x2d7a52, 14, 24);
  greenLight.position.set(-4, 4, 4);
  scene.add(greenLight);

  const orangeLight = new THREE.PointLight(0xf2a93b, 9, 20);
  orangeLight.position.set(5, -2, 3);
  scene.add(orangeLight);

  const screenGlow  = new THREE.PointLight(0x1a6090, 5, 10);
  screenGlow.position.set(1.0, 0.8, 2);
  scene.add(screenGlow);

  // ─── Utility ────────────────────────────────────────────────────────────────
  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function lerp(a, b, t)    { return a + (b - a) * t; }

  // ─── Desktop canvas ──────────────────────────────────────────────────────────
  const DW = 1200, DH = 750;
  const deskCanvas = document.createElement('canvas');
  deskCanvas.width = DW; deskCanvas.height = DH;
  const dc = deskCanvas.getContext('2d');
  const desktopTex = new THREE.CanvasTexture(deskCanvas);

  function drawDesktop(scrollFrac) {
    const scy = Math.sin(scrollFrac * Math.PI * 2) * 22;

    dc.fillStyle = '#07111e';
    dc.fillRect(0, 0, DW, DH);

    // NAV
    dc.fillStyle = 'rgba(6,13,24,0.97)';
    dc.fillRect(0, 0, DW, 60);
    dc.strokeStyle = 'rgba(45,122,82,0.22)'; dc.lineWidth = 1;
    dc.beginPath(); dc.moveTo(0, 60); dc.lineTo(DW, 60); dc.stroke();

    dc.fillStyle = '#2d7a52';
    rr(dc, 32, 14, 32, 32, 7); dc.fill();
    dc.fillStyle = 'rgba(255,255,255,0.9)';
    dc.beginPath(); dc.moveTo(48, 19); dc.lineTo(57, 36); dc.lineTo(39, 36); dc.closePath(); dc.fill();
    dc.fillStyle = '#fff'; dc.font = 'bold 13px sans-serif'; dc.textAlign = 'left';
    dc.fillText('Green Lines Landscaping', 74, 34);

    dc.fillStyle = 'rgba(255,255,255,0.5)'; dc.font = '11px sans-serif';
    ['Home', 'Services', 'Gallery', 'About', 'Contact'].forEach((t, i) => dc.fillText(t, 370 + i * 96, 34));

    dc.fillStyle = '#2d7a52'; rr(dc, 1018, 16, 154, 28, 14); dc.fill();
    dc.fillStyle = '#fff'; dc.font = 'bold 11px sans-serif'; dc.textAlign = 'center';
    dc.fillText('Free Estimate', 1095, 33);

    // HERO BG
    const hTop = 60;
    const hbg = dc.createLinearGradient(0, hTop, 0, hTop + 320);
    hbg.addColorStop(0, '#0c1f32'); hbg.addColorStop(1, '#07111e');
    dc.fillStyle = hbg; dc.fillRect(0, hTop, DW, 320);

    // Hero left — text (parallax: shifts by scy * 0.12)
    const tx = 60, ty = hTop + scy * 0.12;

    dc.fillStyle = 'rgba(45,122,82,0.16)';
    rr(dc, tx, ty + 32, 244, 24, 12); dc.fill();
    dc.strokeStyle = 'rgba(45,122,82,0.42)'; dc.lineWidth = 1;
    rr(dc, tx, ty + 32, 244, 24, 12); dc.stroke();
    dc.fillStyle = '#4caf7e';
    dc.beginPath(); dc.arc(tx + 14, ty + 44, 4, 0, Math.PI * 2); dc.fill();
    dc.fillStyle = '#4caf7e'; dc.font = 'bold 9px sans-serif'; dc.textAlign = 'left';
    dc.fillText("NE OHIO'S TRUSTED LANDSCAPER", tx + 26, ty + 48);

    dc.fillStyle = '#fff'; dc.font = 'bold 44px sans-serif'; dc.textAlign = 'left';
    dc.fillText('Professional', tx, ty + 118);
    dc.fillStyle = '#2d7a52'; dc.font = 'bold 44px sans-serif';
    dc.fillText('Lawn Care.', tx, ty + 168);

    dc.fillStyle = 'rgba(255,255,255,0.48)'; dc.font = '12.5px sans-serif';
    dc.fillText('Licensed & insured · Free estimates · Serving Akron & Cleveland', tx, ty + 198);

    dc.fillStyle = '#2d7a52'; rr(dc, tx, ty + 220, 196, 42, 10); dc.fill();
    const bGlow = dc.createRadialGradient(tx + 98, ty + 241, 0, tx + 98, ty + 241, 80);
    bGlow.addColorStop(0, 'rgba(45,122,82,0.3)'); bGlow.addColorStop(1, 'transparent');
    dc.fillStyle = bGlow; dc.fillRect(tx - 30, ty + 200, 260, 80);
    dc.fillStyle = '#fff'; dc.font = 'bold 12px sans-serif'; dc.textAlign = 'center';
    dc.fillText('Get Free Estimate', tx + 98, ty + 244);

    dc.strokeStyle = 'rgba(255,255,255,0.22)'; dc.lineWidth = 1.5;
    rr(dc, tx + 210, ty + 220, 148, 42, 10); dc.stroke();
    dc.fillStyle = 'rgba(255,255,255,0.62)'; dc.font = '12px sans-serif'; dc.textAlign = 'center';
    dc.fillText('See Our Work →', tx + 284, ty + 244);

    dc.fillStyle = '#f2a93b'; dc.font = '12px sans-serif'; dc.textAlign = 'left';
    dc.fillText('★★★★★', tx, ty + 284);
    dc.fillStyle = 'rgba(255,255,255,0.42)'; dc.font = '10.5px sans-serif';
    dc.fillText('5.0 · 47 Google Reviews · Northeast Ohio', tx + 84, ty + 284);

    // Hero right — simulated lawn photo card (parallax: shifts by scy * 0.08)
    const cX = 650, cY = hTop + 18 + scy * 0.08, cW = 506, cH = 272;
    dc.fillStyle = 'rgba(0,0,0,0.38)';
    rr(dc, cX + 7, cY + 9, cW, cH, 12); dc.fill();

    const lawnG = dc.createLinearGradient(cX, cY, cX + cW, cY + cH);
    lawnG.addColorStop(0, '#193c19'); lawnG.addColorStop(0.4, '#285a26');
    lawnG.addColorStop(0.7, '#1d4a1c'); lawnG.addColorStop(1, '#0e2710');
    dc.fillStyle = lawnG; rr(dc, cX, cY, cW, cH, 12); dc.fill();

    for (let s = 0; s < 12; s++) {
      dc.fillStyle = s % 2 === 0 ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)';
      dc.fillRect(cX, cY + s * (cH / 12), cW, cH / 12);
    }
    dc.strokeStyle = 'rgba(45,122,82,0.38)'; dc.lineWidth = 1.5;
    rr(dc, cX, cY, cW, cH, 12); dc.stroke();

    // Review overlay
    dc.fillStyle = 'rgba(4,11,20,0.93)';
    rr(dc, cX + 18, cY + cH - 72, 234, 58, 8); dc.fill();
    dc.strokeStyle = 'rgba(45,122,82,0.38)'; dc.lineWidth = 1;
    rr(dc, cX + 18, cY + cH - 72, 234, 58, 8); dc.stroke();
    dc.fillStyle = '#f2a93b'; dc.font = '12px sans-serif'; dc.textAlign = 'left';
    dc.fillText('★★★★★', cX + 34, cY + cH - 48);
    dc.fillStyle = '#fff'; dc.font = 'bold 10.5px sans-serif';
    dc.fillText('"Best lawn care in Akron!"', cX + 34, cY + cH - 31);
    dc.fillStyle = 'rgba(255,255,255,0.38)'; dc.font = '9px sans-serif';
    dc.fillText('— Mike T. · Google Review', cX + 34, cY + cH - 17);

    // Stats chip top-right of card
    dc.fillStyle = 'rgba(4,11,20,0.96)';
    rr(dc, cX + cW - 152, cY - 20, 148, 42, 8); dc.fill();
    dc.strokeStyle = 'rgba(45,122,82,0.5)'; dc.lineWidth = 1;
    rr(dc, cX + cW - 152, cY - 20, 148, 42, 8); dc.stroke();
    dc.fillStyle = '#4caf7e';
    dc.beginPath(); dc.arc(cX + cW - 140, cY - 4, 4, 0, Math.PI * 2); dc.fill();
    dc.fillStyle = '#4caf7e'; dc.font = 'bold 9px sans-serif'; dc.textAlign = 'left';
    dc.fillText('↑ 340% more calls', cX + cW - 130, cY);
    dc.fillStyle = 'rgba(255,255,255,0.38)'; dc.font = '8px sans-serif';
    dc.fillText('after site launch', cX + cW - 130, cY + 14);

    // STATS BAR (fixed at y=380)
    const stY = 380;
    dc.fillStyle = '#050e1c'; dc.fillRect(0, stY, DW, 60);
    dc.strokeStyle = 'rgba(45,122,82,0.14)'; dc.lineWidth = 1;
    dc.beginPath(); dc.moveTo(0, stY); dc.lineTo(DW, stY); dc.stroke();
    dc.beginPath(); dc.moveTo(0, stY + 60); dc.lineTo(DW, stY + 60); dc.stroke();

    [['15+', 'Years Experience'], ['2,400+', 'Clients Served'], ['★ 5.0', 'Google Rating'], ['Same-Wk', 'Scheduling']].forEach(([v, l], i) => {
      const sx = 150 + i * 226;
      if (i > 0) {
        dc.strokeStyle = 'rgba(255,255,255,0.07)'; dc.lineWidth = 1;
        dc.beginPath(); dc.moveTo(sx - 24, stY + 14); dc.lineTo(sx - 24, stY + 46); dc.stroke();
      }
      dc.fillStyle = '#2d7a52'; dc.font = 'bold 21px sans-serif'; dc.textAlign = 'center';
      dc.fillText(v, sx, stY + 32);
      dc.fillStyle = 'rgba(255,255,255,0.36)'; dc.font = '9.5px sans-serif';
      dc.fillText(l, sx, stY + 48);
    });

    // SERVICES SECTION (fixed at y=440)
    const svY = 440;
    dc.fillStyle = '#07111e'; dc.fillRect(0, svY, DW, DH - svY);

    dc.fillStyle = 'rgba(255,255,255,0.48)'; dc.font = '10px sans-serif'; dc.textAlign = 'center';
    dc.fillText('OUR SERVICES', DW / 2, svY + 24);
    dc.fillStyle = '#fff'; dc.font = 'bold 23px sans-serif'; dc.textAlign = 'center';
    dc.fillText('Everything Your Property Needs', DW / 2, svY + 54);

    const sCards = [
      { col: '#2d7a52', icon: '🌿', title: 'Lawn Care',    sub: 'Weekly & bi-weekly mowing',  feats: ['Edging & trimming', 'Aeration & seeding', 'Fertilization plans'] },
      { col: '#f2a93b', icon: '🌳', title: 'Tree Service', sub: 'Removal, trimming & stump',  feats: ['Safe tree removal', 'Crown shaping', 'Emergency service'] },
      { col: '#4488dd', icon: '❄️',  title: 'Snow Removal',sub: 'Commercial & residential',   feats: ['24/7 on-call', 'De-icing treatment', 'Monthly contracts'] },
    ];
    const cBaseY = svY + 74, cW2 = 342, cH2 = 194;
    sCards.forEach(({ col, icon, title, sub, feats }, i) => {
      const cX2 = 60 + i * (cW2 + 28);
      dc.fillStyle = 'rgba(0,0,0,0.28)';
      rr(dc, cX2 + 4, cBaseY + 4, cW2, cH2, 12); dc.fill();

      const cbg = dc.createLinearGradient(cX2, cBaseY, cX2, cBaseY + cH2);
      cbg.addColorStop(0, '#0e2034'); cbg.addColorStop(1, '#091828');
      dc.fillStyle = cbg; rr(dc, cX2, cBaseY, cW2, cH2, 12); dc.fill();
      dc.strokeStyle = col + '38'; dc.lineWidth = 1;
      rr(dc, cX2, cBaseY, cW2, cH2, 12); dc.stroke();

      dc.fillStyle = col;
      dc.beginPath(); dc.moveTo(cX2 + 12, cBaseY); dc.lineTo(cX2 + cW2 - 12, cBaseY);
      dc.quadraticCurveTo(cX2 + cW2, cBaseY, cX2 + cW2, cBaseY + 4);
      dc.lineTo(cX2, cBaseY + 4);
      dc.quadraticCurveTo(cX2, cBaseY, cX2 + 12, cBaseY); dc.fill();

      dc.fillStyle = col + '1e';
      dc.beginPath(); dc.arc(cX2 + 34, cBaseY + 50, 19, 0, Math.PI * 2); dc.fill();
      dc.font = '17px sans-serif'; dc.textAlign = 'center';
      dc.fillText(icon, cX2 + 34, cBaseY + 57);

      dc.fillStyle = '#fff'; dc.font = 'bold 13.5px sans-serif'; dc.textAlign = 'left';
      dc.fillText(title, cX2 + 66, cBaseY + 44);
      dc.fillStyle = 'rgba(255,255,255,0.4)'; dc.font = '10px sans-serif';
      dc.fillText(sub, cX2 + 66, cBaseY + 61);

      dc.strokeStyle = 'rgba(255,255,255,0.07)'; dc.lineWidth = 1;
      dc.beginPath(); dc.moveTo(cX2 + 18, cBaseY + 78); dc.lineTo(cX2 + cW2 - 18, cBaseY + 78); dc.stroke();

      feats.forEach((f, j) => {
        const fy = cBaseY + 98 + j * 22;
        dc.fillStyle = col; dc.font = 'bold 10px sans-serif'; dc.textAlign = 'left';
        dc.fillText('✓', cX2 + 20, fy);
        dc.fillStyle = 'rgba(255,255,255,0.56)'; dc.font = '10px sans-serif';
        dc.fillText(f, cX2 + 36, fy);
      });

      dc.fillStyle = col + 'cc'; dc.font = 'bold 10px sans-serif'; dc.textAlign = 'right';
      dc.fillText('Learn More →', cX2 + cW2 - 16, cBaseY + cH2 - 12);
    });

    // Scanlines
    for (let y = 0; y < DH; y += 4) {
      dc.fillStyle = 'rgba(0,0,0,0.022)'; dc.fillRect(0, y, DW, 2);
    }

    desktopTex.needsUpdate = true;
  }

  // ─── Mobile canvas ───────────────────────────────────────────────────────────
  const MW = 480, MH = 1032;
  const mobileCanvas = document.createElement('canvas');
  mobileCanvas.width = MW; mobileCanvas.height = MH;
  const mc = mobileCanvas.getContext('2d');
  const mobileTex = new THREE.CanvasTexture(mobileCanvas);

  function drawMobile(scrollFrac) {
    const scy = Math.sin(scrollFrac * Math.PI * 2 + 1.2) * 16;

    mc.fillStyle = '#07111e';
    mc.fillRect(0, 0, MW, MH);

    // NAV
    mc.fillStyle = 'rgba(6,13,24,0.97)';
    mc.fillRect(0, 0, MW, 50);
    mc.strokeStyle = 'rgba(45,122,82,0.2)'; mc.lineWidth = 1;
    mc.beginPath(); mc.moveTo(0, 50); mc.lineTo(MW, 50); mc.stroke();

    mc.fillStyle = '#2d7a52'; rr(mc, 18, 12, 26, 26, 6); mc.fill();
    mc.fillStyle = '#fff'; mc.font = 'bold 11px sans-serif'; mc.textAlign = 'left';
    mc.fillText('Green Lines', 52, 28);

    mc.strokeStyle = 'rgba(255,255,255,0.55)'; mc.lineWidth = 2;
    [12, 20, 28].forEach(dy => {
      mc.beginPath(); mc.moveTo(MW - 40, dy); mc.lineTo(MW - 16, dy); mc.stroke();
    });

    // HERO
    const hTop = 50 + scy * 0.1;
    const mhg = mc.createLinearGradient(0, hTop, 0, hTop + 360);
    mhg.addColorStop(0, '#0c1f32'); mhg.addColorStop(1, '#07111e');
    mc.fillStyle = mhg; mc.fillRect(0, hTop, MW, 360);

    mc.fillStyle = 'rgba(45,122,82,0.18)';
    rr(mc, MW / 2 - 116, hTop + 26, 232, 22, 11); mc.fill();
    mc.strokeStyle = 'rgba(45,122,82,0.5)'; mc.lineWidth = 1;
    rr(mc, MW / 2 - 116, hTop + 26, 232, 22, 11); mc.stroke();
    mc.fillStyle = '#4caf7e'; mc.font = 'bold 8px sans-serif'; mc.textAlign = 'center';
    mc.fillText("NE OHIO'S TRUSTED LANDSCAPER", MW / 2, hTop + 40);

    mc.fillStyle = '#fff'; mc.font = 'bold 34px sans-serif'; mc.textAlign = 'center';
    mc.fillText('Professional', MW / 2, hTop + 108);
    mc.fillStyle = '#2d7a52'; mc.font = 'bold 34px sans-serif';
    mc.fillText('Lawn Care.', MW / 2, hTop + 148);

    mc.fillStyle = 'rgba(255,255,255,0.44)'; mc.font = '11px sans-serif'; mc.textAlign = 'center';
    mc.fillText('Serving Akron & Cleveland area', MW / 2, hTop + 178);
    mc.fillText('Licensed & insured · Free estimates', MW / 2, hTop + 196);

    mc.fillStyle = '#2d7a52'; rr(mc, MW / 2 - 108, hTop + 216, 216, 40, 20); mc.fill();
    mc.fillStyle = '#fff'; mc.font = 'bold 12px sans-serif'; mc.textAlign = 'center';
    mc.fillText('Get Free Estimate', MW / 2, hTop + 239);

    mc.fillStyle = '#f2a93b'; mc.font = '11px sans-serif'; mc.textAlign = 'center';
    mc.fillText('★★★★★', MW / 2, hTop + 278);
    mc.fillStyle = 'rgba(255,255,255,0.42)'; mc.font = '9.5px sans-serif';
    mc.fillText('5.0 · 47 Google Reviews', MW / 2, hTop + 294);

    // Lawn strip
    const lgrd = mc.createLinearGradient(0, hTop + 310, MW, hTop + 360);
    lgrd.addColorStop(0, '#1a3c1a'); lgrd.addColorStop(0.5, '#285a26'); lgrd.addColorStop(1, '#1d4a1c');
    mc.fillStyle = lgrd; mc.fillRect(0, hTop + 310, MW, 50);
    for (let s = 0; s < 8; s++) {
      mc.fillStyle = s % 2 === 0 ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)';
      mc.fillRect(s * (MW / 8), hTop + 310, MW / 8, 50);
    }

    // STATS 2×2
    const stTop = hTop + 360;
    mc.fillStyle = '#050e1c'; mc.fillRect(0, stTop, MW, 120);

    const s2 = [['15+', 'Years Exp.'], ['2,400+', 'Clients'], ['★ 5.0', 'Google Rating'], ['Same-Wk', 'Scheduling']];
    s2.forEach(([v, l], i) => {
      const col = i % 2, row = Math.floor(i / 2);
      const sx = col === 0 ? MW / 4 : MW * 3 / 4;
      const sy = stTop + (row === 0 ? 32 : 86);
      mc.fillStyle = '#2d7a52'; mc.font = 'bold 18px sans-serif'; mc.textAlign = 'center';
      mc.fillText(v, sx, sy);
      mc.fillStyle = 'rgba(255,255,255,0.36)'; mc.font = '8px sans-serif';
      mc.fillText(l, sx, sy + 14);
    });
    mc.strokeStyle = 'rgba(255,255,255,0.08)'; mc.lineWidth = 1;
    mc.beginPath(); mc.moveTo(20, stTop + 60); mc.lineTo(MW - 20, stTop + 60); mc.stroke();
    mc.beginPath(); mc.moveTo(MW / 2, stTop + 8); mc.lineTo(MW / 2, stTop + 112); mc.stroke();

    // SERVICE CARDS (stacked)
    const mCards = [
      { col: '#2d7a52', icon: '🌿', title: 'Lawn Care',        sub: 'Weekly & bi-weekly mowing',  feats: ['Edging & trimming', 'Aeration & fertilization'] },
      { col: '#f2a93b', icon: '🌳', title: 'Tree Service',     sub: 'Removal, trimming & stump',  feats: ['Safe tree removal', 'Crown shaping & care'] },
      { col: '#4488dd', icon: '❄️',  title: 'Snow Removal',    sub: 'Commercial & residential',   feats: ['24/7 on-call service', 'De-icing treatment'] },
      { col: '#9b59d0', icon: '🏡', title: 'Landscape Design', sub: 'Custom property planning',   feats: ['3D design preview', 'Plant selection & install'] },
    ];
    const mCardTop = stTop + 128, mCH = 98;
    mCards.forEach(({ col, icon, title, sub, feats }, i) => {
      const cY = mCardTop + i * (mCH + 8);

      mc.fillStyle = 'rgba(0,0,0,0.24)';
      rr(mc, 18, cY + 3, MW - 36, mCH, 10); mc.fill();

      const cbg = mc.createLinearGradient(18, cY, 18, cY + mCH);
      cbg.addColorStop(0, '#0e2034'); cbg.addColorStop(1, '#091828');
      mc.fillStyle = cbg; rr(mc, 18, cY, MW - 36, mCH, 10); mc.fill();
      mc.strokeStyle = col + '38'; mc.lineWidth = 1;
      rr(mc, 18, cY, MW - 36, mCH, 10); mc.stroke();

      mc.fillStyle = col; mc.fillRect(18, cY, MW - 36, 3);

      mc.fillStyle = col + '1e';
      mc.beginPath(); mc.arc(50, cY + 38, 16, 0, Math.PI * 2); mc.fill();
      mc.font = '13px sans-serif'; mc.textAlign = 'center';
      mc.fillText(icon, 50, cY + 43);

      mc.fillStyle = '#fff'; mc.font = 'bold 12.5px sans-serif'; mc.textAlign = 'left';
      mc.fillText(title, 78, cY + 31);
      mc.fillStyle = 'rgba(255,255,255,0.38)'; mc.font = '9.5px sans-serif';
      mc.fillText(sub, 78, cY + 46);

      mc.strokeStyle = 'rgba(255,255,255,0.07)'; mc.lineWidth = 1;
      mc.beginPath(); mc.moveTo(18, cY + 58); mc.lineTo(MW - 18, cY + 58); mc.stroke();

      feats.forEach((f, j) => {
        const fx = j === 0 ? 28 : MW / 2 + 8;
        mc.fillStyle = col; mc.font = 'bold 8.5px sans-serif'; mc.textAlign = 'left';
        mc.fillText('✓', fx, cY + 76);
        mc.fillStyle = 'rgba(255,255,255,0.54)'; mc.font = '8.5px sans-serif';
        mc.fillText(f, fx + 12, cY + 76);
      });

      mc.fillStyle = col + 'cc'; mc.font = 'bold 9px sans-serif'; mc.textAlign = 'right';
      mc.fillText('Learn More →', MW - 26, cY + mCH - 10);
    });

    mobileTex.needsUpdate = true;
  }

  // ─── MacBook ─────────────────────────────────────────────────────────────────
  const alumMat = new THREE.MeshStandardMaterial({ color: 0x1c2530, roughness: 0.18, metalness: 0.96 });
  const macGroup = new THREE.Group();

  // Keyboard base
  const macBase = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.12, 3.8), alumMat);
  macGroup.add(macBase);

  // Lid group — pivot at hinge (back edge of base)
  const lidGroup = new THREE.Group();
  lidGroup.position.set(0, 0.06, -1.9);
  lidGroup.rotation.x = 0.25;  // display faces viewer and slightly down (natural MacBook angle)

  const lidPanel = new THREE.Mesh(new THREE.BoxGeometry(5.6, 3.6, 0.06), alumMat);
  lidPanel.position.set(0, 1.8, 0);
  lidGroup.add(lidPanel);

  const bezelMat = new THREE.MeshStandardMaterial({ color: 0x070d16, roughness: 0.5, metalness: 0.3 });
  const bezel = new THREE.Mesh(new THREE.BoxGeometry(5.5, 3.5, 0.004), bezelMat);
  bezel.position.set(0, 1.8, 0.032);
  lidGroup.add(bezel);

  const displayMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(5.18, 3.24),
    new THREE.MeshBasicMaterial({ map: desktopTex })
  );
  displayMesh.position.set(0, 1.8, 0.035);
  lidGroup.add(displayMesh);

  macGroup.add(lidGroup);
  macGroup.position.set(-1.4, -0.8, 0.6);
  macGroup.rotation.y = 0.22;
  scene.add(macGroup);

  // ─── iPhone ──────────────────────────────────────────────────────────────────
  const phoneMat = new THREE.MeshStandardMaterial({ color: 0x1a2535, roughness: 0.08, metalness: 0.98 });
  const phoneGroup = new THREE.Group();

  const phoneBody = new THREE.Mesh(new THREE.BoxGeometry(1.42, 2.92, 0.09), phoneMat);
  phoneGroup.add(phoneBody);

  const phoneDisplay = new THREE.Mesh(
    new THREE.PlaneGeometry(1.24, 2.66),
    new THREE.MeshBasicMaterial({ map: mobileTex })
  );
  phoneDisplay.position.z = 0.048;
  phoneGroup.add(phoneDisplay);

  phoneGroup.add(new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(1.42, 2.92, 0.09)),
    new THREE.LineBasicMaterial({ color: 0x2d4a6a })
  ));

  const homeIndicator = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 0.025, 0.001),
    new THREE.MeshBasicMaterial({ color: 0x445566 })
  );
  homeIndicator.position.set(0, -1.24, 0.049);
  phoneGroup.add(homeIndicator);

  phoneGroup.position.set(3.8, 0.5, 0.3);
  phoneGroup.rotation.y = -0.38;
  phoneGroup.rotation.x = -0.06;
  scene.add(phoneGroup);

  // ─── Nebula skybox ───────────────────────────────────────────────────────────
  (function () {
    const c = document.createElement('canvas');
    c.width = 2048; c.height = 1024;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#000810'; ctx.fillRect(0, 0, 2048, 1024);
    [
      [320,  460, 680, '45,122,82',  0.42],
      [140,  200, 320, '28,105,60',  0.24],
      [1740, 600, 500, '200,120,30', 0.24],
      [1060, 140, 540, '18,50,155',  0.20],
      [580,  780, 360, '12,88,118',  0.18],
      [1380, 320, 260, '100,35,170', 0.14],
    ].forEach(([cx, cy, r, rgb, a0]) => {
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      grd.addColorStop(0,   `rgba(${rgb},${a0})`);
      grd.addColorStop(0.5, `rgba(${rgb},${+(a0 * 0.2).toFixed(2)})`);
      grd.addColorStop(1,   'transparent');
      ctx.fillStyle = grd; ctx.fillRect(0, 0, 2048, 1024);
    });
    for (let i = 0; i < 700; i++) {
      const sx = Math.random() * 2048, sy = Math.random() * 1024;
      const sr = Math.random() < 0.06 ? Math.random() * 2 + 1.2 : Math.random() + 0.3;
      ctx.fillStyle = `rgba(255,255,255,${(0.5 + Math.random() * 0.5).toFixed(2)})`;
      ctx.beginPath(); ctx.arc(sx, sy, sr, 0, Math.PI * 2); ctx.fill();
    }
    scene.add(new THREE.Mesh(
      new THREE.SphereGeometry(140, 48, 24),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), side: THREE.BackSide })
    ));
  })();

  // ─── Star field (4 layers) ───────────────────────────────────────────────────
  (function () {
    function addLayer(count, spread, size, color, opacity) {
      const pos = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi   = Math.acos(2 * Math.random() - 1);
        const r = spread * (0.5 + Math.random() * 0.5);
        pos[i*3]   = r * Math.sin(phi) * Math.cos(theta);
        pos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
        pos[i*3+2] = r * Math.cos(phi);
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      scene.add(new THREE.Points(geo, new THREE.PointsMaterial({
        color, size, sizeAttenuation: true, transparent: true, opacity, depthWrite: false
      })));
    }
    addLayer(3500, 75, 0.07, 0xb0ccc0, 0.55);
    addLayer(1000, 65, 0.13, 0xffffff, 0.80);
    addLayer(220,  55, 0.26, 0xfdf0e0, 0.95);
    addLayer(350,  60, 0.10, 0xf2a93b, 0.45);
  })();

  // ─── Nebula dust planes ──────────────────────────────────────────────────────
  function makeNebulaDust(x, y, z, size, r, g, b, alpha) {
    const c = document.createElement('canvas');
    c.width = 256; c.height = 256;
    const ctx = c.getContext('2d');
    const grd = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    grd.addColorStop(0,    `rgba(${r},${g},${b},${alpha})`);
    grd.addColorStop(0.45, `rgba(${r},${g},${b},${+(alpha * 0.2).toFixed(2)})`);
    grd.addColorStop(1,    'transparent');
    ctx.fillStyle = grd; ctx.fillRect(0, 0, 256, 256);
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(size, size),
      new THREE.MeshBasicMaterial({
        map: new THREE.CanvasTexture(c), transparent: true,
        side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending
      })
    );
    mesh.position.set(x, y, z);
    scene.add(mesh);
    return mesh;
  }
  const dustMeshes = [
    makeNebulaDust(-9,  2, -18, 22, 45,  122, 82,  0.28),
    makeNebulaDust(11, -1, -22, 20, 200, 130, 40,  0.22),
    makeNebulaDust( 1,  6, -28, 26, 18,  50,  155, 0.22),
    makeNebulaDust(-5, -4, -16, 14, 15,  90,  120, 0.18),
    makeNebulaDust( 7,  3, -12, 10, 110, 35,  175, 0.16),
  ];

  // ─── Glowing platform ring ────────────────────────────────────────────────────
  (function () {
    const c = document.createElement('canvas');
    c.width = 512; c.height = 512;
    const ctx = c.getContext('2d');
    const grd = ctx.createRadialGradient(256, 256, 80, 256, 256, 256);
    grd.addColorStop(0,    'rgba(0,0,0,0)');
    grd.addColorStop(0.72, 'rgba(0,0,0,0)');
    grd.addColorStop(0.84, 'rgba(45,122,82,0.25)');
    grd.addColorStop(0.90, 'rgba(45,122,82,0.55)');
    grd.addColorStop(0.95, 'rgba(100,200,140,0.30)');
    grd.addColorStop(1,    'transparent');
    ctx.fillStyle = grd; ctx.fillRect(0, 0, 512, 512);
    const plat = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 30),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false })
    );
    plat.rotation.x = -Math.PI / 2;
    plat.position.y = -4.4;
    scene.add(plat);
  })();

  // ─── Mouse ───────────────────────────────────────────────────────────────────
  let mx = 0, my = 0, smoothMx = 0, smoothMy = 0;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduceMotion) {
    document.addEventListener('mousemove', e => {
      mx = (e.clientX / window.innerWidth  - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
    });
  }

  window.addEventListener('resize', resize);
  resize();

  // ─── Animate ─────────────────────────────────────────────────────────────────
  let clock = 0, scrollPhase = 0, lastTime = null;

  function animate(now) {
    requestAnimationFrame(animate);

    const dt = lastTime === null ? 0.016 : Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;
    clock += dt;
    scrollPhase += dt * 0.08;

    drawDesktop(scrollPhase);
    drawMobile(scrollPhase);

    smoothMx += (mx - smoothMx) * 0.04;
    smoothMy += (my - smoothMy) * 0.04;

    // Gentle camera orbit around both devices
    const sway = Math.sin(clock * 0.10);
    camera.position.x = sway * 2.2 + smoothMx * 0.8;
    camera.position.y = 2.0 + Math.sin(clock * 0.07) * 0.45 - smoothMy * 0.5;
    camera.position.z = 10.0 - Math.abs(sway) * 0.4;
    camera.lookAt(1.0 + smoothMx * 0.3, 0.7 - smoothMy * 0.2, 0);

    // Device float
    macGroup.position.y  = -0.8 + Math.sin(clock * 0.7) * 0.06;
    phoneGroup.position.y =  0.5 + Math.sin(clock * 0.7 + 1.3) * 0.08;
    phoneGroup.rotation.y = -0.38 + smoothMx * 0.04;

    // Nebula dust drift
    dustMeshes.forEach((m, i) => {
      m.rotation.z = clock * (0.025 + i * 0.006);
      m.rotation.x = Math.sin(clock * 0.04 + i) * 0.12;
    });

    // Orbit lights
    greenLight.position.x  = Math.cos(clock * 0.35) * 6;
    greenLight.position.z  = Math.sin(clock * 0.35) * 6;
    orangeLight.position.x = Math.cos(clock * 0.27 + Math.PI) * 5;
    orangeLight.position.z = Math.sin(clock * 0.27 + Math.PI) * 5;

    renderer.render(scene, camera);
  }

  requestAnimationFrame(animate);
})();
