# Charmiss Enterprise Dashboard — Design & Content Review
**เอกสารนี้แยกจาก `Charmiss_Dashboard_Spec.md` โดยตั้งใจ** — เป็นบันทึกการตรวจสอบ (QA + Strategic Review) หลังจากดู Screenshot จริงทั้ง 9 หน้า ไม่ใช่ Spec ที่ต้องอ้างอิงตอน Build

วันที่ตรวจ: 2026-07-31
ขอบเขตที่ตรวจ: Sales Overview (Executive Outlook, Product Analysis) · MT Overview (Executive Summary, Breakdown) · TT Overview (Executive Summary, Breakdown, Sales Person) · ECOM Overview (Executive Summary, Breakdown)

วิธีใช้เอกสารนี้: แบ่งเป็น **8 Task** — 7 ข้อตรงกับที่ขอมาตอนแรก บวก Task 8 ที่เพิ่มมาเรื่องลำดับการเรียงกราฟ แต่ละ Task อ่านจบในตัวเอง — ถ้าต้องการหยิบไปทำต่อเป็น Prompt แยก สามารถ copy ทั้ง section นั้นไปใช้ได้เลยโดยไม่ต้องอ้างอิง section อื่น (มีเลขอ้างอิงคาดไว้ให้ในกรณีที่โยงกัน เช่น "อ้างอิงข้อ 1.4")

> **หมายเหตุสำคัญ — ทุกตัวเลขในระบบคือ Mock Data:** ข้อมูลทั้งหมดในทุกหน้าสุ่มมาจาก Seed เดียวกัน ไม่ใช่ข้อมูลธุรกิจจริง ดังนั้นประเด็นเรื่อง "ตัวเลขตรง/ไม่ตรงกันระหว่างหน้า" (เช่น MT/TT/ECOM ที่เป็นการ Filter/Group มาจากชุดข้อมูลเดียวกับ Sales Overview) ถ้าออกมา **เท่ากัน ถือว่าปกติ ไม่ใช่ปัญหา** เพราะเป็น Mockup Data ที่ตั้งใจให้ผูกกับสูตรเดียวกันอยู่แล้ว ข้อสังเกตด้านล่างที่เกี่ยวกับตัวเลขจึงถูกมองในมุม "ความสวยงามตอน Demo/UX" เท่านั้น ไม่ใช่ความเสี่ยงข้อมูลจริงระดับ Production เว้นแต่จะระบุเป็นอย่างอื่นชัดเจน

---

## TL;DR — 6 เรื่องที่ควรพิจารณาก่อนสุด

1. **[Cosmetic/Demo-polish — ไม่ใช่บั๊กข้อมูลจริง เพราะเป็น Mockup]** ECOM: "Active Shop Listings" เลขไม่ตรงกันระหว่าง Executive Summary (18) กับ Breakdown (24) — แนะนำปรับให้ตรงกันเพื่อความสวยงามตอน Demo เท่านั้น ไม่ใช่ความเสี่ยงข้อมูลจริง — ดู 1.4
2. **[กราฟไม่สื่อความหมาย]** ECOM Breakdown: "Target vs Actual per Platform" ค่าทุก Platform ใกล้ 100% มาก แท่งเบี่ยงจน "มองไม่เห็นข้อมูล" — ดู 2.2 / 6.3
3. **[Layout]** Category Portfolio Matrix (MT, ECOM, และ Product Analysis) — Label ของ Quadrant ชนกับ Label จุดข้อมูลจริง — ดู 2.1
4. **[Data Gap]** ทั้ง Dashboard ไม่มีมิติ "กำไร/Margin" เลย มีแต่ยอดขาย — CEO จะถามแน่นอน — ดู 5, 6.1
5. **[Filter Gap]** ECOM Breakdown ไม่มีทางกรองดูเฉพาะ Platform เดียว (Lazada/Shopee/TikTok) ทั้งที่ข้อมูลรองรับอยู่แล้ว — ดู 3.1
6. **[ลำดับกราฟ]** Sales Overview: "Channel Snapshot Cards" (การ์ดพาไปแต่ละ Channel) และ "Compare Performance Table" อยู่ลึกเกินไป (ตำแหน่งที่ 8-9 จาก 11 การ์ด) ทั้งที่ควรเป็นจุดเริ่มต้นให้ User กดไปต่อ — ดู Task 8.1

---

## Task 1 — ความซ้ำซ้อนของกราฟระหว่างหน้า

### 1.1 "Sales by Category" ปรากฏซ้ำใน Executive Summary กับ Breakdown (ทุก Channel) — ประเด็นคือการแสดงผลซ้ำ ไม่ใช่เรื่องตัวเลข

**ขอชี้แจงก่อน (ตามหมายเหตุต้นเอกสาร):** กราฟชื่อ "Sales by Category" ปรากฏทั้งใน Executive Summary และใน Breakdown (โซน Product Coverage) ของทั้ง 3 Channel ด้วยตัวเลขชุดเดียวกันเป๊ะ (เช่น MT: Skin Care 31.9%, Personal Care 23.2%; TT: Skin Care 28.7%, Color Cosmetics 19.5%; ECOM: Color Cosmetics 26.4%, Skin Care 24.8%) — **การที่ตัวเลขตรงกัน ไม่ใช่ปัญหาและไม่ใช่เรื่องแปลก** เพราะทั้งสองจุดดึงจาก Mock data สูตรเดียวกันโดยตั้งใจ ไม่มี Filter อะไรที่ควรทำให้ต่างกันอยู่แล้ว ณ ตอนนี้

