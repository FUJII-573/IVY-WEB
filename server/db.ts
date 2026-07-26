import { eq, desc, and, sql } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, employees, InsertEmployee, requisitions, InsertRequisition, inventory, InsertInventory } from "../drizzle/schema";
import { ENV } from './_core/env';

const GOOGLE_SHEETS_WEB_APP_URL = process.env.GOOGLE_SHEETS_WEB_APP_URL || "https://script.google.com/macros/s/AKfycbwzxbm39vdshiMSNr1RiEuuSdjkQ60xe6vjqJzpcfzL2QEWDjiJeyX5183-XCfAd2_lJA/exec";

// Initial German Menu Data
const initialGermanMenu = [
  // Special German Menu (จานละ 300$)
  { name: "The Ivy : Smoked Salmon", category: "Special German Menu", quantity: 100, unit: "จาน", price: 300, imageUrl: "" },
  { name: "The Ivy : Wurstplatte", category: "Special German Menu", quantity: 100, unit: "จาน", price: 300, imageUrl: "" },
  { name: "The Ivy : Kartoffelsuppe", category: "Special German Menu", quantity: 100, unit: "จาน", price: 300, imageUrl: "" },
  { name: "The Ivy : Black Forest Cake", category: "Special German Menu", quantity: 100, unit: "จาน", price: 300, imageUrl: "" },
  { name: "The Ivy : Bienenstich", category: "Special German Menu", quantity: 100, unit: "จาน", price: 300, imageUrl: "" },
  { name: "The Ivy : Green Apple Sorbet", category: "Special German Menu", quantity: 100, unit: "จาน", price: 300, imageUrl: "" },
  { name: "The Ivy : Schweinshaxe", category: "Special German Menu", quantity: 100, unit: "จาน", price: 300, imageUrl: "" },
  { name: "The Ivy : Sauerbraten", category: "Special German Menu", quantity: 100, unit: "จาน", price: 300, imageUrl: "" },

  // Special German Beverages (แก้ว/ขวดละ 200$)
  { name: "The Ivy : Apfelschorle - non alc.", category: "Special German Beverages", quantity: 100, unit: "แก้ว/ขวด", price: 200, imageUrl: "" },
  { name: "The Ivy : Weihenstephaner", category: "Special German Beverages", quantity: 100, unit: "แก้ว/ขวด", price: 200, imageUrl: "" },
  { name: "The Ivy : Riesling", category: "Special German Beverages", quantity: 100, unit: "แก้ว/ขวด", price: 200, imageUrl: "" },
  { name: "The Ivy : Kirschwasser", category: "Special German Beverages", quantity: 100, unit: "แก้ว/ขวด", price: 200, imageUrl: "" },

  // Set Menu (เซตเมนูสุดคุ้ม)
  { name: "ALL SPECIAL GERMAN SET", category: "Set Menu", quantity: 100, unit: "เซต", price: 3500, imageUrl: "" },
  { name: "GERMANY DESSERTS SET", category: "Set Menu", quantity: 100, unit: "เซต", price: 600, imageUrl: "" },
  { name: "CHILLING WITH YOU", category: "Set Menu", quantity: 100, unit: "เซต", price: 1600, imageUrl: "" },
];

export async function seedInventory() {
  console.log("Seeding initial inventory data...");
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot seed inventory: database not available");
    return;
  }
  for (const item of initialGermanMenu) {
    const existingItem = await db.query.inventory.findFirst({
      where: eq(inventory.itemName, item.name),
    });
    if (!existingItem) {
      await db.insert(inventory).values({
        itemName: item.name,
        quantity: item.quantity,
        unit: item.unit,
        minThreshold: 5
      });
      console.log(`Added ${item.name} to inventory.`);
    } else {
      console.log(`${item.name} already exists, skipping.`);
    }
  }
  console.log("Inventory seeding complete.");
}


let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Employees management
export async function getAllEmployees() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get employees: database not available");
    return [];
  }

  try {
    const result = await db.select().from(employees);
    return result;
  } catch (error) {
    console.error("[Database] Failed to get employees:", error);
    return [];
  }
}

export async function addEmployee(name: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot add employee: database not available");
    throw new Error("Database not available");
  }

  try {
    const result = await db.insert(employees).values({ name });
    syncEmployeesToGoogleSheets();
    return result;
  } catch (error) {
    console.error("[Database] Failed to add employee:", error);
    throw error;
  }
}

