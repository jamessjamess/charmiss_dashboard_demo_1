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

/* ---------- Display-rounding reconciliation ----------
   Independently rounding each of several related values (e.g. Q1+Q2 vs a
   YTD total, or 4 cost lines vs their combined total) almost never sums
   back to the independently-rounded total — each value's own rounding
   error can point either direction. That reads as a data-consistency bug
   even though the underlying exact numbers already tie perfectly. Use
   reconcileRoundToTarget wherever DISPLAYED component values must visibly
   sum to a DISPLAYED total/target shown elsewhere (waterfalls, quarterly
   tables vs YTD figures, cost breakdowns vs their parent line). Largest-
   remainder method: floor everything, then hand out (or claw back) the
   leftover units to the values with the largest (or smallest) fractional
   part first, so the result stays as close as possible to the true values
   while summing to EXACTLY round(targetSum, decimals). */
function reconcileRoundToTarget(values, targetSum, decimals){
  const scale = Math.pow(10, decimals===undefined?1:decimals);
  const scaledTarget = Math.round(targetSum*scale);
  const floors = values.map(v=>Math.floor(v*scale));
  const remainder = scaledTarget - floors.reduce((a,b)=>a+b,0);
  const result = [...floors];
  if(remainder>0){
    const fracs = values.map((v,i)=>({i, frac:(v*scale)-floors[i]})).sort((a,b)=>b.frac-a.frac);
    for(let k=0;k<remainder && k<fracs.length;k++) result[fracs[k].i]+=1;
  } else if(remainder<0){
    const fracs = values.map((v,i)=>({i, frac:(v*scale)-floors[i]})).sort((a,b)=>a.frac-b.frac);
    for(let k=0;k<-remainder && k<fracs.length;k++) result[fracs[k].i]-=1;
  }
  return result.map(v=>v/scale);
}
/** Rounds a single ฿ value to the nearest 0.1M (same granularity fmtTHB
    displays at ≥1e6), returned in raw ฿ so it round-trips through fmtTHB
    unchanged. Used to compute the "anchor" values (Net Sales/Gross Profit/
    Net Profit) that reconcileRoundToTarget's targets are built from. */
function roundToNearestTHB100K(v){ return Math.round(v/1e5)/10 * 1e6; }

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
  // Defensive fix (2026-08-11): a hover tooltip shown via ensureChartTooltip
  // is position:fixed and only hides on that marker's own mouseout -- if
  // this chart re-renders WHILE a marker is being hovered (e.g. a View
  // By/unit toggle click), the old marker element is gone, no mouseout ever
  // fires on it, and the tooltip is left floating with stale content
  // wherever it last was, potentially over a totally unrelated widget lower
  // on the page (now that sections scroll continuously instead of hiding).
  // Any chart rebuild clears it, since its content is about to be invalid.
  const staleTooltip = document.getElementById('sharedChartTooltip');
  if(staleTooltip) staleTooltip.classList.remove('show');
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
  // opts.domainMin/domainMax (optional, same convention as buildHBarCompareSVG)
  // let a caller pin the Y-axis instead of always anchoring at 0 — needed for
  // metrics that hover near a non-zero baseline (e.g. Attainment % around
  // 100), where forcing 0 into the domain squashes all the real variation
  // into a sliver at the top of the chart.
  let nice;
  if(opts.domainMin !== undefined || opts.domainMax !== undefined){
    const dataMin = opts.domainMin !== undefined ? opts.domainMin : Math.min(0, ...allVals);
    const dataMax = opts.domainMax !== undefined ? opts.domainMax : Math.max(...allVals);
    nice = niceAxisTicks(dataMin, dataMax, 5);
  } else {
    const dataMin = Math.min(0, ...allVals);
    const dataMax = Math.max(...allVals);
    const headroom = (dataMax-dataMin)*0.08 || Math.abs(dataMax)*0.08 || 1;
    nice = niceAxisTicks(dataMin, dataMax + headroom, 5);
  }
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
  // Fix (2026-08-06): showEvery used to depend only on labels.length, not the
  // actual rendered width — fine for a full-width 36-month chart, but the
  // same "every 2nd label" rule crammed into a half-width chart-grid card
  // (e.g. Sales per Store Trend) overlapped every label into an unreadable
  // smear. Derive the skip interval from the real plot width instead, so any
  // caller at any card width gets non-overlapping labels automatically.
  const estLabelW = 30;
  const maxLabels = Math.max(2, Math.floor(plotW/estLabelW));
  const showEvery = Math.max(1, Math.ceil(labels.length/maxLabels));
  labels.forEach((lb,i)=>{
    if(i%showEvery!==0 && i!==labels.length-1) return;
    // Edge labels anchor toward the plot interior instead of centering on
    // the axis endpoint — a middle-anchored label at x=width-padR (the last
    // tick) has half its text overhang past the viewBox edge and gets
    // clipped (e.g. "Dec 26" rendering as "Dec 2"). First/last ticks anchor
    // start/end instead; interior ticks are unaffected.
    const isFirst = i===0, isLast = i===labels.length-1;
    const anchor = isLast ? 'end' : (isFirst ? 'start' : 'middle');
    const x = isLast ? xAt(i)-2 : (isFirst ? xAt(i)+2 : xAt(i));
    xLabelSvg += '<text x="'+x.toFixed(1)+'" y="'+(height-5)+'" font-size="9.5" text-anchor="'+anchor+'" fill="'+inkTertiary+'">'+lb+'</text>';
  });

  let seriesSvg = '';
  const hasMarkers = series.some(s=>s.markers);
  // Bug fix (post-build review, P1-8): showLastLabel used to place each
  // series' end-label independently at its own point's y-8, so two series
  // ending within a few pixels of each other (e.g. Net Margin % Trend by
  // Channel when two channels' latest values are close) rendered
  // overlapping/unreadable text. lastLabelInfos collects every series'
  // *intended* label position first; a dodge pass after the loop nudges
  // any that are closer than MIN_LABEL_GAP apart, while a <circle> still
  // marks each series' TRUE data point so the nudge doesn't misrepresent
  // where the line actually ends.
  const lastLabelInfos = [];
  series.forEach((s,seriesIdx)=>{
    let d='', started=false, lastIdx=-1, firstIdx=-1;
    s.data.forEach((v,i)=>{
      // connectGaps (2026-08-06 fix): a series that only carries real values
      // at two far-apart indices (e.g. a taper from the last actual month
      // straight to a single year-end projection, nulls in between) needs
      // those two points joined by one line — the default behavior resets
      // `started` on every null so each real point after a gap starts a
      // fresh, disconnected "M" subpath (rendered as two isolated dots, no
      // visible line). Opt in per-series with connectGaps:true to skip nulls
      // without breaking the path; every other caller is unaffected.
      if(v===null || v===undefined){ if(!s.connectGaps) started=false; return; }
      const x=xAt(i), y=yAt(v);
      d += (started?'L':'M')+x.toFixed(1)+','+y.toFixed(1)+' ';
      started = true; lastIdx = i;
      if(firstIdx<0) firstIdx = i;
    });
    if(s.fill && lastIdx>=0){
      let areaD = d + 'L'+xAt(lastIdx).toFixed(1)+','+yAt(yMin).toFixed(1)+' L'+xAt(firstIdx).toFixed(1)+','+yAt(yMin).toFixed(1)+' Z';
      seriesSvg += '<path d="'+areaD+'" fill="'+s.color+'" opacity="0.12" stroke="none"/>';
    }
    seriesSvg += '<path d="'+d.trim()+'" fill="none" stroke="'+s.color+'" stroke-width="'+(s.width||2.2)+'" stroke-dasharray="'+(s.dash||'')+'" stroke-opacity="'+(s.opacity!==undefined?s.opacity:1)+'" stroke-linecap="round" stroke-linejoin="round"/>';
    // Per-point hit/miss markers (2026-08-06) — opt-in via s.markers, a
    // parallel array to s.data where markers[i] is either null (skip, e.g. a
    // future month with no actual yet) or {hit:boolean, tooltip:htmlString}.
    // hit draws a solid dot in the series' own color; miss draws a hollow
    // ring in --critical so a below-target month reads as a warning without
    // introducing a whole new line/color into the chart.
    if(s.markers){
      s.data.forEach((v,i)=>{
        if(v===null || v===undefined) return;
        const mk = s.markers[i];
        if(!mk) return;
        const x=xAt(i), y=yAt(v);
        if(mk.hit){
          seriesSvg += '<circle class="marker-dot" data-si="'+seriesIdx+'" data-pi="'+i+'" cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="4" fill="'+s.color+'" stroke="none" style="cursor:pointer;"/>';
        } else {
          seriesSvg += '<circle class="marker-dot" data-si="'+seriesIdx+'" data-pi="'+i+'" cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="4" fill="'+(cssVar('--card')||'#fff')+'" stroke="'+(cssVar('--critical')||'#d03b3b')+'" stroke-width="2" style="cursor:pointer;"/>';
        }
      });
    }
    if(s.showLastLabel && lastIdx>=0){
      const x=xAt(lastIdx), y=yAt(s.data[lastIdx]);
      // Fix (2026-08-03): lastLabelFormatter now also receives the point's
      // index, so callers can look up a parallel value (e.g. THB amount for
      // a %-based line) via closure and show both in one label. Existing
      // callers that only read the first arg are unaffected.
      // (2026-08-11): lastLabelFormatter may now return an array of strings
      // instead of one -- rendered as stacked lines (e.g. "47.9%" + "2026
      // YTD" below it) for a provisional/annualized point that needs its own
      // caption, not just its value. Single-string callers are unaffected.
      const label = s.lastLabelFormatter(s.data[lastIdx], lastIdx);
      const lineCount = Array.isArray(label) ? label.length : 1;
      const anchor = x>width-64 ? 'end' : 'start';
      const lx = anchor==='end' ? x-6 : x+6;
      // opts.hollowLastPoint (2026-08-11): draws the auto last-point dot as a
      // hollow ring in the series' OWN color instead of a solid fill -- for a
      // provisional/annualized point (e.g. "2026 YTD") that shouldn't read as
      // a confirmed actual the way every other point on the line does.
      // Distinct from the existing s.markers hit/miss rings (always drawn in
      // --good/--critical, a different semantic) -- this stays in-color.
      if(!s.markers){
        if(s.hollowLastPoint) seriesSvg += '<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="4" fill="'+(cssVar('--card')||'#fff')+'" stroke="'+s.color+'" stroke-width="2"/>';
        else seriesSvg += '<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="3" fill="'+s.color+'"/>';
      }
      lastLabelInfos.push({ x:lx, y:y-8, anchor, color:s.color, label, gap:13+(lineCount-1)*11 });
    }
  });
  // Dodge pass: sort top-to-bottom, push any label closer than its own gap
  // (13px for a single line, wider for a stacked multi-line label) to its
  // neighbor further down so no two overlap, then render.
  lastLabelInfos.sort((a,b)=>a.y-b.y);
  for(let i=1;i<lastLabelInfos.length;i++){
    if(lastLabelInfos[i].y < lastLabelInfos[i-1].y + lastLabelInfos[i-1].gap){
      lastLabelInfos[i].y = lastLabelInfos[i-1].y + lastLabelInfos[i-1].gap;
    }
  }
  lastLabelInfos.forEach(info=>{
    const lines = Array.isArray(info.label) ? info.label : [info.label];
    lines.forEach((ln,li)=>{
      seriesSvg += '<text x="'+info.x.toFixed(1)+'" y="'+(info.y+li*11).toFixed(1)+'" font-size="10.5" font-weight="700" fill="'+info.color+'" text-anchor="'+info.anchor+'">'+ln+'</text>';
    });
  });

  const svg = '<svg viewBox="0 0 '+width+' '+height+'" width="100%" height="100%" preserveAspectRatio="none">'+gridSvg+xLabelSvg+seriesSvg+'</svg>';
  document.getElementById(containerId).innerHTML = svg;

  /* Hover wiring for marker dots — reuses the same shared tooltip element
     buildStreamAreaSVG uses (see ensureChartTooltip below), just triggered
     per-circle instead of by nearest-month mousemove math. */
  if(hasMarkers){
    const tooltip = ensureChartTooltip();
    container.onmouseover = (e)=>{
      const dot = e.target.closest('.marker-dot');
      if(!dot) return;
      const si = +dot.dataset.si, pi = +dot.dataset.pi;
      const mk = series[si] && series[si].markers && series[si].markers[pi];
      if(!mk || !mk.tooltip) return;
      tooltip.innerHTML = mk.tooltip;
      const pw = 220;
      let left = e.clientX + 14;
      if(left + pw > window.innerWidth - 12) left = e.clientX - pw - 14;
      let top = e.clientY + 14;
      if(top + 120 > window.innerHeight - 12) top = e.clientY - 130;
      tooltip.style.left = Math.max(12,left) + 'px';
      tooltip.style.top = Math.max(12,top) + 'px';
      tooltip.classList.add('show');
    };
    container.onmouseout = (e)=>{
      if(e.target.closest('.marker-dot')) tooltip.classList.remove('show');
    };
  }
}