**ประเด็นที่แท้จริงคือเรื่อง Content/IA (การจัดวางข้อมูล) ล้วน ๆ:** การเอากราฟหน้าตาเดียวกันไปวางซ้ำ 2 จุดในคนละหน้า โดยไม่มีอะไรต่างกันเลย (ไม่ใช่คนละ scope แบบ 1.2/1.3) ทำให้เปลืองพื้นที่จอโดยไม่ได้ข้อมูลใหม่ให้ผู้ใช้ — นี่คือมุมมองการออกแบบหน้าจอ ไม่เกี่ยวกับความถูกต้องของข้อมูล

**ระดับ:** Medium (เป็นเรื่อง UX/การจัดวาง ไม่ใช่บั๊กและไม่ใช่ความเสี่ยงข้อมูล)
**ข้อเสนอ:** เลือกทางใดทางหนึ่ง
- (a) ตัดออกจาก Executive Summary เหลือแค่ Breakdown (เพราะ Breakdown คือที่ที่ควร deep-dive อยู่แล้ว), หรือ
- (b) เก็บไว้ทั้ง 2 ที่ แต่ทำให้เวอร์ชัน Breakdown ตอบสนอง Category-level filter เมื่อเปิด Sub-Category/Type/Series ใช้งานจริง (ตอนนี้ Disabled อยู่ — ดู 3.4) เพื่อให้มี "เหตุผลที่ต้องมี 2 จุด"

### 1.2 Revenue Trend / Growth ระดับ Company-wide vs ระดับ Channel — ไม่ใช่ปัญหา

Sales Overview แสดง Revenue Trend/Growth ระดับบริษัท ส่วน MT/TT/ECOM Executive Summary แสดงเฉพาะ Channel ตัวเอง — นี่คือ drill-down ปกติ ตัวเลขคนละ scope กันจริง ไม่ถือเป็นความซ้ำซ้อน ผ่าน

### 1.3 Category Portfolio Matrix / Category Share Over Time — Company-wide vs Channel-level ไม่ใช่ปัญหา แต่ควรมี cross-link

ปรากฏทั้งใน Product Analysis (บริษัทรวม) และใน Breakdown ของแต่ละ Channel (เฉพาะ Channel) — ตัวเลขต่างกันจริงตาม scope จึงไม่ใช่ปัญหาซ้ำซ้อน แต่ผู้ใช้อาจงงว่า "อันนี้กับอันนั้นสัมพันธ์กันยังไง"
**ข้อเสนอ:** ใส่ลิงก์เล็ก ๆ ("ดูภาพรวมทั้งบริษัท →" / "ดูเฉพาะ MT →") เชื่อมสองหน้านี้เข้าหากัน

### 1.4 [Cosmetic/Demo-polish — ไม่ใช่บั๊กข้อมูลจริง เพราะเป็น Mockup] ECOM "Active Shop Listings" เลขไม่ตรงกันข้ามหน้า

- Executive Summary KPI card: **18** shops (มาจาก series สุ่มที่โตต่อเนื่อง)
- Breakdown KPI card: **24** shops (มาจาก SHOP_COUNT คงที่ที่ตั้งแยกไว้ในไฟล์ Breakdown)

เทียบกับ MT ("Active Partners" = 38 ตรงกันทั้ง 2 หน้า) และ TT ("Active Stores" = 405 ตรงกันทั้ง 2 หน้า) ซึ่งบังเอิญออกมาตรงกัน — ECOM ไม่ตรงเพราะตอน build ผมตั้ง `SHOP_COUNT = 24` ในไฟล์ Breakdown แยกจาก `ecomShopListingsSeries` ในไฟล์ Executive Summary โดยไม่ได้ผูกให้เป็นค่าเดียวกัน

**ข้อสำคัญ:** เนื่องจากทั้งหมดเป็น Mock Data ไม่ใช่ข้อมูลธุรกิจจริง จุดนี้**ไม่ใช่ความเสี่ยงข้อมูลระดับ Production** — แต่ยังคุ้มค่าที่จะแก้เพื่อความสวยงามตอน Demo (กันผู้ชมสงสัยเวลาสลับหน้าไปมาเจอเลขไม่ตรงกัน)
**ระดับ:** Cosmetic (ลดจาก High เดิม เพราะเป็นแค่ Mock data)
**ข้อเสนอ:** ถ้าจะแก้เพื่อความสวยงาม ให้ปรับ `SHOP_COUNT` ใน `module_ecom_breakdown.html` ให้อ้างอิงค่าปลายทางของ `ecomShopListingsSeries` (index ปัจจุบัน/TODAY) จาก Executive Summary แทนที่จะเป็นค่าคงที่แยกต่างหาก

---

## Task 2 — Layout ที่ดูเบี้ยว/ขัดกัน

### 2.1 [ซ้ำ 3 จุด] Label ชนกันใน Category Portfolio Matrix (Scatter chart)

