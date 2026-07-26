import { requisitions, InsertRequisition } from "../drizzle/schema";
// Mock db object to prevent crash if not connected
const db = { insert: () => ({ values: () => [ { insertId: Date.now() } ] }) } as any;

const GOOGLE_SHEETS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycby38skPqEuxtsuthw8h_2ehrce30i-KKlIOonhjWcSiqqPCnWEINkmv5bcKj1LT-EUxaw/exec";

export async function createRequisition(data: InsertRequisition & { employeeName: string, itemName: string }) {
  try {
    // 1. บันทึกลงฐานข้อมูลหลัก (ถ้ามี)
    let recordId = Date.now();
    try {
      const [result] = await db.insert(requisitions).values({
        employeeId: data.employeeId || 1,
        inventoryId: data.inventoryId || 1,
        quantity: data.quantity,
        note: data.note || "",
        status: "completed",
        createdAt: new Date()
      });
      recordId = result.insertId;
    } catch (dbErr) {
      console.error("DB Insert Error (Ignored for Sheets Sync):", dbErr);
    }

    // 2. ส่งข้อมูลไปยัง Google Sheets (แบบ JSON)
    if (GOOGLE_SHEETS_WEB_APP_URL) {
      const payload = {
        action: "addRequisition",
        name: data.employeeName,
        order: data.itemName, // รายการอาหารที่รวมมาแล้ว
        note: data.note || "-",
        total: data.quantity.toString()
      };

      console.log("Syncing to Sheets:", payload);

      // ส่งแบบ Non-blocking (ไม่ต้องรอให้ Sheet ตอบกลับ หน้าเว็บจะได้ไม่ค้าง)
      fetch(GOOGLE_SHEETS_WEB_APP_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload)
      }).catch(err => console.error("Google Sheets Sync Error:", err));
    }

    return { id: recordId, ...data };
  } catch (error) {
    console.error("Critical Error in createRequisition:", error);
    return { id: Date.now(), ...data };
  }
}

// ฟังก์ชันอื่นๆ (Mocked หรือคงเดิมตามความจำเป็นของระบบ)
export async function getInventory() { return []; }
export async function getEmployees() { return []; }
export async function syncInventoryToGoogleSheets() {}
export async function syncEmployeesToGoogleSheets() {}