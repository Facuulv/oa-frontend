import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/cn";

export default function ProfileIncompleteBanner({ className }) {
  return (
    <div
      className={cn(
        "flex gap-3 rounded-2xl border border-amber-200/90 bg-amber-50 px-4 py-3 text-sm text-amber-900",
        className,
      )}
      role="status"
    >
      <AlertCircle
        size={18}
        className="mt-0.5 shrink-0 text-amber-600"
        aria-hidden
      />
      <p>Completá tus datos para agilizar futuros pedidos.</p>
    </div>
  );
}