- **MT Breakdown**: Label "Question Marks" (มุม Quadrant) ทับกับ Label ของจุดข้อมูล "Fragrance" พอดี
- **ECOM Breakdown**: อาการเดียวกัน — "Question Marks" ทับกับจุด "Fragrance" (เพราะ Fragrance ทั้ง 2 Channel เป็น Category ยอดขายต่ำ+โตเร็ว ซึ่งตกอยู่มุมเดียวกับที่วาง Label Quadrant พอดี)
- **Product Analysis (Sales Overview)**: จุด "Hair Care" กับ "Personal Care" อยู่ใกล้กันเกินไปจน Label ซ้อนทับกันเอง

**Root cause เดียวกันทั้ง 3 จุด:** ฟังก์ชัน `buildScatterSVG` ใน `shared.js` ไม่มีระบบเลี่ยง Label ชนกัน (label collision avoidance) — ทั้งชนกับ Label กรอบ Quadrant คงที่ และชนกันเองระหว่างจุดข้อมูลที่ใกล้กัน

**ระดับ:** Medium-High (เป็นกราฟที่ผู้บริหารดูบ่อย ความอ่านง่ายมีผลกับความน่าเชื่อถือ)
**ข้อเสนอ:** แก้ที่ `shared.js` จุดเดียว จะได้ผลทั้ง 3 หน้าพร้อมกัน — (ก) ขยับตำแหน่ง Quadrant label ให้ชิดขอบกราฟจริง ๆ ไม่ใช่ลอยอยู่กลางโซน, (ข) ตรวจระยะห่างระหว่างจุดข้อมูลแบบง่าย ๆ (ถ้าใกล้กันเกิน threshold ให้สลับ offset บน/ล่าง)

### 2.2 ECOM Breakdown: "Target vs Actual per Platform" แท่งแทบมองไม่เห็น

ค่า Attainment ของทั้ง 3 Platform อยู่ที่ 100%, 102%, 100% — ใกล้เส้น Baseline 100% มากจนแท่งเขียว/แดงแทบไม่มีความยาวให้เห็น ดูเผิน ๆ เหมือนกราฟว่างเปล่าไม่มีข้อมูล ทั้งที่จริงมีข้อมูลอยู่ (รายละเอียดวิธีแก้ ดู 6.3)

### 2.3 ECOM Breakdown: Filter Bar ดูโล่งกว่าหน้าอื่นเห็นได้ชัด

MT Breakdown มี 4 ตัวควบคุม (Period, Category, KAM, "My accounts only"), TT Breakdown มี Period + Region + Category + Sales Person แต่ ECOM Breakdown มีแค่ **Period + Category** เพราะตัดสินใจไม่ใส่ Filter รายบุคคล (ตามที่ตกลงไว้ก่อนหน้านี้) — เป็นการตัดสินใจที่ถูกต้องเรื่อง scope แต่ในเชิง visual จะรู้สึกเหมือนหน้ายังสร้างไม่เสร็จเมื่อเทียบเคียงกับ MT/TT
**ข้อเสนอ:** เพิ่ม "Platform" filter (ดู 3.1) จะช่วยเติมเต็ม Filter Bar ให้ดูสมบูรณ์ขึ้นพร้อมได้ประโยชน์ใช้งานจริงไปด้วย โดยไม่ขัดกับการตัดสินใจ "ไม่มี Filter บุคคล" (Platform ไม่ใช่ Filter ระดับบุคคล)

### 2.4 [ต้องยืนยันด้วยตาอีกครั้งบน Browser จริง — ความมั่นใจต่ำ] Sales Overview "Full Year Forecast" trajectory sparkline

เส้นประช่วงท้ายก่อนถึงจุด Forecast มีรอยหยักเล็กน้อยในภาพนิ่ง อาจเป็นแค่ Noise ปกติของ Mock data ไม่ใช่บั๊ก Render แนะนำแค่เปิดดูจริงบนเบราว์เซอร์อีกครั้งระหว่าง QA ไม่ต้องแก้ตอนนี้

### 2.5 [พบระหว่างตรวจ TT — ไม่ใช่ไฟล์ที่สร้างรอบนี้ แต่ควรบันทึกไว้] ปุ่ม Toolbar บางการ์ดใน TT Breakdown/Sales Person ดูเหมือนมีแค่ 2 ปุ่มในจุดที่ควรมี 3 ปุ่ม — รายละเอียดอยู่ Task 4

---

## Task 3 — Filter ที่ควรเพิ่ม (และเพิ่มที่หน้าไหน)

