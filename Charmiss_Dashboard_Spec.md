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

**Chart Container Sizing (`buildLineChartSVG`/`buildGroupedBarSVG`/`buildWaterfallSVG`/`buildStacked100BarSVG`):** ทุกฟังก์ชันต้องวัดทั้งความกว้างและความสูงจริงของ Container (`clientWidth`/`clientHeight`) มาใช้เป็น SVG viewBox เสมอ ไม่ใช้ค่า Default ตายตัว — ถ้าค่าที่วัดได้กับ CSS Height ของ `.canvas-wrap` ไม่ตรงกัน จะเกิด Bug ตัวอักษร/แท่งกราฟ "ยืด" ผิดสัดส่วน (เพราะ `preserveAspectRatio="none"` ยืด X/Y อิสระจากกัน) เป็นกฎที่ต้องคุมทุกครั้งที่ปรับความสูง Canvas ของการ์ดไหนก็ตาม

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

**Zone A — Category Performance Overview:**

| Metric | รายละเอียด |
|---|---|
| Top Category (Company-wide) | Category ยอดขายสูงสุดของบริษัท |
| Fastest Growing Category | Category ที่ Growth YoY สูงสุด |
| Best Category per Channel ×3 | Callout Card, แถบซ้ายสีตาม Channel, แสดง Category อันดับ 1 + % สัดส่วนภายใน Channel นั้น |

**Zone B — Cross-Channel Analysis** (ควบคุมด้วย Level Selector ตัวเดียวที่หัว Section — ดูหลักการข้อ 3.4):

| Metric/Chart | ประเภท/สูตร |
|---|---|
| Category × Channel Heatmap | Table, แถว = ระดับที่เลือก (Top 10), คอลัมน์ = MT/TT/Ecom, Cell = ยอดขาย + % Row-normalized, สีเข้ม-อ่อนตาม % |
| Channel Index by Category | **Diverging Bar Chart, Baseline = Index 100** (ไม่ใช่ 0) — แท่งยื่นขึ้น = Over-index, ยื่นลง = Under-index, สีแท่ง = Channel Identity (ไม่ใช่เขียว/แดง), มีเลข Index บนปลายแท่งทุกแท่ง, เส้นประ Reference ที่ 100 (Top 8) |

**Zone C — Portfolio Strategy** (Sync ระดับเดียวกับ Zone B/D เสมอ):

| Metric/Chart | ประเภท |
|---|---|
| Category Portfolio Matrix | Scatter 4-Quadrant — แกน X (ยอดขาย) และ Y (%Growth YoY) มี Gridline + Tick value จริง, เส้นแบ่ง Quadrant ที่ค่ามัธยฐาน, Label มุม Stars/Question Marks/Cash Cows/Dogs (Top 6) |
| Category Share of Sales Over Time | Stacked Area 18 เดือน, ใช้ Category color palette เฉพาะ (Top 6) |

**Zone D — Category Deep-dive:**

| Metric/Chart | ประเภท |
|---|---|
| Sales by Category | Horizontal Bar, Top View จัดอันดับ Flat (Top 10 + See all N), มี Toggle All/MT/TT/Ecom เฉพาะ Component นี้ (Heatmap/Index ไม่ผูกกับ Channel Toggle นี้ เพราะโดยธรรมชาติต้องโชว์ครบทุก Channel เพื่อเปรียบเทียบ) |

ทุก Chart Card ใน Product Analysis (Heatmap, Channel Index, Portfolio Matrix, Share Over Time) มี Toolbar ดูเป็นตาราง/ดาวน์โหลด/ขยายเต็มจอ ครบเหมือนหน้า Executive Outlook

### 5.3 MT Overview

**Executive Summary:** Net Sales (MT), Target Attainment %, AR%, Return Rate (CN), Active Partners, Partner Retention (KPI, 6 การ์ด — ไม่มีการ์ด Growth YoY/Growth MoM แยก เพราะซ้ำกับแถว MoM/YoY ที่มีอยู่แล้วในการ์ด Net Sales/Target Attainment ตามหลักการเดียวกับที่ปรับ Sales Overview) · Revenue Trend, Monthly YoY Growth % (Chart) · Sales by Key Account (Donut — ชื่อกลุ่มเป็น Placeholder ตาม Format ร้านค้า: Beauty Specialty Chain, Department Store, Drugstore Chain, Hypermarket Chain, Convenience Chain ไม่ใช่ชื่อคู่ค้าจริง) · Sales by Category · Ranking Top Key Accounts (Table)

**Breakdown (ข้อมูลคู่ค้า):**
| Section | Metric/Chart |
|---|---|
| Portfolio Quality | Target vs Actual (Diverging Bar รายเดือน, Actual−Target, เขียว/แดงตาม Hit/Miss), Return Rate (CN) Trend, AR Aging (ประมาณการจาก AR% ไม่ใช่ Ledger รายคู่ค้าจริงแบบ TT) |
| Partner Performance | Target vs Actual per Partner (Diverging Bar จาก Baseline 100%, Top 10 by Net Sales), Top 5 / Bottom 5 Partners by Revenue (Table), Active Partners, Partner Concentration (Top 5 Partner = % ของยอดขายที่กรองอยู่) |
| Product Coverage | Sales by Category, Category Portfolio Matrix (มี Axis Title ครบตั้งแต่แรก), Category Share of Sales Over Time — Company-wide เสมอ ไม่ผูกกับ Filter Key Account Manager/My accounts only |

Filter Bar ของ Breakdown: Period, Category (ปัจจุบันใช้งานได้แค่ "All Categories" ตัวเลือกอื่นยัง Disabled รอ Partner×Category Data Model), Key Account Manager, "My accounts only" (Scope ไปที่ KAM คนแรกในรายชื่อ — Demo Only)

