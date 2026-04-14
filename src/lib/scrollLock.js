/**
 * Lock/unlock body scroll. Supports multiple concurrent lockers.
 * Only restores overflow when all locks are released.
 */
let lockCount = 0;

export function lockBodyScroll() {
  lockCount++;
  document.body.style.overflow = "hidden";
}

export function unlockBodyScroll() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    document.body.style.overflow = "";
  }
}