| # | หน้า | Filter ที่เสนอ | เหตุผล / ความเป็นไปได้ |
|---|------|---------------|------------------------|
| 3.1 | **ECOM Breakdown** | **Platform** (All / Lazada / Shopee / TikTok Shop) | High-value ที่สุดในลิสต์นี้ — ให้ scope ทั้งโซน Shop Performance เหลือเฉพาะ Platform เดียว เช่นก่อนประชุมทีม TikTok โดยเฉพาะ ข้อมูล `shops[].platformKey` มีอยู่แล้วในโค้ด ไม่ต้องสร้าง mock data ใหม่ ไม่ขัดกับมติ "ไม่มี Filter รายบุคคล" เพราะ Platform ≠ Owner |
| 3.2 | **MT Breakdown** | **Format Group** (Beauty Specialty Chain / Department Store / Drugstore / Hypermarket / Convenience) | `partners[].group` มีอยู่แล้ว ใช้ได้ทันที ช่วย KAM ที่ดูแลเฉพาะ Format หนึ่งกรองตรงงานได้เลย |
| 3.3 | **TT Breakdown** | **Customer Group** (Retail-Beauty / Wholesale / Retail-Drug ฯลฯ) | คู่กับ Region/Sales Person ที่มีอยู่แล้ว ตอบคำถาม "ร้าน Wholesale ทำเป้าหรือยัง" ได้โดยไม่ต้องไล่ทีละ Region |
| 3.4 | **ทุก Channel Breakdown** | เปิดใช้งาน Sub-Category / Type / Series จริง (ตอนนี้ Disabled หมด เหลือแค่ "All Categories") | Priority สูงเพราะกระทบทุกหน้าพร้อมกัน — Level Selector ที่มีอยู่แล้วในทุกหน้าจะได้ใช้ประโยชน์เต็มที่ครั้งแรก |
| 3.5 | **Sales Overview / Product Analysis** | Toggle เทียบฐาน "vs Last Year / vs Budget" บนกราฟ Revenue Trend | ตอนนี้ Fix ให้โชว์ทั้ง 2 เส้นพร้อมกันอยู่แล้วซึ่งก็โอเค แต่ถ้าอยากลดความรกสำหรับบาง Persona ให้เป็น Checkbox แบบเดียวกับ "Revenue Trend by Channel" ที่มีอยู่แล้ว |

---

## Task 4 — Audit ปุ่ม Toolbar (Table / Download / Expand)

กติกาที่ยึด (ตาม Spec 3.4): **Chart card = 3 ปุ่ม เสมอ** (ดูตาราง/ดาวน์โหลด/ขยาย), **Table card = 2 ปุ่ม เสมอ** (ดาวน์โหลด/ขยาย ไม่มีปุ่มดูตารางเพราะเป็นตารางอยู่แล้ว), **Heatmap ได้รับการยกเว้นปุ่ม "ดูตาราง"** เพราะตัวมันเองแสดงผลแบบตารางอยู่แล้ว, **KPI card ไม่มี Toolbar**

### 4.1 ECOM (ตรวจจากซอร์สโค้ดโดยตรง — มั่นใจ 100%)

ทุกการ์ดใน `module_ecom_executive_summary.html` และ `module_ecom_breakdown.html` ผ่านกติกาครบทุกใบ (Revenue Trend / Monthly YoY Growth / Sales by Platform / Sales by Category = 3 ปุ่ม, Ranking table = 2 ปุ่ม, Target vs Actual per Platform / Return-Cancellation Rate / Target vs Actual per Shop / AOV by Platform / Conversion Rate by Platform / Category Portfolio Matrix / Category Share Over Time = 3 ปุ่ม, Top5/Bottom5 Shops / Top5/Bottom5 SKU = 2 ปุ่ม, KPI cards ทั้งหมดไม่มี Toolbar) — ตรงนี้ผ่านการเช็ค ID ทุกตัวไปแล้วตอน Build ไม่ต้องแก้เพิ่ม

### 4.2 Sales Overview / MT (ตรวจจาก Screenshot + โค้ดที่มีอยู่ — มั่นใจสูง)

| การ์ด | ประเภท | ปุ่มที่ควรมี | สถานะที่เห็น |
|---|---|---|---|
| Revenue Trend, Sales by Channel, Channel Growth Comparison, Sales by Category, Growth Contribution Waterfall, Return/Cancellation Rate Trend, Revenue Trend by Channel, Channel Mix Over Time | Chart | 3 | ✅ ครบ |
| Compare Performance Table | Table | 2 | ✅ ครบ |
| Category x Channel Heatmap | Heatmap (ยกเว้น) | 2 | ✅ ถูกต้องตาม Spec (ไม่ใช่บั๊ก) |
| Channel Index by Category, Category Portfolio Matrix, Category Share Over Time | Chart | 3 | ✅ ครบ |
| MT: Revenue Trend, Monthly YoY Growth, Sales by Key Account, Sales by Category, Target vs Actual, Return Rate (CN), Target vs Actual per Partner, Sales by Category, Category Portfolio Matrix, Category Share Over Time | Chart | 3 | ✅ ครบ |
| MT: Ranking table, AR Aging, Top5/Bottom5 Partners | Table | 2 | ✅ ครบ |

### 4.3 TT (ตรวจจาก Screenshot เท่านั้น — ความมั่นใจปานกลาง เพราะภาพย่อเล็กช่วงล่างของหน้ายาว ควรเปิดหน้าจริงยืนยันอีกครั้ง)