export async function deleteEmployee(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete employee: database not available");
    throw new Error("Database not available");
  }

  try {
    const result = await db.delete(employees).where(eq(employees.id, id));
    syncEmployeesToGoogleSheets();
    return result;
  } catch (error) {
    console.error("[Database] Failed to delete employee:", error);
    throw error;
  }
}

export async function syncEmployeesToGoogleSheets() {
  try {
    const db = await getDb();
    if (!db || !GOOGLE_SHEETS_WEB_APP_URL) return;

    const employeeList = await db.select().from(employees);
    const names = employeeList.map(e => e.name);

    const params = new URLSearchParams();
    params.append("action", "updateEmployees");
    params.append("employees", JSON.stringify(names));

    fetch(GOOGLE_SHEETS_WEB_APP_URL, {
      method: "POST",
      mode: "no-cors",
      body: params,
    }).catch((err) => console.error("[Database] Sync employees error:", err));
  } catch (error) {
    console.error("[Database] Failed to sync employees to Google Sheets:", error);
  }
}

// Inventory management
export async function getAllInventory() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get inventory: database not available");
    return [];
  }
  try {
    return await db.select().from(inventory);
  } catch (error) {
    console.error("[Database] Failed to get inventory:", error);
    return [];
  }
}

export async function addInventoryItem(data: InsertInventory) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot add inventory item: database not available");
    throw new Error("Database not available");
  }
  try {
    const existingItem = await db.select().from(inventory).where(eq(inventory.itemName, data.itemName)).limit(1);
    if (existingItem.length > 0) {
      await db.update(inventory).set({ quantity: sql`${inventory.quantity} + ${data.quantity}` }).where(eq(inventory.id, existingItem[0].id));
    } else {
      await db.insert(inventory).values(data);
    }
    syncInventoryToGoogleSheets();
    return { success: true };
  } catch (error) {
    console.error("[Database] Failed to add inventory item:", error);
    throw error;
  }
}

export async function updateInventoryItem(id: number, data: Partial<InsertInventory>) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update inventory item: database not available");
    throw new Error("Database not available");
  }
  try {
    await db.update(inventory).set(data).where(eq(inventory.id, id));
    syncInventoryToGoogleSheets();
    return { success: true };
  } catch (error) {
    console.error("[Database] Failed to update inventory item:", error);
    throw error;
  }
}

export async function deleteInventoryItem(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete inventory item: database not available");
    throw new Error("Database not available");
  }
  try {
    await db.delete(inventory).where(eq(inventory.id, id));
    syncInventoryToGoogleSheets();
    return { success: true };
  } catch (error) {
    console.error("[Database] Failed to delete inventory item:", error);
    throw error;
  }
}

export async function subtractInventory(itemId: number, quantity: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot subtract inventory: database not available");
    throw new Error("Database not available");
  }
  try {
    await db.update(inventory).set({ quantity: sql`${inventory.quantity} - ${quantity}` }).where(and(eq(inventory.id, itemId), sql`${inventory.quantity} >= ${quantity}`));
    syncInventoryToGoogleSheets();
    return { success: true };
  } catch (error) {
    console.error("[Database] Failed to subtract inventory:", error);
    throw error;
  }
}

export async function syncInventoryToGoogleSheets() {
  try {
    const db = await getDb();
    if (!db || !GOOGLE_SHEETS_WEB_APP_URL) return;

    const inventoryList = await db.select().from(inventory);
    const data = inventoryList.map(item => [item.itemName, item.quantity, item.unit, item.minThreshold]);

    const params = new URLSearchParams();
    params.append("action", "updateInventory");
    params.append("inventory", JSON.stringify(data));

    fetch(GOOGLE_SHEETS_WEB_APP_URL, {
      method: "POST",
      mode: "no-cors",
      body: params,
    }).catch((err) => console.error("[Database] Sync inventory error:", err));
  } catch (error) {
    console.error("[Database] Failed to sync inventory to Google Sheets:", error);
  }
}

// Requisitions management
async function sendDiscordNotification(data: any) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    const message = {
      embeds: [
        {
          title: "📢 มีรายการเบิกวัตถุดิบใหม่!",
          color: 3447003,
          fields: [
            { name: "👤 ผู้เบิก", value: data.employeeName, inline: true },
            { name: "📦 วัตถุดิบ", value: `${data.itemName} (${data.quantity} ${data.unit})`, inline: true },
            { name: "📝 หมายเหตุ", value: data.note || "-" },
          ],
          timestamp: new Date().toISOString(),
          footer: { text: "ระบบเบิกวัตถุดิบร้านอาหาร" },
        },
      ],
    };

    fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    }).catch((err) => console.error("[Discord] Fetch error:", err));
  } catch (error) {
    console.error("[Discord] Failed to send notification:", error);
  }
}