Partner ระดับ Breakdown เป็นคนละชุดข้อมูลกับ Key Account 5 กลุ่มใน Executive Summary — Breakdown จำลองคู่ค้ารายบุคคล 38 ราย กระจายอยู่ใต้ 5 Format Group เดียวกัน เพื่อให้ Partner Concentration มีความหมาย (ถ้าใช้ 5 กลุ่มเดิมจะได้ 100% เสมอ ไม่มีประโยชน์)

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
| `shared.css` | Design token, Card/KPI/Chart/Filter Bar styling ทั้งหมด — ใช้ร่วมกันทุกหน้า (ยกเว้น TT ที่แยก engine ของตัวเอง — ดู 6.3) |
| `shared.js` | ฟังก์ชันสร้างกราฟ/ตาราง/Sparkline ทั้งหมด (`buildLineChartSVG`, `buildDonutSVG`, `buildWaterfallSVG`, `sparklineSVG`, ฯลฯ) รวมถึง Utility (`fmtTHB`, `mulberry32`, `sumRange` ฯลฯ) — **แก้ไฟล์นี้ = กระทบทุกหน้าที่ import พร้อมกัน** ต้องเช็คทุกไฟล์หลังแก้ (ดูตัวอย่างจริงตอนแก้ `sparklineSVG`/`buildHBarCompareSVG` ที่ต้องไล่เช็ค 6-7 ไฟล์) |
| `nav-menu.css` | Style ของ Dropdown เมนู Nav บน Topbar |
| `nav-menu.js` | `MODULE_MAP` — กำหนดลำดับ/รายชื่อ Module ใน Nav Dropdown และในหน้า `index.html` (Directory listing) พร้อมกัน — แก้ไฟล์นี้กระทบทั้ง 2 จุดพร้อมกันเสมอ |

หมายเหตุ: `index.html` เป็นข้อยกเว้น ไม่ import `shared.js` (ไม่มีกราฟ/Mock data ในหน้านี้) ใช้แค่ `shared.css` + `nav-menu.css`/`nav-menu.js`

### 6.2 ต่อ Module — ไฟล์ HTML + Content Dependency (Byte-for-byte)

นอกจาก Baseline ด้านบน แต่ละ Module มี "ไฟล์ต้นทาง" ของ Mock data บางก้อนที่ถูก Copy แบบ byte-for-byte ไปใช้ในอีกไฟล์ — ถ้าจะแก้สูตร/ค่าพวกนี้ ต้องแก้พร้อมกันทั้งคู่ ไม่งั้นตัวเลขจะไม่ตรงกันข้ามหน้า (แพทเทิร์นนี้เจอ Bug จริงมาแล้วหลายจุดในเซสชันก่อนหน้า — ดู Review doc Task 1.4/2.2)

| Module / หน้า | ไฟล์ HTML | Content Dependency — ต้องเช็คคู่กับ | เอกสารอ้างอิง |
|---|---|---|---|
| Sales Overview → Executive Outlook | `sales_overview.html` | **เป็นไฟล์ต้นทาง (Master)** ของ Mock-data engine หลักทั้งระบบ — `mulberry32` seed, `channelDefs`, `genSeries()`, `groupActual`/`groupTarget`, `companyActual`/`companyTarget`, และ `mtCNRate`/`ttCNRate`/`ecomCancelRate` (Return/Cancellation Rate ต่อเดือน แยกอิสระต่อ Channel) ทุกไฟล์อื่นก็อบปี้ "Part 1" มาจากไฟล์นี้แบบ byte-for-byte — ถ้าแก้สูตรตรงนี้ ต้องไล่แก้ทุกไฟล์ในตารางนี้ ⚠️ **`mtCNRate`/`ttCNRate`/`ecomCancelRate` ต้องอยู่ตำแหน่ง rand()-sequence เดียวกันเป๊ะใน 5 ไฟล์**: `sales_overview.html`, `module_mt_executive_summary.html`, `module_mt_breakdown.html`, `module_ecom_executive_summary.html`, `module_ecom_breakdown.html` (2 ไฟล์ ECOM ไม่ได้ใช้ค่านี้จริง แต่ต้องคง Block เดิมไว้ตำแหน่งเดิมเพื่อรักษาลำดับ rand() ที่เหลือของไฟล์ให้ตรงกัน) | Spec §5.1 |
| Sales Overview → Product Analysis | `sales_overview_product_analysis.html` | ⚠️ **ไฟล์นี้ไม่มีอยู่จริงใน Workspace ตอนนี้** — ถูกอ้างอิงจาก Tab ในหน้า Executive Outlook แต่ยังไม่เคย Build/แนบเข้าเซสชัน ถ้าจะแก้ต้องหาไฟล์จริงมาก่อน หรือแจ้งให้ Build ใหม่ | Spec §5.2 |
| MT → Executive Summary | `module_mt_executive_summary.html` | Part 1 = copy จาก `sales_overview.html` (รวม `mtCNRate`/`ttCNRate`/`ecomCancelRate` Block — ไฟล์นี้ใช้ `mtCNRate` จริงสำหรับ KPI "Return Rate (CN)"); **เป็นไฟล์ต้นทาง** ของ `mtCategoryShares`, `mtARSeries`, `mtPartnersSeries` (Part 2) | Spec §5.3 |
| MT → Breakdown | `module_mt_breakdown.html` | Part 1 = copy จาก `module_mt_executive_summary.html` (ไม่ใช่จาก sales_overview ตรงๆ, รวม `mtCNRate` Block ด้วย — ใช้จริงใน Return Rate (CN) Trend); `mtPartnersSeries` copy byte-for-byte จากไฟล์เดียวกัน — แก้ Active Partners ต้องแก้คู่ | Spec §5.3, Review 1.4 |
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
