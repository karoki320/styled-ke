import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#f8f8f8]">
      <AdminSidebar />
      <div className="ml-[230px] flex-1 overflow-y-auto p-7 sm:p-8">{children}</div>
    </div>
  );
}
