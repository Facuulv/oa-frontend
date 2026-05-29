import {
  ACCOUNT_CONTENT_CLASS,
  ACCOUNT_PAGE_CLASS,
  ACCOUNT_SECTION_CLASS,
} from "@/constants/homeTheme";
import { cn } from "@/lib/cn";

/**
 * Shell de páginas de cuenta: canvas home + content + section.
 * @param {object} props
 * @param {React.ReactNode} props.children
 * @param {string} [props.className]
 * @param {string} [props.ariaLabel]
 */
export default function AccountShell({
  children,
  className,
  ariaLabel = "Mi cuenta",
}) {
  return (
    <div className={cn(ACCOUNT_PAGE_CLASS, className)}>
      <div className={ACCOUNT_CONTENT_CLASS}>
        <section className={ACCOUNT_SECTION_CLASS} aria-label={ariaLabel}>
          {children}
        </section>
      </div>
    </div>
  );
}
