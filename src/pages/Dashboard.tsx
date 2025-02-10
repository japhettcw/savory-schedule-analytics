import { useState, useEffect } from "react";
import { DateRange } from "react-day-picker";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  LockIcon,
  LayoutGrid,
  LayoutList,
} from "lucide-react";
import { DateRangePicker } from "@/components/dashboard/DateRangePicker";
import { DashboardAlerts } from "@/components/dashboard/DashboardAlerts";
import { UserProfile } from "@/components/dashboard/UserProfile";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { NotificationsCenter } from "@/components/dashboard/NotificationsCenter";
import { Button } from "@/components/ui/button";
import { DailyMetrics } from "@/components/dashboard/DailyMetrics";
import { MetricsChart } from "@/components/dashboard/MetricsChart";
import { ExpenseBreakdown } from "@/components/dashboard/ExpenseBreakdown";
import { TopSellingItems } from "@/components/dashboard/TopSellingItems";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type AccessFeature = "financial" | "inventory" | "waste" | "staff";

const roleAccess: Record<string, AccessFeature[]> = {
  owner: ["financial", "inventory", "waste", "staff"],
  manager: ["inventory", "waste", "staff"],
  staff: ["waste", "staff"],
};

export default function Dashboard() {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [view, setView] = useState<string>("weekly");
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<keyof typeof roleAccess | null>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        
        if (user) {
          setUserId(user.id);
          
          // Fetch user role with maybeSingle() instead of single()
          const { data: roleData, error: roleError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .maybeSingle();
            
          if (roleError) {
            console.error('Error fetching role:', roleError);
            toast({
              title: "Error",
              description: "Failed to fetch user role",
              variant: "destructive",
            });
            return;
          }
          
          if (roleData) {
            setUserRole(roleData.role as keyof typeof roleAccess);
          } else {
            // Handle case where no role is found
            toast({
              title: "No Role Assigned",
              description: "You don't have any role assigned. Please contact an administrator.",
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Authentication Required",
            description: "Please sign in to view metrics",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast({
          title: "Error",
          description: "Failed to fetch user data",
          variant: "destructive",
        });
      }
    };

    getCurrentUser();
  }, [toast]);

  if (!userId || !userRole) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <Card className="p-6 text-center">
          <LockIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
          <p className="text-muted-foreground">
            {!userId ? "Please sign in to view the dashboard" : "No role assigned. Please contact an administrator."}
          </p>
        </Card>
      </div>
    );
  }

  const hasFinancialAccess = roleAccess[userRole]?.includes("financial" as AccessFeature) || false;

  return (
    <div className="space-y-6 p-4 md:p-6 pb-16 max-w-[2000px] mx-auto">
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back to your restaurant overview
          </p>
        </div>
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                {layout === "grid" ? (
                  <LayoutGrid className="h-4 w-4" />
                ) : (
                  <LayoutList className="h-4 w-4" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLayout("grid")}>
                <LayoutGrid className="mr-2 h-4 w-4" />
                Grid Layout
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLayout("list")}>
                <LayoutList className="mr-2 h-4 w-4" />
                List Layout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <NotificationsCenter />
          <UserProfile />
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <QuickActions userRole={userRole} />
        <DateRangePicker
          onRangeChange={setDateRange}
          onViewChange={setView}
        />
      </div>

      <DashboardAlerts />

      <div className="grid gap-6">
        {hasFinancialAccess && <DailyMetrics />}
        
        <div className="grid gap-6 md:grid-cols-2">
          {hasFinancialAccess && <MetricsChart />}
          {hasFinancialAccess && <ExpenseBreakdown />}
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <TopSellingItems />
        </div>
      </div>
    </div>
  );
}
