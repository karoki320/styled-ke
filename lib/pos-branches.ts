/**
 * Which physical till a POS sale was made at. Styled.ke runs two branches
 * (Ufundi, Thogoto) sharing the same admin/pos page — this is what tells
 * them apart in the database and on the analytics dashboard.
 *
 * Persisted the same way as the receipt paper-width setting in
 * lib/pos-printer.ts: a till is physically at one location, so "pick once,
 * remember it" fits better than asking on every sale. Change it from the
 * selector in the POS top bar if a device ever moves branches.
 */

const STORAGE_KEY = "styledke_pos_branch";

export const POS_BRANCHES = ["Ufundi", "Thogoto"] as const;
export type POSBranch = (typeof POS_BRANCHES)[number];

export function getBranch(): POSBranch {
  if (typeof window === "undefined") return POS_BRANCHES[0];
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return (POS_BRANCHES as readonly string[]).includes(stored || "") ? (stored as POSBranch) : POS_BRANCHES[0];
}

export function setBranch(branch: POSBranch) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, branch);
}
