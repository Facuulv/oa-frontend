const express = require("express");

module.exports = function createCategoriasRouter({ pool }) {
  const router = express.Router();

  router.get("/", async (_req, res) => {
    try {
      const columnas = ["id", "nombre", "descripcion", "imagen_url", "activo"].join(", ");
      const sql = `SELECT ${columnas} FROM categorias WHERE activo = 1 ORDER BY nombre ASC`;
      const [rows] = await pool.query(sql);
      return res.json(Array.isArray(rows) ? rows : []);
    } catch (error) {
      console.error("[GET /categorias] error:", error);
      return res.status(500).json({
        error: "ERROR_CATEGORIAS",
        message: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  });

  return router;
};

