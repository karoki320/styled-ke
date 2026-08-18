import { AnnouncementBar } from "@/components/store/AnnouncementBar";
import { NavBar } from "@/components/store/NavBar";
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
      {children}
      <Footer />
      <WhatsAppFloat />
      <ChatBot />
      <CartDrawer />
      <ToastStack />
    </div>
  );
}