| การ์ด | ประเภท | ที่คาดว่าควรมี | สิ่งที่สังเกตเห็น | หมายเหตุ |
|---|---|---|---|---|
| Revenue Trend, Monthly YoY Growth, Sales by Customer Group, Sales by Category, Target vs Actual, Return Rate (CN), Daily Sales, Target vs Actual vs Diff, Top&Bottom Stores | Chart | 3 | ครบ | ดูชัดเจนในภาพ |
| Sales Ranking, AR Aging | Table | 2 | ครบ | |
| **High Return Rate Stores** (Breakdown) | Chart | 3 | เห็น 3 ปุ่ม | ผ่าน |
| **Stores Needing Attention** (Sales Person) | Chart (bar) | 3 | **ดูเหมือนมีแค่ 2 ปุ่ม** (download/expand) | ⚠️ ควรเช็คซ้ำ — ถ้าจริงคือขาดปุ่ม "ดูตาราง" |
| **AR By Due Date** (Sales Person) | Chart (bar + toggle Overdue/Within Due) | 3 | **ดูเหมือนมีแค่ 2 ปุ่ม** | ⚠️ ควรเช็คซ้ำ |
| **Inactive Customers** (Sales Person) | Chart (bar) | 3 | **ดูเหมือนมีแค่ 2 ปุ่ม** | ⚠️ ควรเช็คซ้ำ |
| **CN Record** (Sales Person, ท้ายหน้า) | Table | 2 | **ดูเหมือนมีปุ่มเดียว (download)** | ⚠️ ถ้าจริง ขาดปุ่ม "ขยาย" — ผิดกติกา "Table = 2 ปุ่มเสมอ ไม่มีข้อยกเว้น" |
| Sales by Province (map) | Chart แบบพิเศษ (มี zoom control ของแผนที่เองด้วย) | 3 + zoom | เห็นปุ่ม + ตัว zoom แยก | ควรเช็คว่าไม่ปนกับปุ่มมาตรฐาน |

**ข้อเสนอ:** เปิดทั้ง 4 การ์ดที่ทำเครื่องหมาย ⚠️ ในเบราว์เซอร์จริง (ไม่ใช่ภาพนิ่ง) เพื่อยืนยัน ถ้าขาดจริงให้เติมปุ่มตามกติกาเดียวกับที่ MT/ECOM ทำไว้แล้ว เพื่อความสม่ำเสมอทั้งระบบ

---

## Task 5 — Role-Play: CEO/Sales Director และ Sales หน้างาน อยากรู้อะไรจาก Dashboard นี้

*(ทำข้อนี้ก่อน เพื่อใช้เป็นฐานให้ Task 6 และ 7 ตรงประเด็นมากขึ้น ตามที่ขอ)*

### มุมมอง CEO / Sales Director (มองภาพรวม ตัดสินใจเชิงกลยุทธ์)

| คำถาม | ตอบได้จากหน้าไหนตอนนี้ | ตอบได้แค่ไหน |
|---|---|---|
| ยอดขายรวมเทียบเป้าเป็นอย่างไร แต่ละ Channel ใครทำได้ ใครไม่ได้ | Sales Overview, MT/TT/ECOM Executive Summary | ✅ ตอบได้ดี |
| Full Year จะจบที่เท่าไหร่ เสี่ยงพลาดเป้าไหม | Sales Overview (Full Year Forecast) | ✅ ตอบได้ |
| **กำไร/Margin ของแต่ละ Channel/Category เป็นอย่างไร ไม่ใช่แค่ยอดขาย** | **ไม่มีหน้าไหนตอบได้เลย** | ❌ Gap ใหญ่ที่สุด — ดู 6.1 |
| Partner/Store/Shop รายไหนเสี่ยงจะหลุด (Concentration risk) | MT (Partner Concentration), ECOM (Shop Concentration) | ⚠️ Partial — TT ไม่มี Metric แบบนี้ |
| Category ไหนควรลงทุนเพิ่ม ไหนควรตัดใจปล่อย | Category Portfolio Matrix ทุก Channel | ✅ ตอบได้ (แต่ติดปัญหา Label ชนกัน — 2.1) |
| Customer/Partner ใหม่เข้ามากี่ราย หายไปกี่ราย (Acquisition/Churn) | TT มี "New vs Inactive Stores" | ⚠️ Partial — MT/ECOM ไม่มี Metric คู่ขนาน |
| อะไรคือสาเหตุที่ยอดโตหรือหด (Driver) ไม่ใช่แค่ตัวเลขลอย ๆ | Growth Contribution Waterfall (Sales Overview เท่านั้น) | ⚠️ มีแค่ระดับบริษัท ไม่มีในระดับ Channel |

### มุมมอง Sales หน้างาน (TT Sales Person / KAM เชิงเปรียบเทียบ)

| คำถาม | ตอบได้จากหน้าไหน | ตอบได้แค่ไหน |
|---|---|---|
| วันนี้/สัปดาห์นี้ยอดฉันเท่าไหร่ | TT: Daily Sales (Sales Person) | ✅ มีเฉพาะ TT — MT/ECOM ไม่มีมุมมองรายบุคคลระดับนี้เลย (เป็นมติที่ตกลงไว้แล้วสำหรับ ECOM แต่ MT ยังไม่มีการคุยกันชัดเจน) |
| ลูกค้า/ร้านของฉันคนไหนเสี่ยงหลุด ต้องรีบไปตาม | TT: Stores Needing Attention, Inactive Customers | ✅ มีเฉพาะ TT — MT (Partner) และ ECOM (Shop) ไม่มี List แบบนี้เลย แม้จะมี Concentration KPI |
| AR ใกล้ครบกำหนดของลูกค้าฉันมีใครบ้าง | TT: AR By Due Date (รายบุคคล) | ✅ มีเฉพาะ TT — MT/ECOM มี AR Aging แค่ระดับรวม Channel ไม่ลงถึงรายคน |
| ยอดฉันเทียบเพื่อนร่วมทีมอยู่อันดับไหน | TT: Top & Bottom Performing Stores | ✅ มีเฉพาะ TT |
| SKU ไหนในมือฉันที่ควรผลักดัน/มีปัญหา Return สูง | ECOM/MT: Top/Bottom SKU (Breakdown) มีแค่ระดับ Channel รวม ไม่ผูกกับรายบุคคล | ⚠️ Partial |