/* buildSparklineSVG (2026-08-11) -- a minimal, axis-less/label-less trend
   line for a small inline box (e.g. under a DuPont factor chip), where the
   exact figure is already shown by a bigger number right above it and the
   sparkline's only job is "shape of the trend at a glance". Supports the
   same solid-then-dashed-with-hollow-endpoint split buildLineChartSVG's
   callers use for a provisional in-year point (opts.dashFromIndex = the
   index where the dashed segment begins; the point BEFORE it stays solid).
   Deliberately far simpler than buildLineChartSVG: no grid, no ticks, no
   per-point labels -- just the line + endpoint marker. */
function buildSparklineSVG(containerId, data, opts){
  opts = opts || {};
  const container = document.getElementById(containerId);
  const width = opts.width || (container ? container.clientWidth : 0) || 100;
  const height = opts.height || (container ? container.clientHeight : 0) || 22;
  const color = opts.color || cssVar('--brand') || '#8E1E4D';
  const padX = 3, padY = 3;
  const plotW = width - padX*2, plotH = height - padY*2;
  const vals = data.filter(v=> v!==null && v!==undefined);
  let vMin = Math.min(...vals), vMax = Math.max(...vals);
  if(vMax===vMin){ vMax += 1; vMin -= 1; }
  const headroom = (vMax-vMin)*0.15;
  vMin -= headroom; vMax += headroom;
  const n = data.length;
  const xAt = i => padX + (n<=1 ? 0 : i*(plotW/(n-1)));
  const yAt = v => padY + (1-(v-vMin)/(vMax-vMin))*plotH;
  const dashFrom = opts.dashFromIndex;
  let solidD = '', dashedD = '', started1=false, started2=false;
  data.forEach((v,i)=>{
    if(v===null || v===undefined) return;
    const x=xAt(i), y=yAt(v);
    const isDashSeg = dashFrom!==undefined && i>=dashFrom-1;
    if(isDashSeg){
      dashedD += (started2?'L':'M')+x.toFixed(1)+','+y.toFixed(1)+' ';
      started2 = true;
    } else {
      solidD += (started1?'L':'M')+x.toFixed(1)+','+y.toFixed(1)+' ';
      started1 = true;
    }
  });
  let svg = '';
  if(solidD) svg += '<path d="'+solidD.trim()+'" fill="none" stroke="'+color+'" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>';
  if(dashedD) svg += '<path d="'+dashedD.trim()+'" fill="none" stroke="'+color+'" stroke-width="1.6" stroke-dasharray="3,2.5" stroke-linecap="round" stroke-linejoin="round"/>';
  const lastIdx = data.length-1, lastV = data[lastIdx];
  if(lastV!==null && lastV!==undefined){
    const x=xAt(lastIdx), y=yAt(lastV);
    if(dashFrom!==undefined) svg += '<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="2.4" fill="'+(cssVar('--card')||'#fff')+'" stroke="'+color+'" stroke-width="1.4"/>';
    else svg += '<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="2" fill="'+color+'"/>';
  }
  container.innerHTML = '<svg viewBox="0 0 '+width+' '+height+'" width="100%" height="100%" preserveAspectRatio="none">'+svg+'</svg>';
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
/* ---------- Semicircle gauge (KPI redesign, post-build review) — for a
   single "lower is better" cost-ratio metric with a fixed target/threshold,
   viewed at one point in time (not a trend). NOT for margin %s or anything
   a reader cares about the trajectory of — those stay a number+sparkline,
   see the note above every buildGaugeSVG call site. Reuses the exact same
   polarPoint/arcPath helpers buildDonutSVG already uses, just sweeping the
   TOP semicircle (clock-angle 180°=left through 270°=top to 360°=right,
   value 0→max) instead of a full circle. Zones default to green/amber/red
   at 65%/85% of `max` (opts.greenTo/opts.amberTo override in the metric's
   own units, not a fraction, if a real industry benchmark is known). */
function buildGaugeSVG(containerId, value, opts){
  opts = opts || {};
  const container = document.getElementById(containerId);
  const width = opts.width || (container ? container.clientWidth : 0) || 180;
  const height = opts.height || (container ? container.clientHeight : 0) || 110;
  const max = opts.max !== undefined ? opts.max : 100;
  const greenTo = opts.greenTo !== undefined ? opts.greenTo : max*0.65;
  const amberTo = opts.amberTo !== undefined ? opts.amberTo : max*0.85;
  const valueFormatter = opts.valueFormatter || (v=>v.toFixed(1)+'%');
  const cx = width/2, r = Math.min(width/2-8, height-28);
  const cy = height-14;
  const strokeW = Math.max(9, r*0.26);
  const angleAt = v => 180 + Math.min(1,Math.max(0,v/max))*180;
  const goodColor = cssVar('--good')||'#0ca30c', warnColor = cssVar('--warning')||'#fab219', critColor = cssVar('--critical')||'#d03b3b';
  const inkOne = cssVar('--ink-1')||'#0b0b0b', inkThree = cssVar('--ink-3')||'#898781';
  // opts.invert: for "higher = better" metrics (e.g. margin %), the two
  // outer zones swap color -- low values read as critical, high values as
  // good -- while greenTo/amberTo keep their normal ascending-threshold
  // meaning (still the boundary nearer zero, then the boundary nearer max).
  const zoneLow = opts.invert ? critColor : goodColor, zoneHigh = opts.invert ? goodColor : critColor;
  const zonesSvg =
    '<path d="'+arcPath(cx,cy,r,180,angleAt(greenTo),strokeW)+'" fill="none" stroke="'+zoneLow+'" stroke-width="'+strokeW+'" stroke-linecap="butt"/>'
    + '<path d="'+arcPath(cx,cy,r,angleAt(greenTo),angleAt(amberTo),strokeW)+'" fill="none" stroke="'+warnColor+'" stroke-width="'+strokeW+'" stroke-linecap="butt"/>'
    + '<path d="'+arcPath(cx,cy,r,angleAt(amberTo),360,strokeW)+'" fill="none" stroke="'+zoneHigh+'" stroke-width="'+strokeW+'" stroke-linecap="butt"/>';
  const needleAngle = angleAt(value);
  const [tipX,tipY] = polarPoint(cx,cy,r*0.72,needleAngle);
  const needleSvg = '<line x1="'+cx+'" y1="'+cy+'" x2="'+tipX.toFixed(2)+'" y2="'+tipY.toFixed(2)+'" stroke="'+inkOne+'" stroke-width="2.4" stroke-linecap="round"/>'
    + '<circle cx="'+cx+'" cy="'+cy+'" r="4" fill="'+inkOne+'"/>';
  const valueLabel = '<text x="'+cx+'" y="'+(cy-r*0.42).toFixed(1)+'" text-anchor="middle" font-size="'+Math.max(13,Math.round(r*0.34))+'" font-weight="700" fill="'+inkOne+'">'+valueFormatter(value)+'</text>';
  const scaleLabels = '<text x="'+(cx-r-2)+'" y="'+(cy+12)+'" text-anchor="start" font-size="9" fill="'+inkThree+'">0</text>'
    + '<text x="'+(cx+r+2)+'" y="'+(cy+12)+'" text-anchor="end" font-size="9" fill="'+inkThree+'">'+Math.round(max)+'%</text>';
  document.getElementById(containerId).innerHTML =
    '<svg viewBox="0 0 '+width+' '+height+'" width="100%" height="100%" overflow="visible">'+zonesSvg+needleSvg+valueLabel+scaleLabels+'</svg>';
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
  const labelW = opts.labelW || 90, valueW = opts.valueW || 64, padX = 10;
  const plotW = width - labelW - valueW - padX*2;
  /* Fix (2026-08-04): this function used to draw *only* a single dashed
     reference line with no tick marks/gridlines/axis labels anywhere on the
     value axis — readable enough when the reference sat at 0, but for a
     referenceValue:100 chart (Target Attainment %, all bars clustered
     90-112%) there was no way to tell how far any bar actually was from the
     reference or from each other, since the only number visible per row was
     the bar's own end label. Added a proper bottom axis (niceAxisTicks, same
     convention as buildGroupedBarSVG/buildLineChartSVG) with light vertical
     gridlines + tick labels — needs its own AXIS_H reserved under the rows,
     hence the taller total height. */
  const AXIS_H = 22;
  const rowsH = items.length * rowHeight;
  const height = rowsH + AXIS_H;
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
  let rawMin = opts.domainMin !== undefined ? opts.domainMin : Math.min(ref, ...items.map(i=>i.value));
  let rawMax = opts.domainMax !== undefined ? opts.domainMax : Math.max(ref, ...items.map(i=>i.value));
  if(rawMax === rawMin) rawMax = rawMin + 1;
  let minV, maxV, ticks;
  if(opts.domainMin !== undefined || opts.domainMax !== undefined){
    minV = rawMin; maxV = rawMax; ticks = niceAxisTicks(minV, maxV, 5).ticks;
  } else {
    const pad = (rawMax - rawMin) * 0.15;
    const nice = niceAxisTicks(rawMin - pad, rawMax + pad, 5);
    minV = nice.min; maxV = nice.max; ticks = nice.ticks;
  }
  const xAt = v => labelW + padX + ((v-minV)/(maxV-minV)) * plotW;
  const refX = xAt(ref);

  const hairline = cssVar('--hairline') || '#e1e0d9';
  const inkTertiary = cssVar('--ink-3') || '#898781';
  let gridSvg = '';
  ticks.forEach(val=>{
    if(val < minV || val > maxV) return;
    const x = xAt(val);
    gridSvg += '<line x1="'+x.toFixed(1)+'" y1="0" x2="'+x.toFixed(1)+'" y2="'+rowsH+'" stroke="'+hairline+'" stroke-width="1"/>';
    gridSvg += '<text x="'+x.toFixed(1)+'" y="'+(rowsH+14)+'" font-size="9.5" text-anchor="middle" fill="'+inkTertiary+'">'+formatValue(val)+'</text>';
  });

  let rows = '';
  items.forEach((it,i)=>{
    const y = i*rowHeight;
    const barY = y + rowHeight*0.28;
    const barH = rowHeight*0.42;
    const barX = xAt(it.value);
    const x0 = Math.min(refX, barX), barW = Math.max(1, Math.abs(barX-refX));
    rows += '<text x="'+(labelW-8)+'" y="'+(y+rowHeight/2+4)+'" font-size="12" text-anchor="end" fill="'+cssVar('--ink-2')+'">'+it.label+'</text>';
    rows += '<rect x="'+x0.toFixed(1)+'" y="'+barY.toFixed(1)+'" width="'+barW.toFixed(1)+'" height="'+barH.toFixed(1)+'" rx="4" fill="'+it.color+'"/>';
    // it.subLabel (2026-08-06) — optional second, smaller line under the main
    // value (e.g. "+฿582.1K over target"), for callers that want the raw ฿
    // gap alongside the % — existing callers without it keep the exact
    // single centered line as before.
    if(it.subLabel){
      rows += '<text x="'+(width-valueW+8)+'" y="'+(y+rowHeight/2-3)+'" font-size="12.5" font-weight="700" fill="'+cssVar('--ink-1')+'">'+formatValue(it.value)+'</text>';
      rows += '<text x="'+(width-valueW+8)+'" y="'+(y+rowHeight/2+13)+'" font-size="10" fill="'+(it.subLabelColor||cssVar('--ink-3'))+'">'+it.subLabel+'</text>';
    } else {
      rows += '<text x="'+(width-valueW+8)+'" y="'+(y+rowHeight/2+4)+'" font-size="12.5" font-weight="700" fill="'+cssVar('--ink-1')+'">'+formatValue(it.value)+'</text>';
    }
  });
  const refLine = '<line x1="'+refX.toFixed(1)+'" y1="0" x2="'+refX.toFixed(1)+'" y2="'+rowsH+'" stroke="'+cssVar('--ink-1')+'" stroke-width="1.3" stroke-dasharray="4,3"/>';

  document.getElementById(containerId).innerHTML =
    '<svg viewBox="0 0 '+width+' '+height+'" width="100%" height="'+height+'">'+gridSvg+refLine+rows+'</svg>';
}

/* ---------- Stacked area chart (percentage mix over time — used for
   "Channel Mix Over Time") ---------- */
function buildStackedAreaSVG(containerId, opts){
  const container = document.getElementById(containerId);
  const measuredWidth = container ? container.clientWidth : 0;
  const width = opts.width || measuredWidth || 900, height = opts.height || 190;
  const labels = opts.labels, series = opts.series; // series: [{color, values:[...]}]
  // showAxis (2026-08-06) — opt-in Y-axis gridlines+labels, off by default so
  // existing callers (e.g. OPEX Trend) render byte-identical to before.
  // valueFormatter only matters when showAxis is on.
  const showAxis = !!opts.showAxis;
  const valueFormatter = opts.valueFormatter || (v=>v);
  const padL = showAxis ? 54 : 6, padR=6, padT=8, padB = showAxis ? 28 : 18;
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
  const niceMax = showAxis ? maxTotal*1.12 : maxTotal;
  const yAt = v => padT + (1 - v/niceMax) * plotH;

  let grid = '';
  if(showAxis){
    const inkTertiary = cssVar('--ink-3')||'#898781';
    const hairline = cssVar('--hairline') || '#e1e0d9';
    for(let g=0; g<=4; g++){
      const v = niceMax * g/4;
      const y = yAt(v);
      grid += '<line x1="'+padL+'" y1="'+y.toFixed(1)+'" x2="'+(width-padR)+'" y2="'+y.toFixed(1)+'" stroke="'+hairline+'" stroke-width="1"/>';
      grid += '<text x="'+(padL-8)+'" y="'+(y+3).toFixed(1)+'" font-size="9" text-anchor="end" fill="'+inkTertiary+'">'+valueFormatter(v)+'</text>';
    }
  }

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

  // showTopPoints (2026-08-06) — opt-in dot + value label on the topmost
  // (grand-total) edge of the stack at every data point, so peaks across
  // months can be compared without having to eyeball the filled area's
  // curve. Off by default, same reasoning as showAxis above.
  let topPoints = '';
  if(opts.showTopPoints){
    const dotColor = cssVar('--ink-1') || '#0b0b0b';
    for(let i=0;i<n;i++){
      const topVal = cum[i][cum[i].length-1];
      const x = xAt(i), y = yAt(topVal);
      const anchor = i===0 ? 'start' : (i===n-1 ? 'end' : 'middle');
      topPoints += '<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="3" fill="'+dotColor+'" stroke="#fff" stroke-width="1.5"/>';
      topPoints += '<text x="'+x.toFixed(1)+'" y="'+(y-8).toFixed(1)+'" font-size="9.5" font-weight="700" text-anchor="'+anchor+'" fill="'+dotColor+'">'+valueFormatter(topVal)+'</text>';
    }
  }

  document.getElementById(containerId).innerHTML =
    '<svg viewBox="0 0 '+width+' '+height+'" width="100%" height="100%" preserveAspectRatio="none">'+grid+paths+topPoints+xLabels+'</svg>';
}

/* ---------- Grouped (clustered) vertical bar chart — used for "Growth YoY by
   Channel" (grouped by month) and "Channel Index by Category" (grouped by
   category) ---------- */
function buildGroupedBarSVG(containerId, opts){
  // Defensive fix (2026-08-11): see the matching comment in
  // buildLineChartSVG -- clears a stale position:fixed hover tooltip on
  // every rebuild so it can never be left floating over unrelated content.
  const staleTooltip2 = document.getElementById('sharedChartTooltip');
  if(staleTooltip2) staleTooltip2.classList.remove('show');
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
  // yAxisTitle (2026-08-06): optional rotated axis label along the left
  // margin — reserves a little extra width so it doesn't crowd the tick
  // labels. Off by default; existing callers are unaffected.
  const padL=44 + (opts.yAxisTitle ? 14 : 0), padR=10, padT=18, padB=30;
  const plotW = width-padL-padR, plotH = height-padT-padB;

  let allVals = [];
  series.forEach(s => s.values.forEach(v => allVals.push(v)));
  if(allVals.length===0) allVals=[baseline, baseline+1];
  // opts.domainMin/domainMax (2026-08-06, same convention as
  // buildLineChartSVG's own fix) — a diverging-from-100 attainment-% chart
  // whose real values all cluster within a point or two of the baseline
  // would otherwise auto-fit to that tiny span (e.g. 100-102%), rendering a
  // technically-correct but meaningless zoomed-in chart with duplicate
  // rounded axis labels. Opt-in per caller; unset callers keep the exact
  // auto-fit behavior below.
  let nice;
  if(opts.domainMin !== undefined || opts.domainMax !== undefined){
    const dataMin = opts.domainMin !== undefined ? opts.domainMin : Math.min(baseline, ...allVals);
    const dataMax = opts.domainMax !== undefined ? opts.domainMax : Math.max(baseline, ...allVals);
    nice = niceAxisTicks(dataMin, dataMax, 5);
  } else {
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
    nice = niceAxisTicks(rawMin-padBelow, rawMax+padAbove, 5);
  }
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

  let bars = '', xLabels = '', valueLabels = '', tickMarks = '';
  const goodTextVar = cssVar('--good-text') || '#006300', criticalVar = cssVar('--critical') || '#d03b3b';
  labels.forEach((lb,gi)=>{
    const groupX = padL + gi*(groupW+groupGap);
    series.forEach((s,si)=>{
      const val = s.values[gi];
      const barX = groupX + barGap + si*(barW+barGap);
      const y1 = yAt(val);
      const y0 = Math.min(y1, baseY);
      const h = Math.max(0.5, Math.abs(y1-baseY));
      // colorFn now also receives gi (2026-08-06) so a caller with a single
      // series spanning multiple groups (e.g. one "This Year" bar per
      // channel) can color each bar by its own group instead of every bar
      // sharing the series' one color — existing callers reading only the
      // first two args are unaffected.
      const color = opts.colorFn ? opts.colorFn(s, val, gi) : s.color;
      // data-gi (2026-08-05): harmless group-index attribute on every bar, so
      // a caller that wants drill-through-on-click (e.g. Store Productivity
      // Distribution → "which stores are in this bucket") can attach its own
      // delegated click listener afterward without this function needing to
      // know anything about that use case. opts.clickableBars just adds a
      // pointer cursor as a visual affordance; everything still renders
      // exactly as before for callers that don't set it. opts.tooltips (new,
      // 2026-08-06) does the same cursor affordance, plus wires the shared
      // hover tooltip below.
      bars += '<rect data-gi="'+gi+'" x="'+barX.toFixed(1)+'" y="'+y0.toFixed(1)+'" width="'+barW.toFixed(1)+'" height="'+h.toFixed(1)+'" rx="2" fill="'+color+'"'+((opts.clickableBars||opts.tooltips)?' style="cursor:pointer;"':'')+'/>';
      // opts.tickValues (2026-08-06) — a short horizontal tick mark drawn on
      // top of series index 0's bar at a given value, colored green/red by
      // hit/miss. Built for "Net Sales vs Target by Channel": the bar itself
      // stays the channel's own brand color (unlike buildBulletBarSVG, which
      // colors the whole bar green/red) — only this tick carries the
      // hit/miss signal, so Target can be dropped as its own bar without
      // losing the at-a-glance hit/miss read.
      if(si===0 && opts.tickValues && opts.tickValues[gi]){
        const tick = opts.tickValues[gi];
        const tickY = yAt(tick.value);
        const tickW = barW + 6;
        const tickColor = tick.hit ? goodTextVar : criticalVar;
        tickMarks += '<rect x="'+(barX+barW/2-tickW/2).toFixed(1)+'" y="'+(tickY-1.4).toFixed(1)+'" width="'+tickW.toFixed(1)+'" height="2.8" rx="1.2" fill="'+tickColor+'"/>';
      }
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
        // opts.compactLabelWidth (optional) lets a caller lower this cutoff
        // when it knows its own label text is short enough to stay safe at a
        // narrower bar width than the 55px default assumes (e.g. "+฿6M" is
        // nowhere near as wide as the generic case this constant guards
        // against) — backward-compatible, unset callers keep 55 exactly as
        // before.
        const compactLabels = barW < (opts.compactLabelWidth !== undefined ? opts.compactLabelWidth : 55);
        if(compactLabels && lines.length>1) lines = [lines[0]];
        if(barW < 22) lines = [];
        const labelFontSize = barW < 30 ? 7.5 : 9;
        const lineH = labelFontSize + 1;
        // opts.insideBarLabels (2026-08-06) — centers the label stack inside
        // the bar itself (vertically, around the bar's midpoint) instead of
        // floating above/below its end — for a bar tall enough to hold text
        // (e.g. a 0-anchored Attainment % bar that fills most of the plot
        // height), this reads as data printed on the bar rather than a
        // caption hovering near it. Existing above/below positioning is
        // unchanged for callers that don't set this.
        const insideFontSize = opts.insideBarLabels ? Math.min(13, labelFontSize+3) : labelFontSize;
        const insideLineH = insideFontSize + 2;
        // Fix: y0 is already the bar's top edge (Math.min(y1,baseY) collapses
        // to y1 whenever the bar grows upward from the baseline, i.e. every
        // 0-anchored positive-value bar), so (y0+y1)/2 was just y0/y1 again —
        // the true vertical center of the rect is y0 + half its height.
        const barMidY = y0 + h/2;
        lines.forEach((ln, li)=>{
          const isObj = ln && typeof ln === 'object';
          const text = isObj ? ln.text : ln;
          const fillColor = opts.insideBarLabels ? (isObj && ln.insideColor ? ln.insideColor : '#fff') : (isObj && ln.color ? ln.color : color);
          const ly = opts.insideBarLabels
            ? barMidY - ((lines.length-1)*insideLineH)/2 + li*insideLineH + insideFontSize*0.32
            : (above ? (y1-4-(lines.length-1-li)*lineH) : (y1+11+li*lineH));
          valueLabels += '<text x="'+(barX+barW/2).toFixed(1)+'" y="'+ly.toFixed(1)+'" font-size="'+(opts.insideBarLabels?insideFontSize:labelFontSize)+'" font-weight="700" text-anchor="middle" fill="'+fillColor+'">'+text+'</text>';
        });
      }
    });
    xLabels += '<text x="'+(groupX+groupW/2).toFixed(1)+'" y="'+(height-6)+'" font-size="9.5" text-anchor="middle" fill="'+inkTertiary+'">'+lb+'</text>';
  });

  const refLine = '<line x1="'+padL+'" y1="'+baseY.toFixed(1)+'" x2="'+(width-padR)+'" y2="'+baseY.toFixed(1)+'" stroke="'+(opts.referenceValue!==undefined?inkOne:hairline)+'" stroke-width="1.3" stroke-dasharray="'+(opts.referenceValue!==undefined?'4,3':'none')+'"/>';
  // opts.targetLine (2026-08-06) — an independent dashed reference line at a
  // fixed value, separate from opts.referenceValue (which also controls
  // where bars are anchored/measured from). Lets a caller keep bars
  // 0-anchored while still marking a target value (e.g. 100% attainment)
  // as a dashed line partway up the chart.
  let targetLineSvg = '';
  if(opts.targetLine !== undefined){
    const tly = yAt(opts.targetLine);
    targetLineSvg = '<line x1="'+padL+'" y1="'+tly.toFixed(1)+'" x2="'+(width-padR)+'" y2="'+tly.toFixed(1)+'" stroke="'+inkOne+'" stroke-width="1.3" stroke-dasharray="4,3"/>';
  }

  let yTitleSvg = '';
  if(opts.yAxisTitle){
    const tx = 11, ty = padT+plotH/2;
    yTitleSvg = '<text x="'+tx+'" y="'+ty.toFixed(1)+'" font-size="9.5" font-weight="600" text-anchor="middle" fill="'+inkTertiary+'" transform="rotate(-90 '+tx+' '+ty.toFixed(1)+')">'+opts.yAxisTitle+'</text>';
  }

  document.getElementById(containerId).innerHTML =
    '<svg viewBox="0 0 '+width+' '+height+'" width="100%" height="100%" preserveAspectRatio="none">'+gridSvg+refLine+targetLineSvg+bars+tickMarks+valueLabels+xLabels+yTitleSvg+'</svg>';

  // opts.tooltips (2026-08-06) — one HTML string per group (data-gi), shown
  // on hover via the same shared tooltip element buildLineChartSVG's markers
  // and buildStreamAreaSVG both already use.
  if(opts.tooltips){
    const tooltip = ensureChartTooltip();
    container.onmouseover = (e)=>{
      const bar = e.target.closest('rect[data-gi]');
      if(!bar) return;
      const gi = +bar.dataset.gi;
      const html = opts.tooltips[gi];
      if(!html) return;
      tooltip.innerHTML = html;
      const pw = 220;
      let left = e.clientX + 14;
      if(left + pw > window.innerWidth - 12) left = e.clientX - pw - 14;
      let top = e.clientY + 14;
      if(top + 140 > window.innerHeight - 12) top = e.clientY - 150;
      tooltip.style.left = Math.max(12,left) + 'px';
      tooltip.style.top = Math.max(12,top) + 'px';
      tooltip.classList.add('show');
    };
    container.onmouseout = (e)=>{
      if(e.target.closest('rect[data-gi]')) tooltip.classList.remove('show');
    };
  }
}

