
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 p-6 transition-all duration-200 ease-in-out">
          <nav className="mb-6 flex items-center justify-between">
            <SidebarTrigger />
          </nav>
          <div className="animate-fade-in">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
