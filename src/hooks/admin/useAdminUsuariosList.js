import { useCallback } from "react";
import { listUsuarios } from "@/services/adminUsuariosService";
import { useAdminPaginatedList } from "@/hooks/admin/useAdminPaginatedList";

/**
 * Listado paginado de usuarios del panel (`GET /users`).
 *
 * @param {object} opts
 * @param {number} opts.page
 * @param {number} opts.pageSize
 * @param {string} opts.q búsqueda (nombre, apellido, email, DNI, teléfono)
 * @param {string} opts.rol '' | 'ADMIN' | 'ENCARGADO' | 'VENDEDOR'
 * @param {'all'|'true'|'false'} opts.estadoActivo
 * @param {(params: Record<string, unknown>) => Promise<{ usuarios: object[], pagination: object }>} [opts.listFn]
 * @param {boolean} [opts.enabled] si es false, no llama al API (p. ej. usuario sin permiso en la ruta).
 */
export function useAdminUsuariosList({
  page,
  pageSize,
  q,
  rol,
  estadoActivo,
  listFn = listUsuarios,
  enabled = true,
}) {
  const fetchPage = useCallback(async () => {
    const params = {
      page,
      limit: pageSize,
    };
    const trimmed = typeof q === "string" ? q.trim() : "";
    if (trimmed) params.q = trimmed;
    if (rol) params.rol = rol;
    if (estadoActivo === "true") params.activo = "1";
    if (estadoActivo === "false") params.activo = "0";

    const { usuarios, pagination } = await listFn(params);
    return {
      items: Array.isArray(usuarios) ? usuarios : [],
      pagination,
    };
  }, [page, pageSize, q, rol, estadoActivo, listFn]);

  return useAdminPaginatedList({
    page,
    pageSize,
    enabled,
    fetchPage,
  });
}
