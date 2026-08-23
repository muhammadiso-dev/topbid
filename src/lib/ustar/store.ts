"use client";

import { create } from "zustand";

export type View =
  | { name: "home" }
  | { name: "add-profile" }
  | { name: "profile-detail"; profileId: string }
  | { name: "about" }
  | { name: "rules" }
  | { name: "admin" };

interface UstarState {
  view: View;
  categoryFilter: string; // "all" yoki categoryId
  cityFilter: string; // "all" yoki shahar nomi
  /** Fokuslanadigan profil (yangi qo'shilganda) */
  highlightId: string | null;
  /** Forma ochilganda oldindan tanlanadigan global o'rin */
  addIntentPosition: number | null;
  setView: (view: View) => void;
  goHome: () => void;
  setCategoryFilter: (v: string) => void;
  setCityFilter: (v: string) => void;
  setHighlight: (id: string | null) => void;
  setAddIntentPosition: (pos: number | null) => void;
  openAddForm: (position?: number) => void;
}

export const useUstarStore = create<UstarState>((set) => ({
  view: { name: "home" },
  categoryFilter: "all",
  cityFilter: "all",
  highlightId: null,
  addIntentPosition: null,
  setView: (view) => set({ view }),
  goHome: () => set({ view: { name: "home" }, highlightId: null }),
  setCategoryFilter: (categoryFilter) => set({ categoryFilter }),
  setCityFilter: (cityFilter) => set({ cityFilter }),
  setHighlight: (highlightId) => set({ highlightId }),
  setAddIntentPosition: (addIntentPosition) => set({ addIntentPosition }),
  openAddForm: (position) => set({ view: { name: "add-profile" }, addIntentPosition: position ?? null }),
}));

/** Brauzer sessiya IDsi */
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

/** Edit tokenlar — foydalanuvchi yaratgan/lasimlagan profillar uchun */
const EDIT_TOKENS_KEY = "topbid_edit_tokens";

export function getEditTokens(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(EDIT_TOKENS_KEY) || "{}");
  } catch {
    return {};
  }
}

export function saveEditToken(profileId: string, token: string): void {
  if (typeof window === "undefined") return;
  const tokens = getEditTokens();
  tokens[profileId] = token;
  localStorage.setItem(EDIT_TOKENS_KEY, JSON.stringify(tokens));
}