**สรุปจาก Role-play:** ช่องว่างที่ชัดที่สุดคือ (1) ไม่มี Margin/กำไรเลยทั้งระบบ (2) MT และ ECOM ไม่มีมุมมองระดับบุคคล/หน่วยย่อยแบบที่ TT Sales Person มี ทำให้ KAM (MT) และเจ้าของ Platform (ECOM) ไม่มีเครื่องมือติดตามงานประจำวันแบบเดียวกับที่ TT Sales ได้ — นำไปสู่ข้อเสนอใน Task 6 และ 7

---

## Task 6 — ข้อเสนอปรับปรุง Dashboard **ปัจจุบัน** (เพิ่ม / ลด / แก้)

### เพิ่ม (Gap ที่ควรเติม)

1. **Margin/Gross Profit % by Channel** — เพิ่มในทั้ง Sales Overview และ MT/TT/ECOM Executive Summary (อ้างอิง Task 5 — คำถามอันดับต้นของ CEO)
2. **"New vs Churned Partners" (MT)** และ **"New vs Churned Shops" (ECOM)** — ให้ parity กับ TT's "New vs Inactive Stores" ที่มีอยู่แล้ว
3. **"High Return/Cancellation Rate Partners" (MT)** และ **"High Return/Cancellation Rate Shops" (ECOM)** — ให้ parity กับ TT's "High Return Rate Stores" (ปัจจุบัน MT/ECOM มีแต่ Top/Bottom by Revenue ไม่มี List แบบ "ต้องรีบดู")
4. **Platform filter (ECOM)** — อ้างอิง 3.1
5. **Format Group filter (MT)** — อ้างอิง 3.2

### ลด/รวม (ซ้ำซ้อนหรือ Impact ต่ำ)

1. **"Sales by Category" ที่ซ้ำระหว่าง Exec Summary/Breakdown** — อ้างอิง 1.1 (เลือกตัดหรือทำให้ตอบสนอง filter)
2. **AOV by Platform + Conversion Rate by Platform (ECOM Breakdown)** — ข้อมูลมีแค่ 3 แถว (3 Platform) การทำเป็นกราฟแท่งเต็มการ์ด 2 ใบอาจเกินความจำเป็น พิจารณารวมเป็นตารางเดียว (Platform / AOV / Conversion Rate) แทน จะประหยัดพื้นที่และอ่านง่ายกว่า

### แก้ (Rendering/ค่าที่แปลก)

1. **ECOM Active Shop Listings เลขไม่ตรงกัน (18 vs 24)** — Cosmetic เท่านั้นเพราะเป็น Mock data ไม่ใช่ Data risk จริง แต่แก้ได้ง่ายเพื่อความสวยงาม — อ้างอิง 1.4
2. **ECOM Target vs Actual per Platform แท่งแทบมองไม่เห็น** — อ้างอิง 2.2 — แนะนำ 2 ทางเลือก: (ก) ปรับสูตร mock data ให้ attainment ระดับ Platform มี spread กว้างขึ้น (ตอนนี้คำนวณจาก sumRange(actual)/sumRange(target) ซึ่ง noise เดิมออกแบบมาสำหรับระดับ Series ไม่ใช่ระดับ Platform ที่มีแค่ 3 ค่า จึงเกาะกลุ่มใกล้ 100% เกินไป) หรือ (ข) เปลี่ยนวิธีนำเสนอเป็นตัวเลข + Indicator ลูกศรขึ้น/ลง แทนกราฟแท่งเทียบ Baseline
3. **Label ชนกันใน Scatter chart** — อ้างอิง 2.1
4. **ปุ่ม Toolbar ที่อาจขาดใน TT Breakdown/Sales Person** — อ้างอิง 4.3 (ต้องเช็คในเบราว์เซอร์จริงก่อนสรุปว่าเป็นบั๊ก)

---

## Task 7 — Module ในอนาคตที่ควรทำต่อ (นอกเหนือจาก As-is ปัจจุบัน)

### 7.1 MT Store-Level Module (ตามไอเดียที่เสนอมา) — เห็นด้วย และควรทำ

ตอนนี้ MT Overview หยุดอยู่ที่ระดับ Partner/Key Account (เช่น "Eveandboy" เป็น 1 แถวในตาราง Ranking) ทั้งที่ในความเป็นจริง Partner แต่ละราย เปิดสาขาจริงหลายจุด (เช่น Eveandboy สาขาสยาม, บางแค ฯลฯ) — เป็น granularity ที่ยังไม่เคยมีในระบบเลย โมดูลนี้ควรมี:
- Sales รายสาขาภายใต้ Partner เดียวกัน (Sell-in vs Sell-out ถ้ามีข้อมูล)
- Store visit compliance / Planogram compliance (คู่ขนานกับสิ่งที่ TT Sales Person มีในระดับ Store)
- New/Closed store tracking รายสาขาในแต่ละ Partner
- Heat map ตามทำเล/ห้าง/จังหวัด คู่ขนานกับ "Sales by Province" ที่ TT มีอยู่แล้ว

