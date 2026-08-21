import { AnnouncementBar } from "@/components/store/AnnouncementBar";
import { NavBar } from "@/components/store/NavBar";
import { BottomNav } from "@/components/store/BottomNav";
import { Footer } from "@/components/store/Footer";
import { CartDrawer } from "@/components/store/CartDrawer";
import { WhatsAppFloat } from "@/components/store/WhatsAppFloat";
import { ChatBot } from "@/components/store/ChatBot";
import { ToastStack } from "@/components/ui/ToastStack";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="paper-canvas min-h-screen">
      <AnnouncementBar />
      <NavBar />
      {/* pb-[60px] reserves space for the fixed BottomNav on mobile so it
          never overlaps the footer or the last bit of page content —
          matches the nav's own h-[60px]. Not needed on desktop, where
          BottomNav doesn't render at all. */}
      <div className="pb-[60px] lg:pb-0">
        {children}
        <Footer />
      </div>
      <WhatsAppFloat />
      <ChatBot />
      <CartDrawer />
      <BottomNav />
      <ToastStack />
    </div>
  );
}
