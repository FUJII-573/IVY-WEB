import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure, adminProcedure } from "./_core/trpc";
import { z } from "zod";
import { 
  getAllEmployees, 
  addEmployee, 
  deleteEmployee, 
  createRequisition, 
  getRequisitions, 
  getRequisitionById, 
  updateRequisitionStatus, 
  getDashboardStats, 
  getAllInventory, 
  addInventoryItem, 
  updateInventoryItem, 
  deleteInventoryItem 
} from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  employees: router({
    list: publicProcedure.query(async () => {
      return await getAllEmployees();
    }),
    add: adminProcedure.input(z.object({ name: z.string().min(1) })).mutation(async ({ input }) => {
      return await addEmployee(input.name);
    }),
    delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      return await deleteEmployee(input.id);
    }),
  }),

  inventory: router({
    list: publicProcedure.query(async () => {
      return await getAllInventory();
    }),
    add: adminProcedure.input(z.object({
      itemName: z.string().min(1),
      quantity: z.number().min(0),
      unit: z.string().min(1),
      minThreshold: z.number().min(0).optional(),
    })).mutation(async ({ input }) => {
      return await addInventoryItem(input);
    }),
    update: adminProcedure.input(z.object({
      id: z.number(),
      itemName: z.string().min(1).optional(),
      quantity: z.number().min(0).optional(),
      unit: z.string().min(1).optional(),
      minThreshold: z.number().min(0).optional(),
    })).mutation(async ({ input }) => {
      const { id, ...data } = input;
      return await updateInventoryItem(id, data);
    }),
    delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      return await deleteInventoryItem(input.id);
    }),
  }),

  requisitions: router({
    create: protectedProcedure
      .input(z.object({
        employeeName: z.string().min(1),
        itemId: z.number(),
        itemName: z.string().min(1),
        quantity: z.number().min(1),
        unit: z.string().min(1),
        note: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await createRequisition({
          employeeName: input.employeeName,
          itemId: input.itemId,
          itemName: input.itemName,
          quantity: input.quantity,
          unit: input.unit,
          note: input.note,
          status: "pending",
        });
      }),
    
    list: publicProcedure
      .input(z.object({
        limit: z.number().default(50),
        offset: z.number().default(0),
      }))
      .query(async ({ input }) => {
        return await getRequisitions(input.limit, input.offset);
      }),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getRequisitionById(input.id);
      }),
    
    updateStatus: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "approved", "completed", "cancelled"]),
      }))
      .mutation(async ({ input }) => {
        return await updateRequisitionStatus(input.id, input.status);
      }),
    
    getStats: adminProcedure.query(async () => {
      return await getDashboardStats();
    }),
  }),
});

export type AppRouter = typeof appRouter;
