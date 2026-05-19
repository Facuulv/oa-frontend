import { AlertCircle } from "lucide-react";

export default function ProfileIncompleteBanner() {
  return (
    <div
      className="mb-4 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
      role="status"
    >
      <AlertCircle size={18} className="mt-0.5 shrink-0 text-amber-600" aria-hidden />
      <p>Completá tus datos para agilizar futuros pedidos.</p>
    </div>
  );
}
