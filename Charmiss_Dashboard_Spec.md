# Charmiss Enterprise Dashboard — Business Overview
## Requirements & System Design Specification

**อัปเดตล่าสุด:** 17 สิงหาคม 2569

---

## 1. Business Overview

### 1.1 วัตถุประสงค์
Enterprise Dashboard สำหรับ Charmiss เพื่อติดตาม **Sales Performance เทียบกับ Target** ครอบคลุม 3 Channel หลัก — MT (Modern Trade), TT (Traditional Trade), Ecom (Lazada / Shopee / TikTok / Line Shop)

ระบบตอบโจทย์ 2 มุมมองพร้อมกัน:
1. **มุมมองบริษัท (Company-wide)** — ผู้บริหารดูภาพรวมยอดขายเทียบเป้าทั้งบริษัท, เปรียบเทียบ Performance ระหว่าง Channel, วิเคราะห์ Product ข้าม Channel, และเข้าใจว่าอะไรกำลัง "Drive" การเติบโต
2. **มุมมองเฉพาะ Channel** — แต่ละ Channel มี Dashboard เจาะลึกของตัวเอง (Executive Summary + Breakdown) และ TT มีมุมมองรายบุคคล (Sales Person) เพิ่มอีกชั้น

### 1.2 กลุ่มผู้ใช้งาน
| กลุ่มผู้ใช้ | ใช้มุมมองไหน |
|---|---|
| ผู้บริหารระดับสูง (VP of Sales) | Sales Overview → Executive Outlook, Product Analysis |
| Sales Ops / Regional Manager / Trade Marketing | Breakdown ของแต่ละ Channel Overview (MT/TT/Ecom) |
| Sales Rep รายบุคคล (TT) | Sales Person |

---

## 2. โครงสร้างระบบ (System Structure / Navigation Hierarchy)

### 2.1 แผนผังโครงสร้าง

```
▸ Financial Statement                                [Company-wide, คู่ขนานกับ Sales Overview — ไม่ใช่ลูกของมัน]
      ├── Financial Analysis   (Financial Scorecard / Financial Ratios / Cash Conversion Cycle)
      ├── P&L                  (Income Statement / Performance / Expense Breakdown)
      ├── Cash Flow            (Cash Flow Statement / Free Cash Flow)
      ├── Balance Sheet        (chart-first: Asset + Liabilities & Equity Breakdown, multi-period)
      └── Equity Changes       (Statement of Changes in Equity / Equity & RE Trend / Dividend & Payout)

Sales Overview  (Company-wide — รวมทุก Channel)
│
├── Executive Outlook          ภาพรวมบริษัทครบทุกมุม อ่านจบใน 2-3 นาที
│     ├── At a Glance            (KPI สรุปด่วน)
│     ├── Performance & Composition
│     ├── Channel Comparison
│     └── What's Driving It
│
└── Product Analysis           วิเคราะห์ Product/Category ข้าม 3 Channel
      ├── Performance Overview
      └── Cross-Channel Analysis

├── ▸ MT Overview
│     ├── Executive Summary
│     └── Breakdown (ข้อมูลคู่ค้า/Key Account)
│
├── ▸ TT Overview                                    [แยกเป็น 3 ไฟล์อิสระ — ดูหมายเหตุท้ายหัวข้อ]
│     ├── Executive Summary
│     ├── Breakdown (ข้อมูลร้านค้า)
│     └── Sales Person (มุมมองรายบุคคล)
│
└── ▸ ECOM Overview
      ├── Executive Summary
      └── Breakdown (ข้อมูล Ecom Shop)
```

> หมายเหตุ: "Executive Outlook" และ "Breakdown" เดิมของ Sales Overview ถูกรวมเป็นหน้าเดียวแล้ว (Executive Outlook มี 4 Section ครอบคลุมทั้งภาพรวมและรายละเอียดเปรียบเทียบ Channel) — Sales Overview จึงมีแค่ 2 มุมมองหลัก: Executive Outlook และ Product Analysis

> หมายเหตุเรื่องลำดับ: Financial Statement ถูกจัดให้ปรากฏ **ก่อน** Sales Overview ทั้งใน Nav Menu และหน้า Directory ของ `index.html` (ตามลำดับ `MODULE_MAP` ใน `nav-menu.js`) แต่ปุ่ม Hero CTA ของ `index.html` ("เข้าสู่ Sales Overview →") ยังคงพาไป Sales Overview เหมือนเดิมโดยไม่แตะ — ลำดับการแสดงผลกับ Entry point หลักเป็นคนละเรื่องกันโดยตั้งใจ

