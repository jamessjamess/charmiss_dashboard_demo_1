# Charmiss Dashboard — Module Spec: P&L Overview

**สถานะ:** Spec ออกแบบ ยังไม่ Build — ใช้เอกสารนี้เป็นแหล่งอ้างอิงตอนลงมือสร้างไฟล์จริง (แบบเดียวกับที่ ECOM Overview ใช้ Q&A ยืนยันโครงสร้างก่อน Build)
**แยกจาก** `Charmiss_Dashboard_Spec.md` (Spec หลัก) และ `Charmiss_Dashboard_Review_2026-07-31.md` (Review) — เอกสารนี้เป็น Spec เฉพาะของ Module ใหม่เท่านั้น เมื่อ Build เสร็จค่อยเอาเนื้อหาไปเพิ่มใน Spec หลัก (เพิ่ม section ใหม่ ไม่ทับของเดิม)

ที่มา: ต่อยอดจาก Review เอกสารก่อนหน้า — ปิดช่องว่างที่ระบุไว้ใน Task 5 ("กำไร/Margin ไม่มีหน้าไหนตอบได้เลย — Gap ใหญ่สุด"), Task 7.3 (Profitability/Margin Module) และครอบคลุมบางส่วนของ Task 7.4 (Ads Spend ที่ตัดออกจาก ECOM ไปก่อนหน้านี้ — ระดับ Company/Channel เท่านั้น)

การตัดสินใจหลักที่ยืนยันแล้ว (ผ่าน AskUserQuestion):
1. **ความลึก:** เต็มถึง Net Profit (ไม่ใช่แค่ Gross Margin) — ต้องสร้างมิติต้นทุนใหม่ (Trade Spend, Logistics, Marketing/Ads, SG&A)
2. **Margin granularity:** Category × Channel (Margin % พื้นฐานตาม Category คูณด้วย Channel Adjustment Factor)
3. **โครงสร้างไฟล์:** แยก 2 ไฟล์ Executive Summary + Breakdown ตาม Pattern เดียวกับ MT/TT/ECOM

---

## 1. ตำแหน่งใน Navigation และไฟล์

### 1.1 MODULE_MAP (nav-menu.js)

เพิ่ม Group ใหม่เป็น **ตัวแรกของ Array** (ก่อน `'Sales Overview (Company-wide)'`) เพื่อให้ปรากฏเป็นรายการแรกทั้งใน Nav Menu dropdown และในหน้า `index.html` (ซึ่ง render directory ตามลำดับ MODULE_MAP โดยตรง):

```js
const MODULE_MAP = [
  {
    group: 'P&L Overview',
    ready: true,
    items: [
      { key:'pnl-exec',      label:'Executive Summary', href:'pnl_executive_summary.html' },
      { key:'pnl-breakdown', label:'Breakdown',          href:'pnl_breakdown.html' },
    ],
  },
  {
    group: 'Sales Overview (Company-wide)',
    ...  // เดิม ไม่แก้
  },
  ...  // MT / TT / ECOM เดิม ไม่แก้
];
```

### 1.2 index.html — **ห้ามแก้ปุ่ม Start**

หน้า `index.html` มี Hero CTA "เข้าสู่ Sales Overview →" ที่ชี้ไปที่ `sales_overview.html` ตรง ๆ (ฮาร์ดโค้ด ไม่ได้ผูกกับ MODULE_MAP) — **ต้องคงไว้แบบเดิมทุกประการ** แม้ P&L Overview จะกลายเป็นการ์ดแรกในรายการ Directory ด้านล่างก็ตาม เพราะผู้ใช้ระบุชัดเจนว่า "ลำดับ Page P&L จะอยู่ก่อน Sales Overview แต่หลังเปิด index แล้วกดเข้ามาจะเป็น Sales Overview เหมือนเดิม" กล่าวคือ:
- **ลำดับการแสดงผลใน Directory/Nav Menu** → P&L Overview มาก่อน ✅ (ทำได้จากการจัดลำดับ MODULE_MAP)
- **ปุ่ม Entry point หลัก (Hero CTA)** → ยังคงพาไป Sales Overview เหมือนเดิม ✅ (ไม่แตะโค้ดส่วนนี้เลย)

### 1.3 ชื่อไฟล์

