# Charmiss Enterprise Dashboard — Business Overview
## Requirements & System Design Specification

**อัปเดตล่าสุด:** 30 กรกฎาคม 2569

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
Sales Overview  (Company-wide — รวมทุก Channel)
│
├── Executive Outlook          ภาพรวมบริษัทครบทุกมุม อ่านจบใน 2-3 นาที
│     ├── At a Glance            (KPI สรุปด่วน)
│     ├── Performance & Composition
│     ├── What's Driving It
│     └── Channel Comparison
│
└── Product Analysis           วิเคราะห์ Product/Category ข้าม 3 Channel
      ├── Category Performance Overview
      ├── Cross-Channel Analysis
      ├── Portfolio Strategy
      └── Category Deep-dive

├── ▸ MT Overview                                    [ยังไม่เปิดใช้งาน]
│     ├── Executive Summary
│     └── Breakdown (ข้อมูลคู่ค้า/Key Account)
│
├── ▸ TT Overview
│     ├── Executive Summary
│     ├── Breakdown (ข้อมูลร้านค้า)
│     └── Sales Person (มุมมองรายบุคคล)
│
└── ▸ ECOM Overview                                  [ยังไม่เปิดใช้งาน]
      ├── Executive Summary
      └── Breakdown (ข้อมูล Ecom Shop)