/* ---------- Combo bar+line chart (dual independent Y-axis) — for pairing a
   ฿-amount bar series with a %-rate line series on the same category axis
   (e.g. Net Sales bars + Gross Margin % line, one per quarter) so a reader
   gets both the amount and its rate in one card instead of two separate
   single-metric cards. Left axis scales the bar series (0-anchored); right
   axis scales the line series independently — the two are NEVER blended
   into one shared domain, since a ฿ amount and a % rate have no common
   scale. opts: {labels, bar:{name,color,values}, line:{name,color,values},
   barYFormatter, lineYFormatter, height, width}. Only the line's LAST point
   gets a text label (dots mark every point) — same "showLastLabel" reasoning
   buildLineChartSVG's callers already use, since labeling every point on a
   short 4-6-category axis is enough context without cluttering the bars. ---------- */
function buildComboBarLineSVG(containerId, opts){
  const container = document.getElementById(containerId);
  const width = opts.width || (container ? container.clientWidth : 0) || 520;
  const height = opts.height || (container ? container.clientHeight : 0) || 220;
  const {labels, bar, line} = opts;
  const barYFormatter = opts.barYFormatter || (v=>v);
  const lineYFormatter = opts.lineYFormatter || (v=>v);
  const padL=46, padR=44, padT=18, padB=26;
  const plotW = width-padL-padR, plotH = height-padT-padB;

  const barVals = bar.values;
  const lineValsClean = line.values.filter(v=>v!==null && v!==undefined);
  const barMax = Math.max(0, ...barVals);
  const barNice = niceAxisTicks(0, (barMax*1.15)||1, 4);
  const lineMinRaw = Math.min(...lineValsClean), lineMaxRaw = Math.max(...lineValsClean);
  const lineSpan = (lineMaxRaw-lineMinRaw) || Math.abs(lineMaxRaw) || 1;
  const lineNice = niceAxisTicks(lineMinRaw - lineSpan*0.15, lineMaxRaw + lineSpan*0.15, 4);

  let barYMin=barNice.min, barYMax=barNice.max; if(barYMax===barYMin) barYMax=barYMin+1;
  let lineYMin=lineNice.min, lineYMax=lineNice.max; if(lineYMax===lineYMin) lineYMax=lineYMin+1;

  const barYAt = v => padT + (1-(v-barYMin)/(barYMax-barYMin))*plotH;
  const lineYAt = v => padT + (1-(v-lineYMin)/(lineYMax-lineYMin))*plotH;
  const stepX = plotW/Math.max(1,labels.length);
  const cellX = i => padL + i*stepX;
  const barW = Math.max(6, stepX*0.42);

  const hairline = cssVar('--hairline')||'#e1e0d9', inkThree = cssVar('--ink-3')||'#898781';

  let gridSvg = '';
  barNice.ticks.forEach(val=>{
    const y = barYAt(val);
    gridSvg += '<line x1="'+padL+'" y1="'+y.toFixed(1)+'" x2="'+(width-padR)+'" y2="'+y.toFixed(1)+'" stroke="'+hairline+'" stroke-width="1"/>';
    gridSvg += '<text x="'+(padL-6)+'" y="'+(y+3).toFixed(1)+'" font-size="9.5" text-anchor="end" fill="'+inkThree+'">'+barYFormatter(val)+'</text>';
  });
  lineNice.ticks.forEach(val=>{
    const y = lineYAt(val);
    gridSvg += '<text x="'+(width-padR+7)+'" y="'+(y+3).toFixed(1)+'" font-size="9.5" text-anchor="start" fill="'+line.color+'">'+lineYFormatter(val)+'</text>';
  });

  // opts.partialLastBar / opts.partialLastPoint (2026-08-11) — the LAST bar
  // (reduced opacity + dashed outline, instead of solid fill) and/or the
  // LAST line point+segment (dashed final segment + hollow marker) render
  // as provisional/in-progress, same convention used elsewhere on this
  // dashboard for an unclosed YTD/annual bucket. opts.barLastBarExtraLines
  // (2026-08-11) — extra comparison text (e.g. YoY/MoM) above the LAST
  // bar's own value label only.
  let barsSvg = '';
  const barY0 = barYAt(0);
  const lastBarIdx = labels.length-1;
  labels.forEach((lb,i)=>{
    const v = barVals[i];
    const x = cellX(i) + stepX/2 - barW/2;
    // opts.bar with a null/undefined value (2026-08-12) -- no baseline to
    // compute that period's bar from (same convention as the line series
    // above, which already skips null points); renders as a "–" label at
    // the zero line instead of a fabricated ฿0 bar.
    if(v===null || v===undefined){
      barsSvg += '<text x="'+(x+barW/2).toFixed(1)+'" y="'+(barY0-6).toFixed(1)+'" font-size="9" font-weight="700" text-anchor="middle" fill="'+inkThree+'">–</text>';
      return;
    }
    const y = barYAt(v);
    const isLastBar = i===lastBarIdx;
    const partialBar = opts.partialLastBar && isLastBar;
    const barAttrs = partialBar ? ' fill-opacity="0.55" stroke="'+bar.color+'" stroke-width="1.5" stroke-dasharray="3,2"' : '';
    barsSvg += '<rect x="'+x.toFixed(1)+'" y="'+Math.min(y,barY0).toFixed(1)+'" width="'+barW.toFixed(1)+'" height="'+Math.max(0.5,Math.abs(barY0-y)).toFixed(1)+'" rx="2" fill="'+bar.color+'"'+barAttrs+'/>';
    barsSvg += '<text x="'+(x+barW/2).toFixed(1)+'" y="'+(y-6).toFixed(1)+'" font-size="9" font-weight="700" text-anchor="middle" fill="'+bar.color+'">'+barYFormatter(v)+'</text>';
    if(isLastBar && opts.barLastBarExtraLines && opts.barLastBarExtraLines.length){
      // Each entry is a plain string (default gray) or a {text,color}
      // object (2026-08-11, for polarity-colored YoY/MoM/QoQ comparisons).
      opts.barLastBarExtraLines.forEach((extraLine,li)=>{
        const isObj = extraLine && typeof extraLine === 'object';
        const text = isObj ? extraLine.text : extraLine;
        const color = isObj && extraLine.color ? extraLine.color : inkThree;
        barsSvg += '<text x="'+(x+barW/2).toFixed(1)+'" y="'+(y-6-12*(li+1)).toFixed(1)+'" font-size="9" font-weight="600" text-anchor="middle" fill="'+color+'">'+text+'</text>';
      });
    }
  });

  let lineD = '', lineDashD = '', lineDots = '', lastIdx=-1, prevIdx=-1;
  line.values.forEach((v,i)=>{
    if(v===null || v===undefined) return;
    prevIdx = lastIdx; lastIdx = i;
  });
  line.values.forEach((v,i)=>{
    if(v===null || v===undefined) return;
    const x = cellX(i)+stepX/2, y = lineYAt(v);
    const isPartialPoint = opts.partialLastPoint && i===lastIdx && prevIdx>=0;
    if(isPartialPoint){
      // Final segment only: solid path stops at the prior point, a separate
      // dashed path carries prevIdx->lastIdx, and the final point itself
      // draws hollow instead of filled.
      const px = cellX(prevIdx)+stepX/2, py = lineYAt(line.values[prevIdx]);
      lineDashD = 'M'+px.toFixed(1)+','+py.toFixed(1)+' L'+x.toFixed(1)+','+y.toFixed(1);
      lineDots += '<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="3.5" fill="'+(cssVar('--card')||'#fff')+'" stroke="'+line.color+'" stroke-width="2"/>';
    } else {
      lineD += (lineD?'L':'M')+x.toFixed(1)+','+y.toFixed(1)+' ';
      lineDots += '<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="3" fill="'+line.color+'"/>';
    }
  });
  let lastLabelSvg = '';
  if(lastIdx>=0){
    const x = cellX(lastIdx)+stepX/2, y = lineYAt(line.values[lastIdx]);
    const anchor = x > width-padR-30 ? 'end' : 'start';
    const lx = anchor==='end' ? x-8 : x+8;
    lastLabelSvg = '<text x="'+lx.toFixed(1)+'" y="'+(y-9).toFixed(1)+'" font-size="10" font-weight="700" text-anchor="'+anchor+'" fill="'+line.color+'">'+lineYFormatter(line.values[lastIdx])+'</text>';
  }
  const dashedSegSvg = lineDashD ? '<path d="'+lineDashD+'" fill="none" stroke="'+line.color+'" stroke-width="2.4" stroke-dasharray="5,4" stroke-linecap="round"/>' : '';
  const lineSvg = '<path d="'+lineD.trim()+'" fill="none" stroke="'+line.color+'" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>'+dashedSegSvg+lineDots+lastLabelSvg;

  let xLabelsSvg = '';
  labels.forEach((lb,i)=>{
    xLabelsSvg += '<text x="'+(cellX(i)+stepX/2).toFixed(1)+'" y="'+(height-6)+'" font-size="9.5" text-anchor="middle" fill="'+inkThree+'">'+lb+'</text>';
  });

  document.getElementById(containerId).innerHTML =
    '<svg viewBox="0 0 '+width+' '+height+'" width="100%" height="100%" preserveAspectRatio="none">'+gridSvg+barsSvg+lineSvg+xLabelsSvg+'</svg>';
}

