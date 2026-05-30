import {
  CHECKOUT_CONTENT_CLASS,
  CHECKOUT_PAGE_CLASS,
  CHECKOUT_SECTION_CLASS,
} from "@/constants/homeTheme";
import { cn } from "@/lib/cn";

/**
 * Shell de /checkout: canvas home + content + section.
 * @param {object} props
 * @param {React.ReactNode} props.children
 * @param {string} [props.className]
 * @param {string} [props.pageClassName] — override del contenedor raíz
 * @param {string} [props.sectionClassName] — override del `<section>` interior
 * @param {string} [props.ariaLabel]
 */
export default function CheckoutShell({
  children,
  className,
  pageClassName,
  sectionClassName,
  ariaLabel = "Mi carrito",
}) {
  return (
    <div className={cn(pageClassName ?? CHECKOUT_PAGE_CLASS, className)}>
      <div className={CHECKOUT_CONTENT_CLASS}>
        <section
          className={cn(sectionClassName ?? CHECKOUT_SECTION_CLASS)}
          aria-label={ariaLabel}
        >
          {children}
        </section>
      </div>
    </div>
  );
}