```

> หมายเหตุ: "Executive Outlook" และ "Breakdown" เดิมของ Sales Overview ถูกรวมเป็นหน้าเดียวแล้ว (Executive Outlook มี 4 Section ครอบคลุมทั้งภาพรวมและรายละเอียดเปรียบเทียบ Channel) — Sales Overview จึงมีแค่ 2 มุมมองหลัก: Executive Outlook และ Product Analysis

### 2.2 หลักการ Navigation

- **Navigation Menu** อยู่ที่มุมซ้ายบนของทุกหน้า (ข้าง Logo) กดแล้วเห็นรายการทุกหน้าในระบบ จัดกลุ่มตาม Module พร้อม Badge "Coming soon" สำหรับ Module ที่ยังไม่เปิดใช้งาน (MT, Ecom) — กดข้าม Section ไหนก็ได้ในคลิกเดียว ไม่ต้องไล่ตามลำดับ Drill-in ทีละชั้น (เช่น จาก Sales Overview ไป TT Overview → Breakdown ได้ทันที)
- **Breadcrumb** "Sales Overview / [Module]" แสดงเฉพาะหน้า Channel Overview (MT/TT/Ecom) เพราะเป็นหน้าที่ Nested อยู่ใต้ Sales Overview — Sales Overview เองไม่มี Breadcrumb เพราะเป็นจุดบนสุดของ Hierarchy
- **หัวข้อหน้า (H1)** ใช้รูปแบบเดียวกันทุกหน้า: "[ชื่อ Module] — [ชื่อมุมมอง]" เช่น "Sales Overview — Executive Outlook", "TT Overview — Breakdown"
- แต่ละ Channel Overview มี Tab ของตัวเอง (Executive Summary / Breakdown / Sales Person เฉพาะ TT) โดย Filter เต็มรูปแบบ (Region/Category/Sales Person/My stores only) อยู่ที่ Breakdown เท่านั้น — Executive Summary มีแค่ Period filter

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
- บางการ์ดอาจมีบรรทัดเสริมใต้ Sparkline (เช่น "Gap to Target" ใต้ Target Attainment) แทนการแยกเป็นการ์ดเดี่ยว หากเนื้อหาสัมพันธ์กันโดยตรงและไม่อยากให้ KPI Row ยาวเกินจำเป็น

**Chart Card:** Title + Information Icon → Subtitle บอกขอบเขตข้อมูล → Toolbar (ดูเป็นตาราง / ดาวน์โหลด / ขยายเต็มจอ) → ตัวกราฟ — **ทุก Chart Card ที่มีข้อมูลเชิงตาราง (ไม่ใช่แค่ Heatmap ที่เป็นตารางอยู่แล้ว) ต้องมีปุ่ม "ดูเป็นตาราง" ควบคู่ Download และ Expand เสมอ** เพื่อความสม่ำเสมอทั้งระบบ

**Information Icon (ⓘ):** ทุก KPI Card และ Chart Card ต้องมี กดแล้วแสดง Popover อธิบายวิธีคำนวณของ Metric นั้นเป็นภาษาที่คนอ่านทั่วไปเข้าใจได้

**Filter Bar:**
- Period selector ทุกหน้า: This Month / Last Month / This Quarter / Last Quarter / Year to Date (default) / Trailing 12 Months / Custom Range
- หน้า Breakdown (เฉพาะ Channel Overview) มี Filter เพิ่มตามบริบท: Region, Category, Sales Person, "My stores only"
- หน้า Executive Summary / Executive Outlook / Product Analysis มีแค่ Period อย่างเดียว (ไม่มี Filter ย่อย)

**หลักการ Hierarchy Level Selector (Category → Sub-Category → Type → Series):**
- ถ้าหน้าใดมีหลาย Component ที่ต้องมองข้อมูลที่ระดับเดียวกัน (เช่น Product Analysis: Heatmap, Channel Index, Portfolio Matrix, Share Over Time, Sales by Category) ให้ใช้ **Level Selector ตัวเดียวตัวเดียวที่จุดเดียว** ควบคุมทุก Component พร้อมกัน — **ห้ามมี Selector แยกในแต่ละการ์ด** เพื่อไม่ให้ข้อมูลระหว่างการ์ดไม่ตรงกัน
- แสดงผลแบบ **"Top View" จัดอันดับแบบ Flat** — เมื่อเลือก Sub-Category จะเห็น Sub-Category ที่ขายดีที่สุด **ของทั้งหมดทุก Category รวมกัน** จัดอันดับตามยอดขาย (ไม่ใช่ Breadcrumb Drill ทีละชั้น) — ชื่อ Category แม่แสดงเป็นตัวอักษรเล็กสีจางกำกับไว้ใต้ชื่อเพื่อบอก Context
- ระดับที่ลึกกว่า Category (Sub-Category/Type/Series มี 12/24/48 รายการ) ให้ตัดแสดงเฉพาะ Top N ตามความเหมาะสมของ Component นั้น (List/Table แสดงได้มากกว่า เช่น Top 10, ส่วน Chart ที่มีข้อจำกัดเรื่องความหนาแน่น เช่น Scatter/Stacked Area/Grouped Bar ควรจำกัดที่ Top 6-8) พร้อมลิงก์ "See all N →" ไปดูรายการเต็ม

**หลักการ Diverging Bar Chart (ใช้ Baseline ที่ไม่ใช่ 0):** เมื่อกราฟ Bar ต้องเทียบกับค่าอ้างอิงที่ไม่ใช่ 0 (เช่น Index = 100) แท่งต้องยื่นขึ้น/ลงจาก**ค่าอ้างอิงนั้นโดยตรง** ไม่ใช่ยื่นจาก 0 เสมอ (ไม่งั้นกราฟจะดูเป็นแท่งสูงเท่ากันหมดกระจุกอยู่บนสุด ไม่สื่อความหมาย Over/Under ที่ต้องการ) และ Y-axis Domain ต้องคำนวณล้อมรอบค่าอ้างอิงนั้น ไม่ใช่บังคับรวม 0 เข้าไปเสมอ

**Navigation ข้ามหน้าในไฟล์เดียวกัน (Tab ภายใน Module เดียว):** ต้องรองรับการเปลี่ยน Tab ผ่านการเปลี่ยน URL `#hash` แม้จะเป็นการเปลี่ยนจากภายในไฟล์เดียวกันเอง (เช่น กด Navigation Menu ข้าม Tab ในหน้าเดียวกัน) — ต้องมีการดักฟัง `hashchange` ไว้เสมอ ไม่ใช่แค่อ่าน Hash ตอนโหลดหน้าครั้งแรกครั้งเดียว (การเปลี่ยน Hash ในเอกสารเดียวกันไม่ทำให้หน้าโหลดใหม่ จึงต้องมี Listener แยกไว้รองรับ)

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

แต่ละ Type แตกเป็น Series อีก 1 ชั้น (รวม Category → Sub-Category → Type → Series ทั้งหมด 4 ชั้น, 6 → 12 → 24 → 48 รายการ)

### 4.3 Channel-specific Metric Mapping

| แนวคิด | MT / TT | Ecom |
|---|---|---|
| หน่วยขาย | Store / Partner | Order / Shop (Platform) |
| ลูกหนี้ | AR% (Accounts Receivable) | ไม่มี (จ่ายผ่าน Platform) |
| การคืนสินค้า | Return Rate (Credit Note) | Return/Cancellation Rate |
| ความครอบคลุม | Active Stores/Partners, Retention | Active Shop Listings |
| ทีมงาน | Sales Rep, Visit Compliance (TT) / Key Account Manager (MT) | Platform Owner |
| ราคาเฉลี่ย | — | Average Order Value (AOV), Conversion Rate |
| Label "Active Units" ในตารางเทียบ Channel | MT = Active Partners, TT = Active Stores | Ecom = Active Shop Listings |

---

## 5. Metrics / KPI ต่อหน้า

### 5.1 Sales Overview → Executive Outlook

**Section 1 — At a Glance (KPI):**

