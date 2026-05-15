import AppViewport from "@/components/layout/AppViewport";
import { Loader2 } from "lucide-react";

export default function AdminPanelLoading() {
  return (
    <AppViewport
      variant="admin"
      innerClassName="flex flex-col items-center justify-center gap-3 overflow-hidden bg-[#ececec] px-6 text-center ring-1 ring-black/5"
    >
      <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden />
      <p className="text-sm text-zinc-600">Cargando panel...</p>
    </AppViewport>
  );
}
