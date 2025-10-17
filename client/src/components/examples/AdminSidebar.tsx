import AdminSidebar from "../AdminSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function AdminSidebarExample() {
  const style = {
    "--sidebar-width": "16rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-[600px] w-full">
        <AdminSidebar />
        <div className="flex-1 p-8">
          <p className="text-muted-foreground">Admin sidebar navigation</p>
        </div>
      </div>
    </SidebarProvider>
  );
}
