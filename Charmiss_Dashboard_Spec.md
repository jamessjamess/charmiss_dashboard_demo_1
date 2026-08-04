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
      └── Breakdown (Margin by Channel/Category, Cost Structure)

Sales Overview  (Company-wide — รวมทุก Channel)
│
├── Executive Outlook          ภาพรวมบริษัทครบทุกมุม อ่านจบใน 2-3 นาที
│     ├── At a Glance            (KPI สรุปด่วน)
│     ├── Performance & Composition
│     ├── Channel Comparison
│     └── What's Driving It
│
└── Product Analysis           วิเคราะห์ Product/Category ข้าม 3 Channel
      ├── Category Performance Overview
      ├── Cross-Channel Analysis
      ├── Portfolio Strategy
      └── Category Deep-dive

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

> หมายเหตุด้านไฟล์: P&L Overview, MT Overview, ECOM Overview และ Sales Overview ทั้ง 2 มุมมอง ใช้ Component กลาง (`shared.css`/`shared.js`) ร่วมกัน แยกไฟล์ตาม 1 มุมมอง = 1 ไฟล์ (`pnl_executive_summary.html`, `pnl_breakdown.html`, `module_mt_executive_summary.html`, `module_mt_breakdown.html`, `module_ecom_executive_summary.html`, `module_ecom_breakdown.html`, `sales_overview.html`, `sales_overview_product_analysis.html`) — ส่วน TT Overview เดิมเป็นไฟล์เดียวรวม 3 Tab ขนาดใหญ่มาก (~500KB) จึงแยกเป็น 3 ไฟล์อิสระ (`tt_executive_summary.html`, `tt_breakdown.html`, `tt_sales_person.html`) ใช้ Engine กลางของตัวเอง (`tt-shared.css`/`tt-shared.js`, แยกจาก `shared.css`/`shared.js` เพราะชื่อ Class ชนกัน) — `render()` ใน `tt-shared.js` คำนวณข้อมูลของ Executive Summary และ Breakdown พร้อมกันในรอบเดียวโดยตั้งใจ (ไม่แยก Mock Data ซ้ำสองชุด) ทั้ง 2 ไฟล์จึงเรียกฟังก์ชันเดียวกัน — ECOM Overview สร้างตาม Pattern เดียวกับ MT ตั้งแต่แรก (แยก 2 ไฟล์อิสระ ไม่มี Tab เดียวรวม #hash) เพราะมีโครงสร้างใกล้เคียง MT มากที่สุด (มีหน่วยขายย่อยหลายหน่วย คือ Platform Lazada/Shopee/TikTok/Line Shop และไม่มี Region/Sales Person filter)

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

**Header/Topbar (มุมขวาบนทุกหน้า):** Logo + Brand + Navigation Menu (ซ้าย) ↔ ชื่อ User + Role (Text ธรรมดา ชิดขวา) + Avatar วงกลม (พื้นหลัง Wine tone อ่อน `--brand-wash`, ตัวอักษร Wine เข้ม `--brand` — ไม่ใช่พื้นทึบตัวอักษรขาว) + ปุ่มสลับ Dark Mode (วงกลมเส้นขอบ) (ขวา) — เป็น Text/Icon แสดงผลอย่างเดียวทุกหน้า **ไม่มีปุ่มกดเปิด Dropdown** (TT Overview เคยมี "User Badge" เป็นปุ่มกดเปิด Panel มาก่อน ตัดออกเมื่อ 2026-07-31 พร้อมปรับสี Avatar และทรงปุ่ม Dark Mode ให้ตรงกับ Sales Overview/MT Overview เป๊ะ เพราะ Panel เดิมไม่มีเนื้อหาที่มีประโยชน์อีกต่อไปหลัง Sales Person แยกไฟล์) — ECOM Overview ใช้ Pattern เดียวกันเป๊ะตั้งแต่สร้าง ไม่เคยมี User Badge แบบเดิมของ TT

**Filter Bar:**
- Period selector ทุกหน้า: This Month / Last Month / This Quarter / Last Quarter / Year to Date (default) / Trailing 12 Months / Custom Range
- หน้า Breakdown (เฉพาะ Channel Overview) มี Filter เพิ่มตามบริบท: Region/Category/Sales Person (TT), Category/Key Account Manager (MT) — ECOM Breakdown มีแค่ Period + Category (Category ปัจจุบันใช้งานได้แค่ "All Categories" เหมือน MT/TT)
- หน้า Executive Summary / Executive Outlook / Product Analysis มีแค่ Period อย่างเดียว (ไม่มี Filter ย่อย)
- Shortcut "ดูของฉันอย่างเดียว" ไม่บังคับมีทุก Channel และไม่ใช่ Component ใช้ร่วมกัน — แต่ละ Channel ทำเอง เพราะความหมาย "ของฉัน" ไม่เหมือนกัน: MT มี "My accounts only" (Scope ตาม Key Account Manager ที่เลือก, ใช้งานได้จริง) ส่วน TT **ไม่มี** "My stores only" แล้ว (ของเดิมอ่านค่า Rep ที่เลือกอยู่จากหน้า Sales Person ผ่าน JS Memory ร่วมกัน ใช้ได้เพราะตอนนั้นทั้ง 3 Tab อยู่ไฟล์เดียวกัน — พอแยกเป็น 3 ไฟล์อิสระ (2026-07-31) Memory ข้ามหน้าแบบนี้ใช้ไม่ได้อีกต่อไป ตัดออกแทนที่จะสร้างใหม่ด้วย URL Parameter) — ECOM Overview **ไม่มี** Filter รายบุคคลเลยตั้งแต่แรก (ไม่มี Platform Owner selector หรือ "My platforms only") เพราะ Ecom ไม่มีแนวคิด Owner ต่อ Platform ที่ชัดเจนพอจะทำ Scope แบบเดียวกับ KAM/Sales Rep — Filter Bar ของ ECOM Breakdown จึงเหลือแค่ Period + Category และทุก Zone เป็น Company-wide Ecom เสมอ

**หลักการ Hierarchy Level Selector (Category → Sub-Category → Type → Series):**
- ถ้าหน้าใดมีหลาย Component ที่ต้องมองข้อมูลที่ระดับเดียวกัน (เช่น Product Analysis: Heatmap, Channel Index, Portfolio Matrix, Share Over Time, Sales by Category) ให้ใช้ **Level Selector ตัวเดียวตัวเดียวที่จุดเดียว** ควบคุมทุก Component พร้อมกัน — **ห้ามมี Selector แยกในแต่ละการ์ด** เพื่อไม่ให้ข้อมูลระหว่างการ์ดไม่ตรงกัน
- แสดงผลแบบ **"Top View" จัดอันดับแบบ Flat** — เมื่อเลือก Sub-Category จะเห็น Sub-Category ที่ขายดีที่สุด **ของทั้งหมดทุก Category รวมกัน** จัดอันดับตามยอดขาย (ไม่ใช่ Breadcrumb Drill ทีละชั้น) — ชื่อ Category แม่แสดงเป็นตัวอักษรเล็กสีจางกำกับไว้ใต้ชื่อเพื่อบอก Context
- ระดับที่ลึกกว่า Category (Sub-Category/Type/Series มี 12/24/48 รายการ) ให้ตัดแสดงเฉพาะ Top N ตามความเหมาะสมของ Component นั้น (List/Table แสดงได้มากกว่า เช่น Top 10, ส่วน Chart ที่มีข้อจำกัดเรื่องความหนาแน่น เช่น Scatter/Stacked Area/Grouped Bar ควรจำกัดที่ Top 6-8) พร้อมลิงก์ "See all N →" ไปดูรายการเต็ม — ECOM Breakdown's "Top/Bottom SKU" อ้างอิงระดับ Series นี้เช่นกัน (ดูข้อ 5.5)

**หลักการ Diverging Bar Chart (ใช้ Baseline ที่ไม่ใช่ 0):** เมื่อกราฟ Bar ต้องเทียบกับค่าอ้างอิงที่ไม่ใช่ 0 (เช่น Index = 100) แท่งต้องยื่นขึ้น/ลงจาก**ค่าอ้างอิงนั้นโดยตรง** ไม่ใช่ยื่นจาก 0 เสมอ (ไม่งั้นกราฟจะดูเป็นแท่งสูงเท่ากันหมดกระจุกอยู่บนสุด ไม่สื่อความหมาย Over/Under ที่ต้องการ) และ Y-axis Domain ต้องคำนวณล้อมรอบค่าอ้างอิงนั้น ไม่ใช่บังคับรวม 0 เข้าไปเสมอ

**สถาปัตยกรรมไฟล์ต่อมุมมอง — บทเรียนจาก TT:** แต่ละมุมมอง (Executive Summary / Breakdown / Sales Person ฯลฯ) ควรแยกเป็นคนละไฟล์ตั้งแต่เริ่มสร้าง ไม่รวมหลาย Tab ไว้ในไฟล์เดียวแล้วสลับด้วย JS + URL `#hash` (Pattern เดิมที่ TT เคยใช้ ก่อนแยกเป็น 3 ไฟล์เมื่อ 2026-07-31 เพราะไฟล์เดียวบวมถึง ~500KB แก้ไขยาก) — Component คำนวณข้อมูล (Mock Data Generation, Aggregation, Chart-rendering) ที่ใช้ร่วมกันหลายมุมมอง ให้แยกเป็นไฟล์ Engine กลาง (เช่น `shared.js`) ให้แต่ละไฟล์หน้าเรียกใช้แทนการเขียนซ้ำ ปัจจุบันไม่มีมุมมองไหนใช้ Pattern `#hash` ในไฟล์เดียวอีกแล้ว (`initHashTabs` ใน `nav-menu.js` เหลือไว้เผื่อมุมมองใหม่ในอนาคตเท่านั้น) — ECOM Overview ยึดบทเรียนนี้ตั้งแต่วันแรก แยกเป็น `module_ecom_executive_summary.html`/`module_ecom_breakdown.html` ทันที ไม่เคยผ่าน Pattern ไฟล์เดียวมาก่อน

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
| ความครอบคลุม | Active Stores/Partners, Retention | Active Shop Listings |
| ทีมงาน | Sales Rep, Visit Compliance (TT) / Key Account Manager (MT) | Platform Owner (แนวคิดเท่านั้น — ไม่มี Filter จริงในระบบ ดูข้อ 3.4) |
| ราคาเฉลี่ย | — | Average Order Value (AOV), Conversion Rate |
| Label "Active Units" ในตารางเทียบ Channel | MT = Active Partners, TT = Active Stores | Ecom = Active Shop Listings |

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
| Sales by Channel | Donut (ครึ่งซ้าย) — มี % Label บนกราฟโดยตรง — **แก้ 2026-08-06:** ตัด Badge "Best"/"Watch" ที่ Legend ออก (เดิมมีต่อ Channel ที่ Attainment สูงสุด/ต่ำสุด) ตามที่ผู้ใช้ขอ — ลบ `bestGroup`/`watchGroup` ออกจาก `latestData.channel` และคอลัมน์ "Status" ในตารางไปด้วย (ไม่มีใครใช้อีกแล้ว) |
| Sales by Category | Horizontal Bar (ครึ่งขวา, รองรับ Sub-Category/Type/Series ตามหลักการ Level Selector ข้อ 3.4) |

**Section 3 — Channel Comparison:**

| Metric/Chart | ประเภท/สูตร |
|---|---|
| Channel Snapshot Cards ×3 | Net Sales + Attainment + Growth YoY แบบสรุปสั้น พร้อมคลิกเข้า Channel Overview นั้นได้ (TT, MT, Ecom พร้อมใช้งานทั้งหมด) — ทำหน้าที่เป็นทางเข้า (Navigation) สู่หน้า Channel Overview เป็นหลัก จึงยังคงไว้แม้เนื้อหาจะคาบเกี่ยวกับกราฟ Net Sales ด้านล่างบ้าง |
| Net Sales: Last Year vs This Year vs Target | Grouped Bar 3 แท่งต่อ Channel (MT/TT/Ecom เท่านั้น ไม่มีคอลัมน์ Company — ยอด Company ดูได้จาก KPI Card ด้านบน) This Year bar มี Data Label 2 บรรทัด (Net Sales ฿, Growth YoY % สีตามเครื่องหมาย) Target bar มี Attainment % (เขียว ≥100%/เหลือง 90-99%/แดง <90%) + Diff from Target ฿ Last Year bar มีแค่ Net Sales ฿ — เป็นกราฟหลักสำหรับเทียบ Performance ข้าม Channel แทนตารางเปรียบเทียบแบบเดิม ปุ่ม "ดูเป็นตาราง" แสดงตัวเลขละเอียดครบ 6 คอลัมน์ (Last Year, This Year, Growth YoY, Target, Attainment %, Diff from Target) **Responsive:** จำนวน Data Label ต่อแท่งลดหลั่นตามความกว้างหน้าจอ (ดูหลักการทั่วไปที่ข้อ 3.4) |
| Revenue Trend by Channel | Line Chart ทับกัน 3 Channel + Checkbox เลือกเปิด/ปิด Channel (ครึ่งซ้ายของ Chart Grid) |
| Channel Growth Comparison (YoY) | Line Chart 3 เส้น (MT/TT/Ecom, ครึ่งขวาของ Chart Grid เดียวกับ Revenue Trend by Channel) แสดงเฉพาะเดือนที่มีข้อมูลจริง (ไม่โชว์เดือนอนาคตเป็นพื้นที่ว่างเปล่า) Subtitle บอกช่วงเดือนที่แสดงแบบ Dynamic — คำนวณแบบ Month-by-month เต็มปี ไม่ผูกกับ Period Filter ด้านบนของหน้า (รายละเอียดอยู่ใน Info Icon) |
| Channel Mix Over Time | 100% Stacked Bar รายไตรมาส (Q1/25 ถึงไตรมาสล่าสุด) — Data label ทั้ง % และ ฿ บนทุก Segment + Insight Caption ใต้กราฟ สรุป Mix Shift First-period vs Last-period ต่อ Channel (สีเขียว/แดงตาม pp เปลี่ยนแปลง) + ปุ่มดูตารางรายเดือนละเอียด |

**Section 4 — What's Driving It:**

| Metric/Chart | ประเภท/สูตร |
|---|---|
| Growth Contribution Waterfall | Waterfall Chart: Last Year YTD (เริ่ม) → ผลต่างยอดขาย (ปีนี้−ปีก่อน) ของ MT/TT/Ecom ทีละแท่ง (เขียว=บวก,แดง=ลบ) → This Year YTD (จบ) + Insight Caption ใต้กราฟ (Total Growth ฿+% และ Top Contributor Channel) |
| Return / Cancellation Rate Trend | Line Chart รายเดือน 3 เส้นอิสระต่อกัน (MT, TT, Ecom — Rate Series อิสระต่อ Channel ดู 6.2) เส้นประ = Threshold 5% แต่ละเส้นแสดงทั้ง % และมูลค่า ฿ คู่กัน (จุดล่าสุดบนกราฟ + Insight Caption ใต้กราฟ สรุปค่าเฉลี่ยของ Period ต่อ Channel + ตารางแบบละเอียดเมื่อกดดู) — **แก้ 2026-08-06:** Legend/Info-text เปลี่ยน Label "Ecom (Cancellation)" → **"Ecom (Return/Cancellation)"** เพราะ Ecom ครอบคลุมทั้งการคืนสินค้าหลังจัดส่งและการยกเลิกออเดอร์ก่อนจัดส่ง ไม่ใช่แค่ Cancellation อย่างเดียว (`ecomCancelRate` ชื่อตัวแปรเดิมไม่แก้ เป็น Internal Identifier ไม่ใช่ Label ที่แสดงผล) |

Layout: Waterfall + Return/Cancellation Rate Trend อยู่คู่กันใน Chart Grid เดียว (ครึ่งซ้าย-ขวา)

### 5.2 Sales Overview → Product Analysis

**Section Shortcut Nav:** แถบปุ่มลอย (Pill) ใต้ Filter Bar เหมือนหน้า Executive Outlook — กดแล้ว Scroll ตรงไปยัง Zone A/B/C/D โดยไม่ต้องเลื่อนผ่านทั้งหน้า

**Filter Bar:** Period (เหมือนหน้าอื่น) + **Channel** (All/MT/TT/Ecom) + **Product Level** (Category/Sub-Category/Type/Series) + **Focus** — ทั้งหมดเป็น Filter ระดับหน้า (Page-level) อยู่แถวเดียวกับ Period ไม่ใช่ Control ย่อยในแต่ละการ์ด ควบคุม Zone C + D ทั้งหมด (Portfolio Matrix, Growth Contribution, Share Over Time, Sales by Category, Growth Ranking); Product Level ควบคุม Zone B (Heatmap, Channel Index) ด้วย แต่ **Channel Filter ไม่กระทบ Zone B โดยตั้งใจ** เพราะ Heatmap/Channel Index มีไว้เปรียบเทียบข้าม Channel จึงต้องโชว์ครบทุก Channel เสมอ — ข้อความสรุป Scope ปัจจุบัน (เช่น "MT · Sub-Category focus · Cleansing only") แสดงมุมขวาของ Filter Bar

**Focus (Drill-down):** เลือก Node เดียวจากระดับที่ตั้งไว้ใน Product Level (เช่น Level = Sub-Category, Focus = "Cleansing") ตัวเลือกใน Dropdown จะเปลี่ยนตาม Level ที่เลือกเสมอ (Reset เป็น "All" ทุกครั้งที่เปลี่ยน Level) — แทนที่จะตัดกราฟทุกอันเหลือแค่ 1 Node (ซึ่งจะทำให้ Chart เปรียบเทียบอย่าง Portfolio Matrix/Heatmap ไม่มีความหมาย) ระบบจะ **Pin + Highlight** Node ที่ Focus ไว้ในทุก Component ที่เกี่ยวข้องแทน แม้ Node นั้นจะไม่ติด Top-N ตามปกติก็ตาม: คอลัมน์ Heatmap และแท่ง Channel Index Highlight สีพื้นหลัง/กรอบ, จุดใน Portfolio Matrix ใหญ่ขึ้น, แท่งใน Growth Contribution Waterfall และ Pareto / Concentration Analysis ถูก Pin เข้า Top 8 เสมอ, แถวใน Sales by Category/Growth Ranking/Return-Cancellation Rate by Category มีกรอบ Highlight — Zone A (KPI ภาพรวมบริษัท) ไม่ถูก Focus กระทบ เพราะเป็น Metric ระดับบริษัทโดยนิยาม

**Zone A — Category Performance Overview:**

| Metric | รายละเอียด |
|---|---|
| Top Category | Category ยอดขายสูงสุดของบริษัท |
| Fastest Growing Category | Category ที่ Growth YoY สูงสุด |
| Best Category per Channel ×3 | Callout Card, แถบซ้ายสีตาม Channel, แสดง Category อันดับ 1 + % สัดส่วนภายใน Channel นั้น |

**Zone B — Cross-Channel Analysis** (Full width, เรียงเป็นแนวตั้งทีละการ์ด ไม่ใช่ 2 คอลัมน์คู่กันอีกต่อไป):

| Metric/Chart | ประเภท/สูตร |
|---|---|
| Channel × [ระดับที่เลือก] Heatmap | Table **Transpose**: แถว = Channel (MT/TT/Ecom, คงที่ 3 แถว), คอลัมน์ = Node ตามระดับที่เลือก (เรียงยอดขายมากไปน้อย, สูงสุด 20 คอลัมน์) — เลื่อนดูแนวนอนได้เมื่อคอลัมน์เยอะ (ระดับ Type/Series), Cell = ยอดขาย + % Row-normalized, สีเข้ม-อ่อนตาม % |
| Channel Index by [ระดับที่เลือก] | อยู่ใต้ Heatmap เสมอ, **Diverging Bar Chart, Baseline = Index 100** (ไม่ใช่ 0) — แท่งยื่นขึ้น = Over-index, ยื่นลง = Under-index, สีแท่ง = Channel Identity (ไม่ใช่เขียว/แดง), มีเลข Index บนปลายแท่งทุกแท่ง, เส้นประ Reference ที่ 100 (Top 8) + Insight Caption ใต้กราฟสรุป Node/Channel ที่ Over-index และ Under-index สูงสุด |

**Zone C — Portfolio Strategy** (Sync Level + Channel Filter จาก Filter Bar ด้านบนเสมอ):

| Metric/Chart | ประเภท |
|---|---|
| Category Portfolio Matrix | Scatter 4-Quadrant — แกน X (ยอดขาย) และ Y (%Growth YoY) มี Gridline + Tick value กลม (niceAxisTicks), เส้นแบ่ง Quadrant ที่ค่ามัธยฐานจากข้อมูลดิบ, Label มุม Stars/Question Marks/Cash Cows/Dogs — จุดที่แสดง = **Top 6 by Sales บวก Node ที่ Growth สูงสุด/ต่ำสุด (ถ้ายังไม่ติดโผ)** ไม่ใช่ Top 6 by Sales ล้วนๆ เพราะ Node ยอดขายน้อยแต่โตเร็ว (ตัวจริงของ Quadrant "Question Marks") มักหลุด Top-N by Size ไปก่อน — Subtitle ใต้หัวกราฟบอกจำนวนจุดที่แสดงจริงเสมอ |
| [ระดับที่เลือก] Growth Contribution | Waterfall — แทนที่ Category Share of Sales Over Time เดิม (ย้ายไป Full Width ด้านล่างแล้ว) แนวคิดเดียวกับ Growth Contribution Waterfall ของ Executive Outlook แต่เป็นระดับ Category/Sub-Category/Type/Series แทน Channel — "ปีก่อน" ต่อ Node ประมาณจากยอดขายปีนี้หารด้วย (1+%Growth YoY ของ Node นั้น) เพราะ Mock Data ไม่มี Time Series จริงระดับ Category (มีแต่ %Growth YoY เป็นค่าคงที่ต่อ Node) — คำนวณจาก `syncedAll` (Node Set เดียวกับที่ Sync Level+Channel Filter) เสมอ เพื่อให้ Start+ผลรวม Delta ตรงกับ End เป๊ะไม่ว่าจะกรอง Channel หรือไม่ — จำกัด Top 8 by \|Contribution\| + Focus Pin ที่เหลือรวมเป็นแท่ง "Other (N)" — **แก้ 2026-08-06 (Feedback):** ด้วยจำนวนแท่งสูงสุดถึง 10 (Start+8+Other+End) Label แนวนอนเดิมชนกัน — เพิ่ม Field ใหม่ `opts.rotateLabels` ใน `buildWaterfallSVG` (`shared.js`, Backward-compatible, Default false) วาด Label เอียงแทน (`text-anchor="end"` + `transform="rotate(...)"`, เพิ่ม `padB` จาก 34→54 เพื่อเผื่อพื้นที่แนวทึบ) เปิดใช้เฉพาะ Call Site นี้ (`rotateLabels:true`) — Waterfall Caller อื่น (Executive Outlook, MT/ECOM Executive Summary, P&L) ไม่ได้รับผลกระทบ — **แก้เพิ่ม 2026-08-06 (Feedback รอบสอง):** ใส่เครื่องหมายมุมผิด (`rotate(-35 ...)`) ตอนแรก — ใน SVG (Y ชี้ลง) มุมลบกวาด Label ลง**ต่ำกว่า**เส้น Baseline เดิม ไม่ใช่ขึ้นไปในพื้นที่ `padB` ที่เผื่อไว้ ทำให้ Label ยาวๆ ทะลุลงไปทับ Insight Callout ที่อยู่ใต้กราฟ (Sibling Element ถัดไปใน DOM, ไม่ถูก Clip เพราะ SVG ไม่ได้ตั้ง `overflow:hidden`) — แก้เป็น `rotate(35 ...)` (บวก) กวาด Label ขึ้นไปทางซ้ายในโซน `padB` ที่เผื่อไว้แทน ยืนยันด้วย `getBoundingClientRect()` จริงว่า Label ไม่ทับ Callout อีกแล้ว — **แก้เพิ่ม 2026-08-06 (Feedback รอบสาม):** ผู้ใช้ขอปรับมุม Label เป็น 90° (แนวตั้งเต็ม) — `opts.rotateLabels` เปลี่ยนจาก Boolean เป็นรับได้ทั้ง `true` (Default 35° เดิม, Backward-compatible) หรือจำนวนองศาที่ต้องการ (Call Site นี้ใช้ `rotateLabels:90`) พร้อมเปลี่ยน `padB` จากค่าคงที่เดา (54) เป็นคำนวณจริงจาก `measureTextWidth()` (Reuse Helper เดียวกับที่แก้ `buildScatterSVG` ไปก่อนหน้า) × `sin(มุม)` ทำให้ได้ระยะ Padding ที่แม่นยำไม่ว่าจะเป็นมุมไหนหรือ Label ยาวแค่ไหน ไม่ต้องเดาค่าคงที่ใหม่ทุกครั้งที่เปลี่ยนมุม |
| Category Portfolio Matrix | Scatter 4-Quadrant (ดู Zone C ด้านบน) | **แก้ 2026-08-06 (Feedback):** เพิ่ม Insight Callout ใต้กราฟ (Element ใหม่ `#matrixCallout`, เดิมไม่มี Callout เลยมีแต่ Label มุม Quadrant) — คำนวณ Median X/Y เอง (เรียก `median()` จาก `shared.js` แบบเดียวกับที่ `buildScatterSVG` ใช้ภายใน เพื่อให้ Quadrant ที่ Callout อ้างอิงตรงกับที่กราฟวาดจริงเป๊ะ) จัดกลุ่มจุดเข้า 4 Quadrant แล้วพูดถึง Node ที่ใหญ่สุด (by Sales) + โตเร็วสุด (by Growth) เป็น Headline พร้อม List รายชื่อ Node ใน "Question Marks" (เล็กแต่โตเร็ว น่าลงทุนเพิ่ม) และ "Dogs" (เล็กและนิ่ง/ลด น่า Review) เป็น 2 Quadrant ที่ Actionable ที่สุด |

**Category Share of Sales Over Time** (Full Width, อยู่ใต้ Chart Grid ของ Zone C ก่อนเข้า Zone D): ปรับ Design ให้ตรงกับ Channel Mix Over Time ของ Executive Outlook ทุกจุด — เปลี่ยนจาก Stacked Area เป็น **100%-Stacked Bar** (`buildStacked100BarSVG`) มีตัวเลข % และ ฿ บนแท่งตรงๆ ไม่ต้องเปิดดูตารางเพื่ออ่านค่าแม่นยำ, Insight Caption ใช้ Wording เดียวกัน ("Mix shift, [ช่วงแรก]→[ช่วงหลัง] — Node: a%→b% (Δpp) ...") — **แตกต่างจาก Channel Mix ตรงความถี่**: คงไว้ที่ระดับ**รายเดือน** (18 เดือน) ไม่ใช่รายไตรมาสแบบ Channel Mix เพราะการบริหาร Product มักต้องดูละเอียดกว่าระดับ Channel — Top 6 Node เท่าเดิม (ตาม Level ที่เลือก, บวก Focus Pin)

**Zone D — Category Deep-dive** (Sync Level + Channel + Focus Filter เดียวกับ Zone C, จัดเป็น Chart Grid 2 คอลัมน์ ที่ห่อบรรทัดเป็น 2x2 เพราะมี 4 การ์ด):

| Metric/Chart | ประเภท |
|---|---|
| Sales by Category | Horizontal Bar, Top View จัดอันดับตามขนาดยอดขาย Flat (Top 10 + See all N) |
| Growth Ranking | Horizontal Bar จัดอันดับตาม **%Growth YoY** แทนขนาด (มุมมองคนละมิติจาก Sales by Category) — **แยก 2 กลุ่มทิศทางเดียวกัน** "Fastest Growing" (เขียว) กับ "Declining" (แดง) แทนแท่งเดียวที่มีทั้งบวกลบ เพื่อไม่ต้องตีความเครื่องหมาย — แต่ละกลุ่มจำกัด 5 Node (น้อยกว่านั้นถ้ามีไม่ครบ), หมายเลข Rank ที่กำกับคือ Rank จริงในภาพรวมทั้งหมด ไม่ใช่ลำดับในกลุ่มย่อย — **ความยาวแท่งคำนวณจาก Max \|Growth\| ตัวเดียวร่วมกันทั้ง 2 กลุ่ม** (ไม่ใช่ Max แยกต่อกลุ่ม) เพื่อให้ขนาดแท่งเทียบกันข้ามกลุ่มได้ตรงจริง (เช่น +22.6% ต้องยาวกว่า -4.2% เห็นชัด ไม่ใช่ทั้งคู่ยืดเต็มเพราะเป็นค่ามากสุดในกลุ่มตัวเอง) |
| Pareto / Concentration Analysis | `buildParetoSVG` — แท่ง = %ยอดขายของแต่ละ Node ต่อยอดขายรวม (เรียงมากไปน้อย), เส้น = %สะสม (Cumulative) บนแกน 0-100% เดียวกัน, เส้นประ Reference ที่ 80% แท่งที่เลย 80% สะสมแล้วจะจางสี — ตอบคำถาม "กี่ Node ที่คิดเป็นสัดส่วนหลักของยอดขาย" จำกัด Top 8 by ยอดขาย + Focus Pin ที่เหลือรวมเป็นแท่ง "Other (N)" เพื่อให้เส้นสะสมยังจบที่ ~100% จริงแม้ที่ระดับ Type/Series ที่มี Node เยอะ |
| Return / Cancellation Rate by Category | Horizontal Bar (Pattern เดียวกับ Sales by Category/Growth Ranking) จัดอันดับ %Return/Cancellation Rate จากสูงไปต่ำ (Top 10 + Focus Pin) — Rate เป็นค่าคงที่ต่อ Category (Mock Field `returnRate` บน `CATEGORY_TREE`) Inherit ลงไปทุกชั้นเหมือน `growthYoY`/`channelMix` — เส้นอ้างอิง 5% ตามมาตรฐานเดียวกับ Return/Cancellation Rate Trend ของ Executive Outlook, สีแท่งข้าม Threshold: เขียว (≤5%) / แดง (>5%) — ความยาวแท่งคำนวณจาก Max Rate ตัวเดียวร่วมกันทั้ง Node Set (บทเรียนเดียวกับ Growth Ranking) แต่ละแท่งแสดงทั้ง % และมูลค่า ฿ โดยประมาณ |

ทุก Chart Card ใน Product Analysis (Heatmap, Channel Index, Portfolio Matrix, Growth Contribution, Share Over Time, Sales by Category, Growth Ranking, Pareto / Concentration Analysis, Return/Cancellation Rate by Category) มี Toolbar ดูเป็นตาราง/ดาวน์โหลด/ขยายเต็มจอ ครบเหมือนหน้า Executive Outlook

### 5.3 MT Overview

**Executive Summary — KPI (3 การ์ด, สไตล์ Hero Card):** Net Sales (MT), Target Attainment %, Return Rate (CN) — ตัด AR% ออก เพราะไม่ใช่ Focus หลักของหน้านี้ (ยังดูละเอียดได้ที่ AR Aging ใน Breakdown), ตัด Active Partners ออก เพราะจำนวนคู่ค้าเปลี่ยนช้ามาก ไม่ใช่ตัวเลขที่ต้องเช็คถี่ระดับ Executive, ตัด Partner Retention ออก เช่นกัน (ย้ายมุมมอง "ใครขับเคลื่อนอะไร" ไปให้ Growth Contribution Waterfall ด้านล่างตอบแทน ซึ่งมีความหมายเชิงบริหารมากกว่า) — ไม่มีการ์ด Growth YoY/Growth MoM แยก เพราะซ้ำกับแถว MoM/YoY ที่มีอยู่แล้วในการ์ด Net Sales/Target Attainment ตามหลักการเดียวกับที่ปรับ Sales Overview — **ใช้ Layout แบบเดียวกับ Sales Overview — Executive Outlook** (`kpi-value-line` รวม Value+Unit+Caption บรรทัดเดียว + Insight Caption แถบล่างมีเส้นคั่นบนสุด) แทน Layout การ์ดเล็กเดิม เพราะเหลือแค่ 3 การ์ดแล้วยืดเต็มความกว้างจอ Layout เดิม (ค่า+Caption เรียงแนวตั้งชิดซ้าย) จะดูโหว่ตรงกลาง-ขวาการ์ด: Net Sales มี Insight "Top account" ท้ายการ์ด, Target Attainment มี "Gap to Target", Return Rate มี "Amount + Highest Return Rate account" (ใช้ประโยชน์จาก field `ret` ต่อคู่ค้าที่มีอยู่แล้วแต่ไม่เคยถูกแสดงมาก่อน)

**Revenue Trend + Monthly YoY Growth %** (Chart Grid 2 การ์ด — **แก้ 2026-08-06**: เพิ่ม Monthly YoY Growth % กลับเข้ามาจับคู่กับ Revenue Trend ตาม Pattern เดียวกับ ECOM/TT Executive Summary ที่มีอยู่แล้ว (Copy Layout+JS มาจาก `module_ecom_executive_summary.html` เป๊ะ เพราะใช้ `shared.js` Engine เดียวกัน) — ย้อนกลับ Fix เดิมที่ตัดกราฟนี้ออกไปก่อนหน้านี้ตามคำขอผู้ใช้รอบนี้; ตัวเลข +/-% ที่แสดงตรงกับแถว YoY ของการ์ด Net Sales (MT) เสมอเพราะคำนวณจากอนุกรมเดียวกัน `groupActual.MT`)

**Key Account Portfolio** (Section รวมทุก Metric/Chart ที่มองในมุมคู่ค้ารายบุคคลไว้ด้วยกัน):

| Metric/Chart | ประเภท |
|---|---|
| Sales by Key Account + Sales by Category | จัดคู่กัน (Chart Grid) เหมือน Sales Overview — Executive Outlook ที่วาง "Sales by Channel" คู่ "Sales by Category" — Sales by Key Account เป็น Donut (เปลี่ยนจากชื่อ Format Placeholder เดิม เป็น**ชื่อคู่ค้าจริงในตลาดไทย**: WATSONS, EVEANDBOY, Lotus's, 7-Eleven, KONVY, CJ Express, Beautrium, Tsuruha, Multy — ตัวเลข % ส่วนแบ่งและสถิติทั้งหมด (Attainment/Return Rate/AR%/Growth YoY) ยังเป็น Mock Data ไม่ใช่ข้อมูลจริงของคู่ค้า) ส่วน Sales by Category มี **Product Level Toggle ในตัวการ์ดเอง** (Category/Sub-Category/Type/Series — ปุ่ม Local เฉพาะการ์ดนี้ ไม่ใช่ Filter ระดับหน้าแบบ Product Analysis) โครงสร้าง `CATEGORY_TREE` copy มาจาก Product Analysis (โครงสร้าง Sub/Type/Series เท่านั้น) แต่ระดับ Category (Depth 0) ยังคงใช้ตัวเลข `mtCategoryShares` เดิมเป๊ะ (ตัวเลขเดียวกับที่ P&L Copy ไป) ส่วนระดับลึกกว่าคำนวณจากสัดส่วนภายใน `CATEGORY_TREE` คูณทบลงมาบนตัวเลข Category เดิม — แสดง Top 10 ต่อระดับ พร้อม Caption "Top 10 of N" เมื่อเกิน — **แก้ 2026-08-06**: เพิ่ม Sub-label (Parent Category ตัวเล็กสีจางใต้ชื่อ Node) ที่ระดับลึกกว่า Category ตามหลักการ Level Selector มาตรฐาน (§3.4) ที่ Product Analysis ใช้อยู่แล้ว — ก่อนหน้านี้ MT ไม่มี Context นี้ |
| Partner Concentration / Pareto | `buildParetoSVG` (ฟังก์ชันเดียวกับ Product Analysis) — แท่ง %ยอดขายต่อคู่ค้า + เส้นสะสม, เส้นประ Reference 80%, แท่งเลย 80% จางสี — ตอบคำถาม "กี่คู่ค้าที่คิดเป็นสัดส่วนหลักของยอดขาย MT" คู่ค้ามีแค่ 9 รายทั้งหมด (List คงที่ ไม่มี Level Drill-down แบบ Product Analysis) จึงแสดงครบทุกรายโดยไม่ต้อง Cap Top-N/"Other" |
| Key Account Growth Contribution | Waterfall (`buildWaterfallSVG`) — แนวคิดเดียวกับ Category Growth Contribution ใน Product Analysis: "ปีก่อน" ต่อคู่ค้าประมาณจากยอดขายปีนี้หารด้วย (1+%Growth YoY ของคู่ค้านั้น ซึ่งเป็นค่าคงที่ Mock ต่อราย ไม่ใช่ Time Series จริง) คำนวณ Start/End จากผลรวม Bottom-up เสมอเพื่อให้ Start+ΣDelta ตรงกับ End เป๊ะไม่ว่าจะกรอง Period ไหน — บอกว่าคู่ค้ารายไหน Contribute การเติบโตกี่ ฿ จริง คนละมุมกับ Donut ที่เห็นแค่สัดส่วน ณ ปัจจุบัน |

**แก้ 2026-08-06 (ตัด Store Performance Section ออกจาก Executive Summary):** ย้าย Section "Store Performance (5 of 9 Key Accounts)" ทั้ง Section (Avg Sales per Store by Partner + Store Productivity Distribution) ไปที่ Store Tab แทน ตามที่ระบุไว้แต่แรกว่าออกแบบให้ย้ายได้ทันทีโดยไม่ต้องออกแบบใหม่ (ดูหัวข้อ "Store" ด้านล่างว่าไปรวมกับ Component เดิมของ Store Tab ตรงไหน) — เอา `storeCount`/`storeWeights` ที่ไม่ใช้แล้วออกจาก `keyAccounts` Mock Data ในไฟล์นี้ด้วย (Store Tab มี Data Model ของตัวเองอยู่แล้ว ไม่กระทบ) — Section Nav ของ Executive Summary เหลือ 2 ลิงก์ (Executive Summary / Key Account Portfolio)

**แก้ 2026-08-06 (Sub Module Navigation):** เพิ่ม `<nav class="section-nav">` ใต้ Filter Bar ชี้ไปที่ `id` บน Section Label ที่มีอยู่แล้ว — ให้ Executive Summary มี Sub Module Jump Navigation แบบเดียวกับที่ Breakdown มีอยู่แล้วจากรอบก่อน (ผู้ใช้ยืนยันให้ทำแบบ Jump-nav เหมือนกัน ไม่ใช่ Tab Panel แยกมุมมอง) — ไม่มีการย้าย/ลบ Content ใดๆ แค่เพิ่ม Anchor ครอบ Section ที่มีชื่ออยู่แล้ว

**แก้ 2026-08-04**: ตัด "Target Attainment by Key Account" (Diverging Bar) ออกจาก Executive Summary ทั้งหมด — ระหว่างตรวจพบว่า `buildHBarCompareSVG` (ฟังก์ชันที่ใช้ร่วมกับ "Target vs Actual per Partner" ใน Breakdown, ECOM Breakdown, และ P&L Breakdown) ไม่เคยวาด Axis Tick/Gridline เลยตั้งแต่แรก มีแค่เส้นประ Reference เส้นเดียว ทำให้ผู้ใช้อ่าน Scale ไม่ออกว่าแต่ละแท่งห่างจาก 100% แค่ไหน — **แก้ที่ตัว `shared.js` โดยตรง** (เพิ่ม Gridline+Tick Label แบบ `niceAxisTicks` เหมือน `buildGroupedBarSVG`) ซึ่งมีผลดีขึ้นทันทีกับทุกกราฟที่เรียกใช้ฟังก์ชันนี้ ไม่ใช่แค่กราฟที่ถูกตัดออกไป — ส่วนกราฟตัวนี้เองผู้ใช้ตัดสินใจตัดออกจาก Executive Summary ไปเลยหลังเห็นปัญหา Scale (ยังมีอยู่ใน Breakdown → Partner Performance ในชื่อ "Target vs Actual per Partner")

ตัด Ranking — Top Key Accounts by Net Sales (Table) ออกจาก Executive Summary เพราะข้อมูลเดียวกัน (ยอดขาย + Attainment ต่อคู่ค้า) ตอนนี้เห็นครบกว่าเดิมผ่าน Donut + Pareto + Waterfall ด้านบนแล้ว ไม่ต้องมีตารางซ้ำ (Ranking แบบละเอียดครบทุกรายยังมีอยู่ใน Breakdown → Partner Performance)

**Breakdown (ข้อมูลคู่ค้า):** ตัด Page Subtitle ออก (แก้ 2026-08-04 ตามหลักการเดียวกับ Executive Summary — ชื่อ Section/Card อธิบายตัวเองพออยู่แล้ว)

**Execution quality pass (แก้ 2026-08-05):** ผู้ใช้ขอให้ยกระดับ Breakdown ให้ใกล้เคียงมาตรฐาน "TT Overview — Breakdown" ด้าน Navigation/Drill-through/Chart Quality โดยไม่ Copy โครงสร้างทั้งหมด (โมเดลธุรกิจ MT ต่างจาก TT และมีข้อจำกัดด้านข้อมูลบางอย่าง) — สรุปภาพรวม: เพิ่ม Anchor/Jump Navigation (`.section-nav`, มีอยู่แล้วใน `shared.css` แต่ไม่เคยถูกใช้ในหน้านี้มาก่อน), แก้ Target vs Actual ไม่ให้โชว์เดือนที่ยังไม่ปิดงวดเป็นแท่ง "+฿0" หลอกๆ, แก้ Label ทับกันใน Portfolio Matrix, เปลี่ยน Category Share of Sales Over Time เป็น Smooth Stream Chart พร้อม Hover Tooltip

**แก้ 2026-08-06 (Breakdown ปรับใหญ่รอบที่สอง):** ผู้ใช้ขอปรับ Breakdown อีกรอบหลังใช้งานจริง สรุปทุกจุด:
- **Filter Bar**: ตัด Key Account Manager selector + "My accounts only" checkbox ออกทั้งหมด (รวมข้อความ "Scoped to Ployphat S.'s accounts only") — Partner Performance กลายเป็น Company-wide เสมอเหมือน Zone อื่นในหน้านี้แล้ว Filter Bar เหลือแค่ Period + Category — Field `kam` ยังอยู่ใน `partners` Mock Data แต่**ไม่มีจุดไหนในหน้านี้แสดงผลอีกแล้ว** (แก้ 2026-08-06: ตัด Sub-label KAM ออกจาก High Return Rate Partner ด้วย — ดูด้านล่าง) เก็บ Field ไว้เผื่ออนาคตต้องใช้
- **Target vs Actual**: เปลี่ยนจาก Diverging Bar (Actual−Target ฐาน 0) เป็น Bullet Bar Style ของ TT Overview (ฟังก์ชันใหม่ `buildBulletBarSVG` ใน `shared.js`, Port มาจาก `tt-shared.js`'s `renderBulletBarChart` แต่เขียนด้วย String-SVG Convention ของ `shared.js` เอง) — แท่ง Actual สีเขียว/แดงตาม Hit/Miss (`var(--good-text)`/`var(--critical)`), เส้น Tick สีเข้ม = Target, Caption ใต้เดือน 4 บรรทัด: ชื่อเดือน → Δ vs Target → MoM → YoY — มี Headline "% of target, Year to Date" + Legend อธิบายสัญลักษณ์เหนือกราฟ
- **High Return Rate Partner** (การ์ดใหม่): จับคู่ (Chart Grid) กับ Return Rate (CN) Trend ที่มีอยู่แล้ว, Layout เดียวกับ TT Overview's "High Return Rate Stores" — ใช้ `.cat-bars` Pattern, Constant `RETURN_RATE_CEILING_PCT` = 4.0 (ตัวเดียวกับเส้นประ Threshold ของ Return Rate Trend) — **แก้ 2026-08-06 (Feedback):** เดิม Filter เหลือแค่ Key Account ที่ `cnRate >= 4.0%` ทำให้มองไม่เห็นว่าคู่ค้าที่เหลือยืนอยู่ตรงไหนเทียบกับ Threshold — เปลี่ยนเป็นแสดงครบทั้ง 9 Key Account เสมอ เรียงมาก→น้อย, สีแท่ง Red/Green ตาม Hit/Miss เทียบ 4.0% (`var(--critical)`/`var(--good-text)`, Convention เดียวกับ Bullet Bar), เพิ่มเส้นประ Reference แนวตั้งที่ตำแหน่ง 4.0% บนทุกแท่ง (Class ใหม่ `.cat-ref-line` ใน `shared.css`, ต้องเพิ่ม `position:relative` ให้ `.cat-track` เพื่อวางตำแหน่ง Absolute ได้ — Backward-compatible, ไม่กระทบ `.cat-track` Caller อื่นที่ไม่มี Child นี้), ตัด Sub-label KAM ออก (เหลือแค่ชื่อคู่ค้า) ตามที่ผู้ใช้ขอ, ตัด Empty-state Message ที่ไม่มีทางเกิดขึ้นอีกแล้ว (ไม่มี Filter ให้กรองจนว่างเปล่า)
- **ตัด Account Health / Risk Signal Section ทั้ง Section** (รวม Composite Scorecard, `accountHealthOf()`, Section-nav Link) — ผู้ใช้ขอตัดออกทั้งหมด ไม่มี Replacement
- **Partner Performance จัดลำดับใหม่**: 1) Monthly Sales by Partner (ย้ายขึ้นบนสุดของ Zone, เต็มความกว้าง) 2) Target vs Actual per Partner คู่กับ YoY Growth by Partner (Chart Grid เดิม) 3) Sales by Partner คู่กับ Partner Portfolio Matrix (การ์ดใหม่ทั้งคู่) 4) Partner Share of Sales Over Time (การ์ดใหม่ เต็มความกว้าง)
  - Monthly Sales by Partner: เพิ่ม Field `opacity` ใหม่ใน `buildLineChartSVG` (shared.js, Backward-compatible, Default 1) เพื่อจางสีเส้นของ 4 คู่ค้าที่ไม่ติด Top 5 ตามยอดขายล่าสุด (`opacity:0.35, width:1.3`, ไม่แสดง End-label) — เส้นยังวาดครบ 9 เส้นเหมือนเดิม แค่เน้น Top 5 ให้อ่านง่ายขึ้นโดยไม่ซ่อนข้อมูล
  - Target vs Actual per Partner / YoY Growth by Partner: เพิ่ม Cap Top 10 by Net Sales + ลิงก์ "See all N →" (ฟังก์ชันใหม่ `renderPartnerSeeMore()` ในไฟล์นี้ — คลิกแล้วสั่ง Toolbar Table/Expand Button ที่มีอยู่แล้วของการ์ดนั้นให้ Toggle เอง ไม่ใช่ Mechanism คู่ขนานใหม่ เหมือนแนวทางของ TT's See-more) — ปัจจุบันมีแค่ 9 คู่ค้าจึงไม่เคย Overflow แต่เตรียมไว้รับ 11+ คู่ค้าในอนาคต, Table View ของทั้ง 2 การ์ดแสดงครบทุกรายเสมอไม่ว่า Chart จะ Cap หรือไม่
  - Sales by Partner (การ์ดใหม่): Ranked Bar (`.cat-bars` Pattern เดียวกับ Sales by Category) จัดอันดับ Net Sales ต่อคู่ค้า ไม่มี Level Toggle (คู่ค้าเป็น List เรียบ ไม่มี Hierarchy)
  - Partner Portfolio Matrix (การ์ดใหม่): Adapted BCG Matrix เหมือน Category Portfolio Matrix แต่ X/Y เป็นยอดขาย/Growth YoY ต่อคู่ค้า (`buildScatterSVG` เดิม, สี = `keyAccountColors`)
  - Partner Share of Sales Over Time (การ์ดใหม่): Stream Chart เหมือน Category Share of Sales Over Time แต่แยกตามคู่ค้า (18 เดือน, `buildStreamAreaSVG` เดิม, สี = `keyAccountColors`) — Callout สรุปเฉพาะ Biggest Gain/Biggest Drop เท่านั้น (ไม่ใช่ครบทุกคู่ค้าเหมือน Category Share ที่มีแค่ 6 หมวด เพราะ 9 คู่ค้าจะยาวเกินไป)
- **Product Coverage จัดลำดับใหม่**: ย้าย "Category Share of Sales Over Time" ขึ้นมาก่อน "Partner × Category" (Sales by Category+Category Portfolio Matrix → Category Share of Sales Over Time → Partner × Category) — และเปลี่ยนให้ตาม **Level Selector เดียวกับ Sales by Category** แทนที่จะ Fix อยู่ที่ระดับ Category เสมอเหมือนก่อนหน้านี้ (Cap Top 6 Node เมื่อเลือกระดับลึกกว่า Category ตามหลักการ Density Limit ของ Stream Chart ใน §3.4 — สีต่อ Node กำหนดจากลำดับ Rank Position ไม่ผูกกับ Category Identity เพราะ Top 6 ที่ระดับลึกอาจมี Node จากหลาย Category แม่ปนกัน ถ้าผูกสีตาม Category แม่จะเกิดสีซ้ำจนแยกไม่ออก) — **Category Portfolio Matrix ไม่เปลี่ยน** ยังคงอยู่ที่ระดับ Category เสมอตามที่ระบุไว้เดิม

| Section | Metric/Chart |
|---|---|
| Portfolio Quality | Target vs Actual (Bullet Bar — ดู Note ด้านบน), Return Rate (CN) Trend คู่กับ High Return Rate Partner (MT-wide เส้นเดียว, เส้นประ Threshold `RETURN_RATE_CEILING_PCT`) — **ตัด AR Aging ออก** (แก้ 2026-08-04 — MT ไม่แสดง AR ที่จุดใดในหน้านี้แล้วทั้ง Executive Summary และ Breakdown) |
| Partner Performance | ดู Note "Breakdown ปรับใหญ่รอบที่สอง" ด้านบนสำหรับลำดับและรายละเอียดครบทุกการ์ด |
| Product Coverage | Sales by Category คู่กับ Category Portfolio Matrix → Category Share of Sales Over Time (ตาม Level Selector เดียวกับ Sales by Category) → **Partner × Category** (Heatmap — แถว = 9 Key Account, คอลัมน์ = Top 8 Node ที่ Level เดียวกัน, ค่า = % Row-normalized ต่อคู่ค้า, ใช้ Mock `partnerCategorySkew` ต่อคู่ค้า) — ทั้ง Zone นี้ Company-wide เสมอ |

Filter Bar ของ Breakdown (ปัจจุบัน): Period, Category (ใช้งานได้แค่ "All Categories" ตัวเลือกอื่นยัง Disabled รอ Partner×Category Data Model)

Partner ระดับ Breakdown คือ Key Account 9 รายเดียวกันกับ Executive Summary เป๊ะ (ไม่มี Sub-partner ซ้อนอีกชั้น) — ตัวเลข Net Sales Share/Attainment/Return Rate (CN) ต่อรายใช้ค่าเดียวกับ `keyAccountStats` ของ Executive Summary ทุกประการ เพื่อให้ 2 หน้าเล่าเรื่องตรงกันเสมอ ("Partner" ในความหมายของ Breakdown จึงหมายถึงคู่ค้าทั้งบัญชี ไม่ใช่สาขาย่อย — ข้อมูลระดับสาขาเป็นคนละมิติ อยู่ที่ Store Tab แทน)

**หมายเหตุ AR ใน MT (แก้ 2026-08-04):** หลังตัด AR Aging ออกจาก Breakdown รอบนี้ MT Module ไม่มีจุดไหนแสดงข้อมูล AR ให้ผู้ใช้เห็นอีกแล้ว (AR% ถูกตัดจาก Executive Summary ไปตั้งแต่รอบก่อนหน้า) — `mtARSeries` ยังต้อง Generate อยู่ในทั้ง 2 ไฟล์เพื่อรักษาลำดับ `rand()` (ดู §6.2) แต่ไม่ถูกใช้แสดงผลที่ไหนแล้วในโมดูลนี้ ถ้าต้องการดู AR ของ MT ต้องเพิ่มกลับมาใหม่ในอนาคต

**Store (Build แล้ว, ปรับใหญ่หลายรอบล่าสุด 2026-08-06):** Tab ที่ 3 ของ MT Overview (`module_mt_store.html`) แยกจาก Breakdown — เพิ่ม Nav Item `mt-store` ใน `MODULE_MAP` (nav-menu.js) และเพิ่ม Tab Link "Store" ใน `<nav class="tabs">` ของทั้ง 3 ไฟล์ (Executive Summary, Breakdown, Store เอง) ลำดับ Section บนหน้าปัจจุบัน (บนลงล่าง, แก้ 2026-08-06 ตามที่ผู้ใช้ขอ): **Store Performance → Store Health → Store Ranking** (Store Ranking ย้ายจากบนสุดไปล่างสุด เพราะเป็นตารางอ้างอิง/รายละเอียด ไม่ใช่สิ่งแรกที่ควรเห็น) — `<nav class="section-nav">` เรียงตามลำดับใหม่นี้เช่นกัน

Mock Store Count ลดจาก 920 → **80 สาขา** (WATSONS 40, EVEANDBOY 8, CJ Express 26, Beautrium 4, Multy 2 — สัดส่วนเท่าเดิม แค่ Scale ลง เพราะเป็น Mockup ไม่จำเป็นต้องมีจำนวนสาขาเยอะขนาดนั้นเพื่อ Demo Pattern เดียวกัน, ลด Render/Compute Cost ของ "See all" Table และ `rand()` Draw ต่อสาขา)

| Section | Metric/Chart | หมายเหตุการ Build |
|---|---|---|
| KPI (4 การ์ด) | Total Stores, Avg Sales per Store, Same-Store Sales Growth (SSSG), New Stores Opened | ทั้ง 4 ใบผูกกับ Partner filter (ยกเว้น Total Stores/Avg ที่คำนวณจาก Scope ที่กรองอยู่) — **แก้ 2026-08-06 (Feedback): เพิ่ม Sparkline ให้ครบทั้ง 4 ใบ** (เดิมไม่มีเลย ต่างจาก KPI Card ของหน้าอื่นในระบบ) ใช้ `sparklineSVG()` เดิมจาก `shared.js` ทุกใบ: (1) Total Stores — จำนวนสาขาสะสมย้อนหลัง 12 เดือน Reconstruct จาก `storeOpenedMonth` จุดขวาสุด = ตัวเลขหัวข้อเป๊ะ (2) Avg Sales per Store — อัตราเฉลี่ยเดียวกันคำนวณแบบรายเดือนย้อนหลัง 12 เดือน (ต่างจากตัวเลขหัวข้อที่เป็นยอดสะสมตามช่วงเวลาที่เลือก — Unit ต่างกันตั้งใจ เหมือน Pattern เดิมของ Net Sales KPI ใน Executive Summary ที่ Sparkline เป็นรายเดือนแต่ตัวเลขหัวข้อเป็นยอดตามช่วงที่เลือก) (3) Same-Store Sales Growth — เนื่องจาก `growthYoY` เป็นค่าคงที่ต่อ Account (ไม่มี Time Series จริง) จึงให้เฉพาะสัดส่วนสาขาใหม่ (`newStoreWeightShare`) ที่ผันแปรตามเวลาจริง (จาก `storeOpenedMonth`+`monthlyWeights`) ส่วน Growth ใช้ค่าคงที่เดิม แล้ว Anchor จุดขวาสุดให้เท่ากับตัวเลขหัวข้อเป๊ะเสมอ ไม่ให้ขัดแย้งกัน (4) New Stores Opened — จำนวนสาขาใหม่ต่อเดือน ย้อนหลัง 12 เดือนคงที่ (ไม่ขึ้นกับ Period Filter เหมือนตัวเลขหัวข้อ — เจตนาให้เห็น Pace ล่าสุดเสมอ, เหมือน Pattern เดียวกับ New Stores Opened Chart ด้านล่างของหน้านี้) |
| Store Performance | **Avg Sales per Store by Partner** (Ranked Bar, ย้ายมาจาก Executive Summary — ตอบสนอง Partner filter ของหน้านี้ได้ด้วย เพราะ Executive Summary เดิมไม่มี Filter นี้) จับคู่กับ **Sales per Store Trend** (Multi-line 36 เดือนเต็ม แยกเส้นตาม Partner ที่อยู่ใน Scope, สูตร `groupActual.MT[m]*a.pct/100`) | สอง Chart นี้คือ Metric เดียวกัน (ยอดขายเฉลี่ย/สาขา) มองแบบ Snapshot กับ Trend — **แก้ 2026-08-06:** X-axis Label ของ Sales per Store Trend เคยชนกัน (Chart กว้างครึ่งการ์ดแต่ Skip-label Logic เดิมของ `buildLineChartSVG` คิดจากจำนวน Label อย่างเดียว ไม่คิดความกว้างจริง) — แก้เป็น Adaptive (คำนวณจาก `plotW` จริง) ที่ `shared.js` เลย ทุก Chart ที่ใช้ฟังก์ชันนี้ได้ประโยชน์ ไม่ใช่แค่การ์ดนี้ |
| Store Performance | **Same-Store Sales Growth by Partner** — **แก้ 2026-08-06:** เปลี่ยนจาก Grouped 2-Bar Chart (ผู้ใช้ Feedback ว่า "ทำไมแต่ละ MT มี 2 bar ดูแล้วแอบงง") เป็น **Dumbbell Row** (HTML/CSS ใหม่ `renderDumbbellRows()` ในไฟล์นี้, Class ใหม่ `.dumbbell-rows/.dumbbell-row/.dumbbell-track/.dumbbell-dot` ฯลฯ ใน `shared.css`) — จุดสีคู่ (Total Growth / SSSG) บนเส้นเดียวกันต่อคู่ค้า เชื่อมด้วยเส้น พร้อม Legend และตัวเลขระบุชัดทุกแถว แทนที่จะให้ผู้ใช้ต้องกาง Legend เทียบสีแท่ง | ดู Data Model เดิมด้านล่าง (สูตร SSSG ไม่เปลี่ยน) |
| Store Performance | **Top Stores Trend** (Multi-line 36 เดือน, Top 5 สาขา) + Callout "Roster Stability" ใต้กราฟ | **แก้ 2026-08-06 (รอบห้า, Feedback):** ปรับใหญ่อีกครั้ง — เดิมตายตัวที่ "1 สาขา Top ต่อคู่ค้า" (เสมอ 5 เส้น ตามจำนวนคู่ค้า) ผู้ใช้ขอให้เปลี่ยนเป็น **Top 5 Store จริง** พร้อม **Scope Selector ใหม่ของการ์ดนี้เอง** (`<select id="topStoresTrendScopeSelect">`, ตัวเลือก "All 5 Partners" + รายชื่อคู่ค้าที่มีข้อมูลสาขา) — เลือก **All** = Top 5 สาขาที่ยอดขายสูงสุดทั้งบริษัท (อาจกระจุกอยู่คู่ค้าเดียวถ้าคู่ค้านั้นมีสาขาเด่นจริง — เป็น Insight ที่ตั้งใจให้เห็น ไม่ใช่ Bug) เลือกคู่ค้าใดคู่ค้าหนึ่ง = Top 5 ของคู่ค้านั้นเท่านั้น (น้อยกว่า 5 ถ้าคู่ค้ามีสาขาไม่ถึง 5) — **Dropdown นี้แยกอิสระจาก Partner Filter บนสุดของหน้าโดยตั้งใจ** (Convention เดียวกับ Store Health ที่ไม่ผูกกับ Partner Filter) Data Label ของแต่ละเส้นมีชื่อคู่ค้าอยู่ในตัวอยู่แล้ว (เช่น "EVEANDBOY #001") จึงไม่ต้องเพิ่ม Format พิเศษ — Callout ใต้กราฟ Generalize จาก "เช็คว่าสาขา #1 ของคู่ค้าเปลี่ยนไหม" (รอบก่อน) เป็น **"Roster ของ Top N ทั้งกลุ่มเปลี่ยนไหม"**: จัดอันดับทุกสาขาใน Pool ที่เลือก (ตาม `monthlyWeights` ของแต่ละเดือน ไม่ใช่ Static `storeWeights` ที่เส้นกราฟใช้วาด) แล้วดูว่า Top N ของแต่ละเดือนใน 12 เดือนที่ผ่านมา ตรงกับ Top N ของวันนี้ (ที่กำลังแสดงเป็นเส้น) ทุกเดือนหรือไม่ — ใช้ Key แบบ `partner#si` เทียบข้าม Account ได้เมื่อ Scope = All — ลบฟังก์ชัน `computeStoreStability()` เดิม (ไม่มีผู้เรียกใช้แล้ว) และ Class `.stability-row/.stability-spark/.stability-note` ออกจาก `shared.css` ไปพร้อมกัน (Sparkline-per-partner Concept ของรอบก่อนถูกแทนที่ทั้งหมด) |
| Store Health (Company-wide เสมอ ไม่ผูก Partner filter) | New Stores Opened รายเดือน ย้อนหลัง 12 เดือน (Bar Chart, เต็มความกว้าง) + Caption ระบุ "0 closures recorded in source data" | เดิม (ไม่เปลี่ยนรอบนี้) — ไม่ Mock ตัวเลขปิดสาขาจริง เลือกระบุ Caveat ตรงๆ แทนการสร้างตัวเลขหลอก |
| Store Health (Company-wide เสมอ) | **Store Productivity Distribution** (Histogram) จับคู่กับ **Store Productivity Mix Over Time** (Stream Chart 18 เดือน, ย้ายมาอยู่คู่กันแทน Quartile 2026-08-06) | **ตัด Store Productivity Quartile by Partner ทิ้งทั้งการ์ด** (ผู้ใช้ระบุว่า "ไม่มีข้อมูลจริง") — Distribution จับคู่ใหม่กับ Mix Over Time แทน (Snapshot vs 18-Month Trend ของ Metric เดียวกัน) — ตัด Data Label จำนวนสาขาออกจากแท่ง (`showValueLabels`/`valueLabelFormatter` เดิม) เปลี่ยนเป็น Y-axis Title "Store Count" แทน (Field ใหม่ `opts.yAxisTitle` ใน `buildGroupedBarSVG`, `shared.js`, Backward-compatible) — **Bucket เปลี่ยนจากเลข THB คงที่ (`<10K...≥200K`, Fix ไว้ตายตัวตั้งแต่ยุค 920 สาขา) เป็น Dynamic** (`computeDynamicBuckets()` ใหม่ในไฟล์นี้) คำนวณ Bucket Width จาก Percentile ที่ 90 ของยอดขายต่อสาขาปัจจุบัน (ไม่ใช้ Max ตรงๆ เพราะ Outlier เดี่ยว 1 สาขาจะดึง Bucket Width ทั้งหมดจนสาขาที่เหลือกระจุกอยู่ Bucket แรกหมด) ปัดเป็นเลขกลม (`niceStep()`) แล้วให้ Bucket สุดท้ายเปิดปลาย (`≥`) รับ Outlier — Mix Over Time ใช้ Bucket ชุดเดียวกันนี้ (Reuse ตัวแปร `bucketDefs`) เพื่อให้ 2 การ์ดสอดคล้องกันเสมอ |
| Store Ranking (ย้ายไปล่างสุด 2026-08-06) | Top Store Ranking + Bottom Store Ranking (Table Top 10, See-more) | ไม่แสดงคอลัมน์ Attainment (ตัดออกไปแล้วก่อนหน้า — ปกติไม่มี Target แยกรายสาขา คำนวณจริงไม่ได้) — **แก้ 2026-08-06 (Feedback):** คอลัมน์ YoY Growth เดิม Copy ตัวเลขระดับคู่ค้า (`keyAccounts[i].growthYoY`) มาแสดงซ้ำทุกแถวในคู่ค้าเดียวกัน (เช่น 40 สาขา WATSONS เห็น "+9.5%" เหมือนกันหมด) — เพิ่ม Field ใหม่ `a.storeGrowthYoY` (Array ต่อสาขา = `growthYoY` ของคู่ค้า ± Variance สุ่ม `rand()*12-6`, Generate ครั้งเดียวตอนโหลดหน้า ต่อจาก `monthlyWeights`) แล้วดึงผ่าน `buildStoreList()`'s Field ใหม่ `growthYoY` ต่อสาขาแทน ทำให้ตัวเลขในตารางมีการกระจายตัวจริงต่อสาขา (Mock ล้วน ไม่ได้ผูกกับ Driver อะไรจริง แค่ทำให้ดูสมเหตุสมผลกว่าตัวเลขซ้ำเป๊ะทุกแถว) |
| Store Ranking | Pareto Ranking (`buildParetoSVG`, 10 Decile) | **แก้ 2026-08-06:** เพิ่ม X-axis Title ใต้แถว Label Decile ("Store deciles — Decile 1 = highest sales/store, Decile 10 = lowest") เพราะผู้ใช้ Feedback ว่าอ่านครั้งแรกไม่เข้าใจว่า Label "1–10%" หมายถึงอะไร — เพิ่ม Field ใหม่ `opts.xAxisTitle` ใน `buildParetoSVG` (`shared.js`, Backward-compatible) |

**Data Model ใหม่ที่เพิ่มเข้ามาสำหรับหน้านี้ (`storeOpenedMonth`):** เพิ่ม `a.storeOpenedMonth` (Array ขนาดเท่า `storeCount`, ค่าเป็น `null` = เปิดมาก่อนหน้าต่างข้อมูล 36 เดือน, หรือ Index เดือนใน 12 เดือนล่าสุด = เพิ่งเปิด) และ `a.newStoreWeightShare` (สัดส่วน Weight ของสาขาที่ถูก Tag ว่า "ใหม่") ต่อ Key Account ที่มี `storeCount` เท่านั้น สาขา "ใหม่" ถูกสุ่มเลือก**แบบสุ่มล้วน ไม่ใช่เรียงจาก Weight น้อยไปมาก** (ลองแบบเรียง Weight ก่อนแล้วพบว่าทำให้ต้อง Tag สาขาเป็นสัดส่วนสูงเกินจริง เพราะสาขาเล็กสุดในโมเดล Long-tail มี Weight น้อยมาก ต้องใช้จำนวนสาขามากถึงจะรวมกันได้ถึง Target Share) — สุ่มแบบไม่เอนเอียงทำให้จำนวนสาขา "ใหม่" ใกล้เคียงสัดส่วนเป้าหมายจริง SSSG คำนวณจากสูตร `((1+growthYoY/100)*(1-newStoreWeightShare)-1)*100` ซึ่งอิง `growthYoY` เดิมที่ Executive Summary/Breakdown ใช้อยู่แล้ว `NEW_STORE_TARGET_SHARE` เป็นค่า Illustrative ต่อ Account (WATSONS 2.5%, EVEANDBOY 12%, CJ Express 8%, Beautrium 5%, **Multy 1.5%** — ดู Fix ด้านล่าง) — **แก้ 2026-08-06 (Feedback, 2 รอบ):** (1) Multy เดิม = 0% พอดี ทำให้ Total Growth กับ SSSG เท่ากันเป๊ะบนกราฟ Same-Store Sales Growth (ถูกต้องตาม Model แต่ดูน่าสงสัยเพราะเป็นคู่ค้าเดียวที่ 2 ค่าทับกันสนิท) — ปรับเป็น 1.5% เพื่อให้มี Gap เล็กๆ แบบคู่ค้าอื่น (2) ปรับแล้วดันเจอ Bug จริง: `a.newStoreWeightShare` เดิม**ไม่ใช่ค่า Target ที่ประกาศไว้ แต่เป็นค่า `cum` จริงที่ได้จากการ Tag สาขาทั้งสาขา** — สำหรับ Account ที่มีสาขาน้อยมาก (Multy มีแค่ 2 สาขา) การ Tag สาขาแค่ 1 สาขาก็อาจกิน Weight ไป 50%+ ของทั้ง Account แล้ว ทำให้ Target เล็กๆ (1.5%) เมื่อ Implement ผ่านการ Tag ทั้งสาขากลับได้ `cum` จริงสูงถึง ~80%+ (SSSG พุ่งไปที่ -82% จาก Total Growth -6%) — แก้โดยแยก 2 เรื่องออกจากกัน: `a.newStoreWeightShare` ใช้ค่า `target` ที่ประกาศไว้ตรงๆ (สะอาด ไม่ผ่าน Rounding) ส่วนการ Tag สาขาจริง (`storeOpenedMonth`) ยังใช้ Mechanism เดิม (สำหรับ KPI "New Stores Opened"/ตาราง เท่านั้น ไม่กระทบสูตร SSSG อีกต่อไป)

**Data Model ใหม่ (`monthlyWeights`, 2026-08-06):** เพิ่ม `a.monthlyWeights` (Array 12 เดือน แต่ละเดือนเป็น Array ของ Per-store Weight ที่ Renormalize แล้ว) เฉพาะสำหรับ "Top Store Stability by Partner" — ดู Note ในตารางข้างบน เหตุผลที่ต้องมีคือ `storeWeights` เดิมทำให้ Rank ไม่เปลี่ยนได้เลยตามโครงสร้างสูตร (ทุกสาขาในบัญชีเดียวกันคูณด้วย Account Total เดือนนั้นเท่ากันหมด สัดส่วนเทียบกันจึงคงที่ตลอด) `rand()` ที่ใช้เป็น Stream เดียวกับข้อมูล Mock อื่นในไฟล์นี้ ต่อจาก `storeOpenedMonth` — ไม่กระทบลำดับ `rand()` ของ Field อื่นเพราะเป็น Top-level Block ใหม่ที่ต่อท้าย ไม่ใช่การแทรกก่อนโค้ดเดิม

Coverage caveat (คงเดิม): ข้อมูลระดับสาขามีเฉพาะ 5 จาก 9 Key Account (WATSONS, EVEANDBOY, CJ Express, Beautrium, Multy) — Note นี้แสดงเป็น `chart-subtitle` ใต้ Filter Bar

Filter Bar ที่ Build จริง: Period (Dropdown เหมือนทุกหน้า) + Partner (`<select>` จำกัดเฉพาะ 5 รายที่มีข้อมูลสาขา, ค่าเริ่มต้น "All 5 Partners") — ไม่มี Store Tier/Quartile filter เนื่องจากยังไม่มี Use Case ชัดเจนที่ต้องใช้ร่วมกับ Filter อื่น

รอบนี้ยังไม่ทำ: ตัวเลขจำนวนสาขาปิดจริง (ต้องมี Concept "สถานะสาขา" ในข้อมูลต้นทางก่อน), Store Tier filter

### 5.4 TT Overview

**Executive Summary:** Total Net Sales, Target Attainment, AR%, Return Rate (CN), Active Stores, Store Retention (KPI) · Revenue Trend, Monthly YoY Growth % (Chart) · Sales by Customer Group, Sales by Category (Chart) · Sales Ranking by Rep (Table) — **แก้ 2026-08-06:** เพิ่ม `<nav class="section-nav">` (Executive Summary / Trends & Mix) ตามที่ผู้ใช้ขอ — หน้านี้ไม่มี Jump Navigation มาก่อน (ต่างจาก MT ทุก Tab ที่มีอยู่แล้ว) เพิ่ม `id="sec-exec-summary"` ให้ `.section-label` เดิม (Zone I) และเพิ่ม `.section-label` ใหม่ `id="sec-trends-mix"` ก่อน Zone II (เดิมเป็นแค่ Comment ไม่มี Label แสดงผลจริง) — ต้อง Port `.section-nav`/`html{scroll-behavior:smooth}` เข้า `tt-shared.css` ด้วย (มีแต่ `.section-label` เดิม ไม่มี `.section-nav` เพราะ TT เป็น Engine แยกจาก `shared.css` — ดู §6.1/6.3)

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
| (บนสุด) | Target Achievement (KPI), This Month at a Glance — **แก้ 2026-08-06:** Label "Return Rate (CN)" ใน This Month at a Glance เปลี่ยนเป็น **"CN%"** (สั้นลง ตามที่ผู้ใช้ขอ) |
| My Priority Actions | Stores Needing Attention, AR By Due Date, Inactive Customers |
| Sales Snapshot | Daily Sales, Target vs Actual vs Diff |
| My Customers & Products | Top & Bottom Performing Stores, My Customer Group Mix, My Sales by Category |
| Credit Notes (CN) | CN Record (ตาราง Top 10 ต่อ Store เรียงตาม CN รวม 6 เดือน + ปุ่ม "See all N stores →" เมื่อมีมากกว่า 10, ดาวน์โหลดได้) — **แก้ 2026-08-06 (ตรวจสอบตาม Feedback):** ผู้ใช้รายงานว่าไม่มีปุ่ม See More แต่ตรวจสอบ Live ใน Browser แล้วพบว่า `renderCnTable()` (`tt-shared.js`) มี Mechanism นี้อยู่แล้วสมบูรณ์ (`CN_SEE_MORE_CAP = 10`) — ปุ่มไม่ปรากฏเพราะ Rep ที่ผู้ใช้ดูอยู่ ณ ขณะนั้นมีจำนวน Store ที่มี CN ในช่วง 6 เดือนไม่เกิน 10 (ทดสอบ REP-01/02/03 = ไม่เกิน 10, ไม่มีปุ่มถูก = ถูกต้องตาม Design เพราะไม่มีอะไรให้ดูเพิ่ม; REP-04/05 = 13-14 Store, ปุ่มปรากฏถูกต้องและกดขยายได้จริง) — **ไม่ต้องแก้ Code เพิ่ม เป็น Feature ที่ทำงานถูกต้องอยู่แล้ว** |

**แก้ 2026-08-06 (ตัด Page Subtitle):** ตัด `<p class="subhead">` ใต้ H1 ออกจากทั้ง 3 ไฟล์ (Executive Summary, Breakdown, Sales Person) ตามหลักการเดียวกับที่ MT ทำไปก่อนหน้านี้ — ชื่อ Section/Card อธิบายตัวเองพออยู่แล้ว ไม่ต้องมี Subtitle ซ้ำใต้ H1 — ลบ CSS Class `.subhead` ออกจาก `tt-shared.css` ด้วยเพราะไม่มีใครใช้แล้ว (ECOM Overview ยังมี Pattern คล้ายกัน (`.page-subtitle`) แต่ไม่ได้แตะรอบนี้ เพราะไม่ได้อยู่ใน Scope งาน)

**แก้ 2026-08-06 (Sales by Category → สไตล์ MT):** ผู้ใช้ขอให้ Sales by Category ทั้ง 3 หน้า (Executive Summary's L1 card, Breakdown's L2 card ซึ่งเป็น Level Selector หลักที่ Sync กับ Category Portfolio Matrix/Category Share of Sales Over Time ด้วย, และ Sales Person's "My Sales by Category") มี Style/UX ตรงกับ MT Overview เป๊ะ: เปลี่ยน Widget จาก `<select>` Dropdown เป็น Toggle-group ปุ่ม (Category/Sub-Category/Type/Series) และเปลี่ยนตัวกราฟจาก SVG Horizontal Bar (`renderHBarChart`) เป็น HTML Bar (`.cat-row`/`.cat-track`/`.cat-fill` Pattern เดียวกับ `shared.css`) —
- เพิ่มฟังก์ชันใหม่ `renderCategoryBars(mount, opts)` ใน `tt-shared.js` (แทน `renderHBarChart` เฉพาะจุดนี้ — `renderHBarChart` เองไม่ถูกแตะ ยังใช้กับ Sales by Region/High Return Rate Stores/ที่อื่นเหมือนเดิม) และเพิ่ม CSS Class ที่ยังไม่มีใน `tt-shared.css` (`.cat-row`/`.cat-label`/`.cat-track`/`.cat-fill`/`.cat-fill-label`/`.sub-label`/`.toggle-group`/`.toggle-btn`, Copy มาจาก `shared.css` เป๊ะ — ตรวจแล้วว่าไม่ชนกับชื่อ Class เดิมของ `tt-shared.css`)
- `renderCategoryTopView(win, opts)` (ใช้ร่วมกันโดย Executive Summary's L1 และ Breakdown's L2) เปลี่ยนจากอ่าน Depth ผ่าน `document.getElementById(selectId).value` เป็นรับ `opts.depth` ตรงๆ — ตัด Dependency กับ DOM Select ออกทั้งหมด เพิ่ม `state.categoryLevel`/`state.overviewCategoryLevel` (Default 1) เป็น Toggle State ของ Breakdown/Executive Summary ตามลำดับ ปุ่ม Toggle ในแต่ละไฟล์ตั้งค่า State ตัวนี้แล้วเรียก `render()` เดิม — **Sync Mechanism เดิมของ Breakdown ไม่กระทบ**: Toggle ยังควบคุม Category Portfolio Matrix + Category Share of Sales Over Time พร้อมกันเหมือนเดิมทุกประการ (Single Point of Control ตาม §3.4) เพียงแค่เปลี่ยน Widget/วิธีอ่านค่า ไม่ได้แยก Toggle ออกเป็นการ์ดละตัว
- Sales Person's "My Sales by Category" เปลี่ยนจากอ่าน `document.getElementById("myCategoryLevelSelect").value` เป็น `spState.categoryLevel` (Field ใหม่ใน `spState`, Default 1) เพราะหน้านี้ไม่ได้ใช้ `render()`/`state` ร่วมกับอีก 2 หน้า (มี `renderSalesPersonPage()` ของตัวเอง)
- HIDDEN STUBS ที่มีอยู่แล้วในแต่ละไฟล์ (Element เปล่าซ่อนไว้เพื่อให้ `render()` ที่ใช้ร่วมกันไม่ Error เวลาอ่าน Element ของอีกหน้า) ตัด `<select>` Stub ออกได้ (เช่น `categoryLevelSelect` Stub ใน Executive Summary, `overviewCategoryLevelSelect` Stub ใน Breakdown) เพราะไม่ต้องอ่านจาก DOM Select อีกแล้ว — `<div>` Stub ของ Chart/Table ยังต้องอยู่เหมือนเดิม (`renderCategoryBars` ยังเขียนลง Div นั้น)
- Sub-label ที่แสดงใต้ชื่อ Node ยังใช้ Field `sublabel` เดิมของ `renderCategoryTopView` (Ancestor Chain เต็ม เช่น "Skin Care › Facial Care" ที่ Series Level) **ไม่ได้เปลี่ยนให้เหลือแค่ Immediate Parent แบบ MT** เพราะ Field นี้ใช้ร่วมกับ Portfolio Matrix/Product Ranking อื่นด้วย การเปลี่ยน Format จะกระทบกว้างกว่าที่ขอ (Scope รอบนี้คือ Sales by Category เท่านั้น)

### 5.5 ECOM Overview

**แก้ 2026-08-06 (Feedback):** Ecom มี **4 Platform เท่านั้น** — Lazada, Shopee, TikTok, **Line Shop** (เพิ่มใหม่) — เพิ่ม `LineShop` เข้า `channelDefs` (Part 1, ต้องแก้ทุกไฟล์ที่ก็อบปี้ Array นี้แบบ byte-for-byte พร้อมกัน: `sales_overview.html`, `sales_overview_product_analysis.html`, `module_mt_executive_summary.html`, `module_mt_breakdown.html`, `module_ecom_executive_summary.html`, `module_ecom_breakdown.html`, `pnl_executive_summary.html`, `pnl_breakdown.html` — 8 ไฟล์รวม Master) แทรกเป็น Entry สุดท้ายของกลุ่ม Ecom (ต่อจาก TikTok เดิม) เพื่อไม่กระทบลำดับ `rand()` ของ MT/TT/Lazada/Shopee/TikTok ที่ประมวลผลก่อนหน้า — Base ของ Lazada/Shopee/TikTok ปรับลดลง (2.0M→1.8M, 1.7M→1.55M, 900K→850K) ให้ Ecom Total เดิมใกล้เคียงเท่าเดิม (รวม Line Shop 400K ใหม่ ≈ 4.6M เท่าเดิม) — Label "TikTok Shop" เปลี่ยนเป็น **"TikTok"** ทุกจุดที่แสดงผล (Static Prose ที่พิมพ์ชื่อ Platform เองต้องแก้มือทุกจุด เพราะ Donut/Legend/Chart ส่วนใหญ่อ่าน `c.label` อัตโนมัติอยู่แล้ว) — เพิ่ม CSS Var `--lineshop:#4C8C5C` ใน `shared.css` คู่กับ `--lazada`/`--shopee`/`--tiktok` เดิม (Documentation Token เท่านั้น ไม่มีที่ไหน Reference ผ่าน `var()` จริง เหมือนตัวเดิม)

**Executive Summary** (6 KPI Card — ตามหลักการเดียวกับ MT/TT คือไม่มีการ์ด Growth YoY/Growth MoM แยกต่างหาก เพราะซ้ำกับแถว MoM/YoY ในการ์ด Net Sales/Target Attainment): Net Sales (Ecom), Target Attainment %, Return/Cancellation Rate, AOV (Average Order Value), Conversion Rate, Active Shop Listings · Revenue Trend, Monthly YoY Growth % (Chart) · Sales by Platform (Donut — Lazada/Shopee/TikTok/Line Shop, สีตรงกับ `--lazada`/`--shopee`/`--tiktok`/`--lineshop` ใน `shared.css`) · Sales by Category (มี Product Level Toggle ครบ 4 ระดับ, แก้ 2026-08-06 รอบก่อน) — **Active Shop Listings ยังไม่แก้รอบนี้** แม้จะตั้งอยู่บนสมมติฐาน "หลาย Shop ต่อ Platform" แบบเดียวกับที่ตัดออกจาก Breakdown แล้ว (Charmiss มี Shop เดียวต่อ Platform ไม่ใช่หลาย Shop) — Flag ไว้เป็น Task แยกให้ผู้ใช้ตัดสินใจอีกที เพราะไม่ได้อยู่ใน Scope ที่ขอรอบนี้ (แก้แค่เพิ่ม Line Shop + เปลี่ยนชื่อ TikTok)

`ecomPlatformStats` (Copy ไว้ทั้งใน Executive Summary และ Breakdown) เปลี่ยนจาก `{aov, conv, cancelFactor}` (ตัวเลขสัมบูรณ์คงที่) เป็น **`{aovIndex, convIndex, cancelFactor}`** (ตัวคูณ, Weighted-average ≈1.0 ข้าม 4 Platform) — เหตุผลอยู่ที่ Breakdown ด้านล่าง (Period-sensitivity)

**Breakdown — ปรับใหญ่ 2026-08-06 (Feedback: "เริ่มปรับแก้ภาพรวมให้ Align กับ Breakdown อื่น, ECOM มีแค่ 4 Platform, ตัด Active Shop Listings/Shop Concentration, Target vs Actual per Shop ไม่มีจริง, Top/Bottom 5 Shops คำนวณไม่ได้จริง, Conversion Rate by Platform คำนวณไม่ได้จริง, เพิ่มกราฟ/จัดเรียงใหม่ตามเหมาะสม"):**

Root Cause ที่ทำให้หลายการ์ดเดิม "คำนวณไม่ได้จริง": โมเดลเดิมมี Mock Entity ปลอมชื่อ "Shop" (`shops[]`, ~15-20 รายการต่อไฟล์ ID แบบ `ECOM-001`, Weight สุ่มแบบ Power-law, และ `attainFactor` สุ่ม 88-112% ที่ไม่มี Target จริงรองรับ — Target ถูก Reverse-derive จาก `attainFactor` สุ่มด้วยซ้ำ ไม่ใช่คำนวณจาก Target จริงไปหา Attainment) — **Charmiss มี 1 Shop (หน้าร้านทางการ) ต่อ Platform เท่านั้น ไม่ใช่หลาย Shop ภายใน Platform เดียว** จึงไม่มี Entity "Shop" ระดับย่อยกว่า Platform ให้อ้างอิงได้จริงเลยในโมเดลนี้ — **ลบ `shops[]`/`PLATFORM_GROUPS`/`basesSum` ทั้งหมด** (ลบ Block นี้ทำให้ `rand()`-Sequence ของ SKU Generation ที่อยู่ถัดไปขยับตำแหน่ง — ปลอดภัยเพราะ SKU เป็น Breakdown-only ไม่มี Cross-file Sync Requirement)

| Section | Metric/Chart | หมายเหตุ |
|---|---|---|
| Portfolio Quality | Target vs Actual per Platform (Bullet/Diverging Bar, Baseline 100%, ทั้ง 4 Platform — ย้ายมาเป็น Full-width การ์ดเดี่ยวด้านบนสุด, ไม่ Pair กับอะไรแล้ว) | ใช้ Time Series จริงต่อ Platform (`c.actual`/`c.target`) อยู่แล้วตั้งแต่เดิม ไม่ต้องแก้ Logic — ย้าย Layout ให้ตรงกับ MT Breakdown's "Target vs Actual" (Full-width, ไม่ Pair) |
| Portfolio Quality | Return/Cancellation Rate Trend (รายเดือน, เส้นประ Threshold 8%) จับคู่กับ **Return/Cancellation Rate by Platform** (การ์ดใหม่) | Return/Cancellation by Platform = Ecom-wide Period Average (จริง, จาก `ecomCancelRate`) × `cancelFactor` ต่อ Platform (Skew เชิงเล่าเรื่อง แต่ตัวตั้งเป็นค่าจริงตามช่วงเวลา) — Pattern เดียวกับ MT's "Return Rate Trend + High Return Rate Partner" เป๊ะ (แสดงครบ 4 Platform เสมอ ไม่มี Filter ตัดออก, สีเขียว/แดงตาม Threshold 8%) |
| **ตัดทั้ง Section เดิม "Shop Performance"** | ~~Active Shop Listings~~, ~~Shop Concentration~~, ~~Target vs Actual per Shop~~, ~~Top 5 / Bottom 5 Shops by Revenue~~ | ตัดทั้งหมดตามที่ผู้ใช้ระบุ — ตั้งอยู่บน `shops[]` ปลอมล้วน ไม่มี Entity จริงรองรับ |
| **Platform Performance** (Section ใหม่ แทน "Shop Performance") | Monthly Sales by Platform (การ์ดใหม่, Full-width Trend Line 36 เดือน, 4 เส้นจริงจาก `ecomChannels[i].actual`) | Real Time Series ต่อ Platform อยู่แล้ว (ไม่ใช่สัดส่วนคงที่ของยอดรวม) มีแค่ 4 เส้นจึงไม่ต้อง Dim เส้นแบบ MT's 9-Partner Version |
| Platform Performance | YoY Growth by Platform (การ์ดใหม่) จับคู่กับ Platform Share of Sales Over Time (การ์ดใหม่) | YoY Growth คำนวณจาก Time Series จริง (Period ปัจจุบัน vs Period เดียวกันปีก่อน) ไม่ใช่ตัวเลข Narrative คงที่แบบ MT — **แม่นยำกว่า MT ในมุมนี้** เพราะ MT ไม่มี Time Series ระดับ Partner จริง มีแต่ Narrative Constant ส่วน Platform Share of Sales Over Time = Stream Chart, % Share คำนวณจากยอดขายจริงต่อเดือนหารด้วยยอดรวม Ecom เดือนนั้น (ไม่ใช่ Static pct + Jitter แบบ Category Share) |
| Platform Performance | AOV by Platform จับคู่กับ Conversion Rate by Platform (การ์ดเดิม, **แก้สูตร**) | **แก้ 2026-08-06:** เดิม `ecomPlatformStats[c.key].aov`/`.conv` เป็นตัวเลขสัมบูรณ์คงที่ (Lazada AOV เป็น ฿560 เสมอไม่ว่าจะเลือก Period ไหน) — เปลี่ยนเป็น Period-average ของ Series จริง Company-wide (`ecomAOVSeries`/`ecomConvSeries`) × `aovIndex`/`convIndex` ต่อ Platform แทน ตอนนี้เปลี่ยนค่าจริงเมื่อสลับ Period Filter (ทดสอบแล้ว) |
| Product Coverage | Sales by Category, Category Portfolio Matrix, Category Share of Sales Over Time, Top 5 / Bottom 5 SKU by Revenue | ไม่เปลี่ยน (ไม่ได้อยู่ใน Scope ที่ผู้ใช้ระบุ ยังคำนวณจากข้อมูลจริงระดับ Category/SKU Hierarchy เดิม) |

เพิ่ม `<nav class="section-nav">` (Portfolio Quality / Platform Performance / Product Coverage) — Breakdown เดิมไม่มี Jump Navigation มาก่อน ตรงกับ MT Breakdown แล้ว — Page Subtitle เปลี่ยนจาก "platform and shop-level" เป็น **"platform-level"** (ตัด "shop-level" คำที่อ้างถึง Entity ที่ถูกลบไปแล้ว)

Filter Bar ของ Breakdown: Period, Category (ปัจจุบันใช้งานได้แค่ "All Categories" เหมือน MT/TT) — **ไม่มี Filter รายบุคคล** (ไม่มี Platform Owner selector หรือ "My platforms only") เพราะ Ecom ไม่มีแนวคิด Owner ต่อ Platform ที่ชัดเจนพอ ทุก Zone ของ ECOM Breakdown จึงเป็น Company-wide Ecom เสมอ ต่างจาก MT (KAM scope เฉพาะ Zone "Partner Performance") และ TT (Sales Rep scope เฉพาะ Zone "Team Performance")

Metric ที่ไม่มีใน MT/TT: ไม่มี AR% (ลูกค้าจ่ายผ่าน Platform โดยตรง ไม่มี Ledger ลูกหนี้แบบ MT/TT), ใช้ Return/Cancellation Rate แทน Return Rate (CN) เดี่ยวๆ, เพิ่ม AOV และ Conversion Rate ทั้งใน Executive Summary (Company-wide) และ Breakdown (แยกตาม Platform, Period-sensitive แล้ว) — Ads Spend ROI ที่เคยพิจารณาไว้ในดราฟต์แรกถูกตัดออกจาก Scope รอบนี้

**แก้ 2026-08-06:** ตัดแนวคิด "Shop ระดับ Breakdown" ทิ้งทั้งหมด (เดิมมี ~15-20 Shop สุ่มต่อไฟล์ กระจายตาม Platform ตามสัดส่วน Base — ดู Root Cause ด้านบน) — **Platform คือหน่วยวิเคราะห์เดียวที่ถูกต้องสำหรับ Ecom** ทั้ง Executive Summary และ Breakdown ใช้ `ecomChannels` (4 Platform) ชุดเดียวกันตลอด ไม่มี Entity ย่อยกว่านั้นอีกแล้ว

### 5.6 P&L Overview

Module Company-wide คู่ขนานกับ Sales Overview (ไม่ใช่ Channel Module แบบ MT/TT/ECOM) — ปิด Gap "ไม่มีมิติกำไร/Margin" ที่พบใน `Charmiss_Dashboard_Review_2026-07-31.md` (Task 5/6.1/7.3) ออกแบบไว้ที่ `Charmiss_Module_PnL_Spec.md` ก่อน Build

**Executive Summary** (6 KPI Card — ตามหลักการเดียวกับทุก Module คือไม่มีการ์ด Growth แยกต่างหาก): Gross Profit, Gross Margin %, Net Profit, Net Margin %, Profit Target Attainment % (Net Profit เทียบเป้าหมายที่ตั้งจาก Net Sales Target × 22% Net Margin สมมติฐาน), OPEX Ratio % (Delta กลับทิศเหมือน Return/Cancellation Rate — ยิ่งต่ำยิ่งดี) · Profit Trend, Margin Trend (Chart, รายเดือน) · P&L Waterfall (Net Sales → COGS → Gross Profit → Trade Spend → Logistics → Marketing/Ads → SG&A → Net Profit) · Margin by Channel, Margin by Category (Grouped Bar เทียบ Gross %/Net %) · Ranking by Channel (Table)

**Breakdown (Margin/Cost Structure เชิงลึก):**
| Section | Metric/Chart |
|---|---|
| Margin Quality by Channel | Net Margin % Trend by Channel (Multi-line MT/TT/Ecom), Cost Structure by Channel (100%-Stacked Bar: COGS/Trade Spend/Logistics/Marketing&Ads/SG&A/Net Profit) |
| Category Profitability | Highest/Lowest Margin Category (Callout), Margin by Category (ตอบสนอง Channel filter), Category Profit Matrix (Scatter — X: Net Profit Contribution ฿, Y: Net Margin % — Premium Stars/Volume Engines/Niche Premium/Needs Review), Category Profitability Ranking (Table ครบ 6 Category ไม่แบ่ง Top/Bottom เพราะมีแค่ 6 แถว) |
| Cost Structure Over Time | OPEX Trend (Stacked Area, Trade Spend/Logistics/Marketing&Ads/SG&A ย้อนหลัง 18 เดือน, Company-wide), Marketing & Ads Spend by Channel |

Filter Bar ของ Breakdown: Period, **Channel** (All/MT/TT/Ecom — Filter ใหม่ ไม่มีในหน้าอื่น scope เฉพาะ Zone Category Profitability), Category (ปัจจุบันใช้งานได้แค่ "All Categories" เหมือน Module อื่น) — ไม่มี Filter รายบุคคล เพราะ P&L เป็นมุมมอง Company/Channel-level ไม่มี Owner ต่อบุคคล

Margin Model (สรุปจาก Spec — ดูรายละเอียดสูตรที่ `Charmiss_Module_PnL_Spec.md`): Effective Margin % = Category Base Margin % × Channel Adjustment Factor (MT ×0.90, TT ×1.00, Ecom ×0.93) — **ตัวเลขต้นทุน/กำไรทั้งหมดเป็นสมมติฐาน Mock ล้วนๆ ไม่ใช่ข้อมูลบัญชีจริง** ไม่มีระบบ COGS/Ledger จริงรองรับ — Net Sales ทุกตัวใน Module นี้อ้างอิง `groupActual`/`groupTarget` byte-for-byte จาก `sales_overview.html` เหมือนกับ MT/TT/ECOM ทุกประการ ไม่มีการสร้างยอดขายใหม่

หมายเหตุความครบถ้วนของ Category Share ต้นทาง: `mtCategoryShares` และ `ecomCategoryShares` เป็นการ copy byte-for-byte จากไฟล์ MT/ECOM Executive Summary ตามหลักการเดียวกับ Net Sales — ส่วน `ttCategoryShares` เป็นการสร้างขึ้นใหม่จากค่าที่สังเกตได้ใน Screenshot การ Review (TT source files ไม่ได้ถูกส่งมาให้ Build แต่แรก มีแต่ Screenshot) จึงไม่ใช่ byte-for-byte copy เหมือนอีก 2 Channel — ควรตรวจทานกับไฟล์ TT จริงถ้ามีในอนาคต

Module นี้ยังปิด Task 7.4 ของ Review บางส่วน (Marketing & Ads Spend by Channel = เวอร์ชัน Company/Channel-level ของแนวคิด "Ads Spend ROI" ที่เคยตัดออกจาก ECOM Breakdown — ยังไม่ลงถึงระดับ Platform รายตัว)

ระหว่าง Build ได้แก้ `buildScatterSVG` ใน `shared.js` เพิ่ม Label-collision avoidance (ปิด Review Task 2.1) — มีผลย้อนไปถึง Category Portfolio Matrix ของ MT Breakdown, ECOM Breakdown, และ Product Analysis ด้วย ไม่ใช่แค่ P&L — **แก้เพิ่ม 2026-08-06 (Feedback):** ผู้ใช้รายงานว่า Label ยังชนกันอยู่บางจุด แต่ทดสอบซ้ำหลาย Combination (Level×Channel×Focus, ความกว้าง Container 314-900px) ใน MT Breakdown และ Product Analysis แล้วไม่พบการชนจริงในสภาพแวดล้อมนี้ — สืบพบ Root Cause ที่เป็นไปได้แทน: กล่อง Collision เดิมประเมินความกว้าง Label จาก **จำนวนตัวอักษร** (`length*3.15px`) ซึ่งเป็นค่าประมาณคงที่ ไม่ตรงกับความกว้าง Real Glyph ที่ Render จริง (ต่างกันได้ตาม Font ที่ระบบ User แต่ละคน Substitute ให้ `font-family` Stack ของหน้า) ทำให้กล่อง Collision ที่ใช้คำนวณอาจ "แคบกว่า" กล่องที่ Render จริงได้ในบางสภาพแวดล้อม — เปลี่ยนไปวัดความกว้างจริงด้วย `canvas.measureText()` (ฟังก์ชันใหม่ `measureTextWidth()`, เทียบ Font-size/weight/family เดียวกับ Label ที่จะ Render จริง, อ่าน `font-family` จาก `getComputedStyle(container)`) แทนการประมาณ — กล่องที่ใช้คำนวณ Collision ตรงกับกล่องที่ถูก Draw จริงเป๊ะไม่ว่าระบบ Font จะเป็นแบบไหน

---

## 6. File Dependency Map — ไฟล์ที่ต้องแนบเวลาแก้แต่ละ Module

ใช้ Section นี้เวลาจะเปิด Chat ใหม่เพื่อแก้เฉพาะ Module ใดๆ — บอกว่าไฟล์ไหน "ต้องมี" (โครงสร้าง/สไตล์ ขาดไม่ได้) และไฟล์ไหน "ต้องเช็คคู่กัน" (มีการ copy ข้อมูลบางส่วนแบบ byte-for-byte ข้ามไฟล์ ถ้าแก้ไฟล์หนึ่งแล้วลืมอีกไฟล์ ตัวเลขจะเพี้ยนไม่ตรงกันข้ามหน้า)

### 6.1 ไฟล์พื้นฐานที่ทุก Module ต้องมีเสมอ (Baseline)

ไม่ว่าจะแก้ Module ไหน ต้องแนบ 4 ไฟล์นี้คู่กันเสมอ เพราะทุกหน้า `<link>`/`<script>` ผูกกับไฟล์เหล่านี้หมด:

| ไฟล์ | หน้าที่ |
|---|---|
| `shared.css` | Design token, Card/KPI/Chart/Filter Bar styling ทั้งหมด — ใช้ร่วมกันทุกหน้า (ยกเว้น TT ที่แยก engine ของตัวเอง — ดู 6.3) — **แก้ 2026-08-04**: `.legend-list` (Donut+Legend Layout) เพิ่ม `max-width:300px` (reset เป็น `none` ที่ ≤768px) กัน Legend ยืดเต็มความกว้างการ์ดจนช่องว่างระหว่างชื่อ/ค่าดูเหมือนกราฟ "โหว่ตรงกลาง" บนการ์ดกว้าง — กระทบทุกหน้าที่ใช้ `.donut-layout` (Sales Overview, MT/ECOM Executive Summary) — **แก้ 2026-08-05**: เพิ่ม `html{scroll-behavior:smooth;}` (Global, กระทบทุกหน้าเป็นผลดี ใช้กับ `.section-nav` ที่มีอยู่แล้ว), `.legend-badge.caution` (Tier "Watch" สีเหลือง/ส้ม เติมช่องว่างระหว่าง `.best`/`.watch` เดิมสำหรับ Account Health 3-Tier Flag), `.chart-tooltip`/`.chart-tooltip-*` (Tooltip Element ใหม่สำหรับ `buildStreamAreaSVG` — Chart แรกในระบบที่มี Hover Interactivity จริง) |
| `shared.js` | ฟังก์ชันสร้างกราฟ/ตาราง/Sparkline ทั้งหมด (`buildLineChartSVG`, `buildDonutSVG`, `buildWaterfallSVG`, `sparklineSVG`, ฯลฯ) รวมถึง Utility (`fmtTHB`, `mulberry32`, `sumRange` ฯลฯ) — **แก้ไฟล์นี้ = กระทบทุกหน้าที่ import พร้อมกัน** ต้องเช็คทุกไฟล์หลังแก้ (ดูตัวอย่างจริงตอนแก้ `sparklineSVG`/`buildHBarCompareSVG` ที่ต้องไล่เช็ค 6-7 ไฟล์) — **แก้ 2026-08-04**: `buildHBarCompareSVG` (Diverging Bar จาก Baseline) ไม่เคยวาด Axis Tick/Gridline เลยตั้งแต่สร้างฟังก์ชัน มีแค่เส้นประ Reference เส้นเดียว ทำให้อ่าน Scale ไม่ออกว่าแท่งห่างจาก Reference แค่ไหน — เพิ่ม Gridline+Tick Label ด้วย `niceAxisTicks` (เหมือน `buildGroupedBarSVG`) ต้องเผื่อพื้นที่สูงขึ้น ~22px ต่อกราฟ (`AXIS_H`) จึงต้องขยาย `canvas-wrap` inline height ของทุกจุดที่เรียกใช้ที่พื้นที่เดิมไม่พอ (ตรวจแล้ว 6 จุดเรียกใช้ทั้งระบบ: `module_mt_breakdown.html`, `module_ecom_breakdown.html` ×4, `pnl_breakdown.html` — ปรับ inline height เฉพาะจุดที่ไม่พอ) — **แก้ 2026-08-05**: (1) `buildScatterSVG` Label-collision-avoidance เดิม (จาก 2026-08-01) เช็คแค่ระยะห่างจากจุดศูนย์กลาง และลองแค่ 2 ตำแหน่ง (บน/ล่าง) ไม่พอสำหรับจุดที่ใกล้กันทั้งแกน X และ Y (Bug จริงที่เจอ: "Color Cosmetics"/"Hair Care" ใน MT Breakdown's Category Portfolio Matrix) — เปลี่ยนเป็นเช็ค Bounding Box จริง (ประเมินความกว้าง Label จากจำนวนตัวอักษร) ลอง 8 ตำแหน่งผู้สมัคร (บน/ล่าง/4 มุมเฉียง/บนไกล/ล่างไกล) เทียบกับ Label อื่นที่วางแล้ว + ขอบ Plot + โซน Quadrant Label — กระทบทุกหน้าที่ใช้ `buildScatterSVG` (Product Analysis, MT Breakdown) เป็นผลดีทั้งหมด (2) `buildGroupedBarSVG` เพิ่ม `data-gi` Attribute บนทุกแท่ง (Harmless, ไม่กระทบ Visual) + `opts.clickableBars` (แค่เปลี่ยน Cursor) เพื่อให้ Caller ใดก็ได้ทำ Drill-through-on-click ได้เองโดยไม่ต้องแก้ฟังก์ชันเพิ่ม — ใช้ครั้งแรกที่ Store Productivity Distribution (Executive Summary) (3) เพิ่มฟังก์ชันใหม่ `buildStreamAreaSVG` + Helper `catmullRomResample`/`ensureChartTooltip` — Smooth Stacked-Area/Stream Chart (100%-Stacked ความหมายเดิม, Resample เส้นด้วย Catmull-Rom แทนการวาด Bezier จริงเพื่อความง่าย) พร้อม Hover Tooltip ผ่าน Element `#sharedChartTooltip` ตัวเดียวใช้ร่วมกันทุกจุดที่เรียก — **ไม่แตะ `buildStacked100BarSVG` เดิม** (Caller อื่นเช่น Store Productivity Quartile by Partner ยังใช้ตัวเดิมเหมือนเดิม) ใช้ครั้งแรกที่ "Category Share of Sales Over Time" ใน MT Breakdown — **แก้ 2026-08-06**: เพิ่มฟังก์ชันใหม่ `buildBulletBarSVG` (Port มาจาก TT's `renderBulletBarChart` แต่เขียนด้วย String-SVG Convention ของ `shared.js`: แท่ง Actual สีเขียว/แดงตาม Hit/Miss + เส้น Tick = Target + Caption หลายบรรทัดใต้แต่ละเดือน ใช้ครั้งแรกที่ "Target vs Actual" ใน MT Breakdown), เพิ่ม Field `opacity` (Optional, Default 1, Backward-compatible) ให้ `buildLineChartSVG` วาด Stroke จางลงได้ต่อ Series — ใช้ครั้งแรกที่ "Monthly Sales by Partner" ใน MT Breakdown (จางเส้นของคู่ค้าที่ไม่ติด Top 5) — **แก้ 2026-08-06 (รอบสอง, MT Store):** (1) `buildLineChartSVG` เดิมคำนวณ X-label Skip Interval (`showEvery`) จากจำนวน Label อย่างเดียว (>12 Label → Skip ทุกตัวที่ 2) ไม่คิดความกว้างจริงของ Container เลย ใช้ได้กับกราฟเต็มความกว้างแต่ Label ชนกันทันทีถ้าอยู่ใน Chart-grid ครึ่งความกว้าง (Bug จริงที่เจอ: Sales per Store Trend, MT Store) — เปลี่ยนเป็นคำนวณจาก `plotW` จริงหาร Label-width โดยประมาณ (30px) กระทบทุกกราฟที่ใช้ฟังก์ชันนี้เป็นผลดี ไม่ต้องแก้ Call Site ไหนเลย (2) เพิ่ม Field `opts.xAxisTitle` (Optional) ให้ `buildParetoSVG` — Caption ใต้แถว Label ของกลุ่ม สำหรับกราฟที่ Label เดี่ยวๆ (เช่น "1–10%") ไม่ชัดเจนพอ ใช้ครั้งแรกที่ Pareto Ranking, MT Store (3) เพิ่ม Field `opts.yAxisTitle` (Optional) ให้ `buildGroupedBarSVG` — Rotated Text ตามแนวแกน Y ซ้ายมือ (เผื่อ `padL` เพิ่ม 14px อัตโนมัติเมื่อมีค่านี้) ใช้ครั้งแรกที่ Store Productivity Distribution, MT Store (แทน Data Label เดิมที่ถูกตัดออก) — ทั้ง 3 จุดเป็น Optional Field ล้วน Backward-compatible กับ Caller เดิมทั้งหมด |
| `nav-menu.css` | Style ของ Dropdown เมนู Nav บน Topbar |
| `nav-menu.js` | `MODULE_MAP` — กำหนดลำดับ/รายชื่อ Module ใน Nav Dropdown และในหน้า `index.html` (Directory listing) พร้อมกัน — แก้ไฟล์นี้กระทบทั้ง 2 จุดพร้อมกันเสมอ — **แก้ 2026-08-05**: เพิ่ม Item `mt-store` (label "Store", href `module_mt_store.html`) เข้าไปในกลุ่ม MT Overview — ต้องเพิ่ม Tab Link คู่กันในทั้ง 3 ไฟล์ของ MT Overview ด้วย (`<nav class="tabs">` ของ Executive Summary/Breakdown/Store) ไม่ใช่แค่ตรงนี้ |

หมายเหตุ: `index.html` เป็นข้อยกเว้น ไม่ import `shared.js` (ไม่มีกราฟ/Mock data ในหน้านี้) ใช้แค่ `shared.css` + `nav-menu.css`/`nav-menu.js`

### 6.2 ต่อ Module — ไฟล์ HTML + Content Dependency (Byte-for-byte)

นอกจาก Baseline ด้านบน แต่ละ Module มี "ไฟล์ต้นทาง" ของ Mock data บางก้อนที่ถูก Copy แบบ byte-for-byte ไปใช้ในอีกไฟล์ — ถ้าจะแก้สูตร/ค่าพวกนี้ ต้องแก้พร้อมกันทั้งคู่ ไม่งั้นตัวเลขจะไม่ตรงกันข้ามหน้า (แพทเทิร์นนี้เจอ Bug จริงมาแล้วหลายจุดในเซสชันก่อนหน้า — ดู Review doc Task 1.4/2.2)

| Module / หน้า | ไฟล์ HTML | Content Dependency — ต้องเช็คคู่กับ | เอกสารอ้างอิง |
|---|---|---|---|
| Sales Overview → Executive Outlook | `sales_overview.html` | **เป็นไฟล์ต้นทาง (Master)** ของ Mock-data engine หลักทั้งระบบ — `mulberry32` seed, `channelDefs`, `genSeries()`, `groupActual`/`groupTarget`, `companyActual`/`companyTarget`, และ `mtCNRate`/`ttCNRate`/`ecomCancelRate` (Return/Cancellation Rate ต่อเดือน แยกอิสระต่อ Channel) ทุกไฟล์อื่นก็อบปี้ "Part 1" มาจากไฟล์นี้แบบ byte-for-byte — ถ้าแก้สูตรตรงนี้ ต้องไล่แก้ทุกไฟล์ในตารางนี้ ⚠️ **`mtCNRate`/`ttCNRate`/`ecomCancelRate` ต้องอยู่ตำแหน่ง rand()-sequence เดียวกันเป๊ะใน 5 ไฟล์**: `sales_overview.html`, `module_mt_executive_summary.html`, `module_mt_breakdown.html`, `module_ecom_executive_summary.html`, `module_ecom_breakdown.html` (2 ไฟล์ ECOM ไม่ได้ใช้ค่านี้จริง แต่ต้องคง Block เดิมไว้ตำแหน่งเดิมเพื่อรักษาลำดับ rand() ที่เหลือของไฟล์ให้ตรงกัน) — **แก้ 2026-08-06:** `channelDefs` เพิ่ม Entry `LineShop` (Ecom Platform ที่ 4) เป็นตัวสุดท้ายของกลุ่ม Ecom + ปรับลด Base ของ Lazada/Shopee/TikTok ลงเล็กน้อยให้ Ecom Total รวมใกล้เคียงเดิม — ⚠️ **ต้องแก้ Array นี้เหมือนกันทุกตัวอักษรใน 8 ไฟล์**: ไฟล์นี้ + `sales_overview_product_analysis.html`, `module_mt_executive_summary.html`, `module_mt_breakdown.html`, `module_ecom_executive_summary.html`, `module_ecom_breakdown.html`, `pnl_executive_summary.html`, `pnl_breakdown.html` (แทรกที่ตำแหน่งสุดท้ายของ Array เสมอ ไม่ใช่แทรกกลาง เพื่อไม่กระทบลำดับ `rand()` ของ MT/TT/Lazada/Shopee/TikTok ที่ GenSeries ประมวลผลไปก่อนแล้ว — มีผลแค่กับ `rand()` ของ Line Shop เองและ Part 2 ที่ตามมาในแต่ละไฟล์ ซึ่งเปลี่ยนค่าไปจากเดิมแต่ยังตรงกันข้ามไฟล์เหมือนก่อนแก้) | Spec §5.1, §5.5 |
| Sales Overview → Product Analysis | `sales_overview_product_analysis.html` | Part 1 = copy จาก `sales_overview.html` (`mulberry32` seed, `genSeries()`, `channelDefs`, `groupActual`/`companyActual` — เหมือนกันแบบ byte-for-byte จนถึงจุดที่ `companyActual` คำนวณเสร็จ) **แต่ไม่มี** `companyTarget`/`groupHref`/`mtCNRate`/`ttCNRate`/`ecomCancelRate` เพราะหน้านี้ไม่ใช้ค่าพวกนี้เลย — ไม่กระทบ rand()-sequence เพราะ Part 2 (`CATEGORY_TREE`) เป็นข้อมูล Hardcode ทั้งหมด ไม่มีการเรียก `rand()` เพิ่ม (ยกเว้น jitter เล็กน้อยใน Share Over Time ที่คำนวณทีหลังและไม่ผูกกับไฟล์อื่น) จึงไม่ต้องแก้ให้ตรงกับ Master แบบเป๊ะ ๆ; ใช้ `buildScatterSVG` (Category Portfolio Matrix), `buildWaterfallSVG` (Growth Contribution), `buildStacked100BarSVG` (Category Share Over Time), และ `buildParetoSVG` (Pareto / Concentration Analysis — ฟังก์ชันใหม่ใน `shared.js`, ปัจจุบันมีแค่ไฟล์นี้ไฟล์เดียวที่เรียกใช้) — `CATEGORY_TREE` มี Field `returnRate` (Mock, Static ต่อ Category) Inherit ผ่าน `enumerateLevel()` แบบเดียวกับ `growthYoY`/`channelMix` ใช้โดย Return/Cancellation Rate by Category chart | Spec §5.2 |
| MT → Executive Summary | `module_mt_executive_summary.html` | Part 1 = copy จาก `sales_overview.html` (รวม `mtCNRate`/`ttCNRate`/`ecomCancelRate` Block — ไฟล์นี้ใช้ `mtCNRate` จริงสำหรับ KPI "Return Rate (CN)"); **เป็นไฟล์ต้นทาง** ของ `mtCategoryShares`, `mtARSeries`, `mtPartnersSeries` (Part 2) — ⚠️ `mtARSeries`/`mtPartnersSeries` **ยังต้องคง Generation Block ไว้เหมือนเดิม** เพื่อรักษาลำดับ `rand()` ให้ตรงกับ `module_mt_breakdown.html` แม้ **แก้ 2026-08-04**: `mtARSeries` ไม่ถูกใช้แสดงผลที่ไหนแล้วทั้ง 2 ไฟล์ (Breakdown ตัด AR Aging การ์ดออกไปด้วยรอบนี้) — เก็บไว้เพื่อ rand()-sequence เท่านั้น ส่วน `mtPartnersSeries` ยังใช้จริงสำหรับ Active Partners KPI ใน Breakdown — **แก้ 2026-08-04**: เพิ่ม `CATEGORY_TREE` (Byte-for-byte copy โครงสร้าง Sub/Type/Series จาก `sales_overview_product_analysis.html`, Hardcode ล้วนไม่เรียก `rand()`) สำหรับ Product Level Toggle ใน "Sales by Category" การ์ด — Category-level (Depth 0) ยังอิงตัวเลข `mtCategoryShares` เดิม ระดับลึกกว่าคำนวณจากสัดส่วนภายใน `CATEGORY_TREE` เท่านั้น ไม่กระทบตัวเลข Category ที่ P&L Copy ไปใช้ — **`mtRetentionSeries` (เดิมใช้กับการ์ด Partner Retention) ถูกลบออกทั้ง Block แล้ว** เพราะไม่มีไฟล์อื่นเรียกใช้เลย (เช็คแล้วว่า `module_mt_breakdown.html` ไม่มีการอ้างอิง) การลบจึงไม่กระทบลำดับ `rand()` ของ Block ถัดไป เพราะ Mock Data ที่ตามมาทั้งหมด (`mtCategoryShares`, `keyAccounts`, `keyAccountStats`) เป็น Hardcode ล้วน ไม่มีการเรียก `rand()` เพิ่ม; `keyAccounts`/`keyAccountColors`/`keyAccountStats` (Sales by Key Account, 9 คู่ค้า, มี `growthYoY` ต่อคู่ค้าเพิ่มใหม่สำหรับ Growth Contribution Waterfall) เป็นข้อมูล Hardcode — **เป็นไฟล์ต้นทาง** ของค่า `pct`/`attain`/`ret` ที่ `module_mt_breakdown.html`'s `partners` const Copy ไปใช้ (คนละราย ไม่ใช่ byte-for-byte rand() แต่เป็นตัวเลข Hardcode ที่ต้องตรงกัน — ดูแถว MT → Breakdown ด้านล่าง) — ใช้ `buildParetoSVG`/`buildWaterfallSVG`/`buildHBarCompareSVG` (ทั้งสามฟังก์ชันมีอยู่แล้วใน `shared.js` จากไฟล์อื่น ไม่ใช่ของใหม่) — **แก้ 2026-08-06**: ลบ `keyAccounts[i].storeCount`/`storeWeights` และ Generation Block (เดิม `rand()` อีก 920 ครั้งต่อจาก `mtPartnersSeries`) ออกทั้งหมด พร้อมกับตัด Section "Store Performance" ออกจากไฟล์นี้ (ย้ายไป `module_mt_store.html` ซึ่งมี Data Model ของตัวเองอยู่แล้ว ไม่ต้อง Sync กัน) — ตรวจแล้วว่าไม่มี `rand()` เรียกต่อจากจุดนี้ในไฟล์นี้อีก (Mock Data ที่เหลือทั้งหมด Hardcode ล้วน) จึงลบได้โดยไม่กระทบลำดับ `rand()` ของ Block ใดๆ | Spec §5.3 |
| MT → Breakdown | `module_mt_breakdown.html` | Part 1 = copy จาก `module_mt_executive_summary.html` (ไม่ใช่จาก sales_overview ตรงๆ, รวม `mtCNRate` Block ด้วย — **แก้ 2026-08-04**: ไม่ได้ใช้แสดง Return Rate (CN) แบบ MT-wide เดี่ยวๆ แล้ว เก็บไว้เพื่อรักษาลำดับ `rand()` เท่านั้น ดู `partnerCNSeries` ด้านล่าง); `mtPartnersSeries` copy byte-for-byte จากไฟล์เดียวกัน — แก้ Active Partners ต้องแก้คู่ ⚠️ `partners` const (Partner Performance zone) ไม่ใช่ Mock อิสระ — ต้องมีชื่อ/`groupPct`(=`pct`)/`attainFactor`(=`attain`)/`cnRate`(=`ret`)/**`growthYoY`(=`growthYoY`, เพิ่มใหม่ 2026-08-05)** ตรงกับ `keyAccounts`/`keyAccountStats` ของ `module_mt_executive_summary.html` ทุกราย (9 Key Account เดียวกันเป๊ะ ไม่มี Sub-partner layer แล้ว) — ถ้าแก้ตัวเลข Key Account ฝั่ง Executive Summary ต้องแก้ไฟล์นี้ให้ตรงกันด้วยเสมอ — **แก้ 2026-08-04**: เพิ่ม `partnerCNSeries` (Return Rate (CN) by Key Account) — Mock รายเดือนต่อคู่ค้า จำลอง Random Walk รอบค่า `cnRate` คงที่ของแต่ละราย เป็น Breakdown-only ไม่มีไฟล์อื่นอ้างอิง ไม่ต้อง Sync rand()-sequence กับที่ไหน — **แก้ 2026-08-05**: `growthYoY` ที่เพิ่มใหม่เป็น Hardcode ล้วน (ไม่เรียก `rand()`) ใช้เป็นสัญญาณที่ 2 ของ `accountHealthOf()` (Account Health / Risk Signal Section ใหม่) ร่วมกับ `attainFactor`/`cnRate` เดิม — ไม่กระทบลำดับ `rand()` ของ Block ใดๆ ต่อจากนี้ — **แก้ 2026-08-06**: เพิ่ม `keyAccountColors` const (Byte-for-byte copy จาก `module_mt_executive_summary.html`, ลำดับเดียวกับ `partners`) + Helper `partnerColor(id)` สำหรับ Monthly Sales by Partner Trend Chart ใหม่ — เป็น Hardcode ล้วนไม่กระทบ `rand()`; ตัด `PARTNER_TABLE_CAP`/`partnersExpandOverride`/Delegated Click Listener ของ "See all partners" ออกทั้งหมด (ผูกกับ Table ที่ถูกลบไปพร้อมกัน) — **แก้ 2026-08-06 (รอบสอง)**: ลบ `KAM_NAMES`/`currentPartnerFilter()`/`kamFilterSelect`/`myAccountsOnly` ทั้งหมด (Field `kam` ใน `partners` ยังอยู่แต่ใช้แค่แสดงผล ไม่ Filter อะไรแล้ว), ลบ `accountHealthOf()` และทั้ง Section Account Health ทิ้งทั้งหมด, เพิ่ม Constant `RETURN_RATE_CEILING_PCT` (=4.0, ย้ายมาจาก Literal เดิมใน `accountHealthOf()`) ใช้ร่วมกับ High Return Rate Partner + เส้นประ Threshold ของ Return Rate Trend, เพิ่มฟังก์ชันใหม่ `renderPartnerSeeMore()` (Cap+"See all" สำหรับ Target vs Actual/YoY Growth by Partner) — ทั้งหมด Hardcode/Derived ไม่มีการเรียก `rand()` เพิ่ม ไม่กระทบลำดับ `rand()` ใดๆ | Spec §5.3, Review 1.4 |
| MT → Store (**ใหม่ 2026-08-05**) | `module_mt_store.html` | Part 1 = **ย่อ**จาก `sales_overview.html`/`module_mt_executive_summary.html` — Copy เฉพาะ Channel Def `'MT'` ตัวเดียว (ไม่รวม TT/Lazada/Shopee/TikTok) เพราะ `genSeries()` ใช้ `rand()` แบบ Self-contained ต่อ Channel และ `'MT'` เป็น Channel แรกที่ประมวลผลในทุกไฟล์อื่นอยู่แล้ว จึงได้ `groupActual.MT`/`groupTarget.MT` ตรงกันแบบ byte-for-byte โดยไม่ต้อง Copy `mtCNRate`/`channelDefs` ที่เหลือมาด้วย (ไฟล์นี้ไม่ใช้ Return Rate เลย); `keyAccounts`/`keyAccountColors`/`keyAccountStats` copy byte-for-byte จาก `module_mt_executive_summary.html` (Hardcode ล้วน ต้องแก้พร้อมกันถ้าเปลี่ยนตัวเลข Key Account ที่ไหนก็ตาม) — `storeWeights` **ไม่ต้อง** Sync กับ Executive Summary (Part 2, rand()-derived, Aggregate เท่ากันเสมอเพราะ Sum=1 เสมอ) — **เป็นไฟล์ต้นทางเดียว**ของ `storeOpenedMonth`/`newStoreWeightShare`/**`monthlyWeights`** (Field ใหม่ ไม่มีไฟล์อื่นใช้) ใช้ `buildParetoSVG`/`buildLineChartSVG`/`buildGroupedBarSVG` (มีอยู่แล้วใน `shared.js`) + Local Helper ใหม่ในไฟล์นี้เอง (`renderDumbbellRows()`, `computeStoreStability()`, `computeDynamicBuckets()`/`niceStep()`) — **แก้ 2026-08-06**: รับ "Avg Sales per Store by Partner" + "Store Productivity Distribution" เข้ามา; **แก้ 2026-08-06 (รอบสาม)**: ลด `storeCount` รวม 920→80 (Field เดิม ตัวเลข Hardcode ลดลง ไม่กระทบ rand()-sequence เพราะ `storeWeights`/`storeOpenedMonth` ยัง Derive จากจำนวน rand() Draw ตามจำนวนสาขาจริงเหมือนเดิม), ตัดคอลัมน์ Attainment ออกจาก Store Ranking Table ทั้งคู่ (ลบ `keyAccountStats`/`accountStats()` ที่ไม่มีใครใช้ต่อแล้ว), จัดลำดับ Section ใหม่ (Performance→Health→Ranking), เพิ่ม `monthlyWeights` สำหรับการ์ดใหม่ "Top Store Stability by Partner", ตัด `buildStacked100BarSVG` call ออก (การ์ด Quartile ถูกลบทั้งหมด ฟังก์ชันเองยังอยู่ใน `shared.js` เพราะไฟล์อื่นอาจใช้ในอนาคต), Sales per Store Trend ใช้ Adaptive Tick Fix ของ `buildLineChartSVG` (`shared.js`, ดูแถวนั้น) โดยอัตโนมัติไม่ต้องแก้ Call Site | Spec §5.3 |
| ECOM → Executive Summary | `module_ecom_executive_summary.html` | Part 1 = copy จาก `sales_overview.html` (รวม `mtCNRate`/`ttCNRate`/`ecomCancelRate` Block — ไฟล์นี้ **ไม่ได้ใช้ `mtCNRate`/`ttCNRate` จริง** แค่ต้องคง Block ไว้ตำแหน่งเดิมเพื่อรักษาลำดับ rand()); **เป็นไฟล์ต้นทาง** ของ `ecomCategoryShares`, `ecomAOVSeries`, `ecomConvSeries`, `ecomShopListingsSeries`, **`ecomPlatformStats`** (Part 2) — **แก้ 2026-08-06**: `channelDefs` (Part 1) เพิ่ม `LineShop` เป็น Entry สุดท้ายของกลุ่ม Ecom (ต้องแก้พร้อมกับทุกไฟล์ใน §6.2 ที่ก็อบปี้ Array นี้ — ดู §5.5), `ecomPlatformStats` เปลี่ยนจาก `{aov,conv,cancelFactor}` เป็น `{aovIndex,convIndex,cancelFactor}` | Spec §5.5 |
| ECOM → Breakdown | `module_ecom_breakdown.html` | Part 1 = copy จาก `module_ecom_executive_summary.html` (รวม `mtCNRate`/`ttCNRate`/`ecomCancelRate` Block เช่นเดียวกัน — ไม่ได้ใช้ `mtCNRate`/`ttCNRate` จริงเช่นกัน); copy byte-for-byte `ecomAOVSeries`/`ecomConvSeries`/`ecomShopListingsSeries`/`ecomPlatformStats` จากไฟล์เดียวกัน — แก้ Active Shop Listings (Executive Summary)/`ecomPlatformStats` ต้องแก้คู่ — **แก้ 2026-08-06 (รอบใหญ่):** ลบ `shops[]`/`PLATFORM_GROUPS`/`basesSum` ทั้งหมด (Breakdown-only Mock Data ไม่มี Cross-file Sync Requirement — ลบแล้วขยับ `rand()`-Sequence ของ `skus[]` ที่ตามมา แต่ปลอดภัยเพราะ SKU ก็เป็น Breakdown-only เหมือนกัน) — ดู §5.5 สำหรับรายละเอียด Section ที่ปรับใหม่ทั้งหมด (Portfolio Quality เพิ่ม Return/Cancellation Rate by Platform, "Shop Performance" เปลี่ยนเป็น "Platform Performance" พร้อมการ์ดใหม่ 3 ใบ, AOV/Conversion Rate by Platform แก้สูตรให้ Period-sensitive) | Spec §5.5, Review 1.4/2.2 |
| TT → Executive Summary / Breakdown / Sales Person | `tt_executive_summary.html`, `tt_breakdown.html`, `tt_sales_person.html` + `tt-shared.css`/`tt-shared.js` (**แยก Engine ของตัวเอง ไม่ใช้ shared.css/shared.js ร่วมกับหน้าอื่น**) | มีไฟล์จริงแล้วตั้งแต่ 2026-07-31 (ไม่ได้ Block แล้ว — แก้ 2026-08-06 ลบคำเตือนเดิมที่บอกว่าไม่มีไฟล์ต้นฉบับ ซึ่งไม่ตรงกับความจริงอีกต่อไป) — `render()` ใน `tt-shared.js` ใช้ร่วมกันระหว่าง Executive Summary กับ Breakdown เท่านั้น (คำนวณ/เขียนผลลง DOM ของทั้ง 2 หน้าในรอบเดียว ตามคอมเมนต์หัวไฟล์) แต่ละไฟล์ต้องมี "HIDDEN STUBS" (Element เปล่า `display:none` ครอบทุก id ที่ `render()` เขียนถึงแต่ไม่ได้แสดงผลจริงบนหน้านั้น) ไม่งั้น `render()` จะ Error — `renderSalesPersonPage()` เป็นฟังก์ชันแยก ไม่ได้ใช้ร่วมกับอีก 2 หน้า, มี `spState` ของตัวเอง — **แก้ 2026-08-06**: เพิ่ม `renderCategoryBars()` + Field `state.categoryLevel`/`state.overviewCategoryLevel`/`spState.categoryLevel` — ดู §5.4 | Spec §5.4 |
| P&L → Executive Summary | `pnl_executive_summary.html` | Part 1 = copy จาก `sales_overview.html`; Part 2 ใช้ `mtCategoryShares`/`ecomCategoryShares` (copy จาก MT/ECOM Executive Summary) + `ttCategoryShares` (⚠️ สร้างขึ้นเองจาก Screenshot ใน Review doc ไม่ใช่ byte-for-byte เพราะไม่มีไฟล์ TT จริง) | Spec §5.6, `Charmiss_Module_PnL_Spec.md` |
| P&L → Breakdown | `pnl_breakdown.html` | Part 1 = copy จาก `pnl_executive_summary.html` (ไม่ใช่จาก sales_overview ตรงๆ) — Part 2 "kept in sync with pnl_executive_summary.html" ตามคอมเมนต์ในไฟล์ | Spec §5.6, `Charmiss_Module_PnL_Spec.md` |
| Landing / Directory | `index.html` | ไม่มี Mock data — อ่าน `MODULE_MAP` จาก `nav-menu.js` มาสร้าง Directory listing; ปุ่ม Hero CTA Hardcode ไปที่ `sales_overview.html` ตรงๆ ไม่ได้อ่านจาก MODULE_MAP | Spec §2.1 |

### 6.3 กติกาเวลาแก้ (สรุปสั้น)

1. แก้แค่ Layout/CSS ของหน้าเดียว → แนบแค่ HTML ไฟล์นั้น + Baseline 4 ไฟล์ (6.1) พอ
2. แก้ตัวเลข/สูตร Mock data ที่มีคำว่า "Part 1" หรือชื่อ Series ที่ปรากฏในตาราง 6.2 มากกว่า 1 ไฟล์ → ต้องแนบทุกไฟล์ในแถวนั้นพร้อมกัน ไม่งั้นเลขจะไม่ตรงข้ามหน้า (แบบที่เคยเป็น Bug จริงมาแล้ว)
3. แก้ฟังก์ชันใน `shared.js` (เช่นฟังก์ชันสร้างกราฟ) → ควรแจ้งว่าจะ "แก้ทั้งระบบ" และแนบไฟล์ HTML ทุกหน้าที่เรียกใช้ฟังก์ชันนั้น (เช็คด้วย `grep` ชื่อฟังก์ชันก่อนเริ่มแก้) ไม่ใช่แนบแค่หน้าที่อยากแก้หน้าเดียว
4. TT ทั้ง 3 หน้ามีไฟล์จริงแล้ว (`tt_executive_summary.html`/`tt_breakdown.html`/`tt_sales_person.html` + `tt-shared.css`/`tt-shared.js`) — แก้ได้ตรงๆ ไม่ต้องผ่าน Screenshot-based review แล้ว (แก้ 2026-08-06 — ข้อนี้เคยระบุว่า Block อยู่ ไม่ตรงกับความจริงอีกต่อไป) แต่ต้องระวัง `render()` ที่ใช้ร่วมกันระหว่าง Executive Summary/Breakdown ตามที่ระบุใน §6.2 — แก้ Element ใดใน Breakdown ที่ Executive Summary มี Hidden Stub อยู่ (หรือกลับกัน) ต้องเช็คว่า Stub ยังครบ ไม่ตกหล่นจนทำให้อีกหน้า Error

---