/* ---------- Grouped bar + line combo (dual independent Y-axis) — same
   pairing idea as buildComboBarLineSVG, but for 2+ ฿-amount bar series side
   by side per category (e.g. CFO + Free Cash Flow) plus one %-rate line on
   the right axis (e.g. FCF Margin %), instead of a single bar series. Left
   axis scales the grouped bars (0-anchored); right axis scales the line
   independently. opts: {labels, series:[{name,color,values}], line:{name,
   color,values}, barYFormatter, lineYFormatter, height, width}. ---------- */
function buildGroupedBarLineSVG(containerId, opts){
  const staleTooltip3 = document.getElementById('sharedChartTooltip');
  if(staleTooltip3) staleTooltip3.classList.remove('show');
  const container = document.getElementById(containerId);
  const width = opts.width || (container ? container.clientWidth : 0) || 520;
  const height = opts.height || (container ? container.clientHeight : 0) || 220;
  const {labels, series, line} = opts;
  const barYFormatter = opts.barYFormatter || (v=>v);
  const lineYFormatter = opts.lineYFormatter || (v=>v);
  const padL=46, padR=44, padT=18, padB=26;
  const plotW = width-padL-padR, plotH = height-padT-padB;

  let allBarVals = [];
  series.forEach(s=> s.values.forEach(v=> allBarVals.push(v)));
  const barMax = Math.max(0, ...allBarVals);
  const barNice = niceAxisTicks(0, (barMax*1.15)||1, 4);
  const lineValsClean = line.values.filter(v=>v!==null && v!==undefined);
  const lineMinRaw = Math.min(...lineValsClean), lineMaxRaw = Math.max(...lineValsClean);
  const lineSpan = (lineMaxRaw-lineMinRaw) || Math.abs(lineMaxRaw) || 1;
  const lineNice = niceAxisTicks(lineMinRaw - lineSpan*0.15, lineMaxRaw + lineSpan*0.15, 4);

  let barYMin=barNice.min, barYMax=barNice.max; if(barYMax===barYMin) barYMax=barYMin+1;
  let lineYMin=lineNice.min, lineYMax=lineNice.max; if(lineYMax===lineYMin) lineYMax=lineYMin+1;

  const barYAt = v => padT + (1-(v-barYMin)/(barYMax-barYMin))*plotH;
  const lineYAt = v => padT + (1-(v-lineYMin)/(lineYMax-lineYMin))*plotH;
  const groupCount = labels.length, seriesCount = series.length;
  const groupGap = Math.max(6, Math.min(14, width/40));
  const groupW = (plotW - groupGap*Math.max(0,groupCount-1))/Math.max(1,groupCount);
  const barGap = 3;
  const barW = Math.max(2, (groupW - barGap*(seriesCount+1))/seriesCount);

  const hairline = cssVar('--hairline')||'#e1e0d9', inkThree = cssVar('--ink-3')||'#898781';

  let gridSvg = '';
  barNice.ticks.forEach(val=>{
    const y = barYAt(val);
    gridSvg += '<line x1="'+padL+'" y1="'+y.toFixed(1)+'" x2="'+(width-padR)+'" y2="'+y.toFixed(1)+'" stroke="'+hairline+'" stroke-width="1"/>';
    gridSvg += '<text x="'+(padL-6)+'" y="'+(y+3).toFixed(1)+'" font-size="9.5" text-anchor="end" fill="'+inkThree+'">'+barYFormatter(val)+'</text>';
  });
  lineNice.ticks.forEach(val=>{
    const y = lineYAt(val);
    gridSvg += '<text x="'+(width-padR+7)+'" y="'+(y+3).toFixed(1)+'" font-size="9.5" text-anchor="start" fill="'+line.color+'">'+lineYFormatter(val)+'</text>';
  });

  let barsSvg = '', xLabelsSvg = '';
  const barY0 = barYAt(0);
  labels.forEach((lb,gi)=>{
    const groupX = padL + gi*(groupW+groupGap);
    series.forEach((s,si)=>{
      const val = s.values[gi];
      const barX = groupX + barGap + si*(barW+barGap);
      const y = barYAt(val);
      barsSvg += '<rect x="'+barX.toFixed(1)+'" y="'+Math.min(y,barY0).toFixed(1)+'" width="'+barW.toFixed(1)+'" height="'+Math.max(0.5,Math.abs(barY0-y)).toFixed(1)+'" rx="2" fill="'+s.color+'"/>';
    });
    xLabelsSvg += '<text x="'+(groupX+groupW/2).toFixed(1)+'" y="'+(height-6)+'" font-size="9.5" text-anchor="middle" fill="'+inkThree+'">'+lb+'</text>';
  });

  let lineD = '', lineDots = '', lastIdx=-1;
  line.values.forEach((v,i)=>{
    if(v===null || v===undefined) return;
    const groupX = padL + i*(groupW+groupGap);
    const x = groupX + groupW/2, y = lineYAt(v);
    lineD += (lineD?'L':'M')+x.toFixed(1)+','+y.toFixed(1)+' ';
    lineDots += '<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="3" fill="'+line.color+'"/>';
    lastIdx = i;
  });
  let lastLabelSvg = '';
  if(lastIdx>=0){
    const groupX = padL + lastIdx*(groupW+groupGap);
    const x = groupX+groupW/2, y = lineYAt(line.values[lastIdx]);
    const anchor = x > width-padR-30 ? 'end' : 'start';
    const lx = anchor==='end' ? x-8 : x+8;
    lastLabelSvg = '<text x="'+lx.toFixed(1)+'" y="'+(y-9).toFixed(1)+'" font-size="10" font-weight="700" text-anchor="'+anchor+'" fill="'+line.color+'">'+lineYFormatter(line.values[lastIdx])+'</text>';
  }
  const lineSvg = '<path d="'+lineD.trim()+'" fill="none" stroke="'+line.color+'" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>'+lineDots+lastLabelSvg;

  document.getElementById(containerId).innerHTML =
    '<svg viewBox="0 0 '+width+' '+height+'" width="100%" height="100%" preserveAspectRatio="none">'+gridSvg+barsSvg+lineSvg+xLabelsSvg+'</svg>';
}