export async function createRequisition(data: {
  employeeName: string;
  itemId: number;
  itemName: string;
  quantity: number;
  unit: string;
  note?: string;
  status?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    // 1. ตรวจสอบสต็อก (ข้าม Error ถ้าไม่มีสต็อกเพื่อให้เบิกได้เสมอ)
    try {
      const stockItem = await db.query.inventory.findFirst({
        where: eq(inventory.id, data.itemId),
      });
      
      if (stockItem && stockItem.quantity >= data.quantity) {
        // 2. ตัดสต็อกเฉพาะเมื่อมีของพอ
        await db.update(inventory)
          .set({ quantity: sql`${inventory.quantity} - ${data.quantity}` })
          .where(eq(inventory.id, data.itemId));
      }
    } catch (stockErr) {
      console.error("[Database] Stock update error (ignored):", stockErr);
    }

    // 3. บันทึกรายการเบิก
    const result = await db.insert(requisitions).values({
      employeeName: data.employeeName,
      itemId: data.itemId,
      itemName: data.itemName,
      quantity: data.quantity,
      note: data.note,
      status: (data.status as any) || "pending"
    });

    // 4. ทำงานเบื้องหลัง (ไม่รอผลลัพธ์)
    sendDiscordNotification(data);
    syncInventoryToGoogleSheets();
    
    if (GOOGLE_SHEETS_WEB_APP_URL) {
      // ส่งแบบ URLSearchParams เพื่อให้ Apps Script รับผ่าน e.parameter ได้โดยตรง
      // ซึ่งจะเสถียรกว่าการส่ง JSON ในบางกรณี
      const params = new URLSearchParams();
      params.append("action", "addRequisition");
      params.append("name", data.employeeName); 
      params.append("order", data.itemName); // data.itemName ในที่นี้คือรายการทั้งหมดที่รวมมาจากหน้าบ้านแล้ว
      params.append("note", data.note || "");
      params.append("total", data.quantity.toString()); // ส่งจำนวนรวมไปที่ช่อง TOTAL ชั่วคราวเพื่อให้เห็นตัวเลข

      fetch(GOOGLE_SHEETS_WEB_APP_URL, {
        method: "POST",
        mode: "no-cors", // ใช้ no-cors เพื่อป้องกันปัญหา CORS
        body: params,
      }).catch((err) => console.error("[Database] Google Sheets Sync Error:", err));
    }

    return { success: true };
  } catch (error) {
    console.error("[Database] createRequisition error:", error);
    throw error;
  }
}

export async function getRequisitions(limit: number = 50, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(requisitions).orderBy(desc(requisitions.createdAt)).limit(limit).offset(offset);
  } catch (error) {
    console.error("[Database] Failed to get requisitions:", error);
    return [];
  }
}

export async function getRequisitionById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  try {
    const result = await db.select().from(requisitions).where(eq(requisitions.id, id)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get requisition:", error);
    throw error;
  }
}

export async function updateRequisitionStatus(id: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    return await db.update(requisitions).set({ status: status as any }).where(eq(requisitions.id, id));
  } catch (error) {
    console.error("[Database] Failed to update requisition:", error);
    throw error;
  }
}

export async function getDashboardStats() {
  const db = await getDb();
  if (!db) return { totalRequisitions: 0, totalAmount: 0, statusCounts: [], recentRequisitions: [] };
  try {
    const allRequisitions = await db.select().from(requisitions);
    const totalRequisitions = allRequisitions.length;
    const totalAmount = allRequisitions.reduce((sum, r) => sum + r.quantity, 0);
    const statusMap = allRequisitions.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const statusCounts = Object.entries(statusMap).map(([status, count]) => ({ status, count }));
    const recentRequisitions = await db.select().from(requisitions).orderBy(desc(requisitions.createdAt)).limit(5);
    return { totalRequisitions, totalAmount, statusCounts, recentRequisitions };
  } catch (error) {
    console.error("[Database] Failed to get dashboard stats:", error);
    throw error;
  }
}
