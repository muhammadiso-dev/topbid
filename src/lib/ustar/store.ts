"use client";

import { create } from "zustand";
import type { Pool } from "./constants";

export type View =
  | { name: "home" }
  | { name: "add-profile" }
  | { name: "profile-detail"; profileId: string }
  | { name: "about" }
  | { name: "rules" }
  | { name: "admin" };

interface UstarState {
  view: View;
  pool: Pool;
  /** education: "all" | "center" | "individual" */
  eduSubFilter: string;
  categoryFilter: string; // "all" yoki categoryId
  cityFilter: string; // "all" yoki shahar nomi
  /** Fokuslanadigan profil (yangi qo'shilganda) */
  highlightId: string | null;
  /** Forma ochilganda oldindan tanlanadigan global o'rin */
  addIntentPosition: number | null;
  setView: (view: View) => void;
  goHome: () => void;
  setPool: (pool: Pool) => void;
  setEduSubFilter: (v: string) => void;
  setCategoryFilter: (v: string) => void;
  setCityFilter: (v: string) => void;
  setHighlight: (id: string | null) => void;
  setAddIntentPosition: (pos: number | null) => void;
  openAddForm: (position?: number) => void;
}

export const useUstarStore = create<UstarState>((set) => ({
  view: { name: "home" },
  pool: "education",
  eduSubFilter: "all",
  categoryFilter: "all",
  cityFilter: "all",
  highlightId: null,
  addIntentPosition: null,
  setView: (view) => set({ view }),
  goHome: () => set({ view: { name: "home" }, highlightId: null }),
  setPool: (pool) => set({ pool, categoryFilter: "all", eduSubFilter: "all" }),
  setEduSubFilter: (eduSubFilter) => set({ eduSubFilter }),
  setCategoryFilter: (categoryFilter) => set({ categoryFilter }),
  setCityFilter: (cityFilter) => set({ cityFilter }),
  setHighlight: (highlightId) => set({ highlightId }),
  setAddIntentPosition: (addIntentPosition) => set({ addIntentPosition }),
  openAddForm: (position) =>
    set({ view: { name: "add-profile" }, addIntentPosition: position ?? null }),
}));

/** Brauzer sessiya IDsi (anonim foydalanuvchi identifikatori) */
export function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let sid = localStorage.getItem("topbid_session_id");
  if (!sid) {
    sid =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `sid_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem("topbid_session_id", sid);
  }
  return sid;
}
