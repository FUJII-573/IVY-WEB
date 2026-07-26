import express, { type Request, Response, NextFunction } from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import path from "path";

const app = express();

// Middleware สำหรับ parse JSON และ urlencoded
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logging Middleware
app.use((req, res, next) => {
  const start = Date.now();
  const pathName = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (pathName.startsWith("/api")) {
      let logLine = `${req.method} ${pathName} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      console.log(logLine);
    }
  });

  next();
});

(async () => {
  // Global Error Handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });

  const isDev = process.env.NODE_ENV !== "production";

  if (isDev) {
    // ดึง Vite Dev Middleware มาผูกกับ Express สำหรับโหมด Development
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
    });

    app.use(vite.middlewares);

    app.use("*", async (req, res, next) => {
      const url = req.originalUrl;
      try {
        // อ่านไฟล์ index.html จากโฟลเดอร์ client (หรือ root)
        let templatePath = path.resolve(process.cwd(), "client", "index.html");
        if (!fs.existsSync(templatePath)) {
          templatePath = path.resolve(process.cwd(), "index.html");
        }

        let template = fs.readFileSync(templatePath, "utf-8");
        // แปลงไฟล์ index.html ให้ Vite ประมวลผล JS/TS
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    // โหมด Production
    const distPublicPath = path.resolve(process.cwd(), "dist", "public");
    app.use(express.static(distPublicPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPublicPath, "index.html"));
    });
  }

  const PORT = Number(process.env.PORT) || 5001;

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on http://localhost:${PORT}/`);
  });
})();