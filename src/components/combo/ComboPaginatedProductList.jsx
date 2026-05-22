"use client";

import ComboListPagination from "@/components/combo/ComboListPagination";
import { paginateList } from "@/features/combo/combo.constants";

/**
 * Lista paginada de productos Base/Mix (presentacional).
 */
export default function ComboPaginatedProductList({
  items,
  page,
  onPageChange,
  listAnchorRef,
  emptyState,
  children,
}) {
  const { pageItems, totalPages, page: safePage, showPagination } = paginateList(
    items,
    page
  );

  if (items.length === 0) return emptyState;

  return (
    <>
      <div ref={listAnchorRef} className="scroll-mt-24" tabIndex={-1} />
      <div className="space-y-3">{pageItems.map(children)}</div>
      {showPagination && (
        <ComboListPagination
          page={safePage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </>
  );
}
