/* ============================================================================
   Navigation Menu (Module Switcher)
   One menu, usable from any module file, that lists every page in the
   Hierarchy grouped by module. Pages that don't have a file yet are
   disabled with a "Coming soon" badge. Clicking a ready item navigates
   straight to that file (optionally with a #hash the target page reads on
   load to open the right internal tab — see initHashTabs below).
   ============================================================================ */
const MODULE_MAP = [
  {
    group: 'Financial Statement',
    ready: true,
    items: [
      { key:'fs-analysis',   label:'Financial Analysis',     href:'pnl_financial_analysis.html' },
      { key:'pnl',           label:'P&L',                    href:'pnl_executive_summary.html' },
      { key:'fs-cashflow',   label:'Cash Flow',              href:'pnl_cash_flow.html' },
      { key:'pnl-balance',   label:'Balance Sheet',          href:'pnl_balance_sheet.html' },
      { key:'fs-equity',     label:'Equity Changes', href:'pnl_equity_changes.html' },
    ],
  },
  {
    group: 'Sales Overview (Company-wide)',
    ready: true,
    items: [
      { key:'so-exec',    label:'Executive Outlook',  href:'sales_overview.html' },
      { key:'so-product', label:'Product Analysis',   href:'sales_overview_product_analysis.html' },
    ],
  },
  {
    group: 'MT Overview',
    ready: true,
    items: [
      { key:'mt-exec',      label:'Executive Summary', href:'module_mt_executive_summary.html' },
      { key:'mt-breakdown', label:'Breakdown',          href:'module_mt_breakdown.html' },
      { key:'mt-store',     label:'Store',              href:'module_mt_store.html' },
    ],
  },
  {
    group: 'TT Overview',
    ready: true,
    items: [
      { key:'tt-exec',      label:'Executive Summary', href:'tt_executive_summary.html' },
      { key:'tt-breakdown', label:'Breakdown',          href:'tt_breakdown.html' },
      { key:'tt-person',    label:'Sales Person',       href:'tt_sales_person.html' },
    ],
  },
  {
    group: 'ECOM Overview',
    ready: true,
    items: [
      { key:'ecom-exec',      label:'Executive Summary', href:'module_ecom_executive_summary.html' },
      { key:'ecom-breakdown', label:'Breakdown',          href:'module_ecom_breakdown.html' },
    ],
  },
];

/**
 * Renders the Navigation Menu button + panel into #navMenuMount (must exist
 * in the page's header markup) and wires open/close + click-to-navigate.
 * `currentKey` should match one of the MODULE_MAP item keys so that item is
 * marked as the current page and shown non-clickable.
 *
 * The closed button shows only the MODULE group name (e.g. "Sales Overview"),
 * not "Sales Overview · Executive Outlook" — pages with a sub-module tab
 * switcher next to this button already show the sub-module name there, so
 * repeating it on the button as well just duplicates the same word twice.
 * `currentLabel` is kept as a fallback (used only if `currentKey` doesn't
 * match any MODULE_MAP item) so existing call sites don't need to change.
 */
function renderNavMenu(currentKey, currentLabel){
  const mount = document.getElementById('navMenuMount');
  if(!mount) return;

  let groupsHtml = '';
  let currentGroupLabel = currentLabel;
  MODULE_MAP.forEach(group=>{
    groupsHtml += '<div class="navmenu-group">' + group.group
      + (group.ready ? '' : ' <span class="badge-soon">Coming soon</span>')
      + '</div>';
    group.items.forEach(item=>{
      const isCurrent = item.key === currentKey;
      if(isCurrent) currentGroupLabel = group.group;
      const disabled = !group.ready;
      groupsHtml += '<button type="button" class="navmenu-item" data-href="'+item.href+'" '
        + (disabled ? 'disabled' : '') + ' aria-current="'+(isCurrent?'true':'false')+'">'
        + '<span class="navmenu-item-dot"></span><span>'+item.label+'</span></button>';
    });
  });

  // Button label drops any "(...)" qualifier from the group name (e.g.
  // "Sales Overview (Company-wide)" -> "Sales Overview") — that qualifier
  // earns its place as a section heading inside the dropdown panel (it
  // disambiguates group scope among several groups at once) but reads as
  // clutter on the compact button, which only ever shows one group.
  const btnLabel = (currentGroupLabel||'Navigate').replace(/\s*\([^)]*\)\s*$/, '');

  mount.innerHTML =
    '<div class="navmenu-wrap">'
    + '<button type="button" class="navmenu-btn" id="navMenuBtn">'
    +   '<span id="navMenuBtnLabel">'+btnLabel+'</span>'
    +   '<span class="navmenu-caret">▾</span>'
    + '</button>'
    + '<div class="navmenu-panel" id="navMenuPanel">'+groupsHtml+'</div>'
    + '</div>';

  const btn = document.getElementById('navMenuBtn');
  const panel = document.getElementById('navMenuPanel');
  btn.addEventListener('click', (e)=>{ e.stopPropagation(); panel.classList.toggle('open'); });
  document.addEventListener('click', (e)=>{ if(!panel.contains(e.target) && e.target!==btn) panel.classList.remove('open'); });
  panel.querySelectorAll('.navmenu-item:not([disabled])').forEach(el=>{
    el.addEventListener('click', ()=>{ window.location.href = el.dataset.href; });
  });
}

/**
 * For module files that hold multiple tabs in one page via hash routing (none currently use
 * this — TT Overview was split into separate files on 2026-07-31, so this is unused there now,
 * kept only for any future module built the same way TT originally was). Reads location.hash
 * on load so a Navigation Menu link from another file can deep-link straight to the right tab.
 * `tabConfig` is a map of hashKey -> switch function.
 */
function initHashTabs(tabConfig, defaultKey){
  const hash = (window.location.hash || '').replace('#','');
  const key = tabConfig[hash] ? hash : defaultKey;
  tabConfig[key]();
}
