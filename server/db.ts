import { eq, desc, and, sql } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, employees, InsertEmployee, requisitions, InsertRequisition, inventory, InsertInventory } from "../drizzle/schema";
import { sendDiscordNotification } from "./_core/notification";
import { ENV } from './_core/env';

const GOOGLE_SHEETS_WEB_APP_URL = process.env.GOOGLE_SHEETS_WEB_APP_URL;

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
      where: eq(inventory.name, item.name),
    });
    if (!existingItem) {
      await db.insert(inventory).values(item);
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
    await syncEmployeesToGoogleSheets();
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
    await syncEmployeesToGoogleSheets();
    return result;
  } catch (error) {
    console.error("[Database] Failed to delete employee:", error);
    throw error;
  }
}

export async function syncEmployeesToGoogleSheets() {
  try {
    const db = await getDb();
    if (!db) {
      console.warn("[Database] Cannot sync employees: database not available");
      return;
    }

    const employeeList = await db.select().from(employees);
    const names = employeeList.map(e => e.name);

    if (!GOOGLE_SHEETS_WEB_APP_URL) return;

    await fetch(GOOGLE_SHEETS_WEB_APP_URL, {
      method: "POST",
      mode: "no-cors",
      body: new URLSearchParams({
        action: "updateEmployees",
        employees: JSON.stringify(names),
      }),
    });

    console.log("[Database] Synced employees to Google Sheets");
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
    await syncInventoryToGoogleSheets();
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
    await syncInventoryToGoogleSheets();
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
    await syncInventoryToGoogleSheets();
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
    await syncInventoryToGoogleSheets();
    return { success: true };
  } catch (error) {
    console.error("[Database] Failed to subtract inventory:", error);
    throw error;
  }
}

export async function syncInventoryToGoogleSheets() {
  try {
    const db = await getDb();
    if (!db) {
      console.warn("[Database] Cannot sync inventory: database not available");
      return;
    }

    const inventoryList = await db.select().from(inventory);
    const data = inventoryList.map(item => [item.itemName, item.quantity, item.unit, item.minThreshold]);

    if (!GOOGLE_SHEETS_WEB_APP_URL) return;

    await fetch(GOOGLE_SHEETS_WEB_APP_URL, {
      method: "POST",
      mode: "no-cors",
      body: new URLSearchParams({
        action: "updateInventory",
        inventory: JSON.stringify(data),
      }),
    });

    console.log("[Database] Synced inventory to Google Sheets");
  } catch (error) {
    console.error("[Database] Failed to sync inventory to Google Sheets:", error);
  }
}

// Requisitions management
async function sendDiscordNotification(data: InsertRequisition) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn("[Discord] Webhook URL not configured, skipping notification");
    return;
  }

  try {
    const message = {
      embeds: [
        {
          title: "📢 มีรายการเบิกวัตถุดิบใหม่!",
          color: 3447003, // Blue
          fields: [
            {
              name: "👤 ผู้เบิก",
              value: data.employeeName,
              inline: true,
            },
            {
              name: "📦 วัตถุดิบ",
              value: `${data.itemName} (${data.quantity} ${data.unit})`,
              inline: true,
            },
            {
              name: "📝 หมายเหตุ",
              value: data.note || "-",
            },
          ],
          timestamp: new Date().toISOString(),
          footer: {
            text: "ระบบเบิกวัตถุดิบร้านอาหาร",
          },
        },
      ],
    };

    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });
    console.log("[Discord] Notification sent successfully");
  } catch (error) {
    console.error("[Discord] Failed to send notification:", error);
  }
}

