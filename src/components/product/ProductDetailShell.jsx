import {
  PRODUCT_DETAIL_CONTENT_CLASS,
  PRODUCT_DETAIL_PAGE_CLASS,
  PRODUCT_DETAIL_SECTION_CLASS,
} from "@/constants/homeTheme";
import { cn } from "@/lib/cn";

/**
 * Shell de /producto/[slug]: canvas home + content + section.
 * @param {object} props
 * @param {React.ReactNode} [props.hero] — bloque full-bleed mobile (imagen) fuera del padding del content
 * @param {React.ReactNode} props.children
 * @param {string} [props.className]
 * @param {string} [props.ariaLabel]
 */
export default function ProductDetailShell({ hero, children, className, ariaLabel }) {
  return (
    <div className={cn(PRODUCT_DETAIL_PAGE_CLASS, className)}>
      {hero}
      <div className={PRODUCT_DETAIL_CONTENT_CLASS}>
        <section className={PRODUCT_DETAIL_SECTION_CLASS} aria-label={ariaLabel}>
          {children}
        </section>
      </div>
    </div>
  );
}
