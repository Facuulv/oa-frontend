const MAX_BYTES = 5 * 1024 * 1024;

import apiClient from "@/services/apiClient";
import { apiPaths } from "@/config/apiPaths";

/**
 * Indica si el backend puede recibir subidas (siempre true en cliente;
 * el error real llega del API si falta FILES_* en el servidor).
 */
export function isFileUploadConfigured() {
  return true;
}

/**
 * Sube una imagen al backend OA! (POST /admin/upload-imagen).
 * Requiere sesión admin (cookie httpOnly).
 *
 * @param {File} file
 * @returns {Promise<{ url: string, publicId: string }>}
 */
export async function uploadImageToFileServer(file) {
  if (!file || !(file instanceof File)) {
    throw new Error("No se seleccionó ningún archivo.");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("El archivo debe ser una imagen.");
  }

  if (file.size > MAX_BYTES) {
    throw new Error("La imagen no puede superar 5 MB.");
  }

  const body = new FormData();
  body.append("imagen", file);

  let response;
  try {
    response = await apiClient.post(apiPaths.admin.uploadImagen, body, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  } catch (err) {
    const msg =
      err.response?.data?.error ||
      err.response?.data?.message ||
      err.message ||
      "No se pudo subir la imagen.";
    throw new Error(typeof msg === "string" ? msg : "No se pudo subir la imagen.");
  }

  const imagenUrl = response.data?.data?.imagen_url;
  if (!imagenUrl) {
    throw new Error("Respuesta inválida del servidor.");
  }

  return {
    url: imagenUrl,
    publicId: response.data?.data?.public_id ?? "",
  };
}
