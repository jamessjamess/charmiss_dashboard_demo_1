# Charmiss Enterprise Dashboard — Business Overview
## Requirements & System Design Specification

**อัปเดตล่าสุด:** 30 กรกฎาคม 2569

---

## 1. Business Overview

### 1.1 วัตถุประสงค์
Enterprise Dashboard สำหรับ Charmiss เพื่อติดตาม **Sales Performance เทียบกับ Target** ครอบคลุม 3 Channel หลัก — MT (Modern Trade), TT (Traditional Trade), Ecom (Lazada / Shopee / TikTok Shop)

ระบบต้องตอบโจทย์ 2 มุมมองพร้อมกัน:
1. **มุมมองบริษัท (Company-wide)** — ผู้บริหารดูภาพรวมยอดขายเทียบเป้าทั้งบริษัท เปรียบเทียบ Performance ระหว่าง 3 Channel และวิเคราะห์ Product ข้าม Channel
2. **มุมมองเฉพาะ Channel** — แต่ละ Channel มี Dashboard เจาะลึกของตัวเอง (Executive Summary + Breakdown เฉพาะทาง) และ TT มีมุมมองรายบุคคล (Sales Person) เพิ่มอีกชั้น

### 1.2 กลุ่มผู้ใช้งาน
| กลุ่มผู้ใช้ | ใช้มุมมองไหน |
|---|---|
| ผู้บริหารระดับสูง (C-level / Sales Director) | Sales Overview (Executive Summary, Breakdown, Product Analysis) |
| Sales Ops / Regional Manager / Trade Marketing | Breakdown ของแต่ละ Channel Overview (MT/TT/Ecom) |
| Sales Rep รายบุคคล (TT) | Sales Person |

---

## 2. โครงสร้างระบบ (System Structure / Navigation Hierarchy)

### 2.1 แผนผังโครงสร้าง

```
Sales Overview  (Company-wide — รวมทุก Channel)
│
├── Executive Summary        ภาพรวมบริษัท อ่านได้ใน 30 วินาที
├── Breakdown                 เปรียบเทียบ Performance ระหว่าง 3 Channel + จุดเชื่อมไปแต่ละ Channel
├── Product Analysis          วิเคราะห์ Product/Category ข้าม 3 Channel
│
├── ▸ MT Overview
│     ├── Executive Summary
│     └── Breakdown           ลงรายละเอียดข้อมูลคู่ค้า (Partner / Key Account)
│
├── ▸ TT Overview
│     ├── Executive Summary
│     ├── Breakdown           ลงรายละเอียดข้อมูลร้านค้า (Store)
│     └── Sales Person        มุมมองส่วนตัวของ Sales Rep แต่ละคน
│
└── ▸ ECOM Overview
      ├── Executive Summary
      └── Breakdown           ลงรายละเอียดข้อมูล Ecom Shop (Lazada/Shopee/TikTok)
```

### 2.2 หลักการ Navigation

- **ชั้นบนสุด "Sales Overview"** มี 3 มุมมองเท่านั้น: Executive Summary / Breakdown / Product Analysis — ไม่มี MT/TT/Ecom โผล่มาปนที่ชั้นนี้
- **หน้า Breakdown ของ Sales Overview** ทำหน้าที่ 2 อย่าง: (1) แสดงกราฟเปรียบเทียบ 3 Channel เอง (2) เป็นประตูเข้า (Gateway) ไปยัง MT Overview / TT Overview / ECOM Overview ผ่าน Card ที่คลิกได้
- **แต่ละ Channel Overview** มีชุด Tab ของตัวเอง (Executive Summary / Breakdown / Sales Person เฉพาะ TT) และมี Breadcrumb กลับสู่ภาพรวมบริษัทเสมอ
- **Navigation Menu** — มีเมนูกลางที่กดแล้วเห็นทุกหน้าในระบบจัดกลุ่มตาม Module พร้อมระบุหน้าปัจจุบัน ทำให้กระโดดจากหน้าไหนไปหน้าไหนก็ได้ในคลิกเดียว โดยไม่ต้องไล่ตามลำดับ Drill-in ทีละชั้น (เช่น จาก Sales Overview ไป TT Overview → Breakdown ได้ทันทีโดยไม่ต้องผ่าน Breakdown ของ Sales Overview ก่อน)
- Header (Logo, User, Dark mode) คงที่ทุกหน้า เพื่อให้รู้สึกเป็นระบบเดียวต่อเนื่องกัน

---

## 3. หลักการออกแบบ (Design Principles)

