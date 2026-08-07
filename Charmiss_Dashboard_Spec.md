# Charmiss Enterprise Dashboard — Business Overview
## Requirements & System Design Specification

**อัปเดตล่าสุด:** 6 สิงหาคม 2569

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
▸ P&L Overview                                       [Company-wide, คู่ขนานกับ Sales Overview — ไม่ใช่ลูกของมัน]
      ├── Executive Summary
      ├── Quarterly Trend (5-Quarter Rolling)
      ├── Breakdown (Margin by Channel/Category)
      ├── Cost Structure
      └── Balance Sheet

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

> หมายเหตุเรื่องลำดับ: P&L Overview ถูกจัดให้ปรากฏ **ก่อน** Sales Overview ทั้งใน Nav Menu และหน้า Directory ของ `index.html` (ตามลำดับ `MODULE_MAP` ใน `nav-menu.js`) แต่ปุ่ม Hero CTA ของ `index.html` ("เข้าสู่ Sales Overview →") ยังคงพาไป Sales Overview เหมือนเดิมโดยไม่แตะ — ลำดับการแสดงผลกับ Entry point หลักเป็นคนละเรื่องกันโดยตั้งใจ

> หมายเหตุด้านไฟล์: P&L Overview, MT Overview, ECOM Overview และ Sales Overview ทั้ง 2 มุมมอง ใช้ Component กลาง (`shared.css`/`shared.js`) ร่วมกัน แยกไฟล์ตาม 1 มุมมอง = 1 ไฟล์ (`pnl_executive_summary.html`, `pnl_quarterly_trend.html`, `pnl_breakdown.html`, `pnl_cost_structure.html`, `pnl_balance_sheet.html`, `module_mt_executive_summary.html`, `module_mt_breakdown.html`, `module_ecom_executive_summary.html`, `module_ecom_breakdown.html`, `sales_overview.html`, `sales_overview_product_analysis.html`) — TT Overview แยกเป็น 3 ไฟล์อิสระ (`tt_executive_summary.html`, `tt_breakdown.html`, `tt_sales_person.html`) ใช้ Engine กลางของตัวเอง (`tt-shared.css`/`tt-shared.js`, แยกจาก `shared.css`/`shared.js` เพราะชื่อ Class ชนกัน) — `render()` ใน `tt-shared.js` คำนวณข้อมูลของ Executive Summary และ Breakdown พร้อมกันในรอบเดียวโดยตั้งใจ (ไม่แยก Mock Data ซ้ำสองชุด) ทั้ง 2 ไฟล์จึงเรียกฟังก์ชันเดียวกัน — ECOM Overview สร้างตาม Pattern เดียวกับ MT (แยก 2 ไฟล์อิสระ ไม่มี Tab เดียวรวม #hash) เพราะมีโครงสร้างใกล้เคียง MT มากที่สุด (มีหน่วยขายย่อยหลายหน่วย คือ Platform Lazada/Shopee/TikTok/Line Shop และไม่มี Region/Sales Person filter)

### 2.2 หลักการ Navigation

- **Navigation Menu** อยู่ที่มุมซ้ายบนของทุกหน้า (ข้าง Logo) กดแล้วเห็นรายการทุกหน้าในระบบ จัดกลุ่มตาม Module (Badge "Coming soon" สำหรับ Module ที่ยังไม่เปิดใช้งาน — ปัจจุบันทุก Module เปิดใช้งานครบแล้ว ไม่มี Module ค้าง) — กดข้าม Section ไหนก็ได้ในคลิกเดียว ไม่ต้องไล่ตามลำดับ Drill-in ทีละชั้น (เช่น จาก Sales Overview ไป TT Overview → Breakdown ได้ทันที)
- **Breadcrumb** "Sales Overview / [Module]" แสดงเฉพาะหน้า Channel Overview (MT/TT/Ecom) เพราะเป็นหน้าที่ Nested อยู่ใต้ Sales Overview — Sales Overview เองไม่มี Breadcrumb เพราะเป็นจุดบนสุดของ Hierarchy — P&L Overview ก็ไม่มี Breadcrumb เช่นกัน (แค่ "P&L Overview" เดี่ยวๆ) เพราะเป็นมุมมอง Company-wide คู่ขนานกับ Sales Overview ไม่ใช่ลูกของมัน
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
| Revenue Trend by [Level] | Stacked AREA Chart (`buildStackedAreaSVG` พร้อม Option `showAxis:true` เพิ่ม Y-axis Gridline+Label และ `showTopPoints:true` เพิ่มจุด+ตัวเลขกำกับบนเส้นบนสุด ณ ทุกเดือน เพื่อเทียบจุดสูงสุดข้ามเดือนได้ง่าย — ทั้ง 2 Option เป็น Opt-in Backward-compatible ไม่กระทบ Caller อื่นของฟังก์ชันนี้ใน `pnl_cost_structure.html`) — Time Window คำนวณจาก `periodYearStart = Math.floor(e/12)*12` (หาต้นปีของปีที่ Period สิ้นสุด) แล้ววาดตั้งแต่ `periodYearStart` ถึง `Math.min(periodYearStart+11, TODAY)` เสมอ เพื่อให้กราฟนี้และ Category Share of Sales Over Time ตรงกับปีของ Period ที่เลือกจริง (ไม่ใช่ Fix เริ่มต้น Jan ปีก่อนเสมอ) |
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

**Store:** Tab ที่ 3 ของ MT Overview (`module_mt_store.html`) แยกจาก Breakdown — มี Nav Item `mt-store` ใน `MODULE_MAP` (nav-menu.js) และ Tab Link "Store" ใน `<nav class="tabs">` ของทั้ง 3 ไฟล์ (Executive Summary, Breakdown, Store เอง) ลำดับ Section บนหน้า (บนลงล่าง): **Store Performance → Store Health → Store Ranking** (Store Ranking อยู่ล่างสุดเพราะเป็นตารางอ้างอิง/รายละเอียด ไม่ใช่สิ่งแรกที่ควรเห็น) — `<nav class="section-nav">` เรียงตามลำดับนี้เช่นกัน

Mock Store Count รวม **80 สาขา** (WATSONS 40, EVEANDBOY 8, CJ Express 26, Beautrium 4, Multy 2)

| Section | Metric/Chart | หมายเหตุการ Build |
|---|---|---|
| KPI (4 การ์ด) | Total Stores, Avg Sales per Store, Same-Store Sales Growth (SSSG), New Stores Opened | ทั้ง 4 ใบผูกกับ Partner filter (ยกเว้น Total Stores/Avg ที่คำนวณจาก Scope ที่กรองอยู่) — ทั้ง 4 ใบมี Sparkline (`sparklineSVG()` จาก `shared.js`): (1) Total Stores — จำนวนสาขาสะสมย้อนหลัง 12 เดือน Reconstruct จาก `storeOpenedMonth` จุดขวาสุด = ตัวเลขหัวข้อเป๊ะ (2) Avg Sales per Store — อัตราเฉลี่ยเดียวกันคำนวณแบบรายเดือนย้อนหลัง 12 เดือน (ต่างจากตัวเลขหัวข้อที่เป็นยอดสะสมตามช่วงเวลาที่เลือก — Unit ต่างกันตั้งใจ เหมือน Pattern เดิมของ Net Sales KPI ใน Executive Summary ที่ Sparkline เป็นรายเดือนแต่ตัวเลขหัวข้อเป็นยอดตามช่วงที่เลือก) (3) Same-Store Sales Growth — เนื่องจาก `growthYoY` เป็นค่าคงที่ต่อ Account (ไม่มี Time Series จริง) จึงให้เฉพาะสัดส่วนสาขาใหม่ (`newStoreWeightShare`) ที่ผันแปรตามเวลาจริง (จาก `storeOpenedMonth`+`monthlyWeights`) ส่วน Growth ใช้ค่าคงที่เดิม แล้ว Anchor จุดขวาสุดให้เท่ากับตัวเลขหัวข้อเป๊ะเสมอ ไม่ให้ขัดแย้งกัน (4) New Stores Opened — จำนวนสาขาใหม่ต่อเดือน ย้อนหลัง 12 เดือนคงที่ (ไม่ขึ้นกับ Period Filter เหมือนตัวเลขหัวข้อ — เจตนาให้เห็น Pace ล่าสุดเสมอ, เหมือน Pattern เดียวกับ New Stores Opened Chart ด้านล่างของหน้านี้) |
| Store Performance | **Avg Sales per Store by Partner** (Ranked Bar) จับคู่กับ **Sales per Store Trend** (Multi-line 36 เดือนเต็ม แยกเส้นตาม Partner ที่อยู่ใน Scope, สูตร `groupActual.MT[m]*a.pct/100`) | สอง Chart นี้คือ Metric เดียวกัน (ยอดขายเฉลี่ย/สาขา) มองแบบ Snapshot กับ Trend — X-axis Label ของ Sales per Store Trend คำนวณแบบ Adaptive จาก `plotW` จริงใน `shared.js` (ไม่ชนกันแม้ Chart กว้างครึ่งการ์ด) |
| Store Performance | **Same-Store Sales Growth by Partner** — **Dumbbell Row** (HTML/CSS `renderDumbbellRows()` ในไฟล์นี้, Class `.dumbbell-rows/.dumbbell-row/.dumbbell-track/.dumbbell-dot` ฯลฯ ใน `shared.css`) — จุดสีคู่ (Total Growth / SSSG) บนเส้นเดียวกันต่อคู่ค้า เชื่อมด้วยเส้น พร้อม Legend และตัวเลขระบุชัดทุกแถว | ดู Data Model ด้านล่าง (สูตร SSSG) |
| Store Performance | **Top Stores Trend** (Multi-line 36 เดือน, Top 5 สาขาจริง) + **Scope Selector ของการ์ดนี้เอง** (`<select id="topStoresTrendScopeSelect">`: "All 5 Partners" หรือคู่ค้ารายเดียว) + Callout "Roster Stability" ใต้กราฟ | เลือก **All** = Top 5 สาขาที่ยอดขายสูงสุดทั้งบริษัท (อาจกระจุกที่คู่ค้าเดียวถ้าสาขานั้นเด่นจริง — Insight ที่ตั้งใจให้เห็น ไม่ใช่ Bug); เลือกคู่ค้าใดคู่ค้าหนึ่ง = Top 5 ของคู่ค้านั้น — **Scope Selector นี้แยกอิสระจาก Partner Filter บนสุดของหน้าโดยตั้งใจ** (Convention เดียวกับ Store Health) — Callout "Roster Stability" จัดอันดับทุกสาขาใน Pool ที่เลือกตาม `monthlyWeights` ของแต่ละเดือน (ไม่ใช่ Static `storeWeights` ที่เส้นกราฟใช้วาด) แล้วเทียบว่า Top N ของ 12 เดือนที่ผ่านมาตรงกับ Top N วันนี้ทุกเดือนหรือไม่ — ใช้ Key แบบ `partner#si` เทียบข้าม Account ได้เมื่อ Scope = All |
| Store Health (Company-wide เสมอ ไม่ผูก Partner filter) | New Stores Opened รายเดือน ย้อนหลัง 12 เดือน (Bar Chart, เต็มความกว้าง) + Caption ระบุ "0 closures recorded in source data" | ไม่ Mock ตัวเลขปิดสาขาจริง ระบุ Caveat ตรงๆ แทนการสร้างตัวเลขหลอก |
| Store Health (Company-wide เสมอ) | **Store Productivity Distribution** (Histogram) จับคู่กับ **Store Productivity Mix Over Time** (Stream Chart 18 เดือน) | ไม่มี Store Productivity Quartile by Partner (ไม่มีข้อมูลจริงรองรับ) — Distribution จับคู่กับ Mix Over Time แทน (Snapshot vs 18-Month Trend ของ Metric เดียวกัน) — ไม่มี Data Label จำนวนสาขาบนแท่ง ใช้ Y-axis Title "Store Count" แทน (Field `opts.yAxisTitle` ใน `buildGroupedBarSVG`, `shared.js`, Optional) — Bucket เป็น **Dynamic** (`computeDynamicBuckets()` ในไฟล์นี้) คำนวณ Bucket Width จาก Percentile ที่ 90 ของยอดขายต่อสาขาปัจจุบัน (ไม่ใช้ Max ตรงๆ เพราะ Outlier เดี่ยว 1 สาขาจะดึง Bucket Width ทั้งหมดจนสาขาที่เหลือกระจุกอยู่ Bucket แรกหมด) ปัดเป็นเลขกลม (`niceStep()`) แล้วให้ Bucket สุดท้ายเปิดปลาย (`≥`) รับ Outlier — Mix Over Time ใช้ Bucket ชุดเดียวกันนี้ (Reuse ตัวแปร `bucketDefs`) เพื่อให้ 2 การ์ดสอดคล้องกันเสมอ |
| Store Ranking | Top Store Ranking + Bottom Store Ranking (Table Top 10, See-more) | ไม่แสดงคอลัมน์ Attainment (ปกติไม่มี Target แยกรายสาขา คำนวณจริงไม่ได้) — คอลัมน์ YoY Growth ใช้ Field `a.storeGrowthYoY` (Array ต่อสาขา = `growthYoY` ของคู่ค้า ± Variance สุ่ม `rand()*12-6`, Generate ครั้งเดียวตอนโหลดหน้า ต่อจาก `monthlyWeights`) ผ่าน `buildStoreList()`'s Field `growthYoY` ต่อสาขา ทำให้ตัวเลขในตารางมีการกระจายตัวจริงต่อสาขา แทนที่จะ Copy ตัวเลขระดับคู่ค้า (`keyAccounts[i].growthYoY`) ซ้ำทุกแถวในคู่ค้าเดียวกัน (Mock ล้วน ไม่ได้ผูกกับ Driver อะไรจริง) |
| Store Ranking | Pareto Ranking (`buildParetoSVG`, 10 Decile) | มี X-axis Title ใต้แถว Label Decile ("Store deciles — Decile 1 = highest sales/store, Decile 10 = lowest") อธิบายว่า Label "1–10%" หมายถึงอะไร — ใช้ Field `opts.xAxisTitle` ใน `buildParetoSVG` (`shared.js`, Optional) |

**Data Model — `storeOpenedMonth`:** `a.storeOpenedMonth` (Array ขนาดเท่า `storeCount`, `null` = เปิดมาก่อนหน้าต่างข้อมูล 36 เดือน, หรือ Index เดือนใน 12 เดือนล่าสุด = เพิ่งเปิด) และ `a.newStoreWeightShare` (สัดส่วน Weight ของสาขาที่ Tag ว่า "ใหม่") ต่อ Key Account ที่มี `storeCount` — สาขา "ใหม่" สุ่มเลือก**แบบสุ่มล้วน ไม่ใช่เรียง Weight น้อยไปมาก** (เรียง Weight ก่อนจะ Tag สาขาเกินสัดส่วนจริง เพราะสาขา Long-tail มี Weight น้อยมาก ต้องใช้จำนวนมากถึงจะรวมได้ถึง Target) — SSSG = `((1+growthYoY/100)*(1-newStoreWeightShare)-1)*100`, `NEW_STORE_TARGET_SHARE` เป็นค่า Illustrative ต่อ Account (WATSONS 2.5%, EVEANDBOY 12%, CJ Express 8%, Beautrium 5%, Multy 1.5%) — ⚠️ **Gotcha ที่ต้องระวัง:** `a.newStoreWeightShare` ใช้ค่า `target` ที่ประกาศตรงๆ (ไม่ใช่ค่า `cum` จริงจากการ Tag สาขา) เพราะสำหรับ Account ที่มีสาขาน้อยมาก (เช่น Multy 2 สาขา) การ Tag แค่ 1 สาขาอาจกิน Weight 50%+ ของ Account ทันที ถ้าใช้ `cum` จริง Target เล็กๆ (1.5%) จะกลายเป็นค่าจริงสูงถึง ~80%+ ทำให้ SSSG ผิดเพี้ยนไปมาก (เคยพุ่งไปที่ -82% จาก Total Growth -6%) — การ Tag สาขาจริง (`storeOpenedMonth`) ใช้ Mechanism แยกต่างหาก จำกัดผลไว้แค่ KPI "New Stores Opened"/ตาราง ไม่กระทบสูตร SSSG — **บทเรียน:** เวลามี Field 2 ตัวที่ "ควรจะ" มีค่าตรงกัน (Declared Target vs Derived Actual) ต้องเช็คว่าฝั่งที่ถูกใช้จริงในสูตรคือตัวไหน อย่าสมมติว่าตรงกันเสมอโดยไม่ตรวจ

**Data Model — `monthlyWeights`:** `a.monthlyWeights` (Array 12 เดือน แต่ละเดือนเป็น Array ของ Per-store Weight ที่ Renormalize แล้ว) ใช้เฉพาะสำหรับ "Top Store Stability by Partner" (ดู Note ในตารางข้างบน) — จำเป็นเพราะ `storeWeights` เดิมทำให้ Rank ไม่เปลี่ยนได้เลยตามโครงสร้างสูตร (ทุกสาขาในบัญชีเดียวกันคูณด้วย Account Total เดือนนั้นเท่ากันหมด สัดส่วนเทียบกันจึงคงที่ตลอด) — `rand()` เป็น Stream เดียวกับข้อมูล Mock อื่นในไฟล์นี้ ต่อจาก `storeOpenedMonth`

Coverage caveat (คงเดิม): ข้อมูลระดับสาขามีเฉพาะ 5 จาก 9 Key Account (WATSONS, EVEANDBOY, CJ Express, Beautrium, Multy) — Note นี้แสดงเป็น `chart-subtitle` ใต้ Filter Bar

Filter Bar ที่ Build จริง: Period (Dropdown เหมือนทุกหน้า) + Partner (`<select>` จำกัดเฉพาะ 5 รายที่มีข้อมูลสาขา, ค่าเริ่มต้น "All 5 Partners") — ไม่มี Store Tier/Quartile filter เนื่องจากยังไม่มี Use Case ชัดเจนที่ต้องใช้ร่วมกับ Filter อื่น

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

Ecom มี **4 Platform เท่านั้น** — Lazada, Shopee, TikTok, **Line Shop** — `channelDefs` (Part 1) มี `LineShop` เป็น Entry สุดท้ายของกลุ่ม Ecom (ต่อจาก TikTok, เพื่อไม่กระทบลำดับ `rand()` ของ MT/TT/Lazada/Shopee/TikTok ที่ประมวลผลก่อนหน้า) — ต้องแก้ Array นี้พร้อมกันในทุกไฟล์ที่ก็อบปี้แบบ byte-for-byte: `sales_overview.html`, `sales_overview_product_analysis.html`, `module_mt_executive_summary.html`, `module_mt_breakdown.html`, `module_ecom_executive_summary.html`, `module_ecom_breakdown.html`, `pnl_executive_summary.html`, `pnl_breakdown.html` (8 ไฟล์รวม Master) — Base ของ Lazada/Shopee/TikTok คือ 1.8M/1.55M/850K, Line Shop 400K (Ecom Total ≈ 4.6M) — Label แสดงผลใช้ **"TikTok"** (ไม่ใช่ "TikTok Shop") ทุกจุด — CSS Var `--lineshop:#4C8C5C` ใน `shared.css` คู่กับ `--lazada`/`--shopee`/`--tiktok` (Documentation Token เท่านั้น ไม่มีที่ไหน Reference ผ่าน `var()` จริง)

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

### 5.6 P&L Overview

Module Company-wide คู่ขนานกับ Sales Overview (ไม่ใช่ Channel Module แบบ MT/TT/ECOM) — ปิด Gap "ไม่มีมิติกำไร/Margin" ที่พบใน `Charmiss_Dashboard_Review_2026-07-31.md` — ออกแบบใหม่เป็น **5 ไฟล์/แท็บ** (จากเดิม 3) ตาม `Opp Day/PnL_Overview_Redesign_Concept.md` (เทียบเคียง WARRIX Opportunity Day + Oppday อีก 8 บริษัทข้ามอุตสาหกรรม): Executive Summary → Quarterly Trend → Breakdown → Cost Structure → Balance Sheet — ทุกแท็บมี Anchor Pill Nav (`<nav class="section-nav">`) ยกเว้น Executive Summary/Quarterly Trend's ratio table zone ที่เป็น Zone เดียวต่อเนื่อง

**ไม่มี Separate vs Consolidated P&L** (Charmiss ไม่มีบริษัทลูก — ทุกหน้าใช้ P&L ชุดเดียว) และ**ไม่มี Forward-looking Disclaimer** แบบ SET (Dashboard ภายใน ไม่ใช่เอกสารเผยแพร่นักลงทุน)

**Executive Summary** (8 KPI Card): Gross Profit, Gross Margin %, Net Profit, Net Margin %, **EBITDA** (การ์ดใหม่ — ดู EBITDA Scaffold ด้านล่าง), Profit Target Attainment % (Net Profit เทียบเป้าหมายที่ตั้งจาก Net Sales Target × 22% Net Margin สมมติฐาน), Full Year Profit Forecast (Run-rate: (Net Profit Calendar-YTD ÷ เดือนที่ผ่านไป) × 12 ÷ Full Year Target × 100, `buildTrajectorySparklineSVG` เส้นทึบ+เส้นประ, ไม่มีแถว MoM/YoY เพราะเป็นค่าพยากรณ์เต็มปี), OPEX Ratio % (Delta กลับทิศ — ยิ่งต่ำยิ่งดี) — การ์ด Net Profit มี Caption เสริม **"Adjusted"** ท้ายการ์ด (Reported vs Adjusted Net Profit จาก One-time Add-back, ลิงก์ไปดูรายละเอียดเต็มที่ Quarterly Trend's Normalized Earnings Bridge)

ถัดจาก KPI Row: **Budget vs Actual + RAG** (Table เทียบ Net Sales/Gross Profit/Gross Margin %/Net Profit/Net Margin % กับ Budget — Budget Net Sales/Net Profit ใช้ Target เดียวกับที่ Module นี้ใช้อยู่แล้ว, Budget Gross Margin % เป็นสมมติฐานใหม่ 48% — RAG: เขียว = ถึง/เกิน Budget, เหลือง = ต่ำกว่าไม่เกิน 2%, แดง = ต่ำกว่าเกิน 2%) · Profit Trend (เส้น Last Year Net Profit เทียบ Gross/Net/Target ในกราฟเดียว), Margin Trend · P&L Waterfall (Net Sales → COGS → Gross Profit → Trade Spend → Logistics → Marketing/Ads → SG&A → Net Profit) · **Income Statement** (ตัวเลขเดียวกับ Waterfall เป๊ะทุก Row — คำนวณจากตัวแปร Sum ชุดเดียวกัน — มี Local Toggle **"View By: Year to Date | Quarterly"** เหนือตาราง: YTD Mode = This Period/%-of-Sales/Last Year/Diff%; Quarterly Mode = Prior Quarter/Current Quarter/%-of-Sales/QoQ%/YoY% — ทั้ง 2 Mode เพิ่มแถว **D&A (add-back)** และ **EBITDA** ต่อท้าย 8 แถวเดิม พร้อม Badge "ประมาณการ") · **Key Factors Affecting Performance** (Bullet Auto-generate จาก Threshold Rule ใต้ Income Statement — กลุ่ม Bullet ที่โชว์ขึ้นกับ View By Toggle ด้านบน: YTD Mode ใช้ Threshold แบบ YoY, Quarterly Mode ใช้ Threshold แบบ QoQ ต่อ Cost Line + ส่วนต่าง Growth ระหว่าง Channel — Threshold: Gross/Net Margin ±2pp QoQ / ±3pp YoY, Cost-to-Sales Ratio ±1pp QoQ, Revenue Growth Divergence ระหว่าง Channel >5pp — ไม่มี Metric ไหนเกิน Threshold จะโชว่ Fallback Message แทนที่จะว่างเปล่า) · Margin by Channel, Margin by Category · Ranking by Channel (Table)

**EBITDA Scaffold (ทั้ง Module):** P&L เดิมไม่มีบรรทัด D&A แยก จึงไม่มี EBITDA โดยธรรมชาติ — Scaffold ด้วย `DA_RATE_OF_SALES = 0.030` (D&A = 3% ของ Net Sales, ค่าคงที่เดียวกันทุกไฟล์เพื่อให้ EBITDA ตรงกันข้าม Executive Summary/Quarterly Trend) แล้ว EBITDA = Net Profit + D&A — ทุกจุดที่โชว์ EBITDA/D&A ต้องมี Badge "ประมาณการ" (Reuse `.badge-soon` Style เดิม ไม่ใช่สีใหม่) กำกับเสมอ รอ Finance ยืนยันตัวเลขจริงก่อนใช้งานจริง

**Normalized Earnings (Reported vs Adjusted, ทั้ง Module):** บวกกลับ 4 One-time Item (Obsolete Inventory Provision, Impairment Loss on Assets, Expected Credit Loss, Provision for Litigation) เป็น Mock Series รายเดือน (`addbackRand = mulberry32(20260632)`, แยกจาก `rand` หลักของทุกไฟล์) — Impairment/Litigation ส่วนใหญ่เป็น 0 (Lumpy ตามธรรมชาติ), Obsolete Inventory/ECL เป็นก้อนเล็กสม่ำเสมอ (สมเหตุสมผลกับธุรกิจ Cosmetics ที่มี Inventory/AR Risk จริง) — ยังไม่มี List รายการจริงจาก Finance ต้องแทนที่ก่อนใช้งานจริง

**ทำไมไม่มี "Revenue" Sub-module ใน P&L:** Sales Overview ครอบคลุม Revenue Breakdown อยู่แล้วอย่างละเอียด — ถ้า P&L ต้องอ้างอิง Revenue Breakdown ให้ลิงก์ไปที่ Sales Overview แทนสร้างกราฟซ้ำ

**Quarterly Trend (`pnl_quarterly_trend.html`, ไฟล์ที่ 2 — ใหม่ทั้งหมด):** Company-wide เสมอ **ไม่มี Filter** (Rolling 5 ไตรมาส สิ้นสุดที่ไตรมาสล่าสุดที่ปิดบัญชี — ปัจจุบันคือ Q2'25→Q2'26, Rolling ต่อเมื่อปิดไตรมาสใหม่ ไม่ใช่ปีปฏิทินคงที่):
| Section | Metric/Chart |
|---|---|
| 5-Quarter P&L | Table: Net Sales → EBITDA (13 แถวรวม Gross/Net/EBITDA Margin % + D&A/EBITDA) × 5 ไตรมาส + คอลัมน์ QoQ%/YoY% — Q1'26+Q2'26 ต้องรวมเท่ากับ Executive Summary's YTD H1'26 เป๊ะทุกบรรทัด (Verified) |
| Trends | 3 คู่การ์ด (฿-Bar + %-Line แยกกัน แทน Dual-axis Combo ที่ `shared.js` ไม่รองรับ): Net Sales+Gross Margin%, Net Profit+Net Margin%, EBITDA+EBITDA Margin% (คู่หลังมี Badge "ประมาณการ") |
| Normalized Earnings | Waterfall Bridge ไตรมาสล่าสุด (Reported → +Add-back ทีละรายการ → Adjusted) + Table เทียบ Reported/Adjusted 5 ไตรมาส |
| Net Profit Change Bridge | Waterfall แตกส่วนต่าง Net Profit ระหว่าง 2 ไตรมาสล่าสุดเป็น Driver (Volume, Gross Margin/Mix, Trade Spend, Logistics, Marketing/Ads, SG&A) — **คนละตัวกับ P&L Waterfall** ของ Executive Summary ที่เป็น Component Build ของไตรมาสเดียว ตัวนี้ตอบ "ทำไมกำไรเปลี่ยน" — Volume effect = ΔRevenue × GM%(ไตรมาสก่อน), Margin/Mix effect = ΔGM% × Revenue(ไตรมาสล่าสุด) — สูตรนี้ Reconcile แม่นยำ 100% โดยไม่ต้องปัดแก้ตัวเลข (พิสูจน์ทางพีชคณิตว่า Volume+Margin/Mix Effect = ΔGross Profit เป๊ะ, รวมกับ OPEX Driver ที่เหลือ = ΔNet Profit เป๊ะเสมอ) |

**Cost Structure (`pnl_cost_structure.html`, ไฟล์ที่ 4):** 4 Section:
| Section | Metric/Chart |
|---|---|
| Cost Efficiency | OPEX Ratio % KPI (ตัวเดียวกับ Executive Summary), Cost-to-Sales Ratio Table |
| Cost by Channel & Partner | OPEX Trend, Operating Expense Ratio Trend by Channel, Marketing & Ads Spend by Channel, Trade Spend by Partner (MT only, Placeholder ล้วนๆ ไม่มีตัวเลขจริง — ยังไม่มี Data Source ระดับ Partner) |
| **Cost Category Detail** (ใหม่) | Selling Expense Breakdown (แตก Marketing/Ads เป็น Advertising & Promotion/Digital-Content Marketing/People cost/Others ตามสัดส่วนคงที่ `SELLING_EXPENSE_SPLIT`) + Selling Expense-to-Sales % Trend — Administration Expense Breakdown (แตก SG&A เป็น People cost/Rental & Depreciation/Other Admin/Advisor & Professional Fees/Service Cost ตามสัดส่วนคงที่ `ADMIN_EXPENSE_SPLIT`) + Admin Expense-to-Sales % Trend — ทั้งคู่เป็น Stacked Bar 5 ไตรมาส (`buildStackedBarSVG`), ผลรวม Sub-category เท่ากับ Marketing/Ads หรือ SG&A รวมเป๊ะทุกไตรมาสโดยธรรมชาติ (Split เป็นสัดส่วนคงที่ ไม่ใช่สุ่มอิสระ) — **Trade Spend และ Logistics ไม่แตกย่อย** เพราะไม่มีองค์ประกอบ People/Rental/Advertising จริง (Trade Spend = Rebate/Allowance, Logistics = Freight/Warehousing) |
| Cost Efficiency Signal | "For Every ฿1 of Revenue" Donut + Callout อัตโนมัติชี้ Cost Line ที่โต YoY เร็วกว่า Net Sales |

**Standing Guardrail:** ห้ามสร้าง Trade Spend/Cost Breakdown แยกอีกใน MT/TT/ECOM Breakdown — P&L (โดยเฉพาะแท็บ Cost Structure) เป็น Single Source of Truth สำหรับมิติ Cost/Trade Spend ทั้งระบบ — **ตอนนี้ยังเป็น Single Source of Truth สำหรับ Balance Sheet/Liquidity/Cash Conversion Cycle ระดับบริษัทด้วย** (เดิมไม่มี Module ไหนเป็นเจ้าของเรื่องนี้)

**Breakdown (Margin/Cost Structure เชิงลึก — 2 Section, ไฟล์ที่ 3):**
| Section | Metric/Chart |
|---|---|
| Margin Quality by Channel | Net Margin % Trend by Channel, **Cost Structure by Channel** (100%-Stacked Bar: COGS/Trade Spend/Logistics/Marketing&Ads/SG&A/Net Profit — มี Legend ครบทุก Segment + Insight Callout ชี้ Cost Driver ที่สูงสุดต่อ Channel, สองจุดที่ก่อนหน้านี้ขาด) |
| Category Profitability | Highest/Lowest Margin Category, Margin by Category, Category Profit Matrix (Scatter), Category Profitability Ranking (Table ครบ 6 Category) |

Filter Bar ของ Breakdown: Period, Channel (All/MT/TT/Ecom — scope เฉพาะ Zone Category Profitability), Category (ใช้งานได้แค่ "All Categories")

**Balance Sheet (`pnl_balance_sheet.html`, ไฟล์ที่ 5 — ใหม่ทั้งหมด, 100% Mock Data):** Company-wide, ไม่มี Filter — เป็น Data Domain ใหม่ทั้งหมดที่ไม่มี Module ไหนในระบบพูดถึงมาก่อน จึงไม่มีข้อผูกพันต้อง Reconcile กับตัวเลขที่อื่น ยกเว้น Accounting Identity ภายในตัวเอง (Total Assets = Total Liabilities + Equity เสมอ, **Equity คำนวณเป็น Plug ไม่ใช่สุ่มอิสระ** เพื่อการันตีสมดุลบัญชีโดยโครงสร้าง):
| Section | Metric/Chart |
|---|---|
| Key Financial Ratio | Table 5 ไตรมาส: Current Ratio (Times), Inventory/AR/AP Turnover (days), **Cash Conversion Cycle** (= Inventory Days + AR Days − AP Days, คำนวณจาก 3 Metric อื่นจริง ไม่ใช่ Series สุ่มแยก) |
| Balance Sheet | Asset Breakdown + Liabilities & Equity Breakdown (Stacked Bar เทียบ Q1'26 vs Q2'26 — ไตรมาสก่อนหน้า ไม่ใช่สิ้นปี) |
| Financial Leverage | D/E Trend 5 ไตรมาส + **IBD/E = 0.00x ตลอด** (Charmiss ไม่มีเงินกู้ยืมที่มีภาระดอกเบี้ย ณ ปัจจุบัน — ไม่เคยมีบรรทัดดอกเบี้ย/เงินกู้ปรากฏที่ไหนในระบบมาก่อน จึงกำหนดตรงๆ แทนเดาตัวเลขหนี้ใหม่) |

ทั้งหน้ามี Footnote ท้ายหน้าระบุว่าเป็น Mock Data 100% สำหรับ Design/Demo — ต้องแทนที่ด้วย Data Source Balance Sheet จริงจาก Finance ก่อนใช้งานจริง

Margin Model (สรุปจาก Spec — ดูรายละเอียดสูตรที่ `Charmiss_Module_PnL_Spec.md`): Effective Margin % = Category Base Margin % × Channel Adjustment Factor (MT ×0.90, TT ×1.00, Ecom ×0.93) — **ตัวเลขต้นทุน/กำไรทั้งหมดเป็นสมมติฐาน Mock ล้วนๆ ไม่ใช่ข้อมูลบัญชีจริง** ไม่มีระบบ COGS/Ledger จริงรองรับ — Net Sales ทุกตัวใน Module นี้อ้างอิง `groupActual`/`groupTarget` byte-for-byte จาก `sales_overview.html` เหมือนกับ MT/TT/ECOM ทุกประการ ไม่มีการสร้างยอดขายใหม่

หมายเหตุความครบถ้วนของ Category Share ต้นทาง: `mtCategoryShares` และ `ecomCategoryShares` เป็นการ copy byte-for-byte จากไฟล์ MT/ECOM Executive Summary ตามหลักการเดียวกับ Net Sales — ส่วน `ttCategoryShares` เป็นการสร้างขึ้นใหม่จากค่าที่สังเกตได้ใน Screenshot การ Review (TT source files ไม่ได้ถูกส่งมาให้ Build แต่แรก มีแต่ Screenshot) จึงไม่ใช่ byte-for-byte copy เหมือนอีก 2 Channel — ควรตรวจทานกับไฟล์ TT จริงถ้ามีในอนาคต

Module นี้ยังปิด Task 7.4 ของ Review บางส่วน (Marketing & Ads Spend by Channel = เวอร์ชัน Company/Channel-level ของแนวคิด "Ads Spend ROI" ที่เคยตัดออกจาก ECOM Breakdown — ยังไม่ลงถึงระดับ Platform รายตัว)

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
  - `opts.opacity` (`buildLineChartSVG`), `opts.xAxisTitle` (`buildParetoSVG`), `opts.yAxisTitle` (`buildGroupedBarSVG`) เป็น Optional Field ทั้งหมด, Backward-compatible กับ Caller เดิม |
| `nav-menu.css` | Style ของ Dropdown เมนู Nav บน Topbar |
| `nav-menu.js` | `MODULE_MAP` — กำหนดลำดับ/รายชื่อ Module ใน Nav Dropdown และในหน้า `index.html` (Directory listing) พร้อมกัน — แก้ไฟล์นี้กระทบทั้ง 2 จุดพร้อมกันเสมอ — มี Item `mt-store` (label "Store", href `module_mt_store.html`) ในกลุ่ม MT Overview และ Item `pnl-cost` (label "Cost Structure", href `pnl_cost_structure.html`) ในกลุ่ม P&L Overview — ทั้งคู่มี Tab Link คู่กันในทั้ง 3 ไฟล์ของ Module นั้น (`<nav class="tabs">` ของ Executive Summary/Breakdown/Store หรือ Cost Structure) ไม่ใช่แค่ใน `MODULE_MAP` |

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
| P&L → Executive Summary | `pnl_executive_summary.html` | Part 1 = copy จาก `sales_overview.html`; Part 2 ใช้ `mtCategoryShares`/`ecomCategoryShares` (copy จาก MT/ECOM Executive Summary) + `ttCategoryShares` (⚠️ สร้างขึ้นเองจาก Screenshot ใน Review doc ไม่ใช่ byte-for-byte เพราะไม่มีไฟล์ TT จริง) — **Income Statement Table** reuse ตัวแปร Sum ชุดเดียวกับ `waterfallSteps` ตรงๆ ไม่คำนวณซ้ำ | Spec §5.6, `Charmiss_Module_PnL_Spec.md` |
| P&L → Breakdown | `pnl_breakdown.html` | Part 1 = copy จาก `pnl_executive_summary.html` (ไม่ใช่จาก sales_overview ตรงๆ) — Part 2 "kept in sync with pnl_executive_summary.html" ตามคอมเมนต์ในไฟล์ — ไม่มี Zone "Cost Structure Over Time" (OPEX Trend/Marketing & Ads Spend by Channel อยู่ที่ `pnl_cost_structure.html` แทน) — เหลือ 2 Zone: Margin Quality by Channel, Category Profitability | Spec §5.6, `Charmiss_Module_PnL_Spec.md` |
| P&L → Cost Structure | `pnl_cost_structure.html` | Part 1+2 = copy จาก `pnl_breakdown.html` แบบ byte-for-byte (Data Model เดียวกันทั้งหมด ต้อง Sync `channelDefs`/`OPEX_RATES`/`categorySharesByChannel` คู่กันเสมอ) — มี `pnlCompany` (Aggregate MT+TT+Ecom ต่อ Metric, Local ต่อไฟล์ ไม่ได้ Import จาก `pnl_executive_summary.html`) สำหรับ OPEX Ratio % KPI/Cost-to-Sales Ratio Table/Donut/Callout — Trade Spend by Partner เป็น Static Placeholder ล้วน (`renderTradeSpendByPartnerPlaceholder()`), ไม่มี `rand()`/Data Source ผูกอยู่ | Spec §5.6, `Charmiss_Module_PnL_Spec.md` |
| Landing / Directory | `index.html` | ไม่มี Mock data — อ่าน `MODULE_MAP` จาก `nav-menu.js` มาสร้าง Directory listing; ปุ่ม Hero CTA Hardcode ไปที่ `sales_overview.html` ตรงๆ ไม่ได้อ่านจาก MODULE_MAP | Spec §2.1 |

### 6.3 กติกาเวลาแก้ (สรุปสั้น)

1. แก้แค่ Layout/CSS ของหน้าเดียว → แนบแค่ HTML ไฟล์นั้น + Baseline 4 ไฟล์ (6.1) พอ
2. แก้ตัวเลข/สูตร Mock data ที่มีคำว่า "Part 1" หรือชื่อ Series ที่ปรากฏในตาราง 6.2 มากกว่า 1 ไฟล์ → ต้องแนบทุกไฟล์ในแถวนั้นพร้อมกัน ไม่งั้นเลขจะไม่ตรงข้ามหน้า (แบบที่เคยเป็น Bug จริงมาแล้ว)
3. แก้ฟังก์ชันใน `shared.js` (เช่นฟังก์ชันสร้างกราฟ) → ควรแจ้งว่าจะ "แก้ทั้งระบบ" และแนบไฟล์ HTML ทุกหน้าที่เรียกใช้ฟังก์ชันนั้น (เช็คด้วย `grep` ชื่อฟังก์ชันก่อนเริ่มแก้) ไม่ใช่แนบแค่หน้าที่อยากแก้หน้าเดียว
4. TT ทั้ง 3 หน้ามีไฟล์จริง (`tt_executive_summary.html`/`tt_breakdown.html`/`tt_sales_person.html` + `tt-shared.css`/`tt-shared.js`) แก้ได้ตรงๆ แต่ต้องระวัง `render()` ที่ใช้ร่วมกันระหว่าง Executive Summary/Breakdown ตามที่ระบุใน §6.2 — แก้ Element ใดใน Breakdown ที่ Executive Summary มี Hidden Stub อยู่ (หรือกลับกัน) ต้องเช็คว่า Stub ยังครบ ไม่ตกหล่นจนทำให้อีกหน้า Error

---