/* ---------- Bullet bar chart (Actual bar colored green/red by hit-or-miss +
   Target tick mark + Δ vs Target / MoM / YoY captions below each month) —
   used for "Target vs Actual" style charts. Visual pattern matches TT
   Overview's own renderBulletBarChart (tt-shared.js) so both systems read
   the same way, ported here in shared.js's string-SVG convention instead of
   that file's DOM-node style. opts: {labels, actual:[...], target:[...],
   yFormatter, mom:[...]|null, yoy:[...]|null} — mom/yoy are per-month %,
   nullable, and only reserve extra caption rows when passed at all. */
function buildBulletBarSVG(containerId, opts){
  const container = document.getElementById(containerId);
  const width = opts.width || (container ? container.clientWidth : 0) || 640;
  const height = opts.height || (container ? container.clientHeight : 0) || 280;
  const labels = opts.labels, actual = opts.actual, target = opts.target;
  const yFormatter = opts.yFormatter || (v=>v);
  const mom = opts.mom, yoy = opts.yoy;
  const hasMomYoy = !!(mom || yoy);
  const padL=48, padR=10, padT=18, padB = hasMomYoy ? 74 : 46;
  const plotW = width-padL-padR, plotH = height-padT-padB;

  const allVals = [...actual, ...target].filter(v=>v!=null);
  if(allVals.length===0) allVals.push(0,1);
  const nice = niceAxisTicks(0, Math.max(1,...allVals)*1.15, 5);
  const yMin = nice.min, yMax = nice.max===nice.min ? nice.min+1 : nice.max;
  const yAt = v => padT + (1-(v-yMin)/(yMax-yMin))*plotH;
  const zeroY = yAt(0);

  const hairline = cssVar('--hairline') || '#e1e0d9';
  const inkTertiary = cssVar('--ink-3') || '#898781';
  const inkOne = cssVar('--ink-1') || '#0b0b0b';
  const goodText = cssVar('--good-text') || '#006300';
  const critical = cssVar('--critical') || '#d03b3b';

  let gridSvg = '';
  nice.ticks.forEach(v=>{
    const y = yAt(v);
    gridSvg += '<line x1="'+padL+'" y1="'+y.toFixed(1)+'" x2="'+(width-padR)+'" y2="'+y.toFixed(1)+'" stroke="'+hairline+'" stroke-width="1"/>';
    gridSvg += '<text x="'+(padL-6)+'" y="'+(y+3).toFixed(1)+'" font-size="9.5" text-anchor="end" fill="'+inkTertiary+'">'+yFormatter(v)+'</text>';
  });
  gridSvg += '<line x1="'+padL+'" y1="'+zeroY.toFixed(1)+'" x2="'+(width-padR)+'" y2="'+zeroY.toFixed(1)+'" stroke="'+inkTertiary+'" stroke-width="1"/>';

  const n = labels.length;
  const slotW = plotW/Math.max(1,n);
  const barW = Math.max(6, Math.min(46, slotW*0.5));

  let bars='', ticks='', capSvg='';
  labels.forEach((lb,i)=>{
    const gx = padL + slotW*(i+0.5);
    const av = actual[i], tv = target[i];
    if(av!=null){
      const barY = Math.min(yAt(av), zeroY), barH = Math.max(1, Math.abs(yAt(av)-zeroY));
      const hit = tv==null || av>=tv;
      bars += '<rect x="'+(gx-barW/2).toFixed(1)+'" y="'+barY.toFixed(1)+'" width="'+barW.toFixed(1)+'" height="'+barH.toFixed(1)+'" rx="2" fill="'+(hit?goodText:critical)+'"/>';
      bars += '<text x="'+gx.toFixed(1)+'" y="'+(barY-5).toFixed(1)+'" font-size="10" font-weight="700" text-anchor="middle" fill="'+inkOne+'">'+yFormatter(av)+'</text>';
    }
    if(tv!=null){
      const ty = yAt(tv);
      const tickW = barW+6;
      ticks += '<rect x="'+(gx-tickW/2).toFixed(1)+'" y="'+(ty-1.25).toFixed(1)+'" width="'+tickW.toFixed(1)+'" height="2.5" rx="1" fill="'+inkOne+'"/>';
    }
    let ly = height-padB+16;
    capSvg += '<text x="'+gx.toFixed(1)+'" y="'+ly+'" font-size="10.5" text-anchor="middle" fill="'+inkTertiary+'">'+lb+'</text>';
    if(av!=null && tv!=null){
      ly += 15;
      const dv = av-tv, dHit = dv>=0;
      capSvg += '<text x="'+gx.toFixed(1)+'" y="'+ly+'" font-size="10.5" font-weight="700" text-anchor="middle" fill="'+(dHit?goodText:critical)+'">'+(dv>=0?'+':'')+yFormatter(dv)+'</text>';
    }
    if(hasMomYoy){
      if(mom && mom[i]!=null){ ly += 13; capSvg += '<text x="'+gx.toFixed(1)+'" y="'+ly+'" font-size="9.5" text-anchor="middle" fill="'+inkTertiary+'">MoM '+fmtSignedPct(mom[i],1)+'</text>'; }
      if(yoy && yoy[i]!=null){ ly += 13; capSvg += '<text x="'+gx.toFixed(1)+'" y="'+ly+'" font-size="9.5" text-anchor="middle" fill="'+inkTertiary+'">YoY '+fmtSignedPct(yoy[i],1)+'</text>'; }
    }
  });

  document.getElementById(containerId).innerHTML =
    '<svg viewBox="0 0 '+width+' '+height+'" width="100%" height="100%" preserveAspectRatio="none">'+gridSvg+bars+ticks+capSvg+'</svg>';
}