| Metric | รายละเอียด/สูตร |
|---|---|
| Total Net Sales | ผลรวมยอดขายสุทธิ ทุก Channel ในช่วงเวลาที่เลือก + MoM/YoY + Sparkline |
| Target Attainment % | (ยอดขายจริง ÷ เป้าหมาย) × 100 + MoM/YoY (pp) + Sparkline + **Gap to Target** (Actual YTD − Target YTD, Calendar YTD เสมอ ไม่ผูก Filter ด้านบน, สีเขียว/แดงตามเครื่องหมาย) |
| Full Year Forecast | Run-rate: (ยอดขาย YTD ÷ จำนวนเดือนที่ผ่านมา) × 12 ÷ เป้าหมายทั้งปี × 100 (Calendar YTD เสมอ) + Sparkline แบบ Trajectory (เส้นทึบ = Actual ที่ผ่านมา, เส้นประ = ยื่นไปถึง Dec ตามค่าพยากรณ์) |

**Section 2 — Performance & Composition:**

| Metric/Chart | ประเภท |
|---|---|
| Revenue Trend | Line Chart (This Year vs Last Year vs Target, by month) |
| Channel Growth Comparison (YoY) | Line Chart 3 เส้น (MT/TT/Ecom), เต็ม 12 เดือน, Full-width |
| Sales by Channel | Donut — มี % Label บนกราฟโดยตรง + Badge "Best"/"Watch" ที่ Legend (Channel ที่ Attainment สูงสุด/ต่ำสุด) |
| Sales by Category | Horizontal Bar (รองรับ Sub-Category/Type/Series ตามหลักการ Level Selector ข้อ 3.4) |

**Section 3 — What's Driving It:**

| Metric/Chart | ประเภท/สูตร |
|---|---|
| Growth Contribution Waterfall | Waterfall Chart: Last Year YTD (เริ่ม) → ผลต่างยอดขาย (ปีนี้−ปีก่อน) ของ MT/TT/Ecom ทีละแท่ง (เขียว=บวก,แดง=ลบ) → This Year YTD (จบ) |
| Return / Cancellation Rate Trend | Line Chart รายเดือน — Weighted average ของ (Credit Note มูลค่า MT+TT + Cancellation มูลค่า Ecom) ÷ ยอดขายรวม × 100, เส้นประ Threshold 5% |

**Section 4 — Channel Comparison:**

| Metric/Chart | ประเภท |
|---|---|
| Channel Snapshot Cards ×3 | คลิกเข้า Channel Overview นั้นได้ (TT พร้อมใช้งาน, MT/Ecom ยังกดไม่ได้) |
| Compare Performance Table | 6 แถว: Net Sales, Target Attainment %, Growth YoY, Growth MoM, Return/Cancellation Rate, Active Units (Label ต่างกันตาม Channel — ดูข้อ 4.3) — Highlight ค่าที่ดีที่สุดต่อแถว |
| Revenue Trend by Channel | Line Chart ทับกัน 3 Channel + Checkbox เลือกเปิด/ปิด Channel |
| Channel Mix Over Time | 100% Stacked Bar **รายไตรมาส** (Q1/25 ถึงไตรมาสล่าสุด) — Data label ทั้ง % และ ฿ บนทุก Segment + Callout สรุป First-period vs Last-period ต่อ Channel + ปุ่มดูตารางรายเดือนละเอียด |

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

### 5.3 MT Overview [ยังไม่เปิดใช้งาน]

**Executive Summary:** Net Sales (MT), Target Attainment %, Growth YoY, Growth MoM, AR%, Return Rate (CN) · Revenue Trend, Monthly YoY Growth % · Sales by Key Account · Sales by Category · Ranking Top Key Accounts

**Breakdown (ข้อมูลคู่ค้า):** Portfolio Quality (Target vs Actual, Return Rate, AR Aging) · Partner Performance (Ranking, Active Partners, Partner Concentration) · Product Coverage (Category breakdown, Portfolio Matrix, Share Over Time)

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

### 5.5 ECOM Overview [ยังไม่เปิดใช้งาน]

**Executive Summary:** Net Sales (Ecom), Target Attainment %, Growth YoY, Growth MoM, AOV, Conversion Rate · Revenue Trend, Monthly YoY Growth % · Sales by Platform (Lazada/Shopee/TikTok) · Sales by Category · Ranking by Platform

**Breakdown (ข้อมูล Ecom Shop):** Portfolio Quality (Target vs Actual per Platform, Return/Cancellation Rate) · Shop Performance (Target vs Actual per Shop, AOV, Conversion Rate, Ads Spend ROI) · Product Coverage (Category breakdown, Portfolio Matrix, Share Over Time, Top/Bottom SKU)
