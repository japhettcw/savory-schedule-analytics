
import {
  ChefHat,
  ClipboardList,
  Home,
  Package,
  PieChart,
  Users,
  Settings,
  ChevronRight,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const menuItems = [
  { 
    title: "Dashboard", 
    icon: Home, 
    path: "/",
    description: "Overview of restaurant performance"
  },
  { 
    title: "Menu", 
    icon: ChefHat, 
    path: "/menu",
    description: "Manage menu items and categories"
  },
  { 
    title: "Inventory", 
    icon: Package, 
    path: "/inventory",
    description: "Track and manage stock levels"
  },
  { 
    title: "Waste Analytics", 
    icon: PieChart, 
    path: "/waste",
    description: "Monitor and reduce food waste"
  },
  { 
    title: "Staff Scheduling", 
    icon: Users, 
    path: "/staff",
    description: "Manage employee schedules"
  },
];

const accountItems = [
  { 
    title: "Profile", 
    icon: Settings, 
    path: "/profile",
    description: "Manage your account"
  },
];

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Restaurant Manager</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.path)}
                    className={cn(
                      "group flex items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-accent rounded-md",
                      location.pathname === item.path && "bg-accent"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={cn(
                        "h-5 w-5 transition-colors",
                        location.pathname === item.path ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                      )} />
                      <div>
                        <span className="font-medium">{item.title}</span>
                        <p className="text-xs text-muted-foreground hidden group-hover:block">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.path)}
                    className={cn(
                      "group flex items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-accent rounded-md",
                      location.pathname === item.path && "bg-accent"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={cn(
                        "h-5 w-5 transition-colors",
                        location.pathname === item.path ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                      )} />
                      <div>
                        <span className="font-medium">{item.title}</span>
                        <p className="text-xs text-muted-foreground hidden group-hover:block">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
