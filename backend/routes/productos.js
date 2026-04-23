const express = require("express");

module.exports = function createProductosRouter({ pool }) {
  const router = express.Router();

  router.get("/", async (req, res) => {
    const { categoriaId, destacado } = req.query;

    try {
      const columnas = [
        "id",
        "categoria_id",
        "nombre",
        "descripcion",
        "precio",
        "stock",
        "imagen_url",
        "destacado",
        "disponible",
        "activo",
      ].join(", ");

      let sql = `SELECT ${columnas} FROM productos WHERE 1=1`;
      const params = [];

      if (categoriaId != null && String(categoriaId).trim() !== "") {
        sql += " AND categoria_id = ?";
        params.push(categoriaId);
      }

      const dest = destacado != null ? String(destacado).trim() : "";
      if (dest === "1" || dest === "true") {
        sql += " AND destacado = 1";
      }

      const [rows] = await pool.query(sql, params);
      return res.json(Array.isArray(rows) ? rows : []);
    } catch (error) {
      console.error("[GET /productos] error:", error);
      return res.status(500).json({
        error: "ERROR_PRODUCTOS",
        message: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  });

  return router;
};

