require("dotenv").config({ path: ".env.local" });

const express = require("express");
const cors = require("cors");

const { getPool } = require("./db/pool");
const createCategoriasRouter = require("./routes/categorias");
const createProductosRouter = require("./routes/productos");

const PORT = Number(process.env.PORT || 3001);

async function start() {
  const app = express();

  // Middlewares SIEMPRE arriba de rutas
  app.use(express.json({ limit: "1mb" }));
  app.use(
    cors({
      origin: ["http://localhost:3000"],
      credentials: true,
    })
  );

  const pool = getPool();

  // Health check
  app.get("/health", (_req, res) => res.json({ ok: true }));

  // Rutas públicas (Regla de oro: acceso directo)
  const categoriasRouter = createCategoriasRouter({ pool });
  const productosRouter = createProductosRouter({ pool });

  // Requisito: montaje directo /categorias y /productos
  app.use("/categorias", categoriasRouter);
  app.use("/productos", productosRouter);

  console.log("Rutas cargadas correctamente");
  console.log("- GET /categorias");
  console.log("- GET /productos");

  // Debug de 404: ver qué path está entrando realmente
  app.use((req, _res, next) => {
    if (process.env.NODE_ENV !== "production") {
      console.info("[REQ]", req.method, req.path);
    }
    next();
  });

  // 404 handler
  app.use((req, res) => {
    console.warn("[404]", req.method, req.path);
    res.status(404).json({ error: "NOT_FOUND", message: `Cannot ${req.method} ${req.path}` });
  });

  // Error handler
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    console.error("[UNHANDLED] error:", err);
    res.status(500).json({ error: "ERROR_INTERNO", message: "Error interno del servidor" });
  });

  app.listen(PORT, () => {
    console.info(`[BACKEND] escuchando en http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("[BOOT] No se pudo iniciar el servidor:", err);
  process.exit(1);
});

