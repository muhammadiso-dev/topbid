"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Navbar } from "@/components/ustar/navbar";
import { Footer } from "@/components/ustar/footer";
import { HomeView } from "@/components/ustar/home-view";
import { AddProfileView } from "@/components/ustar/add-profile-view";
import { ProfileDetailView } from "@/components/ustar/profile-detail-view";
import { AboutView } from "@/components/ustar/about-view";
import { RulesView } from "@/components/ustar/rules-view";
import { AdminView } from "@/components/ustar/admin-view";
import { useUstarStore } from "@/lib/ustar/store";
import { useI18nStore } from "@/lib/ustar/i18n";
import type { Lang } from "@/lib/ustar/i18n/constants-lang";

/**
 * TopBid — ta'lim va IT mutaxassislar reyting platformasi.
 * Barcha "sahifalar" client-side view-lar sifatida bitta routeda ishlaydi.
 * Admin panel: ochiq havolada ko'rinmaydi — faqat #admin hash orqali.
 */
export default function TopBidApp() {
  const view = useUstarStore((s) => s.view);
  const setView = useUstarStore((s) => s.setView);
  const setLang = useI18nStore((s) => s.setLang);

  // Tilni localStorage'dan yuklash
  useEffect(() => {
    const saved = localStorage.getItem("topbid_lang") as Lang | null;
    if (saved && ["uz", "ru", "en", "kk"].includes(saved)) {
      setLang(saved);
    }
  }, [setLang]);

  // #admin hash — maxfiy admin kirish
  useEffect(() => {
    const checkHash = () => {
      if (window.location.hash === "#admin") {
        setView({ name: "admin" });
      }
    };
    checkHash();
    window.addEventListener("hashchange", checkHash);
    return () => window.removeEventListener("hashchange", checkHash);
  }, [setView]);

  // Admin'dan chiqsa — hashni tozalash
  useEffect(() => {
    if (view.name !== "admin" && window.location.hash === "#admin") {
      history.replaceState(null, "", window.location.pathname);
    }
  }, [view]);

  // View o'zgarganda tepaga qaytish
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [view]);

  const renderView = () => {
    switch (view.name) {
      case "home":
        return <HomeView key="home" />;
      case "add-profile":
        return <AddProfileView key="add" />;
      case "profile-detail":
        return <ProfileDetailView key={`detail-${view.profileId}`} profileId={view.profileId} />;
      case "about":
        return <AboutView key="about" />;
      case "rules":
        return <RulesView key="rules" />;
      case "admin":
        return <AdminView key="admin" />;
      default:
        return <HomeView key="home-default" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fffdfa]">
      <Navbar />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={view.name === "profile-detail" ? `detail-${view.profileId}` : view.name}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}