> หมายเหตุด้านไฟล์: Financial Statement, MT Overview, ECOM Overview และ Sales Overview ทั้ง 2 มุมมอง ใช้ Component กลาง (`shared.css`/`shared.js`) ร่วมกัน แยกไฟล์ตาม 1 แท็บ = 1 ไฟล์ — Financial Statement มี 5 แท็บ/ไฟล์: `pnl_financial_analysis.html`, `pnl_executive_summary.html` (แท็บ "P&L" — ชื่อไฟล์เดิมจากยุคที่ Module นี้ชื่อ "P&L Overview" ยังไม่เปลี่ยนตาม เพราะเป็นแค่ Internal Identifier ไม่กระทบ UI ที่ผู้ใช้เห็น), `pnl_cash_flow.html`, `pnl_balance_sheet.html`, `pnl_equity_changes.html` — ไม่มีไฟล์ `pnl_quarterly_trend.html`/`pnl_breakdown.html`/`pnl_cost_structure.html` อีกต่อไป (ถูกรวมเข้า `pnl_executive_summary.html` เป็น 3 Pill เดียวในการปรับโครงสร้างรอบ "Financial Statement restructure" — ดู §5.6) — อีก 3 กลุ่ม (`module_mt_executive_summary.html`, `module_mt_breakdown.html`, `module_ecom_executive_summary.html`, `module_ecom_breakdown.html`, `sales_overview.html`, `sales_overview_product_analysis.html`) เหมือนเดิม — TT Overview แยกเป็น 3 ไฟล์อิสระ (`tt_executive_summary.html`, `tt_breakdown.html`, `tt_sales_person.html`) ใช้ Engine กลางของตัวเอง (`tt-shared.css`/`tt-shared.js`, แยกจาก `shared.css`/`shared.js` เพราะชื่อ Class ชนกัน) — `render()` ใน `tt-shared.js` คำนวณข้อมูลของ Executive Summary และ Breakdown พร้อมกันในรอบเดียวโดยตั้งใจ (ไม่แยก Mock Data ซ้ำสองชุด) ทั้ง 2 ไฟล์จึงเรียกฟังก์ชันเดียวกัน — ECOM Overview สร้างตาม Pattern เดียวกับ MT (แยก 2 ไฟล์อิสระ ไม่มี Tab เดียวรวม #hash) เพราะมีโครงสร้างใกล้เคียง MT มากที่สุด (มีหน่วยขายย่อยหลายหน่วย คือ Platform Lazada/Shopee/TikTok/Line Shop และไม่มี Region/Sales Person filter)

### 2.2 หลักการ Navigation

- **Navigation Menu** อยู่ที่มุมซ้ายบนของทุกหน้า (ข้าง Logo) กดแล้วเห็นรายการทุกหน้าในระบบ จัดกลุ่มตาม Module (Badge "Coming soon" สำหรับ Module ที่ยังไม่เปิดใช้งาน — ปัจจุบันทุก Module เปิดใช้งานครบแล้ว ไม่มี Module ค้าง) — กดข้าม Section ไหนก็ได้ในคลิกเดียว ไม่ต้องไล่ตามลำดับ Drill-in ทีละชั้น (เช่น จาก Sales Overview ไป TT Overview → Breakdown ได้ทันที)
- **Breadcrumb** "Sales Overview / [Module]" แสดงเฉพาะหน้า Channel Overview (MT/TT/Ecom) เพราะเป็นหน้าที่ Nested อยู่ใต้ Sales Overview — Sales Overview เองไม่มี Breadcrumb เพราะเป็นจุดบนสุดของ Hierarchy — Financial Statement ก็ไม่มี Breadcrumb เช่นกัน (แค่ Module Dropdown "Financial Statement ▾" เดี่ยวๆ) เพราะเป็นมุมมอง Company-wide คู่ขนานกับ Sales Overview ไม่ใช่ลูกของมัน
- **หัวข้อหน้า (H1)** ใช้รูปแบบเดียวกันทุกหน้า: "[ชื่อ Module] — [ชื่อมุมมอง]" เช่น "Sales Overview — Executive Outlook", "TT Overview — Breakdown", "ECOM Overview — Executive Summary"
- แต่ละ Channel Overview มี Tab ของตัวเอง (Executive Summary / Breakdown / Sales Person เฉพาะ TT) โดย Filter เต็มรูปแบบอยู่ที่ Breakdown เท่านั้น (รายละเอียด Filter ต่าง Channel ไม่เหมือนกัน — ดูข้อ 3.4) — Executive Summary มีแค่ Period filter

---

## 3. หลักการออกแบบ (Design Principles)

### 3.1 แนวทางภาพรวม
- Formal / Corporate — ไม่ใช้ Emoji ไม่ใช้สีฉูดฉาด
- Layout แบบ Card-based บน Background สีอ่อน, การ์ดพื้นขาว เงาบางๆ
- รองรับ Dark Mode ทุกหน้า, Responsive รองรับทั้ง Web และ Mobile
- ไฟล์ทุกหน้าต้องเปิดใช้งานได้เองโดยไม่พึ่งพาอินเทอร์เน็ตหรือบริการภายนอกใดๆ (วาดกราฟด้วย SVG ในไฟล์เอง ไม่ใช้ Library ภายนอก)

### 3.2 โทนสี (Color Tokens)

| การใช้งาน | สี |
|---|---|
| Primary Accent (Logo, Active Tab, Primary Button, กราฟหลัก) | Wine / Berry tone |
| Background | Off-white / Cream |
| Card Background | White |
| Text หลัก / รอง | เกือบดำ / เทาอุ่น |
| Positive Delta / Hit Target | เขียว |
| Negative Delta / Below Target | แดง |
| Warning / ใกล้ Target | ส้ม/เหลือง |
| Channel: MT / TT / Ecom | Wine (เข้ม) / Teal / ทอง — ใช้แยกจาก Primary Accent อย่างสม่ำเสมอทุกกราฟที่เทียบ Channel |
| Category (Product Analysis) | Palette เฉพาะ 6 สี (Blue/Green/Purple/Terracotta/Mustard/Slate) แยกชัดจากสี Channel เพื่อไม่ให้สับสนระหว่างมุมมอง "ตาม Channel" กับ "ตาม Category" |

> Wine/Berry เป็นสีตั้งต้น (Placeholder) รอสี Brand จริงของ Charmiss — เปลี่ยนแค่ค่าเดียวนี้ ระบบสีที่เหลือไม่กระทบ

### 3.3 Typography
Font ที่ดูเป็นทางการ รองรับภาษาไทย ตัวเลขเดี่ยว (KPI Headline) ใช้ Proportional numbers ตามปกติ — ใช้ Tabular numbers เฉพาะใน Table ที่ต้องจัดคอลัมน์ตัวเลขให้ตรงกันจริงๆ เท่านั้น (ใช้ผิดที่จะทำให้ตัวเลขดูยืดผิดปกติ)

### 3.4 Component Pattern มาตรฐาน

**KPI Card:** Title + Information Icon → ตัวเลขใหญ่ + หน่วย/ช่วงเวลา → แถว MoM/YoY (สีเขียว/แดง) → Sparkline แนวโน้ม
- บางการ์ดอาจมีบรรทัดเสริมใต้ Sparkline (เช่น "Gap to Target" ใต้ Target Attainment) แทนการแยกเป็นการ์ดเดี่ยว หากเนื้อหาสัมพันธ์กันโดยตรงและไม่อยากให้ KPI Row ยาวเกินจำเป็น — หลักการนี้ใช้กับทุก Channel Executive Summary เหมือนกัน: ไม่มีการ์ด Growth YoY/Growth MoM แยกต่างหาก เพราะซ้ำกับแถว MoM/YoY ที่มีอยู่แล้วในการ์ด Net Sales/Target Attainment (MT, TT, Ecom ทั้ง 3 Channel ยึดหลักนี้เหมือนกัน)

**Chart Card:** Title + Information Icon → Subtitle บอกขอบเขตข้อมูล → Toolbar (ดูเป็นตาราง / ดาวน์โหลด / ขยายเต็มจอ) → ตัวกราฟ — **ทุก Chart Card ที่มีข้อมูลเชิงตาราง (ไม่ใช่แค่ Heatmap ที่เป็นตารางอยู่แล้ว) ต้องมีปุ่ม "ดูเป็นตาราง" ควบคู่ Download และ Expand เสมอ** เพื่อความสม่ำเสมอทั้งระบบ — Table Card (ตารางล้วน เช่น Ranking, Top/Bottom 5) มีแค่ 2 ปุ่ม (ดาวน์โหลด/ขยายเต็มจอ) ไม่มีข้อยกเว้น

**Information Icon (ⓘ):** ทุก KPI Card และ Chart Card ต้องมี กดแล้วแสดง Popover อธิบายวิธีคำนวณของ Metric นั้นเป็นภาษาที่คนอ่านทั่วไปเข้าใจได้

**Insight Caption (`.callout-text` ใต้กราฟ):** เมื่อ Chart Card ต้องการสรุปใจความสำคัญเป็นประโยคสั้นๆ (ไม่ใช่แค่ตัวเลขบนกราฟ) ให้ใส่เป็น `.callout-text` **ใต้กราฟเสมอ** (หลัง Canvas, ก่อน Data Table Wrap) ไม่ใช่เหนือกราฟ ใช้สี Semantic (เขียว/แดงตามเครื่องหมาย Delta) แทนตัวหนังสือสีเดียวทั้งหมด

**Grouped Bar Chart (`buildGroupedBarSVG`):** ต้องมีช่องว่างที่มองเห็นชัดระหว่างแต่ละกลุ่ม ควบคุมด้วย `opts.groupGap` (ไม่ใช่แค่ระยะห่างเท่ากับระหว่างแท่งในกลุ่มเดียวกัน ไม่งั้นกลุ่มติดกันจนดูเป็นแท่งเดียวยาว) รองรับ Data Label หลายบรรทัดต่อแท่ง แต่ละบรรทัดกำหนดสีเองได้ตามความหมาย (เช่น เขียว/แดงตาม Growth หรือ Attainment) เรียงบรรทัดแบบ "ค่าหลักก่อน (ใกล้ยอดแท่ง), Delta/รายละเอียดรองตามหลัง (ใกล้ตัวแท่ง)" ให้ตรงกับลำดับความสำคัญแบบเดียวกับ KPI Card (ตัวเลขใหญ่ก่อน ตามด้วย Badge เล็ก) — **ต้อง Responsive ตามความกว้างจริงของแท่ง**: แท่งแคบลงเมื่อไร Label ต้องลดความหนาแน่นตาม (ตัด Label รอง → เหลือ Label เดียว → ลดขนาดตัวอักษร → ซ่อน Label ทั้งหมดถ้าแคบเกินจะอ่านได้) ไม่ปล่อยให้ตัวอักษรทับกันข้ามแท่ง — รายละเอียดตัวเลขเต็มยังดูได้ผ่านปุ่ม "ดูเป็นตาราง" เสมอ

**Chart Container Sizing (`buildLineChartSVG`/`buildGroupedBarSVG`/`buildWaterfallSVG`/`buildStacked100BarSVG`/`buildScatterSVG`/`buildParetoSVG`):** ทุกฟังก์ชันต้องวัดทั้งความกว้างและความสูงจริงของ Container (`clientWidth`/`clientHeight`) มาใช้เป็น SVG viewBox เสมอ ไม่ใช้ค่า Default ตายตัว — ถ้าค่าที่วัดได้กับ CSS Height ของ `.canvas-wrap` ไม่ตรงกัน จะเกิด Bug ตัวอักษร/แท่งกราฟ "ยืด" ผิดสัดส่วน (เพราะ `preserveAspectRatio="none"` ยืด X/Y อิสระจากกัน) เป็นกฎที่ต้องคุมทุกครั้งที่ปรับความสูง Canvas ของการ์ดไหนก็ตาม

**Axis Ticks (`buildLineChartSVG`/`buildGroupedBarSVG`/`buildWaterfallSVG`/`buildScatterSVG`):** ทุกฟังก์ชันต้องใช้ `niceAxisTicks()` สร้างเลขแกนแบบกลม (เช่น ฿10M/฿20M, +10%/+20%) แทนการหาร Min-Max ดิบเป็นเสี้ยวเท่าๆ กัน ซึ่งจะได้เลขแปลกๆ ที่อ่านไม่คุ้นตา — `buildScatterSVG` ใช้ทั้งแกน X และ Y (ต่างจากฟังก์ชันอื่นที่ใช้แค่แกน Y) เส้นแบ่ง Quadrant ที่ค่ามัธยฐานยังคำนวณจากข้อมูลดิบเหมือนเดิม ไม่ผูกกับเลขแกนที่ปัดกลมแล้ว

**Chart Label Edge Clipping:** Label ที่วางด้วย `text-anchor="middle"` ที่ตำแหน่งขอบสุดของกราฟ (จุดแรก/จุดสุดท้าย) มีโอกาสโดนตัดขอบเพราะ Padding ซ้าย-ขวาไม่พอรองรับความกว้างข้อความที่จัดกึ่งกลาง — จุดขอบสองข้างควรใช้ `text-anchor="start"` (ซ้ายสุด) และ `"end"` (ขวาสุด) แทน `"middle"` เพื่อให้ข้อความโตเข้าด้านในกราฟเสมอ (`buildStackedAreaSVG` แก้ไปแล้ว จุดอื่นที่มี Pattern เดียวกันควรเช็คด้วย)

**Header/Topbar (มุมขวาบนทุกหน้า):** Logo + Brand + Navigation Menu (ซ้าย) ↔ ชื่อ User + Role (Text ธรรมดา ชิดขวา) + Avatar วงกลม (พื้นหลัง Wine tone อ่อน `--brand-wash`, ตัวอักษร Wine เข้ม `--brand` — ไม่ใช่พื้นทึบตัวอักษรขาว) + ปุ่มสลับ Dark Mode (วงกลมเส้นขอบ) (ขวา) — เป็น Text/Icon แสดงผลอย่างเดียวทุกหน้า **ไม่มีปุ่มกดเปิด Dropdown** ทุก Channel รวม TT และ ECOM ใช้ Pattern เดียวกันเป๊ะ (สี Avatar และทรงปุ่ม Dark Mode ตรงกันทุกหน้า)

**Filter Bar:**
- Period selector ทุกหน้า: This Month / Last Month / This Quarter / Last Quarter / Year to Date (default) / Trailing 12 Months / Custom Range
- หน้า Breakdown (เฉพาะ Channel Overview) มี Filter เพิ่มตามบริบท: Region/Category/Sales Person (TT), Category/Key Account Manager (MT) — ECOM Breakdown มีแค่ Period + Category (Category ปัจจุบันใช้งานได้แค่ "All Categories" เหมือน MT/TT)
- หน้า Executive Summary / Executive Outlook / Product Analysis มีแค่ Period อย่างเดียว (ไม่มี Filter ย่อย)
- Shortcut "ดูของฉันอย่างเดียว" ไม่บังคับมีทุก Channel และไม่ใช่ Component ใช้ร่วมกัน — แต่ละ Channel ทำเอง เพราะความหมาย "ของฉัน" ไม่เหมือนกัน: MT มี "My accounts only" (Scope ตาม Key Account Manager ที่เลือก, ใช้งานได้จริง) — TT **ไม่มี** "My stores only" (TT เป็น 3 ไฟล์อิสระ ไม่มี JS Memory ข้ามหน้าให้ผูก Scope ได้ ต้องทำผ่าน URL Parameter ถ้าต้องการในอนาคต) — ECOM Overview **ไม่มี** Filter รายบุคคลเลย (ไม่มี Platform Owner selector หรือ "My platforms only") เพราะ Ecom ไม่มีแนวคิด Owner ต่อ Platform ที่ชัดเจนพอจะทำ Scope แบบเดียวกับ KAM/Sales Rep — Filter Bar ของ ECOM Breakdown จึงเหลือแค่ Period + Category และทุก Zone เป็น Company-wide Ecom เสมอ

**หลักการ Hierarchy Level Selector (Category → Sub-Category → Type → Series):**
- ถ้าหน้าใดมีหลาย Component ที่ต้องมองข้อมูลที่ระดับเดียวกัน (เช่น Product Analysis: Heatmap, Category Growth by Channel, Share of Sales Over Time, Sales by Category) ให้ใช้ **Level Selector ตัวเดียวตัวเดียวที่จุดเดียว** ควบคุมทุก Component พร้อมกัน — **ห้ามมี Selector แยกในแต่ละการ์ด** เพื่อไม่ให้ข้อมูลระหว่างการ์ดไม่ตรงกัน
- แสดงผลแบบ **"Top View" จัดอันดับแบบ Flat** — เมื่อเลือก Sub-Category จะเห็น Sub-Category ที่ขายดีที่สุด **ของทั้งหมดทุก Category รวมกัน** จัดอันดับตามยอดขาย (ไม่ใช่ Breadcrumb Drill ทีละชั้น) — ชื่อ Category แม่แสดงเป็นตัวอักษรเล็กสีจางกำกับไว้ใต้ชื่อเพื่อบอก Context
- ระดับที่ลึกกว่า Category (Sub-Category/Type/Series มี 12/24/48 รายการ) ให้ตัดแสดงเฉพาะ Top N ตามความเหมาะสมของ Component นั้น (List/Table แสดงได้มากกว่า เช่น Top 10, ส่วน Chart ที่มีข้อจำกัดเรื่องความหนาแน่น เช่น Scatter/Stacked Area/Grouped Bar ควรจำกัดที่ Top 6-8) พร้อมลิงก์ "See all N →" ไปดูรายการเต็ม — ECOM Breakdown's "Top/Bottom SKU" อ้างอิงระดับ Series นี้เช่นกัน (ดูข้อ 5.5)

**หลักการ Diverging Bar Chart (ใช้ Baseline ที่ไม่ใช่ 0):** เมื่อกราฟ Bar ต้องเทียบกับค่าอ้างอิงที่ไม่ใช่ 0 (เช่น Index = 100) แท่งต้องยื่นขึ้น/ลงจาก**ค่าอ้างอิงนั้นโดยตรง** ไม่ใช่ยื่นจาก 0 เสมอ (ไม่งั้นกราฟจะดูเป็นแท่งสูงเท่ากันหมดกระจุกอยู่บนสุด ไม่สื่อความหมาย Over/Under ที่ต้องการ) และ Y-axis Domain ต้องคำนวณล้อมรอบค่าอ้างอิงนั้น ไม่ใช่บังคับรวม 0 เข้าไปเสมอ

**สถาปัตยกรรมไฟล์ต่อมุมมอง:** แต่ละมุมมอง (Executive Summary / Breakdown / Sales Person ฯลฯ) แยกเป็นคนละไฟล์ตั้งแต่เริ่มสร้าง ไม่รวมหลาย Tab ไว้ในไฟล์เดียวแล้วสลับด้วย JS + URL `#hash` (ไฟล์เดียวรวม Tab จะบวมและแก้ไขยาก) — Component คำนวณข้อมูล (Mock Data Generation, Aggregation, Chart-rendering) ที่ใช้ร่วมกันหลายมุมมอง แยกเป็นไฟล์ Engine กลาง (เช่น `shared.js`) ให้แต่ละไฟล์หน้าเรียกใช้แทนการเขียนซ้ำ — ปัจจุบันไม่มีมุมมองไหนใช้ Pattern `#hash` ในไฟล์เดียว (`initHashTabs` ใน `nav-menu.js` เหลือไว้เผื่อมุมมองใหม่ในอนาคตเท่านั้น)

---

## 4. Data Structure (โครงสร้างข้อมูลเชิงธุรกิจ)

### 4.1 Channel Hierarchy
```
Charmiss Total Sales
├── MT (Modern Trade)      → Partner / Key Account
├── TT (Traditional Trade) → Store, Sales Rep
└── Ecom (E-commerce)      → Lazada, Shopee, TikTok, Line Shop
```

### 4.2 Category Hierarchy (4 ชั้น — ใช้ร่วมกันทุก Module)

| Category | Sub-Category | Type (ตัวอย่าง) |
|---|---|---|
| Skin Care | Facial Care | Cleanser, Moisturizer |
| Skin Care | Body Care | Lotion, Sunscreen |
| Color Cosmetics | Face Makeup | Foundation, Powder |
| Color Cosmetics | Eye & Lip | Lipstick, Eyeliner |
| Hair Care | Cleansing | Shampoo, Conditioner |
| Hair Care | Styling | Serum, Spray |
| Personal Care | Oral Care | Toothpaste, Mouthwash |
| Personal Care | Bath | Soap, Shower Gel |
| Fragrance | Personal Fragrance | Eau de Toilette, Body Mist |
| Fragrance | Home Fragrance | Diffuser, Spray |
| Accessories | Application Tools | Brush, Sponge |
| Accessories | Storage | Pouch, Organizer |

แต่ละ Type แตกเป็น Series อีก 1 ชั้น (รวม Category → Sub-Category → Type → Series ทั้งหมด 4 ชั้น, 6 → 12 → 24 → 48 รายการ) — ECOM Overview's "Top/Bottom SKU" (ข้อ 5.5) ใช้ระดับ Series นี้เป็น Mock Data (ระบุด้วยรหัส เช่น SKU-014 แทนชื่อ Product จริง เพราะยังไม่มีไฟล์ Product Analysis ระดับ Series จริงให้ดึงมาอ้างอิงในการสร้างรอบนี้)

### 4.3 Channel-specific Metric Mapping

| แนวคิด | MT / TT | Ecom |
|---|---|---|
| หน่วยขาย | Store / Partner | Order / Shop (Platform) |
| ลูกหนี้ | AR% (Accounts Receivable) | ไม่มี (จ่ายผ่าน Platform) |
| การคืนสินค้า | Return Rate (Credit Note) | Return/Cancellation Rate |
| ความครอบคลุม | Active Stores/Partners, Retention | ไม่มี (Ecom ไม่มี Metric มุม Coverage ในโมเดลนี้ — Charmiss มี 1 Shop ต่อ Platform เท่านั้น ไม่มีแนวคิด "หลาย Shop ต่อ Platform" ที่จะวัด Coverage ได้) |
| ทีมงาน | Sales Rep, Visit Compliance (TT) / Key Account Manager (MT) | Platform Owner (แนวคิดเท่านั้น — ไม่มี Filter จริงในระบบ ดูข้อ 3.4) |
| ราคาเฉลี่ย | — | Average Order Value (AOV) |

---

## 5. Metrics / KPI ต่อหน้า

### 5.1 Sales Overview → Executive Outlook

หน้านี้มี 4 Section เรียงตามลำดับที่ใช้จริง (และตาม Section Nav shortcut บนสุดของหน้า): At a Glance → Performance & Composition → Channel Comparison → What's Driving It

**Section 1 — At a Glance (KPI):**

| Metric | รายละเอียด/สูตร |
|---|---|
| Total Net Sales | ผลรวมยอดขายสุทธิ ทุก Channel ในช่วงเวลาที่เลือก + MoM/YoY + Sparkline + **Top Channel Caption** (Channel ที่สัดส่วนยอดขายสูงสุด + % ของยอดรวม) |
| Target Attainment % | (ยอดขายจริง ÷ เป้าหมาย) × 100 + MoM/YoY (pp) + Sparkline + **Gap to Target** (Actual YTD − Target YTD, Calendar YTD เสมอ ไม่ผูก Filter ด้านบน, สีเขียว/แดงตามเครื่องหมาย) |
| Full Year Forecast | Run-rate: (ยอดขาย YTD ÷ จำนวนเดือนที่ผ่านมา) × 12 ÷ เป้าหมายทั้งปี × 100 (Calendar YTD เสมอ) + Sparkline แบบ Trajectory (เส้นทึบ = Actual ที่ผ่านมา, เส้นประ = ยื่นไปถึง Dec ตามค่าพยากรณ์) + **Projected Gap Caption** (± มูลค่า, Full Year Actual vs Target) |

Header มี `.section-note` อธิบายสั้นๆ ว่า MoM/YoY เทียบอะไรกับอะไร (ใช้ทั่วทั้งหน้า ไม่ต้องอธิบายซ้ำทุกการ์ด)

**Section 2 — Performance & Composition:**

| Metric/Chart | ประเภท |
|---|---|
| Revenue Trend | Line Chart เต็มความกว้าง (This Year vs Last Year vs Target, by month) |
| Sales by Channel | Donut (ครึ่งซ้าย) — มี % Label บนกราฟโดยตรง — ไม่มี Badge "Best"/"Watch" ที่ Legend และไม่มีคอลัมน์ "Status" ในตาราง |
| Sales by Category | Horizontal Bar (ครึ่งขวา, รองรับ Sub-Category/Type/Series ตามหลักการ Level Selector ข้อ 3.4) |

**Section 3 — Channel Comparison:**

| Metric/Chart | ประเภท/สูตร |
|---|---|
| Channel Snapshot Cards ×3 | Net Sales + Attainment + Growth YoY แบบสรุปสั้น พร้อมคลิกเข้า Channel Overview นั้นได้ (TT, MT, Ecom พร้อมใช้งานทั้งหมด) — ทำหน้าที่เป็นทางเข้า (Navigation) สู่หน้า Channel Overview เป็นหลัก จึงยังคงไว้แม้เนื้อหาจะคาบเกี่ยวกับกราฟ Net Sales ด้านล่างบ้าง |
| Net Sales vs Target by Channel | 1 แท่งต่อ Channel (MT/TT/Ecom, สี Channel) แสดง Net Sales ปีนี้เท่านั้น — Target แสดงเป็น Tick Mark บนแท่ง (เขียว = Hit/แดง = Miss เทียบ Target เดือนนั้น) แทนแท่งแยก, Data Label = Net Sales ฿ + Attainment % (สีตาม Hit/Miss), Last Year/Growth YoY/Gap to Target อยู่ใน Hover Tooltip ต่อแท่ง — หน้าที่ของกราฟนี้คือ "เข้าเป้าไหมต่อ Channel" เท่านั้น (มุม "โตจากปีก่อนกี่ %" ตอบโดย Revenue Trend + Channel Growth Comparison (YoY) อยู่แล้ว) — Insight Caption ใต้กราฟสรุป Hit/Miss รวม (เช่น "All 3 channels above target (Year to Date) — MT +฿582.1K · TT +฿687K · Ecom +฿330.6K") — ปุ่ม "ดูเป็นตาราง" แสดงตัวเลขละเอียดครบ 6 คอลัมน์ (Last Year, This Year, Growth YoY, Target, Attainment %, Diff from Target) |
| Revenue Trend by Channel | Line Chart ทับกัน 3 Channel + Checkbox เลือกเปิด/ปิด Channel (ครึ่งซ้ายของ Chart Grid) |
| Channel Growth Comparison (YoY) | Line Chart 3 เส้น (MT/TT/Ecom, ครึ่งขวาของ Chart Grid เดียวกับ Revenue Trend by Channel) แสดงเฉพาะเดือนที่มีข้อมูลจริง (ไม่โชว์เดือนอนาคตเป็นพื้นที่ว่างเปล่า) Subtitle บอกช่วงเดือนที่แสดงแบบ Dynamic — คำนวณแบบ Month-by-month เต็มปี ไม่ผูกกับ Period Filter ด้านบนของหน้า (รายละเอียดอยู่ใน Info Icon) |
| Channel Mix Over Time | 100% Stacked Bar รายไตรมาส (Q1/25 ถึงไตรมาสล่าสุด) — Data label ทั้ง % และ ฿ บนทุก Segment + Insight Caption ใต้กราฟ สรุป Mix Shift First-period vs Last-period ต่อ Channel (สีเขียว/แดงตาม pp เปลี่ยนแปลง) + ปุ่มดูตารางรายเดือนละเอียด |

**Section 4 — What's Driving It:**

| Metric/Chart | ประเภท/สูตร |
|---|---|
| Growth Contribution Waterfall | Waterfall Chart: Last Year YTD (เริ่ม) → ผลต่างยอดขาย (ปีนี้−ปีก่อน) ของ MT/TT/Ecom ทีละแท่ง (เขียว=บวก,แดง=ลบ) → This Year YTD (จบ) + Insight Caption ใต้กราฟ (Total Growth ฿+% และ Top Contributor Channel) |
| Return / Cancellation Rate Trend | Line Chart รายเดือน 3 เส้นอิสระต่อกัน (MT, TT, Ecom — Rate Series อิสระต่อ Channel ดู 6.2) เส้นประ = Threshold 5% แต่ละเส้นแสดงทั้ง % และมูลค่า ฿ คู่กัน (จุดล่าสุดบนกราฟ + Insight Caption ใต้กราฟ สรุปค่าเฉลี่ยของ Period ต่อ Channel + ตารางแบบละเอียดเมื่อกดดู) — Legend/Info-text ใช้ Label **"Ecom (Return/Cancellation)"** เพราะ Ecom ครอบคลุมทั้งการคืนสินค้าหลังจัดส่งและการยกเลิกออเดอร์ก่อนจัดส่ง ไม่ใช่แค่ Cancellation อย่างเดียว (ชื่อตัวแปร `ecomCancelRate` เป็น Internal Identifier ไม่ใช่ Label ที่แสดงผล) |

Layout: Waterfall + Return/Cancellation Rate Trend อยู่คู่กันใน Chart Grid เดียว (ครึ่งซ้าย-ขวา)

### 5.2 Sales Overview → Product Analysis

หน้านี้มี 2 Section: Performance Overview และ Cross-Channel Analysis ไม่มี Portfolio Strategy (Portfolio Matrix/Growth Contribution Waterfall) หรือ Pareto/Concentration Analysis ในหน้านี้ — Focus/Filter เป็น **Filter (Multi-select)** ไม่ใช่ Pin+Highlight แบบเลือกทีละ 1 Node — รายละเอียดทั้งหมดอยู่ด้านล่างนี้

**Section Shortcut Nav:** แถบปุ่มลอย (Pill) ใต้ Filter Bar เหมือนหน้า Executive Outlook — กดแล้ว Scroll ตรงไปยัง **Performance Overview** / **Cross-Channel Analysis** (เหลือ 2 Section เท่านั้น, Performance Overview อยู่ก่อน Cross-Channel Analysis)

**Filter Bar:** Period (เหมือนหน้าอื่น, มี Last Year (2025) + **View By** Monthly/Quarterly Toggle ตาม §5.1) + **Channel** (All/MT/TT/Ecom) + **Product Level** (Category/Sub-Category/Type/Series) + **Filter** — ทั้งหมดเป็น Filter ระดับหน้า (Page-level) ควบคุมทั้งหน้า; Product Level ควบคุม Cross-Channel Analysis ด้วย แต่ **Channel Filter ไม่กระทบ Heatmap/Category Growth by Channel โดยตั้งใจ** เพราะมีไว้เปรียบเทียบข้าม Channel จึงต้องโชว์ครบทุก Channel เสมอ (เช่นเดียวกับคอลัมน์ MT/TT/Ecom ของ Top 10 Product Selling ที่โชว์ Split เต็มเสมอไม่ว่าจะกรอง Channel หรือไม่)

**Filter:** Dropdown แสดงช่อง Search (`#focusSearchInput`) + ตัวเลือก "All [Level]" (`#focusAllOpt`) + List Checkbox ของทุก Node ในระดับที่เลือก (`#focusCheckList`, กรองตาม Search) + ปุ่ม "Clear all" (`#focusClearBtn`) — เลือกได้หลาย Node พร้อมกัน (Multi-select), State เก็บใน `currentFocusSet` (`Set<string>`, ว่าง = "All") — Label บนปุ่ม Dropdown: "All [Level]" / ชื่อ Node เดียวถ้าเลือก 1 / "N selected" ถ้าเลือกมากกว่า 1 — ตัวเลือกเปลี่ยนตาม Level เสมอ (Reset เป็น "All" ทุกครั้งที่เปลี่ยน Level) — Filter **กรอง Node Set ออกจริง**สำหรับทุกกราฟ/ตาราง (ผ่าน `applyFocusFilter()` สำหรับ Component ที่อยู่ Level เดียวกับ Product Level, หรือ `applyFocusFilterByAncestor()` สำหรับ Component ที่ Fix อยู่ Series เสมออย่าง Top 10 Product Selling โดย Map ขึ้นไปหา Ancestor ที่ตรง Level ที่เลือกไว้) — เมื่อมีการเลือก Filter อย่างน้อย 1 Node ทุก Chart จะ**ปิดการ Cap Top-N ชั่วคราว** (`rankSlice()` คืนค่า List เต็มไม่ตัด) เพราะถือว่าผู้ใช้เลือกมาแล้วว่าอยากเห็น Node ไหนบ้าง ไม่ต้อง Cap ซ้ำ

**Performance Overview** (Section แรกของหน้า):

| Metric/Chart | ประเภท/สูตร |
|---|---|
| Sales by Category | Horizontal Bar (`.cat-bars` Pattern) — Top 5 by ยอดขาย + แท่ง "Other (N)" รวมส่วนที่เหลือเมื่อ Level มี Node มากกว่า 6 (ข้าม Bucket ถ้า ≤6 Node หรือมี Filter เลือกอยู่) — ลิงก์ "See all N [Level]s →" เปิดมุมมองตาราง+ขยายเต็มจอของการ์ดเดียวกัน (อ่านจาก List เต็ม `latestData.deepDive` เสมอ ไม่ใช่ List ที่ถูก Cap) — Insight Callout รูปแบบสั้น `Top 3 — Name (+g%) · Name (+g%) · Name (+g%)` (ตัด % Share ออกเพราะซ้ำกับกราฟอยู่แล้ว, ตัดคำว่า "YoY"/"share" ออกเพื่อความกระชับ) |
| Growth Ranking (YoY) — [Level] | Horizontal Bar จัดอันดับตาม **%Growth YoY** แยก 2 กลุ่ม "Fastest Growing" (เขียว) / "Declining" (แดง) — แต่ละกลุ่ม Cap **Top 3** หมายเลข Rank คือ Rank จริงในภาพรวมทั้งหมด — Title แสดง "(N)" เฉยๆ เมื่อไม่มีอะไรถูก Cap (Node รวม ≤3 หรือมี Filter เลือกอยู่) แต่แสดง Subtext "Top 3 of N growing"/"Top 3 of N declining" เมื่อถูก Cap จริง (`rankGroupTitle()` helper) — ความยาวแท่งยังคงคำนวณจาก Max \|Growth\| ร่วมกันทั้ง 2 กลุ่มเหมือนเดิม — ลิงก์ "See all N [Level]s →" อ่านจาก List เต็ม (`latestData.rank` = Growers ทั้งหมด + Decliners ทั้งหมด ไม่ใช่ List ที่ถูก Cap Top 3) |
| Return / Cancellation Rate by [Level]s | Horizontal Bar จัดอันดับ %Return/Cancellation Rate จากสูงไปต่ำ — Cap **Top 5** — ลิงก์ "See all N [Level]s →" อ่านจาก List เต็ม (`latestData.returnRate`) |

ทั้ง 3 การ์งด้านบนจัดเป็นแถวเดียว 3 คอลัมน์ (Class `.chart-grid-3`)

ถัดมาเป็น Chart Grid 2 คอลัมน์วางคู่กัน:

| Metric/Chart | ประเภท/สูตร |
|---|---|
| Revenue Trend by [Level] | Stacked AREA Chart (`buildStackedAreaSVG` พร้อม Option `showAxis:true` เพิ่ม Y-axis Gridline+Label และ `showTopPoints:true` เพิ่มจุด+ตัวเลขกำกับบนเส้นบนสุด ณ ทุกเดือน เพื่อเทียบจุดสูงสุดข้ามเดือนได้ง่าย — ทั้ง 2 Option เป็น Opt-in Backward-compatible ไม่กระทบ Caller อื่นของฟังก์ชันนี้) — Time Window คำนวณจาก `periodYearStart = Math.floor(e/12)*12` (หาต้นปีของปีที่ Period สิ้นสุด) แล้ววาดตั้งแต่ `periodYearStart` ถึง `Math.min(periodYearStart+11, TODAY)` เสมอ เพื่อให้กราฟนี้และ Category Share of Sales Over Time ตรงกับปีของ Period ที่เลือกจริง (ไม่ใช่ Fix เริ่มต้น Jan ปีก่อนเสมอ) |
| [Level] Share of Sales Over Time | 100%-Stacked Bar รายเดือน (Time Window เดียวกับ Revenue Trend ด้านข้าง คำนวณจาก Raw Series ชุดเดียวกันเพื่อไม่ให้ลำดับ `rand()` เพี้ยน) — Insight Callout แสดง **2 Category เท่านั้น** (Biggest gain + Biggest loss) เทียบแบบ **YoY จริง**: ใช้ `growthYoY` คงที่ของแต่ละ Node แปลงกลับเป็นสัดส่วนปีก่อน (`lastYearVal = thisYearVal / (1 + growthYoY/100)`) แล้วเทียบ pp Mix Shift จริง (ไม่ใช่เทียบ Bucket แรก-สุดท้ายในหน้าต่างที่แสดง ซึ่งอาจห่างกันแค่ 1 เดือนและเป็นแค่ Noise รายเดือน) — Denominator คำนวณจาก `syncedAll` เต็ม Node Set เสมอ ไม่ใช่แค่ Top 6 ที่แสดงบนกราฟ เพื่อให้ % รวมเป็น 100% เป๊ะทุก Level — ข้อความ Callout: `Mix shift YoY ([Period Label]) — Biggest gain: X (+Ypp) · Biggest loss: Z (-Wpp)` |

**Top 10 Product Selling** (การ์ดตารางเต็มความกว้าง): แสดงที่ระดับ **Series เสมอ** ไม่ว่า Product Level Filter จะตั้งเป็นระดับใด — คอลัมน์: Product (= Type ของ Series นั้น) / Series (ชื่อสินค้า) / Quantity / Net Sales / **MT** / **TT** / **Ecom** — Quantity คำนวณจาก `Net Sales ÷ Unit Price` โดย Unit Price เป็นค่า Deterministic ต่อ Series (`SERIES_UNIT_PRICE`, สุ่ม Jitter จาก PRNG แยกต่างหาก `mulberry32(20260631)` ไม่ปนกับลำดับ `rand()` หลักของหน้า) — คอลัมน์ MT/TT/Ecom โชว์ **Full Channel Split เสมอ** (คำนวณจาก `categoryChannelValue()` บน Node ต้นฉบับก่อน Rescale เพื่อไม่ Double-count เวลามี Channel Filter อยู่แล้ว — ผลรวม MT+TT+Ecom เท่ากับ Net Sales เป๊ะเสมอ) เหมือนหลักการเดียวกับ Heatmap ที่ต้องเห็นครบทุก Channel แม้ Net Sales จะถูกกรองแคบลงจาก Channel Filter — เรียงตาม Net Sales มากไปน้อย, Default โชว์ Top 10, ปุ่ม **"See more"** ขยายเป็นรายการเต็มตาม Filter ปัจจุบัน (สลับกลับเป็น "Show top 10 only")

**Cross-Channel Analysis** (Section ที่ 2):

| Metric/Chart | ประเภท/สูตร |
|---|---|
| Channel × [Level] Heatmap | Table **Transpose**: แถว = Channel (Label ย่อ "MT"/"TT"/"Ecom", คงที่ 3 แถว), คอลัมน์ = Node ตามระดับที่เลือก (เรียงยอดขายมากไปน้อย, สูงสุด 20 คอลัมน์) — เลื่อนดูแนวนอนได้เมื่อคอลัมน์เยอะ, Cell = ยอดขาย + % Row-normalized, สีเข้ม-อ่อนตาม % — Insight Callout ใต้ตาราง สรุป Category อันดับ 1 ต่อ Channel |
| Category Growth by Channel | Heatmap Layout เดียวกับด้านบน (แถว = MT/TT/Ecom Label ย่อ, คอลัมน์ = Node Set เดียวกัน) แต่ Cell = **%Growth YoY แบบผสม (Blended)** แทน ฿ — สูตร `cellGrowthYoY(node, ch) = priorPeriodAvailable ? (node.growthYoY + channelGrowthYoY[ch]) / 2 : node.growthYoY` โดย `channelGrowthYoY[ch]` คำนวณจาก Real Time Series ของ Channel นั้น (`groupActual[ch]`) เทียบปีนี้กับปีก่อนช่วงเดียวกัน, `priorPeriodAvailable = (s-12) >= 0` กันไม่ให้ Index ติดลบเมื่อ Custom Period อยู่ต้นๆ ของข้อมูล — ใช้ Data ที่มีอยู่แล้วทั้งหมด (`growthYoY` ต่อ Node + `groupActual` ต่อ Channel) ไม่สร้าง Field สุ่มใหม่ — สี **Diverging แดง-เทา-เขียว** พร้อม Scale Bar ไล่สีระบุ Min/Max ใต้ตาราง (`#growthScaleBar`, `#growthScaleMinLabel`, `#growthScaleMaxLabel`) — Insight Callout ใช้ถ้อยคำที่ตรวจสอบเครื่องหมายเสมอ (`deltaClass()`): "Fastest-growing combo: X in Y (+Z%)" คู่กับ "Slowest growth: ..." หรือ "Steepest decline: ..." แล้วแต่ค่าต่ำสุดยังเป็นบวกหรือติดลบจริง (ป้องกัน Label ผิดแบบ "Steepest decline" ทั้งที่ค่าเป็นบวก) |

ไม่มีกราฟ "Growth Concentration by Category" หรือแนวคิด "Expansion Opportunity" ในหน้านี้

ทุก Chart Card ใน Product Analysis (Heatmap, Category Growth by Channel, Sales by Category, Growth Ranking, Return/Cancellation Rate by [Level]s, Revenue Trend, Share of Sales Over Time, Top 10 Product Selling) มี Toolbar ดูเป็นตาราง/ดาวน์โหลด/ขยายเต็มจอ ครบเหมือนหน้า Executive Outlook

### 5.3 MT Overview

**Executive Summary — KPI (3 การ์ด, สไตล์ Hero Card):** Net Sales (MT), Target Attainment %, Return Rate (CN) — ตัด AR% ออก เพราะไม่ใช่ Focus หลักของหน้านี้ (ยังดูละเอียดได้ที่ AR Aging ใน Breakdown), ตัด Active Partners ออก เพราะจำนวนคู่ค้าเปลี่ยนช้ามาก ไม่ใช่ตัวเลขที่ต้องเช็คถี่ระดับ Executive, ตัด Partner Retention ออก เช่นกัน (ย้ายมุมมอง "ใครขับเคลื่อนอะไร" ไปให้ Growth Contribution Waterfall ด้านล่างตอบแทน ซึ่งมีความหมายเชิงบริหารมากกว่า) — ไม่มีการ์ด Growth YoY/Growth MoM แยก เพราะซ้ำกับแถว MoM/YoY ที่มีอยู่แล้วในการ์ด Net Sales/Target Attainment ตามหลักการเดียวกับที่ปรับ Sales Overview — **ใช้ Layout แบบเดียวกับ Sales Overview — Executive Outlook** (`kpi-value-line` รวม Value+Unit+Caption บรรทัดเดียว + Insight Caption แถบล่างมีเส้นคั่นบนสุด) แทน Layout การ์ดเล็กเดิม เพราะเหลือแค่ 3 การ์ดแล้วยืดเต็มความกว้างจอ Layout เดิม (ค่า+Caption เรียงแนวตั้งชิดซ้าย) จะดูโหว่ตรงกลาง-ขวาการ์ด: Net Sales มี Insight "Top account" ท้ายการ์ด, Target Attainment มี "Gap to Target", Return Rate มี "Amount + Highest Return Rate account" (ใช้ประโยชน์จาก field `ret` ต่อคู่ค้าที่มีอยู่แล้วแต่ไม่เคยถูกแสดงมาก่อน)

**Revenue Trend + Monthly YoY Growth %** (Chart Grid 2 การ์ด, Pattern เดียวกับ ECOM/TT Executive Summary, ใช้ `shared.js` Engine เดียวกัน) — ตัวเลข +/-% ที่แสดงตรงกับแถว YoY ของการ์ด Net Sales (MT) เสมอเพราะคำนวณจากอนุกรมเดียวกัน `groupActual.MT`

**Key Account Portfolio** (Section รวมทุก Metric/Chart ที่มองในมุมคู่ค้ารายบุคคลไว้ด้วยกัน):

| Metric/Chart | ประเภท |
|---|---|
| Sales by Key Account + Sales by Category | จัดคู่กัน (Chart Grid) เหมือน Sales Overview — Executive Outlook ที่วาง "Sales by Channel" คู่ "Sales by Category" — Sales by Key Account เป็น Donut ใช้**ชื่อคู่ค้าจริงในตลาดไทย**: WATSONS, EVEANDBOY, Lotus's, 7-Eleven, KONVY, CJ Express, Beautrium, Tsuruha, Multy (ตัวเลข % ส่วนแบ่งและสถิติทั้งหมด — Attainment/Return Rate/AR%/Growth YoY — ยังเป็น Mock Data ไม่ใช่ข้อมูลจริงของคู่ค้า) ส่วน Sales by Category มี **Product Level Toggle ในตัวการ์ดเอง** (Category/Sub-Category/Type/Series — ปุ่ม Local เฉพาะการ์ดนี้ ไม่ใช่ Filter ระดับหน้าแบบ Product Analysis) โครงสร้าง `CATEGORY_TREE` copy มาจาก Product Analysis (โครงสร้าง Sub/Type/Series เท่านั้น) แต่ระดับ Category (Depth 0) ยังคงใช้ตัวเลข `mtCategoryShares` เดิมเป๊ะ (ตัวเลขเดียวกับที่ P&L Copy ไป) ส่วนระดับลึกกว่าคำนวณจากสัดส่วนภายใน `CATEGORY_TREE` คูณทบลงมาบนตัวเลข Category เดิม — แสดง Top 10 ต่อระดับ พร้อม Caption "Top 10 of N" เมื่อเกิน — มี Sub-label (Parent Category ตัวเล็กสีจางใต้ชื่อ Node) ที่ระดับลึกกว่า Category ตามหลักการ Level Selector มาตรฐาน (§3.4) |
| Partner Concentration / Pareto | `buildParetoSVG` (ฟังก์ชันเดียวกับ Product Analysis) — แท่ง %ยอดขายต่อคู่ค้า + เส้นสะสม, เส้นประ Reference 80%, แท่งเลย 80% จางสี — ตอบคำถาม "กี่คู่ค้าที่คิดเป็นสัดส่วนหลักของยอดขาย MT" คู่ค้ามีแค่ 9 รายทั้งหมด (List คงที่ ไม่มี Level Drill-down แบบ Product Analysis) จึงแสดงครบทุกรายโดยไม่ต้อง Cap Top-N/"Other" |
| Key Account Growth Contribution | Waterfall (`buildWaterfallSVG`) — แนวคิดเดียวกับ Category Growth Contribution ใน Product Analysis: "ปีก่อน" ต่อคู่ค้าประมาณจากยอดขายปีนี้หารด้วย (1+%Growth YoY ของคู่ค้านั้น ซึ่งเป็นค่าคงที่ Mock ต่อราย ไม่ใช่ Time Series จริง) คำนวณ Start/End จากผลรวม Bottom-up เสมอเพื่อให้ Start+ΣDelta ตรงกับ End เป๊ะไม่ว่าจะกรอง Period ไหน — บอกว่าคู่ค้ารายไหน Contribute การเติบโตกี่ ฿ จริง คนละมุมกับ Donut ที่เห็นแค่สัดส่วน ณ ปัจจุบัน |

Section "Store Performance" ไม่อยู่ใน Executive Summary — ย้ายไปที่ Store Tab แล้ว (ดูหัวข้อ "Store" ด้านล่าง) — Section Nav ของ Executive Summary มี 2 ลิงก์ (Executive Summary / Key Account Portfolio)

Executive Summary มี `<nav class="section-nav">` ใต้ Filter Bar เป็น Sub Module Jump Navigation (Anchor ครอบ Section ที่มีชื่ออยู่แล้ว ไม่ใช่ Tab Panel แยกมุมมอง) แบบเดียวกับที่ Breakdown มี

ไม่มี "Target Attainment by Key Account" (Diverging Bar) ใน Executive Summary — มุมมองนี้ (แบบ Bar เทียบ Target) อยู่ใน Breakdown → Partner Performance ในชื่อ "Target vs Actual per Partner" แทน — `buildHBarCompareSVG` (ฟังก์ชันที่ใช้ร่วมกับ "Target vs Actual per Partner" ใน Breakdown, ECOM Breakdown, และ P&L Breakdown) วาด Gridline+Tick Label แบบ `niceAxisTicks` เหมือน `buildGroupedBarSVG` เสมอ (ไม่ใช่แค่เส้นประ Reference เส้นเดียว) เพื่อให้อ่าน Scale ได้ว่าแต่ละแท่งห่างจาก 100% แค่ไหน

ไม่มี Ranking — Top Key Accounts by Net Sales (Table) ใน Executive Summary เพราะข้อมูลเดียวกัน (ยอดขาย + Attainment ต่อคู่ค้า) เห็นครบผ่าน Donut + Pareto + Waterfall ด้านบนแล้ว (Ranking แบบละเอียดครบทุกรายอยู่ใน Breakdown → Partner Performance)

**Breakdown (ข้อมูลคู่ค้า):** ไม่มี Page Subtitle ใต้ H1 (ชื่อ Section/Card อธิบายตัวเองพออยู่แล้ว)

Breakdown มีมาตรฐาน Navigation/Drill-through/Chart Quality ใกล้เคียง "TT Overview — Breakdown" (ไม่ Copy โครงสร้างทั้งหมด เพราะโมเดลธุรกิจ MT ต่างจาก TT และมีข้อจำกัดด้านข้อมูลบางอย่าง): มี Anchor/Jump Navigation (`.section-nav`), Target vs Actual ไม่โชว์เดือนที่ยังไม่ปิดงวดเป็นแท่ง "+฿0" หลอกๆ, ไม่มี Label ทับกันใน Portfolio Matrix, Category Share of Sales Over Time เป็น Smooth Stream Chart พร้อม Hover Tooltip

Breakdown ปัจจุบัน:
- **Filter Bar**: ไม่มี Key Account Manager selector หรือ "My accounts only" checkbox — Partner Performance เป็น Company-wide เสมอเหมือน Zone อื่นในหน้านี้ — Filter Bar เหลือแค่ Period + Category — Field `kam` ยังอยู่ใน `partners` Mock Data แต่**ไม่มีจุดไหนในหน้านี้แสดงผล** (เก็บ Field ไว้เผื่ออนาคตต้องใช้)
- **Target vs Actual**: Bullet Bar Style ของ TT Overview (ฟังก์ชัน `buildBulletBarSVG` ใน `shared.js`, Port มาจาก `tt-shared.js`'s `renderBulletBarChart` แต่เขียนด้วย String-SVG Convention ของ `shared.js` เอง) — แท่ง Actual สีเขียว/แดงตาม Hit/Miss (`var(--good-text)`/`var(--critical)`), เส้น Tick สีเข้ม = Target, Caption ใต้เดือน 4 บรรทัด: ชื่อเดือน → Δ vs Target → MoM → YoY — มี Headline "% of target, Year to Date" + Legend อธิบายสัญลักษณ์เหนือกราฟ
- **High Return Rate Partner**: จับคู่ (Chart Grid) กับ Return Rate (CN) Trend, Layout เดียวกับ TT Overview's "High Return Rate Stores" — ใช้ `.cat-bars` Pattern, Constant `RETURN_RATE_CEILING_PCT` = 4.0 (ตัวเดียวกับเส้นประ Threshold ของ Return Rate Trend) — แสดงครบทั้ง 9 Key Account เสมอ เรียงมาก→น้อย, สีแท่ง Red/Green ตาม Hit/Miss เทียบ 4.0% (`var(--critical)`/`var(--good-text)`, Convention เดียวกับ Bullet Bar), มีเส้นประ Reference แนวตั้งที่ตำแหน่ง 4.0% บนทุกแท่ง (Class `.cat-ref-line` ใน `shared.css`, ต้องมี `position:relative` บน `.cat-track` เพื่อวางตำแหน่ง Absolute ได้ — Backward-compatible, ไม่กระทบ `.cat-track` Caller อื่นที่ไม่มี Child นี้) — ไม่มี Sub-label KAM (เหลือแค่ชื่อคู่ค้า), ไม่มี Empty-state Message (ไม่มี Filter ให้กรองจนว่างเปล่า)
- **ไม่มี Account Health / Risk Signal Section** (ไม่มี Composite Scorecard, `accountHealthOf()`, หรือ Section-nav Link ของ Section นี้)
- **Partner Performance เรียงลำดับ**: 1) Monthly Sales by Partner (บนสุดของ Zone, เต็มความกว้าง) 2) Target vs Actual per Partner คู่กับ YoY Growth by Partner (Chart Grid) 3) Sales by Partner คู่กับ Partner Portfolio Matrix 4) Partner Share of Sales Over Time (เต็มความกว้าง)
  - Monthly Sales by Partner: ใช้ Field `opacity` ใน `buildLineChartSVG` (shared.js, Optional, Default 1) จางสีเส้นของ 4 คู่ค้าที่ไม่ติด Top 5 ตามยอดขายล่าสุด (`opacity:0.35, width:1.3`, ไม่แสดง End-label) — เส้นยังวาดครบ 9 เส้น แค่เน้น Top 5 ให้อ่านง่ายขึ้นโดยไม่ซ่อนข้อมูล
  - Target vs Actual per Partner / YoY Growth by Partner: Cap Top 10 by Net Sales + ลิงก์ "See all N →" (ฟังก์ชัน `renderPartnerSeeMore()` ในไฟล์นี้ — คลิกแล้วสั่ง Toolbar Table/Expand Button ที่มีอยู่แล้วของการ์ดนั้นให้ Toggle เอง ไม่ใช่ Mechanism คู่ขนานใหม่ เหมือนแนวทางของ TT's See-more) — ปัจจุบันมีแค่ 9 คู่ค้าจึงไม่เคย Overflow แต่เตรียมไว้รับ 11+ คู่ค้าในอนาคต, Table View ของทั้ง 2 การ์ดแสดงครบทุกรายเสมอไม่ว่า Chart จะ Cap หรือไม่
  - Sales by Partner: Ranked Bar (`.cat-bars` Pattern เดียวกับ Sales by Category) จัดอันดับ Net Sales ต่อคู่ค้า ไม่มี Level Toggle (คู่ค้าเป็น List เรียบ ไม่มี Hierarchy)
  - Partner Portfolio Matrix: Adapted BCG Matrix เหมือน Category Portfolio Matrix แต่ X/Y เป็นยอดขาย/Growth YoY ต่อคู่ค้า (`buildScatterSVG` เดิม, สี = `keyAccountColors`)
  - Partner Share of Sales Over Time: Stream Chart เหมือน Category Share of Sales Over Time แต่แยกตามคู่ค้า (18 เดือน, `buildStreamAreaSVG` เดิม, สี = `keyAccountColors`) — Callout สรุปเฉพาะ Biggest Gain/Biggest Drop เท่านั้น (ไม่ใช่ครบทุกคู่ค้าเหมือน Category Share ที่มีแค่ 6 หมวด เพราะ 9 คู่ค้าจะยาวเกินไป)
- **Product Coverage เรียงลำดับ**: Sales by Category คู่ Category Portfolio Matrix → Category Share of Sales Over Time → Partner × Category — Category Share of Sales Over Time ใช้ **Level Selector เดียวกับ Sales by Category** ไม่ Fix อยู่ที่ระดับ Category (Cap Top 6 Node เมื่อเลือกระดับลึกกว่า Category ตามหลักการ Density Limit ของ Stream Chart ใน §3.4 — สีต่อ Node กำหนดจากลำดับ Rank Position ไม่ผูกกับ Category Identity เพราะ Top 6 ที่ระดับลึกอาจมี Node จากหลาย Category แม่ปนกัน ถ้าผูกสีตาม Category แม่จะเกิดสีซ้ำจนแยกไม่ออก) — **Category Portfolio Matrix อยู่ที่ระดับ Category เสมอ** ไม่ Sync กับ Level Selector
- "Return Rate (CN)" Trend พล็อตด้วย `closedIdx` (Jan ถึง TODAY เท่านั้น ตัวเดียวกับที่ Target vs Actual Bar Chart ด้านบนใช้) ทำให้เส้นกราฟยืดเต็มความกว้าง Container เสมอ (ไม่ใช้ `curYearIdx` เต็มปีที่ปล่อยเดือนยังไม่ปิดงวดเป็น `null` ซึ่งทำให้พื้นที่ Canvas ครึ่งขวาว่างเปล่า — ยังคง Responsive ปรกติเพราะ `buildLineChartSVG` Scale แกน X ตาม Label Array ที่ส่งเข้าไปอัตโนมัติอยู่แล้ว) — Return/Cancellation Rate Trend ของ ECOM Breakdown ใช้ Pattern เดียวกัน (ดู §5.5)

| Section | Metric/Chart |
|---|---|
| Portfolio Quality | Target vs Actual (Bullet Bar — ดู Note ด้านบน), Return Rate (CN) Trend คู่กับ High Return Rate Partner (MT-wide เส้นเดียว, เส้นประ Threshold `RETURN_RATE_CEILING_PCT`) — **ไม่มี AR Aging** (MT ไม่แสดง AR ที่จุดใดในหน้านี้ทั้ง Executive Summary และ Breakdown) |
| Partner Performance | ดู Note "Breakdown ปรับใหญ่รอบที่สอง" ด้านบนสำหรับลำดับและรายละเอียดครบทุกการ์ด |
| Product Coverage | Sales by Category คู่กับ Category Portfolio Matrix → Category Share of Sales Over Time (ตาม Level Selector เดียวกับ Sales by Category) → **Partner × Category** (Heatmap — แถว = 9 Key Account, คอลัมน์ = Top 8 Node ที่ Level เดียวกัน, ค่า = % Row-normalized ต่อคู่ค้า, ใช้ Mock `partnerCategorySkew` ต่อคู่ค้า) — ทั้ง Zone นี้ Company-wide เสมอ |

Filter Bar ของ Breakdown (ปัจจุบัน): Period, Category (ใช้งานได้แค่ "All Categories" ตัวเลือกอื่นยัง Disabled รอ Partner×Category Data Model)

Partner ระดับ Breakdown คือ Key Account 9 รายเดียวกันกับ Executive Summary เป๊ะ (ไม่มี Sub-partner ซ้อนอีกชั้น) — ตัวเลข Net Sales Share/Attainment/Return Rate (CN) ต่อรายใช้ค่าเดียวกับ `keyAccountStats` ของ Executive Summary ทุกประการ เพื่อให้ 2 หน้าเล่าเรื่องตรงกันเสมอ ("Partner" ในความหมายของ Breakdown จึงหมายถึงคู่ค้าทั้งบัญชี ไม่ใช่สาขาย่อย — ข้อมูลระดับสาขาเป็นคนละมิติ อยู่ที่ Store Tab แทน)

**หมายเหตุ AR ใน MT:** MT Module ไม่มีจุดไหนแสดงข้อมูล AR ให้ผู้ใช้เห็น ทั้ง Executive Summary และ Breakdown — `mtARSeries` ยัง Generate อยู่ในทั้ง 2 ไฟล์เพื่อรักษาลำดับ `rand()` (ดู §6.2) แต่ไม่ถูกใช้แสดงผลที่ไหนในโมดูลนี้ ถ้าต้องการดู AR ของ MT ต้องเพิ่มกลับมาใหม่ในอนาคต

**Store:** Tab ที่ 3 ของ MT Overview (`module_mt_store.html`) แยกจาก Breakdown — มี Nav Item `mt-store` ใน `MODULE_MAP` (nav-menu.js) และ Tab Link "Store" ใน `<nav class="tabs">` ของทั้ง 3 ไฟล์ (Executive Summary, Breakdown, Store เอง) ลำดับ Section บนหน้า (บนลงล่าง): **Store Overview → By Partner → Productivity & Ranking** — `<nav class="section-nav">` เรียงตามลำดับนี้เช่นกัน (Anchor `#sec-store-overview` / `#sec-by-partner` / `#sec-productivity-ranking`)

**CJ Express ไม่รวมในข้อมูลระดับสาขา:** `storeAccounts = keyAccounts.filter(a=>a.storeCount && a.name!=='CJ Express')` — Filter จุดเดียวตัดคู่ค้านี้ออกจากทุก Widget ระดับสาขาในหน้านี้ (ไม่ได้ลบ `storeCount:26` ออกจาก Object ของ CJ Express ใน `keyAccounts` โดยตรง เพื่อไม่ให้ลำดับ `rand()` ที่คู่ค้าอื่นพึ่งพาอยู่เปลี่ยนไป) ผลคือ Mock Store Count รวมเหลือ **54 สาขา** (WATSONS 40, EVEANDBOY 8, Beautrium 4, Multy 2) จาก **4 คู่ค้า** ที่มีข้อมูลระดับสาขา (ไม่ใช่ 5 เหมือนเดิม) — ตัวเลข "New Stores Opened trailing 12mo" ก็ลดจาก 12 เหลือ **7** ตาม Filter เดียวกันนี้

| Section | Metric/Chart | หมายเหตุการ Build |
|---|---|---|
| Store Overview (KPI, 2 การ์ด) | Avg Sales per Store, Same-Store Sales Growth (SSSG) | ทั้ง 2 ใบผูกกับ Partner filter, มี Sparkline (`sparklineSVG()` จาก `shared.js`) ย้อนหลัง 12 เดือน จุดขวาสุด = ตัวเลขหัวข้อเป๊ะ — Avg Sales per Store: Sparkline เป็นอัตราเฉลี่ยรายเดือน ต่างจากตัวเลขหัวข้อที่เป็นยอดสะสมตามช่วงเวลาที่เลือก (Unit ต่างกันตั้งใจ เหมือน Pattern ของ Net Sales KPI ใน Executive Summary) — SSSG: เนื่องจาก `growthYoY` เป็นค่าคงที่ต่อ Account จึงให้เฉพาะสัดส่วนสาขาใหม่ (`newStoreWeightShare`) ที่ผันแปรตามเวลาจริงแทน แล้ว Anchor จุดขวาสุดให้เท่ากับตัวเลขหัวข้อเป๊ะ — **Total Stores/New Stores Opened ไม่ใช่ KPI การ์ดแยกอีกต่อไป** (ย้ายไปรวมอยู่ใน "Store Count & New Openings" ด้านล่างแทน เพราะการเปิด/ปิดสาขาเป็นการตัดสินใจของ Retail Partner ไม่ใช่ Lever ที่ทีม MT ควบคุมโดยตรง) |
| Store Overview (Context, การ์ดเต็มความกว้าง) | **Store Count & New Openings** — Combo Bar+Line (`buildComboBarLineSVG`), Badge "Context" | Company-wide เสมอ (ไม่ผูก Partner filter) และยึด **TODAY เสมอ ไม่ผูกกับ Period Filter** (ตั้งใจให้เห็น Pace ปัจจุบันเสมอ ต่างจากกราฟ Trend อื่นในหน้านี้ที่ตาม Period ที่เลือก) — วิ่งตาม View By จริง (Monthly/Quarterly ผ่าน `bucketMonths`/`bucketSum`/`bucketSample`, เดิมเคยไม่ Bucket ตาม View By เลย เป็น Bug ที่แก้แล้ว) — แท่ง (แกนซ้าย) = **Total Stores** สะสม (สี Brand, Scale ~0–60), เส้น (แกนขวา) = **New Stores Opened** ต่อเดือน/ไตรมาส (สีเขียว `--good-text`, Scale ~0–4) — ลำดับ Bar/Line สลับจากรอบก่อนหน้า (เดิมแท่ง=New Openings, เส้น=Total Stores) เพราะ Total Stores (Scale ใหญ่กว่ามาก) อ่านง่ายกว่าเมื่อเป็นแท่ง — `buildComboBarLineSVG` (`shared.js`) Fix ให้ Bar อยู่แกนซ้ายเสมอ จึงสลับได้แค่ว่า Series ไหนเป็น Bar/Line ไม่ใช่สลับฝั่งแกน — Insight Caption "54 stores · 7 opened trailing 12mo · 0 closures" |
| By Partner | **Avg Sales per Store by Partner** (Ranked Bar) จับคู่กับ **Sales per Store Trend** (Multi-line, แยกเส้นตาม Partner ที่อยู่ใน Scope) | สอง Chart นี้คือ Metric เดียวกัน (ยอดขายเฉลี่ย/สาขา) มองแบบ Snapshot กับ Trend — ทั้งคู่วิ่งตาม Period+View By จริง (`trendMonthIdx`/`trendMonthGroups`, Trailing 12 เดือนนับจากจุดสิ้นสุดของ Period ที่เลือก ไม่ใช่ TODAY ตายตัว) |
| By Partner | **Same-Store Sales Growth by Partner** (Ranked Bar, แท่งแดง = SSSG ติดลบ) จับคู่กับ **Same-Store Sales Growth by Partner Trend** (Multi-line, แกน Y คร่อม 0 รองรับ Multy ที่ติดลบ) | แทนที่ Dumbbell Row เดิม — Trend ต่อคู่ค้าใช้โมเดล **Ramp** (`rampShare = target * ((idx+1)/n)`) ไล่จาก 0 ไปหา `newStoreWeightShare` ที่ประกาศไว้ของคู่ค้านั้นตลอดหน้าต่าง Trend แทนการใช้ Weight สาขาจริงต่อเดือนแบบ KPI SSSG (Blended) ด้านบน — ดู Gotcha ใน Data Model ด้านล่างว่าทำไมต้องแยกวิธีคำนวณ — จุดขวาสุดของทุกเส้นยัง Anchor ตรงกับตัวเลข Snapshot ทางซ้ายเป๊ะเสมอ |
| Productivity & Ranking | **Store Productivity Distribution** (Histogram) จับคู่กับ **Store Productivity Mix Over Time** (Stream Chart 18 เดือน) | Company-wide เสมอ ไม่ผูก Partner filter — ไม่มี Data Label จำนวนสาขาบนแท่ง ใช้ Y-axis Title "Store Count" แทน — Bucket เป็น **Dynamic** (`computeDynamicBuckets()` ในไฟล์นี้) คำนวณจาก Percentile ที่ 90 ของยอดขายต่อสาขาปัจจุบัน ปัดเป็นเลขกลม (`niceStep()`) Bucket สุดท้ายเปิดปลาย (`≥`) รับ Outlier — Mix Over Time Reuse Bucket ชุดเดียวกัน (`bucketDefs`) เพื่อให้ 2 การ์ดสอดคล้องกันเสมอ |
| Productivity & Ranking | **Top 10 Performing Stores** (List อันดับเดียว — **ไม่มี Bottom 5 แยกอีกต่อไป**, ตัดออกเพราะซ้ำซ้อนกับ Long-tail ที่เห็นอยู่แล้วใน Store Productivity Distribution) จับคู่กับ **Top 5 Stores Trend** (Multi-line, ตาม Partner filter บนสุดของหน้าโดยตรง — เลือก "All 4 Partners" = Top 5 บริษัท, เลือกคู่ค้าเดียว = Top 5 ของคู่ค้านั้น) วางคู่กันแบบ **1×2** | ปุ่ม "See all 54 →" และไอคอน "ดูตารางเต็ม" บน Toolbar **ไม่เปิด Popup แยกอีกต่อไป** (ของเดิม `showStoreRankTable`/`hideStoreRankTable` ถูกลบ) แต่ Scroll ไปที่การ์ด **Sales by Store** ท้ายหน้าแทน (`scrollToSalesByStore()`) เพื่อไม่ให้มี 2 ที่แสดง List เต็มซ้ำกัน — การ์ด Top 5 Stores Trend ใช้ `display:flex;flex-direction:column` + `canvas-wrap{flex:1 1 auto;min-height:220px}` เพื่อให้กราฟยืดเต็มความสูงเท่าการ์ด Top 10 ทางซ้ายที่ CSS Grid stretch ให้ (แทนที่จะเหลือพื้นที่ว่างใต้กราฟแบบความสูง Fix เดิม) |
| Productivity & Ranking (การ์ดเต็มความกว้าง, ท้ายหน้า) | **Sales by Store** — ตารางละเอียดรายสาขา, Sticky Header + Sticky Footer (`.sbs-scroll`), จัดกลุ่มตาม **Partner** เรียง Grand Total มากไปน้อยในแต่ละคู่ค้า | คอลัมน์: **Partner** (Rename จาก "Sub Channel" เดิม — ชื่อเดิมสับสนกับแนวคิด Sub Channel ที่อื่นในระบบ) / Store / คอลัมน์รายเดือน-ไตรมาสตาม Period+View By ที่เลือกด้านบนของหน้า / Grand Total — คอลัมน์ Grand Total การันตีตรงกับตัวเลขใน Top 10 Performing Stores/"See all 54" **เป๊ะทางพีชคณิต** (ใช้ Field `sales` เดียวกันจาก `buildStoreList()` แทนการ Sum คอลัมน์เดือนขึ้นใหม่ จึงไม่มีทาง Diverge กัน) |

ไม่มี Pareto Ranking (10 Decile) ในหน้านี้อีกต่อไป (ถูกตัดออกไปแล้วก่อนรอบปรับล่าสุด)

**Data Model — `storeOpenedMonth`:** `a.storeOpenedMonth` (Array ขนาดเท่า `storeCount`, `null` = เปิดมาก่อนหน้าต่างข้อมูล 36 เดือน, หรือ Index เดือนใน 12 เดือนล่าสุด = เพิ่งเปิด) และ `a.newStoreWeightShare` (สัดส่วน Weight ของสาขาที่ Tag ว่า "ใหม่") ต่อ Key Account ที่มี `storeCount` — สาขา "ใหม่" สุ่มเลือก**แบบสุ่มล้วน ไม่ใช่เรียง Weight น้อยไปมาก** (เรียง Weight ก่อนจะ Tag สาขาเกินสัดส่วนจริง เพราะสาขา Long-tail มี Weight น้อยมาก ต้องใช้จำนวนมากถึงจะรวมได้ถึง Target) — SSSG = `((1+growthYoY/100)*(1-newStoreWeightShare)-1)*100`, `NEW_STORE_TARGET_SHARE` เป็นค่า Illustrative ต่อ Account (WATSONS 2.5%, EVEANDBOY 12%, CJ Express 8%, Beautrium 5%, Multy 1.5% — ค่าของ CJ Express ยัง Generate อยู่เพื่อรักษาลำดับ `rand()` แต่ไม่ถูกใช้แสดงผลที่ไหนในหน้านี้อีกต่อไปตาม `storeAccounts` Filter ด้านบน) — ⚠️ **Gotcha ที่ต้องระวัง:** `a.newStoreWeightShare` ใช้ค่า `target` ที่ประกาศตรงๆ (ไม่ใช่ค่า `cum` จริงจากการ Tag สาขา) เพราะสำหรับ Account ที่มีสาขาน้อยมาก (เช่น Multy 2 สาขา) การ Tag แค่ 1 สาขาอาจกิน Weight 50%+ ของ Account ทันที ถ้าใช้ `cum` จริง Target เล็กๆ (1.5%) จะกลายเป็นค่าจริงสูงถึง ~80%+ ทำให้ SSSG ผิดเพี้ยนไปมาก (เคยพุ่งไปที่ -82% จาก Total Growth -6%) — การ Tag สาขาจริง (`storeOpenedMonth`) ใช้ Mechanism แยกต่างหาก จำกัดผลไว้แค่ KPI "New Stores Opened"/ตาราง ไม่กระทบสูตร SSSG — **บทเรียนเดียวกันนี้เกิดซ้ำอีกครั้ง** ตอนสร้าง Same-Store Sales Growth by Partner Trend รอบแรก (ใช้ Weight สาขาจริงต่อเดือนตรงๆ แทน Ramp จาก Target ที่ประกาศไว้ ทำให้ Multy/Beautrium พุ่งลงผิดปกติกลางเส้น -86%/-26% ก่อนแก้เป็นโมเดล Ramp) — ยืนยันอีกครั้งว่า Field ไหนที่ "ควรจะ" มีค่าตรงกัน (Declared Target vs Derived Actual) ต้องเช็คให้ชัดว่าฝั่งที่ใช้จริงในแต่ละสูตรคือตัวไหน อย่าสมมติว่าตรงกันเสมอโดยไม่ตรวจ

**Data Model — `monthlyWeights`:** `a.monthlyWeights` (Array 12 เดือน แต่ละเดือนเป็น Array ของ Per-store Weight ที่ Renormalize แล้ว) ใช้เฉพาะสำหรับ KPI SSSG (Blended) และ "Top Store Stability by Partner" — จำเป็นเพราะ `storeWeights` เดิมทำให้ Rank ไม่เปลี่ยนได้เลยตามโครงสร้างสูตร (ทุกสาขาในบัญชีเดียวกันคูณด้วย Account Total เดือนนั้นเท่ากันหมด สัดส่วนเทียบกันจึงคงที่ตลอด) — `rand()` เป็น Stream เดียวกับข้อมูล Mock อื่นในไฟล์นี้ ต่อจาก `storeOpenedMonth` — **ไม่ใช้** สำหรับ Same-Store Sales Growth by Partner Trend (ดู Gotcha ด้านบน — ต่างจาก KPI SSSG (Blended) ที่ปลอดภัยเพราะ Blend รวมทุกคู่ค้าช่วยเกลี่ย Noise ออกไป แต่ต่อคู่ค้าเดี่ยวๆ จะเห็น Noise เต็มๆ จนพังกับ Account สาขาน้อย)

Coverage caveat (ปรับจากเดิม — ตัด CJ Express ออก): ข้อมูลระดับสาขามีเฉพาะ **4** จาก 9 Key Account (WATSONS, EVEANDBOY, Beautrium, Multy) Other 5 report account-level totals only — Note นี้แสดงเป็น `chart-subtitle` ใต้ Filter Bar

Filter Bar ที่ Build จริง: Period (Dropdown เหมือนทุกหน้า) + View By (Monthly/Quarterly Toggle) + Partner (`<select>` จำกัดเฉพาะ 4 รายที่มีข้อมูลสาขา, ค่าเริ่มต้น "All 4 Partners") — ไม่มี Store Tier/Quartile filter เนื่องจากยังไม่มี Use Case ชัดเจนที่ต้องใช้ร่วมกับ Filter อื่น

รอบนี้ยังไม่ทำ: ตัวเลขจำนวนสาขาปิดจริง (ต้องมี Concept "สถานะสาขา" ในข้อมูลต้นทางก่อน), Store Tier filter

### 5.4 TT Overview

**Executive Summary:** Total Net Sales, Target Attainment, AR%, Return Rate (CN), Active Stores, Store Retention (KPI) · Revenue Trend, Monthly YoY Growth % (Chart) · Sales by Customer Group, Sales by Category (Chart) · Sales Ranking by Rep (Table) — มี `<nav class="section-nav">` (Executive Summary / Trends & Mix) เป็น Jump Navigation, `id="sec-exec-summary"` บน `.section-label` ของ Zone I และ `id="sec-trends-mix"` ก่อน Zone II — `.section-nav`/`html{scroll-behavior:smooth}` อยู่ใน `tt-shared.css` (TT เป็น Engine แยกจาก `shared.css` — ดู §6.1/6.3)

**Breakdown (ข้อมูลร้านค้า):**
| Section | Metric/Chart |
|---|---|
| Portfolio Quality | Target vs Actual, Return Rate (CN), High Return Rate Stores, AR Aging |
| Team Performance | Target vs Actual (per rep), Active Sales Reps vs Avg Sales/Rep, Visit Compliance Trend |
| Customer Coverage | Top & Bottom Performing Stores, Active Stores, New vs Inactive Stores, Sales by Region, Sales by Province (แผนที่ไทย) |
| Product Coverage | Sales by Category, Category Portfolio Matrix, Category Share of Sales Over Time, Customer Group × Category |

**Sales Person** (มุมมองส่วนตัวของ Sales Rep แต่ละคน — Header ของระบบยังคงแสดง Session User เดิม "Nattapong V. / VP of Sales" เสมอ ไม่เปลี่ยนตาม Rep ที่กำลังดู):
| Section | Metric/Chart |
|---|---|
| (บนสุด) | Target Achievement (KPI), This Month at a Glance — Label "Return Rate (CN)" ใน This Month at a Glance ใช้ **"CN%"** (สั้นลง) |
| My Priority Actions | Stores Needing Attention, AR By Due Date, Inactive Customers |
| Sales Snapshot | Daily Sales, Target vs Actual vs Diff |
| My Customers & Products | Top & Bottom Performing Stores, My Customer Group Mix, My Sales by Category |
| Credit Notes (CN) | CN Record (ตาราง Top 10 ต่อ Store เรียงตาม CN รวม 6 เดือน + ปุ่ม "See all N stores →" เมื่อมีมากกว่า 10, ดาวน์โหลดได้) — Mechanism อยู่ใน `renderCnTable()` (`tt-shared.js`, `CN_SEE_MORE_CAP = 10`) ปุ่มจะไม่ปรากฏถ้า Rep ที่ดูอยู่มีจำนวน Store ที่มี CN ในช่วง 6 เดือนไม่เกิน 10 (ไม่ใช่ Bug) |

**Sticky-scroll Ghosting Gotcha:** `.l2-mini-nav` (Sticky Nav ของ Anchor Pill, `position:sticky`, วางอยู่ระหว่าง Section KPI Hero กับ Section Credit Notes) มี `will-change:transform` (`tt-shared.css`) เพื่อบังคับให้ได้ Compositor Layer ของตัวเอง ป้องกัน Chromium Sticky-scroll Ghosting Bug Class (Content ที่เคย Paint ไว้ตรง Layer Boundary หลุดค้างซ้อนทับ Content ด้านล่าง เช่น KPI Card ไปทับ CN Record — เกิดจาก GPU Paint-timing ไม่ใช่ Bug ระดับ DOM/Application Logic, Intermittent ตาม Scroll Timing ไม่ใช่ตาม State ข้อมูล) — ถ้า Ghosting เกิดซ้ำอีกหลังมี Fix นี้แล้ว ให้พิจารณาเพิ่ม `contain:paint` ให้ `.card` ด้วย ไม่ใช่ไปหา Bug ใน Application Code

ทั้ง 3 ไฟล์ (Executive Summary, Breakdown, Sales Person) ไม่มี `<p class="subhead">` ใต้ H1 (ชื่อ Section/Card อธิบายตัวเองพออยู่แล้ว) — ไม่มี CSS Class `.subhead` ใน `tt-shared.css` (ECOM Overview ยังมี Pattern คล้ายกัน `.page-subtitle` อยู่ คนละ Scope กับ TT)

**Sales by Category (สไตล์เดียวกับ MT):** ทั้ง 3 จุด (Executive Summary's L1 card, Breakdown's L2 card ซึ่งเป็น Level Selector หลักที่ Sync กับ Category Portfolio Matrix/Category Share of Sales Over Time ด้วย, และ Sales Person's "My Sales by Category") มี Style/UX ตรงกับ MT Overview: Widget เป็น Toggle-group ปุ่ม (Category/Sub-Category/Type/Series) ไม่ใช่ `<select>` Dropdown, ตัวกราฟเป็น HTML Bar (`.cat-row`/`.cat-track`/`.cat-fill` Pattern เดียวกับ `shared.css`) ไม่ใช่ SVG Horizontal Bar —
- ฟังก์ชัน `renderCategoryBars(mount, opts)` ใน `tt-shared.js` ใช้แทน `renderHBarChart` เฉพาะจุดนี้ (`renderHBarChart` เองยังใช้กับ Sales by Region/High Return Rate Stores/ที่อื่นตามเดิม) — CSS Class ที่เพิ่มใน `tt-shared.css`: `.cat-row`/`.cat-label`/`.cat-track`/`.cat-fill`/`.cat-fill-label`/`.sub-label`/`.toggle-group`/`.toggle-btn` (Copy มาจาก `shared.css`)
- `renderCategoryTopView(win, opts)` (ใช้ร่วมกันโดย Executive Summary's L1 และ Breakdown's L2) รับ `opts.depth` ตรงๆ ไม่อ่านจาก DOM Select — State เก็บที่ `state.categoryLevel`/`state.overviewCategoryLevel` (Default 1) ของ Breakdown/Executive Summary ตามลำดับ ปุ่ม Toggle ในแต่ละไฟล์ตั้งค่า State ตัวนี้แล้วเรียก `render()` เดิม — Toggle ควบคุม Category Portfolio Matrix + Category Share of Sales Over Time พร้อมกัน (Single Point of Control ตาม §3.4)
- Sales Person's "My Sales by Category" ใช้ `spState.categoryLevel` (Field ใน `spState`, Default 1) เพราะหน้านี้ใช้ `renderSalesPersonPage()` ของตัวเอง ไม่ใช้ `render()`/`state` ร่วมกับอีก 2 หน้า
- HIDDEN STUBS ในแต่ละไฟล์ (Element เปล่าซ่อนไว้เพื่อให้ `render()` ที่ใช้ร่วมกันไม่ Error เวลาอ่าน Element ของอีกหน้า) ไม่มี `<select>` Stub อีกแล้ว (เช่น `categoryLevelSelect`/`overviewCategoryLevelSelect`) — `<div>` Stub ของ Chart/Table ยังอยู่ (`renderCategoryBars` เขียนลง Div นั้น)
- Sub-label ที่แสดงใต้ชื่อ Node ใช้ Field `sublabel` เดิมของ `renderCategoryTopView` (Ancestor Chain เต็ม เช่น "Skin Care › Facial Care" ที่ Series Level) — **ไม่เหมือน MT ที่เหลือแค่ Immediate Parent** เพราะ Field นี้ใช้ร่วมกับ Portfolio Matrix/Product Ranking อื่นด้วย

### 5.5 ECOM Overview

Ecom มี **4 Platform เท่านั้น** — Lazada, Shopee, TikTok, **Line Shop** — `channelDefs` (Part 1) มี `LineShop` เป็น Entry สุดท้ายของกลุ่ม Ecom (ต่อจาก TikTok, เพื่อไม่กระทบลำดับ `rand()` ของ MT/TT/Lazada/Shopee/TikTok ที่ประมวลผลก่อนหน้า) — ต้องแก้ Array นี้พร้อมกันในทุกไฟล์ที่ก็อบปี้แบบ byte-for-byte: `sales_overview.html`, `sales_overview_product_analysis.html`, `module_mt_executive_summary.html`, `module_mt_breakdown.html`, `module_ecom_executive_summary.html`, `module_ecom_breakdown.html`, `pnl_executive_summary.html` (7 ไฟล์รวม Master — เดิม 8 ไฟล์รวม `pnl_breakdown.html` ด้วย แต่ไฟล์นั้นถูกลบไปแล้วหลังยุบเข้า `pnl_executive_summary.html`, ดู §5.6) — Base ของ Lazada/Shopee/TikTok คือ 1.8M/1.55M/850K, Line Shop 400K (Ecom Total ≈ 4.6M) — Label แสดงผลใช้ **"TikTok"** (ไม่ใช่ "TikTok Shop") ทุกจุด — CSS Var `--lineshop:#4C8C5C` ใน `shared.css` คู่กับ `--lazada`/`--shopee`/`--tiktok` (Documentation Token เท่านั้น ไม่มีที่ไหน Reference ผ่าน `var()` จริง)

**Executive Summary** (4 KPI Card — ตามหลักการเดียวกับ MT/TT คือไม่มีการ์ด Growth YoY/Growth MoM แยกต่างหาก เพราะซ้ำกับแถว MoM/YoY ในการ์ด Net Sales/Target Attainment): Net Sales (Ecom), Target Attainment %, Return/Cancellation Rate, AOV (Average Order Value) · Revenue Trend, Monthly YoY Growth % (Chart) · Sales by Platform (Donut — Lazada/Shopee/TikTok/Line Shop, สีตรงกับ `--lazada`/`--shopee`/`--tiktok`/`--lineshop` ใน `shared.css`) · Sales by Category (มี Product Level Toggle ครบ 4 ระดับ) — **ไม่มี Conversion Rate และไม่มี Active Shop Listings** (Ecom ไม่มีแนวคิด "หลาย Shop ต่อ Platform" ที่จะวัด Listings ได้ และ Conversion Rate ไม่มีความหมายเชิงวิเคราะห์เพิ่มจาก AOV ที่มีอยู่แล้ว) — ไม่มี `ecomConvSeries`/`ecomShopListingsSeries`/`convIndex`

`ecomPlatformStats` (Copy ไว้ทั้งใน Executive Summary และ Breakdown) มีโครงสร้าง **`{aovIndex, cancelFactor}`** (ตัวคูณ, Weighted-average ≈1.0 ข้าม 4 Platform ไม่ใช่ตัวเลขสัมบูรณ์คงที่) — เหตุผลอยู่ที่ Breakdown ด้านล่าง (Period-sensitivity)

มี `<nav class="section-nav">` (Executive Summary / Trends & Mix) ตรงกับ Pattern ที่ MT ("Executive Summary | Key Account Portfolio") และ TT ("Executive Summary | Trends & Mix") มี — `id="sec-exec-summary"` บน `.section-label` ของ KPI Zone และ `id="sec-trends-mix"` ก่อน Chart-grid ของ Revenue Trend/Monthly YoY Growth% — ใช้ชื่อ "Trends & Mix" เหมือน TT (ไม่ใช่ "Key Account Portfolio" แบบ MT) เพราะ ECOM ไม่มี Entity "Partner/Key Account" (มีแค่ Platform) เนื้อหาโซนนี้ (Revenue Trend, Monthly YoY Growth%, Sales by Platform, Sales by Category, Net Sales: Last Year vs This Year vs Target, Platform Growth Contribution) ใกล้เคียงกับที่ TT จัดไว้ใต้ "Trends & Mix" — ไฟล์นี้ใช้ `shared.css`/`shared.js` อยู่แล้ว จึงมี `.section-nav` โดยตรง ไม่ต้อง Port ข้าม Engine เหมือน TT

การ์ด **"Net Sales: Last Year vs This Year vs Target"** ใน Executive Summary — Grouped Bar 3 แท่งต่อ Platform (Last Year / This Year / Target), Pattern เดียวกับการ์ดชื่อเดียวกันใน `sales_overview.html` (มิติเปลี่ยนจาก MT/TT/Ecom เป็น 4 Platform ของ Ecom) — ใช้ `ecomChannels[i].actual`/`.target` จริงตาม Period Filter ที่เลือก (`sumRange` เทียบช่วงปีก่อนหน้าแบบเดียวกับ Platform Growth Contribution Waterfall) — Value Label ต่อแท่งปรับ Responsive ตาม Bar Width (`buildGroupedBarSVG`'s `valueLabelFormatter`): แท่งกว้างพอโชว์ครบ (฿Value + Growth YoY/Attainment %+Diff from Target), แท่งแคบ (<28px, เกิดขึ้นได้เมื่อมี 4 Platform ในความกว้างการ์ดมาตรฐาน) โชว์แค่ Growth YoY บนแท่ง This Year เพื่อไม่ให้ Label ทับกัน — มีปุ่ม Toolbar ครบ (Table View/Download SVG/Expand) ตาราง Column: Platform, Last Year, This Year, Growth YoY, Target, Attainment %, Diff from Target — ตำแหน่งการ์ดอยู่**เหนือ Platform Growth Contribution** (หลัง Sales by Platform/Sales by Category) เพราะทั้งคู่เล่าเรื่อง "This Year vs Last Year ต่อ Platform" คนละมุมมองแต่ใกล้เคียงกัน (Bar เทียบ Value ตรงๆ vs Waterfall เทียบ Contribution สะสม)

**Breakdown:**

**Charmiss มี 1 Shop (หน้าร้านทางการ) ต่อ Platform เท่านั้น ไม่ใช่หลาย Shop ภายใน Platform เดียว** — ไม่มี Entity "Shop" ระดับย่อยกว่า Platform ในโมเดลนี้ (ไม่มี `shops[]`/`PLATFORM_GROUPS`/`basesSum` — เดิมมี Mock Entity ปลอมชื่อ "Shop" ที่ไม่มี Target จริงรองรับให้คำนวณ Attainment ได้จริง จึงถูกตัดออกทั้งหมด)

| Section | Metric/Chart | หมายเหตุ |
|---|---|---|
| Portfolio Quality | Target vs Actual (ด้านบนสุด — Bullet-bar รายเดือน Company-wide Ecom, Pattern เดียวกับ MT Breakdown's "Target vs Actual") | ใช้ `groupActual.Ecom`/`groupTarget.Ecom` (ตัวเลขเดียวกับ Sales Overview ทุกประการ) — ไม่ Scope ตาม Filter ด้านบน |
| Portfolio Quality | Return/Cancellation Rate Trend (รายเดือน, เส้นประ Threshold 8%) จับคู่กับ **Return/Cancellation Rate by Platform** | Return/Cancellation by Platform = Ecom-wide Period Average (จริง, จาก `ecomCancelRate`) × `cancelFactor` ต่อ Platform — ใช้ `.cat-bars`/`.cat-ref-line` Pattern เดียวกับ MT's "High Return Rate Partner" (เส้นประ Threshold ในแนวนอนของแท่ง + ตัวเลขฝังในแท่งสี ไม่ใช่ SVG Bar Chart แยก `buildHBarCompareSVG`) เพื่อให้ 2 Channel หน้าตาเหมือนกัน |
| **ไม่มี Section "Shop Performance"** | ไม่มี Active Shop Listings, Shop Concentration, Target vs Actual per Shop, Top 5 / Bottom 5 Shops by Revenue | ตั้งอยู่บน Entity "Shop" ปลอม ไม่มี Entity จริงรองรับ |
| **Platform Performance** (แทนที่ "Shop Performance") | Monthly Sales by Platform (Full-width Trend Line 36 เดือน, 4 เส้นจริงจาก `ecomChannels[i].actual`) | Real Time Series ต่อ Platform (ไม่ใช่สัดส่วนคงที่ของยอดรวม) มีแค่ 4 เส้นจึงไม่ต้อง Dim เส้นแบบ MT's 9-Partner Version |
| Platform Performance | Target vs Actual per Platform จับคู่กับ **YoY Growth by Platform** | Pattern เดียวกับ MT's "Target vs Actual per Partner / YoY Growth by Partner" — ทั้งคู่เรียงลำดับตามยอดขายเดียวกัน (`platformsRanked`, Sort ครั้งเดียวใช้ร่วมกันทุกกราฟ "by Platform" ในโซนนี้) |
| Platform Performance | **Sales by Platform** จับคู่กับ **Platform Portfolio Matrix** | Sales by Platform = Ranked Bar เหมือน MT's "Sales by Partner" (4 แถวเท่านั้น ไม่ต้อง Cap Top-N) — Platform Portfolio Matrix = Adapted BCG Matrix เหมือน Category/Partner Portfolio Matrix (X=ยอดขาย, Y=Growth YoY, ใช้ค่าเดียวกับ YoY Growth by Platform ด้านบนเพื่อความสอดคล้อง) — Sales by Platform ใช้ Class `.card-vcenter-fill` (`shared.css`, Opt-in เฉพาะการ์ดนี้ ไม่แก้ `.card` รวมทั้งระบบเพราะเปลี่ยน Margin-collapse Behavior ของทุกการ์ดในระบบ) ทำให้ `.cat-bars` ขยายเต็มพื้นที่ที่เหลือแล้ว Center แนวตั้ง (ป้องกันแถวสั้นๆ กระจุกบนสุดเหลือพื้นที่ว่างล่างการ์ด เมื่อ CSS Grid ยืดการ์ดให้สูงเท่า Platform Portfolio Matrix) |
| Platform Performance | Platform Share of Sales Over Time จับคู่กับ **AOV by Platform** | ไม่มี Conversion Rate by Platform (เหตุผลเดียวกับ Executive Summary ด้านบน) |
| Product Coverage | Sales by Category, Category Share of Sales Over Time, Platform × Category | Sales by Category มี Product Level Toggle (Category/Sub-Category/Type/Series, `CATEGORY_TREE`/`enumerateEcomCatLevel()` Copy มาจาก Executive Summary) — Category Share of Sales Over Time และ Platform × Category Sync ตาม Level เดียวกัน (Pattern เดียวกับ MT's Sales by Category/Category Share/Partner × Category) — Category Share of Sales Over Time ใช้ `buildStreamAreaSVG` + ค่า ฿ จริงจาก `groupActual.Ecom` (ไม่ใช่ `buildStackedAreaSVG` + Static % เพราะ Static % ไม่มีทางแทน Node ที่ระดับลึกกว่า Category ได้) — **Category Portfolio Matrix ไม่ Sync** ยังคงอยู่ที่ระดับ Category เสมอ (เหมือน MT — Mock Growth% มีแค่ระดับ Category เท่านั้น) |
| Product Coverage | **Platform × Category** (ล่างสุด, ไม่มี Top 5/Bottom 5 SKU by Revenue) | ไม่มี `skus[]`/`SKU_COUNT` Mock Data — แทนด้วย Heatmap Cross-tab แถว=4 Platform × คอลัมน์=Top 8 Node ตาม Level ที่เลือก (เหมือน MT's Cap, ไม่ Fix 6 Category เสมอ) — Pattern เดียวกับ MT Breakdown's "Partner × Category" แต่สลับแถวจาก Key Account เป็น Platform (Ecom ไม่มี Entity "Partner") |

มี `<nav class="section-nav">` (Portfolio Quality / Platform Performance / Product Coverage) ตรงกับ MT Breakdown — Page Subtitle ใช้ **"platform-level"** (ไม่มีคำว่า "shop-level" เพราะไม่มี Entity นั้นในระบบ)

Filter Bar ของ Breakdown: Period, Category (ปัจจุบันใช้งานได้แค่ "All Categories" เหมือน MT/TT) — **ไม่มี Filter รายบุคคล** (ไม่มี Platform Owner selector หรือ "My platforms only") เพราะ Ecom ไม่มีแนวคิด Owner ต่อ Platform ที่ชัดเจนพอ ทุก Zone ของ ECOM Breakdown จึงเป็น Company-wide Ecom เสมอ ต่างจาก MT (KAM scope เฉพาะ Zone "Partner Performance") และ TT (Sales Rep scope เฉพาะ Zone "Team Performance")

Metric ที่ไม่มีใน MT/TT: ไม่มี AR% (ลูกค้าจ่ายผ่าน Platform โดยตรง ไม่มี Ledger ลูกหนี้แบบ MT/TT), ใช้ Return/Cancellation Rate แทน Return Rate (CN) เดี่ยวๆ, เพิ่ม AOV ทั้งใน Executive Summary (Company-wide) และ Breakdown (แยกตาม Platform, Period-sensitive) — **ไม่มี Conversion Rate ในระบบ** (ไม่มีความหมายเชิงวิเคราะห์เพิ่มจาก AOV ที่มีอยู่แล้ว) — ไม่มี Ads Spend ROI ในระบบ

**Platform คือหน่วยวิเคราะห์เดียวที่ถูกต้องสำหรับ Ecom** — ไม่มีแนวคิด "Shop ระดับ Breakdown" ทั้ง Executive Summary และ Breakdown ใช้ `ecomChannels` (4 Platform) ชุดเดียวกันตลอด ไม่มี Entity ย่อยกว่านั้น

### 5.6 Financial Statement

Module Company-wide คู่ขนานกับ Sales Overview (ไม่ใช่ Channel Module แบบ MT/TT/ECOM) — เดิมชื่อ "P&L Overview" (5 ไฟล์แยก: Executive Summary/Quarterly Trend/Breakdown/Cost Structure/Balance Sheet) ผ่านการปรับโครงสร้างรอบใหญ่ ("Financial Statement restructure") รวมเป็น **5 แท็บ ภายใต้ชื่อ Module "Financial Statement"**: **Financial Analysis → P&L → Cash Flow → Balance Sheet → Equity Changes** — คนละไฟล์ต่อแท็บเหมือนเดิม แต่เนื้อหาภายในแท็บ P&L เองรวม Executive Summary/Quarterly Trend/Breakdown/Cost Structure เดิมทั้งหมดเป็น **3 Pill เดียว** ในไฟล์เดียว (ไม่มี `pnl_quarterly_trend.html`/`pnl_breakdown.html`/`pnl_cost_structure.html` อีกต่อไป) ส่วน Balance Sheet เดิมที่เคยเป็น Section ย่อยของ P&L ถูกยกขึ้นเป็นแท็บเต็มของตัวเอง พร้อมแท็บใหม่ 2 แท็บที่ไม่มีมาก่อน (Cash Flow, Equity Changes) — ปิด Gap "ไม่มีมิติกำไร/Margin/Cash/Equity" ที่พบใน `Charmiss_Dashboard_Review_2026-07-31.md`

**ไม่มี Separate vs Consolidated P&L** (Charmiss ไม่มีบริษัทลูก — ทุกหน้าใช้ P&L ชุดเดียว) และ**ไม่มี Forward-looking Disclaimer** แบบ SET (Dashboard ภายใน ไม่ใช่เอกสารเผยแพร่นักลงทุน)

#### 5.6.0 Filter Bar Model (ใช้ร่วมกันทั้ง 5 แท็บ)

ทุกแท็บใช้ Filter Bar เดียวกัน **VIEW BY + AS OF** (แทน PERIOD Range Dropdown แบบเดิม) — VIEW BY เลือกความละเอียดของงวด, AS OF เลือก "งวดล่าสุด" ที่กราฟ/ตารางจะแสดงจนถึงจุดนั้น (Anchor-based Window, ไม่ใช่ช่วงวันที่กว้างแบบเดิม):

- **Monthly** — มีแค่แท็บ **P&L** เท่านั้น (แท็บอื่นไม่ Track ข้อมูลราย Month) — Rolling 13 เดือน
- **Quarterly** — ทุกแท็บมี, ค่า Default — Financial Analysis/Cash Flow/Equity Changes/Balance Sheet แสดง 5 ไตรมาสล่าสุด (จบที่ AS OF, Clip ที่ต้นข้อมูลถ้า Anchor เก่ากว่านั้น)
- **Annual** — ทุกแท็บมี — FY2024/FY2025/2026 (Current) — ปีปัจจุบันไม่ Style แบบ Dashed/Hollow **ยกเว้น Balance Sheet** ที่ไม่มี Partial Styling เลยแม้แต่ Quarter/Year ปัจจุบัน (เพราะ Balance Sheet เป็น Snapshot ที่สมบูรณ์เสมอ ณ วันที่นั้น ไม่ใช่ยอดสะสมที่ "ยังไม่จบงวด" แบบ Flow Statement — ดู 5.6.4)

**AS OF Anchor คุมหน้าต่างข้อมูล (Windowing):** Quarterly = Trailing สูงสุด 5 ไตรมาสจบที่ Anchor (Clip ที่ต้นข้อมูลถ้า Anchor อยู่ใกล้ต้น) — Annual = FY ที่เลือกและก่อนหน้าจนถึง FY2024 (เลือก FY2025 → เห็น FY2024+FY2025 2 แท่ง, เลือก "2026 (Current)" → เห็นครบ 3 แท่ง) — AS OF Dropdown ไม่เสนอ Option ที่ไม่มี "งวดก่อนหน้า" ให้เทียบ (เช่น Balance Sheet ไม่เสนอ FY2024 เป็น Annual Anchor เพราะไม่มี FY2023 มาเทียบ Δ/%Change ในตาราง Detail ได้)

#### 5.6.1 Chart-first + Collapsible SSOT Table (Pattern ใช้ร่วมกันหลายแท็บ)

P&L/Cash Flow/Balance Sheet/Equity Changes ทั้ง 4 แท็บ (ยกเว้น Financial Analysis) ใช้ Layout เดียวกัน: **กราฟ/Waterfall นำหน้าเป็น Hero** (ไม่ใช่ตาราง) → Insight/Callout (ถ้ามี) → **ตาราง Detail แบบ Exact Number พับเป็น Reference ท้ายสุด** ปุ่ม "Show detailed [ชื่อ]" (SVG ไอคอนตาราง + ข้อความ, Toggle เปลี่ยนเป็น "Hide detailed...") ใช้ Class `.reference-section`/`.reference-table-wrap` (Local `<style>` 3 บรรทัดต่อไฟล์ ไม่ได้อยู่ใน `shared.css` เพราะเป็น Pattern เฉพาะกลุ่มไฟล์นี้) — ตารางยังเป็น Single Source of Truth ที่กราฟด้านบนอ่านเลขมาจากตัวแปรชุดเดียวกันเป๊ะ แค่ไม่ใช่ตัวที่นำหน้าอีกต่อไป

#### 5.6.2 Financial Analysis (`pnl_financial_analysis.html`) — 3 Pill

| Pill | Metric/Chart |
|---|---|
| Financial Scorecard | DuPont ROE Decomposition (3-Step: ROE = Profit Margin × Asset Turnover × Financial Leverage, Average Balances) — Title **ไม่มี Suffix งวด** ต่อท้าย (AS OF บอกอยู่แล้ว) — ไม่มีปุ่ม Toolbar เลย (ยกเว้นปุ่ม "ดู DuPont ROE Tree แบบละเอียด" เปิด Modal แยก) |
| Financial Ratios | Returns Trend, Liquidity Trend, Leverage Trend — ทุกกราฟมีปุ่มมาตรฐานครบ 3 ปุ่ม (ตาราง/ดาวน์โหลด/ขยาย) |
| **Cash Conversion Cycle** (เดิมชื่อ "Cash Cycle" — เปลี่ยนให้ตรงกันทั้ง Pill Nav/Section Label/Footnote Text) | Cash Conversion Cycle Timeline (Bridge Chart), CCC Combined Table — Title กราฟไม่มี Suffix งวดต่อท้ายเช่นกัน |

**ยืนยันคงไว้ในแท็บนี้ (ไม่ย้ายไป Balance Sheet):** Liquidity Trend และ Leverage Trend อยู่ที่ Financial Analysis เท่านั้น — Balance Sheet ไม่มีกราฟ Ratio Trend ของตัวเอง เก็บแค่ Asset/Liabilities & Equity Breakdown

#### 5.6.3 P&L (`pnl_executive_summary.html`) — 3 Pill (เดิม 7 Pill, ยุบเหลือ 3 ผ่านการปรับโครงสร้างหลายรอบ)

| Pill | Metric/Chart |
|---|---|
| **Income Statement** (เดิมแยก "Overview" กับ "Income Statement/Margins" 2 Heading — รวมเป็น Heading เดียวตามคำขอ) | P&L Waterfall (Net Sales → COGS → Gross Profit → Selling & Distribution → SG&A → EBIT → Tax → Net Profit) · **6-Gauge Row** เรียงตาม Waterfall ซ้าย→ขวา: Cost of Sales-to-Sales % → Gross Margin % → SG&A-to-Sales % → EBIT Margin % → EBITDA Margin % (Est.) → Net Margin % — Gauge ต้นทุน (Cost of Sales, SG&A) RAG **สลับทิศ** เทียบ Margin Gauge (เขียว=ค่าต่ำ, แดง=ค่าสูง) — Scale ปลาย Gauge Round เป็นจำนวนเต็ม (ไม่มีทศนิยม) |
| Performance (เดิมชื่อ "Trend") | 2×2 Grid: Revenue by Channel, Gross Profit Margin by Channel, EBITDA (Est.), Net Profit — ทุกการ์ดมี QoQ/YoY Badge บนแท่ง/จุดล่าสุด |
| **Expense Breakdown** (เดิมชื่อ "Cost") | Cost Ratio Strip (5 Ratio: OPEX/Trade Spend/Logistics/Marketing/SG&A-to-Sales %) · **Total Cost Trend** (ยุบจาก 5 แถบเหลือ **3 แถบ**: COGS/**Selling & Distribution** (=Trade Spend+Logistics+Marketing รวมกัน)/SG&A, Stacked Area 18 เดือนล่าสุด Company-wide ไม่ผูก Filter) · **Cost-to-Sales by Channel** (เดิมชื่อ "Cost Structure by Channel" — เปลี่ยนจาก 100%-Stacked เป็น Expense-only ตัด Tax/Net Profit ออก แท่งไม่เต็ม 100% อีกต่อไป ความสูงแท่ง = Total Cost % ของยอดขาย Channel นั้น ยิ่งเตี้ยยิ่งคุ้ม, คง Column "Total" ไว้, Segment คง Granular COGS/Trade Spend/Logistics/Marketing/SG&A) · Selling Expense Breakdown, Administration Expense Breakdown (Stacked Bar + Ratio Line, 5 ไตรมาส) |

**ตัดออกทั้งหมดจาก P&L รอบนี้ (เทียบ Spec เดิม):** Pill "Profit Drivers" ทั้ง Pill (เดิมมี Sub-section "By Category"/"By Channel" — By Category ตัดก่อน แล้วตัด Pill ทั้งอันตามคำขอถัดมาเมื่อเหลือแค่ By Channel), Cost Ratio Strip แบบเดิม 5 Gauge (ยุบเป็น Strip แล้วยุบเข้า 6-Gauge Row ข้างบนแทน), Growth Rate Pill (ย้ายไป Financial Analysis ก่อน สุดท้ายตัดทิ้งทั้ง Pill — Mock Data Growth ยังเก็บไว้ในโค้ดแม้ไม่ Render ที่ไหน)

**สีมาตรฐาน (Total Cost Trend ↔ Cost-to-Sales by Channel):** COGS = เทา (`--baseline`) เหมือนกันทั้ง 2 กราฟ, SG&A = ส้ม (`--cat-4`) เหมือนกันทั้ง 2 กราฟ, "Selling & Distribution" (Total Cost Trend) = เขียวกลาง (`--cat-2`) → ใน Cost-to-Sales by Channel แตก Trade Spend/Logistics/Marketing เป็น**เฉดเขียว 3 ระดับ**ของสีเดียวกัน (`--cat-2-dark`/`--cat-2`/`--cat-2-light`, เพิ่มใหม่ใน `shared.css`) แทนสีน้ำเงิน/เขียว/ม่วงเดิมที่ไม่สัมพันธ์กัน — สื่อว่าเป็นก้อนเขียวเดียวกันที่แตกย่อย ลำดับ Segment เรียงเหมือนกันทั้ง 2 กราฟ (COGS→Green family→SG&A)

**EBITDA Scaffold:** `DA_RATE_OF_SALES = 0.030` (D&A = 3% ของ Net Sales) แล้ว EBITDA = Net Profit + D&A — ทุกจุดที่โชว์ EBITDA/D&A มี Badge "(Est.)" กำกับเสมอ (Badge เท่านั้นที่คงไว้ — ตัด Footnote อธิบายยาวๆ ทิ้งทั้ง Module ตาม 5.6.5) รอ Finance ยืนยันตัวเลขจริง

**ทำไมไม่มี "Revenue" Sub-module ใน P&L:** Sales Overview ครอบคลุม Revenue Breakdown อยู่แล้วอย่างละเอียด — ถ้า P&L ต้องอ้างอิง Revenue Breakdown ให้ลิงก์ไปที่ Sales Overview แทนสร้างกราฟซ้ำ

#### 5.6.4 Cash Flow (`pnl_cash_flow.html`) — 2 Section, Chart-first

Cash Flow Waterfall (Beginning → CFO → CFI → CFF → Ending) → **CFO & Free Cash Flow** (Title ตัด Suffix "(5Q)" ทิ้งแล้ว — งวดสื่อผ่านแกน X/View By พอ) → ตาราง "Cash Flow Statement (Indirect Method)" พับท้ายสุดตาม Pattern 5.6.1 — Ending Cash ผูกกับ Balance Sheet's Cash & Cash Equivalents ที่ Anchor เดียวกันเป๊ะ (ดู 5.6.7 เรื่อง Reconciliation Scope)

#### 5.6.5 Balance Sheet (`pnl_balance_sheet.html`) — Chart-first + Multi-period, 100% Mock Data

ปรับโครงสร้างรอบใหญ่ที่สุดใน 5 แท็บ — เดิมเป็น 2-Quarter Snapshot Comparison (Q1'26 vs Q2'26) ตอนนี้เป็น **Multi-period ผูก View By**:
- **Quarterly** → สูงสุด 5 ไตรมาสจบที่ AS OF (Q2'25→Q2'26 เป็น Default)
- **Annual** → FY2024/FY2025/"2026 (Current)" — ปีปัจจุบันแค่หมายความว่า "Snapshot ล่าสุดที่มี" ไม่ใช่ตัวเลข YTD/Partial แบบ Flow Statement

Asset Breakdown + Liabilities & Equity Breakdown (Stacked Bar Multi-period, ทั้งคู่มี Total Label บนแท่งและ **QoQ/YoY Badge บนแท่งสุดท้าย** — Quarterly โชว์ทั้ง QoQ และ YoY ถ้ามี Baseline, Annual โชว้แค่ YoY) → ตาราง "Condensed Balance Sheet" (งวดที่เลือก + งวดก่อนหน้า, Δ/%Change) พับท้ายสุดตาม Pattern 5.6.1

**Part C — ไม่มี Partial/Dashed Styling เลย** (ต่างจากทุกแท็บอื่นในโมดูลนี้) เพราะ Balance Sheet เป็น "As-of Snapshot" — ทุกงวดสมบูรณ์เสมอ ณ วันที่นั้น ไม่มีแนวคิด "ยังไม่จบงวด" แบบ Net Sales/Net Profit ที่เป็นยอดสะสม — Total Assets = Total Liabilities + Equity เสมอทุกงวด (**Equity คำนวณเป็น Plug** ไม่ใช่สุ่มอิสระ เพื่อการันตีสมดุลบัญชีโดยโครงสร้าง)

**Backfill ขยายจาก 5 เป็น 7 ไตรมาส** (`BACK_STEPS = 5`, เพิ่ม Q4'24/Q1'25 นำหน้า Q2'25 เดิม) เพื่อให้ Annual View มี Q4'24 จริงสำหรับ FY2024 Bucket — Q2'25→Q2'26 (5 ไตรมาสเดิม) **เป็นตัวเลขเดิมทุกบิต** ไม่เปลี่ยน (สูตร Inverse-compound + Round-then-plug เดิมทุกอย่าง แค่มี Row ก่อนหน้าเพิ่ม 2 Row) — AS OF Dropdown (Quarterly) ยังเสนอแค่ 5 ไตรมาสที่ Selectable เดิม (Q2'25→Q2'26), Q4'24/Q1'25 มีไว้เป็น Backing Data สำหรับ Trailing Window Clip กับ Annual FY2024 Bucket เท่านั้น ไม่ใช่ Option ให้เลือกตรงๆ

#### 5.6.6 Equity Changes (`pnl_equity_changes.html`) — 3 Section, Chart-first

Equity Roll-Forward Waterfall (Opening → +Net Profit → −Dividends → Closing) → Equity & Retained Earnings Trend → **Dividends Paid & Payout Ratio** (ขยายจาก 4Q → **5Q** ให้ Window ตรงกับ Equity Trend ด้านบน — Q2'25 ไม่มี Retained Earnings งวดก่อนหน้าให้ Roll-forward จึงไม่มีข้อมูลจริง แสดงเป็น Bar "–" Placeholder แทนเลข ฿0 ปลอม, ต้องแก้ `buildComboBarLineSVG` ใน `shared.js` ให้รองรับ `null` ใน `bar.values` — เดิมรองรับแค่ `line.values`) → ตาราง "Statement of Changes in Equity (by component)" พับท้ายสุดตาม Pattern 5.6.1

#### 5.6.7 Reconciliation Scope — "Anchor-only" (สำคัญ, อ่านก่อนแก้ตัวเลข Mock)

Balance Sheet/Cash Flow/Equity Changes **ผูกตัวเลขกันแน่นแค่ที่ Anchor Q1'26/Q2'26** (Equity ตรงกัน 202M/209.9M เป๊ะ, Cash ตรงกัน 40M/45M เป๊ะ ทั้ง 3 แท็บ) — **ทุกไตรมาสก่อนหน้า Anchor (Q4'24-Q4'25) เป็น Illustrative Trend ที่แต่ละแท็บ Backfill เอง** ด้วย Growth Rate/สมมติฐานของตัวเอง (Balance Sheet ใช้ Inverse-compound ต่อ Category, Cash Flow/Equity Changes ใช้ Roll-forward ของตัวเอง) — **ไม่ได้ผูกกันแบบเป๊ะข้ามแท็บทุกไตรมาส** (เคยตรวจสอบจริงแล้วว่าตัวเลข Cash/Equity ที่ Q2'25-Q4'25 ต่างกันระหว่าง Balance Sheet vs Cash Flow/Equity Changes ~2-9%) — เป็นการตัดสินใจที่ยืนยันแล้ว (Option "Anchor-only reconciliation") แทนการแก้ตัวเลข Mock ของแท็บใดแท็บหนึ่งให้ตรงกันทุกไตรมาส เพราะจะขัดกับกฎ "ห้ามแก้ตัวเลข Mock ที่มีอยู่แล้ว" — **ห้ามสร้าง Footnote ใหม่มาอธิบายเรื่องนี้บนหน้าเว็บ** (Footnote แบบนี้ถูกตัดออกไปแล้วตาม 5.6.8 ทั้ง Module, เอกสารนี้คือที่เดียวที่บันทึกไว้)

#### 5.6.8 Closeout Rules — Footnote/Title/ปุ่ม (บังคับใช้ทั้ง 5 แท็บ)

**Footnote:** ตัด `.callout-text`/Insight Footnote แบบ "อธิบายวิธีคำนวณยาวๆ ใต้กราฟ" ออกทั้งหมดจาก Balance Sheet (Insight "Total Assets grew..." + Reconciliation Note), Cash Flow (ใต้ Waterfall + ใต้ CFO&FCF), Equity Changes (ใต้ Waterfall + OCI Note + Payout Note) — **เหลือแค่ Badge "(Est.)"** (ไม่ใช่ Footnote) สำหรับตัวเลขประมาณการ — คำอธิบายวิธีคำนวณเต็มยังอยู่ใน Information Icon (ⓘ) Popover ตามปกติ (§3.4) ไม่ได้ตัดทิ้ง

**Title:** ตัด Suffix จำนวนงวดแบบ "(5Q)"/"(4Q)" ออกจากทุกชื่อกราฟทั้ง Module (งวดสื่อผ่านแกน X/View By อยู่แล้ว) — ตัด Suffix งวดแบบ "(Q2'26)" ที่ Dynamic ตาม AS OF ออกจาก DuPont Scorecard, CCC Timeline, Equity Waterfall Title (AS OF Control บอกอยู่แล้วบน Filter Bar ไม่ต้องซ้ำใน Title) — ชื่อ "Cash Cycle" เปลี่ยนเป็น **"Cash Conversion Cycle"** ให้ตรงกันทั้ง Pill Nav/Section Label/Chart Title/Footnote Text ที่เหลือ

**ปุ่ม Toolbar มาตรฐาน:** กราฟข้อมูล + Waterfall ทุกอันต้องมีครบ 3 ปุ่ม (ดูเป็นตาราง/ดาวน์โหลด/ขยายเต็มจอ) — เพิ่มปุ่มที่ขาดให้ครบใน Selling/Admin Expense Breakdown (P&L, เดิมมีแค่ Download), Balance Sheet's Asset/Liabilities & Equity Breakdown (เดิมมีแค่ Download), Cash Flow Waterfall (เพิ่ม Table-toggle), Equity Roll-Forward Waterfall (เพิ่ม Table-toggle), Dividends Chart (เดิมไม่มีปุ่มเลย) — ตาราง Collapsible (Pattern 5.6.1) มีแค่ 2 ปุ่ม (ดาวน์โหลด/ขยาย ไม่มี Table-toggle เพราะตัวมันเองคือตารางอยู่แล้ว) — **KPI Gauge Row 1×6 และ DuPont Scorecard ไม่มีปุ่ม Toolbar เลย** (Exception ยืนยันแล้ว ไม่ต้องเพิ่ม)

Margin Model (สรุปจาก Spec — ดูรายละเอียดสูตรที่ `Charmiss_Module_PnL_Spec.md`): Effective Margin % = Category Base Margin % × Channel Adjustment Factor (MT ×0.90, TT ×1.00, Ecom ×0.93) — **ตัวเลขต้นทุน/กำไรทั้งหมดเป็นสมมติฐาน Mock ล้วนๆ ไม่ใช่ข้อมูลบัญชีจริง** ไม่มีระบบ COGS/Ledger จริงรองรับ — Net Sales ทุกตัวใน Module นี้อ้างอิง `groupActual`/`groupTarget` byte-for-byte จาก `sales_overview.html` เหมือนกับ MT/TT/ECOM ทุกประการ ไม่มีการสร้างยอดขายใหม่

หมายเหตุความครบถ้วนของ Category Share ต้นทาง: `mtCategoryShares` และ `ecomCategoryShares` เป็นการ copy byte-for-byte จากไฟล์ MT/ECOM Executive Summary ตามหลักการเดียวกับ Net Sales — ส่วน `ttCategoryShares` เป็นการสร้างขึ้นใหม่จากค่าที่สังเกตได้ใน Screenshot การ Review (TT source files ไม่ได้ถูกส่งมาให้ Build แต่แรก มีแต่ Screenshot) จึงไม่ใช่ byte-for-byte copy เหมือนอีก 2 Channel — ควรตรวจทานกับไฟล์ TT จริงถ้ามีในอนาคต

`buildScatterSVG` ใน `shared.js` มี Label-collision avoidance (8 ตำแหน่งผู้สมัคร) มีผลกับ Category Portfolio Matrix ของ MT Breakdown, ECOM Breakdown, และ Product Analysis (ไม่ใช่แค่ P&L) — วัดความกว้าง Label จริงด้วย `canvas.measureText()` (ฟังก์ชัน `measureTextWidth()`, เทียบ Font-size/weight/family เดียวกับ Label ที่จะ Render จริง, อ่าน `font-family` จาก `getComputedStyle(container)`) ไม่ใช่ประมาณจากจำนวนตัวอักษร (`length*3.15px`) เพราะค่าประมาณคงที่ไม่ตรงกับความกว้าง Real Glyph ที่ Render จริง (ต่างกันได้ตาม Font ที่ระบบ User แต่ละคน Substitute ให้ `font-family` Stack ของหน้า) — กล่องที่ใช้คำนวณ Collision จึงตรงกับกล่องที่ถูก Draw จริงไม่ว่าระบบ Font จะเป็นแบบไหน

⚠️ **Gotcha: TT Overview — Breakdown's "Category Portfolio Matrix" ไม่ได้ใช้ `buildScatterSVG` ของ `shared.js`** — TT ทั้งไฟล์ใช้ Engine แยกของตัวเอง (`tt-shared.js`, ไม่ import `shared.js`, ดู §6.3) มีฟังก์ชัน Scatter ของตัวเองชื่อ `renderScatterMatrix` ที่ Port Algorithm เดียวกัน (8 ตำแหน่งผู้สมัคร + Real Bounding Box จาก `canvas.measureText()`) เข้ามาแยกต่างหาก ด้วย Helper `ttMeasureTextWidth()` ของตัวเอง (เพราะ TT ไม่มี Access ไปยัง `measureTextWidth()` ของ `shared.js`) รวมถึงลงทะเบียนกล่องของ Quadrant Watermark Label ทั้ง 4 มุมเป็น "จุดที่ถูกจองแล้ว" ก่อน Loop วาง Label จริง เพื่อไม่ให้ Label ทับ Watermark ด้วย — **บทเรียน:** เวลามี Component "ใช้ซ้ำหลายหน้า" ต้องเช็คก่อนว่าทุกหน้าเรียก Function เดียวกันจริงหรือไม่ ไม่ใช่แค่ดูว่า Feature หน้าตาเหมือนกัน — ถ้าแก้ `buildScatterSVG` แล้วต้องการผลเหมือนกันทั้งระบบ ต้องแก้ `renderScatterMatrix` คู่กันเสมอ (TT engine แยกจาก MT/ECOM/Sales Overview มาตั้งแต่แรก ดู §6.3)

---

## 6. File Dependency Map — ไฟล์ที่ต้องแนบเวลาแก้แต่ละ Module

ใช้ Section นี้เวลาจะเปิด Chat ใหม่เพื่อแก้เฉพาะ Module ใดๆ — บอกว่าไฟล์ไหน "ต้องมี" (โครงสร้าง/สไตล์ ขาดไม่ได้) และไฟล์ไหน "ต้องเช็คคู่กัน" (มีการ copy ข้อมูลบางส่วนแบบ byte-for-byte ข้ามไฟล์ ถ้าแก้ไฟล์หนึ่งแล้วลืมอีกไฟล์ ตัวเลขจะเพี้ยนไม่ตรงกันข้ามหน้า)

### 6.1 ไฟล์พื้นฐานที่ทุก Module ต้องมีเสมอ (Baseline)

ไม่ว่าจะแก้ Module ไหน ต้องแนบ 4 ไฟล์นี้คู่กันเสมอ เพราะทุกหน้า `<link>`/`<script>` ผูกกับไฟล์เหล่านี้หมด:

| ไฟล์ | หน้าที่ |
|---|---|
| `shared.css` | Design token, Card/KPI/Chart/Filter Bar styling ทั้งหมด — ใช้ร่วมกันทุกหน้า (ยกเว้น TT ที่แยก engine ของตัวเอง — ดู 6.3) **แก้ไฟล์นี้ = กระทบทุกหน้าที่ import พร้อมกัน** เหมือน `shared.js` ด้านล่าง — Class เสริมที่ควรรู้: `.legend-list` มี `max-width:300px` (reset `none` ที่ ≤768px) กัน Legend ยืดเต็มการ์ดจนดู "โหว่ตรงกลาง"; `.chart-tooltip`/`#sharedChartTooltip` = Tooltip กลางที่ `buildStreamAreaSVG` เรียกใช้ร่วมกันทุกจุด; `.card-vcenter-fill` (Opt-in ต่อการ์ด, ไม่ใช่ Default ของ `.card`) = `display:flex;flex-direction:column` + `.cat-bars{flex:1;justify-content:center}` แก้ปัญหาการ์ด `.cat-bars` แถวน้อย (เช่น ECOM's "Sales by Platform" 4 แถว) ที่ถูก Grid ยืดสูงเท่าการ์ดข้างๆแล้วเหลือช่องว่างล่างการ์ด — Opt-in เฉพาะการ์ดเพราะเปลี่ยน `.card` เป็น flex ทั้งระบบเสี่ยงกระทบ Margin-collapse ของการ์ดอื่นที่ไม่ได้ตรวจซ้ำ; ⚠️ **Breakpoint `@media (max-width:1200px)` ยุบ `.chart-grid` เป็น 1 คอลัมน์** — ถ้า Viewport ทดสอบอยู่พอดี 1200px จะเห็นการ์ดเรียงแนวตั้งแทนคู่กัน ไม่ใช่ Bug (เจอจริงตอนทดสอบ ECOM Breakdown รอบล่าสุด ต้องขยับ Viewport เป็น 1300+ ถึงเห็น 2 คอลัมน์จริง) |
| `shared.js` | ฟังก์ชันสร้างกราฟ/ตาราง/Sparkline ทั้งหมด (`buildLineChartSVG`, `buildDonutSVG`, `buildWaterfallSVG`, `buildScatterSVG`, `buildGroupedBarSVG`, `buildHBarCompareSVG`, `buildBulletBarSVG`, `buildStreamAreaSVG`, `buildParetoSVG`, `sparklineSVG`, ฯลฯ) รวมถึง Utility (`fmtTHB`, `mulberry32`, `sumRange`, `niceAxisTicks`, `measureTextWidth` ฯลฯ) — **แก้ไฟล์นี้ = กระทบทุกหน้าที่ import พร้อมกัน** ต้องเช็คทุกไฟล์หลังแก้ (`grep` ชื่อฟังก์ชันก่อนเริ่มแก้ — เคยต้องไล่เช็ค 6-7 ไฟล์ตอนแก้ `buildHBarCompareSVG`) — จุดที่ควรรู้ก่อนแก้ต่อ:
  - `buildScatterSVG` มี Label-collision avoidance จริง (8 ตำแหน่งผู้สมัคร เทียบ Real Bounding Box จาก `measureTextWidth()`/`canvas.measureText()`, ไม่ใช่แค่ประมาณจากจำนวนตัวอักษร) — **แต่ TT ไม่ผ่าน Path นี้เลย** เพราะ TT ใช้ Engine แยก (`tt-shared.js`'s `renderScatterMatrix`, มี Collision-avoidance ของตัวเองแยกต่างหาก, พอร์ตมาจาก Algorithm เดียวกัน) — แก้ `buildScatterSVG` แล้ว **ต้องแก้ `renderScatterMatrix` คู่กันเสมอ** ถ้าต้องการผลเหมือนกันทั้ง 4 หน้าที่มี Scatter Chart ประเภทนี้ (ดู §5.6 ท้ายสุดสำหรับ Root Cause เต็ม)
  - `buildHBarCompareSVG`/`buildGroupedBarSVG`/`buildWaterfallSVG`/`buildScatterSVG`/`buildParetoSVG` ทุกตัวใช้ `niceAxisTicks()` สร้างเลขแกนกลม + วัด Container จริงด้วย `clientWidth`/`clientHeight` เสมอ (ดูหลักการที่ §3.4 — "Chart Container Sizing"/"Axis Ticks")
  - `buildWaterfallSVG`'s `opts.rotateLabels` รับได้ทั้ง `true` (Default 35°) หรือมุมเป็นตัวเลข (เช่น `90` = แนวตั้งเต็ม) — **มุมบวกกวาด Label ขึ้นบน, มุมลบกวาดลง** (จำง่ายๆ: อย่าใส่ค่าลบ เว้นแต่ตั้งใจจะทับ Insight Callout ด้านล่างกราฟ) `padB` คำนวณจริงจาก `measureTextWidth()×sin(มุม)` ไม่ต้องเดาค่าคงที่
  - `buildLineChartSVG`'s X-label Skip Interval คำนวณจาก `plotW` จริงหาร Label-width ประมาณ (30px) — Responsive ตามความกว้าง Container จริง ไม่ใช่แค่จำนวน Label
  - `opts.opacity` (`buildLineChartSVG`), `opts.xAxisTitle` (`buildParetoSVG`), `opts.yAxisTitle` (`buildGroupedBarSVG`) เป็น Optional Field ทั้งหมด, Backward-compatible กับ Caller เดิม
  - `buildComboBarLineSVG`'s `bar.values` รองรับ `null`/`undefined` แล้ว (2026-08-12, เพิ่มให้ Equity Changes's Dividends Chart) — Render เป็น Label "–" ที่เส้น 0 แทนแท่ง ฿0 ปลอม เหมือน Pattern ที่ `line.values` รองรับ `null` อยู่แล้วเดิม (Backward-compatible, Caller เดิมไม่ส่ง `null` อยู่แล้วไม่กระทบ)
  - `buildStackedBarSVG`'s `opts.lastBarExtraLines` ใช้กับ Balance Sheet's Asset/Liabilities & Equity Breakdown สำหรับ QoQ/YoY Badge บนแท่งสุดท้าย (Pattern เดียวกับ P&L's Revenue by Channel) — ต้องมี `opts.showTotalLabels:true` คู่กันเสมอ (Extra Lines วาดต่อจาก Total Label)
  - `--cat-2-dark`/`--cat-2-light` (`shared.css`, 2026-08-12) = เฉดเขียว 3 ระดับรอบ `--cat-2` เดิม สำหรับ Chart ที่ต้องแตกก้อนสีเขียวเดียวเป็น Sub-component (P&L's Cost-to-Sales by Channel — ดู §5.6.3) — ยังไม่มี Dark-mode Override แยก (เหมือน `--cat-1`...`--cat-6` เดิมที่เป็น Theme-neutral Chart Color) |
| `nav-menu.css` | Style ของ Dropdown เมนู Nav บน Topbar |
| `nav-menu.js` | `MODULE_MAP` — กำหนดลำดับ/รายชื่อ Module ใน Nav Dropdown และในหน้า `index.html` (Directory listing) พร้อมกัน — แก้ไฟล์นี้กระทบทั้ง 2 จุดพร้อมกันเสมอ — มี Item `mt-store` (label "Store", href `module_mt_store.html`) ในกลุ่ม MT Overview — กลุ่ม "Financial Statement" มี 5 Item (`fs-analysis`/`pnl`/`fs-cashflow`/`pnl-balance`/`fs-equity`) ทุก Item มี Tab Link คู่กันใน `<nav class="tabs header-topbar-tabs">` ของทั้ง 5 ไฟล์ (ไม่ใช่แค่ใน `MODULE_MAP`) — **ไม่มี Item `pnl-cost`/"Cost Structure" อีกต่อไป** (ไฟล์ `pnl_cost_structure.html` ถูกลบไปตั้งแต่ยุบเข้า P&L, ดู §5.6) |

หมายเหตุ: `index.html` เป็นข้อยกเว้น ไม่ import `shared.js` (ไม่มีกราฟ/Mock data ในหน้านี้) ใช้แค่ `shared.css` + `nav-menu.css`/`nav-menu.js`

### 6.2 ต่อ Module — ไฟล์ HTML + Content Dependency (Byte-for-byte)

นอกจาก Baseline ด้านบน แต่ละ Module มี "ไฟล์ต้นทาง" ของ Mock data บางก้อนที่ถูก Copy แบบ byte-for-byte ไปใช้ในอีกไฟล์ — ถ้าจะแก้สูตร/ค่าพวกนี้ ต้องแก้พร้อมกันทั้งคู่ ไม่งั้นตัวเลขจะไม่ตรงกันข้ามหน้า (แพทเทิร์นนี้เจอ Bug จริงมาแล้วหลายจุดในเซสชันก่อนหน้า — ดู Review doc Task 1.4/2.2)

| Module / หน้า | ไฟล์ HTML | Content Dependency — ต้องเช็คคู่กับ | เอกสารอ้างอิง |
|---|---|---|---|
| Sales Overview → Executive Outlook | `sales_overview.html` | **เป็นไฟล์ต้นทาง (Master)** ของ Mock-data engine หลักทั้งระบบ — `mulberry32` seed, `channelDefs`, `genSeries()`, `groupActual`/`groupTarget`, `companyActual`/`companyTarget`, และ `mtCNRate`/`ttCNRate`/`ecomCancelRate` (Return/Cancellation Rate ต่อเดือน แยกอิสระต่อ Channel) ทุกไฟล์อื่นก็อบปี้ "Part 1" มาจากไฟล์นี้แบบ byte-for-byte — ถ้าแก้สูตรตรงนี้ ต้องไล่แก้ทุกไฟล์ในตารางนี้ ⚠️ **`mtCNRate`/`ttCNRate`/`ecomCancelRate` ต้องอยู่ตำแหน่ง rand()-sequence เดียวกันเป๊ะใน 5 ไฟล์**: `sales_overview.html`, `module_mt_executive_summary.html`, `module_mt_breakdown.html`, `module_ecom_executive_summary.html`, `module_ecom_breakdown.html` (2 ไฟล์ ECOM ไม่ได้ใช้ค่านี้จริง แต่ต้องคง Block เดิมไว้ตำแหน่งเดิมเพื่อรักษาลำดับ rand() ที่เหลือของไฟล์ให้ตรงกัน) — `channelDefs` มี Entry `LineShop` (Ecom Platform ที่ 4) เป็นตัวสุดท้ายของกลุ่ม Ecom ⚠️ **ต้องแก้ Array นี้เหมือนกันทุกตัวอักษรใน 8 ไฟล์**: ไฟล์นี้ + `sales_overview_product_analysis.html`, `module_mt_executive_summary.html`, `module_mt_breakdown.html`, `module_ecom_executive_summary.html`, `module_ecom_breakdown.html`, `pnl_executive_summary.html`, `pnl_breakdown.html` (ต้องแทรก Entry ใหม่ที่ตำแหน่งสุดท้ายของ Array เสมอ ไม่ใช่แทรกกลาง เพื่อไม่กระทบลำดับ `rand()` ของ MT/TT/Lazada/Shopee/TikTok ที่ GenSeries ประมวลผลไปก่อนแล้ว) | Spec §5.1, §5.5 |
| Sales Overview → Product Analysis | `sales_overview_product_analysis.html` | Part 1 = copy จาก `sales_overview.html` (`mulberry32` seed, `genSeries()`, `channelDefs`, `groupActual`/`companyActual` — เหมือนกันแบบ byte-for-byte จนถึงจุดที่ `companyActual` คำนวณเสร็จ) **แต่ไม่มี** `companyTarget`/`groupHref`/`mtCNRate`/`ttCNRate`/`ecomCancelRate` เพราะหน้านี้ไม่ใช้ค่าพวกนี้เลย — ไม่กระทบ rand()-sequence เพราะ Part 2 (`CATEGORY_TREE`) เป็นข้อมูล Hardcode ทั้งหมด ไม่มีการเรียก `rand()` เพิ่ม (ยกเว้น jitter เล็กน้อยใน Share Over Time ที่คำนวณทีหลังและไม่ผูกกับไฟล์อื่น) จึงไม่ต้องแก้ให้ตรงกับ Master แบบเป๊ะ ๆ; ใช้ `buildScatterSVG` (Category Portfolio Matrix), `buildWaterfallSVG` (Growth Contribution), `buildStacked100BarSVG` (Category Share Over Time), และ `buildParetoSVG` (Pareto / Concentration Analysis — ฟังก์ชันใหม่ใน `shared.js`, ปัจจุบันมีแค่ไฟล์นี้ไฟล์เดียวที่เรียกใช้) — `CATEGORY_TREE` มี Field `returnRate` (Mock, Static ต่อ Category) Inherit ผ่าน `enumerateLevel()` แบบเดียวกับ `growthYoY`/`channelMix` ใช้โดย Return/Cancellation Rate by Category chart | Spec §5.2 |
| MT → Executive Summary | `module_mt_executive_summary.html` | Part 1 = copy จาก `sales_overview.html` (รวม `mtCNRate`/`ttCNRate`/`ecomCancelRate` Block — ไฟล์นี้ใช้ `mtCNRate` จริงสำหรับ KPI "Return Rate (CN)"); **เป็นไฟล์ต้นทาง** ของ `mtCategoryShares`, `mtARSeries`, `mtPartnersSeries` (Part 2) — ⚠️ `mtARSeries`/`mtPartnersSeries` **ยังต้องคง Generation Block ไว้เหมือนเดิม** เพื่อรักษาลำดับ `rand()` ให้ตรงกับ `module_mt_breakdown.html` แม้ `mtARSeries` ไม่ถูกใช้แสดงผลที่ไหนใน 2 ไฟล์นี้ (เก็บไว้เพื่อ rand()-sequence เท่านั้น) — `mtPartnersSeries` ยังใช้จริงสำหรับ Active Partners KPI ใน Breakdown — มี `CATEGORY_TREE` (Byte-for-byte copy โครงสร้าง Sub/Type/Series จาก `sales_overview_product_analysis.html`, Hardcode ล้วนไม่เรียก `rand()`) สำหรับ Product Level Toggle ใน "Sales by Category" การ์ด — Category-level (Depth 0) อิงตัวเลข `mtCategoryShares` เดิม ระดับลึกกว่าคำนวณจากสัดส่วนภายใน `CATEGORY_TREE` เท่านั้น ไม่กระทบตัวเลข Category ที่ P&L Copy ไปใช้ — ไม่มี `mtRetentionSeries` (ไม่มีไฟล์อื่นเรียกใช้) — `keyAccounts`/`keyAccountColors`/`keyAccountStats` (Sales by Key Account, 9 คู่ค้า, มี `growthYoY` ต่อคู่ค้าสำหรับ Growth Contribution Waterfall) เป็นข้อมูล Hardcode — **เป็นไฟล์ต้นทาง** ของค่า `pct`/`attain`/`ret` ที่ `module_mt_breakdown.html`'s `partners` const Copy ไปใช้ (คนละราย ไม่ใช่ byte-for-byte rand() แต่เป็นตัวเลข Hardcode ที่ต้องตรงกัน — ดูแถว MT → Breakdown ด้านล่าง) — ใช้ `buildParetoSVG`/`buildWaterfallSVG`/`buildHBarCompareSVG` — ไม่มี `keyAccounts[i].storeCount`/`storeWeights` และไม่มี Section "Store Performance" ในไฟล์นี้ (อยู่ที่ `module_mt_store.html` ซึ่งมี Data Model ของตัวเอง ไม่ต้อง Sync กัน) | Spec §5.3 |
| MT → Breakdown | `module_mt_breakdown.html` | Part 1 = copy จาก `module_mt_executive_summary.html` (ไม่ใช่จาก sales_overview ตรงๆ, รวม `mtCNRate` Block ด้วย — ไม่ได้ใช้แสดง Return Rate (CN) แบบ MT-wide เดี่ยวๆ เก็บไว้เพื่อรักษาลำดับ `rand()` เท่านั้น ดู `partnerCNSeries` ด้านล่าง); `mtPartnersSeries` copy byte-for-byte จากไฟล์เดียวกัน — แก้ Active Partners ต้องแก้คู่ ⚠️ `partners` const (Partner Performance zone) ไม่ใช่ Mock อิสระ — ต้องมีชื่อ/`groupPct`(=`pct`)/`attainFactor`(=`attain`)/`cnRate`(=`ret`)/`growthYoY`(=`growthYoY`) ตรงกับ `keyAccounts`/`keyAccountStats` ของ `module_mt_executive_summary.html` ทุกราย (9 Key Account เดียวกันเป๊ะ ไม่มี Sub-partner layer) — ถ้าแก้ตัวเลข Key Account ฝั่ง Executive Summary ต้องแก้ไฟล์นี้ให้ตรงกันด้วยเสมอ — มี `partnerCNSeries` (Return Rate (CN) by Key Account) — Mock รายเดือนต่อคู่ค้า จำลอง Random Walk รอบค่า `cnRate` คงที่ของแต่ละราย เป็น Breakdown-only ไม่มีไฟล์อื่นอ้างอิง ไม่ต้อง Sync rand()-sequence กับที่ไหน — `growthYoY` เป็น Hardcode ล้วน (ไม่เรียก `rand()`) — มี `keyAccountColors` const (Byte-for-byte copy จาก `module_mt_executive_summary.html`, ลำดับเดียวกับ `partners`) + Helper `partnerColor(id)` สำหรับ Monthly Sales by Partner Trend Chart — ไม่มี `PARTNER_TABLE_CAP`/`partnersExpandOverride`, ไม่มี `KAM_NAMES`/`currentPartnerFilter()`/`kamFilterSelect`/`myAccountsOnly` (Field `kam` ใน `partners` ยังอยู่แต่ใช้แค่แสดงผล ไม่ Filter อะไร), ไม่มี `accountHealthOf()` หรือ Section Account Health — มี Constant `RETURN_RATE_CEILING_PCT` (=4.0) ใช้ร่วมกับ High Return Rate Partner + เส้นประ Threshold ของ Return Rate Trend, มีฟังก์ชัน `renderPartnerSeeMore()` (Cap+"See all" สำหรับ Target vs Actual/YoY Growth by Partner) | Spec §5.3, Review 1.4 |
| MT → Store | `module_mt_store.html` | Part 1 = **ย่อ**จาก `sales_overview.html`/`module_mt_executive_summary.html` — Copy เฉพาะ Channel Def `'MT'` ตัวเดียว (ไม่รวม TT/Lazada/Shopee/TikTok) เพราะ `genSeries()` ใช้ `rand()` แบบ Self-contained ต่อ Channel และ `'MT'` เป็น Channel แรกที่ประมวลผลในทุกไฟล์อื่นอยู่แล้ว จึงได้ `groupActual.MT`/`groupTarget.MT` ตรงกันแบบ byte-for-byte โดยไม่ต้อง Copy `mtCNRate`/`channelDefs` ที่เหลือมาด้วย (ไฟล์นี้ไม่ใช้ Return Rate เลย); `keyAccounts`/`keyAccountColors`/`keyAccountStats` copy byte-for-byte จาก `module_mt_executive_summary.html` (Hardcode ล้วน ต้องแก้พร้อมกันถ้าเปลี่ยนตัวเลข Key Account ที่ไหนก็ตาม) — `storeWeights` **ไม่ต้อง** Sync กับ Executive Summary (Part 2, rand()-derived, Aggregate เท่ากันเสมอเพราะ Sum=1 เสมอ) — **เป็นไฟล์ต้นทางเดียว**ของ `storeOpenedMonth`/`newStoreWeightShare`/**`monthlyWeights`** (ไม่มีไฟล์อื่นใช้) ใช้ `buildParetoSVG`/`buildLineChartSVG`/`buildGroupedBarSVG` (มีอยู่แล้วใน `shared.js`) + Local Helper ในไฟล์นี้เอง (`renderDumbbellRows()`, `computeStoreStability()`, `computeDynamicBuckets()`/`niceStep()`) — `storeCount` รวม 80 (ไม่กระทบ rand()-sequence เพราะ `storeWeights`/`storeOpenedMonth` Derive จากจำนวน rand() Draw ตามจำนวนสาขาจริง) — ไม่มีคอลัมน์ Attainment ใน Store Ranking Table ทั้งคู่ (ไม่มี `keyAccountStats`/`accountStats()` ในไฟล์นี้), Section เรียง Performance→Health→Ranking, ไม่มี `buildStacked100BarSVG` call (การ์ด Quartile ถูกลบ ฟังก์ชันเองยังอยู่ใน `shared.js` เพราะไฟล์อื่นอาจใช้ในอนาคต), Sales per Store Trend ใช้ Adaptive Tick Fix ของ `buildLineChartSVG` (`shared.js`) โดยอัตโนมัติ | Spec §5.3 |
| ECOM → Executive Summary | `module_ecom_executive_summary.html` | Part 1 = copy จาก `sales_overview.html` (รวม `mtCNRate`/`ttCNRate`/`ecomCancelRate` Block — ไฟล์นี้ **ไม่ได้ใช้ `mtCNRate`/`ttCNRate` จริง** แค่ต้องคง Block ไว้ตำแหน่งเดิมเพื่อรักษาลำดับ rand()); **เป็นไฟล์ต้นทาง** ของ `ecomCategoryShares`, `ecomAOVSeries`, `ecomPlatformStats`, `CATEGORY_TREE`/`enumerateEcomCatLevel()` (Part 2) — `channelDefs` (Part 1) มี `LineShop` เป็น Entry สุดท้ายของกลุ่ม Ecom (ต้องแก้พร้อมกับทุกไฟล์ใน §6.2 ที่ก็อบปี้ Array นี้ — ดู §5.5), `ecomPlatformStats` = `{aovIndex,cancelFactor}` — ไม่มี `ecomConvSeries`/`ecomShopListingsSeries`/`convIndex` (Conversion Rate/Active Shop Listings KPI ไม่มีในระบบ) | Spec §5.5 |
| ECOM → Breakdown | `module_ecom_breakdown.html` | Part 1 = copy จาก `module_ecom_executive_summary.html` (รวม `mtCNRate`/`ttCNRate`/`ecomCancelRate` Block เช่นเดียวกัน — ไม่ได้ใช้ `mtCNRate`/`ttCNRate` จริงเช่นกัน); copy byte-for-byte `ecomAOVSeries`/`ecomPlatformStats`/`CATEGORY_TREE`/`enumerateEcomCatLevel()` จากไฟล์เดียวกัน (Level ตัวนี้ยังขับ `enumeratePlatformCatShare(key, depth)` ของ Platform × Category ในไฟล์นี้ด้วย) — แก้ Active Shop Listings (Executive Summary)/`ecomPlatformStats` ต้องแก้คู่ — ไม่มี `shops[]`/`PLATFORM_GROUPS`/`basesSum`/`skus[]`/`SKU_COUNT`/`ecomConvSeries`/`ecomShopListingsSeries` (Breakdown-only Mock Data ไม่มี Cross-file Sync Requirement นอกจาก `ecomConvSeries`/`ecomShopListingsSeries` ที่ต้องลบพร้อมกับไฟล์ Executive Summary) — ดู §5.5 สำหรับรายละเอียด Section | Spec §5.5, Review 1.4/2.2 |
| TT → Executive Summary / Breakdown / Sales Person | `tt_executive_summary.html`, `tt_breakdown.html`, `tt_sales_person.html` + `tt-shared.css`/`tt-shared.js` (**แยก Engine ของตัวเอง ไม่ใช้ shared.css/shared.js ร่วมกับหน้าอื่น**) | `render()` ใน `tt-shared.js` ใช้ร่วมกันระหว่าง Executive Summary กับ Breakdown เท่านั้น (คำนวณ/เขียนผลลง DOM ของทั้ง 2 หน้าในรอบเดียว ตามคอมเมนต์หัวไฟล์) แต่ละไฟล์ต้องมี "HIDDEN STUBS" (Element เปล่า `display:none` ครอบทุก id ที่ `render()` เขียนถึงแต่ไม่ได้แสดงผลจริงบนหน้านั้น) ไม่งั้น `render()` จะ Error — `renderSalesPersonPage()` เป็นฟังก์ชันแยก ไม่ได้ใช้ร่วมกับอีก 2 หน้า, มี `spState` ของตัวเอง — มี `renderCategoryBars()` + Field `state.categoryLevel`/`state.overviewCategoryLevel`/`spState.categoryLevel` — ดู §5.4 | Spec §5.4 |
| Financial Statement → P&L | `pnl_executive_summary.html` | Part 1 = copy จาก `sales_overview.html`; Part 2 ใช้ `mtCategoryShares`/`ecomCategoryShares` (copy จาก MT/ECOM Executive Summary) + `ttCategoryShares` (⚠️ สร้างขึ้นเองจาก Screenshot ใน Review doc ไม่ใช่ byte-for-byte เพราะไม่มีไฟล์ TT จริง) — **Income Statement Waterfall** reuse ตัวแปร Sum ชุดเดียวกับ Income Statement Pill ตรงๆ ไม่คำนวณซ้ำ — ไฟล์เดียวรวม 3 Pill (Income Statement/Performance/Expense Breakdown, เดิมแยก 3 ไฟล์ `pnl_executive_summary.html`/`pnl_breakdown.html`/`pnl_cost_structure.html` — 2 ไฟล์หลังถูกลบไปแล้ว, เนื้อหารวมเข้าไฟล์นี้ไฟล์เดียว) — Multi-script-block ต่อ Pill (คนละ `<script>` Tag ต่อ Pill ยังคงไว้จากยุคที่เคยเป็นไฟล์แยก แต่รวมอยู่ใน HTML เดียวกันแล้ว — ถ้าจะแก้ตัวแปร/ฟังก์ชัน Local ต่อ Pill ต้องเช็คว่ามี Block ซ้ำชื่อเดียวกันในอีก `<script>` Tag ของไฟล์นี้หรือไม่ ก่อนแก้ เพราะ Block หลังจะ Override Block ก่อนแบบเงียบๆ) | Spec §5.6, `Charmiss_Module_PnL_Spec.md` |
| Financial Statement → Financial Analysis | `pnl_financial_analysis.html` | Data Model ของตัวเอง (DuPont Decomposition, Financial Ratios, Cash Conversion Cycle) — `MASTER_EQUITY`/`MASTER_*` Series เป็นฐานให้ Equity Changes อ้างอิง (`totalEquityQ` ใน `pnl_equity_changes.html` เป็นชุดเดียวกับที่ DuPont's Equity Multiplier ใช้) | Spec §5.6 |
| Financial Statement → Cash Flow | `pnl_cash_flow.html` | ใช้ PRNG Seed แยกของตัวเอง (`cfRand = mulberry32(20260635)`, ไม่ปนกับ `rand` หลักของไฟล์อื่น) — Q1'26/Q2'26 (`CF_Q2` Block) เป็น Anchor ที่ผูกกับ Balance Sheet Cash (45M/40M) และ Equity Changes Dividends (11.2M) เป๊ะ (ดู §5.6.7 "Anchor-only") — ไตรมาสอื่น (Q2'25-Q4'25) เป็น Illustrative Trend ที่ Backfill เองจากอัตราส่วน CFO/EBITDA คงที่ ไม่ผูกกับ Balance Sheet's ไตรมาสเดียวกัน | Spec §5.6 |
| Financial Statement → Balance Sheet | `pnl_balance_sheet.html` | Data Domain ใหม่ทั้งหมด ไม่มีการ Copy Part 1 จากไฟล์ไหน — `ASSET_Q1`/`LIAB_Q1` (Q1'26) เป็น Anchor คงที่, `backfillSeries()` (`BACK_STEPS = 5`) Inverse-compound ถอยหลังจาก Anchor ทีละไตรมาสได้ Q4'24-Q4'25 + Push Q2'26 ต่อท้ายแยก — **Equity คำนวณเป็น Plug** (Total Assets − Total Liabilities) ทุกไตรมาสเพื่อการันตี Accounting Identity โดยโครงสร้าง — ตัวเลข Cash/Equity ตรงกับ Cash Flow/Equity Changes แค่ที่ Q1'26/Q2'26 (ดู §5.6.7) | Spec §5.6 |
| Financial Statement → Equity Changes | `pnl_equity_changes.html` | Capstone ผูก P&L (Net Profit)/Cash Flow (Dividends)/Balance Sheet (Equity) เข้าด้วยกันที่ Q1'26/Q2'26 (`openingEquity=202e6`, `netProfitQ2=19.1e6`, `dividendsQ2=-11.2e6` — Anchor ตรงกับอีก 2 แท็บเป๊ะ) — `totalEquityQ` มี 5 ไตรมาส (Q2'25-Q2'26), 3 ไตรมาสแรกเป็นเลข Hardcode ("illustrative mock leading into" Anchor ตามคอมเมนต์ในไฟล์ ไม่ใช่สูตร Derive) — `dividendsQAll`/`payoutQAll` มีแค่ 4 ค่า (Q3'25-Q2'26, ไม่มี Q2'25 เพราะไม่มี Retained Earnings งวดก่อนหน้าให้ Roll-forward) — Dividends Chart Render เป็น 5Q โดย Prepend `null` ที่ตำแหน่ง Q2'25 ให้ Match แกน X ของ Equity Trend (ดู §5.6.6, ต้องพึ่ง `buildComboBarLineSVG`'s Null-bar Support ใน `shared.js`) | Spec §5.6 |
| Landing / Directory | `index.html` | ไม่มี Mock data — อ่าน `MODULE_MAP` จาก `nav-menu.js` มาสร้าง Directory listing; ปุ่ม Hero CTA Hardcode ไปที่ `sales_overview.html` ตรงๆ ไม่ได้อ่านจาก MODULE_MAP | Spec §2.1 |

### 6.3 กติกาเวลาแก้ (สรุปสั้น)

1. แก้แค่ Layout/CSS ของหน้าเดียว → แนบแค่ HTML ไฟล์นั้น + Baseline 4 ไฟล์ (6.1) พอ
2. แก้ตัวเลข/สูตร Mock data ที่มีคำว่า "Part 1" หรือชื่อ Series ที่ปรากฏในตาราง 6.2 มากกว่า 1 ไฟล์ → ต้องแนบทุกไฟล์ในแถวนั้นพร้อมกัน ไม่งั้นเลขจะไม่ตรงข้ามหน้า (แบบที่เคยเป็น Bug จริงมาแล้ว)
3. แก้ฟังก์ชันใน `shared.js` (เช่นฟังก์ชันสร้างกราฟ) → ควรแจ้งว่าจะ "แก้ทั้งระบบ" และแนบไฟล์ HTML ทุกหน้าที่เรียกใช้ฟังก์ชันนั้น (เช็คด้วย `grep` ชื่อฟังก์ชันก่อนเริ่มแก้) ไม่ใช่แนบแค่หน้าที่อยากแก้หน้าเดียว
4. TT ทั้ง 3 หน้ามีไฟล์จริง (`tt_executive_summary.html`/`tt_breakdown.html`/`tt_sales_person.html` + `tt-shared.css`/`tt-shared.js`) แก้ได้ตรงๆ แต่ต้องระวัง `render()` ที่ใช้ร่วมกันระหว่าง Executive Summary/Breakdown ตามที่ระบุใน §6.2 — แก้ Element ใดใน Breakdown ที่ Executive Summary มี Hidden Stub อยู่ (หรือกลับกัน) ต้องเช็คว่า Stub ยังครบ ไม่ตกหล่นจนทำให้อีกหน้า Error

---
