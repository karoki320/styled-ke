import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#f8f8f8]">
      <AdminSidebar />
      <div className="flex-1 overflow-y-auto p-5 pt-[76px] sm:p-8 sm:pt-[76px] lg:ml-[230px] lg:pt-8">
        {children}
      </div>
    </div>
  );
}
