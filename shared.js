/* ============================================================================
   Charmiss Dashboard — shared.js
   Common utilities used across every module file (sales_overview_*.html,
   module_mt.html, module_tt.html, module_ecom.html). No external dependency —
   pure vanilla JS, self-contained on purpose (see the bug note in the project
   spec: never rely on an internet-hosted script).
   ============================================================================ */

/* ---------- Formatters ---------- */
function fmtTHB(v){
  const abs = Math.abs(v);
  let out;
  if(abs>=1e9) out = (v/1e9).toFixed(1).replace(/\.0$/,'')+'B';
  else if(abs>=1e6) out = (v/1e6).toFixed(1).replace(/\.0$/,'')+'M';
  else if(abs>=1e3) out = (v/1e3).toFixed(1).replace(/\.0$/,'')+'K';
  else out = String(Math.round(v));
  return '฿'+out;
}
function fmtPct(v,d){ return v.toFixed(d===undefined?1:d)+'%'; }
function fmtSignedPct(v,d){ return (v>=0?'+':'') + v.toFixed(d===undefined?1:d) + '%'; }
function fmtSignedPP(v){ const r = Math.round(v); return (r>=0?'+':'') + r + 'pp'; }
function deltaClass(v){ return v>=0?'pos':'neg'; }
function pctChange(cur,prev){ return prev===0?0:((cur-prev)/prev)*100; }
function sumRange(arr,s,e){ let sum=0; for(let i=s;i<=e;i++) sum+=arr[i]; return sum; }
function cssVar(name){ return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }

/* ---------- Seeded RNG (deterministic mock data across reloads) ---------- */
function mulberry32(seed){
  return function(){
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/* ---------- Sparkline (inline SVG, colors baked in at render time — see
   dark-mode note in buildLineChartSVG below for why) ---------- */
function sparklineSVG(values, color, formatter){
  const width=140, height=36, padX=2, padY=6;
  const min = Math.min(...values), max = Math.max(...values);
  const range = (max-min)||1;
  const stepX = (width-padX*2)/(values.length-1 || 1);
  const pts = values.map((v,i)=>{
    const x = padX + i*stepX;
    const y = padY + (1-(v-min)/range)*(height-padY*2);
    return [x,y];
  });
  const d = pts.map((p,i)=>(i===0?'M':'L')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' ');
  const last = pts[pts.length-1];
  const label = formatter(values[values.length-1]);
  const anchor = last[0] > width-42 ? 'end' : 'start';
  const lx = anchor==='end' ? width-2 : Math.min(last[0]+6, width-2);
  return '<svg viewBox="0 0 '+width+' '+(height+13)+'" width="100%" height="'+(height+13)+'" preserveAspectRatio="none">'
    + '<path d="'+d+'" fill="none" stroke="'+color+'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
    + '<circle cx="'+last[0].toFixed(1)+'" cy="'+last[1].toFixed(1)+'" r="3" fill="'+color+'"/>'
    + '<text x="'+lx+'" y="'+(height+11)+'" font-size="10" font-weight="700" fill="'+color+'" text-anchor="'+anchor+'">'+label+'</text>'
    + '</svg>';
}

/* ---------- Custom line/area chart (no external chart library) ---------- */
function buildLineChartSVG(containerId, opts){
  const {width=520, height=210, labels, series, yFormatter} = opts;
  const padL=40, padR=10, padT=10, padB=20;
  const plotW = width-padL-padR, plotH = height-padT-padB;
  let allVals = [];
  series.forEach(s => s.data.forEach(v => { if(v!==null && v!==undefined) allVals.push(v); }));
  if(allVals.length===0) allVals = [0,1];
  let yMin = Math.min(0, ...allVals);
  let yMax = Math.max(...allVals);
  if(yMax===yMin) yMax = yMin+1;
  yMax += (yMax-yMin)*0.12;
  if(yMin<0) yMin -= Math.abs(yMax-yMin)*0.08;

  const stepX = plotW/Math.max(1,(labels.length-1));
  const xAt = i => padL + i*stepX;
  const yAt = v => padT + (1-(v-yMin)/(yMax-yMin))*plotH;

  // Colors are resolved from the live CSS var and baked into the SVG string
  // rather than referenced as var(--x) inline — a theme toggle must therefore
  // call the render function again to repaint, same approach as module_tt.html.
  const hairline = cssVar('--hairline') || '#e1e0d9';
  const inkTertiary = cssVar('--ink-3') || '#898781';

  let gridSvg = '';
  const gridCount = 4;
  for(let g=0; g<=gridCount; g++){
    const val = yMin + (yMax-yMin)*(g/gridCount);
    const y = yAt(val);
    gridSvg += '<line x1="'+padL+'" y1="'+y.toFixed(1)+'" x2="'+(width-padR)+'" y2="'+y.toFixed(1)+'" stroke="'+hairline+'" stroke-width="1"/>';
    gridSvg += '<text x="'+(padL-6)+'" y="'+(y+3).toFixed(1)+'" font-size="9.5" text-anchor="end" fill="'+inkTertiary+'">'+yFormatter(val)+'</text>';
  }
  let xLabelSvg = '';
  const showEvery = labels.length>12 ? 2 : 1;
  labels.forEach((lb,i)=>{
    if(i%showEvery!==0 && i!==labels.length-1) return;
    xLabelSvg += '<text x="'+xAt(i).toFixed(1)+'" y="'+(height-5)+'" font-size="9.5" text-anchor="middle" fill="'+inkTertiary+'">'+lb+'</text>';
  });

  let seriesSvg = '';
  series.forEach(s=>{
    let d='', started=false, lastIdx=-1, firstIdx=-1;
    s.data.forEach((v,i)=>{
      if(v===null || v===undefined){ started=false; return; }
      const x=xAt(i), y=yAt(v);
      d += (started?'L':'M')+x.toFixed(1)+','+y.toFixed(1)+' ';
      started = true; lastIdx = i;
      if(firstIdx<0) firstIdx = i;
    });
    if(s.fill && lastIdx>=0){
      let areaD = d + 'L'+xAt(lastIdx).toFixed(1)+','+yAt(yMin).toFixed(1)+' L'+xAt(firstIdx).toFixed(1)+','+yAt(yMin).toFixed(1)+' Z';
      seriesSvg += '<path d="'+areaD+'" fill="'+s.color+'" opacity="0.12" stroke="none"/>';
    }
    seriesSvg += '<path d="'+d.trim()+'" fill="none" stroke="'+s.color+'" stroke-width="'+(s.width||2.2)+'" stroke-dasharray="'+(s.dash||'')+'" stroke-linecap="round" stroke-linejoin="round"/>';
    if(s.showLastLabel && lastIdx>=0){
      const x=xAt(lastIdx), y=yAt(s.data[lastIdx]);
      const label = s.lastLabelFormatter(s.data[lastIdx]);
      const anchor = x>width-64 ? 'end' : 'start';
      const lx = anchor==='end' ? x-6 : x+6;
      seriesSvg += '<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="3" fill="'+s.color+'"/>';
      seriesSvg += '<text x="'+lx.toFixed(1)+'" y="'+(y-8).toFixed(1)+'" font-size="10.5" font-weight="700" fill="'+s.color+'" text-anchor="'+anchor+'">'+label+'</text>';
    }
  });

  const svg = '<svg viewBox="0 0 '+width+' '+height+'" width="100%" height="100%" preserveAspectRatio="none">'+gridSvg+xLabelSvg+seriesSvg+'</svg>';
  document.getElementById(containerId).innerHTML = svg;
}

/* ---------- Custom donut chart (self-contained SVG) ---------- */
function polarPoint(cx,cy,r,angleDeg){
  const rad = angleDeg * Math.PI/180;
  return [cx + r*Math.cos(rad), cy + r*Math.sin(rad)];
}
function arcPath(cx,cy,r,a0,a1,strokeW){
  let end = a1;
  if(end-a0 >= 359.99) end = a0+359.99;
  const [x0,y0] = polarPoint(cx,cy,r,a0);
  const [x1,y1] = polarPoint(cx,cy,r,end);
  const largeArc = (end-a0) > 180 ? 1 : 0;
  return 'M '+x0.toFixed(2)+' '+y0.toFixed(2)+' A '+r+' '+r+' 0 '+largeArc+' 1 '+x1.toFixed(2)+' '+y1.toFixed(2);
}
function buildDonutSVG(containerId, segments, size){
  size = size || 140;
  const cx=size/2, cy=size/2, r=size/2-9, strokeW=15;
  const total = segments.reduce((a,s)=>a+s.value,0) || 1;
  let angleStart = -90, paths = '';
  segments.forEach(seg=>{
    const angle = seg.value/total*360;
    if(angle>0){
      paths += '<path d="'+arcPath(cx,cy,r,angleStart,angleStart+angle,strokeW)+'" fill="none" stroke="'+seg.color+'" stroke-width="'+strokeW+'" stroke-linecap="butt"/>';
    }
    angleStart += angle;
  });
  document.getElementById(containerId).innerHTML = '<svg viewBox="0 0 '+size+' '+size+'" width="100%" height="100%">'+paths+'</svg>';
}

/* ---------- Horizontal bar comparison (diverging from a reference value —
   used for "Growth YoY by Channel" (reference=0) and "Target Attainment by
   Channel" (reference=100)) ---------- */
function buildHBarCompareSVG(containerId, items, opts){
  opts = opts || {};
  const width = opts.width || 480;
  const rowHeight = opts.rowHeight || 44;
  const formatValue = opts.formatValue || (v => v);
  const labelW = opts.labelW || 90, valueW = 64, padX = 10;
  const plotW = width - labelW - valueW - padX*2;
  const height = items.length * rowHeight;
  let minV = opts.domainMin !== undefined ? opts.domainMin : Math.min(0, ...items.map(i=>i.value));
  let maxV = opts.domainMax !== undefined ? opts.domainMax : Math.max(0, ...items.map(i=>i.value));
  if(maxV === minV) maxV = minV + 1;
  const xAt = v => labelW + padX + ((v-minV)/(maxV-minV)) * plotW;
  const ref = opts.referenceValue !== undefined ? opts.referenceValue : 0;
  const refX = xAt(ref);

  let rows = '';
  items.forEach((it,i)=>{
    const y = i*rowHeight;
    const barY = y + rowHeight*0.28;
    const barH = rowHeight*0.42;
    const barX = xAt(it.value);
    const x0 = Math.min(refX, barX), barW = Math.max(1, Math.abs(barX-refX));
    rows += '<text x="'+(labelW-8)+'" y="'+(y+rowHeight/2+4)+'" font-size="12" text-anchor="end" fill="'+cssVar('--ink-2')+'">'+it.label+'</text>';
    rows += '<rect x="'+x0.toFixed(1)+'" y="'+barY.toFixed(1)+'" width="'+barW.toFixed(1)+'" height="'+barH.toFixed(1)+'" rx="4" fill="'+it.color+'"/>';
    rows += '<text x="'+(width-valueW+8)+'" y="'+(y+rowHeight/2+4)+'" font-size="12.5" font-weight="700" fill="'+cssVar('--ink-1')+'">'+formatValue(it.value)+'</text>';
  });
  const refLine = '<line x1="'+refX.toFixed(1)+'" y1="2" x2="'+refX.toFixed(1)+'" y2="'+(height-2)+'" stroke="'+cssVar('--ink-1')+'" stroke-width="1.3" stroke-dasharray="4,3"/>';

  document.getElementById(containerId).innerHTML =
    '<svg viewBox="0 0 '+width+' '+height+'" width="100%" height="'+height+'">'+refLine+rows+'</svg>';
}

/* ---------- Stacked area chart (percentage mix over time — used for
   "Channel Mix Over Time") ---------- */
function buildStackedAreaSVG(containerId, opts){
  const width = opts.width || 900, height = opts.height || 190;
  const labels = opts.labels, series = opts.series; // series: [{color, values:[...]}]
  const padL=6, padR=6, padT=8, padB=18;
  const plotW = width-padL-padR, plotH = height-padT-padB;
  const n = labels.length;
  const stepX = plotW/Math.max(1,n-1);
  const xAt = i => padL + i*stepX;

  const cum = [];
  for(let i=0;i<n;i++){
    let running = 0; const arr = [];
    series.forEach(s => { running += s.values[i]; arr.push(running); });
    cum.push(arr);
  }
  const maxTotal = Math.max(...cum.map(arr => arr[arr.length-1])) || 1;
  const yAt = v => padT + (1 - v/maxTotal) * plotH;

  let paths = '';
  for(let si = series.length-1; si >= 0; si--){
    let d = '';
    for(let i=0;i<n;i++){ const x=xAt(i), y=yAt(cum[i][si]); d += (i===0?'M':'L')+x.toFixed(1)+','+y.toFixed(1)+' '; }
    for(let i=n-1;i>=0;i--){ const x=xAt(i); const yBase = si===0 ? (padT+plotH) : yAt(cum[i][si-1]); d += 'L'+x.toFixed(1)+','+yBase.toFixed(1)+' '; }
    d += 'Z';
    paths += '<path d="'+d+'" fill="'+series[si].color+'" opacity="0.88"/>';
  }
  let xLabels = '';
  const showEvery = n > 12 ? 3 : 1;
  labels.forEach((lb,i) => {
    if(i%showEvery !== 0 && i !== n-1) return;
    xLabels += '<text x="'+xAt(i).toFixed(1)+'" y="'+(height-4)+'" font-size="9" text-anchor="middle" fill="'+cssVar('--ink-3')+'">'+lb+'</text>';
  });

  document.getElementById(containerId).innerHTML =
    '<svg viewBox="0 0 '+width+' '+height+'" width="100%" height="100%" preserveAspectRatio="none">'+paths+xLabels+'</svg>';
}

function downloadSVGFromContainer(containerId, filename){
  const svgEl = document.getElementById(containerId).querySelector('svg');
  if(!svgEl) return;
  const clone = svgEl.cloneNode(true);
  clone.setAttribute('xmlns','http://www.w3.org/2000/svg');
  const src = '<?xml version="1.0" encoding="UTF-8"?>\n' + clone.outerHTML;
  const blob = new Blob([src], {type:'image/svg+xml'});
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}
function downloadCSV(rows, filename){
  const csv = rows.map(r => r.map(v => '"' + String(v).replace(/"/g,'""') + '"').join(',')).join('\n');
  const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}
function toggleFullscreen(cardEl){
  if(!document.fullscreenElement){ cardEl.requestFullscreen && cardEl.requestFullscreen().catch(()=>{}); }
  else { document.exitFullscreen && document.exitFullscreen(); }
}

/* ---------- Information-icon popover (generic, works off data-info-title /
   data-info-text attributes on any .info-icon button already in the DOM) ---------- */
function initInfoPopovers(){
  const popoverEl = document.getElementById('popover');
  if(!popoverEl) return;
  const popoverTitleEl = document.getElementById('popoverTitle');
  const popoverTextEl = document.getElementById('popoverText');
  let activeInfoIcon = null;
  function closePopover(){ popoverEl.classList.remove('open'); activeInfoIcon = null; }
  document.querySelectorAll('.info-icon').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      e.stopPropagation();
      if(activeInfoIcon === btn){ closePopover(); return; }
      activeInfoIcon = btn;
      popoverTitleEl.textContent = btn.dataset.infoTitle;
      popoverTextEl.textContent = btn.dataset.infoText;
      popoverEl.classList.add('open');
      const rect = btn.getBoundingClientRect();
      const pw = 270;
      let left = rect.left;
      if(left + pw > window.innerWidth - 12) left = window.innerWidth - pw - 12;
      popoverEl.style.left = Math.max(12,left) + 'px';
      popoverEl.style.top = (rect.bottom + 8) + 'px';
    });
  });
  document.addEventListener('click', (e)=>{ if(activeInfoIcon && !popoverEl.contains(e.target)) closePopover(); });
  document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closePopover(); });
}

/* ---------- Dark mode toggle. SVG colors are baked in at render time (see
   buildLineChartSVG comment), so toggling calls `onToggle` to force a full
   re-render — pass in whatever function redraws the current page's charts. ---------- */
function initThemeToggle(onToggle){
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');
  if(!themeToggle) return;
  const MOON = '<path d="M13.5 9.5A5.5 5.5 0 016.5 2.5a5.5 5.5 0 105.5 6.5"/>';
  const SUN = '<circle cx="8" cy="8" r="3"/><path d="M8 1.5v1.5M8 13v1.5M2.5 8H1M15 8h-1.5M3.5 3.5l1 1M11.5 11.5l1 1M12.5 3.5l-1 1M4.5 11.5l-1 1"/>';
  let isDark = false;
  themeToggle.addEventListener('click', ()=>{
    isDark = !isDark;
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    themeIcon.innerHTML = isDark ? SUN : MOON;
    if(typeof onToggle === 'function') onToggle();
  });
}