### 3.1 แนวทางภาพรวม
- Formal / Corporate — ไม่ใช้ Emoji ไม่ใช้สีฉูดฉาด
- Layout แบบ Card-based บน Background สีอ่อน, การ์ดพื้นขาว เงาบางๆ
- รองรับ Dark Mode ทุกหน้า
- Responsive รองรับทั้ง Web และ Mobile

### 3.2 โทนสี (Color Tokens)

| การใช้งาน | สี |
|---|---|
| Primary Accent (Logo, Active Tab, Primary Button, กราฟหลัก) | Wine / Berry tone |
| Background | Off-white / Cream |
| Card Background | White |
| Text หลัก | เกือบดำ |
| Text รอง | เทาอุ่น |
| Positive Delta / Hit Target | เขียว |
| Negative Delta / Below Target | แดง |
| Warning / ใกล้ Target | ส้ม/เหลือง |
| Channel: MT / TT / Ecom | ใช้สีต่างกันชัดเจน 3 เฉด แยกจาก Primary Accent |

> หมายเหตุ: Wine/Berry เป็นสีตั้งต้น (Placeholder) รอสี Brand จริงของ Charmiss — เมื่อได้สีจริงมาให้เปลี่ยนแค่ค่าเดียวนี้ ระบบสีที่เหลือไม่กระทบ

### 3.3 Typography
ใช้ Font ที่ดูเป็นทางการ รองรับภาษาไทย ตัวเลขจัดคอลัมน์ตรงกัน (Tabular numbers)

### 3.4 Component Pattern มาตรฐาน

**KPI Card:** Title + Information Icon → ตัวเลขใหญ่ + หน่วย/ช่วงเวลา → แถว MoM/YoY (สีเขียว/แดง) → Sparkline แนวโน้ม

**Chart Card:** Title + Information Icon → Subtitle บอกขอบเขตข้อมูล → Toolbar (ดูเป็นตาราง / ดาวน์โหลด / ขยายเต็มจอ) → ตัวกราฟ

**Information Icon (ⓘ):** ทุก KPI Card และ Chart Card ต้องมี กดแล้วแสดง Popover อธิบายวิธีคำนวณของ Metric นั้นเป็นภาษาที่คนอ่านทั่วไปเข้าใจได้ (ดูสูตรทั้งหมดในข้อ 5)

**Filter Bar:**
- Period selector ทุกหน้า: This Month / Last Month / This Quarter / Last Quarter / Year to Date (default) / Trailing 12 Months / Custom Range
- หน้า Breakdown มี Filter เพิ่มตามบริบท: Channel, Region, Category, Sales Person/Partner/Platform, "My stores only" (แสดงเฉพาะ MT/TT)
- หน้า Executive Summary ระดับบริษัทมีแค่ Period อย่างเดียว (ไม่มี Filter ย่อย)

**หลักการ Sales by Category (ใช้ร่วมกันทุกที่ที่มี Category breakdown):**
- เลือกระดับได้ 4 ชั้น: Category → Sub-Category → Type → Series
- แสดงผลแบบ **"Top View" จัดอันดับแบบ Flat** — เมื่อเลือก Sub-Category จะเห็น Sub-Category ที่ขายดีที่สุด **ของทั้งหมดทุก Category รวมกัน** จัดอันดับตามยอดขาย (ไม่ใช่ต้องเลือก Category ก่อนแล้วดูเฉพาะลูกของอันนั้น) — ชื่อ Category แม่แสดงเป็นตัวอักษรเล็กสีจางกำกับไว้ใต้ชื่อเพื่อบอก Context
- ถ้ารายการเกิน 10 อันดับ ให้ตัดโชว์ Top 10 พร้อมลิงก์ "See all N →" ไปดูตารางเต็ม
- เมื่อเปลี่ยนระดับ ต้อง Sync ระดับเดียวกันไปยัง Category Portfolio Matrix และ Category Share of Sales Over Time ด้วยเสมอ

### 3.5 ความน่าเชื่อถือของระบบ
Dashboard ต้องเปิดใช้งานได้ทันทีโดยไม่พึ่งพาอินเทอร์เน็ตหรือบริการภายนอกใดๆ เพื่อไม่ให้เกิดปัญหาข้อมูลไม่แสดงผล

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

แต่ละ Type แตกเป็น Series อีก 1 ชั้น (รวม Category → Sub-Category → Type → Series ทั้งหมด 4 ชั้น)

### 4.3 Channel-specific Metric Mapping