ใช้ `pnl_executive_summary.html` / `pnl_breakdown.html` (ไม่มี prefix `module_`) — ตามแบบ `sales_overview.html` และ `tt_executive_summary.html` เพราะ P&L Overview เป็นมุมมอง **Company-wide ข้าม Channel** เหมือน Sales Overview ไม่ใช่ Module เฉพาะ Channel เดียวแบบ MT/ECOM ที่ใช้ prefix `module_`

---

## 2. Convention ที่ยึดตาม (สรุปย่อจาก Spec หลัก เพื่อให้เอกสารนี้อ่านจบในตัวเอง)

- **Header/Topbar:** Logo+Brand, Nav Menu (ผูกกับ MODULE_MAP ผ่าน `renderNavMenu('pnl-exec', ...)` / `renderNavMenu('pnl-breakdown', ...)`), Theme toggle — เหมือน MT/ECOM ทุกตัวอักษร ไม่มี User badge dropdown
- **Breadcrumb:** `P&L Overview` เดี่ยว ๆ **ไม่มี** "Sales Overview /" นำหน้า — เพราะ P&L เป็น Module คู่ขนานกับ Sales Overview (มุมมอง Company-wide เหมือนกัน แค่โฟกัสคนละตัวชี้วัด: ยอดขาย vs กำไร) ไม่ใช่ลูกของ Sales Overview แบบที่ MT/TT/ECOM เป็น
- **Tabs:** Executive Summary / Breakdown (2 แท็บ ต่อคนละไฟล์ ไม่ใช้ #hash)
- **Toolbar (ไม่มีข้อยกเว้น):** Chart card = 3 ปุ่ม (ดูตาราง/ดาวน์โหลด/ขยาย), Table card = 2 ปุ่ม (ดาวน์โหลด/ขยาย), KPI card = ไม่มี Toolbar
- **KPI Card Pattern:** Title+info icon → ค่าใหญ่+หน่วย → แถว MoM/YoY delta → Sparkline (ไม่มีการ์ด Growth แยกซ้ำ ตามหลักที่ยึดทั้งระบบ)
- **Mock data:** ต้องอ้างอิง `mulberry32(20260630)`, `MONTHS_TOTAL=36`, `TODAY=29` (index ปัจจุบัน) และ `channelDefs` ชุดเดิมแบบ **byte-for-byte** เพื่อให้ Net Sales ของ P&L ตรงกับ Sales Overview/MT/TT/ECOM 100% — P&L ไม่สร้างตัวเลข Net Sales ใหม่ มีแต่คำนวณ **ต้นทุน/กำไร** ต่อยอดจาก Net Sales เดิมเท่านั้น
- **Filter Bar:** Period selector ต้องมีทุกหน้า, ระดับ Category ใช้ Level Selector เดียวกับหน้าอื่น (Sub-Category/Type/Series ยัง Disabled รอเปิดใช้งานจริงตาม Task 3.4 ของ Review)

---

## 3. Data Model — สูตร Mock Data (ใหม่ทั้งหมดสำหรับ P&L)

### 3.1 Category Base Gross Margin % (สมมติฐานอิงอุตสาหกรรมความงาม)

| Category | Base Gross Margin % |
|---|---|
| Fragrance | 62% |
| Color Cosmetics | 58% |
| Skin Care | 54% |
| Hair Care | 46% |
| Personal Care | 42% |
| Accessories | 38% |

### 3.2 Channel Margin Adjustment Factor (คูณกับ Base ด้านบน)

| Channel | Factor | เหตุผล |
|---|---|---|
| MT | × 0.90 | ต้นทุน Trade Terms/Rebate/Slotting fee ที่ต้องจ่ายให้ Modern Trade Chain |
| TT | × 1.00 | Baseline — Traditional Trade เงื่อนไขมาตรฐาน ไม่มี Rebate ขนาดใหญ่ |
| Ecom | × 0.93 | ค่าธรรมเนียม Platform + ต้นทุนแฝงจาก Return/Cancellation Rate ที่สูงกว่า Channel อื่น |

**Effective Gross Margin %(channel, category)** = clamp(BaseMargin% × ChannelFactor, floor 20%, ceiling 75%)

**สำคัญ:** ต้อง copy ค่า Category Share ต่อ Channel (สัดส่วนยอดขายแต่ละ Category ภายใน MT/TT/ECOM) มาจากไฟล์ที่มีอยู่แล้วแบบ **byte-for-byte**:
- MT category shares → จาก `module_mt_executive_summary.html`
- TT category shares → จาก `tt_executive_summary.html`
- ECOM category shares (`ecomCategoryShares`) → จาก `module_ecom_executive_summary.html`

จากนั้นคำนวณ: `NetSales(channel,cat) = channelNetSales(channel) × categoryShare(channel,cat)` → `GrossProfit(channel,cat) = NetSales(channel,cat) × EffectiveMargin%(channel,cat)` → `COGS(channel,cat) = NetSales(channel,cat) − GrossProfit(channel,cat)`

### 3.3 OPEX Rates (% ของ Net Sales ต่อ Channel)

| OPEX Line | MT | TT | Ecom | หมายเหตุ |
|---|---|---|---|---|
| Trade Spend / Discount | 10% | 4% | 2% | หนักฝั่ง MT (Rebate/Co-op ads ให้ Chain ใหญ่) |
| Logistics & Fulfillment | 2% | 3% | 7% | หนักฝั่ง Ecom (Last-mile shipping/fulfillment) |
| Marketing & Ads Spend | 1.5% | 1% | 5% | หนักฝั่ง Ecom (Platform ads) — **ส่วนนี้คือสิ่งที่ตอบโจทย์ "Ads Spend ROI" ที่ตัดออกจาก ECOM Breakdown ไปก่อนหน้า** แต่ในระดับ Company/Channel เท่านั้น ยังไม่ลงถึงระดับ Platform รายตัว (Lazada/Shopee/TikTok) — ถ้าต้องการระดับนั้นจริง ให้พิจารณาแยกเป็น Module Trade Marketing/Ads ROI ต่างหากตาม Task 7.4 ของ Review
| SG&A Allocation | 8% | 8% | 8% | Overhead บริษัท จัดสรรตามสัดส่วน Net Sales เท่ากันทุก Channel (ไม่ผูกกับพฤติกรรม Channel) |

`NetProfit(channel) = GrossProfit(channel) − Σ OPEX lines(channel)`
`NetMargin%(channel) = NetProfit(channel) / NetSales(channel)`

### 3.4 Margin/Profit Target (สำหรับ KPI "Profit Target Attainment %")

กำหนด `PNL_TARGET_NET_MARGIN = 22%` (สมมติฐานแผนงานเดียว ใช้ทั่วบริษัท) → `TargetNetProfit(t) = targetNetSales(t) [ของเดิมจาก genSeries] × 22%` → `ProfitAttainment%(t) = ActualNetProfit(t) / TargetNetProfit(t)`

### 3.5 เทรนด์รายเดือน (สำหรับกราฟ Trend/Sparkline)

Margin % ไม่ได้มีแนวโน้มเติบโตแบบ Revenue จึงโมเดลเป็นค่าเฉลี่ยคงที่ (ตามสูตรด้านบน) **บวก Noise สุ่มเล็กน้อย** จาก `mulberry32(20260630)` ต่ออีก stream หนึ่ง (ไม่ปนกับ stream เดิมของ Revenue): `MonthlyGrossMargin%(t) = EffectiveMargin%(company) + noise(±1.5pp)`, เดียวกันสำหรับ Net Margin% — ใส่ **Seasonal spike** ของ Marketing & Ads Spend ในเดือน พ.ย./ธ.ค. (+2pp ของ OPEX rate เฉพาะเดือนนั้น) เพื่อความสมจริง (ช่วง 11.11/12.12 ของ Ecom)

---

## 4. หน้า 1 — P&L Executive Summary (`pnl_executive_summary.html`)

**Breadcrumb:** `P&L Overview` · **H1:** "P&L Overview — Executive Summary" · **Tabs:** Executive Summary (active) / Breakdown
**Filter Bar:** Period เท่านั้น · Scope note: "Company-wide, all channels"

### KPI Row (6 การ์ด)

| # | KPI | หน่วย | Delta | หมายเหตุ |
|---|---|---|---|---|
| 1 | Gross Profit | ฿ | MoM/YoY | Sparkline รายเดือน |
| 2 | Gross Margin % | % | pp (MoM/YoY) | |
| 3 | Net Profit | ฿ | MoM/YoY | |
| 4 | Net Margin % | % | pp | |
| 5 | Profit Target Attainment % | % | vs เดือนก่อน | Actual/Target Net Profit |
| 6 | OPEX Ratio % (OPEX/Net Sales) | % | pp | **Delta กลับทิศ** — ลดลง = ดี (เหมือนหลักการเดียวกับ KPI Return/Cancellation Rate ที่มีอยู่แล้วในระบบ) |

### กราฟ (เรียงตามหลัก Coarse-to-fine จาก Task 8 ของ Review)

1. **Profit Trend** — Line chart: Gross Profit, Net Profit (This Year) + เส้นประ Target Net Profit — Chart, 3 ปุ่ม
2. **Margin Trend** — Line chart: Gross Margin %, Net Margin % รายเดือน — Chart, 3 ปุ่ม
3. **P&L Waterfall** — Net Sales → COGS → Gross Profit → Trade Spend → Logistics → Marketing/Ads → SG&A → Net Profit (reuse `buildWaterfallSVG` เดิมจาก Growth Contribution Waterfall) — Chart, 3 ปุ่ม
4. **Margin by Channel** — Bar เทียบ Gross % และ Net % ของ MT/TT/Ecom (reuse `buildGroupedBarSVG`) — Chart, 3 ปุ่ม — **ปิด Gap CEO ที่เจอใน Review Task 5 โดยตรง**
5. **Margin by Category** — Bar เทียบ Gross % และ Net % ของ 6 Category (Company-wide blended) — Chart, 3 ปุ่ม
6. **Ranking — by Channel** — Table: Channel / Net Sales / Gross Margin % / Net Margin % / Net Profit / Profit Target Attainment % — Table, 2 ปุ่ม

---

## 5. หน้า 2 — P&L Breakdown (`pnl_breakdown.html`)

**Breadcrumb:** `P&L Overview` · **H1:** "P&L Overview — Breakdown" · **Tabs:** Breakdown (active)
**Filter Bar:** Period + **Channel** (All / MT / TT / Ecom) + Category (All; Sub-Category/Type/Series Disabled ตาม Convention) — ไม่มี Filter รายบุคคล (เหตุผลเดียวกับ ECOM: P&L เป็นมุมมอง Company/Channel-level ไม่มี Owner รายคนให้กรอง)

### Zone A — "Margin Quality by Channel"

- **A1. Gross vs Net Margin % by Channel** — Grouped bar (reuse `buildGroupedBarSVG`) — Chart, 3 ปุ่ม
- **A2. Net Margin % Trend by Channel** — Multi-line 3 เส้น (MT/TT/Ecom) — Chart, 3 ปุ่ม
- **A3. Cost Structure by Channel (% of Net Sales)** — Stacked 100% bar: COGS/Trade Spend/Logistics/Marketing/SG&A/Net Profit เป็น segment (reuse `buildStacked100BarSVG`) — Chart, 3 ปุ่ม

### Zone B — "Category Profitability"

- KPI เล็ก 2 การ์ด (ไม่มี Toolbar เหมือน Product Analysis Zone A): "Highest Margin Category" / "Lowest Margin Category"
- **B1. Margin by Category** — Gross %/Net % **ต้องตอบสนอง Channel filter ด้านบน** (ถ้าเลือก Channel เฉพาะ ให้โชว์ margin ของ Category ภายใน Channel นั้น ไม่ใช่ Blended เสมอ) — ทำแบบนี้เพื่อ**เลี่ยงปัญหาซ้ำซ้อนกับกราฟเดียวกันใน Executive Summary** ตามที่พบใน Review Task 1.1 — Chart, 3 ปุ่ม
- **B2. Category Profit Matrix** — Scatter: X = Net Profit Contribution (฿), Y = Net Margin % — Quadrant labels: "Premium Stars" (Margin สูง+Profit สูง) / "Volume Engines" (Margin ต่ำ+Profit สูงจากปริมาณ) / "Niche Premium" (Margin สูง+Profit รวมน้อย) / "Needs Review" (ต่ำทั้งคู่) — **ต้องแก้ปัญหา Label ชนกันตามที่ระบุใน Review Task 2.1 ตั้งแต่ตอน Build ครั้งแรก ไม่ใช่ปล่อยให้เกิดซ้ำ** — Chart, 3 ปุ่ม
- **B3. Category Profitability Ranking** — Table ครบทั้ง 6 Category เรียงตาม Net Margin % (ไม่ต้องแบ่ง Top5/Bottom5 เพราะมีแค่ 6 แถว แบ่งแล้วจะซ้ำเกือบหมด): Category / Net Sales / Gross Margin % / Net Margin % / Net Profit — Table, 2 ปุ่ม

### Zone C — "Cost Structure Over Time"

- **C1. OPEX Trend** — Stacked area: Trade Spend / Logistics / Marketing&Ads / SG&A รายเดือน Company-wide (reuse `buildStackedAreaSVG`) — Chart, 3 ปุ่ม
- **C2. Marketing & Ads Spend by Channel** — Bar (฿ หรือ % of Net Sales) — Chart, 3 ปุ่ม — หมายเหตุซ้ำ: นี่คือระดับ Company/Channel เท่านั้น ไม่ใช่ระดับ Platform ของ ECOM

---

## 6. Cross-reference กับเอกสารอื่น

- ปิด Gap: Review Task 5 (คำถาม CEO ข้อ "กำไร/Margin") และ Task 6.1 (ข้อเสนอเพิ่ม Margin/Gross Profit % by Channel) → **ปิดครบ**
- ปิด Task 7.3 (Profitability/Margin Module) → **ปิดครบ เป็น Module นี้เลย** ไม่ต้องทำแยกอีก
- ปิด Task 7.4 (Trade Marketing/Ads ROI Module) → **ปิดบางส่วน** (ระดับ Company/Channel) — ถ้าต้องการระดับ Platform-specific ของ ECOM ยังต้องพิจารณา Module แยกอยู่
- ใช้บทเรียนจาก Task 2.1 (Label ชนกันใน Scatter chart) และ Task 1.1 (กราฟซ้ำระหว่างหน้า) เป็น Design constraint ตั้งแต่ต้น ไม่ใช่ตามแก้ทีหลัง

---

## 7. ข้อสมมติฐาน/ข้อจำกัด (สำคัญ ต้องบอกผู้ชมตอน Demo)

- ตัวเลขต้นทุน/กำไรทั้งหมดเป็น **สมมติฐาน Mock ล้วน ๆ** (Category margin %, Channel factor, OPEX rate) ไม่ใช่ข้อมูลบัญชีจริง ไม่มีระบบ COGS/Ledger จริงรองรับ
- Margin model เป็นสูตรคูณอย่างง่าย (Category base × Channel factor) ไม่ใช่การคำนวณต้นทุนสินค้าจริงแบบ FIFO/Standard Cost
- SG&A ใช้อัตราคงที่ 8% ทุก Channel เพื่อความง่าย ไม่ได้สะท้อน Overhead allocation จริงที่ซับซ้อนกว่านี้

## 8. Build Checklist (ตอนลงมือสร้างจริง)

1. เขียน `pnl_executive_summary.html` และ `pnl_breakdown.html` แยกไฟล์ ตาม Layout ข้อ 4-5
2. Copy Category share ต่อ Channel จาก 3 ไฟล์ต้นทาง แบบ byte-for-byte (ข้อ 3.2)
3. ใส่ Label-collision fix ใน `buildScatterSVG` (shared.js) **ก่อน** ใช้กับ Category Profit Matrix — อย่าปล่อยให้เกิดปัญหาเดิมซ้ำ
4. ตรวจ Toolbar ปุ่มครบทุกใบตามกติกา 3/2 ปุ่ม (Grep ID ทุกตัวเหมือนตอน Build ECOM)
5. แก้ `nav-menu.js` เพิ่ม Group `P&L Overview` เป็นตัวแรก
6. **ไม่แตะ** Hero CTA ของ `index.html`
7. Cross-check Net Sales รวมทุก Channel ใน P&L ต้องเท่ากับผลรวม MT+TT+ECOM ใน Sales Overview เป๊ะ (เพราะ P&L ไม่สร้าง Net Sales ใหม่ ใช้ของเดิมทั้งหมด)

---

*จบเอกสาร Spec — เมื่อ Build เสร็จ ให้ย้ายสรุปมาไว้ใน `Charmiss_Dashboard_Spec.md` เป็น section ใหม่ (เช่น 5.6 P&L Overview) แบบเดียวกับที่ทำตอนปิด ECOM*
