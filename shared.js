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
function sparklineSVG(containerId, values, color, formatter){
  // Fix (2026-08-03): same horizontal-stretch bug as buildLineChartSVG
  // (fixed 2026-07-30) — fixed viewBox width=140 with width="100%" and
  // preserveAspectRatio="none" meant the browser scaled X/Y independently
  // whenever the actual container was wider than 140px (it almost always
  // is, inside a KPI card). Fix: measure the real container width and use
  // that as the viewBox width so the scale factor is 1:1 and nothing
  // (path or text) gets stretched.
  const container = document.getElementById(containerId);
  const width = (container && container.clientWidth) || 140, height=36, padX=2, padY=6;
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

/* ---------- "Nice numbers for graph labels" (Heckbert) — used by
   buildLineChartSVG so Y-axis ticks land on clean round numbers (0, 10, 20…)
   instead of dividing the raw min/max into 4 arbitrary fractions, which used
   to produce confusing ticks like 9.6 / 19.3. ---------- */
function niceNum(range, round){
  if(range <= 0) return 0;
  const exponent = Math.floor(Math.log10(range));
  const fraction = range / Math.pow(10, exponent);
  let niceFraction;
  if(round){
    if(fraction < 1.5) niceFraction = 1;
    else if(fraction < 3) niceFraction = 2;
    else if(fraction < 7) niceFraction = 5;
    else niceFraction = 10;
  } else {
    if(fraction <= 1) niceFraction = 1;
    else if(fraction <= 2) niceFraction = 2;
    else if(fraction <= 5) niceFraction = 5;
    else niceFraction = 10;
  }
  return niceFraction * Math.pow(10, exponent);
}
function niceAxisTicks(rawMin, rawMax, targetTickCount){
  targetTickCount = targetTickCount || 5;
  if(rawMin === rawMax) rawMax = rawMin + 1;
  const range = niceNum(rawMax - rawMin, false);
  const spacing = niceNum(range / (targetTickCount - 1), true) || 1;
  const niceMin = Math.floor(rawMin / spacing) * spacing;
  const niceMax = Math.ceil(rawMax / spacing) * spacing;
  const ticks = [];
  for(let v = niceMin; v <= niceMax + spacing*0.001; v += spacing) ticks.push(Math.round(v/spacing)*spacing);
  return { min: niceMin, max: niceMax, spacing, ticks };
}

/* ---------- Custom line/area chart (no external chart library) ---------- */
function buildLineChartSVG(containerId, opts){
  const container = document.getElementById(containerId);
  // Fix (2026-07-30): text/lines looked horizontally stretched whenever a
  // card was rendered wider than the old fixed viewBox (520). The <svg> was
  // set to width="100%" with preserveAspectRatio="none", so the browser
  // scaled X and Y independently to fill the container — if the container's
  // actual pixel width didn't match the viewBox width, everything (including
  // text glyphs) got stretched non-uniformly. Fix: measure the container's
  // real rendered width and use that as the viewBox width, so the scale
  // factor is always 1:1 and nothing distorts.
  const measuredWidth = container ? container.clientWidth : 0;
  const width = opts.width || measuredWidth || 520;
  // Fix (2026-08-03): same non-uniform-stretch bug as the width fix above,
  // but on the vertical axis — if a card's canvas-wrap CSS height (e.g.
  // 250px, 320px) didn't match this function's hardcoded height default
  // (210) or whatever opts.height was passed, preserveAspectRatio="none"
  // stretched Y independently of X, distorting text glyphs (letters looked
  // oddly tall/expanded). Now measures the container's real rendered height
  // the same way width is measured, so the two stay in sync automatically
  // even if a card's CSS height is changed later without updating the JS call.
  const measuredHeight = container ? container.clientHeight : 0;
  const height = opts.height || measuredHeight || 210;
  const {labels, series, yFormatter} = opts;
  const padL=40, padR=10, padT=10, padB=20;
  const plotW = width-padL-padR, plotH = height-padT-padB;
  let allVals = [];
  series.forEach(s => s.data.forEach(v => { if(v!==null && v!==undefined) allVals.push(v); }));
  if(allVals.length===0) allVals = [0,1];
  const dataMin = Math.min(0, ...allVals);
  const dataMax = Math.max(...allVals);
  const headroom = (dataMax-dataMin)*0.08 || Math.abs(dataMax)*0.08 || 1;
  const nice = niceAxisTicks(dataMin, dataMax + headroom, 5);
  let yMin = nice.min, yMax = nice.max;
  if(yMax===yMin) yMax = yMin+1;

  const stepX = plotW/Math.max(1,(labels.length-1));
  const xAt = i => padL + i*stepX;
  const yAt = v => padT + (1-(v-yMin)/(yMax-yMin))*plotH;

  // Colors are resolved from the live CSS var and baked into the SVG string
  // rather than referenced as var(--x) inline — a theme toggle must therefore
  // call the render function again to repaint, same approach as module_tt.html.
  const hairline = cssVar('--hairline') || '#e1e0d9';
  const inkTertiary = cssVar('--ink-3') || '#898781';

  // Fix (2026-08-03): Y-axis ticks now come from niceAxisTicks (clean round
  // numbers) instead of splitting raw min/max into 4 even fractions, which
  // used to print confusing ticks like "9.6M" / "19.3M".
  let gridSvg = '';
  nice.ticks.forEach(val=>{
    const y = yAt(val);
    gridSvg += '<line x1="'+padL+'" y1="'+y.toFixed(1)+'" x2="'+(width-padR)+'" y2="'+y.toFixed(1)+'" stroke="'+hairline+'" stroke-width="1"/>';
    gridSvg += '<text x="'+(padL-6)+'" y="'+(y+3).toFixed(1)+'" font-size="9.5" text-anchor="end" fill="'+inkTertiary+'">'+yFormatter(val)+'</text>';
  });
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
      // Fix (2026-08-03): lastLabelFormatter now also receives the point's
      // index, so callers can look up a parallel value (e.g. THB amount for
      // a %-based line) via closure and show both in one label. Existing
      // callers that only read the first arg are unaffected.
      const label = s.lastLabelFormatter(s.data[lastIdx], lastIdx);
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
function buildDonutSVG(containerId, segments, size, opts){
  opts = opts || {};
  size = size || 140;
  const cx=size/2, cy=size/2, r=size/2-9, strokeW=15;
  const total = segments.reduce((a,s)=>a+s.value,0) || 1;
  let angleStart = -90, paths = '', labels = '';
  const inkOne = cssVar('--ink-1') || '#0b0b0b';
  segments.forEach(seg=>{
    const angle = seg.value/total*360;
    if(angle>0){
      paths += '<path d="'+arcPath(cx,cy,r,angleStart,angleStart+angle,strokeW)+'" fill="none" stroke="'+seg.color+'" stroke-width="'+strokeW+'" stroke-linecap="butt"/>';
      if(opts.showLabels && angle > 12){
        const midAngle = angleStart + angle/2;
        const labelR = r + strokeW/2 + 10;
        const [lx,ly] = polarPoint(cx,cy,labelR,midAngle);
        const pct = (seg.value/total*100).toFixed(0)+'%';
        labels += '<text x="'+lx.toFixed(1)+'" y="'+(ly+3).toFixed(1)+'" font-size="10.5" font-weight="700" text-anchor="middle" fill="'+inkOne+'">'+pct+'</text>';
      }
    }
    angleStart += angle;
  });
  document.getElementById(containerId).innerHTML = '<svg viewBox="0 0 '+size+' '+size+'" width="100%" height="100%" overflow="visible">'+paths+labels+'</svg>';
}

/* ---------- Horizontal bar comparison (diverging from a reference value —
   used for "Growth YoY by Channel" (reference=0) and "Target Attainment by
   Channel" (reference=100)) ---------- */
function buildHBarCompareSVG(containerId, items, opts){
  opts = opts || {};
  const container = document.getElementById(containerId);
  const measuredWidth = container ? container.clientWidth : 0;
  const width = opts.width || measuredWidth || 480;
  const rowHeight = opts.rowHeight || 44;
  const formatValue = opts.formatValue || (v => v);
  const labelW = opts.labelW || 90, valueW = 64, padX = 10;
  const plotW = width - labelW - valueW - padX*2;
  const height = items.length * rowHeight;
  // Fix (2026-08-01, see Charmiss_Dashboard_Review_2026-07-31.md Task 2.2/6.3):
  // the default domain used to always force 0 in as a boundary
  // (Math.min(0,...)/Math.max(0,...)), regardless of where referenceValue
  // sits. That's harmless when referenceValue is 0, but for a
  // referenceValue:100 chart (Target Attainment %) whose values naturally
  // cluster near 100, it dragged the domain all the way down to 0 anyway —
  // wasting most of the plot width on empty space and leaving the actual
  // bars as an almost invisible sliver. The domain now anchors on the
  // reference value instead of a hardcoded 0, plus 15% padding (matching
  // buildGroupedBarSVG's padding convention) so bars never sit flush against
  // the plot edges or the reference line.
  const ref = opts.referenceValue !== undefined ? opts.referenceValue : 0;
  let minV = opts.domainMin !== undefined ? opts.domainMin : Math.min(ref, ...items.map(i=>i.value));
  let maxV = opts.domainMax !== undefined ? opts.domainMax : Math.max(ref, ...items.map(i=>i.value));
  if(maxV === minV) maxV = minV + 1;
  if(opts.domainMin === undefined && opts.domainMax === undefined){
    const pad = (maxV - minV) * 0.15;
    minV -= pad; maxV += pad;
  }
  const xAt = v => labelW + padX + ((v-minV)/(maxV-minV)) * plotW;
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
  const container = document.getElementById(containerId);
  const measuredWidth = container ? container.clientWidth : 0;
  const width = opts.width || measuredWidth || 900, height = opts.height || 190;
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
    const hl = series[si].highlight;
    paths += '<path d="'+d+'" fill="'+series[si].color+'" opacity="'+(hl?0.96:0.88)+'"'+(hl?' stroke="'+(cssVar('--ink-1')||'#2a2a28')+'" stroke-width="1.5"':'')+'/>';
  }
  let xLabels = '';
  const showEvery = n > 12 ? 3 : 1;
  labels.forEach((lb,i) => {
    if(i%showEvery !== 0 && i !== n-1) return;
    // Edge-aware anchor: a centered label at the very first/last point
    // overflows past the viewBox (padL/padR are only 6px, nowhere near half
    // a label's width) and gets clipped by the SVG viewport. Anchor the
    // first label to grow rightward and the last to grow leftward instead,
    // so both stay fully inside the plot regardless of padding.
    const anchor = i===0 ? 'start' : (i===n-1 ? 'end' : 'middle');
    xLabels += '<text x="'+xAt(i).toFixed(1)+'" y="'+(height-4)+'" font-size="9" text-anchor="'+anchor+'" fill="'+cssVar('--ink-3')+'">'+lb+'</text>';
  });

  document.getElementById(containerId).innerHTML =
    '<svg viewBox="0 0 '+width+' '+height+'" width="100%" height="100%" preserveAspectRatio="none">'+paths+xLabels+'</svg>';
}

/* ---------- Grouped (clustered) vertical bar chart — used for "Growth YoY by
   Channel" (grouped by month) and "Channel Index by Category" (grouped by
   category) ---------- */
function buildGroupedBarSVG(containerId, opts){
  const container = document.getElementById(containerId);
  const width = opts.width || (container ? container.clientWidth : 0) || 520;
  // Fix (2026-08-03): measure real container height (same fix as
  // buildLineChartSVG) so a card's canvas-wrap CSS height always matches the
  // SVG viewBox — otherwise preserveAspectRatio="none" stretches bars/text
  // vertically whenever the CSS height and this default (220) disagree.
  const height = opts.height || (container ? container.clientHeight : 0) || 220;
  const labels = opts.labels, series = opts.series; // series: [{name, color, values:[...]}]
  const yFormatter = opts.yFormatter || (v=>v);
  const baseline = opts.referenceValue !== undefined ? opts.referenceValue : 0;
  const padL=44, padR=10, padT=18, padB=30;
  const plotW = width-padL-padR, plotH = height-padT-padB;

  let allVals = [];
  series.forEach(s => s.values.forEach(v => allVals.push(v)));
  if(allVals.length===0) allVals=[baseline, baseline+1];
  // Domain is centered around the baseline (0, or 100 for a diverging-from-100
  // index chart) rather than always forcing 0 in — otherwise a chart whose
  // values cluster around 100 would render as a sliver at the very top of a
  // 0-130 range instead of a proper diverging chart.
  let rawMin = Math.min(baseline, ...allVals), rawMax = Math.max(baseline, ...allVals);
  if(rawMax===rawMin) rawMax = rawMin+1;
  const span = rawMax-rawMin;
  // Only pad *below* the baseline if some value actually sits below it (e.g.
  // an index chart diverging under 100) — otherwise a plain 0-anchored bar
  // chart (all values positive) would get a nonsensical negative tick like
  // "-20M" from padding underneath a floor nothing ever reaches.
  const padBelow = rawMin < baseline ? span*0.18 : 0;
  const padAbove = span*0.18;
  // Fix (2026-08-03): ticks now come from niceAxisTicks (clean round numbers)
  // instead of splitting raw min/max into 4 even fractions — same fix as
  // buildLineChartSVG, applied here too since this function shares the bug.
  const nice = niceAxisTicks(rawMin-padBelow, rawMax+padAbove, 5);
  let yMin = nice.min, yMax = nice.max;
  if(yMax===yMin) yMax = yMin+1;
  const yAt = v => padT + (1-(v-yMin)/(yMax-yMin))*plotH;
  const baseY = yAt(baseline);

  const hairline = cssVar('--hairline') || '#e1e0d9';
  const inkTertiary = cssVar('--ink-3') || '#898781';
  const inkOne = cssVar('--ink-1') || '#0b0b0b';

  let gridSvg = '';
  nice.ticks.forEach(val=>{
    const y = yAt(val);
    gridSvg += '<line x1="'+padL+'" y1="'+y.toFixed(1)+'" x2="'+(width-padR)+'" y2="'+y.toFixed(1)+'" stroke="'+hairline+'" stroke-width="1"/>';
    gridSvg += '<text x="'+(padL-6)+'" y="'+(y+3).toFixed(1)+'" font-size="9.5" text-anchor="end" fill="'+inkTertiary+'">'+yFormatter(val)+'</text>';
  });

  const groupCount = labels.length, seriesCount = series.length;
  // Fix (2026-08-03): added explicit spacing between groups (e.g. MT / TT /
  // Ecom) — previously groups had no gap beyond the same 3px used between
  // bars within a group, so adjacent groups' bars visually ran together into
  // one continuous block. groupGap is reserved off plotW up front so bar
  // width/positions still fill each group's slot exactly as before.
  // Responsive fix (2026-08-03): scale the group gap down on narrow
  // containers (mobile) instead of a flat 14px always — a fixed 14px eats a
  // disproportionate share of plotW when the chart itself is narrow, leaving
  // even less room for bars/labels than necessary.
  const groupGap = opts.groupGap !== undefined ? opts.groupGap : Math.max(6, Math.min(14, width/40));
  const groupW = (plotW - groupGap*Math.max(0,groupCount-1))/Math.max(1,groupCount);
  const barGap = 3;
  const barW = Math.max(2, (groupW - barGap*(seriesCount+1))/seriesCount);
  const valueLabelFormatter = opts.valueLabelFormatter || yFormatter;

  let bars = '', xLabels = '', valueLabels = '';
  labels.forEach((lb,gi)=>{
    const groupX = padL + gi*(groupW+groupGap);
    series.forEach((s,si)=>{
      const val = s.values[gi];
      const barX = groupX + barGap + si*(barW+barGap);
      const y1 = yAt(val);
      const y0 = Math.min(y1, baseY);
      const h = Math.max(0.5, Math.abs(y1-baseY));
      const color = opts.colorFn ? opts.colorFn(s, val) : s.color;
      bars += '<rect x="'+barX.toFixed(1)+'" y="'+y0.toFixed(1)+'" width="'+barW.toFixed(1)+'" height="'+h.toFixed(1)+'" rx="2" fill="'+color+'"/>';
      if(opts.showValueLabels){
        const above = val >= baseline;
        // Fix (2026-08-03): valueLabelFormatter can now return either a plain
        // string (old behavior, single line in the bar's own color) or an
        // array of lines — each line either a string or a {text,color} object
        // — so callers can stack multiple meaning-colored labels on one bar
        // (e.g. "Growth YoY" + "Net Sales" on a single "This Year" bar).
        // Extra args (s, gi, barW) are new; existing callers that only read
        // the first arg are unaffected. barW is passed so a caller CAN adapt
        // its own text (e.g. shorten "101% attain" to "101%") when bars are
        // narrow, but this isn't required — the generic safety net below
        // (compactLabels) protects any caller that doesn't bother.
        const raw = valueLabelFormatter(val, s, gi, barW);
        let lines = Array.isArray(raw) ? raw : [raw];
        // Responsive fix (2026-08-03): on a narrow container (e.g. mobile),
        // barW shrinks but font-size/text length don't, so stacked multi-line
        // labels started overlapping neighboring bars. Below ~55px per bar,
        // drop down to just the first (most important) line; below ~30px,
        // also shrink the font further; below ~16px there's no width left
        // that could render legible text at all, so skip labels on that bar
        // entirely rather than paint illegible/overlapping glyphs — the
        // "view as table" toggle still has the exact numbers.
        const compactLabels = barW < 55;
        if(compactLabels && lines.length>1) lines = [lines[0]];
        if(barW < 22) lines = [];
        const labelFontSize = barW < 30 ? 7.5 : 9;
        const lineH = labelFontSize + 1;
        lines.forEach((ln, li)=>{
          const isObj = ln && typeof ln === 'object';
          const text = isObj ? ln.text : ln;
          const fillColor = isObj && ln.color ? ln.color : color;
          const ly = above ? (y1-4-(lines.length-1-li)*lineH) : (y1+11+li*lineH);
          valueLabels += '<text x="'+(barX+barW/2).toFixed(1)+'" y="'+ly.toFixed(1)+'" font-size="'+labelFontSize+'" font-weight="700" text-anchor="middle" fill="'+fillColor+'">'+text+'</text>';
        });
      }
    });
    xLabels += '<text x="'+(groupX+groupW/2).toFixed(1)+'" y="'+(height-6)+'" font-size="9.5" text-anchor="middle" fill="'+inkTertiary+'">'+lb+'</text>';
  });

  const refLine = '<line x1="'+padL+'" y1="'+baseY.toFixed(1)+'" x2="'+(width-padR)+'" y2="'+baseY.toFixed(1)+'" stroke="'+(opts.referenceValue!==undefined?inkOne:hairline)+'" stroke-width="1.3" stroke-dasharray="'+(opts.referenceValue!==undefined?'4,3':'none')+'"/>';

  document.getElementById(containerId).innerHTML =
    '<svg viewBox="0 0 '+width+' '+height+'" width="100%" height="100%" preserveAspectRatio="none">'+gridSvg+refLine+bars+valueLabels+xLabels+'</svg>';
}

/* ---------- Scatter plot with median-split quadrant lines — used for
   "Category Portfolio Matrix" (Growth-Share) ---------- */
function median(arr){
  const s = [...arr].sort((a,b)=>a-b);
  const mid = Math.floor(s.length/2);
  return s.length % 2 ? s[mid] : (s[mid-1]+s[mid])/2;
}
function buildScatterSVG(containerId, points, opts){
  opts = opts || {};
  const container = document.getElementById(containerId);
  const width = opts.width || (container ? container.clientWidth : 0) || 480;
  const height = opts.height || (container ? container.clientHeight : 0) || 260;
  // Axis titles (opts.xAxisTitle / opts.yAxisTitle) are optional — when present,
  // reserve extra room so the title sits in its own row/column rather than
  // overlapping the tick labels. Padding stays at the old defaults when no
  // title is passed, so existing callers render unchanged.
  const hasXTitle = !!opts.xAxisTitle, hasYTitle = !!opts.yAxisTitle;
  const padL = 58 + (hasYTitle?16:0), padR=18, padT=18, padB = 38 + (hasXTitle?16:0);
  const plotW = width-padL-padR, plotH = height-padT-padB;
  const xFormatter = opts.xFormatter || (v=>v);
  const yFormatter = opts.yFormatter || (v=>v);

  const xs = points.map(p=>p.x), ys = points.map(p=>p.y);
  const rawXMin = Math.min(...xs), rawXMax = Math.max(...xs);
  const rawYMin = Math.min(...ys), rawYMax = Math.max(...ys);
  const xPad = (rawXMax-rawXMin)*0.18 || Math.abs(rawXMax)*0.2 || 1, yPad = (rawYMax-rawYMin)*0.18 || Math.abs(rawYMax)*0.2 || 1;
  // Fix: axis ticks now come from niceAxisTicks (clean round numbers) instead
  // of splitting the padded raw min/max into 4 even fractions, which used to
  // print confusing values like "฿7.3M" / "-9.0%". Same fix already applied
  // to buildLineChartSVG/buildGroupedBarSVG/buildWaterfallSVG.
  const niceX = niceAxisTicks(rawXMin-xPad, rawXMax+xPad, 5);
  const niceY = niceAxisTicks(rawYMin-yPad, rawYMax+yPad, 5);
  let xMin = niceX.min, xMax = niceX.max;
  let yMin = niceY.min, yMax = niceY.max;
  if(xMax===xMin) xMax = xMin+1;
  if(yMax===yMin) yMax = yMin+1;
  const xAt = v => padL + (v-xMin)/(xMax-xMin)*plotW;
  const yAt = v => padT + (1-(v-yMin)/(yMax-yMin))*plotH;

  const medX = opts.medianX !== undefined ? opts.medianX : median(xs);
  const medY = opts.medianY !== undefined ? opts.medianY : median(ys);
  const hairline = cssVar('--hairline') || '#e1e0d9';
  const inkTertiary = cssVar('--ink-3') || '#898781';
  const inkTwo = cssVar('--ink-2') || '#52514e';

  let svg = '';
  /* --- Axis gridlines + tick values (Y on the left, X along the bottom) --- */
  niceY.ticks.forEach(yv=>{
    const gy = yAt(yv);
    svg += '<line x1="'+padL+'" y1="'+gy.toFixed(1)+'" x2="'+(width-padR)+'" y2="'+gy.toFixed(1)+'" stroke="'+hairline+'" stroke-width="1"/>';
    svg += '<text x="'+(padL-6)+'" y="'+(gy+3).toFixed(1)+'" font-size="9" text-anchor="end" fill="'+inkTertiary+'">'+yFormatter(yv)+'</text>';
  });
  niceX.ticks.forEach(xv=>{
    const gx = xAt(xv);
    svg += '<line x1="'+gx.toFixed(1)+'" y1="'+padT+'" x2="'+gx.toFixed(1)+'" y2="'+(height-padB)+'" stroke="'+hairline+'" stroke-width="0.6" opacity="0.5"/>';
    svg += '<text x="'+gx.toFixed(1)+'" y="'+(height-padB+14)+'" font-size="9" text-anchor="middle" fill="'+inkTertiary+'">'+xFormatter(xv)+'</text>';
  });

  /* --- Median-split quadrant lines (emphasized, dashed) --- */
  const mx = xAt(medX), my = yAt(medY);
  svg += '<line x1="'+mx.toFixed(1)+'" y1="'+padT+'" x2="'+mx.toFixed(1)+'" y2="'+(height-padB)+'" stroke="'+inkTertiary+'" stroke-width="1.4" stroke-dasharray="4,3"/>';
  svg += '<line x1="'+padL+'" y1="'+my.toFixed(1)+'" x2="'+(width-padR)+'" y2="'+my.toFixed(1)+'" stroke="'+inkTertiary+'" stroke-width="1.4" stroke-dasharray="4,3"/>';

  if(opts.quadrantLabels){
    const ql = opts.quadrantLabels;
    svg += '<text x="'+(width-padR-4)+'" y="'+(padT+12)+'" font-size="9.5" text-anchor="end" fill="'+inkTertiary+'" font-weight="700">'+(ql.topRight||'')+'</text>';
    svg += '<text x="'+(padL+4)+'" y="'+(padT+12)+'" font-size="9.5" text-anchor="start" fill="'+inkTertiary+'" font-weight="700">'+(ql.topLeft||'')+'</text>';
    svg += '<text x="'+(width-padR-4)+'" y="'+(height-padB-6)+'" font-size="9.5" text-anchor="end" fill="'+inkTertiary+'" font-weight="700">'+(ql.bottomRight||'')+'</text>';
    svg += '<text x="'+(padL+4)+'" y="'+(height-padB-6)+'" font-size="9.5" text-anchor="start" fill="'+inkTertiary+'" font-weight="700">'+(ql.bottomLeft||'')+'</text>';
  }

  // Label-collision avoidance (fix logged 2026-08-01, see
  // Charmiss_Dashboard_Review_2026-07-31.md Task 2.1): labels used to always
  // sit fixed just above each point, which collided with (a) the quadrant
  // corner labels when a point landed near a corner, and (b) each other when
  // two points landed close together. Placed labels are now tracked and any
  // point whose default label would sit too close to the top edge (where the
  // quadrant labels live) or too close to an already-placed label gets its
  // label flipped below the point instead.
  const placedLabels = [];
  points.forEach(p=>{
    const cx = xAt(p.x), cy = yAt(p.y);
    let ly = cy - 10;
    const nearTopEdge = (cy - padT) < 26;
    const collidesWithPlaced = placedLabels.some(q => Math.abs(q.x-cx) < 46 && Math.abs(q.y-ly) < 14);
    if(nearTopEdge || collidesWithPlaced) ly = cy + 16;
    placedLabels.push({x:cx, y:ly});
    svg += '<circle cx="'+cx.toFixed(1)+'" cy="'+cy.toFixed(1)+'" r="'+(p.r||7)+'" fill="'+p.color+'" opacity="0.88"/>';
    svg += '<text x="'+cx.toFixed(1)+'" y="'+ly.toFixed(1)+'" font-size="10.5" font-weight="700" text-anchor="middle" fill="'+inkTwo+'">'+p.label+'</text>';
  });

  /* --- Axis titles: real chart-axis labels, not a caption floated outside the
     plot. X-title sits centered under the tick-label row; Y-title is rotated
     -90deg and sits left of the tick-label column. --- */
  if(hasXTitle){
    svg += '<text x="'+(padL+plotW/2).toFixed(1)+'" y="'+(height-6)+'" font-size="10.5" font-weight="700" text-anchor="middle" fill="'+inkTwo+'">'+opts.xAxisTitle+'</text>';
  }
  if(hasYTitle){
    const tx = 14, ty = padT+plotH/2;
    svg += '<text x="'+tx+'" y="'+ty.toFixed(1)+'" font-size="10.5" font-weight="700" text-anchor="middle" fill="'+inkTwo+'" transform="rotate(-90 '+tx+' '+ty.toFixed(1)+')">'+opts.yAxisTitle+'</text>';
  }

  document.getElementById(containerId).innerHTML =
    '<svg viewBox="0 0 '+width+' '+height+'" width="100%" height="100%" preserveAspectRatio="none">'+svg+'</svg>';
}

/* ---------- Trajectory sparkline — solid line through actual months, dashed
   glide-path from the latest actual point to a projected year-end value.
   Used for the "Full Year Forecast" KPI card. ---------- */
function buildTrajectorySparklineSVG(containerId, actualValues, projectedEndValue, color, formatter){
  // Fix (2026-08-03): same fixed-viewBox stretch bug as sparklineSVG above —
  // measure the real container width instead of hardcoding 140.
  const container = document.getElementById(containerId);
  const totalMonths = 12, width=(container && container.clientWidth) || 140, height=36, padX=2, padY=6;
  const allForRange = actualValues.concat([projectedEndValue]);
  const min = Math.min(...allForRange), max = Math.max(...allForRange);
  const range = (max-min) || 1;
  const stepX = (width-padX*2)/(totalMonths-1);
  const xAt = i => padX + i*stepX;
  const yAt = v => padY + (1-(v-min)/range)*(height-padY*2);

  const actualPts = actualValues.map((v,i)=>[xAt(i), yAt(v)]);
  const dSolid = actualPts.map((p,i)=>(i===0?'M':'L')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' ');
  const lastActual = actualPts[actualPts.length-1];
  const endPt = [xAt(totalMonths-1), yAt(projectedEndValue)];
  const dDash = 'M'+lastActual[0].toFixed(1)+','+lastActual[1].toFixed(1)+' L'+endPt[0].toFixed(1)+','+endPt[1].toFixed(1);

  const label = formatter(projectedEndValue);
  const anchor = endPt[0] > width-42 ? 'end' : 'start';
  const lx = anchor==='end' ? width-2 : Math.min(endPt[0]+6, width-2);

  return '<svg viewBox="0 0 '+width+' '+(height+13)+'" width="100%" height="'+(height+13)+'" preserveAspectRatio="none">'
    + '<path d="'+dSolid+'" fill="none" stroke="'+color+'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
    + '<path d="'+dDash+'" fill="none" stroke="'+color+'" stroke-width="2" stroke-dasharray="3,3" stroke-linecap="round" opacity="0.6"/>'
    + '<circle cx="'+lastActual[0].toFixed(1)+'" cy="'+lastActual[1].toFixed(1)+'" r="2.6" fill="'+color+'"/>'
    + '<circle cx="'+endPt[0].toFixed(1)+'" cy="'+endPt[1].toFixed(1)+'" r="3" fill="none" stroke="'+color+'" stroke-width="1.6"/>'
    + '<text x="'+lx+'" y="'+(height+11)+'" font-size="10" font-weight="700" fill="'+color+'" text-anchor="'+anchor+'">'+label+'</text>'
    + '</svg>';
}

/* ---------- Waterfall chart — used for "Growth Contribution Waterfall".
   steps: [{label, value, type}] where type is 'start'|'end' (neutral/ink bar,
   value is an absolute total) or 'delta' (value is a +/- contribution,
   colored green/red). Each delta bar floats from the previous bar's top. ---------- */
function buildWaterfallSVG(containerId, steps, opts){
  opts = opts || {};
  const container = document.getElementById(containerId);
  const width = opts.width || (container ? container.clientWidth : 0) || 600;
  // Fix (2026-08-03): same height-measurement fix as buildLineChartSVG/
  // buildGroupedBarSVG — use the container's real rendered height instead of
  // a hardcoded default, so it always matches the card's CSS canvas-wrap height.
  const height = opts.height || (container ? container.clientHeight : 0) || 240;
  const yFormatter = opts.yFormatter || (v=>v);
  const padL=54, padR=16, padT=16, padB=34;
  const plotW = width-padL-padR, plotH = height-padT-padB;

  // running totals to know each bar's floating base/top
  let running = 0;
  const bars = steps.map(st=>{
    if(st.type==='start'){ const base=0, top=st.value; running=st.value; return {base, top, value:st.value}; }
    if(st.type==='end'){ return {base:0, top:st.value, value:st.value}; }
    const base = running, top = running+st.value; running = top;
    return {base, top, value:st.value};
  });

  const allEdges = bars.flatMap(b=>[b.base,b.top]);
  let rawMin = Math.min(0, ...allEdges), rawMax = Math.max(0, ...allEdges);
  if(rawMax===rawMin) rawMax=rawMin+1;
  const span = rawMax-rawMin;
  const padBelow = rawMin < 0 ? span*0.15*0.3 : 0;
  const padAbove = span*0.15;
  // Fix (2026-08-03): same niceAxisTicks fix as buildLineChartSVG/buildGroupedBarSVG
  // — clean round ticks instead of splitting raw min/max into 4 even fractions.
  const nice = niceAxisTicks(rawMin-padBelow, rawMax+padAbove, 5);
  let yMin = nice.min, yMax = nice.max;
  if(yMax===yMin) yMax = yMin+1;
  const yAt = v => padT + (1-(v-yMin)/(yMax-yMin))*plotH;

  const hairline = cssVar('--hairline')||'#e1e0d9', inkTertiary = cssVar('--ink-3')||'#898781', inkOne = cssVar('--ink-1')||'#0b0b0b';
  const good = cssVar('--good-text')||'#006300', bad = cssVar('--critical')||'#d03b3b', neutral = cssVar('--ink-2')||'#52514e';

  let gridSvg='';
  nice.ticks.forEach(val=>{
    const y = yAt(val);
    gridSvg += '<line x1="'+padL+'" y1="'+y.toFixed(1)+'" x2="'+(width-padR)+'" y2="'+y.toFixed(1)+'" stroke="'+hairline+'" stroke-width="1"/>';
    gridSvg += '<text x="'+(padL-6)+'" y="'+(y+3).toFixed(1)+'" font-size="9.5" text-anchor="end" fill="'+inkTertiary+'">'+yFormatter(val)+'</text>';
  });

  const n = steps.length;
  const slotW = plotW/n;
  const barW = slotW*0.55;
  let barsSvg='', connectorSvg='', xLabels='';
  bars.forEach((b,i)=>{
    const x = padL + i*slotW + (slotW-barW)/2;
    const y0 = yAt(b.base), y1 = yAt(b.top);
    const y = Math.min(y0,y1), h = Math.max(1,Math.abs(y1-y0));
    const st = steps[i];
    const color = st.type==='start'||st.type==='end' ? neutral : (st.value>=0 ? good : bad);
    barsSvg += '<rect x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+barW.toFixed(1)+'" height="'+h.toFixed(1)+'" rx="3" fill="'+color+'"/>';
    const labelVal = st.type==='delta' ? (st.value>=0?'+':'') + yFormatter(st.value) : yFormatter(st.value);
    barsSvg += '<text x="'+(x+barW/2).toFixed(1)+'" y="'+(y-6).toFixed(1)+'" font-size="10.5" font-weight="700" text-anchor="middle" fill="'+color+'">'+labelVal+'</text>';
    xLabels += '<text x="'+(x+barW/2).toFixed(1)+'" y="'+(height-8)+'" font-size="10" text-anchor="middle" fill="'+inkTertiary+'">'+st.label+'</text>';
    if(i<bars.length-1){
      const nextX = padL + (i+1)*slotW + (slotW-barW)/2;
      const connectY = yAt(b.top);
      connectorSvg += '<line x1="'+(x+barW).toFixed(1)+'" y1="'+connectY.toFixed(1)+'" x2="'+nextX.toFixed(1)+'" y2="'+connectY.toFixed(1)+'" stroke="'+hairline+'" stroke-width="1.2" stroke-dasharray="3,3"/>';
    }
  });

  document.getElementById(containerId).innerHTML =
    '<svg viewBox="0 0 '+width+' '+height+'" width="100%" height="100%" preserveAspectRatio="none">'+gridSvg+connectorSvg+barsSvg+xLabels+'</svg>';
}

/* ---------- 100%-stacked vertical bar chart (per period bucket, e.g.
   quarters) with % + value labels on each segment. Used for "Channel Mix
   Over Time" (quarterly). ---------- */
function buildStacked100BarSVG(containerId, opts){
  const container = document.getElementById(containerId);
  const width = opts.width || (container ? container.clientWidth : 0) || 700;
  // Fix (2026-08-03): same container-height measurement fix as the other
  // chart builders — this default (260) didn't match Channel Mix Over Time's
  // actual CSS canvas-wrap height (280px), causing the same non-uniform
  // vertical stretch on segment text.
  const height = opts.height || (container ? container.clientHeight : 0) || 260;
  const labels = opts.labels, series = opts.series; // series: [{name,color,values:[absolute per bucket]}]
  const valueFormatter = opts.valueFormatter || (v=>v);
  const padL=10, padR=10, padT=10, padB=28;
  const plotW = width-padL-padR, plotH = height-padT-padB;
  const n = labels.length;
  const slotW = plotW/n;
  const barW = slotW*0.6;
  const inkTertiary = cssVar('--ink-3')||'#898781';

  // Responsive fix (2026-08-03): labels used to always render both a % line
  // and a ฿ sub-line whenever a segment was tall enough (segH>26), with no
  // regard for how narrow the bar itself was — on a mobile-width container
  // with several buckets (e.g. 6 quarters), barW shrinks a lot while the
  // 2-line label didn't, so text overflowed past the segment on narrow
  // screens. Now also gates on bar width: below ~34px wide, drop the ฿
  // sub-line and shrink the % font; the % line alone is short enough to
  // still fit almost any segment worth labeling at all.
  const compact = barW < 34;
  const fontPct = compact ? 8.5 : 10.5;
  const fontVal = 9;

  let bars='', xLabels='';
  for(let i=0;i<n;i++){
    const total = series.reduce((a,s)=>a+s.values[i],0) || 1;
    let cum = 0;
    const x = padL + i*slotW + (slotW-barW)/2;
    series.forEach(s=>{
      const val = s.values[i];
      const segH = val/total*plotH;
      const y = padT + (plotH - cum - segH);
      bars += '<rect x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+barW.toFixed(1)+'" height="'+Math.max(0,segH).toFixed(1)+'" fill="'+s.color+'"/>';
      const showValueLine = !compact && segH > 40;
      if(segH > 22){
        const pct = (val/total*100).toFixed(0)+'%';
        const cy = y+segH/2;
        const ly = showValueLine ? cy-2 : cy+3;
        bars += '<text x="'+(x+barW/2).toFixed(1)+'" y="'+ly.toFixed(1)+'" font-size="'+fontPct+'" font-weight="700" text-anchor="middle" fill="#fff">'+pct+'</text>';
        if(showValueLine){
          bars += '<text x="'+(x+barW/2).toFixed(1)+'" y="'+(cy+11).toFixed(1)+'" font-size="'+fontVal+'" text-anchor="middle" fill="#fff" opacity="0.9">'+valueFormatter(val)+'</text>';
        }
      }
      cum += segH;
    });
    xLabels += '<text x="'+(x+barW/2).toFixed(1)+'" y="'+(height-8)+'" font-size="'+(compact?9:10)+'" text-anchor="middle" fill="'+inkTertiary+'">'+labels[i]+'</text>';
  }

  document.getElementById(containerId).innerHTML =
    '<svg viewBox="0 0 '+width+' '+height+'" width="100%" height="100%" preserveAspectRatio="none">'+bars+xLabels+'</svg>';
}

/* ---------- Pareto / Concentration chart — individual-share bars + a
   cumulative-share line, both plotted on the SAME 0-100% axis (no dual-axis
   needed since both series are already percentages of the same total). Used
   for "how concentrated is the portfolio" questions (e.g. "top 3 categories
   = 80% of sales"). `items` must already be sorted descending by value —
   this function only computes shares/cumulative, it doesn't sort for you,
   since callers often want to keep their own Focus-pinned ordering. ---------- */
function buildParetoSVG(containerId, items, opts){
  opts = opts || {};
  const container = document.getElementById(containerId);
  const width = opts.width || (container ? container.clientWidth : 0) || 480;
  const height = opts.height || (container ? container.clientHeight : 0) || 260;
  const padL = 40, padR = 40, padT = 20, padB = 42;
  const plotW = width-padL-padR, plotH = height-padT-padB;
  const n = items.length;
  const total = items.reduce((a,it)=>a+it.value,0) || 1;
  let cum = 0;
  const withPct = items.map(it=>{
    const pct = it.value/total*100;
    cum += pct;
    return { label: it.label, color: it.color, pct: pct, cumPct: cum };
  });
  const yAt = v => padT + (1 - v/100) * plotH;
  const groupW = n ? plotW/n : plotW;
  const barW = Math.min(groupW*0.6, 56);
  const barColor = opts.barColor || cssVar('--brand') || '#b23368';
  const lineColor = opts.lineColor || cssVar('--ink-1') || '#0b0b0b';
  const hairline = cssVar('--hairline') || '#e1e0d9';
  const inkTertiary = cssVar('--ink-3') || '#898781';
  const inkTwo = cssVar('--ink-2') || '#52514e';
  const thresholdPct = opts.thresholdPct !== undefined ? opts.thresholdPct : 80;

  let svg = '';
  [0,20,40,60,80,100].forEach(v=>{
    const y = yAt(v);
    svg += '<line x1="'+padL+'" y1="'+y.toFixed(1)+'" x2="'+(width-padR)+'" y2="'+y.toFixed(1)+'" stroke="'+hairline+'" stroke-width="1"/>';
    svg += '<text x="'+(padL-8)+'" y="'+(y+3).toFixed(1)+'" font-size="9" text-anchor="end" fill="'+inkTertiary+'">'+v+'%</text>';
  });
  if(thresholdPct){
    const yT = yAt(thresholdPct);
    svg += '<line x1="'+padL+'" y1="'+yT.toFixed(1)+'" x2="'+(width-padR)+'" y2="'+yT.toFixed(1)+'" stroke="'+inkTertiary+'" stroke-width="1.4" stroke-dasharray="4,3"/>';
    svg += '<text x="'+(width-padR)+'" y="'+(yT-5).toFixed(1)+'" font-size="9.5" text-anchor="end" fill="'+inkTertiary+'" font-weight="700">'+thresholdPct+'%</text>';
  }

  withPct.forEach((it,i)=>{
    const cx = padL + groupW*i + groupW/2;
    const barX = cx - barW/2;
    const barTop = yAt(it.pct);
    const barH = (padT+plotH) - barTop;
    svg += '<rect x="'+barX.toFixed(1)+'" y="'+barTop.toFixed(1)+'" width="'+barW.toFixed(1)+'" height="'+Math.max(0,barH).toFixed(1)+'" rx="3" fill="'+(it.color||barColor)+'" opacity="0.85"/>';
    if(barH > 16){
      svg += '<text x="'+cx.toFixed(1)+'" y="'+(barTop+13).toFixed(1)+'" font-size="9" text-anchor="middle" font-weight="700" fill="#fff">'+it.pct.toFixed(1)+'%</text>';
    }
    svg += '<text x="'+cx.toFixed(1)+'" y="'+(height-padB+16)+'" font-size="9.5" text-anchor="middle" fill="'+inkTertiary+'">'+it.label+'</text>';
  });

  let linePath = '';
  withPct.forEach((it,i)=>{
    const cx = padL + groupW*i + groupW/2, cy = yAt(it.cumPct);
    linePath += (i===0?'M':'L') + cx.toFixed(1)+','+cy.toFixed(1)+' ';
  });
  svg += '<path d="'+linePath+'" fill="none" stroke="'+lineColor+'" stroke-width="2.2"/>';
  withPct.forEach((it,i)=>{
    const cx = padL + groupW*i + groupW/2, cy = yAt(it.cumPct);
    svg += '<circle cx="'+cx.toFixed(1)+'" cy="'+cy.toFixed(1)+'" r="3.5" fill="'+lineColor+'"/>';
    svg += '<text x="'+cx.toFixed(1)+'" y="'+(cy-9).toFixed(1)+'" font-size="9" text-anchor="middle" font-weight="700" fill="'+inkTwo+'">'+it.cumPct.toFixed(0)+'%</text>';
  });

  document.getElementById(containerId).innerHTML =
    '<svg viewBox="0 0 '+width+' '+height+'" width="100%" height="100%" preserveAspectRatio="none">'+svg+'</svg>';
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
   data-info-text attributes on any .info-icon button — including ones
   created dynamically after a table/chart re-renders). Uses event
   delegation on document so it only ever needs to be called once per page,
   regardless of how many times new .info-icon buttons get added later. ---------- */
function initInfoPopovers(){
  const popoverEl = document.getElementById('popover');
  if(!popoverEl || popoverEl.dataset.wired) return; // idempotent: safe to call more than once
  popoverEl.dataset.wired = '1';
  const popoverTitleEl = document.getElementById('popoverTitle');
  const popoverTextEl = document.getElementById('popoverText');
  let activeInfoIcon = null;
  function closePopover(){ popoverEl.classList.remove('open'); activeInfoIcon = null; }
  document.addEventListener('click', (e)=>{
    const btn = e.target.closest('.info-icon');
    if(btn){
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
      return;
    }
    if(activeInfoIcon && !popoverEl.contains(e.target)) closePopover();
  });
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