โมดูลนี้จะเติมเต็มช่องว่างที่เจอใน Task 5 (MT ไม่มีระดับย่อยแบบที่ TT Sales Person มี) ได้พอดี

### 7.2 MT "KAM Person" View — คู่ขนานกับ TT Sales Person

ตอนนี้ TT มีมุมมองรายบุคคล (Sales Person) แต่ MT และ ECOM ไม่มี เสนอสร้างมุมมองส่วนตัวของ KAM แต่ละคน (บัญชีที่ตัวเองดูแล, เป้าตัวเอง, Partner ที่ต้องรีบตาม) — ตอบโจทย์ Task 5 โดยตรง

### 7.3 Profitability / Margin Module

แยกเป็น Module เฉพาะที่วิเคราะห์ Gross Margin ตาม Channel/Category/SKU ถ้ามีข้อมูลต้นทุนสนับสนุน — ตอบช่องว่างที่ใหญ่ที่สุดที่เจอใน TL;DR ข้อ 4

### 7.4 Trade Marketing / Promotion & Ads ROI Module

"Ads Spend ROI" ที่ตัดออกจากขอบเขต ECOM รอบนี้ ("ตัดไปก่อน") น่าจะเหมาะกับการทำเป็น Module แยกต่างหากที่ครอบคลุมทั้ง MT (Trade spend), TT (Promotion), ECOM (Ads Spend) พร้อมกัน แทนที่จะฝังไว้ใน ECOM Breakdown เพียงที่เดียว

### 7.5 Inventory / Sell-in vs Sell-out Module

ยังไม่มี Metric เรื่องสต๊อกเลยทั้งระบบ (Days of Inventory, Stockout risk) — เป็นมิติคลาสสิกของธุรกิจ FMCG/Beauty ที่ทีม Supply Chain น่าจะต้องการ

### 7.6 Executive Exception/Alert Digest

รวม "สิ่งที่ต้องรีบดู" ข้าม Channel ไว้หน้าเดียว (ต่อยอดจากแนวคิด "Priority Actions" ที่ TT Sales Person มีอยู่แล้วในระดับบุคคล ให้ยกระดับเป็นเวอร์ชันผู้บริหารที่มองข้าม MT/TT/ECOM พร้อมกัน) เช่น Partner/Store/Shop ที่ Return Rate พุ่ง, Category ที่หลุดเป้าติดกันหลายเดือน

### 7.7 ECOM "Shop/Platform Owner Person" View

แม้จะตัดสินใจไม่ใส่ Filter รายบุคคลใน ECOM Breakdown ไปแล้ว แต่ถ้าในอนาคตมีการมอบหมายผู้ดูแลแต่ละ Platform จริง ก็ยังสามารถทำเป็น Module แยกต่างหาก (คล้าย TT Sales Person) ได้โดยไม่ขัดกับมติเดิม เพราะเป็นคนละหน้ากับ Breakdown

---

## Task 8 — ลำดับการเรียงกราฟในแต่ละหน้า

หลักที่ใช้ตรวจ: กราฟ/การ์ดในหน้าเดียวกันควรเรียงตามหลัก **"หยาบ → ละเอียด" (Coarse-to-fine)** คือ KPI สรุป → เทรนด์ภาพรวม → แยกตามมิติหลัก (เช่น Platform/Format) → รายละเอียด/อันดับตามหน่วยย่อย (เช่น Shop/Partner/Store) → มุมมองสินค้า/Category ปิดท้าย และการ์ดที่เป็น "ทางลัดไปหน้าอื่น" (navigation) ควรอยู่ต้น ๆ หน้า ไม่ใช่ฝังลึก

### 8.1 [ควรแก้ — เห็นผลชัดเจนถ้าทำ] Sales Overview — Executive Outlook: การ์ดนำทางอยู่ลึกเกินไป

ลำดับปัจจุบัน (โดยประมาณ): KPI row → Revenue Trend → Sales by Channel → Channel Growth Comparison → Sales by Category → Growth Contribution Waterfall → Return/Cancellation Rate Trend → **Channel Snapshot Cards** (การ์ดพา MT/TT/ECOM) → **Compare Performance Table** → Revenue Trend by Channel → Channel Mix Over Time

"Channel Snapshot Cards" เป็นการ์ดนำทาง (คลิกแล้วพาไปหน้า MT/TT/ECOM) — โดยธรรมชาติควรเป็นจุดที่ User เจอเร็ว ๆ เพื่อกดไปดูรายละเอียดต่อ แต่ตอนนี้อยู่ตำแหน่งที่ 8 จาก 11 (หลังกราฟวิเคราะห์เชิงลึกไปแล้วหลายอัน) เช่นเดียวกับ Compare Performance Table ที่เป็นตารางสรุปเทียบ Channel ซึ่งน่าจะอยู่ใกล้ต้นหน้ามากกว่า
**ข้อเสนอ:** ย้าย Channel Snapshot Cards ขึ้นมาไว้ทันทีหลัง KPI row (ก่อนกราฟวิเคราะห์อื่น ๆ) ส่วน Compare Performance Table ย้ายมาไว้ใกล้ ๆ กัน เพื่อให้ผู้ใช้ที่เข้ามาแค่ "อยากรู้ภาพรวมแล้วไปต่อ" ทำได้เร็วโดยไม่ต้องเลื่อนผ่านกราฟวิเคราะห์ก่อน

