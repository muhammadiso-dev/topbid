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

/**
 * Ustar — ta'lim va IT mutaxassislar reyting platformasi.
 * Barcha "sahifalar" client-side view-lar sifatida bitta routeda ishlaydi.
 */
export default function UstarApp() {
  const view = useUstarStore((s) => s.view);

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