| แนวคิด | MT / TT | Ecom |
|---|---|---|
| หน่วยขาย | Store / Partner | Order / Shop (Platform) |
| ลูกหนี้ | AR% (Accounts Receivable) | ไม่มี (จ่ายผ่าน Platform) |
| การคืนสินค้า | Return Rate (Credit Note) | Return/Cancellation Rate |
| ความครอบคลุม | Active Stores/Partners, Retention | Active Shop Listings |
| ทีมงาน | Sales Rep, Visit Compliance (TT) / Key Account Manager (MT) | Platform Owner |
| ราคาเฉลี่ย | — | Average Order Value (AOV), Conversion Rate |

---

## 5. Metrics / KPI ต่อหน้า

### 5.1 Sales Overview → Executive Summary

| Metric/Chart | ประเภท | วิธีคำนวณ |
|---|---|---|
| Total Net Sales | KPI Card | ผลรวมยอดขายสุทธิ (หลังหักคืน/ส่วนลด) ทุก Channel ในช่วงเวลาที่เลือก |
| Target Attainment % | KPI Card | (ยอดขายจริง ÷ เป้าหมาย) × 100 |
| Growth YoY | KPI Card | (ยอดขายเดือนล่าสุด − เดือนเดียวกันปีก่อน) ÷ เดือนเดียวกันปีก่อน × 100 (อิงเดือนปิดล่าสุดเสมอ) |
| Growth MoM | KPI Card | (ยอดขายเดือนล่าสุด − เดือนก่อนหน้า) ÷ เดือนก่อนหน้า × 100 (อิงเดือนปิดล่าสุดเสมอ) |
| Best-performing Channel | KPI Card | Channel ที่มี Target Attainment % สูงสุดในช่วงเวลาที่เลือก |
| Revenue Trend | Line Chart | ยอดขายจริงรายเดือน เทียบเป้าหมายและยอดขายปีก่อน |
| Monthly YoY Growth % | Line Chart | % เปลี่ยนแปลงยอดขายรายเดือน เทียบเดือนเดียวกันปีก่อน |
| Sales by Channel | Donut | สัดส่วน % ยอดขาย MT/TT/Ecom |
| Sales by Category | Horizontal Bar | สัดส่วน % ยอดขายแต่ละ Category (รองรับ Sub-Category/Type/Series ตามข้อ 3.4) |
| Sales Ranking by Channel/Platform | Table | จัดอันดับ MT, TT, Lazada, Shopee, TikTok ตามยอดขาย พร้อม Attainment% และ Growth YoY |

### 5.2 Sales Overview → Breakdown

| Metric/Chart | ประเภท | วิธีคำนวณ/รายละเอียด |
|---|---|---|
| Channel Snapshot Cards ×3 | Clickable Card | Net Sales, Attainment%, Growth YoY ต่อ Channel — คลิกเข้า Channel Overview นั้น |
| **Compare Performance Table** | Table เปรียบเทียบ | แถว = Metric (Net Sales, Attainment%, Growth YoY, Growth MoM, AR%/Return-Cancellation Rate, Active Units), คอลัมน์ = MT/TT/Ecom — Highlight ค่าที่ดีที่สุดต่อแถว |
| Revenue Trend by Channel | Multi-line Chart | เส้นยอดขายทับกัน 3 Channel |
| Growth YoY by Channel | Grouped Bar | เทียบ % การเติบโตแต่ละ Channel |
| Target Attainment by Channel | Bullet/Bar Chart | เทียบ % Attainment แต่ละ Channel |
| Channel Mix Over Time | Stacked Area (18 เดือน) | สัดส่วนยอดขายแต่ละ Channel เปลี่ยนแปลงตามเวลา |

### 5.3 Sales Overview → Product Analysis

| Metric/Chart | ประเภท | วิธีคำนวณ/รายละเอียด |
|---|---|---|
| Top Category (Company-wide) | KPI Card | Category ที่ยอดขายสูงสุดของบริษัท |
| Fastest Growing Category | KPI Card | Category ที่ Growth YoY สูงสุด |
| Best Category per Channel | Callout Card ×3 | Category อันดับ 1 ของแต่ละ Channel พร้อม % สัดส่วน |
| Category × Channel Heatmap | Heatmap Table | แถว = Category, คอลัมน์ = MT/TT/Ecom, ค่า = ยอดขาย + % ของ Category นั้นที่มาจาก Channel นั้น |
| Channel Index by Category | Bar Chart (Index=100) | (สัดส่วนยอดขาย Category X ใน Channel Y) ÷ (สัดส่วนยอดขาย Category X ในยอดขายรวมบริษัท) × 100 — บอกว่า Category ไหน Over/Under-index ใน Channel ไหน |
| Category Portfolio Matrix (Company-wide) | Scatter 4-Quadrant | แกน X = ยอดขาย (Volume), แกน Y = %Growth YoY แบ่ง Stars/Question Marks/Cash Cows/Dogs ด้วยค่ามัธยฐาน |
| Category Share of Sales Over Time (Company-wide) | Stacked Area (18 เดือน) | สัดส่วน % ยอดขายแต่ละ Category ต่อยอดขายรวม รายเดือน |
| Sales by Category (พร้อม Toggle แยกตาม Channel) | Horizontal Bar | เหมือนข้อ 5.1 แต่เพิ่ม Toggle แยกข้อมูลตาม Channel ได้ |

