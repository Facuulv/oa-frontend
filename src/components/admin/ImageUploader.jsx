"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2, Camera } from "lucide-react";
import { toast } from "sonner";
import { uploadImageToCloudinary, isCloudinaryUploadConfigured } from "@/lib/cloudinaryUpload";
import { PLACEHOLDER_PRODUCT_CARD } from "@/constants/images";

/**
 * Subida directa a Cloudinary (preset sin firma, solo fetch).
 * Controlado: `value` / `onChange` guardan la `secure_url` (p. ej. imagen_url en el formulario).
 */
export default function ImageUploader({
  value = "",
  onChange,
  onBlur,
  disabled = false,
  label = "Imagen",
  helperText,
  onUploadingChange,
}) {
  const inputId = useId();
  const fileRef = useRef(null);
  const blobUrlRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [localPreview, setLocalPreview] = useState(null);

  const configured = isCloudinaryUploadConfigured();
  const blocked = disabled || !configured;
  const previewSrc = localPreview || value || null;

  const revokeBlob = useCallback(() => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    setLocalPreview(null);
  }, []);

  useEffect(() => {
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
  }, []);

  const setUploadingState = useCallback(
    (next) => {
      setUploading(next);
      onUploadingChange?.(next);
    },
    [onUploadingChange],
  );

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || blocked) return;

    setUploadError(null);
    revokeBlob();

    let objectUrl = null;
    try {
      objectUrl = URL.createObjectURL(file);
      blobUrlRef.current = objectUrl;
      setLocalPreview(objectUrl);

      setUploadingState(true);
      const { url } = await uploadImageToCloudinary(file);
      onChange?.(url);
      toast.success("Imagen subida");
      revokeBlob();
    } catch (err) {
      const msg = err?.message || "Error al subir la imagen";
      setUploadError(msg);
      toast.error(msg);
    } finally {
      setUploadingState(false);
    }
  };

  const handleRemove = () => {
    setUploadError(null);
    revokeBlob();
    onChange?.("");
  };

  const openPicker = () => {
    if (blocked || uploading) return;
    fileRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={inputId} className="text-sm font-medium text-zinc-800">
          {label}
        </label>
        {!configured && (
          <span className="text-xs text-amber-700">Cloudinary no configurado</span>
        )}
      </div>

      <input
        ref={fileRef}
        id={inputId}
        type="file"
        accept="image/*"
        className="sr-only"
        aria-label={`${label}: elegir archivo de imagen`}
        disabled={blocked || uploading}
        onBlur={onBlur}
        onChange={handleFile}
      />

      <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 shadow-inner">
        <div className="flex min-h-[160px] items-center justify-center p-3 sm:min-h-[180px]">
          {previewSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewSrc}
              alt=""
              className={`max-h-48 w-full rounded-xl object-contain ${uploading ? "opacity-45" : ""}`}
              onError={(ev) => {
                ev.currentTarget.src = PLACEHOLDER_PRODUCT_CARD;
              }}
            />
          ) : (
            <div className="flex flex-col items-center gap-3 py-8 text-center text-zinc-500">
              <ImagePlus className="h-12 w-12 opacity-55" strokeWidth={1.5} aria-hidden />
              <p className="text-sm">Sin imagen</p>
              <p className="text-xs text-zinc-400">Galería o cámara</p>
            </div>
          )}
        </div>

        {uploading && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/85 backdrop-blur-[2px]"
            aria-live="polite"
            aria-busy="true"
          >
            <Loader2 className="h-9 w-9 animate-spin text-primary" aria-hidden />
            <span className="text-base font-medium text-zinc-800">Subiendo…</span>
          </div>
        )}
      </div>

      {uploadError && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {uploadError}
        </p>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          onClick={openPicker}
          disabled={blocked || uploading}
          className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-base font-semibold text-white transition enabled:active:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Camera className="h-5 w-5 shrink-0" aria-hidden />
          {value || localPreview ? "Reemplazar imagen" : "Elegir imagen"}
        </button>
        {(value || localPreview) && !uploading && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={blocked}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border-2 border-zinc-300 bg-white px-4 text-base font-semibold text-zinc-800 transition enabled:active:bg-zinc-50 disabled:opacity-50"
          >
            <Trash2 className="h-5 w-5" aria-hidden />
            Quitar
          </button>
        )}
      </div>

      {helperText && <p className="text-xs text-zinc-500">{helperText}</p>}
      {!configured && (
        <p className="text-xs text-zinc-600">
          Agregá en <code className="rounded bg-zinc-200 px-1">.env.local</code> las variables{" "}
          <code className="rounded bg-zinc-200 px-1">NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME</code> y{" "}
          <code className="rounded bg-zinc-200 px-1">NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET</code>{" "}
          (preset sin firma, solo subida).
        </p>
      )}
    </div>
  );
}
