# ระบบเบิกวัตถุดิบร้านอาหาร (The Little Ivy House)

โปรเจกต์นี้คือระบบเบิกวัตถุดิบสำหรับร้านอาหาร "The Little Ivy House" พัฒนาด้วย Vite, React, TypeScript, Node.js และ Drizzle ORM (เชื่อมต่อกับ TiDB Cloud) พร้อมฟีเจอร์การจัดการคลังสินค้า, รายชื่อพนักงาน, การแจ้งเตือน Discord และการเชื่อมต่อ Google Sheets

## ฟีเจอร์หลัก

*   **หน้าแจ้งเบิกวัตถุดิบ:** พนักงานสามารถเลือกวัตถุดิบจากรายการและแจ้งเบิกได้
*   **หน้าจัดการคลังวัตถุดิบ:** แอดมินสามารถเพิ่ม, แก้ไข, ลบวัตถุดิบ และดูจำนวนคงเหลือได้
*   **หน้าจัดการพนักงาน:** แอดมินสามารถจัดการรายชื่อพนักงานที่สามารถเบิกวัตถุดิบได้
*   **ระบบแจ้งเตือน Discord:** แจ้งเตือนไปยัง Discord เมื่อมีการเบิกวัตถุดิบใหม่
*   **เชื่อมต่อ Google Sheets:** ซิงค์รายชื่อพนักงานและข้อมูลสต็อกกับ Google Sheets อัตโนมัติ
*   **Dashboard & Reports:** ดูภาพรวมสถิติการเบิกจ่ายและส่งออกข้อมูลเป็น Excel

## การติดตั้งและรันโปรเจกต์ (Local Development)

### 1. เตรียมเครื่องมือ

*   **Node.js:** v18 หรือสูงกว่า
*   **pnpm:** ติดตั้งด้วย `npm install -g pnpm`
*   **VS Code:** พร้อมส่วนเสริมที่จำเป็น (เช่น ESLint, Prettier)

### 2. ติดตั้ง Dependencies

เปิด Terminal (แนะนำ Command Prompt) ในโฟลเดอร์โปรเจกต์แล้วรัน:

```bash
npm install --legacy-peer-deps
```

### 3. ตั้งค่า Environment Variables

เปลี่ยนชื่อไฟล์ `.env.example` เป็น `.env` แล้วแก้ไขค่าดังนี้:

```dotenv
VITE_APP_ID=
JWT_SECRET=your_random_secret_key_here
DATABASE_URL="mysql://[USERNAME]:[PASSWORD]@[HOST]:4000/test?sslaccept=strict"
OAUTH_SERVER_URL=
OWNER_OPEN_ID=
BUILT_IN_FORGE_API_URL=
BUILT_IN_FORGE_API_KEY=
DISCORD_WEBHOOK_URL="YOUR_DISCORD_WEBHOOK_URL_HERE"
GOOGLE_SHEETS_WEB_APP_URL="https://script.google.com/macros/s/AKfycbxai3cvtrVA10RBY9He1ayx-rHpaEJ694f-axUzmUftcW_pkxSsp_noYNSTP3dM2PtP4g/exec"
```

*   **`JWT_SECRET`**: ใส่ข้อความสุ่มยาวๆ
*   **`DATABASE_URL`**: ได้จาก TiDB Cloud (ดูวิธีตั้งค่าในเอกสาร TiDB Cloud)
*   **`DISCORD_WEBHOOK_URL`**: ได้จากการสร้าง Webhook ใน Discord
*   **`GOOGLE_SHEETS_WEB_APP_URL`**: ได้จากการ Deploy Google Apps Script (ดูวิธีตั้งค่าด้านล่าง)

### 4. สร้างตารางฐานข้อมูล

รันคำสั่งนี้เพื่อสร้างตารางในฐานข้อมูล TiDB Cloud ของคุณ:

```bash
npm run db:push
```

### 5. รันโปรเจกต์

รันคำสั่งนี้เพื่อเริ่ม Development Server:

```bash
npm run dev
```

จากนั้นเปิดเบราว์เซอร์ไปที่ `http://localhost:5173` หรือ `http://localhost:3000`

## การตั้งค่า Google Sheets Integration

1.  **สร้าง Google Sheets ใหม่:** ใน Google Drive ของคุณ
2.  **เปิด Apps Script:** ไปที่เมนู `ส่วนขยาย (Extensions)` > `Apps Script`
3.  **วางโค้ด:** ลบโค้ดเดิมออกแล้ววางโค้ดนี้ลงไป:

    ```javascript
    function doPost(e) {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var action = e.parameter.action;
      
      if (action === "addRequisition") {
        var sheet = ss.getSheetByName("Requisitions") || ss.insertSheet("Requisitions");
        if (sheet.getLastRow() === 0) {
          sheet.appendRow(["Timestamp", "Employee", "Order", "Note", "Total"]);
        }
        sheet.appendRow([
          new Date(),
          e.parameter.employee,
          e.parameter.order,
          e.parameter.note,
          e.parameter.total
        ]);
        return ContentService.createTextOutput("Requisition added");
      }
      
      if (action === "updateEmployees") {
        var sheet = ss.getSheetByName("Employees") || ss.insertSheet("Employees");
        var names = JSON.parse(e.parameter.employees);
        sheet.clear(); 
        sheet.appendRow(["Employee Name"]);
        names.forEach(function(name) {
          sheet.appendRow([name]);
        });
        return ContentService.createTextOutput("Employees updated");
      }
      
      if (action === "updateInventory") {
        var sheet = ss.getSheetByName("Inventory") || ss.insertSheet("Inventory");
        var inventoryData = JSON.parse(e.parameter.inventory);
        sheet.clear();
        sheet.appendRow(["Item Name", "Quantity", "Unit", "Min Threshold"]);
        inventoryData.forEach(function(item) {
          sheet.appendRow(item);
        });
        return ContentService.createTextOutput("Inventory updated");
      }
      
      return ContentService.createTextOutput("Invalid action");
    }
    ```

4.  **Deploy Apps Script:**
    *   กดปุ่ม `Deploy` (มุมขวาบน) > `New deployment`
    *   เลือก `Web app`
    *   ตั้งค่า `Execute as:` เป็น `Me` และ `Who has access:` เป็น `Anyone`
    *   กด `Deploy` แล้วคัดลอก `Web app URL` มาใส่ใน `.env` (ตัวแปร `GOOGLE_SHEETS_WEB_APP_URL`)

## การ Deploy บน Vercel (รัน 24 ชม.)

1.  **สร้าง GitHub Repository ใหม่:** (ถ้ายังไม่มี) เช่น `IVY-WEB`
2.  **Push โค้ดขึ้น GitHub:**

    ```bash
    git init
    git remote add origin https://github.com/FUJII-573/IVY-WEB.git
    git add .
    git commit -m "Initial commit for restaurant requisition system"
    git push -u origin main
    ```

3.  **เชื่อมต่อกับ Vercel:**
    *   ไปที่ [Vercel.com](https://vercel.com) ล็อกอินด้วย GitHub
    *   Import โปรเจกต์ `IVY-WEB`
    *   **Build & Development Settings:**
        *   **Install Command:** `npm install --legacy-peer-deps`
        *   **Output Directory:** `dist/public`
    *   **Environment Variables:** เพิ่มค่าทั้งหมดจากไฟล์ `.env` ของคุณ
    *   กด `Deploy`

เมื่อ Deploy สำเร็จ คุณจะได้ลิงก์เว็บที่รันตลอด 24 ชั่วโมงครับ!
"# IVY-WEB" 
