const MAX_BYTES = 5 * 1024 * 1024;

export function isCloudinaryUploadConfigured() {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim();
  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET?.trim();
  return Boolean(cloud && preset);
}

/**
 * Sube un archivo de imagen directamente a Cloudinary (unsigned preset).
 * No usa el backend OA!.
 *
 * @param {File} file
 * @returns {Promise<{ url: string, publicId: string }>}
 */
export async function uploadImageToCloudinary(file) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim();
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET?.trim();

  if (!cloudName || !uploadPreset) {
    throw new Error(
      "Falta configuración de Cloudinary (NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME y NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET).",
    );
  }

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
  body.append("file", file);
  body.append("upload_preset", uploadPreset);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body,
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = json?.error?.message || json?.error || `Error HTTP ${res.status}`;
    throw new Error(typeof msg === "string" ? msg : "No se pudo subir la imagen.");
  }

  if (!json.secure_url) {
    throw new Error("Respuesta inválida de Cloudinary.");
  }

  return {
    url: json.secure_url,
    publicId: json.public_id ?? "",
  };
}
