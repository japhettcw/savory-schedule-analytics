
import { useState, useTransition } from "react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRoleGuard, AppRole } from "@/hooks/use-role-guard";

type AccessFeature = "financial" | "inventory" | "waste" | "staff";

const roleAccess: Record<AppRole, AccessFeature[]> = {
  owner: ["financial", "inventory", "waste", "staff"],
  manager: ["inventory", "waste", "staff"],
  staff: ["waste", "staff"],
};

export default function Dashboard() {
  console.log('Rendering Dashboard component');
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [view, setView] = useState<string>("weekly");
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const { isLoading, userRole } = useRoleGuard();
  const [isPending, startTransition] = useTransition();

  const handleDateRangeChange = (range: DateRange | undefined) => {
    startTransition(() => {
      setDateRange(range);
    });
  };

  const handleViewChange = (newView: string) => {
    startTransition(() => {
      setView(newView);
    });
  };

  const handleLayoutChange = (newLayout: "grid" | "list") => {
    startTransition(() => {
      setLayout(newLayout);
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-48" />
          <div className="h-8 bg-muted rounded w-64" />
        </div>
      </div>
    );
  }

  if (!userRole) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <Card className="p-6 text-center max-w-md w-full bg-background shadow-lg">
          <LockIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">No Role Assigned</h2>
          <p className="text-muted-foreground">
            Please contact an administrator to get a role assigned.
          </p>
        </Card>
      </div>
    );
  }

  const hasFinancialAccess = roleAccess[userRole]?.includes("financial");

  console.log('Rendering main dashboard content');

  return (
    <div className="relative space-y-4 sm:space-y-6 p-4 md:p-6 pb-16 max-w-[2000px] mx-auto bg-background">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back to your restaurant overview
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9 relative z-20">
                {layout === "grid" ? (
                  <LayoutGrid className="h-4 w-4" />
                ) : (
                  <LayoutList className="h-4 w-4" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover border shadow-lg">
              <DropdownMenuItem onClick={() => handleLayoutChange("grid")}>
                <LayoutGrid className="mr-2 h-4 w-4" />
                Grid Layout
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleLayoutChange("list")}>
                <LayoutList className="mr-2 h-4 w-4" />
                List Layout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <NotificationsCenter />
          <UserProfile />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10 bg-background">
        <div className="w-full sm:w-auto">
          <QuickActions userRole={userRole} />
        </div>
        <div className="w-full sm:w-auto">
          <DateRangePicker
            onRangeChange={handleDateRangeChange}
            onViewChange={handleViewChange}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6 relative">
        {/* KPI Metrics */}
        <div className="w-full">
          <Card className="bg-card shadow-lg border">
            <DailyMetrics />
          </Card>
        </div>

        {/* Business Health Check - Explicitly placed and styled */}
        <div className="w-full">
          <Card className="bg-card shadow-lg border">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Business Health Check</h2>
              <DashboardAlerts />
            </div>
          </Card>
        </div>

        {/* Charts Section */}
        {hasFinancialAccess && (
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
            <Card className="bg-card shadow-lg border">
              <MetricsChart />
            </Card>
            <Card className="bg-card shadow-lg border">
              <ExpenseBreakdown />
            </Card>
          </div>
        )}
        
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          <Card className="bg-card shadow-lg border">
            <TopSellingItems />
          </Card>
        </div>
      </div>
    </div>
  );
}
