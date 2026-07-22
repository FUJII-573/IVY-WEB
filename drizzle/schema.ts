import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const employees = mysqlTable("employees", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = typeof employees.$inferInsert;

export const inventory = mysqlTable("inventory", {
  id: int("id").autoincrement().primaryKey(),
  itemName: varchar("itemName", { length: 255 }).notNull().unique(),
  quantity: int("quantity").default(0).notNull(),
  unit: varchar("unit", { length: 50 }).notNull(), // เช่น กก., ลัง, กระสอบ
  minThreshold: int("minThreshold").default(5).notNull(), // จุดแจ้งเตือนของใกล้หมด
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Inventory = typeof inventory.$inferSelect;
export type InsertInventory = typeof inventory.$inferInsert;

export const requisitions = mysqlTable("requisitions", {
  id: int("id").autoincrement().primaryKey(),
  employeeName: varchar("employeeName", { length: 255 }).notNull(),
  // items: text("items").notNull(), // JSON string of items - เปลี่ยนเป็น itemId และ quantity
  itemId: int("itemId").notNull(),
  itemName: varchar("itemName", { length: 255 }).notNull(), // เก็บชื่อ item ไว้ด้วยเผื่อ item ถูกลบ
  quantity: int("quantity").notNull(),
  note: text("note"),
  status: mysqlEnum("status", ["pending", "approved", "completed", "cancelled"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Requisition = typeof requisitions.$inferSelect;
export type InsertRequisition = typeof requisitions.$inferInsert;