export async function createRequisition(data: {
  employeeName: string;
  items: { inventoryId: number; name: string; quantity: number; unit: string }[];
  note?: string;
}) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create requisition: database not available");
    throw new Error("Database not available");
  }

  try {
    // ตรวจสอบสต็อกก่อนเบิก
    // ตรวจสอบสต็อกก่อนเบิก
    for (const item of data.items) {
      const stockItem = await db.query.inventory.findFirst({
        where: eq(inventory.id, item.inventoryId),
      });
      if (!stockItem || stockItem.quantity < item.quantity) {
        throw new Error(`วัตถุดิบ ${item.name} ไม่เพียงพอ หรือไม่พบรายการ`);
      }
    }

    // ตัดสต็อก
    for (const item of data.items) {
      await db.update(inventory)
        .set({ quantity: sql`${inventory.quantity} - ${item.quantity}` })
        .where(eq(inventory.id, item.inventoryId));
    }

    // สร้างรายการเบิกจ่าย
    const requisitionId = createId();
    await db.insert(requisitions).values({
      id: requisitionId,
      employeeName: data.employeeName,
      items: JSON.stringify(data.items),
      note: data.note,
      totalAmount: data.items.reduce((sum, item) => sum + (item.quantity * (stockMap[item.inventoryId]?.price || 0)), 0), // Calculate total amount based on current stock prices
      itemName: data.items.map(item => item.name).join(', '),
      quantity: data.items.reduce((sum, item) => sum + item.quantity, 0),
      unit: data.items.map(item => item.unit).join(', '),
    });

    // ส่งแจ้งเตือน Discord
    sendDiscordNotification({
      id: requisitionId,
      employeeName: data.employeeName,
      itemName: data.items.map(item => item.name).join(', '),
      quantity: data.items.reduce((sum, item) => sum + item.quantity, 0),
      unit: data.items.map(item => item.unit).join(', '),
      note: data.note,
      createdAt: new Date(),
      status: 'pending',
    }).catch(console.error);

    // ซิงค์ Inventory ไปยัง Google Sheets หลังจากตัดสต็อก
    await syncInventoryToGoogleSheets();

    // ซิงค์ Requisition ไปยัง Google Sheets
    try {
      const orderStr = data.items.map((i) => `${i.name} x ${i.quantity}`).join(", ");
      await fetch(GOOGLE_SHEETS_WEB_APP_URL, {
        method: "POST",
        mode: "no-cors",
        body: new URLSearchParams({
          action: "addRequisition",
          employee: data.employeeName,
          order: orderStr,
          note: data.note || "",
          total: "0", // หรือคำนวณราคาถ้ามี
        }),
      });
      console.log("[Database] Synced requisition to Google Sheets");
    } catch (sheetError) {
      console.error("[Database] Failed to sync requisition to Google Sheets:", sheetError);
    }

    return { success: true, requisitionId };
  } catch (error) {
    console.error("[Database] Failed to create requisition:", error);
    throw error;
  }
}

export async function getRequisitions(limit: number = 50, offset: number = 0) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get requisitions: database not available");
    return [];
  }

  try {
    const result = await db
      .select()
      .from(requisitions)
      .orderBy(desc(requisitions.createdAt))
      .limit(limit)
      .offset(offset);
    return result;
  } catch (error) {
    console.error("[Database] Failed to get requisitions:", error);
    return [];
  }
}

export async function getRequisitionById(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get requisition: database not available");
    return undefined;
  }

  try {
    const result = await db
      .select()
      .from(requisitions)
      .where(eq(requisitions.id, id))
      .limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get requisition:", error);
    throw error;
  }
}

export async function updateRequisitionStatus(id: number, status: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update requisition: database not available");
    throw new Error("Database not available");
  }

  try {
    const result = await db
      .update(requisitions)
      .set({ status: status as any })
      .where(eq(requisitions.id, id));
    return result;
  } catch (error) {
    console.error("[Database] Failed to update requisition:", error);
    throw error;
  }
}

export async function getDashboardStats() {
  const db = await getDb();
  if (!db) {
    return {
      totalRequisitions: 0,
      totalAmount: 0,
      statusCounts: [],
      recentRequisitions: [],
    };
  }

  try {
    const allRequisitions = await db.select().from(requisitions);
    
    const totalRequisitions = allRequisitions.length;
    const totalAmount = allRequisitions.reduce((sum, r) => sum + r.quantity, 0); // เปลี่ยนเป็น quantity
    
    const statusMap = allRequisitions.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusCounts = Object.entries(statusMap).map(([status, count]) => ({
      status,
      count,
    }));

    const recentRequisitions = await db
      .select()
      .from(requisitions)
      .orderBy(desc(requisitions.createdAt))
      .limit(5);

    return {
      totalRequisitions,
      totalAmount,
      statusCounts,
      recentRequisitions,
    };
  } catch (error) {
    console.error("[Database] Failed to get dashboard stats:", error);
    throw error;
  }
}