/* ---------- Scatter plot with median-split quadrant lines — used for
   "Category Portfolio Matrix" (Growth-Share) ---------- */
// Fix (2026-08-06): buildScatterSVG's label-collision boxes used to estimate
// each label's width from character count (length*3.15px) — a rough
// approximation that assumes a fixed average glyph width. Real text doesn't
// render at a fixed width per character (a "W" is much wider than an "i"),
// and the estimate is completely decoupled from whatever font the browser
// actually substitutes for the page's font-family stack — so the collision
// math could clear a candidate position that the ACTUAL rendered label then
// overlaps, on any system where real glyph widths diverge enough from the
// estimate. Measuring with canvas.measureText() against the label's real
// font-size/weight/family removes that guesswork entirely — the box the
// algorithm reasons about is now the box that actually gets drawn.
let _measureCanvas = null;
function measureTextWidth(text, fontSize, fontWeight, fontFamily){
  if(!_measureCanvas) _measureCanvas = document.createElement('canvas');
  const ctx = _measureCanvas.getContext('2d');
  ctx.font = fontWeight+' '+fontSize+'px '+fontFamily;
  return ctx.measureText(text).width;
}
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
  // opts.xDomainMin/xDomainMax (2026-08-06) — the "|| fallback" padding above
  // only kicks in when the raw span is EXACTLY 0; a near-but-not-quite-equal
  // spread (e.g. 100.75-101.16, a few points all clustered near a shared
  // target) still takes the *0.18 branch, producing a padding of a few
  // hundredths of a percent — a duplicate-tick axis exactly like the
  // bar/line chart fix elsewhere on this page. Opt in per-axis; unset
  // callers keep the exact auto-fit behavior above.
  const niceX = niceAxisTicks(opts.xDomainMin !== undefined ? opts.xDomainMin : rawXMin-xPad, opts.xDomainMax !== undefined ? opts.xDomainMax : rawXMax+xPad, 5);
  const niceY = niceAxisTicks(opts.yDomainMin !== undefined ? opts.yDomainMin : rawYMin-yPad, opts.yDomainMax !== undefined ? opts.yDomainMax : rawYMax+yPad, 5);
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

  // Label-collision avoidance (fix logged 2026-08-01, extended 2026-08-05).
  // Original version (2026-08-01) only ever tried two candidate positions —
  // straight above, or straight below if that collided — checked by
  // center-to-center distance, not real bounding boxes. That missed cases
  // where two points sit close in BOTH x and y (e.g. Category Portfolio
  // Matrix's "Color Cosmetics" and "Hair Care", whose growth% and sales
  // value both land near each other): flipping one label below the point
  // still isn't far enough from the other's box, and a 46×14px collision
  // radius doesn't reflect how wide a real label like "Color Cosmetics"
  // actually renders. Now tries 8 candidate offsets (above, below, and 4
  // diagonals, plus two "further" fallbacks) in priority order, each checked
  // as a real bounding box (label width estimated from character count)
  // against every already-placed label's box, the plot edges, and the
  // quadrant corner label zones — first non-colliding candidate wins.
  const placedBoxes = [];
  const CANDIDATES = [
    {dx:0, dy:-10}, {dx:0, dy:16},
    {dx:34, dy:-10}, {dx:-34, dy:-10},
    {dx:34, dy:16}, {dx:-34, dy:16},
    {dx:0, dy:-26}, {dx:0, dy:32}
  ];
  const cornerZone = 92, cornerH = 20; // approx footprint of a quadrant corner label
  function boxOverlaps(a,b){ return a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0; }
  function hitsCorner(box){
    if(!opts.quadrantLabels) return false;
    const nearTop = box.y0 < padT+cornerH, nearBottom = box.y1 > (height-padB)-cornerH;
    const nearLeft = box.x0 < padL+cornerZone, nearRight = box.x1 > (width-padR)-cornerZone;
    return (nearTop && (nearLeft || nearRight)) || (nearBottom && (nearLeft || nearRight));
  }
  const scatterFontFamily = (container && getComputedStyle(container).fontFamily) || 'sans-serif';
  let pIdx = 0;
  points.forEach(p=>{
    const cx = xAt(p.x), cy = yAt(p.y);
    const halfW = measureTextWidth(p.label, 10.5, '700', scatterFontFamily)/2 + 3, halfH = 8;
    let chosen = null;
    for(const c of CANDIDATES){
      const lx = cx+c.dx, ly = cy+c.dy;
      const box = {x0:lx-halfW, x1:lx+halfW, y0:ly-halfH-2, y1:ly+halfH-2};
      if(box.x0 < padL || box.x1 > width-padR || box.y0 < 2 || box.y1 > height-2) continue;
      if(hitsCorner(box)) continue;
      if(placedBoxes.some(pb => boxOverlaps(pb, box))) continue;
      chosen = {lx, ly, box}; break;
    }
    if(!chosen){ const c = CANDIDATES[1]; const lx=cx+c.dx, ly=cy+c.dy; chosen = {lx, ly, box:{x0:lx-halfW,x1:lx+halfW,y0:ly-halfH-2,y1:ly+halfH-2}}; }
    placedBoxes.push(chosen.box);
    // data-pidx (2026-08-06) — lets opts.tooltips below find the right point
    // by array index on hover; harmless when opts.tooltips isn't set.
    svg += '<circle class="scatter-dot" data-pidx="'+pIdx+'" cx="'+cx.toFixed(1)+'" cy="'+cy.toFixed(1)+'" r="'+(p.r||7)+'" fill="'+p.color+'" opacity="0.88"'+(opts.tooltips?' style="cursor:pointer;"':'')+'/>';
    svg += '<text x="'+chosen.lx.toFixed(1)+'" y="'+chosen.ly.toFixed(1)+'" font-size="10.5" font-weight="700" text-anchor="middle" fill="'+inkTwo+'">'+p.label+'</text>';
    pIdx++;
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

  // opts.tooltips (2026-08-06) — one HTML string per point (by array index,
  // matches data-pidx above), shown via the same shared tooltip element the
  // line/bar chart hover markers already use.
  if(opts.tooltips){
    const tooltip = ensureChartTooltip();
    container.onmouseover = (e)=>{
      const dot = e.target.closest('circle[data-pidx]');
      if(!dot) return;
      const html = opts.tooltips[+dot.dataset.pidx];
      if(!html) return;
      tooltip.innerHTML = html;
      const pw = 220;
      let left = e.clientX + 14;
      if(left + pw > window.innerWidth - 12) left = e.clientX - pw - 14;
      let top = e.clientY + 14;
      if(top + 140 > window.innerHeight - 12) top = e.clientY - 150;
      tooltip.style.left = Math.max(12,left) + 'px';
      tooltip.style.top = Math.max(12,top) + 'px';
      tooltip.classList.add('show');
    };
    container.onmouseout = (e)=>{
      if(e.target.closest('circle[data-pidx]')) tooltip.classList.remove('show');
    };
  }
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
  // rotateLabels (2026-08-06): optional slanted/vertical X-axis labels for
  // charts with many steps (e.g. Category Growth Contribution, up to ~10
  // bars) where horizontal centered labels collide into an unreadable
  // smear. Off by default (existing callers with few, short labels are
  // unaffected). Accepts `true` (defaults to 35°) or a specific angle in
  // degrees (e.g. 90 for fully vertical). padB is measured from the actual
  // rendered label width (via measureTextWidth, same technique
  // buildScatterSVG uses for its collision boxes) rather than a guessed
  // constant, so it stays correct at any angle or label length instead of
  // needing a hand-tuned number per angle.
  const rotateDeg = opts.rotateLabels === true ? 35 : (opts.rotateLabels || 0);
  const rotateFontFamily = (container && getComputedStyle(container).fontFamily) || 'sans-serif';
  const padL=54, padR=16;
  // Responsive compact mode (2026-08-13) -- narrow containers (mobile) give
  // each step a slot too thin for the default font sizes: value labels
  // ("+฿9.9M") and category labels ("Selling & Distribution") from
  // neighboring bars start overlapping horizontally once the slot shrinks
  // below where the text itself is wider than the gap between adjacent bar
  // centers. Same "shrink font under a width threshold" convention already
  // used by buildStacked100BarSVG's `compact`/`fontPct` -- barW itself only
  // depends on width/padL/padR/steps.length (not on padB below), so it can
  // be computed here, ahead of every label-sizing decision that follows.
  const estSlotW = (width-padL-padR)/Math.max(1,steps.length);
  const compact = estSlotW*0.55 < 34;
  const labelFontSize = compact ? 8.5 : 10;
  const valueFontSize = compact ? 9 : 10.5;
  const lineHeight = Math.round(labelFontSize+1);
  // Value-label stagger (2026-08-13) -- alternate bars raise their value
  // label an extra `staggerOffset` above the bar top in compact mode, so
  // adjacent labels ("+฿9.9M" / "-฿4.8M") sit at clearly different heights
  // instead of racing to fit into a slot too narrow for both to sit on the
  // same baseline without touching. Cheaper and more robust than measuring
  // exact text widths per pair -- any vertical gap avoids the collision
  // regardless of how wide a given formatted value turns out to be.
  const staggerOffset = compact ? 11 : 0;
  const padT = 16 + staggerOffset;
  const maxLabelW = rotateDeg ? Math.max(0, ...steps.map(st => measureTextWidth(st.label, labelFontSize, '400', rotateFontFamily))) : 0;
  // Upright wrapped labels (2026-08-11) -- the non-rotated path used to just
  // clip/collide on a long label (e.g. "Selling & Distribution"); now each
  // label greedy-wraps onto as many lines as it needs to fit its own slot
  // width, staying upright instead of switching to a rotated/slanted look.
  function wrapLabelLines(label, maxWidth, fontSize, fontWeight, fontFamily){
    const words = label.split(' ');
    if(words.length<=1) return [label];
    const lines = [];
    let current = words[0];
    for(let i=1;i<words.length;i++){
      const test = current+' '+words[i];
      if(measureTextWidth(test, fontSize, fontWeight, fontFamily) <= maxWidth) current = test;
      else { lines.push(current); current = words[i]; }
    }
    lines.push(current);
    return lines;
  }
  const wrappedLabelLines = rotateDeg ? [] : steps.map(st => wrapLabelLines(st.label, estSlotW-(compact?12:4), labelFontSize, '400', rotateFontFamily));
  const maxLabelLineCount = wrappedLabelLines.length ? Math.max(1, ...wrappedLabelLines.map(l=>l.length)) : 1;
  const padB = rotateDeg ? Math.ceil(20 + maxLabelW*Math.abs(Math.sin(rotateDeg*Math.PI/180))) : (22 + (maxLabelLineCount-1)*lineHeight);
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
    const labelY = y-6-(staggerOffset && i%2===1 ? staggerOffset : 0);
    barsSvg += '<text x="'+(x+barW/2).toFixed(1)+'" y="'+labelY.toFixed(1)+'" font-size="'+valueFontSize+'" font-weight="700" text-anchor="middle" fill="'+color+'">'+labelVal+'</text>';
    if(rotateDeg){
      // Fix (2026-08-06): rotate(-35) was the wrong sign — in SVG's y-down
      // coordinate system that sweeps the text-anchor="end" label DOWNWARD
      // from its anchor point (below the "height-8" baseline), not upward
      // into the chart's own padding as intended. That let long labels dip
      // below the SVG's bottom edge and visually collide with whatever
      // sibling element (e.g. the insight callout) sits right after the
      // canvas-wrap in the DOM. A positive angle sweeps up-and-left instead,
      // staying inside the padB reserved for this mode (at 90° the label
      // runs straight up, reading bottom-to-top).
      const lx = (x+barW/2).toFixed(1), ly = height-8;
      xLabels += '<text x="'+lx+'" y="'+ly+'" font-size="'+labelFontSize+'" text-anchor="end" fill="'+inkTertiary+'" transform="rotate('+rotateDeg+' '+lx+' '+ly+')">'+st.label+'</text>';
    } else {
      // Upright, wraps onto extra lines instead of rotating/clipping (see
      // wrapLabelLines above) -- the LAST line sits at the same height-8
      // baseline a single-line label always used, earlier lines stack
      // upward from there into the padB room reserved for the widest wrap.
      const lines = wrappedLabelLines[i] || [st.label];
      const lx2 = (x+barW/2).toFixed(1);
      lines.forEach((ln,li)=>{
        const ly2 = height-8-(lines.length-1-li)*lineHeight;
        xLabels += '<text x="'+lx2+'" y="'+ly2+'" font-size="'+labelFontSize+'" text-anchor="middle" fill="'+inkTertiary+'">'+ln+'</text>';
      });
    }
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
  // highlightSeries (2026-08-06, Focus filter fix): outlines every segment
  // belonging to the named series so picking a Focus node actually shows up
  // on the chart itself, not just in whatever Top-N list it got pinned into
  // — matches the box-shadow/border highlight convention used by the
  // Heatmap/Sales-by-Category/Growth-Ranking/Return-Rate cards elsewhere on
  // this page.
  const highlightSeries = opts.highlightSeries || null;
  const highlightColor = cssVar('--ink-1') || '#0b0b0b';
  // opts.pctDecimals (post-build review fix): defaults to 0 (unchanged for
  // every existing caller) -- pass 1 when this chart's % figures are meant
  // to be directly compared against another widget that displays 1-decimal
  // precision (e.g. a Ranking table's Net Margin %), so the two don't look
  // like they disagree when they're actually the same number rounded
  // differently for a narrow in-bar label vs a spacious table cell.
  const pctDecimals = opts.pctDecimals!==undefined ? opts.pctDecimals : 0;

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
      const isHi = highlightSeries && s.name === highlightSeries;
      bars += '<rect x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+barW.toFixed(1)+'" height="'+Math.max(0,segH).toFixed(1)+'" fill="'+s.color+'"'+(isHi?' stroke="'+highlightColor+'" stroke-width="2.5"':'')+'/>';
      const showValueLine = !compact && segH > 40;
      if(segH > 22){
        const pct = (val/total*100).toFixed(pctDecimals)+'%';
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

/* ---------- Absolute-value stacked vertical bar chart (2026-08-06) — same
   segment-per-series layout as buildStacked100BarSVG, but bars are scaled to
   their own ฿ totals against a shared Y-axis instead of every bar being
   normalized to a full-height 100%. Use this when the TOTAL height itself is
   part of the story (e.g. "Revenue Trend by Product Level" — both the mix
   AND the overall growth matter); use buildStacked100BarSVG when only the mix
   shift matters and every bucket should fill the same height. ---------- */
function buildStackedBarSVG(containerId, opts){
  const container = document.getElementById(containerId);
  const width = opts.width || (container ? container.clientWidth : 0) || 700;
  const height = opts.height || (container ? container.clientHeight : 0) || 260;
  const labels = opts.labels, series = opts.series; // series: [{name,color,values:[absolute per bucket]}]
  const valueFormatter = opts.valueFormatter || (v=>v);
  // opts.line (2026-08-11) — an optional single %-rate line series on an
  // independent right axis, overlaid on the stacked bars (e.g. "Selling
  // Expense-to-Sales %" over a stacked expense-category breakdown) — same
  // dual-axis convention as buildComboBarLineSVG, just paired with stacked
  // (not single) bars. Existing callers without opts.line are unaffected
  // (padR stays 10, no axis/line drawn).
  const hasLine = !!opts.line;
  const lineYFormatter = opts.lineYFormatter || (v=>v);
  const padL=54, padR=hasLine?44:10, padT=10, padB=28;
  const plotW = width-padL-padR, plotH = height-padT-padB;
  const n = labels.length;
  const slotW = plotW/n;
  const barW = slotW*0.6;
  const inkTertiary = cssVar('--ink-3')||'#898781';
  const hairline = cssVar('--hairline') || '#e1e0d9';
  // highlightSeries — see buildStacked100BarSVG's comment above; same fix,
  // same reasoning, applied to this chart's segments too.
  const highlightSeries = opts.highlightSeries || null;
  const highlightColor = cssVar('--ink-1') || '#0b0b0b';

  const totals = [];
  for(let i=0;i<n;i++) totals.push(series.reduce((a,s)=>a+s.values[i],0));
  const maxTotal = Math.max(...totals) || 1;
  // Extra headroom when a total/comparison label needs to sit above the
  // tallest bar (2026-08-11) — the default 1.12 only leaves room for a
  // single bold total line, not the 1-2 extra comparison lines
  // opts.lastBarExtraLines adds on top of it.
  const niceMax = maxTotal * ((opts.showTotalLabels && opts.lastBarExtraLines && opts.lastBarExtraLines.length) ? 1.32 : (opts.showTotalLabels ? 1.16 : 1.12));
  const yAt = v => padT + (1 - v/niceMax) * plotH;

  let grid = '';
  const gridSteps = 4;
  for(let g=0; g<=gridSteps; g++){
    const v = niceMax * g/gridSteps;
    const y = yAt(v);
    grid += '<line x1="'+padL+'" y1="'+y.toFixed(1)+'" x2="'+(width-padR)+'" y2="'+y.toFixed(1)+'" stroke="'+hairline+'" stroke-width="1"/>';
    grid += '<text x="'+(padL-8)+'" y="'+(y+3).toFixed(1)+'" font-size="9" text-anchor="end" fill="'+inkTertiary+'">'+valueFormatter(v)+'</text>';
  }

  const compact = barW < 34;
  const fontVal = compact ? 8 : 9.5;
  // opts.showTotalLabels (2026-08-11) — a bold total-of-segments label above
  // each bar, for callers where the overall total is as much the story as
  // the mix (e.g. "Revenue by Channel"). opts.partialLastBar (2026-08-11) —
  // renders the LAST bar only at reduced opacity with a dashed outline, the
  // same "provisional, not a closed period" convention used elsewhere on
  // this dashboard for an in-progress YTD/annual bucket. opts.lastBarExtraLines
  // (2026-08-11) — extra text line(s) (e.g. a YoY/MoM comparison) drawn
  // above the LAST bar's total label only, since only the latest bucket
  // needs a comparison per this dashboard's convention.
  const inkOneVar = cssVar('--ink-1') || '#0b0b0b';

  let bars='', xLabels='', totalLabels='';
  for(let i=0;i<n;i++){
    let cum = 0;
    const x = padL + i*slotW + (slotW-barW)/2;
    const isLast = i===n-1;
    const partial = opts.partialLastBar && isLast;
    series.forEach(s=>{
      const val = s.values[i];
      const segH = (val/niceMax)*plotH;
      const y = padT + (plotH - cum - segH);
      const isHi = highlightSeries && s.name === highlightSeries;
      const partialAttrs = partial ? ' fill-opacity="0.55" stroke="'+s.color+'" stroke-width="1.5" stroke-dasharray="3,2"' : '';
      bars += '<rect x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+barW.toFixed(1)+'" height="'+Math.max(0,segH).toFixed(1)+'" fill="'+s.color+'"'+partialAttrs+(isHi?' stroke="'+highlightColor+'" stroke-width="2.5"':'')+'/>';
      if(segH > 16){
        bars += '<text x="'+(x+barW/2).toFixed(1)+'" y="'+(y+segH/2+3).toFixed(1)+'" font-size="'+fontVal+'" font-weight="700" text-anchor="middle" fill="#fff">'+valueFormatter(val)+'</text>';
      }
      cum += segH;
    });
    if(opts.showTotalLabels){
      const total = series.reduce((a,s)=>a+s.values[i],0);
      const topY = padT + (plotH - cum);
      totalLabels += '<text x="'+(x+barW/2).toFixed(1)+'" y="'+(topY-6).toFixed(1)+'" font-size="10.5" font-weight="700" text-anchor="middle" fill="'+inkOneVar+'">'+valueFormatter(total)+'</text>';
      if(isLast && opts.lastBarExtraLines && opts.lastBarExtraLines.length){
        // Each entry is a plain string (default gray) or a {text,color}
        // object (2026-08-11, for polarity-colored YoY/MoM/QoQ comparisons).
        opts.lastBarExtraLines.forEach((extraLine,li)=>{
          const isObj = extraLine && typeof extraLine === 'object';
          const text = isObj ? extraLine.text : extraLine;
          const color = isObj && extraLine.color ? extraLine.color : inkTertiary;
          totalLabels += '<text x="'+(x+barW/2).toFixed(1)+'" y="'+(topY-6-14*(li+1)).toFixed(1)+'" font-size="9.5" font-weight="600" text-anchor="middle" fill="'+color+'">'+text+'</text>';
        });
      }
    }
    const labelText = partial ? labels[i]+' (YTD)' : labels[i];
    xLabels += '<text x="'+(x+barW/2).toFixed(1)+'" y="'+(height-8)+'" font-size="'+(compact?9:10)+'" text-anchor="middle" fill="'+inkTertiary+'">'+labelText+'</text>';
  }

  let lineSvg = '';
  if(hasLine){
    const lineValsClean = opts.line.values.filter(v=>v!==null && v!==undefined);
    const lineMinRaw = Math.min(...lineValsClean), lineMaxRaw = Math.max(...lineValsClean);
    const lineSpan = (lineMaxRaw-lineMinRaw) || Math.abs(lineMaxRaw) || 1;
    const lineNice = niceAxisTicks(lineMinRaw - lineSpan*0.15, lineMaxRaw + lineSpan*0.15, 4);
    let lineYMin=lineNice.min, lineYMax=lineNice.max; if(lineYMax===lineYMin) lineYMax=lineYMin+1;
    const lineYAt = v => padT + (1-(v-lineYMin)/(lineYMax-lineYMin))*plotH;
    let lineTicksSvg = '';
    lineNice.ticks.forEach(val=>{
      const y = lineYAt(val);
      lineTicksSvg += '<text x="'+(width-padR+7)+'" y="'+(y+3).toFixed(1)+'" font-size="9" text-anchor="start" fill="'+opts.line.color+'">'+lineYFormatter(val)+'</text>';
    });
    const cellCenterX = i => padL + i*slotW + slotW/2;
    let lineD = '', lineDots = '', lastIdx=-1;
    opts.line.values.forEach((v,i)=>{
      if(v===null || v===undefined) return;
      const x = cellCenterX(i), y = lineYAt(v);
      lineD += (lineD?'L':'M')+x.toFixed(1)+','+y.toFixed(1)+' ';
      lineDots += '<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="3" fill="'+opts.line.color+'"/>';
      lastIdx = i;
    });
    let lastLabelSvg = '';
    if(lastIdx>=0){
      const x = cellCenterX(lastIdx), y = lineYAt(opts.line.values[lastIdx]);
      const anchor = x > width-padR-30 ? 'end' : 'start';
      const lx = anchor==='end' ? x-8 : x+8;
      lastLabelSvg = '<text x="'+lx.toFixed(1)+'" y="'+(y-9).toFixed(1)+'" font-size="10" font-weight="700" text-anchor="'+anchor+'" fill="'+opts.line.color+'">'+lineYFormatter(opts.line.values[lastIdx])+'</text>';
    }
    lineSvg = lineTicksSvg + '<path d="'+lineD.trim()+'" fill="none" stroke="'+opts.line.color+'" stroke-width="2.4" stroke-dasharray="5,4" stroke-linecap="round" stroke-linejoin="round"/>'+lineDots+lastLabelSvg;
  }

  document.getElementById(containerId).innerHTML =
    '<svg viewBox="0 0 '+width+' '+height+'" width="100%" height="100%" preserveAspectRatio="none">'+grid+bars+totalLabels+lineSvg+xLabels+'</svg>';
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

  // xAxisTitle (2026-08-06): a caption under the per-group labels, for
  // charts whose axis labels alone (e.g. "1–10%") aren't self-explanatory on
  // first read — clarifies what the groups actually represent.
  if(opts.xAxisTitle){
    svg += '<text x="'+(padL+plotW/2).toFixed(1)+'" y="'+(height-6)+'" font-size="9.5" font-weight="600" text-anchor="middle" fill="'+inkTwo+'">'+opts.xAxisTitle+'</text>';
  }

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

/* ---------- Smooth stream/area chart (100%-stacked, mix over time) with a
   hover tooltip — added 2026-08-05 for MT Breakdown's "Category Share of
   Sales Over Time", which previously used buildStacked100BarSVG (monthly
   stacked bars with a % + ฿ label baked into every segment of every month —
   18 months × 6 categories = 108 always-on labels, too dense to read at a
   glance). This function keeps the same 100%-stacked *meaning* (mix, not
   absolute ฿) but smooths the band boundaries with a Catmull-Rom resample
   (denser interpolated points, drawn as a fine polyline — visually
   indistinguishable from a true bezier spline without needing bezier
   control-point math) and drops the always-on labels entirely in favor of a
   single shared hover tooltip that shows the exact %/฿ for every series at
   whatever month the cursor is nearest to. buildStacked100BarSVG itself is
   untouched — every other caller (Store Productivity Quartile by Partner,
   etc.) keeps its current always-labeled bar-chart look. ---------- */
function catmullRomResample(values, samplesPerSegment){
  const n = values.length;
  if(n < 2) return values.slice();
  const get = i => values[Math.max(0, Math.min(n-1, i))];
  const out = [];
  for(let i=0;i<n-1;i++){
    const p0=get(i-1), p1=get(i), p2=get(i+1), p3=get(i+2);
    for(let s=0;s<samplesPerSegment;s++){
      const t = s/samplesPerSegment, t2=t*t, t3=t2*t;
      out.push(0.5*((2*p1) + (-p0+p2)*t + (2*p0-5*p1+4*p2-p3)*t2 + (-p0+3*p1-3*p2+p3)*t3));
    }
  }
  out.push(values[n-1]);
  return out;
}
function ensureChartTooltip(){
  let el = document.getElementById('sharedChartTooltip');
  if(!el){
    el = document.createElement('div');
    el.id = 'sharedChartTooltip';
    el.className = 'chart-tooltip';
    document.body.appendChild(el);
  }
  return el;
}
function buildStreamAreaSVG(containerId, opts){
  const container = document.getElementById(containerId);
  const width = opts.width || (container ? container.clientWidth : 0) || 700;
  const height = opts.height || (container ? container.clientHeight : 0) || 260;
  const labels = opts.labels, series = opts.series; // series: [{name,color,values:[absolute per month]}]
  const valueFormatter = opts.valueFormatter || (v=>v);
  const n = labels.length;
  const padL=30, padR=8, padT=10, padB=22;
  const plotW = width-padL-padR, plotH = height-padT-padB;
  const hairline = cssVar('--hairline')||'#e1e0d9', inkTertiary = cssVar('--ink-3')||'#898781';
  const SAMPLES = 8;

  const totals = labels.map((lb,m)=> series.reduce((a,s)=>a+s.values[m],0) || 1);
  const pctByMonth = series.map(s => s.values.map((v,m)=> v/totals[m]*100));
  const cum = []; // cum[i][m] = cumulative % through series i at month m
  series.forEach((s,i)=>{
    cum.push(labels.map((lb,m)=> (i===0?0:cum[i-1][m]) + pctByMonth[i][m]));
  });
  const denseCum = cum.map(arr => catmullRomResample(arr, SAMPLES));
  // Clamp: a Catmull-Rom curve can overshoot slightly past its control
  // points, which for stacked bands could otherwise invert two adjacent
  // boundaries (band height going negative) right where a category's share
  // swings sharply month to month. Clamping each band's resampled curve to
  // never dip below the band beneath it (and to stay within 0-100%) keeps
  // every band a valid non-negative height everywhere along the curve.
  for(let i=0;i<denseCum.length;i++){
    for(let k=0;k<denseCum[i].length;k++){
      const floor = i===0 ? 0 : denseCum[i-1][k];
      denseCum[i][k] = Math.min(100, Math.max(floor, denseCum[i][k]));
    }
  }
  const denseLen = denseCum[0] ? denseCum[0].length : 0;
  const xAtDense = k => padL + (denseLen>1 ? k/(denseLen-1)*plotW : 0);
  const xAtMonth = m => padL + (n>1 ? m/(n-1)*plotW : 0);
  const yAt = v => padT + (1 - v/100) * plotH;

  let svg = '';
  [0,50,100].forEach(v=>{
    const y = yAt(v);
    svg += '<line x1="'+padL+'" y1="'+y.toFixed(1)+'" x2="'+(width-padR)+'" y2="'+y.toFixed(1)+'" stroke="'+hairline+'" stroke-width="1"/>';
    svg += '<text x="'+(padL-6)+'" y="'+(y+3).toFixed(1)+'" font-size="9" text-anchor="end" fill="'+inkTertiary+'">'+v+'%</text>';
  });

  for(let i=0;i<series.length;i++){
    const top = denseCum[i], bottom = i===0 ? denseCum[i].map(()=>0) : denseCum[i-1];
    let d = '';
    for(let k=0;k<denseLen;k++){ const x=xAtDense(k), y=yAt(top[k]); d += (k===0?'M':'L')+x.toFixed(1)+','+y.toFixed(1)+' '; }
    for(let k=denseLen-1;k>=0;k--){ const x=xAtDense(k), y=yAt(bottom[k]); d += 'L'+x.toFixed(1)+','+y.toFixed(1)+' '; }
    d += 'Z';
    svg += '<path d="'+d+'" fill="'+series[i].color+'" opacity="0.9"/>';
  }

  const showEvery = n>12 ? 3 : 1;
  labels.forEach((lb,m)=>{
    if(m%showEvery!==0 && m!==n-1) return;
    svg += '<text x="'+xAtMonth(m).toFixed(1)+'" y="'+(height-6)+'" font-size="9.5" text-anchor="middle" fill="'+inkTertiary+'">'+lb+'</text>';
  });
  svg += '<line id="'+containerId+'-crosshair" x1="0" y1="'+padT+'" x2="0" y2="'+(height-padB)+'" stroke="'+(cssVar('--ink-1')||'#0b0b0b')+'" stroke-width="1" opacity="0"/>';

  container.innerHTML = '<svg viewBox="0 0 '+width+' '+height+'" width="100%" height="100%" preserveAspectRatio="none">'+svg+'</svg>';

  /* --- Hover tooltip: nearest-month lookup, shows every series' real (non-
     interpolated) %/฿ at that month, plus a crosshair line for orientation. --- */
  const tooltip = ensureChartTooltip();
  const crosshair = document.getElementById(containerId+'-crosshair');
  container.onmousemove = (e)=>{
    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const scaleX = rect.width ? width/rect.width : 1;
    const svgX = mouseX*scaleX;
    let m = Math.round((svgX-padL)/(plotW||1)*(n-1));
    m = Math.max(0, Math.min(n-1, m));
    const cx = xAtMonth(m) / width * rect.width;
    crosshair.setAttribute('x1', xAtMonth(m).toFixed(1));
    crosshair.setAttribute('x2', xAtMonth(m).toFixed(1));
    crosshair.setAttribute('opacity', '0.35');
    const rows = series.map((s,i)=>({ name:s.name, color:s.color, pct: pctByMonth[i][m], value: s.values[m] }))
      .sort((a,b)=>b.value-a.value);
    tooltip.innerHTML = '<div class="chart-tooltip-title">'+labels[m]+'</div>'
      + rows.map(r=>'<div class="chart-tooltip-row"><span class="chart-tooltip-dot" style="background:'+r.color+';"></span><span class="chart-tooltip-name">'+r.name+'</span><span class="chart-tooltip-value">'+valueFormatter(r.value)+' · '+r.pct.toFixed(0)+'%</span></div>').join('');
    const pw = 240;
    let left = e.clientX + 14;
    if(left + pw > window.innerWidth - 12) left = e.clientX - pw - 14;
    let top = e.clientY + 14;
    if(top + 140 > window.innerHeight - 12) top = e.clientY - 150;
    tooltip.style.left = Math.max(12,left) + 'px';
    tooltip.style.top = Math.max(12,top) + 'px';
    tooltip.classList.add('show');
  };
  container.onmouseleave = ()=>{ tooltip.classList.remove('show'); crosshair.setAttribute('opacity','0'); };
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

/* ---------- Section-nav scroll-spy (ported 2026-08-06 from sales_overview.html
   so every page with a .section-nav inside .page-header-sticky gets the same
   pink "active" pill following scroll position, not just Sales Overview).
   Safe no-op if the page has no .section-nav or #pageHeaderSticky. ---------- */
function initSectionScrollSpy(){
  const navLinks = Array.from(document.querySelectorAll('.section-nav a'));
  const anchors = navLinks
    .map(a => document.getElementById(a.getAttribute('href').slice(1)))
    .filter(Boolean);
  const headerWrap = document.getElementById('pageHeaderSticky');
  if(!anchors.length || !navLinks.length || !headerWrap) return;
  function setActive(id){
    navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#'+id));
  }
  let ticking = false;
  function updateActive(){
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    if(atBottom){ setActive(anchors[anchors.length-1].id); ticking = false; return; }
    const buffer = headerWrap.getBoundingClientRect().height + 16;
    let currentId = anchors[0].id;
    anchors.forEach(a => { if(a.getBoundingClientRect().top <= buffer) currentId = a.id; });
    setActive(currentId);
    ticking = false;
  }
  window.addEventListener('scroll', ()=>{
    if(!ticking){ requestAnimationFrame(updateActive); ticking = true; }
  }, {passive:true});
  updateActive();
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
