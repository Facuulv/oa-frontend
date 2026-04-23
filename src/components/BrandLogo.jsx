import Image from "next/image";
import Link from "next/link";

const LOGO_SRC = "/images/logo-oa.png";

/**
 * Marca OA! para headers (PNG con fondo transparente).
 */
export default function BrandLogo({
  href = "/",
  className = "",
  imgClassName = "h-12 w-auto max-h-12 object-contain object-left",
  priority = false,
  ariaLabel = "Inicio",
}) {
  return (
    <Link
      href={href}
      className={`relative inline-flex shrink-0 items-center ${className}`}
      aria-label={ariaLabel}
    >
      <Image
        src={LOGO_SRC}
        alt=""
        width={200}
        height={100}
        priority={priority}
        className={imgClassName}
        sizes="200px"
      />
    </Link>
  );
}
