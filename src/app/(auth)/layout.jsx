import AppViewport from "@/components/layout/AppViewport";

export default function AuthLayout({ children }) {
  return (
    <AppViewport
      variant="auth"
      innerClassName="relative flex min-h-dvh flex-col overflow-x-hidden bg-gradient-to-b from-red-50/70 via-background to-background lg:bg-[linear-gradient(165deg,#f8f8f9_0%,var(--background)_48%,#ececee_100%)]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[min(42vmin,320px)] bg-[radial-gradient(ellipse_at_top,rgba(193,18,31,0.16),transparent_68%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 top-[12%] hidden h-44 w-44 rounded-full bg-primary/[0.07] blur-3xl sm:block lg:right-[8%] lg:top-[18%] lg:h-64 lg:w-64"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-12 bottom-[10%] hidden h-36 w-36 rounded-full bg-primary/[0.05] blur-3xl sm:block lg:bottom-[14%] lg:left-[6%] lg:h-56 lg:w-56"
      />
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-5 sm:px-6 sm:py-8 lg:py-10">
        <div className="w-full max-w-[400px] sm:max-w-[420px] lg:max-w-[440px]">{children}</div>
      </div>
    </AppViewport>
  );
}