### 5.4 MT Overview → Executive Summary

| Metric/Chart | ประเภท |
|---|---|
| Net Sales (MT), Target Attainment %, Growth YoY, Growth MoM, AR%, Return Rate (CN) | KPI Card |
| Revenue Trend (MT), Monthly YoY Growth % (MT) | Line Chart |
| Sales by Key Account | Donut/Bar |
| Sales by Category (MT) | Horizontal Bar |
| Ranking — Top Key Accounts by Net Sales | Table |

### 5.5 MT Overview → Breakdown (ข้อมูลคู่ค้า)

| Section | Metric/Chart |
|---|---|
| Portfolio Quality | Target vs Actual (รายเดือน), Return Rate (CN), AR Aging |
| Partner Performance | Target vs Actual per Partner/Key Account, Top & Bottom Partner Ranking, Active Partners, Partner Concentration (Top 5 Partner = กี่ % ของยอดขายรวม) |
| Product Coverage | Sales by Category, Category Portfolio Matrix, Category Share of Sales Over Time |

### 5.6 TT Overview → Executive Summary

| Metric/Chart | ประเภท |
|---|---|
| Total Net Sales, Target Attainment, AR%, Return Rate (CN), Active Stores, Store Retention | KPI Card |
| Revenue Trend, Monthly YoY Growth % | Line Chart |
| Sales by Customer Group, Sales by Category | Chart |
| Sales Ranking by Rep | Table |

### 5.7 TT Overview → Breakdown (ข้อมูลร้านค้า)

| Section | Metric/Chart |
|---|---|
| Portfolio Quality | Target vs Actual, Return Rate (CN), High Return Rate Stores, AR Aging |
| Team Performance | Target vs Actual (per rep), Active Sales Reps vs Avg Sales/Rep, Visit Compliance Trend |
| Customer Coverage | Top & Bottom Performing Stores, Active Stores, New vs Inactive Stores, Sales by Region, Sales by Province (แผนที่ไทย) |
| Product Coverage | Sales by Category, Category Portfolio Matrix, Category Share of Sales Over Time, Customer Group × Category |

### 5.8 TT Overview → Sales Person (มุมมองส่วนตัวของ Sales Rep)

| Section | Metric/Chart |
|---|---|
| (บนสุด) | Target Achievement (KPI), This Month at a Glance |
| My Priority Actions | Stores Needing Attention, AR By Due Date, Inactive Customers |
| Sales Snapshot | Daily Sales, Target vs Actual vs Diff |
| My Customers & Products | Top & Bottom Performing Stores, My Customer Group Mix, My Sales by Category |
| Credit Notes (CN) | CN Record (ตาราง, ดาวน์โหลดได้) |

### 5.9 ECOM Overview → Executive Summary

| Metric/Chart | ประเภท |
|---|---|
| Net Sales (Ecom), Target Attainment %, Growth YoY, Growth MoM, AOV, Conversion Rate | KPI Card |
| Revenue Trend (Ecom), Monthly YoY Growth % (Ecom) | Line Chart |
| Sales by Platform (Lazada/Shopee/TikTok) | Donut |
| Sales by Category (Ecom) | Horizontal Bar |
| Ranking by Platform | Table |

### 5.10 ECOM Overview → Breakdown (ข้อมูล Ecom Shop)

| Section | Metric/Chart |
|---|---|
| Portfolio Quality | Target vs Actual per Platform, Return/Cancellation Rate, Return Rate Ranking by Platform |
| Shop Performance | Target vs Actual per Shop/Platform, AOV by Platform, Conversion Rate by Platform, Ads Spend ROI (ถ้ามีข้อมูล) |
| Product Coverage | Sales by Category, Category Portfolio Matrix, Category Share Over Time, Top/Bottom SKU |