### 8.2 [พบใหม่] ECOM Breakdown — สลับมิติ Platform/Shop ไปมา ทำให้ Flow ขาดช่วง

ลำดับปัจจุบันใน Zone B "Shop Performance": KPI row (Active Shop Listings, Shop Concentration) → Target vs Actual per Shop (ระดับ Shop) → Top5/Bottom5 Shops (ระดับ Shop) → **AOV by Platform + Conversion Rate by Platform (ย้อนกลับไประดับ Platform)**

ปัญหา: กราฟไล่จากระดับ Shop (ละเอียด) กลับไประดับ Platform (หยาบ) ตอนท้ายโซน สลับทิศทางกับหลัก Coarse-to-fine ที่ควรจะเป็น ยิ่งไปกว่านั้น Zone A ("Portfolio Quality") ที่อยู่ก่อนหน้าก็มี "Target vs Actual per Platform" และ "Return/Cancellation Rate" ซึ่งเป็นระดับ Platform เหมือนกัน แต่ถูกแยกคนละ Zone กับ AOV/Conversion by Platform ทั้งที่เป็นมิติเดียวกัน

**ข้อเสนอ:** จัดกลุ่มใหม่เป็น 2 ชั้นให้ชัดเจน — (1) "Platform Performance" รวม Target vs Actual per Platform, Return/Cancellation Rate, AOV by Platform, Conversion Rate by Platform ไว้ด้วยกันทั้งหมด แล้วตามด้วย (2) "Shop Performance" (Target vs Actual per Shop, Top5/Bottom5 Shops) แยกเป็นคนละโซนชัดเจน จะได้ลำดับ Platform (หยาบ) → Shop (ละเอียด) ที่ไม่มีการสลับกลับไปกลับมา

### 8.3 [Minor, ถกได้ทั้ง 2 ทาง] MT Breakdown — ตำแหน่ง AR Aging Table

AR Aging table อยู่ใน Zone A "Portfolio Quality" ร่วมกับ Target vs Actual และ Return Rate (CN) — ในแง่หนึ่งก็เข้าธีม "คุณภาพพอร์ต" แต่ AR เป็นความเสี่ยงทางการเงินที่ผูกกับ Partner รายตัว อาจจะเหมาะกับ Zone B "Partner Performance" มากกว่า (ใกล้ Top5/Bottom5 Partners) เพื่อให้ผู้ใช้เห็น "Partner รายไหน AR ค้างเยอะ" ในโซนเดียวกับที่กำลังดูผลงานรายตัวอยู่แล้ว — ไม่ใช่ปัญหาใหญ่ ทั้ง 2 ตำแหน่งอธิบายได้ ระบุไว้เผื่อพิจารณา

### 8.4 [ตัวอย่างที่ดี — ควรใช้เป็นต้นแบบ] TT Sales Person: ลำดับกราฟดีที่สุดในระบบ

ลำดับ: KPI สรุปผลงานตัวเอง → Daily Sales (เทรนด์) → Target vs Actual vs Diff → **กลุ่ม Action items ทั้งหมดอยู่ติดกัน** (Stores Needing Attention, AR By Due Date, Inactive Customers) → Top & Bottom Performing Stores → มุมมองอ้างอิง (My Customer Group Mix, My Sales by Category, CN Record)

หน้านี้เรียงตามลำดับความสำคัญของการใช้งานจริงของพนักงานหน้างานได้ดีที่สุด: "ผลงานฉันเป็นไง" → "แนวโน้ม" → "อะไรที่ต้องรีบทำวันนี้" (จัดกลุ่มติดกันหมด ไม่กระจาย) → "ข้อมูลอ้างอิงเสริม" ปิดท้าย
**ข้อเสนอ:** ใช้ Pattern นี้เป็นต้นแบบเวลาออกแบบหน้าใหม่ (เช่น MT KAM Person ในอนาคต — อ้างอิง 7.2) โดยเฉพาะการจัดกลุ่ม "Action items" ให้อยู่ติดกันเป็นก้อนเดียว แทนที่จะกระจายแทรกกับกราฟวิเคราะห์อื่น

### 8.5 หน้าที่ลำดับโอเคอยู่แล้ว ไม่ต้องแก้

Sales Overview (Product Analysis), MT Executive Summary, TT Executive Summary, TT Breakdown, ECOM Executive Summary — ทุกหน้าเรียง KPI → เทรนด์ → แยกตามมิติหลัก → ตารางอันดับ ตามหลัก Coarse-to-fine อยู่แล้ว ไม่พบจุดที่ต้องสลับตำแหน่ง

---

*จบเอกสาร — ไฟล์นี้ไม่กระทบ `Charmiss_Dashboard_Spec.md` แต่อย่างใด*
