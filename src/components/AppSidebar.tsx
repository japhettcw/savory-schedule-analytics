
import {
  ChefHat,
  ClipboardList,
  Home,
  Package,
  PieChart,
  Users,
  Settings,
  ChevronRight,
  Menu as MenuIcon,
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
import { useIsMobile } from "@/hooks/use-mobile";
import { FeatureTooltip } from "@/components/ui/feature-tooltip";

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
  {
    title: "Role Management",
    icon: Users,
    path: "/role-management",
    description: "Manage user roles"
  }
];

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  return (
    <Sidebar className="z-50 border-r">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <span className="flex items-center gap-2">
              <MenuIcon className="h-5 w-5" />
              Restaurant Manager
            </span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <FeatureTooltip 
                    content={item.description}
                    className="w-full"
                    showIcon={false}
                  >
                    <SidebarMenuButton
                      onClick={() => navigate(item.path)}
                      className={cn(
                        "group relative flex w-full items-center justify-between px-4 py-3 text-sm transition-all duration-200 ease-in-out",
                        "min-h-[3rem] hover:min-h-[4rem]",
                        "hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md",
                        location.pathname === item.path && "bg-accent"
                      )}
                      role="link"
                      aria-current={location.pathname === item.path ? "page" : undefined}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <item.icon className={cn(
                          "h-5 w-5 flex-shrink-0 transition-colors",
                          location.pathname === item.path ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                        )} />
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="font-medium truncate">{item.title}</span>
                          {!isMobile && (
                            <p className={cn(
                              "text-xs text-muted-foreground line-clamp-2 transition-all",
                              "opacity-0 h-0 group-hover:h-auto group-hover:opacity-100 group-hover:mt-1"
                            )}>
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <ChevronRight className={cn(
                        "h-4 w-4 flex-shrink-0 opacity-0 -translate-x-2 transition-all ml-2",
                        "group-hover:opacity-100 group-hover:translate-x-0",
                        location.pathname === item.path && "opacity-100 translate-x-0"
                      )} />
                    </SidebarMenuButton>
                  </FeatureTooltip>
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
                  <FeatureTooltip 
                    content={item.description}
                    className="w-full"
                    showIcon={false}
                  >
                    <SidebarMenuButton
                      onClick={() => navigate(item.path)}
                      className={cn(
                        "group relative flex w-full items-center justify-between px-4 py-3 text-sm transition-all duration-200 ease-in-out",
                        "min-h-[3rem] hover:min-h-[4rem]",
                        "hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md",
                        location.pathname === item.path && "bg-accent"
                      )}
                      role="link"
                      aria-current={location.pathname === item.path ? "page" : undefined}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <item.icon className={cn(
                          "h-5 w-5 flex-shrink-0 transition-colors",
                          location.pathname === item.path ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                        )} />
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="font-medium truncate">{item.title}</span>
                          {!isMobile && (
                            <p className={cn(
                              "text-xs text-muted-foreground line-clamp-2 transition-all",
                              "opacity-0 h-0 group-hover:h-auto group-hover:opacity-100 group-hover:mt-1"
                            )}>
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <ChevronRight className={cn(
                        "h-4 w-4 flex-shrink-0 opacity-0 -translate-x-2 transition-all ml-2",
                        "group-hover:opacity-100 group-hover:translate-x-0",
                        location.pathname === item.path && "opacity-100 translate-x-0"
                      )} />
                    </SidebarMenuButton>
                  </FeatureTooltip>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
