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
  scene.fog = new THREE.FogExp2(0x030c18, 0.006);

  // ─── Camera ─────────────────────────────────────────────────────────────────
  const camera = new THREE.PerspectiveCamera(50, 16 / 9, 0.05, 300);
  camera.position.set(0, 1.4, 7);

  // ─── Lighting ───────────────────────────────────────────────────────────────
  scene.add(new THREE.AmbientLight(0x0a1a2e, 5));

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

  // ─── Desktop canvas ──────────────────────────────────────────────────────────
  const DW = 1200, DH = 750;
  const deskCanvas = document.createElement('canvas');
  deskCanvas.width = DW; deskCanvas.height = DH;
  const dc = deskCanvas.getContext('2d');
  const desktopTex = new THREE.CanvasTexture(deskCanvas);

  // Site 1 — GreenEdge Landscaping (dark emerald, split hero)
  function drawSite1(scrollY) {
    const bg = dc.createLinearGradient(0, 0, 0, DH);
    bg.addColorStop(0, '#060e08'); bg.addColorStop(0.5, '#0c1e10'); bg.addColorStop(1, '#071009');
    dc.fillStyle = bg; dc.fillRect(0, 0, DW, DH);

    const glow = dc.createRadialGradient(180, 320, 0, 180, 320, 380);
    glow.addColorStop(0, 'rgba(61,158,106,0.16)'); glow.addColorStop(1, 'transparent');
    dc.fillStyle = glow; dc.fillRect(0, 0, DW, DH);

    // Nav
    dc.fillStyle = 'rgba(4,10,6,0.94)'; dc.fillRect(0, 0, DW, 56);
    dc.strokeStyle = 'rgba(61,158,106,0.2)'; dc.lineWidth = 1;
    dc.beginPath(); dc.moveTo(0, 56); dc.lineTo(DW, 56); dc.stroke();
    dc.fillStyle = '#3d9e6a'; rr(dc, 28, 14, 30, 28, 6); dc.fill();
    dc.fillStyle = '#fff'; dc.font = 'bold 10px sans-serif'; dc.textAlign = 'center';
    dc.fillText('GE', 43, 32);
    dc.fillStyle = '#e0ffe8'; dc.font = 'bold 13.5px sans-serif'; dc.textAlign = 'left';
    dc.fillText('GreenEdge', 66, 32);
    dc.fillStyle = 'rgba(255,255,255,0.46)'; dc.font = '11px sans-serif';
    ['Home','Services','Gallery','Reviews','Contact'].forEach((t,i) => dc.fillText(t, 310+i*105, 32));
    const nb = dc.createLinearGradient(1042,0,1180,0);
    nb.addColorStop(0,'#3d9e6a'); nb.addColorStop(1,'#2d7a52');
    dc.fillStyle = nb; rr(dc,1042,16,138,26,13); dc.fill();
    dc.fillStyle = '#fff'; dc.font = 'bold 10.5px sans-serif'; dc.textAlign = 'center';
    dc.fillText('Get Free Quote', 1111, 32);

    // Hero left
    const py = 56 + scrollY * 0.4;
    dc.fillStyle = 'rgba(61,158,106,0.16)';
    rr(dc,60,py+44,252,22,11); dc.fill();
    dc.strokeStyle='rgba(61,158,106,0.5)'; dc.lineWidth=1;
    rr(dc,60,py+44,252,22,11); dc.stroke();
    dc.fillStyle='#5dd87e'; dc.font='bold 8.5px sans-serif'; dc.textAlign='left';
    dc.fillText("★  NE OHIO'S #1 RATED LAWN CARE", 78, py+58);

    dc.fillStyle='#fff'; dc.font='bold 54px sans-serif';
    dc.fillText('Beautiful Lawns,', 60, py+130);
    const hg=dc.createLinearGradient(60,0,560,0);
    hg.addColorStop(0,'#5dd87e'); hg.addColorStop(1,'#2d9e52');
    dc.fillStyle=hg; dc.font='bold 54px sans-serif';
    dc.fillText('Made Effortless.', 60, py+192);

    dc.fillStyle='rgba(255,255,255,0.52)'; dc.font='12.5px sans-serif';
    dc.fillText('Expert design, installation & maintenance', 60, py+228);
    dc.fillText('for residential and commercial properties.', 60, py+246);

    const bb=dc.createLinearGradient(60,0,290,0);
    bb.addColorStop(0,'#3d9e6a'); bb.addColorStop(1,'#2d7a52');
    dc.fillStyle=bb; rr(dc,60,py+266,222,44,22); dc.fill();
    dc.fillStyle='rgba(93,216,126,0.22)';
    dc.beginPath(); dc.arc(171,py+310,90,Math.PI,0); dc.fill();
    dc.fillStyle='#fff'; dc.font='bold 12px sans-serif'; dc.textAlign='center';
    dc.fillText('Get Free Estimate', 171, py+292);
    dc.strokeStyle='rgba(255,255,255,0.22)'; dc.lineWidth=1.5;
    rr(dc,296,py+266,168,44,22); dc.stroke();
    dc.fillStyle='rgba(255,255,255,0.6)'; dc.font='11.5px sans-serif';
    dc.fillText('See Our Work →', 380, py+292);

    dc.fillStyle='#f2a93b'; dc.font='12px sans-serif'; dc.textAlign='left';
    dc.fillText('★★★★★', 60, py+334);
    dc.fillStyle='rgba(255,255,255,0.4)'; dc.font='10.5px sans-serif';
    dc.fillText('4.9 / 5.0  ·  340+ Google Reviews', 132, py+334);

    // Hero right — circular photo
    const cx=830, cy=py+200, cr=168;
    dc.fillStyle='rgba(0,0,0,0.38)';
    dc.beginPath(); dc.arc(cx+7,cy+7,cr,0,Math.PI*2); dc.fill();
    const pg=dc.createRadialGradient(cx-50,cy-50,20,cx,cy,cr);
    pg.addColorStop(0,'#2a5e30'); pg.addColorStop(0.4,'#1a4020');
    pg.addColorStop(0.7,'#0e2814'); pg.addColorStop(1,'#081508');
    dc.fillStyle=pg; dc.beginPath(); dc.arc(cx,cy,cr,0,Math.PI*2); dc.fill();
    dc.save(); dc.beginPath(); dc.arc(cx,cy,cr,0,Math.PI*2); dc.clip();
    for(let s=0;s<14;s++){
      dc.fillStyle=s%2===0?'rgba(255,255,255,0.022)':'rgba(0,0,0,0.038)';
      dc.fillRect(cx-cr+s*(cr*2/14),cy-cr,cr*2/14,cr*2);
    }
    dc.restore();
    dc.strokeStyle='rgba(61,158,106,0.45)'; dc.lineWidth=2;
    dc.beginPath(); dc.arc(cx,cy,cr,0,Math.PI*2); dc.stroke();

    // Floating cards
    dc.fillStyle='rgba(3,8,5,0.96)';
    rr(dc,cx+88,py+36,172,58,10); dc.fill();
    dc.strokeStyle='rgba(61,158,106,0.55)'; dc.lineWidth=1;
    rr(dc,cx+88,py+36,172,58,10); dc.stroke();
    dc.fillStyle='#5dd87e'; dc.font='bold 22px sans-serif'; dc.textAlign='left';
    dc.fillText('+340%', cx+104, py+68);
    dc.fillStyle='rgba(255,255,255,0.42)'; dc.font='9px sans-serif';
    dc.fillText('more leads after launch', cx+104, py+83);
    dc.fillStyle='#5dd87e';
    dc.beginPath(); dc.arc(cx+96,py+62,4,0,Math.PI*2); dc.fill();

    dc.fillStyle='rgba(3,8,5,0.96)';
    rr(dc,cx-cr-24,cy+82,162,50,10); dc.fill();
    dc.strokeStyle='rgba(61,158,106,0.38)'; dc.lineWidth=1;
    rr(dc,cx-cr-24,cy+82,162,50,10); dc.stroke();
    dc.fillStyle='#5dd87e'; dc.font='bold 10.5px sans-serif'; dc.textAlign='left';
    dc.fillText('✓  Licensed & Insured', cx-cr-8, cy+105);
    dc.fillStyle='rgba(255,255,255,0.36)'; dc.font='9px sans-serif';
    dc.fillText('NE Ohio certified pros', cx-cr-8, cy+121);

    // Services strip
    const svY=565;
    dc.fillStyle='rgba(2,7,4,0.88)'; dc.fillRect(0,svY,DW,DH-svY);
    dc.strokeStyle='rgba(61,158,106,0.12)'; dc.lineWidth=1;
    dc.beginPath(); dc.moveTo(0,svY); dc.lineTo(DW,svY); dc.stroke();
    const svcs=[
      {i:'🌿',n:'Lawn Maintenance',s:'Weekly & bi-weekly mowing'},
      {i:'🌳',n:'Landscape Design',s:'Custom property planning'},
      {i:'❄️',n:'Snow Removal',s:'Commercial & residential'},
      {i:'💧',n:'Irrigation Systems',s:'Smart install & repair'},
    ];
    const cW=242, gap=(DW-svcs.length*cW)/(svcs.length+1);
    svcs.forEach(({i,n,s},idx)=>{
      const sx=gap+idx*(cW+gap);
      dc.fillStyle='rgba(255,255,255,0.025)'; rr(dc,sx,svY+18,cW,92,8); dc.fill();
      dc.strokeStyle='rgba(61,158,106,0.16)'; dc.lineWidth=1;
      rr(dc,sx,svY+18,cW,92,8); dc.stroke();
      dc.fillStyle='#3d9e6a'; dc.fillRect(sx,svY+18,cW,3);
      dc.font='18px sans-serif'; dc.textAlign='center';
      dc.fillText(i,sx+28,svY+66);
      dc.fillStyle='#fff'; dc.font='bold 12px sans-serif';
      dc.fillText(n,sx+cW/2+14,svY+54);
      dc.fillStyle='rgba(255,255,255,0.36)'; dc.font='10px sans-serif';
      dc.fillText(s,sx+cW/2+14,svY+72);
      dc.fillStyle='#5dd87e'; dc.font='9px sans-serif'; dc.textAlign='right';
      dc.fillText('Learn more →',sx+cW-12,svY+100);
    });

    // scanlines
    for(let y=0;y<DH;y+=4){dc.fillStyle='rgba(0,0,0,0.016)';dc.fillRect(0,y,DW,2);}
  }

  // Site 2 — Sunrise Grounds (warm earthy, centered, gallery cards)
  function drawSite2(scrollY) {
    const bg=dc.createLinearGradient(0,0,DW,DH);
    bg.addColorStop(0,'#120804'); bg.addColorStop(0.5,'#1e1008'); bg.addColorStop(1,'#0d0703');
    dc.fillStyle=bg; dc.fillRect(0,0,DW,DH);
    const tg=dc.createRadialGradient(600,80,0,600,80,460);
    tg.addColorStop(0,'rgba(212,130,10,0.13)'); tg.addColorStop(1,'transparent');
    dc.fillStyle=tg; dc.fillRect(0,0,DW,DH);

    // Nav
    dc.fillStyle='rgba(10,5,2,0.96)'; dc.fillRect(0,0,DW,56);
    dc.strokeStyle='rgba(212,130,10,0.18)'; dc.lineWidth=1;
    dc.beginPath(); dc.moveTo(0,56); dc.lineTo(DW,56); dc.stroke();
    dc.fillStyle='#d4820a'; rr(dc,28,14,30,28,5); dc.fill();
    dc.fillStyle='#fff'; dc.font='bold 10px sans-serif'; dc.textAlign='center';
    dc.fillText('SG',43,32);
    dc.fillStyle='#e8a830'; dc.font='bold 13.5px sans-serif'; dc.textAlign='left';
    dc.fillText('Sunrise Grounds',66,32);
    dc.fillStyle='rgba(255,255,255,0.44)'; dc.font='11px sans-serif';
    ['Services','Portfolio','About','Testimonials','Contact'].forEach((t,i)=>dc.fillText(t,310+i*112,32));
    dc.strokeStyle='#d4820a'; dc.lineWidth=1.5;
    rr(dc,1038,16,152,26,13); dc.stroke();
    dc.fillStyle='#e8a830'; dc.font='bold 10.5px sans-serif'; dc.textAlign='center';
    dc.fillText('Free Consultation',1114,32);

    // Hero (centered)
    const cx2=DW/2, hY2=56+scrollY*0.3;
    dc.fillStyle='rgba(212,130,10,0.14)';
    rr(dc,cx2-188,hY2+34,376,22,11); dc.fill();
    dc.strokeStyle='rgba(212,130,10,0.42)'; dc.lineWidth=1;
    rr(dc,cx2-188,hY2+34,376,22,11); dc.stroke();
    dc.fillStyle='#d4820a'; dc.font='bold 8.5px sans-serif'; dc.textAlign='center';
    dc.fillText('· · ·   SERVING NE OHIO SINCE 2009   · · ·',cx2,hY2+48);

    dc.fillStyle='#fff'; dc.font='bold 60px sans-serif';
    dc.fillText('Where Beauty',cx2,hY2+124);
    const ag=dc.createLinearGradient(cx2-220,0,cx2+220,0);
    ag.addColorStop(0,'#e8a830'); ag.addColorStop(0.5,'#f2c040'); ag.addColorStop(1,'#d4820a');
    dc.fillStyle=ag; dc.font='bold 60px sans-serif';
    dc.fillText('Meets Precision.',cx2,hY2+196);

    dc.fillStyle='rgba(255,255,255,0.48)'; dc.font='13px sans-serif'; dc.textAlign='center';
    dc.fillText('From lush lawns to stunning landscapes — we bring your vision to life.',cx2,hY2+234);
    dc.fillText('Licensed, insured, and trusted by 2,400+ NE Ohio homeowners.',cx2,hY2+252);

    const cg2=dc.createLinearGradient(cx2-155,0,cx2+155,0);
    cg2.addColorStop(0,'#c4780a'); cg2.addColorStop(1,'#e8a830');
    dc.fillStyle=cg2; rr(dc,cx2-155,hY2+272,310,46,23); dc.fill();
    dc.fillStyle='rgba(255,255,255,0.12)';
    dc.beginPath(); dc.arc(cx2,hY2+318,130,Math.PI,0); dc.fill();
    dc.fillStyle='#fff'; dc.font='bold 12.5px sans-serif'; dc.textAlign='center';
    dc.fillText('Schedule Free Consultation',cx2,hY2+300);

    dc.fillStyle='rgba(255,255,255,0.28)'; dc.font='10px sans-serif';
    ['✓  No obligation','✓  Same-week quotes','✓  5-star rated'].forEach((t,i)=>{
      dc.fillText(t,cx2-164+i*164,hY2+344);
    });

    // Gallery 3 cards
    const gY=hY2+372, gcW=332, gcH=128;
    const gcS=(DW-3*gcW-2*18)/2;
    [{l:'Lawn Care',s:'Before & After'},{l:'Landscape',s:'Design Showcase'},{l:'Hardscaping',s:'Patios & Paths'}].forEach(({l,s},i)=>{
      const gx=gcS+i*(gcW+18);
      dc.fillStyle='rgba(0,0,0,0.38)'; rr(dc,gx+4,gY+4,gcW,gcH,8); dc.fill();
      const pg2=dc.createLinearGradient(gx,gY,gx+gcW,gY+gcH);
      pg2.addColorStop(0,'#2a1508'); pg2.addColorStop(0.5,'#3d1e08'); pg2.addColorStop(1,'#1a0d04');
      dc.fillStyle=pg2; rr(dc,gx,gY,gcW,gcH,8); dc.fill();
      for(let s2=0;s2<8;s2++){
        dc.fillStyle=s2%2===0?'rgba(180,100,20,0.06)':'rgba(0,0,0,0.05)';
        dc.fillRect(gx+s2*(gcW/8),gY,gcW/8,gcH);
      }
      dc.strokeStyle='rgba(212,130,10,0.26)'; dc.lineWidth=1;
      rr(dc,gx,gY,gcW,gcH,8); dc.stroke();
      const lo=dc.createLinearGradient(gx,gY+gcH-52,gx,gY+gcH);
      lo.addColorStop(0,'transparent'); lo.addColorStop(1,'rgba(10,5,2,0.94)');
      dc.fillStyle=lo; rr(dc,gx,gY,gcW,gcH,8); dc.fill();
      dc.fillStyle='#e8a830'; dc.font='bold 11.5px sans-serif'; dc.textAlign='left';
      dc.fillText(l,gx+14,gY+gcH-28);
      dc.fillStyle='rgba(255,255,255,0.4)'; dc.font='9.5px sans-serif';
      dc.fillText(s,gx+14,gY+gcH-12);
    });

    // Stats bar
    const stY2=gY+gcH+16;
    dc.fillStyle='rgba(8,4,2,0.92)'; dc.fillRect(0,stY2,DW,DH-stY2);
    dc.strokeStyle='rgba(212,130,10,0.1)'; dc.lineWidth=1;
    dc.beginPath(); dc.moveTo(0,stY2); dc.lineTo(DW,stY2); dc.stroke();
    [['15+','Years Experience'],['2,400+','Properties Served'],['A+','BBB Rating'],['5.0 ★','Google Reviews']].forEach(([v,l],i)=>{
      const sx=DW/4*i+DW/8;
      if(i>0){dc.strokeStyle='rgba(255,255,255,0.06)';dc.lineWidth=1;dc.beginPath();dc.moveTo(sx-DW/8,stY2+10);dc.lineTo(sx-DW/8,stY2+56);dc.stroke();}
      dc.fillStyle='#d4820a'; dc.font='bold 24px sans-serif'; dc.textAlign='center';
      dc.fillText(v,sx,stY2+36);
      dc.fillStyle='rgba(255,255,255,0.34)'; dc.font='10px sans-serif';
      dc.fillText(l,sx,stY2+52);
    });

    for(let y=0;y<DH;y+=4){dc.fillStyle='rgba(0,0,0,0.016)';dc.fillRect(0,y,DW,2);}
  }

  // Site 3 — Apex Grounds (deep navy + cyan, asymmetric, giant number)
  function drawSite3(scrollY) {
    const bg=dc.createLinearGradient(0,0,DW,DH);
    bg.addColorStop(0,'#020710'); bg.addColorStop(0.5,'#030c1a'); bg.addColorStop(1,'#050f22');
    dc.fillStyle=bg; dc.fillRect(0,0,DW,DH);
    const rg=dc.createRadialGradient(920,260,0,920,260,360);
    rg.addColorStop(0,'rgba(0,212,170,0.09)'); rg.addColorStop(1,'transparent');
    dc.fillStyle=rg; dc.fillRect(0,0,DW,DH);

    // Nav
    dc.fillStyle='rgba(2,7,16,0.97)'; dc.fillRect(0,0,DW,54);
    dc.strokeStyle='rgba(0,212,170,0.14)'; dc.lineWidth=1;
    dc.beginPath(); dc.moveTo(0,54); dc.lineTo(DW,54); dc.stroke();
    dc.fillStyle='#00d4aa'; dc.font='bold 14px monospace'; dc.textAlign='left';
    dc.fillText('APEX',30,24);
    dc.fillStyle='#fff'; dc.font='bold 14px monospace';
    dc.fillText('GROUNDS',74,24);
    dc.strokeStyle='#00d4aa'; dc.lineWidth=1;
    dc.beginPath(); dc.moveTo(30,28); dc.lineTo(72,28); dc.stroke();
    dc.fillStyle='#00d4aa';
    dc.beginPath(); dc.arc(67,19,2.5,0,Math.PI*2); dc.fill();
    dc.fillStyle='rgba(255,255,255,0.4)'; dc.font='10.5px sans-serif';
    ['Services','Portfolio','Results','About','Contact'].forEach((t,i)=>dc.fillText(t,328+i*108,32));
    dc.strokeStyle='#00d4aa'; dc.lineWidth=1;
    rr(dc,1052,15,130,26,4); dc.stroke();
    dc.fillStyle='#00d4aa'; dc.font='bold 9.5px monospace'; dc.textAlign='center';
    dc.fillText('GET STARTED →',1117,31);

    // Hero left
    const hY3=54+scrollY*0.25;
    dc.fillStyle='rgba(0,212,170,0.1)';
    rr(dc,50,hY3+36,322,20,3); dc.fill();
    dc.strokeStyle='rgba(0,212,170,0.32)'; dc.lineWidth=1;
    rr(dc,50,hY3+36,322,20,3); dc.stroke();
    dc.fillStyle='#00d4aa'; dc.font='bold 8px monospace'; dc.textAlign='left';
    dc.fillText('PRECISION  ·  PERFORMANCE  ·  PROVEN',66,hY3+49);

    dc.fillStyle='#fff'; dc.font='bold 50px sans-serif';
    dc.fillText('Premium Lawn Care',50,hY3+122);
    const cg3=dc.createLinearGradient(50,0,530,0);
    cg3.addColorStop(0,'#00d4aa'); cg3.addColorStop(0.55,'#4499ff'); cg3.addColorStop(1,'#00d4aa');
    dc.fillStyle=cg3; dc.font='bold 50px sans-serif';
    dc.fillText('On Your Schedule.',50,hY3+182);

    dc.fillStyle='rgba(255,255,255,0.48)'; dc.font='12.5px sans-serif';
    dc.fillText('Same-week scheduling, transparent pricing,',50,hY3+220);
    dc.fillText('and results guaranteed or your money back.',50,hY3+238);

    const cta3=dc.createLinearGradient(50,0,280,0);
    cta3.addColorStop(0,'#00b890'); cta3.addColorStop(1,'#0099dd');
    dc.fillStyle=cta3; rr(dc,50,hY3+258,234,44,6); dc.fill();
    dc.fillStyle='#fff'; dc.font='bold 11.5px monospace'; dc.textAlign='center';
    dc.fillText('START TODAY →',167,hY3+285);

    dc.fillStyle='rgba(0,212,170,0.8)';
    dc.beginPath(); dc.arc(44,hY3+320,3.5,0,Math.PI*2); dc.fill();
    dc.fillStyle='rgba(255,255,255,0.32)'; dc.font='10px sans-serif'; dc.textAlign='left';
    dc.fillText('Trusted by 500+ homeowners in NE Ohio',52,hY3+324);

    // Hero right — giant number
    const nx=862, ny=hY3+220;
    const numBg=dc.createRadialGradient(nx,ny,0,nx,ny,185);
    numBg.addColorStop(0,'rgba(0,212,170,0.06)');
    numBg.addColorStop(0.8,'rgba(0,212,170,0.02)');
    numBg.addColorStop(1,'transparent');
    dc.fillStyle=numBg; dc.fillRect(nx-200,ny-180,400,380);
    dc.strokeStyle='rgba(0,212,170,0.1)'; dc.lineWidth=1;
    dc.beginPath(); dc.arc(nx,ny,165,0,Math.PI*2); dc.stroke();
    dc.strokeStyle='rgba(0,212,170,0.05)';
    dc.beginPath(); dc.arc(nx,ny,185,0,Math.PI*2); dc.stroke();
    const numG=dc.createLinearGradient(nx-90,ny-140,nx+90,ny+140);
    numG.addColorStop(0,'#00d4aa'); numG.addColorStop(0.5,'#4499ff'); numG.addColorStop(1,'#00d4aa');
    dc.fillStyle=numG; dc.font='bold 168px sans-serif'; dc.textAlign='center';
    dc.fillText('97',nx,ny+56);
    dc.fillStyle='rgba(0,212,170,0.72)'; dc.font='bold 28px sans-serif';
    dc.fillText('%',nx+108,ny-72);
    dc.fillStyle='rgba(255,255,255,0.52)'; dc.font='13px sans-serif';
    dc.fillText('Customer Satisfaction',nx,ny+104);
    dc.fillStyle='rgba(0,212,170,0.7)'; dc.font='bold 10px sans-serif';
    dc.fillText('RATE',nx,ny+122);
    dc.fillStyle='rgba(0,212,170,0.12)'; rr(dc,nx-124,ny+140,248,7,3); dc.fill();
    const pg3=dc.createLinearGradient(nx-124,0,nx+124,0);
    pg3.addColorStop(0,'#00d4aa'); pg3.addColorStop(1,'#4499ff');
    dc.fillStyle=pg3; rr(dc,nx-124,ny+140,240,7,3); dc.fill();

    // Floating card
    dc.fillStyle='rgba(2,8,20,0.97)';
    rr(dc,nx+100,hY3+66,194,58,8); dc.fill();
    dc.strokeStyle='rgba(0,212,170,0.42)'; dc.lineWidth=1;
    rr(dc,nx+100,hY3+66,194,58,8); dc.stroke();
    dc.fillStyle='#00d4aa';
    dc.beginPath(); dc.arc(nx+116,hY3+91,4,0,Math.PI*2); dc.fill();
    dc.fillStyle='#fff'; dc.font='bold 11px sans-serif'; dc.textAlign='left';
    dc.fillText('Same-week scheduling',nx+128,hY3+91);
    dc.fillStyle='rgba(255,255,255,0.38)'; dc.font='9px sans-serif';
    dc.fillText('available in your area',nx+128,hY3+108);

    // Bottom bar
    const tbY=586;
    dc.fillStyle='rgba(2,6,14,0.96)'; dc.fillRect(0,tbY,DW,DH-tbY);
    dc.strokeStyle='rgba(0,212,170,0.09)'; dc.lineWidth=1;
    dc.beginPath(); dc.moveTo(0,tbY); dc.lineTo(DW,tbY); dc.stroke();
    ['⚡  Same-Week Scheduling','💯  Satisfaction Guaranteed','🌿  Eco-Friendly Products','📞  24/7 Support Line'].forEach((f,i)=>{
      const fw=DW/4;
      if(i>0){dc.strokeStyle='rgba(0,212,170,0.08)';dc.lineWidth=1;dc.beginPath();dc.moveTo(i*fw,tbY+12);dc.lineTo(i*fw,tbY+56);dc.stroke();}
      dc.fillStyle='rgba(255,255,255,0.48)'; dc.font='10.5px sans-serif'; dc.textAlign='center';
      dc.fillText(f,i*fw+fw/2,tbY+34);
    });

    for(let y=0;y<DH;y+=4){dc.fillStyle='rgba(0,0,0,0.016)';dc.fillRect(0,y,DW,2);}
  }

  function drawDesktop(scrollFrac, clock) {
    const SITE_DUR = 8, FADE = 0.65, NUM = 3;
    const siteIdx = Math.floor(clock / SITE_DUR) % NUM;
    const siteTime = clock % SITE_DUR;
    let alpha = 1;
    if (siteTime < FADE) alpha = siteTime / FADE;
    if (siteTime > SITE_DUR - FADE) alpha = (SITE_DUR - siteTime) / FADE;
    alpha = clamp(alpha, 0, 1);

    const scrollY = Math.sin(scrollFrac * Math.PI * 2) * 20;

    dc.fillStyle = '#020c18';
    dc.fillRect(0, 0, DW, DH);
    dc.save();
    dc.globalAlpha = alpha;
    if (siteIdx === 0)      drawSite1(scrollY);
    else if (siteIdx === 1) drawSite2(scrollY);
    else                    drawSite3(scrollY);
    dc.restore();

    desktopTex.needsUpdate = true;
  }

  // ─── Mobile canvas ───────────────────────────────────────────────────────────
  const MW = 480, MH = 1032;
  const mobileCanvas = document.createElement('canvas');
  mobileCanvas.width = MW; mobileCanvas.height = MH;
  const mc = mobileCanvas.getContext('2d');
  const mobileTex = new THREE.CanvasTexture(mobileCanvas);

  function drawMobileSite1() {
    const bg=mc.createLinearGradient(0,0,0,MH);
    bg.addColorStop(0,'#060e08'); bg.addColorStop(0.6,'#0c1e10'); bg.addColorStop(1,'#071009');
    mc.fillStyle=bg; mc.fillRect(0,0,MW,MH);
    const gl=mc.createRadialGradient(MW/2,280,0,MW/2,280,300);
    gl.addColorStop(0,'rgba(61,158,106,0.18)'); gl.addColorStop(1,'transparent');
    mc.fillStyle=gl; mc.fillRect(0,0,MW,MH);

    mc.fillStyle='rgba(4,10,6,0.96)'; mc.fillRect(0,0,MW,58);
    mc.strokeStyle='rgba(61,158,106,0.2)'; mc.lineWidth=1;
    mc.beginPath(); mc.moveTo(0,58); mc.lineTo(MW,58); mc.stroke();
    mc.fillStyle='#3d9e6a'; rr(mc,16,15,28,28,6); mc.fill();
    mc.fillStyle='#fff'; mc.font='bold 10px sans-serif'; mc.textAlign='center';
    mc.fillText('GE',30,33);
    mc.fillStyle='#e0ffe8'; mc.font='bold 13px sans-serif'; mc.textAlign='left';
    mc.fillText('GreenEdge',52,33);
    mc.strokeStyle='rgba(255,255,255,0.45)'; mc.lineWidth=2;
    [17,25,33].forEach(y=>{mc.beginPath();mc.moveTo(MW-42,y);mc.lineTo(MW-18,y);mc.stroke();});

    mc.fillStyle='rgba(61,158,106,0.18)';
    rr(mc,MW/2-122,76,244,22,11); mc.fill();
    mc.strokeStyle='rgba(61,158,106,0.5)'; mc.lineWidth=1;
    rr(mc,MW/2-122,76,244,22,11); mc.stroke();
    mc.fillStyle='#5dd87e'; mc.font='bold 8px sans-serif'; mc.textAlign='center';
    mc.fillText("★  NE OHIO'S #1 RATED LAWN CARE",MW/2,90);

    mc.fillStyle='#fff'; mc.font='bold 40px sans-serif';
    mc.fillText('Beautiful Lawns,',MW/2,160);
    const g=mc.createLinearGradient(MW/2-130,0,MW/2+130,0);
    g.addColorStop(0,'#5dd87e'); g.addColorStop(1,'#2d9e52');
    mc.fillStyle=g; mc.font='bold 40px sans-serif';
    mc.fillText('Made Effortless.',MW/2,208);

    mc.fillStyle='rgba(255,255,255,0.5)'; mc.font='12px sans-serif';
    mc.fillText('Expert lawn care for NE Ohio',MW/2,244);
    mc.fillText('residential & commercial.',MW/2,262);

    const bg2=mc.createLinearGradient(MW/2-132,0,MW/2+132,0);
    bg2.addColorStop(0,'#3d9e6a'); bg2.addColorStop(1,'#2d7a52');
    mc.fillStyle=bg2; rr(mc,MW/2-132,282,264,46,23); mc.fill();
    mc.fillStyle='#fff'; mc.font='bold 13px sans-serif'; mc.textAlign='center';
    mc.fillText('Get Free Estimate',MW/2,310);

    mc.fillStyle='#f2a93b'; mc.font='15px sans-serif'; mc.fillText('★★★★★',MW/2,358);
    mc.fillStyle='rgba(255,255,255,0.4)'; mc.font='10px sans-serif';
    mc.fillText('4.9  ·  340+ Google Reviews',MW/2,376);

    const svTop=406;
    mc.fillStyle='rgba(2,7,4,0.85)'; mc.fillRect(0,svTop,MW,MH-svTop);
    mc.strokeStyle='rgba(61,158,106,0.15)'; mc.lineWidth=1;
    mc.beginPath(); mc.moveTo(0,svTop); mc.lineTo(MW,svTop); mc.stroke();
    mc.fillStyle='rgba(255,255,255,0.38)'; mc.font='bold 9px sans-serif'; mc.textAlign='center';
    mc.fillText('OUR SERVICES',MW/2,svTop+22);

    [{i:'🌿',n:'Lawn Maintenance',s:'Weekly & bi-weekly mowing'},
     {i:'🌳',n:'Landscape Design',s:'Custom property planning'},
     {i:'❄️',n:'Snow Removal',s:'Commercial & residential'},
     {i:'💧',n:'Irrigation Systems',s:'Smart install & repair'}].forEach(({i,n,s},idx)=>{
      const iy=svTop+36+idx*74;
      mc.fillStyle='rgba(255,255,255,0.03)'; rr(mc,18,iy,MW-36,62,8); mc.fill();
      mc.strokeStyle='rgba(61,158,106,0.18)'; mc.lineWidth=1;
      rr(mc,18,iy,MW-36,62,8); mc.stroke();
      mc.fillStyle='#3d9e6a'; mc.fillRect(18,iy+10,3,42);
      mc.font='17px sans-serif'; mc.textAlign='center';
      mc.fillText(i,46,iy+38);
      mc.fillStyle='#fff'; mc.font='bold 13px sans-serif'; mc.textAlign='left';
      mc.fillText(n,68,iy+30);
      mc.fillStyle='rgba(255,255,255,0.35)'; mc.font='9.5px sans-serif';
      mc.fillText(s,68,iy+48);
      mc.fillStyle='#5dd87e'; mc.font='9px sans-serif'; mc.textAlign='right';
      mc.fillText('View →',MW-24,iy+30);
    });

    mobileTex.needsUpdate = true;
  }

  function drawMobileSite2() {
    const bg=mc.createLinearGradient(0,0,0,MH);
    bg.addColorStop(0,'#120804'); bg.addColorStop(0.6,'#1e1008'); bg.addColorStop(1,'#0d0703');
    mc.fillStyle=bg; mc.fillRect(0,0,MW,MH);
    const tg=mc.createRadialGradient(MW/2,100,0,MW/2,100,320);
    tg.addColorStop(0,'rgba(212,130,10,0.14)'); tg.addColorStop(1,'transparent');
    mc.fillStyle=tg; mc.fillRect(0,0,MW,MH);

    mc.fillStyle='rgba(10,5,2,0.97)'; mc.fillRect(0,0,MW,58);
    mc.strokeStyle='rgba(212,130,10,0.18)'; mc.lineWidth=1;
    mc.beginPath(); mc.moveTo(0,58); mc.lineTo(MW,58); mc.stroke();
    mc.fillStyle='#d4820a'; rr(mc,16,15,28,28,5); mc.fill();
    mc.fillStyle='#fff'; mc.font='bold 10px sans-serif'; mc.textAlign='center';
    mc.fillText('SG',30,33);
    mc.fillStyle='#e8a830'; mc.font='bold 13px sans-serif'; mc.textAlign='left';
    mc.fillText('Sunrise Grounds',52,33);
    mc.strokeStyle='rgba(255,255,255,0.45)'; mc.lineWidth=2;
    [17,25,33].forEach(y=>{mc.beginPath();mc.moveTo(MW-42,y);mc.lineTo(MW-18,y);mc.stroke();});

    mc.fillStyle='rgba(212,130,10,0.14)';
    rr(mc,MW/2-156,76,312,22,11); mc.fill();
    mc.strokeStyle='rgba(212,130,10,0.42)'; mc.lineWidth=1;
    rr(mc,MW/2-156,76,312,22,11); mc.stroke();
    mc.fillStyle='#d4820a'; mc.font='bold 8px sans-serif'; mc.textAlign='center';
    mc.fillText('· · ·   SERVING NE OHIO SINCE 2009   · · ·',MW/2,90);

    mc.fillStyle='#fff'; mc.font='bold 38px sans-serif';
    mc.fillText('Where Beauty',MW/2,158);
    const ag=mc.createLinearGradient(MW/2-130,0,MW/2+130,0);
    ag.addColorStop(0,'#e8a830'); ag.addColorStop(0.5,'#f2c040'); ag.addColorStop(1,'#d4820a');
    mc.fillStyle=ag; mc.font='bold 38px sans-serif';
    mc.fillText('Meets Precision.',MW/2,202);

    mc.fillStyle='rgba(255,255,255,0.48)'; mc.font='11.5px sans-serif';
    mc.fillText('From lush lawns to stunning landscapes,',MW/2,238);
    mc.fillText('we bring your vision to life.',MW/2,256);

    const cg2=mc.createLinearGradient(MW/2-140,0,MW/2+140,0);
    cg2.addColorStop(0,'#c4780a'); cg2.addColorStop(1,'#e8a830');
    mc.fillStyle=cg2; rr(mc,MW/2-140,274,280,46,23); mc.fill();
    mc.fillStyle='#fff'; mc.font='bold 12.5px sans-serif'; mc.textAlign='center';
    mc.fillText('Schedule Free Consultation',MW/2,302);

    // 3 gallery cards stacked
    const gcTop=336, gcH=82, gcW=MW-36;
    [{l:'Lawn Care',s:'Before & After'},{l:'Landscape Design',s:'Showcase'},{l:'Hardscaping',s:'Patios & Paths'}].forEach(({l,s},i)=>{
      const gy=gcTop+i*(gcH+10);
      dc.fillStyle='rgba(0,0,0,0)';
      const pg2=mc.createLinearGradient(18,gy,18+gcW,gy+gcH);
      pg2.addColorStop(0,'#2a1508'); pg2.addColorStop(0.5,'#3d1e08'); pg2.addColorStop(1,'#1a0d04');
      mc.fillStyle=pg2; rr(mc,18,gy,gcW,gcH,8); mc.fill();
      for(let s2=0;s2<8;s2++){mc.fillStyle=s2%2===0?'rgba(180,100,20,0.055)':'rgba(0,0,0,0.04)';mc.fillRect(18+s2*(gcW/8),gy,gcW/8,gcH);}
      mc.strokeStyle='rgba(212,130,10,0.24)'; mc.lineWidth=1;
      rr(mc,18,gy,gcW,gcH,8); mc.stroke();
      const lo=mc.createLinearGradient(18,gy+gcH-44,18,gy+gcH);
      lo.addColorStop(0,'transparent'); lo.addColorStop(1,'rgba(10,5,2,0.94)');
      mc.fillStyle=lo; rr(mc,18,gy,gcW,gcH,8); mc.fill();
      mc.fillStyle='#e8a830'; mc.font='bold 12px sans-serif'; mc.textAlign='left';
      mc.fillText(l,32,gy+gcH-24);
      mc.fillStyle='rgba(255,255,255,0.4)'; mc.font='9.5px sans-serif';
      mc.fillText(s,32,gy+gcH-9);
    });

    // Stats 2×2
    const stTop=gcTop+3*(gcH+10)+14;
    mc.fillStyle='rgba(8,4,2,0.9)'; mc.fillRect(0,stTop,MW,MH-stTop);
    mc.strokeStyle='rgba(212,130,10,0.1)'; mc.lineWidth=1;
    mc.beginPath(); mc.moveTo(0,stTop); mc.lineTo(MW,stTop); mc.stroke();
    [['15+','Yrs Exp'],['2,400+','Clients'],['A+','BBB'],['5.0★','Google']].forEach(([v,l],i)=>{
      const sc=i%2, sr=Math.floor(i/2);
      const sx=sc===0?MW/4:MW*3/4, sy=stTop+(sr===0?34:86);
      mc.fillStyle='#d4820a'; mc.font='bold 20px sans-serif'; mc.textAlign='center';
      mc.fillText(v,sx,sy);
      mc.fillStyle='rgba(255,255,255,0.34)'; mc.font='9px sans-serif';
      mc.fillText(l,sx,sy+15);
    });
    mc.strokeStyle='rgba(255,255,255,0.07)'; mc.lineWidth=1;
    mc.beginPath(); mc.moveTo(20,stTop+60); mc.lineTo(MW-20,stTop+60); mc.stroke();
    mc.beginPath(); mc.moveTo(MW/2,stTop+6); mc.lineTo(MW/2,stTop+114); mc.stroke();

    mobileTex.needsUpdate = true;
  }

  function drawMobileSite3() {
    const bg=mc.createLinearGradient(0,0,0,MH);
    bg.addColorStop(0,'#020710'); bg.addColorStop(0.6,'#030c1a'); bg.addColorStop(1,'#050f22');
    mc.fillStyle=bg; mc.fillRect(0,0,MW,MH);
    const rg=mc.createRadialGradient(MW/2,300,0,MW/2,300,300);
    rg.addColorStop(0,'rgba(0,212,170,0.1)'); rg.addColorStop(1,'transparent');
    mc.fillStyle=rg; mc.fillRect(0,0,MW,MH);

    mc.fillStyle='rgba(2,7,16,0.97)'; mc.fillRect(0,0,MW,56);
    mc.strokeStyle='rgba(0,212,170,0.14)'; mc.lineWidth=1;
    mc.beginPath(); mc.moveTo(0,56); mc.lineTo(MW,56); mc.stroke();
    mc.fillStyle='#00d4aa'; mc.font='bold 12px monospace'; mc.textAlign='left';
    mc.fillText('APEX',18,24);
    mc.fillStyle='#fff'; mc.font='bold 12px monospace';
    mc.fillText('GROUNDS',60,24);
    mc.strokeStyle='#00d4aa'; mc.lineWidth=1;
    mc.beginPath(); mc.moveTo(18,27); mc.lineTo(58,27); mc.stroke();
    mc.strokeStyle='rgba(0,212,170,0.5)'; mc.lineWidth=1.5;
    [17,25,33].forEach(y=>{mc.beginPath();mc.moveTo(MW-42,y);mc.lineTo(MW-18,y);mc.stroke();});

    mc.fillStyle='rgba(0,212,170,0.1)';
    rr(mc,18,74,MW-36,20,3); mc.fill();
    mc.strokeStyle='rgba(0,212,170,0.3)'; mc.lineWidth=1;
    rr(mc,18,74,MW-36,20,3); mc.stroke();
    mc.fillStyle='#00d4aa'; mc.font='bold 7.5px monospace'; mc.textAlign='center';
    mc.fillText('PRECISION  ·  PERFORMANCE  ·  PROVEN',MW/2,87);

    mc.fillStyle='#fff'; mc.font='bold 36px sans-serif';
    mc.fillText('Premium Lawn',MW/2,148);
    mc.fillText('Care',MW/2,190);
    const cg=mc.createLinearGradient(MW/2-130,0,MW/2+130,0);
    cg.addColorStop(0,'#00d4aa'); cg.addColorStop(0.5,'#4499ff'); cg.addColorStop(1,'#00d4aa');
    mc.fillStyle=cg; mc.font='bold 36px sans-serif';
    mc.fillText('On Your Schedule.',MW/2,232);

    mc.fillStyle='rgba(255,255,255,0.46)'; mc.font='11.5px sans-serif';
    mc.fillText('Same-week scheduling, transparent',MW/2,268);
    mc.fillText('pricing, results guaranteed.',MW/2,286);

    const cta3=mc.createLinearGradient(MW/2-134,0,MW/2+134,0);
    cta3.addColorStop(0,'#00b890'); cta3.addColorStop(1,'#0099dd');
    mc.fillStyle=cta3; rr(mc,MW/2-134,304,268,44,6); mc.fill();
    mc.fillStyle='#fff'; mc.font='bold 11px monospace'; mc.textAlign='center';
    mc.fillText('START TODAY →',MW/2,331);

    // Giant number centered
    const numBg=mc.createRadialGradient(MW/2,490,0,MW/2,490,180);
    numBg.addColorStop(0,'rgba(0,212,170,0.07)'); numBg.addColorStop(1,'transparent');
    mc.fillStyle=numBg; mc.fillRect(MW/2-200,360,400,280);
    mc.strokeStyle='rgba(0,212,170,0.1)'; mc.lineWidth=1;
    mc.beginPath(); mc.arc(MW/2,490,158,0,Math.PI*2); mc.stroke();
    const numG=mc.createLinearGradient(MW/2-80,390,MW/2+80,560);
    numG.addColorStop(0,'#00d4aa'); numG.addColorStop(0.5,'#4499ff'); numG.addColorStop(1,'#00d4aa');
    mc.fillStyle=numG; mc.font='bold 148px sans-serif'; mc.textAlign='center';
    mc.fillText('97',MW/2,536);
    mc.fillStyle='rgba(0,212,170,0.72)'; mc.font='bold 26px sans-serif';
    mc.fillText('%',MW/2+92,410);
    mc.fillStyle='rgba(255,255,255,0.5)'; mc.font='13px sans-serif';
    mc.fillText('Customer Satisfaction Rate',MW/2,582);
    mc.fillStyle='rgba(0,212,170,0.12)'; rr(mc,MW/2-120,598,240,6,3); mc.fill();
    const pgM=mc.createLinearGradient(MW/2-120,0,MW/2+120,0);
    pgM.addColorStop(0,'#00d4aa'); pgM.addColorStop(1,'#4499ff');
    mc.fillStyle=pgM; rr(mc,MW/2-120,598,233,6,3); mc.fill();

    // Feature strips
    const ftop=624;
    mc.fillStyle='rgba(2,6,14,0.96)'; mc.fillRect(0,ftop,MW,MH-ftop);
    mc.strokeStyle='rgba(0,212,170,0.09)'; mc.lineWidth=1;
    mc.beginPath(); mc.moveTo(0,ftop); mc.lineTo(MW,ftop); mc.stroke();
    ['⚡  Same-Week Scheduling','💯  Satisfaction Guaranteed','🌿  Eco-Friendly Products','📞  24/7 Support Line'].forEach((f,i)=>{
      const fy=ftop+22+i*56;
      mc.fillStyle='rgba(0,212,170,0.06)'; rr(mc,18,fy-16,MW-36,42,6); mc.fill();
      mc.strokeStyle='rgba(0,212,170,0.12)'; mc.lineWidth=1;
      rr(mc,18,fy-16,MW-36,42,6); mc.stroke();
      mc.fillStyle='rgba(255,255,255,0.52)'; mc.font='11px sans-serif'; mc.textAlign='left';
      mc.fillText(f,36,fy+8);
    });

    mobileTex.needsUpdate = true;
  }

  function drawMobile(scrollFrac, clock) {
    const SITE_DUR = 8, FADE = 0.65, NUM = 3;
    const siteIdx = Math.floor(clock / SITE_DUR) % NUM;
    const siteTime = clock % SITE_DUR;
    let alpha = 1;
    if (siteTime < FADE) alpha = siteTime / FADE;
    if (siteTime > SITE_DUR - FADE) alpha = (SITE_DUR - siteTime) / FADE;
    alpha = clamp(alpha, 0, 1);

    mc.fillStyle = '#020c18';
    mc.fillRect(0, 0, MW, MH);
    mc.save();
    mc.globalAlpha = alpha;
    if (siteIdx === 0)      drawMobileSite1();
    else if (siteIdx === 1) drawMobileSite2();
    else                    drawMobileSite3();
    mc.restore();

    mobileTex.needsUpdate = true;
  }

  // ─── MacBook ─────────────────────────────────────────────────────────────────
  const alumMat = new THREE.MeshStandardMaterial({ color: 0x1c2530, roughness: 0.18, metalness: 0.96 });
  const macGroup = new THREE.Group();

  const macBase = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.12, 3.8), alumMat);
  macGroup.add(macBase);

  const lidGroup = new THREE.Group();
  lidGroup.position.set(0, 0.06, -1.9);
  lidGroup.rotation.x = 0.25;

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
  macGroup.position.set(-1.0, -0.8, 0);
  macGroup.rotation.y = 0.14;
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

  phoneGroup.position.set(2.7, 0.3, 0.2);
  phoneGroup.rotation.y = -0.28;
  phoneGroup.rotation.x = -0.04;
  scene.add(phoneGroup);

  // ─── Background: topographic contour lines ───────────────────────────────────
  (function () {
    const W = 2048, H = 1024;
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const ctx = c.getContext('2d');

    // Base gradient — deep forest-navy at top, slightly warmer dark green at horizon
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0,    '#010a08');
    sky.addColorStop(0.42, '#020e0b');
    sky.addColorStop(0.72, '#031410');
    sky.addColorStop(1,    '#030f0c');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    // Central atmospheric glow — subtle emerald bloom behind the devices
    const bloom = ctx.createRadialGradient(W * 0.5, H * 0.62, 0, W * 0.5, H * 0.62, H * 0.72);
    bloom.addColorStop(0,    'rgba(34,110,68,0.22)');
    bloom.addColorStop(0.35, 'rgba(34,110,68,0.09)');
    bloom.addColorStop(0.7,  'rgba(20,80,50,0.04)');
    bloom.addColorStop(1,    'transparent');
    ctx.fillStyle = bloom;
    ctx.fillRect(0, 0, W, H);

    // Topographic contour lines
    // Each "elevation" is a family of closed-ish sine-sum curves centered on the canvas
    // We draw 6 elevation bands, each with 3–4 contour lines spaced ~18px apart
    const BANDS = 6;
    const LINES_PER_BAND = 4;
    const CX = W * 0.5, CY = H * 0.58;

    // Seeded-ish offsets so curves look organic, not symmetric
    const freqs = [
      [1.0, 0.48, 0.31, 0.19],
      [0.88, 0.53, 0.27, 0.22],
      [0.95, 0.41, 0.36, 0.17],
      [1.05, 0.62, 0.29, 0.24],
      [0.92, 0.44, 0.33, 0.21],
      [0.98, 0.57, 0.38, 0.15],
    ];
    const amps = [
      [38, 22, 14,  8],
      [42, 18, 16, 10],
      [35, 26, 12,  9],
      [44, 20, 18, 11],
      [40, 24, 13,  7],
      [36, 28, 15, 12],
    ];
    const phases = [
      [0,      1.2,  2.4,  0.7],
      [0.5,    2.1,  0.9,  1.8],
      [1.1,    0.3,  2.8,  1.4],
      [0.2,    1.7,  0.6,  2.2],
      [1.6,    0.8,  2.0,  0.4],
      [0.9,    2.5,  1.3,  1.0],
    ];

    for (let b = 0; b < BANDS; b++) {
      // Inner bands are brighter, outer are fainter
      const bandFrac = b / (BANDS - 1);           // 0 = innermost, 1 = outermost
      const baseRadius = 110 + b * 88;             // spread from center outward

      for (let l = 0; l < LINES_PER_BAND; l++) {
        const lineFrac = l / LINES_PER_BAND;
        const r = baseRadius + l * 20;

        // Opacity: inner/brighter lines glow more; outer lines whisper
        const opacity = (0.28 - bandFrac * 0.18) * (1 - lineFrac * 0.4);
        // Color: innermost lines lean bright green, outer lean teal-dark
        const g = Math.round(130 + (1 - bandFrac) * 60);
        const lineColor = `rgba(40,${g},75,${opacity.toFixed(3)})`;

        ctx.beginPath();
        ctx.strokeStyle = lineColor;
        ctx.lineWidth   = bandFrac < 0.35 ? 1.2 : 0.7;

        const STEPS = 320;
        for (let s = 0; s <= STEPS; s++) {
          const theta = (s / STEPS) * Math.PI * 2;
          // Distort radius with summed harmonics for organic shape
          let dr = 0;
          for (let h = 0; h < 4; h++) {
            dr += amps[b][h] * Math.sin(freqs[b][h] * theta + phases[b][h]);
          }
          const px = CX + (r + dr) * Math.cos(theta);
          const py = CY + (r + dr) * 0.48 * Math.sin(theta); // squash Y — landscape feels wide

          if (s === 0) ctx.moveTo(px, py);
          else         ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
      }
    }

    // Elevation accent dots — where contour lines would have tick marks
    for (let b = 0; b < BANDS; b++) {
      const r = 130 + b * 88;
      const dotCount = 8 + b * 3;
      const bandFrac = b / (BANDS - 1);
      for (let d = 0; d < dotCount; d++) {
        const theta = (d / dotCount) * Math.PI * 2;
        const dr = amps[b][0] * Math.sin(freqs[b][0] * theta + phases[b][0]) * 0.5;
        const px = CX + (r + dr) * Math.cos(theta);
        const py = CY + (r + dr) * 0.48 * Math.sin(theta);
        const op = 0.35 - bandFrac * 0.24;
        ctx.fillStyle = `rgba(80,200,120,${op.toFixed(3)})`;
        ctx.beginPath(); ctx.arc(px, py, 1.1, 0, Math.PI * 2); ctx.fill();
      }
    }

    // Fine inner highlight lines — very bright tight rings near center to imply peak
    for (let l = 0; l < 3; l++) {
      const r = 52 + l * 22;
      ctx.beginPath();
      ctx.strokeStyle = `rgba(60,180,100,${(0.22 - l * 0.06).toFixed(3)})`;
      ctx.lineWidth = 0.9;
      const STEPS = 200;
      for (let s = 0; s <= STEPS; s++) {
        const theta = (s / STEPS) * Math.PI * 2;
        const dr = 18 * Math.sin(2.1 * theta + 0.4) + 10 * Math.sin(3.3 * theta + 1.1);
        const px = CX + (r + dr) * Math.cos(theta);
        const py = CY + (r + dr) * 0.42 * Math.sin(theta);
        s === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath(); ctx.stroke();
    }

    // Subtle vignette to darken edges
    const vig = ctx.createRadialGradient(W/2, H/2, H*0.28, W/2, H/2, H*0.78);
    vig.addColorStop(0, 'transparent');
    vig.addColorStop(1, 'rgba(0,0,0,0.52)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);

    scene.add(new THREE.Mesh(
      new THREE.SphereGeometry(140, 48, 24),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), side: THREE.BackSide })
    ));
  })();

  // ─── Floating data particles ─────────────────────────────────────────────────
  (function () {
    const pos = new Float32Array(150 * 3);
    for (let i = 0; i < 150; i++) {
      pos[i*3]   = (Math.random() - 0.5) * 24;
      pos[i*3+1] = (Math.random() - 0.5) * 12;
      pos[i*3+2] = (Math.random() - 0.5) * 10 - 5;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    scene.add(new THREE.Points(geo, new THREE.PointsMaterial({
      color: 0x2d7a52, size: 0.045, sizeAttenuation: true,
      transparent: true, opacity: 0.45, depthWrite: false
    })));
  })();

  // ─── Glowing platform ring ───────────────────────────────────────────────────
  (function () {
    const c = document.createElement('canvas');
    c.width = 512; c.height = 512;
    const ctx = c.getContext('2d');
    const grd = ctx.createRadialGradient(256, 256, 80, 256, 256, 256);
    grd.addColorStop(0,    'rgba(0,0,0,0)');
    grd.addColorStop(0.72, 'rgba(0,0,0,0)');
    grd.addColorStop(0.84, 'rgba(45,122,82,0.22)');
    grd.addColorStop(0.90, 'rgba(45,122,82,0.50)');
    grd.addColorStop(0.95, 'rgba(100,200,140,0.26)');
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

    drawDesktop(scrollPhase, clock);
    drawMobile(scrollPhase, clock);

    smoothMx += (mx - smoothMx) * 0.04;
    smoothMy += (my - smoothMy) * 0.04;

    const sway = Math.sin(clock * 0.10);
    camera.position.x = sway * 1.0 + smoothMx * 0.5;
    camera.position.y = 1.4 + Math.sin(clock * 0.07) * 0.25 - smoothMy * 0.35;
    camera.position.z = 7.0 - Math.abs(sway) * 0.2;
    camera.lookAt(0.8 + smoothMx * 0.2, 0.3 - smoothMy * 0.12, 0);

    macGroup.position.y  = -0.8 + Math.sin(clock * 0.7) * 0.06;
    phoneGroup.position.y =  0.3 + Math.sin(clock * 0.7 + 1.3) * 0.08;
    phoneGroup.rotation.y = -0.28 + smoothMx * 0.03;

    greenLight.position.x  = Math.cos(clock * 0.35) * 6;
    greenLight.position.z  = Math.sin(clock * 0.35) * 6;
    orangeLight.position.x = Math.cos(clock * 0.27 + Math.PI) * 5;
    orangeLight.position.z = Math.sin(clock * 0.27 + Math.PI) * 5;

    renderer.render(scene, camera);
  }

  requestAnimationFrame(animate);
})();
