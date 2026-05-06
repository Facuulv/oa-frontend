import AppViewport from "@/components/layout/AppViewport";

export default function AuthSegmentLayout({ children }) {
  return (
    <AppViewport variant="auth" innerClassName="flex min-h-[100dvh] flex-col overflow-hidden bg-surface ring-1 ring-black/5">
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </AppViewport>
  );
}
