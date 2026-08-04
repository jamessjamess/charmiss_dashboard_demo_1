# Charmiss Enterprise Dashboard — Business Overview
## Requirements & System Design Specification

**อัปเดตล่าสุด:** 3 สิงหาคม 2569

---

## 1. Business Overview

### 1.1 วัตถุประสงค์
Enterprise Dashboard สำหรับ Charmiss เพื่อติดตาม **Sales Performance เทียบกับ Target** ครอบคลุม 3 Channel หลัก — MT (Modern Trade), TT (Traditional Trade), Ecom (Lazada / Shopee / TikTok Shop)

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

> หมายเหตุด้านไฟล์: P&L Overview, MT Overview, ECOM Overview และ Sales Overview ทั้ง 2 มุมมอง ใช้ Component กลาง (`shared.css`/`shared.js`) ร่วมกัน แยกไฟล์ตาม 1 มุมมอง = 1 ไฟล์ (`pnl_executive_summary.html`, `pnl_breakdown.html`, `module_mt_executive_summary.html`, `module_mt_breakdown.html`, `module_ecom_executive_summary.html`, `module_ecom_breakdown.html`, `sales_overview.html`, `sales_overview_product_analysis.html`) — ส่วน TT Overview เดิมเป็นไฟล์เดียวรวม 3 Tab ขนาดใหญ่มาก (~500KB) จึงแยกเป็น 3 ไฟล์อิสระ (`tt_executive_summary.html`, `tt_breakdown.html`, `tt_sales_person.html`) ใช้ Engine กลางของตัวเอง (`tt-shared.css`/`tt-shared.js`, แยกจาก `shared.css`/`shared.js` เพราะชื่อ Class ชนกัน) — `render()` ใน `tt-shared.js` คำนวณข้อมูลของ Executive Summary และ Breakdown พร้อมกันในรอบเดียวโดยตั้งใจ (ไม่แยก Mock Data ซ้ำสองชุด) ทั้ง 2 ไฟล์จึงเรียกฟังก์ชันเดียวกัน — ECOM Overview สร้างตาม Pattern เดียวกับ MT ตั้งแต่แรก (แยก 2 ไฟล์อิสระ ไม่มี Tab เดียวรวม #hash) เพราะมีโครงสร้างใกล้เคียง MT มากที่สุด (มีหน่วยขายย่อยหลายหน่วย คือ Platform Lazada/Shopee/TikTok Shop และไม่มี Region/Sales Person filter)

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
└── Ecom (E-commerce)      → Lazada, Shopee, TikTok Shop
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
| Sales by Channel | Donut (ครึ่งซ้าย) — มี % Label บนกราฟโดยตรง + Badge "Best"/"Watch" ที่ Legend (Channel ที่ Attainment สูงสุด/ต่ำสุด) |
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
| Return / Cancellation Rate Trend | Line Chart รายเดือน 3 เส้นอิสระต่อกัน (MT, TT, Ecom — Rate Series อิสระต่อ Channel ดู 6.2) เส้นประ = Threshold 5% แต่ละเส้นแสดงทั้ง % และมูลค่า ฿ คู่กัน (จุดล่าสุดบนกราฟ + Insight Caption ใต้กราฟ สรุปค่าเฉลี่ยของ Period ต่อ Channel + ตารางแบบละเอียดเมื่อกดดู) |

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
| [ระดับที่เลือก] Growth Contribution | Waterfall — แทนที่ Category Share of Sales Over Time เดิม (ย้ายไป Full Width ด้านล่างแล้ว) แนวคิดเดียวกับ Growth Contribution Waterfall ของ Executive Outlook แต่เป็นระดับ Category/Sub-Category/Type/Series แทน Channel — "ปีก่อน" ต่อ Node ประมาณจากยอดขายปีนี้หารด้วย (1+%Growth YoY ของ Node นั้น) เพราะ Mock Data ไม่มี Time Series จริงระดับ Category (มีแต่ %Growth YoY เป็นค่าคงที่ต่อ Node) — คำนวณจาก `syncedAll` (Node Set เดียวกับที่ Sync Level+Channel Filter) เสมอ เพื่อให้ Start+ผลรวม Delta ตรงกับ End เป๊ะไม่ว่าจะกรอง Channel หรือไม่ — จำกัด Top 8 by \|Contribution\| + Focus Pin ที่เหลือรวมเป็นแท่ง "Other (N)" |

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

**Revenue Trend** (Chart, Full Width — ตัด Monthly YoY Growth % คู่เดิมออก เพราะ %YoY เห็นอยู่แล้วในแถว YoY ของการ์ด Net Sales)

**Key Account Portfolio** (Section รวมทุก Metric/Chart ที่มองในมุมคู่ค้ารายบุคคลไว้ด้วยกัน):

| Metric/Chart | ประเภท |
|---|---|
| Sales by Key Account + Sales by Category | จัดคู่กัน (Chart Grid) เหมือน Sales Overview — Executive Outlook ที่วาง "Sales by Channel" คู่ "Sales by Category" — Sales by Key Account เป็น Donut (เปลี่ยนจากชื่อ Format Placeholder เดิม เป็น**ชื่อคู่ค้าจริงในตลาดไทย**: WATSONS, EVEANDBOY, Lotus's, 7-Eleven, KONVY, CJ Express, Beautrium, Tsuruha, Multy — ตัวเลข % ส่วนแบ่งและสถิติทั้งหมด (Attainment/Return Rate/AR%/Growth YoY) ยังเป็น Mock Data ไม่ใช่ข้อมูลจริงของคู่ค้า) ส่วน Sales by Category มี **Product Level Toggle ในตัวการ์ดเอง** (Category/Sub-Category/Type/Series — ปุ่ม Local เฉพาะการ์ดนี้ ไม่ใช่ Filter ระดับหน้าแบบ Product Analysis) โครงสร้าง `CATEGORY_TREE` copy มาจาก Product Analysis (โครงสร้าง Sub/Type/Series เท่านั้น) แต่ระดับ Category (Depth 0) ยังคงใช้ตัวเลข `mtCategoryShares` เดิมเป๊ะ (ตัวเลขเดียวกับที่ P&L Copy ไป) ส่วนระดับลึกกว่าคำนวณจากสัดส่วนภายใน `CATEGORY_TREE` คูณทบลงมาบนตัวเลข Category เดิม — แสดง Top 10 ต่อระดับ พร้อม Caption "Top 10 of N" เมื่อเกิน |
| Partner Concentration / Pareto | `buildParetoSVG` (ฟังก์ชันเดียวกับ Product Analysis) — แท่ง %ยอดขายต่อคู่ค้า + เส้นสะสม, เส้นประ Reference 80%, แท่งเลย 80% จางสี — ตอบคำถาม "กี่คู่ค้าที่คิดเป็นสัดส่วนหลักของยอดขาย MT" คู่ค้ามีแค่ 9 รายทั้งหมด (List คงที่ ไม่มี Level Drill-down แบบ Product Analysis) จึงแสดงครบทุกรายโดยไม่ต้อง Cap Top-N/"Other" |
| Key Account Growth Contribution | Waterfall (`buildWaterfallSVG`) — แนวคิดเดียวกับ Category Growth Contribution ใน Product Analysis: "ปีก่อน" ต่อคู่ค้าประมาณจากยอดขายปีนี้หารด้วย (1+%Growth YoY ของคู่ค้านั้น ซึ่งเป็นค่าคงที่ Mock ต่อราย ไม่ใช่ Time Series จริง) คำนวณ Start/End จากผลรวม Bottom-up เสมอเพื่อให้ Start+ΣDelta ตรงกับ End เป๊ะไม่ว่าจะกรอง Period ไหน — บอกว่าคู่ค้ารายไหน Contribute การเติบโตกี่ ฿ จริง คนละมุมกับ Donut ที่เห็นแค่สัดส่วน ณ ปัจจุบัน |

**แก้ 2026-08-06 (Sub Module Navigation):** เพิ่ม `<nav class="section-nav">` ใต้ Filter Bar พร้อม 3 ลิงก์ (Executive Summary / Key Account Portfolio / Store Performance) ชี้ไปที่ `id` ใหม่บน Section Label ที่มีอยู่แล้ว (`sec-exec-summary`, `sec-key-account-portfolio`, `sec-store-performance`) — ให้ Executive Summary มี Sub Module Jump Navigation แบบเดียวกับที่ Breakdown มีอยู่แล้วจากรอบก่อน (ผู้ใช้ยืนยันให้ทำแบบ Jump-nav เหมือนกัน ไม่ใช่ Tab Panel แยกมุมมอง) — ไม่มีการย้าย/ลบ Content ใดๆ แค่เพิ่ม Anchor ครอบ Section ที่มีชื่ออยู่แล้ว

**แก้ 2026-08-04**: ตัด "Target Attainment by Key Account" (Diverging Bar) ออกจาก Executive Summary ทั้งหมด — ระหว่างตรวจพบว่า `buildHBarCompareSVG` (ฟังก์ชันที่ใช้ร่วมกับ "Target vs Actual per Partner" ใน Breakdown, ECOM Breakdown, และ P&L Breakdown) ไม่เคยวาด Axis Tick/Gridline เลยตั้งแต่แรก มีแค่เส้นประ Reference เส้นเดียว ทำให้ผู้ใช้อ่าน Scale ไม่ออกว่าแต่ละแท่งห่างจาก 100% แค่ไหน — **แก้ที่ตัว `shared.js` โดยตรง** (เพิ่ม Gridline+Tick Label แบบ `niceAxisTicks` เหมือน `buildGroupedBarSVG`) ซึ่งมีผลดีขึ้นทันทีกับทุกกราฟที่เรียกใช้ฟังก์ชันนี้ ไม่ใช่แค่กราฟที่ถูกตัดออกไป — ส่วนกราฟตัวนี้เองผู้ใช้ตัดสินใจตัดออกจาก Executive Summary ไปเลยหลังเห็นปัญหา Scale (ยังมีอยู่ใน Breakdown → Partner Performance ในชื่อ "Target vs Actual per Partner")

ตัด Ranking — Top Key Accounts by Net Sales (Table) ออกจาก Executive Summary เพราะข้อมูลเดียวกัน (ยอดขาย + Attainment ต่อคู่ค้า) ตอนนี้เห็นครบกว่าเดิมผ่าน Donut + Pareto + Waterfall ด้านบนแล้ว ไม่ต้องมีตารางซ้ำ (Ranking แบบละเอียดครบทุกรายยังมีอยู่ใน Breakdown → Partner Performance)

**Store Performance (5 of 9 Key Accounts)** (Section ใหม่ — ตั้งชื่อระบุจำนวนคู่ค้าที่มีข้อมูลไว้ในหัวข้อตรงๆ กันสับสนว่าเป็นข้อมูลไม่ครบทุกคู่ค้า, มี Caption อธิบายกำกับด้วยว่าคู่ค้าไหนไม่มีข้อมูลระดับสาขาและทำไม — ออกแบบไว้ให้ย้ายทั้ง Section นี้ไปเป็นจุดเริ่มต้นของ Store Tab แยกต่างหากได้ทันทีเมื่อสร้างในอนาคต โดยไม่ต้องออกแบบใหม่):

| Metric/Chart | ประเภท |
|---|---|
| Avg Sales per Store by Partner | Ranked Bar (Pattern เดียวกับ Sales by Category/Growth Ranking) — ยอดขายรวมของคู่ค้า (ตามช่วงเวลาที่เลือก) หารด้วยจำนวนสาขา วัด "ประสิทธิภาพต่อสาขา" แทน "ขนาดรวม" เฉพาะ 5 คู่ค้าที่มี `storeCount`: WATSONS (460 สาขา), EVEANDBOY (85), CJ Express (320), Beautrium (35), Multy (20) — Lotus's/7-Eleven/KONVY/Tsuruha ไม่มีข้อมูลระดับสาขาจริง (ได้รับ Sales Report เป็นก้อนเดียว) จึงไม่รวมในกราฟนี้ — มี Insight Caption ท้ายการ์ด (Highest/Lowest ฿/store + อัตราส่วนต่างกันกี่เท่า) |
| Store Productivity Distribution | Histogram (`buildGroupedBarSVG` ใช้เป็น Single-series Bar Chart ธรรมดา, ไม่ Group, เปิด Data Label ต่อแท่งด้วย `showValueLabels`/`valueLabelFormatter` — แสดง 2 บรรทัดต่อแท่ง: จำนวนร้านค้า และ ฿ยอดขายรวม + % ของจำนวนร้านค้าทั้งหมดในกลุ่มนั้น) — นับจำนวนสาขา (รวมทั้ง 5 คู่ค้าที่มีข้อมูล, 920 สาขา) แบ่งตามช่วงยอดขายต่อสาขาในช่วงเวลาที่เลือก 6 ช่วง (<10K, 10K–30K, 30K–60K, 60K–100K, 100K–200K, ≥200K) — ยอดขายต่อสาขาคำนวณจาก Weight คงที่ต่อสาขา (Generate ครั้งเดียวด้วย `rand()`, สัดส่วน rand()² ให้กระจายแบบ Long-tail สมจริง คือมีสาขาเล็กเยอะ + สาขาใหญ่ไม่กี่แห่ง) คูณด้วยยอดขายรวมของคู่ค้านั้นตามช่วงเวลาที่กรอง (Pattern เดียวกับ `CATEGORY_TREE.pct` ใน Product Analysis: Weight คงที่ × Total ที่ผันตาม Period) — **แก้ 2026-08-05 (Drill-through)**: คลิกที่แท่งไหนก็ได้เพื่อดูรายชื่อสาขาจริงใน Bucket นั้น (Top 10 เรียงตามยอดขาย, เก็บ List สาขารายตัวไว้ใน `latestData.storeHistBuckets` ควบคู่กับ `bucketCounts`/`bucketValues` เดิม) — ใช้ `data-gi` Attribute ใหม่ที่ `buildGroupedBarSVG` เติมให้ทุกแท่งอัตโนมัติ (ไม่กระทบ Caller อื่นที่ไม่ได้ตั้ง `opts.clickableBars`) + Event Delegation บน Container เดิม |

**Breakdown (ข้อมูลคู่ค้า):** ตัด Page Subtitle ออก (แก้ 2026-08-04 ตามหลักการเดียวกับ Executive Summary — ชื่อ Section/Card อธิบายตัวเองพออยู่แล้ว)

**Execution quality pass (แก้ 2026-08-05):** ผู้ใช้ขอให้ยกระดับ Breakdown ให้ใกล้เคียงมาตรฐาน "TT Overview — Breakdown" ด้าน Navigation/Drill-through/Chart Quality โดยไม่ Copy โครงสร้างทั้งหมด (โมเดลธุรกิจ MT ต่างจาก TT และมีข้อจำกัดด้านข้อมูลบางอย่าง) รายละเอียดทั้งหมดอยู่ในตารางด้านล่างและ Note ท้าย Section — สรุปภาพรวม: เพิ่ม Anchor/Jump Navigation (`.section-nav`, มีอยู่แล้วใน `shared.css` แต่ไม่เคยถูกใช้ในหน้านี้มาก่อน), แก้ Target vs Actual ไม่ให้โชว์เดือนที่ยังไม่ปิดงวดเป็นแท่ง "+฿0" หลอกๆ, แก้ Label ทับกันใน Portfolio Matrix, เปลี่ยน Category Share of Sales Over Time เป็น Smooth Stream Chart พร้อม Hover Tooltip (Interactivity ตัวแรกในทั้งระบบ), เพิ่ม Drill-through ที่ Partners Ranked by Revenue และ Store Productivity Distribution (Executive Summary), และเพิ่ม Section ใหม่ "Account Health / Risk Signal" (ประกอบจาก 3 สัญญาณเดิม ไม่ใช่ Data Source ใหม่)

| Section | Metric/Chart |
|---|---|
| Portfolio Quality | Target vs Actual (Diverging Bar รายเดือน, Actual−Target, เขียว/แดงตาม Hit/Miss — **แก้ 2026-08-05**: ตัดเดือนที่ยังไม่ปิดงวด (Jul-Dec) ออกจาก Chart ไปเลย แทนที่จะ Coerce เป็นแท่งสีเขียว "+฿0" ซึ่งดูเหมือนมีข้อมูลจริงว่า Attainment ตรงเป้า ทั้งที่จริงคือไม่มีข้อมูล — ใช้ Array `closedIdx` ใหม่แยกจาก `curYearIdx` ที่ Return Rate Trend ข้างล่างยังใช้ต่อ เพราะ Line Chart หยุดวาดที่จุด `null` ได้เองอยู่แล้วไม่ต้องแก้), Return Rate (CN) Trend (MT-wide เส้นเดียว, เส้นประ Threshold 4% — แก้ 2026-08-05 ก่อนหน้านี้: เคยลองแยกเส้นตาม Top 5 Key Account + Other แล้วรวมกลับเป็นเส้นเดียวตามฟีดแบ็ก) — **ตัด AR Aging ออก** (แก้ 2026-08-04 — MT ไม่แสดง AR ที่จุดใดในหน้านี้แล้วทั้ง Executive Summary และ Breakdown ตาม Requirement เดิมที่บอกว่า AR ไม่ใช่ Focus หลักของ Module นี้ ดู Note ท้าย Section 5.3) |
| Partner Performance | Target vs Actual per Partner คู่กับ YoY Growth by Partner (Chart Grid 2 การ์ด — **แก้ 2026-08-06**: จัดคู่กันใหม่ ทั้งสองใช้ `buildHBarCompareSVG` เรียงลำดับเดียวกัน (ตามยอดขาย) เพื่อดูพร้อมกันว่าคู่ค้าที่ถึง/ไม่ถึงเป้ากำลังโตหรือหดตัวด้วยหรือไม่ — YoY Growth by Partner เป็นการ์ดใหม่ ใช้ Field `growthYoY` เดิมที่มีอยู่แล้ว (Reference 0%, เขียว/แดงตามเครื่องหมาย), มี Insight Caption สรุปจำนวนรายที่หดตัว), Monthly Sales by Partner (**การ์ดใหม่ 2026-08-06** — Multi-line Trend เต็ม 36 เดือน ไม่ผูก Period Filter (ผูกแค่ KAM/My-accounts-only), สูตรเดียวกับ Store Page's Sales per Store Trend คือ Weight คงที่ (`groupPct`) × MT Total ที่ผันตามเดือน, สีเส้นต่อคู่ค้าใช้ `keyAccountColors` เดียวกับ Executive Summary (Copy มาเป็น `keyAccountColors` const ในไฟล์นี้ด้วย) เพื่อให้สีคู่ค้าเดียวกันตรงกันข้ามหน้า) — **แก้ 2026-08-06: ตัด "Partners Ranked by Revenue" Table ออกทั้งหมด** (รวม `PARTNER_TABLE_CAP`/Drill-through See-all Mechanism ที่เพิ่งสร้างไปเมื่อ 2026-08-05 ด้วย เพราะตารางที่มันแนบอยู่ถูกตัดไปพร้อมกัน) ตามคำขอผู้ใช้ — `sortedByNet` (Array เดิม) ยังคงอยู่ เพราะทั้ง 2 การ์ดใหม่และ Bullet Chart เดิมยังใช้ลำดับนี้ร่วมกัน |
| **Account Health / Risk Signal (Section ใหม่ 2026-08-05)** | Composite Scorecard ต่อ Key Account — รวม 3 สัญญาณที่มีอยู่แล้วในหน้านี้/Executive Summary: Attainment (< 100% = สัญญาณลบ), Growth YoY (`growthYoY`, ติดลบ = สัญญาณลบ, Copy มาจาก Executive Summary's `keyAccounts` ใหม่ในรอบนี้เพื่อใช้เป็นสัญญาณที่ 2), Return Rate/CN (≥ 4.0% = สัญญาณลบ, ใช้ Threshold เดียวกับเส้นประใน Return Rate (CN) Trend ด้านบน) — Flag 3 ระดับ: Healthy (ไม่มีสัญญาณลบ) / Watch (สัญญาณลบ 1 ใน 3) / At Risk (สัญญาณลบ ≥2 ใน 3) เรียงตาม Priority: Flag ก่อน (At Risk > Watch > Healthy) → จำนวนสัญญาณลบมาก→น้อย → ยอดขายมาก→น้อย, มี Callout สรุป At Risk/Watch ด้านบนพร้อมตัวเลขจริง, ผูกกับ Filter KAM/My accounts only เดียวกับ Zone B เพราะจุดประสงค์คือ "KAM ควรโฟกัสคู่ค้าไหนก่อน" — **ไม่ใช่ Dimension ใหม่ที่ต้องเก็บข้อมูลเพิ่ม เป็นการจัดเรียง 3 ตัวเลขที่มีอยู่แล้วให้เห็นภาพเดียว** |
| Product Coverage | Sales by Category (มี Product Level Toggle ในตัวการ์ด — Category/Sub-Category/Type/Series, แก้ 2026-08-05 ก่อนหน้านี้ เพิ่มจากเดิมที่ Fix ที่ระดับ Category อย่างเดียว), Category Portfolio Matrix (มี Axis Title ครบตั้งแต่แรก, คงอยู่ที่ระดับ Category เสมอไม่ผูกกับ Level Toggle — **แก้ 2026-08-05**: Label Bubble ที่เคยทับกัน (เช่น "Color Cosmetics"/"Hair Care" ที่ Growth%/ยอดขายใกล้กัน) แก้ที่ฟังก์ชัน `buildScatterSVG` กลาง — ดู §6.1), **Partner × Category** (Heatmap — แถว = 9 Key Account, คอลัมน์ = Top 8 Node ที่ Level เดียวกับ Sales by Category ข้างบน, ค่า = % Row-normalized ต่อคู่ค้า, ใช้ Mock `partnerCategorySkew` ต่อคู่ค้า Nudge สัดส่วน Category ให้ต่างจาก Company-wide ตามสมมติฐาน Format ร้าน), Category Share of Sales Over Time (**แก้ 2026-08-05**: เปลี่ยนจาก 100%-Stacked Bar ที่มี % + ฿ Label ทุกช่องทุกเดือน (18 เดือน×6 หมวด = 108 Label พร้อมกัน อ่านยาก) เป็น Smooth Stream/Area Chart ผ่านฟังก์ชันใหม่ `buildStreamAreaSVG` — ตัวเลขย้ายไปอยู่ Hover Tooltip แทน (Interactive Chart ตัวแรกในระบบทั้งหมด ทุกกราฟอื่นใช้ปุ่ม "ดูเป็นตาราง" แทน Hover) — Insight Caption สรุป Mix shift ยังอยู่เหมือนเดิม) — ทั้ง Zone นี้ Company-wide เสมอ ไม่ผูกกับ Filter Key Account Manager/My accounts only |

Anchor/Jump Navigation (แก้ 2026-08-05): เพิ่ม `<nav class="section-nav">` ใต้ Filter Bar พร้อม 4 ลิงก์ (Portfolio Quality / Partner Performance / Account Health / Product Coverage) ชี้ไปที่ `id` บน Section Label แต่ละอัน — Class `.section-nav` มีอยู่แล้วใน `shared.css` ตั้งแต่ก่อนหน้านี้ (ใช้ใน Sales Overview/Product Analysis) แต่ไม่เคยถูกใช้ใน MT Breakdown มาก่อน เพิ่ม `html{scroll-behavior:smooth;}` ระดับ Global ให้การกดลิงก์ Scroll นุ่มนวลขึ้น (กระทบทุกหน้า เป็นผลดีทั้งหมด ไม่มีผลเสีย)

**แก้ 2026-08-06 (Partner Performance ปรับใหม่ตามคำขอ):** ผู้ใช้ขอ 3 อย่างต่อ Partner Performance Zone: (1) จัดคู่กัน "Target vs Actual per Partner" กับการ์ดใหม่ "YoY Growth by Partner", (2) ตัด "Partners Ranked by Revenue" Table ออก, (3) เพิ่ม "Monthly Sales by Partner" เป็น Trend Chart — ทำครบทั้ง 3 ข้อ ดูรายละเอียดในตาราง Section ด้านบน (แถว Partner Performance) — ไม่กระทบ Zone A/B.5/C

Filter Bar ของ Breakdown: Period, Category (ปัจจุบันใช้งานได้แค่ "All Categories" ตัวเลือกอื่นยัง Disabled รอ Partner×Category Data Model), Key Account Manager, "My accounts only" (Scope ไปที่ KAM คนแรกในรายชื่อ — Demo Only)

Partner ระดับ Breakdown คือ Key Account 9 รายเดียวกันกับ Executive Summary เป๊ะ (ไม่มี Sub-partner ซ้อนอีกชั้น) — ตัวเลข Net Sales Share/Attainment/Return Rate (CN) ต่อรายใช้ค่าเดียวกับ `keyAccountStats` ของ Executive Summary ทุกประการ เพื่อให้ 2 หน้าเล่าเรื่องตรงกันเสมอ, Breakdown เพิ่มแค่มิติ KAM Ownership (3 KAM แบ่งรับผิดชอบ 3-3-3 ราย) และ Filter KAM/My accounts only ที่ Executive Summary ไม่มี ("Partner" ในความหมายของ Breakdown จึงหมายถึงคู่ค้าทั้งบัญชี ไม่ใช่สาขาย่อย — ข้อมูลระดับสาขาเป็นคนละมิติ อยู่ที่ Store Performance section ของ Executive Summary แทน) (แก้ 2026-08-04 — เดิมเป็นคู่ค้าสังเคราะห์ ~38 รายกระจายใต้ 5 Format Group Placeholder ซึ่งเป็นข้อมูลคนละชุดกับ Key Account จริงที่ใช้ใน Executive Summary แล้ว ตอนนี้เลิกใช้)

**หมายเหตุ AR ใน MT (แก้ 2026-08-04):** หลังตัด AR Aging ออกจาก Breakdown รอบนี้ MT Module ไม่มีจุดไหนแสดงข้อมูล AR ให้ผู้ใช้เห็นอีกแล้ว (AR% ถูกตัดจาก Executive Summary ไปตั้งแต่รอบก่อนหน้า) — `mtARSeries` ยังต้อง Generate อยู่ในทั้ง 2 ไฟล์เพื่อรักษาลำดับ `rand()` (ดู §6.2) แต่ไม่ถูกใช้แสดงผลที่ไหนแล้วในโมดูลนี้ ถ้าต้องการดู AR ของ MT ต้องเพิ่มกลับมาใหม่ในอนาคต

**Store (Build แล้ว, แก้ 2026-08-05):** เดิมเป็น Spec ร่างรอ Confirm ทิศทาง ตอนนี้ Build เป็น Tab ที่ 3 ของ MT Overview แล้ว (`module_mt_store.html`) แยกจาก Breakdown ตามที่ร่างไว้ — เพิ่ม Nav Item `mt-store` ใน `MODULE_MAP` (nav-menu.js) และเพิ่ม Tab Link "Store" ใน `<nav class="tabs">` ของทั้ง 3 ไฟล์ (Executive Summary, Breakdown, Store เอง)

| Section | Metric/Chart | หมายเหตุการ Build |
|---|---|---|
| KPI (4 การ์ด) | Total Stores, Avg Sales per Store, Same-Store Sales Growth (SSSG), New Stores Opened | ทั้ง 4 ใบผูกกับ Partner filter (ยกเว้น Total Stores/Avg ที่คำนวณจาก Scope ที่กรองอยู่) |
| Store Ranking | Top Store Ranking (Table Top 10 เรียงตามยอดขายสุทธิ: Rank, Store, Partner, Net Sales, Attainment, YoY Growth) | Attainment/YoY Growth ต่อสาขาอ้างอิงจากค่าเฉลี่ยระดับคู่ค้า (Mock Model ไม่มี Target/Time Series แยกรายสาขาจริง) — ระบุไว้ใน Info-icon อย่างตรงไปตรงมา |
| Store Ranking | Pareto Ranking (ใช้ `buildParetoSVG` ที่มีอยู่แล้วใน `shared.js` จากรอบ Category Deep-dive — **ไม่ต้องสร้าง Component ใหม่ตามที่ร่างไว้เดิม**, แบ่งสาขาเป็น 10 Decile ตามยอดขายต่อสาขาจากมากไปน้อย, Threshold 80%) | Insight Caption คำนวณจาก List สาขาเต็ม (ไม่ใช่จาก Decile) เพื่อความแม่นยำ เช่น "Top 318 stores (35% of 920) generate 80% of net sales" |
| Store Performance | Sales per Store Trend (Multi-line 36 เดือนเต็ม แยกเส้นตาม Partner ที่อยู่ใน Scope) | ใช้สูตร "Weight คงที่ × MT Total ที่ผันตามเดือน" (`groupActual.MT[m]*a.pct/100`) เดียวกับที่อื่นในระบบ |
| Store Performance | Same-Store Sales Growth by Partner (Grouped Bar เทียบ Total Growth vs SSSG ต่อคู่ค้า) | ดู Data Model ใหม่ด้านล่าง |
| Store Health (Company-wide เสมอ ไม่ผูก Partner filter) | New Stores Opened รายเดือน ย้อนหลัง 12 เดือน (Bar Chart) + Caption ระบุ "0 closures recorded in source data" | ไม่ Mock ตัวเลขปิดสาขาให้ตามที่เคยเสนอไว้ — เลือกระบุ Caveat ตรงๆ แทนการสร้างตัวเลขหลอก |
| Store Health (Company-wide เสมอ) | Store Productivity Quartile by Partner (100%-Stacked Bar ใช้ `buildStacked100BarSVG` ที่มีอยู่แล้ว, Quartile คำนวณจาก Store List รวมทั้ง 5 Partner) | ต่อยอดจาก Store Productivity Distribution ของ Executive Summary ตามที่ร่างไว้ |

**Data Model ใหม่ที่เพิ่มเข้ามาสำหรับหน้านี้ (`storeOpenedMonth`):** ตามที่ร่าง Spec ไว้ว่าเป็น Field เดียวที่ยังไม่มีในระบบ — เพิ่ม `a.storeOpenedMonth` (Array ขนาดเท่า `storeCount`, ค่าเป็น `null` = เปิดมาก่อนหน้าต่างข้อมูล 36 เดือน, หรือ Index เดือนใน 12 เดือนล่าสุด = เพิ่งเปิด) และ `a.newStoreWeightShare` (สัดส่วน Weight ของสาขาที่ถูก Tag ว่า "ใหม่") ต่อ Key Account ที่มี `storeCount` เท่านั้น สาขา "ใหม่" ถูกสุ่มเลือก**แบบสุ่มล้วน ไม่ใช่เรียงจาก Weight น้อยไปมาก** (ลองแบบเรียง Weight ก่อนแล้วพบว่าทำให้ต้อง Tag สาขาเป็นสัดส่วนสูงเกินจริง เพราะสาขาเล็กสุดในโมเดล Long-tail มี Weight น้อยมาก ต้องใช้จำนวนสาขามากถึงจะรวมกันได้ถึง Target Share) — สุ่มแบบไม่เอนเอียงทำให้จำนวนสาขา "ใหม่" ใกล้เคียงสัดส่วนเป้าหมายจริง (เช่น EVEANDBOY Target 12% ได้สาขาใหม่ประมาณ 9-10 สาขาจาก 85 ไม่ใช่หลักหลายสิบ) SSSG คำนวณจากสูตร `((1+growthYoY/100)*(1-newStoreWeightShare)-1)*100` ซึ่งอิง `growthYoY` เดิมที่ Executive Summary/Breakdown ใช้อยู่แล้ว (ไม่ขัดแย้งกับตัวเลขที่เผยแพร่ไปแล้วที่อื่น) `NEW_STORE_TARGET_SHARE` เป็นค่า Illustrative ต่อ Account (WATSONS 2.5%, EVEANDBOY 12%, CJ Express 8%, Beautrium 5%, Multy 0% — Multy ไม่มีสาขาใหม่เลยเพราะ Growth ติดลบล้วนเป็น Organic Decline)

Coverage caveat (คงตามที่ร่างไว้): ข้อมูลระดับสาขามีเฉพาะ 5 จาก 9 Key Account (WATSONS, EVEANDBOY, CJ Express, Beautrium, Multy) — Note นี้แสดงเป็น `chart-subtitle` ใต้ Filter Bar เหมือนกับที่ Executive Summary ใช้อยู่แล้ว (Copy คำอธิบายมาเกือบทั้งหมด)

Filter Bar ที่ Build จริง: Period (Dropdown เหมือนทุกหน้า) + Partner (`<select>` จำกัดเฉพาะ 5 รายที่มีข้อมูลสาขา, ค่าเริ่มต้น "All 5 Partners") — ไม่ได้เพิ่ม Store Tier/Quartile filter ตามที่เคยเสนอไว้เป็นตัวเลือก เนื่องจากยังไม่มี Use Case ชัดเจนที่ต้องใช้ร่วมกับ Filter อื่น

รอบนี้ยังไม่ทำ: ตัวเลขจำนวนสาขาปิดจริง (ต้องมี Concept "สถานะสาขา" ในข้อมูลต้นทางก่อน), Store Tier filter

### 5.4 TT Overview

**Executive Summary:** Total Net Sales, Target Attainment, AR%, Return Rate (CN), Active Stores, Store Retention (KPI) · Revenue Trend, Monthly YoY Growth % (Chart) · Sales by Customer Group, Sales by Category (Chart) · Sales Ranking by Rep (Table)

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
| (บนสุด) | Target Achievement (KPI), This Month at a Glance |
| My Priority Actions | Stores Needing Attention, AR By Due Date, Inactive Customers |
| Sales Snapshot | Daily Sales, Target vs Actual vs Diff |
| My Customers & Products | Top & Bottom Performing Stores, My Customer Group Mix, My Sales by Category |
| Credit Notes (CN) | CN Record (ตาราง, ดาวน์โหลดได้) |

### 5.5 ECOM Overview

**Executive Summary** (6 KPI Card — ตามหลักการเดียวกับ MT/TT คือไม่มีการ์ด Growth YoY/Growth MoM แยกต่างหาก เพราะซ้ำกับแถว MoM/YoY ในการ์ด Net Sales/Target Attainment): Net Sales (Ecom), Target Attainment %, Return/Cancellation Rate, AOV (Average Order Value), Conversion Rate, Active Shop Listings · Revenue Trend, Monthly YoY Growth % (Chart) · Sales by Platform (Donut — Lazada/Shopee/TikTok Shop, สีตรงกับ `--lazada`/`--shopee`/`--tiktok` ใน `shared.css`) · Sales by Category · Ranking by Platform (Table — Net Sales, Target Attainment, Return/Cancellation Rate, AOV, Conversion Rate ต่อ Platform)

**Breakdown (ข้อมูล Ecom Shop):**
| Section | Metric/Chart |
|---|---|
| Portfolio Quality | Target vs Actual per Platform (Diverging Bar จาก Baseline 100%, ทั้ง 3 Platform, เขียว/แดงตาม Hit/Miss), Return/Cancellation Rate Trend (รายเดือน, เส้นประ Threshold 8%) |
| Shop Performance | Active Shop Listings, Shop Concentration (Top 5 Shop = % ของยอดขาย Ecom), Target vs Actual per Shop (Diverging Bar จาก Baseline 100%, Top 10 by Net Sales), Top 5 / Bottom 5 Shops by Revenue (Table), AOV by Platform, Conversion Rate by Platform |
| Product Coverage | Sales by Category, Category Portfolio Matrix (มี Axis Title ครบตั้งแต่แรก), Category Share of Sales Over Time, Top 5 / Bottom 5 SKU by Revenue (ระดับ Series ในลำดับชั้น Category Hierarchy ข้อ 4.2 — ระบุด้วยรหัส SKU-0xx แทนชื่อ Product จริง) |

Filter Bar ของ Breakdown: Period, Category (ปัจจุบันใช้งานได้แค่ "All Categories" เหมือน MT/TT) — **ไม่มี Filter รายบุคคล** (ไม่มี Platform Owner selector หรือ "My platforms only") เพราะ Ecom ไม่มีแนวคิด Owner ต่อ Platform ที่ชัดเจนพอ ทุก Zone ของ ECOM Breakdown จึงเป็น Company-wide Ecom เสมอ ต่างจาก MT (KAM scope เฉพาะ Zone "Partner Performance") และ TT (Sales Rep scope เฉพาะ Zone "Team Performance")

Metric ที่ไม่มีใน MT/TT: ไม่มี AR% (ลูกค้าจ่ายผ่าน Platform โดยตรง ไม่มี Ledger ลูกหนี้แบบ MT/TT), ใช้ Return/Cancellation Rate แทน Return Rate (CN) เดี่ยวๆ, เพิ่ม AOV และ Conversion Rate ทั้งใน Executive Summary (Company-wide) และ Breakdown (แยกตาม Platform) — Ads Spend ROI ที่เคยพิจารณาไว้ในดราฟต์แรกถูกตัดออกจาก Scope รอบนี้

Shop ระดับ Breakdown (24 Shop, กระจายตาม Platform ตามสัดส่วน Base ของ channelDefs — Lazada/Shopee/TikTok Shop) เป็นคนละชุดข้อมูลกับ Platform ระดับ Executive Summary เช่นเดียวกับหลักการ Partner/Key Account ของ MT

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

ระหว่าง Build ได้แก้ `buildScatterSVG` ใน `shared.js` เพิ่ม Label-collision avoidance (ปิด Review Task 2.1) — มีผลย้อนไปถึง Category Portfolio Matrix ของ MT Breakdown, ECOM Breakdown, และ Product Analysis ด้วย ไม่ใช่แค่ P&L

---

## 6. File Dependency Map — ไฟล์ที่ต้องแนบเวลาแก้แต่ละ Module

ใช้ Section นี้เวลาจะเปิด Chat ใหม่เพื่อแก้เฉพาะ Module ใดๆ — บอกว่าไฟล์ไหน "ต้องมี" (โครงสร้าง/สไตล์ ขาดไม่ได้) และไฟล์ไหน "ต้องเช็คคู่กัน" (มีการ copy ข้อมูลบางส่วนแบบ byte-for-byte ข้ามไฟล์ ถ้าแก้ไฟล์หนึ่งแล้วลืมอีกไฟล์ ตัวเลขจะเพี้ยนไม่ตรงกันข้ามหน้า)

### 6.1 ไฟล์พื้นฐานที่ทุก Module ต้องมีเสมอ (Baseline)

ไม่ว่าจะแก้ Module ไหน ต้องแนบ 4 ไฟล์นี้คู่กันเสมอ เพราะทุกหน้า `<link>`/`<script>` ผูกกับไฟล์เหล่านี้หมด:

| ไฟล์ | หน้าที่ |
|---|---|
| `shared.css` | Design token, Card/KPI/Chart/Filter Bar styling ทั้งหมด — ใช้ร่วมกันทุกหน้า (ยกเว้น TT ที่แยก engine ของตัวเอง — ดู 6.3) — **แก้ 2026-08-04**: `.legend-list` (Donut+Legend Layout) เพิ่ม `max-width:300px` (reset เป็น `none` ที่ ≤768px) กัน Legend ยืดเต็มความกว้างการ์ดจนช่องว่างระหว่างชื่อ/ค่าดูเหมือนกราฟ "โหว่ตรงกลาง" บนการ์ดกว้าง — กระทบทุกหน้าที่ใช้ `.donut-layout` (Sales Overview, MT/ECOM Executive Summary) — **แก้ 2026-08-05**: เพิ่ม `html{scroll-behavior:smooth;}` (Global, กระทบทุกหน้าเป็นผลดี ใช้กับ `.section-nav` ที่มีอยู่แล้ว), `.legend-badge.caution` (Tier "Watch" สีเหลือง/ส้ม เติมช่องว่างระหว่าง `.best`/`.watch` เดิมสำหรับ Account Health 3-Tier Flag), `.chart-tooltip`/`.chart-tooltip-*` (Tooltip Element ใหม่สำหรับ `buildStreamAreaSVG` — Chart แรกในระบบที่มี Hover Interactivity จริง) |
| `shared.js` | ฟังก์ชันสร้างกราฟ/ตาราง/Sparkline ทั้งหมด (`buildLineChartSVG`, `buildDonutSVG`, `buildWaterfallSVG`, `sparklineSVG`, ฯลฯ) รวมถึง Utility (`fmtTHB`, `mulberry32`, `sumRange` ฯลฯ) — **แก้ไฟล์นี้ = กระทบทุกหน้าที่ import พร้อมกัน** ต้องเช็คทุกไฟล์หลังแก้ (ดูตัวอย่างจริงตอนแก้ `sparklineSVG`/`buildHBarCompareSVG` ที่ต้องไล่เช็ค 6-7 ไฟล์) — **แก้ 2026-08-04**: `buildHBarCompareSVG` (Diverging Bar จาก Baseline) ไม่เคยวาด Axis Tick/Gridline เลยตั้งแต่สร้างฟังก์ชัน มีแค่เส้นประ Reference เส้นเดียว ทำให้อ่าน Scale ไม่ออกว่าแท่งห่างจาก Reference แค่ไหน — เพิ่ม Gridline+Tick Label ด้วย `niceAxisTicks` (เหมือน `buildGroupedBarSVG`) ต้องเผื่อพื้นที่สูงขึ้น ~22px ต่อกราฟ (`AXIS_H`) จึงต้องขยาย `canvas-wrap` inline height ของทุกจุดที่เรียกใช้ที่พื้นที่เดิมไม่พอ (ตรวจแล้ว 6 จุดเรียกใช้ทั้งระบบ: `module_mt_breakdown.html`, `module_ecom_breakdown.html` ×4, `pnl_breakdown.html` — ปรับ inline height เฉพาะจุดที่ไม่พอ) — **แก้ 2026-08-05**: (1) `buildScatterSVG` Label-collision-avoidance เดิม (จาก 2026-08-01) เช็คแค่ระยะห่างจากจุดศูนย์กลาง และลองแค่ 2 ตำแหน่ง (บน/ล่าง) ไม่พอสำหรับจุดที่ใกล้กันทั้งแกน X และ Y (Bug จริงที่เจอ: "Color Cosmetics"/"Hair Care" ใน MT Breakdown's Category Portfolio Matrix) — เปลี่ยนเป็นเช็ค Bounding Box จริง (ประเมินความกว้าง Label จากจำนวนตัวอักษร) ลอง 8 ตำแหน่งผู้สมัคร (บน/ล่าง/4 มุมเฉียง/บนไกล/ล่างไกล) เทียบกับ Label อื่นที่วางแล้ว + ขอบ Plot + โซน Quadrant Label — กระทบทุกหน้าที่ใช้ `buildScatterSVG` (Product Analysis, MT Breakdown) เป็นผลดีทั้งหมด (2) `buildGroupedBarSVG` เพิ่ม `data-gi` Attribute บนทุกแท่ง (Harmless, ไม่กระทบ Visual) + `opts.clickableBars` (แค่เปลี่ยน Cursor) เพื่อให้ Caller ใดก็ได้ทำ Drill-through-on-click ได้เองโดยไม่ต้องแก้ฟังก์ชันเพิ่ม — ใช้ครั้งแรกที่ Store Productivity Distribution (Executive Summary) (3) เพิ่มฟังก์ชันใหม่ `buildStreamAreaSVG` + Helper `catmullRomResample`/`ensureChartTooltip` — Smooth Stacked-Area/Stream Chart (100%-Stacked ความหมายเดิม, Resample เส้นด้วย Catmull-Rom แทนการวาด Bezier จริงเพื่อความง่าย) พร้อม Hover Tooltip ผ่าน Element `#sharedChartTooltip` ตัวเดียวใช้ร่วมกันทุกจุดที่เรียก — **ไม่แตะ `buildStacked100BarSVG` เดิม** (Caller อื่นเช่น Store Productivity Quartile by Partner ยังใช้ตัวเดิมเหมือนเดิม) ใช้ครั้งแรกที่ "Category Share of Sales Over Time" ใน MT Breakdown |
| `nav-menu.css` | Style ของ Dropdown เมนู Nav บน Topbar |
| `nav-menu.js` | `MODULE_MAP` — กำหนดลำดับ/รายชื่อ Module ใน Nav Dropdown และในหน้า `index.html` (Directory listing) พร้อมกัน — แก้ไฟล์นี้กระทบทั้ง 2 จุดพร้อมกันเสมอ — **แก้ 2026-08-05**: เพิ่ม Item `mt-store` (label "Store", href `module_mt_store.html`) เข้าไปในกลุ่ม MT Overview — ต้องเพิ่ม Tab Link คู่กันในทั้ง 3 ไฟล์ของ MT Overview ด้วย (`<nav class="tabs">` ของ Executive Summary/Breakdown/Store) ไม่ใช่แค่ตรงนี้ |

หมายเหตุ: `index.html` เป็นข้อยกเว้น ไม่ import `shared.js` (ไม่มีกราฟ/Mock data ในหน้านี้) ใช้แค่ `shared.css` + `nav-menu.css`/`nav-menu.js`

### 6.2 ต่อ Module — ไฟล์ HTML + Content Dependency (Byte-for-byte)

นอกจาก Baseline ด้านบน แต่ละ Module มี "ไฟล์ต้นทาง" ของ Mock data บางก้อนที่ถูก Copy แบบ byte-for-byte ไปใช้ในอีกไฟล์ — ถ้าจะแก้สูตร/ค่าพวกนี้ ต้องแก้พร้อมกันทั้งคู่ ไม่งั้นตัวเลขจะไม่ตรงกันข้ามหน้า (แพทเทิร์นนี้เจอ Bug จริงมาแล้วหลายจุดในเซสชันก่อนหน้า — ดู Review doc Task 1.4/2.2)

| Module / หน้า | ไฟล์ HTML | Content Dependency — ต้องเช็คคู่กับ | เอกสารอ้างอิง |
|---|---|---|---|
| Sales Overview → Executive Outlook | `sales_overview.html` | **เป็นไฟล์ต้นทาง (Master)** ของ Mock-data engine หลักทั้งระบบ — `mulberry32` seed, `channelDefs`, `genSeries()`, `groupActual`/`groupTarget`, `companyActual`/`companyTarget`, และ `mtCNRate`/`ttCNRate`/`ecomCancelRate` (Return/Cancellation Rate ต่อเดือน แยกอิสระต่อ Channel) ทุกไฟล์อื่นก็อบปี้ "Part 1" มาจากไฟล์นี้แบบ byte-for-byte — ถ้าแก้สูตรตรงนี้ ต้องไล่แก้ทุกไฟล์ในตารางนี้ ⚠️ **`mtCNRate`/`ttCNRate`/`ecomCancelRate` ต้องอยู่ตำแหน่ง rand()-sequence เดียวกันเป๊ะใน 5 ไฟล์**: `sales_overview.html`, `module_mt_executive_summary.html`, `module_mt_breakdown.html`, `module_ecom_executive_summary.html`, `module_ecom_breakdown.html` (2 ไฟล์ ECOM ไม่ได้ใช้ค่านี้จริง แต่ต้องคง Block เดิมไว้ตำแหน่งเดิมเพื่อรักษาลำดับ rand() ที่เหลือของไฟล์ให้ตรงกัน) | Spec §5.1 |
| Sales Overview → Product Analysis | `sales_overview_product_analysis.html` | Part 1 = copy จาก `sales_overview.html` (`mulberry32` seed, `genSeries()`, `channelDefs`, `groupActual`/`companyActual` — เหมือนกันแบบ byte-for-byte จนถึงจุดที่ `companyActual` คำนวณเสร็จ) **แต่ไม่มี** `companyTarget`/`groupHref`/`mtCNRate`/`ttCNRate`/`ecomCancelRate` เพราะหน้านี้ไม่ใช้ค่าพวกนี้เลย — ไม่กระทบ rand()-sequence เพราะ Part 2 (`CATEGORY_TREE`) เป็นข้อมูล Hardcode ทั้งหมด ไม่มีการเรียก `rand()` เพิ่ม (ยกเว้น jitter เล็กน้อยใน Share Over Time ที่คำนวณทีหลังและไม่ผูกกับไฟล์อื่น) จึงไม่ต้องแก้ให้ตรงกับ Master แบบเป๊ะ ๆ; ใช้ `buildScatterSVG` (Category Portfolio Matrix), `buildWaterfallSVG` (Growth Contribution), `buildStacked100BarSVG` (Category Share Over Time), และ `buildParetoSVG` (Pareto / Concentration Analysis — ฟังก์ชันใหม่ใน `shared.js`, ปัจจุบันมีแค่ไฟล์นี้ไฟล์เดียวที่เรียกใช้) — `CATEGORY_TREE` มี Field `returnRate` (Mock, Static ต่อ Category) Inherit ผ่าน `enumerateLevel()` แบบเดียวกับ `growthYoY`/`channelMix` ใช้โดย Return/Cancellation Rate by Category chart | Spec §5.2 |
| MT → Executive Summary | `module_mt_executive_summary.html` | Part 1 = copy จาก `sales_overview.html` (รวม `mtCNRate`/`ttCNRate`/`ecomCancelRate` Block — ไฟล์นี้ใช้ `mtCNRate` จริงสำหรับ KPI "Return Rate (CN)"); **เป็นไฟล์ต้นทาง** ของ `mtCategoryShares`, `mtARSeries`, `mtPartnersSeries` (Part 2) — ⚠️ `mtARSeries`/`mtPartnersSeries` **ยังต้องคง Generation Block ไว้เหมือนเดิม** เพื่อรักษาลำดับ `rand()` ให้ตรงกับ `module_mt_breakdown.html` แม้ **แก้ 2026-08-04**: `mtARSeries` ไม่ถูกใช้แสดงผลที่ไหนแล้วทั้ง 2 ไฟล์ (Breakdown ตัด AR Aging การ์ดออกไปด้วยรอบนี้) — เก็บไว้เพื่อ rand()-sequence เท่านั้น ส่วน `mtPartnersSeries` ยังใช้จริงสำหรับ Active Partners KPI ใน Breakdown — **แก้ 2026-08-04**: เพิ่ม `CATEGORY_TREE` (Byte-for-byte copy โครงสร้าง Sub/Type/Series จาก `sales_overview_product_analysis.html`, Hardcode ล้วนไม่เรียก `rand()`) สำหรับ Product Level Toggle ใน "Sales by Category" การ์ด — Category-level (Depth 0) ยังอิงตัวเลข `mtCategoryShares` เดิม ระดับลึกกว่าคำนวณจากสัดส่วนภายใน `CATEGORY_TREE` เท่านั้น ไม่กระทบตัวเลข Category ที่ P&L Copy ไปใช้ — **`mtRetentionSeries` (เดิมใช้กับการ์ด Partner Retention) ถูกลบออกทั้ง Block แล้ว** เพราะไม่มีไฟล์อื่นเรียกใช้เลย (เช็คแล้วว่า `module_mt_breakdown.html` ไม่มีการอ้างอิง) การลบจึงไม่กระทบลำดับ `rand()` ของ Block ถัดไป เพราะ Mock Data ที่ตามมาทั้งหมด (`mtCategoryShares`, `keyAccounts`, `keyAccountStats`) เป็น Hardcode ล้วน ไม่มีการเรียก `rand()` เพิ่ม; `keyAccounts`/`keyAccountColors`/`keyAccountStats` (Sales by Key Account, 9 คู่ค้า, มี `growthYoY` ต่อคู่ค้าเพิ่มใหม่สำหรับ Growth Contribution Waterfall) เป็นข้อมูล Hardcode — **เป็นไฟล์ต้นทาง** ของค่า `pct`/`attain`/`ret` ที่ `module_mt_breakdown.html`'s `partners` const Copy ไปใช้ (คนละราย ไม่ใช่ byte-for-byte rand() แต่เป็นตัวเลข Hardcode ที่ต้องตรงกัน — ดูแถว MT → Breakdown ด้านล่าง) — ใช้ `buildParetoSVG`/`buildWaterfallSVG`/`buildHBarCompareSVG` (ทั้งสามฟังก์ชันมีอยู่แล้วใน `shared.js` จากไฟล์อื่น ไม่ใช่ของใหม่); `keyAccounts[i].storeCount`/`storeWeights` (เฉพาะ 5 ใน 9 คู่ค้า, รวม 920 สาขา) เพิ่ม `rand()` อีก 920 ครั้งต่อจาก `mtPartnersSeries` — ปลอดภัยเพราะ Mock Data ที่ตามมาในไฟล์นี้ (`mtCategoryShares`, `keyAccountStats`) เป็น Hardcode ล้วนไม่เรียก `rand()` ต่อ จึงไม่กระทบลำดับใดๆ ที่เหลือ | Spec §5.3 |
| MT → Breakdown | `module_mt_breakdown.html` | Part 1 = copy จาก `module_mt_executive_summary.html` (ไม่ใช่จาก sales_overview ตรงๆ, รวม `mtCNRate` Block ด้วย — **แก้ 2026-08-04**: ไม่ได้ใช้แสดง Return Rate (CN) แบบ MT-wide เดี่ยวๆ แล้ว เก็บไว้เพื่อรักษาลำดับ `rand()` เท่านั้น ดู `partnerCNSeries` ด้านล่าง); `mtPartnersSeries` copy byte-for-byte จากไฟล์เดียวกัน — แก้ Active Partners ต้องแก้คู่ ⚠️ `partners` const (Partner Performance zone) ไม่ใช่ Mock อิสระ — ต้องมีชื่อ/`groupPct`(=`pct`)/`attainFactor`(=`attain`)/`cnRate`(=`ret`)/**`growthYoY`(=`growthYoY`, เพิ่มใหม่ 2026-08-05)** ตรงกับ `keyAccounts`/`keyAccountStats` ของ `module_mt_executive_summary.html` ทุกราย (9 Key Account เดียวกันเป๊ะ ไม่มี Sub-partner layer แล้ว) — ถ้าแก้ตัวเลข Key Account ฝั่ง Executive Summary ต้องแก้ไฟล์นี้ให้ตรงกันด้วยเสมอ — **แก้ 2026-08-04**: เพิ่ม `partnerCNSeries` (Return Rate (CN) by Key Account) — Mock รายเดือนต่อคู่ค้า จำลอง Random Walk รอบค่า `cnRate` คงที่ของแต่ละราย เป็น Breakdown-only ไม่มีไฟล์อื่นอ้างอิง ไม่ต้อง Sync rand()-sequence กับที่ไหน — **แก้ 2026-08-05**: `growthYoY` ที่เพิ่มใหม่เป็น Hardcode ล้วน (ไม่เรียก `rand()`) ใช้เป็นสัญญาณที่ 2 ของ `accountHealthOf()` (Account Health / Risk Signal Section ใหม่) ร่วมกับ `attainFactor`/`cnRate` เดิม — ไม่กระทบลำดับ `rand()` ของ Block ใดๆ ต่อจากนี้ — **แก้ 2026-08-06**: เพิ่ม `keyAccountColors` const (Byte-for-byte copy จาก `module_mt_executive_summary.html`, ลำดับเดียวกับ `partners`) + Helper `partnerColor(id)` สำหรับ Monthly Sales by Partner Trend Chart ใหม่ — เป็น Hardcode ล้วนไม่กระทบ `rand()`; ตัด `PARTNER_TABLE_CAP`/`partnersExpandOverride`/Delegated Click Listener ของ "See all partners" ออกทั้งหมด (ผูกกับ Table ที่ถูกลบไปพร้อมกัน) | Spec §5.3, Review 1.4 |
| MT → Store (**ใหม่ 2026-08-05**) | `module_mt_store.html` | Part 1 = **ย่อ**จาก `sales_overview.html`/`module_mt_executive_summary.html` — Copy เฉพาะ Channel Def `'MT'` ตัวเดียว (ไม่รวม TT/Lazada/Shopee/TikTok) เพราะ `genSeries()` ใช้ `rand()` แบบ Self-contained ต่อ Channel และ `'MT'` เป็น Channel แรกที่ประมวลผลในทุกไฟล์อื่นอยู่แล้ว จึงได้ `groupActual.MT`/`groupTarget.MT` ตรงกันแบบ byte-for-byte โดยไม่ต้อง Copy `mtCNRate`/`channelDefs` ที่เหลือมาด้วย (ไฟล์นี้ไม่ใช้ Return Rate เลย); `keyAccounts`/`keyAccountColors`/`keyAccountStats` copy byte-for-byte จาก `module_mt_executive_summary.html` (Hardcode ล้วน ต้องแก้พร้อมกันถ้าเปลี่ยนตัวเลข Key Account ที่ไหนก็ตาม) — `storeWeights` **ไม่ต้อง** Sync กับ Executive Summary (Part 2, rand()-derived, Aggregate เท่ากันเสมอเพราะ Sum=1 เสมอ) — **เป็นไฟล์ต้นทางเดียว**ของ `storeOpenedMonth`/`newStoreWeightShare` (Field ใหม่ ไม่มีไฟล์อื่นใช้) ใช้ `buildParetoSVG`/`buildLineChartSVG`/`buildGroupedBarSVG`/`buildStacked100BarSVG` (ทั้งหมดมีอยู่แล้วใน `shared.js`, ไม่มีฟังก์ชันใหม่) | Spec §5.3 |
| ECOM → Executive Summary | `module_ecom_executive_summary.html` | Part 1 = copy จาก `sales_overview.html` (รวม `mtCNRate`/`ttCNRate`/`ecomCancelRate` Block — ไฟล์นี้ **ไม่ได้ใช้ `mtCNRate`/`ttCNRate` จริง** แค่ต้องคง Block ไว้ตำแหน่งเดิมเพื่อรักษาลำดับ rand()); **เป็นไฟล์ต้นทาง** ของ `ecomCategoryShares`, `ecomAOVSeries`, `ecomConvSeries`, `ecomShopListingsSeries` (Part 2) | Spec §5.5 |
| ECOM → Breakdown | `module_ecom_breakdown.html` | Part 1 = copy จาก `module_ecom_executive_summary.html` (รวม `mtCNRate`/`ttCNRate`/`ecomCancelRate` Block เช่นเดียวกัน — ไม่ได้ใช้ `mtCNRate`/`ttCNRate` จริงเช่นกัน); copy byte-for-byte `ecomAOVSeries`/`ecomConvSeries`/`ecomShopListingsSeries` จากไฟล์เดียวกัน — แก้ Active Shop Listings ต้องแก้คู่ | Spec §5.5, Review 1.4/2.2 |
| TT → Executive Summary / Breakdown / Sales Person | `tt_executive_summary.html`, `tt_breakdown.html`, `tt_sales_person.html` + `tt-shared.css`/`tt-shared.js` (**แยก Engine ของตัวเอง ไม่ใช้ shared.css/shared.js ร่วมกับหน้าอื่น**) | ⚠️ **ไม่มีไฟล์ต้นฉบับสักไฟล์ในทุกเซสชันที่ผ่านมา** มีแต่ Screenshot ที่ใช้ตรวจ Review เท่านั้น — ถ้าจะแก้ต้องได้ไฟล์จริงจากทีมก่อน | Spec §5.4, Review 4.3/8.5 |
| P&L → Executive Summary | `pnl_executive_summary.html` | Part 1 = copy จาก `sales_overview.html`; Part 2 ใช้ `mtCategoryShares`/`ecomCategoryShares` (copy จาก MT/ECOM Executive Summary) + `ttCategoryShares` (⚠️ สร้างขึ้นเองจาก Screenshot ใน Review doc ไม่ใช่ byte-for-byte เพราะไม่มีไฟล์ TT จริง) | Spec §5.6, `Charmiss_Module_PnL_Spec.md` |
| P&L → Breakdown | `pnl_breakdown.html` | Part 1 = copy จาก `pnl_executive_summary.html` (ไม่ใช่จาก sales_overview ตรงๆ) — Part 2 "kept in sync with pnl_executive_summary.html" ตามคอมเมนต์ในไฟล์ | Spec §5.6, `Charmiss_Module_PnL_Spec.md` |
| Landing / Directory | `index.html` | ไม่มี Mock data — อ่าน `MODULE_MAP` จาก `nav-menu.js` มาสร้าง Directory listing; ปุ่ม Hero CTA Hardcode ไปที่ `sales_overview.html` ตรงๆ ไม่ได้อ่านจาก MODULE_MAP | Spec §2.1 |

### 6.3 กติกาเวลาแก้ (สรุปสั้น)

1. แก้แค่ Layout/CSS ของหน้าเดียว → แนบแค่ HTML ไฟล์นั้น + Baseline 4 ไฟล์ (6.1) พอ
2. แก้ตัวเลข/สูตร Mock data ที่มีคำว่า "Part 1" หรือชื่อ Series ที่ปรากฏในตาราง 6.2 มากกว่า 1 ไฟล์ → ต้องแนบทุกไฟล์ในแถวนั้นพร้อมกัน ไม่งั้นเลขจะไม่ตรงข้ามหน้า (แบบที่เคยเป็น Bug จริงมาแล้ว)
3. แก้ฟังก์ชันใน `shared.js` (เช่นฟังก์ชันสร้างกราฟ) → ควรแจ้งว่าจะ "แก้ทั้งระบบ" และแนบไฟล์ HTML ทุกหน้าที่เรียกใช้ฟังก์ชันนั้น (เช็คด้วย `grep` ชื่อฟังก์ชันก่อนเริ่มแก้) ไม่ใช่แนบแค่หน้าที่อยากแก้หน้าเดียว
4. TT ทั้ง 3 หน้า ยังบล็อกอยู่ — ต้องได้ไฟล์จริงก่อนถึงจะแก้อะไรได้ ปัจจุบันแก้ได้แค่ผ่าน Screenshot-based review เท่านั้น

---
