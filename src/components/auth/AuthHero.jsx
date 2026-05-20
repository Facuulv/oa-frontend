import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { AUTH_LOGO_SRC } from "@/components/auth/authForm";

/**
 * Hero de marca para pantallas auth.
 * @param {boolean} [showBebidas=true] Muestra el wordmark "Bebidas" junto al logo.
 */
export default function AuthHero({
  tagline = "Un mundo de bebidas",
  subtext = "Accedé para realizar tus pedidos",
  showBebidas = true,
}) {
  return (
    <header className="mb-4 flex flex-col items-center text-center sm:mb-5">
      <Link
        href="/"
        className={cn(
          "inline-flex shrink-0 items-center justify-center",
          showBebidas ? "gap-2 sm:gap-2.5" : "mb-0.5",
        )}
        aria-label="Ir al inicio de OA! Bebidas"
      >
        <Image
          src={AUTH_LOGO_SRC}
          alt=""
          width={200}
          height={100}
          priority
          className={cn(
            "block w-auto object-contain object-center drop-shadow-[0_1px_1px_rgba(193,18,31,0.08)]",
            showBebidas
              ? "h-10 max-w-[6.5rem] shrink-0 translate-y-px sm:h-11 sm:max-w-[7rem] sm:translate-y-[2px] lg:h-12 lg:max-w-[7.5rem] lg:translate-y-[2px]"
              : "h-11 max-w-[7.5rem] sm:h-12 sm:max-w-[8.25rem] lg:h-14 lg:max-w-[9rem]",
          )}
          sizes={showBebidas ? "(max-width: 640px) 104px, 120px" : "(max-width: 640px) 120px, 144px"}
        />
        {showBebidas ? (
          <span className="text-[1.5rem] font-bold leading-none tracking-tight text-foreground sm:text-[1.625rem] lg:text-[1.75rem]">
            Bebidas
          </span>
        ) : null}
      </Link>
      {tagline ? (
        <p className="mt-2 text-[1.0625rem] font-semibold tracking-tight text-foreground">{tagline}</p>
      ) : null}
      {subtext ? (
        <p className="mx-auto mt-1 max-w-[18rem] text-[0.8125rem] leading-snug text-zinc-500">{subtext}</p>
      ) : null}
    </header>
  );
}
