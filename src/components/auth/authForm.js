import { cn } from "@/lib/cn";

export const AUTH_LOGO_SRC = "/images/logo-oa.png";

export const authInputBase =
  "w-full rounded-xl border bg-zinc-50 px-3 py-2.5 text-sm text-foreground outline-none transition-[border-color,box-shadow,background-color] placeholder:text-zinc-400 hover:border-zinc-300 hover:bg-white focus:border-primary focus:bg-white focus:ring-[3px] focus:ring-primary/15";

export function authInputClass(hasError) {
  return cn(
    authInputBase,
    hasError
      ? "border-red-400 bg-white focus:border-red-500 focus:ring-red-500/15"
      : "border-zinc-200",
  );
}

export const authLabelClass = "mb-1.5 block text-[0.8125rem] font-semibold text-zinc-700";

export const authPrimaryButtonClass =
  "w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-white shadow-md shadow-primary/35 transition-[transform,filter,box-shadow] hover:brightness-105 hover:shadow-lg hover:shadow-primary/40 active:scale-[0.985] active:shadow-md disabled:cursor-not-allowed disabled:opacity-55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";

export const authLinkClass =
  "font-semibold text-primary underline-offset-[3px] hover:text-primary-dark hover:underline";
