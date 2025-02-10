import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { DateRange } from "react-day-picker";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { 
  ArrowDownIcon, 
  ArrowUpIcon, 
  LockIcon,
  CalendarIcon,
  FileTextIcon,
  ChartBarIcon,
  PlusIcon,
  LayoutGrid,
  LayoutList,
} from "lucide-react";
import { DateRangePicker } from "@/components/dashboard/DateRangePicker";
import { DashboardAlerts } from "@/components/dashboard/DashboardAlerts";
import { UserProfile } from "@/components/dashboard/UserProfile";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { NotificationsCenter } from "@/components/dashboard/NotificationsCenter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const revenueData = [
  { name: 'Mon', revenue: 4000, expenses: 2400 },
  { name: 'Tue', revenue: 3000, expenses: 1398 },
  { name: 'Wed', revenue: 2000, expenses: 1800 },
  { name: 'Thu', revenue: 2780, expenses: 2908 },
  { name: 'Fri', revenue: 1890, expenses: 1800 },
  { name: 'Sat', revenue: 2390, expenses: 2800 },
  { name: 'Sun', revenue: 3490, expenses: 2300 },
];

const topSellingItems = [
  { name: 'Pizza', value: 400 },
  { name: 'Burger', value: 300 },
  { name: 'Pasta', value: 300 },
  { name: 'Salad', value: 200 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const stats = [
  {
    title: "Total Revenue",
    value: "$12,345",
    change: "+12.3%",
    changeType: "positive",
    description: "vs. last week",
  },
  {
    title: "Total Expenses",
    value: "$8,234",
    change: "+5.2%",
    changeType: "negative",
    description: "vs. last week",
  },
  {
    title: "Net Profit",
    value: "$4,111",
    change: "+8.1%",
    changeType: "positive",
    description: "vs. last week",
  },
  {
    title: "Orders Today",
    value: "156",
    change: "+12",
    changeType: "positive",
    description: "vs. yesterday",
  },
];

const fetchDashboardData = async (dateRange: DateRange | undefined, view: string) => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    revenueData,
    topSellingItems,
    stats,
    alerts: [
      {
        id: '1',
        title: 'Low Stock Alert',
        description: 'Tomatoes inventory is running low (2 kg remaining)',
        type: 'warning' as const,
      },
      {
        id: '2',
        title: 'High Waste Detected',
        description: 'Waste percentage exceeded 10% threshold this week',
        type: 'error' as const,
      },
    ],
  };
};

const KPISkeleton = () => (
  <div className="space-y-2">
    <Skeleton className="h-4 w-1/4" />
    <Skeleton className="h-8 w-1/2" />
    <Skeleton className="h-4 w-1/3" />
  </div>
);

const ChartSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-[300px] w-full" />
  </div>
);

const roleAccess = {
  owner: ["financial", "inventory", "waste", "staff"],
  manager: ["inventory", "waste", "staff"],
  staff: ["waste", "staff"],
};

export default function Dashboard() {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [view, setView] = useState<string>("weekly");
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const userRole = "owner"; // This should come from your auth context

  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard', dateRange, view],
    queryFn: () => fetchDashboardData(dateRange, view),
    refetchInterval: 5 * 60 * 1000,
    meta: {
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to fetch dashboard data",
          variant: "destructive",
        });
      },
    },
  });

  const filteredStats = useMemo(() => {
    if (!data?.stats) return [];
    return data.stats.filter(stat => {
      if (userRole === "owner") return true;
      if (userRole === "manager" && !stat.title.toLowerCase().includes("revenue")) return true;
      if (userRole === "staff" && stat.title === "Orders Today") return true;
      return false;
    });
  }, [data?.stats, userRole]);

  if (error) {
    return (
      <div className="p-6 bg-destructive/10 rounded-lg">
        <h2 className="text-lg font-semibold text-destructive">Error Loading Dashboard</h2>
        <p className="text-muted-foreground">Please try refreshing the page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 pb-16">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
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

      {data?.alerts && <DashboardAlerts alerts={data.alerts} />}

      <div className={`grid gap-6 ${layout === "grid" ? "md:grid-cols-2 lg:grid-cols-4" : "grid-cols-1"}`}>
        {isLoading ? (
          Array(4).fill(0).map((_, i) => (
            <Card key={i} className="p-6">
              <KPISkeleton />
            </Card>
          ))
        ) : (
          filteredStats.map((stat) => (
            <Card 
              key={stat.title} 
              className="p-6 hover:shadow-lg transition-shadow animate-fade-in"
              role="region"
              aria-label={`${stat.title} statistics`}
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <div
                    className={`flex items-center gap-1 text-sm ${
                      stat.changeType === "positive" ? "text-green-500" : "text-red-500"
                    }`}
                    role="status"
                    aria-label={`${stat.change} ${stat.description}`}
                  >
                    {stat.changeType === "positive" ? (
                      <ArrowUpIcon className="h-4 w-4" />
                    ) : (
                      <ArrowDownIcon className="h-4 w-4" />
                    )}
                    {stat.change}
                  </div>
                </div>
                <h3 className="text-2xl font-semibold tracking-tight">
                  {stat.value}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </div>
            </Card>
          ))
        )}
      </div>

      <div className={`grid gap-6 ${layout === "grid" ? "md:grid-cols-2" : "grid-cols-1"}`}>
        {userRole === "owner" ? (
          <>
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Revenue vs Expenses</h3>
              <div className="h-[400px]">
                {isLoading ? (
                  <ChartSkeleton />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData} className="animate-fade-in">
                      <defs>
                        <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#059669" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="expenses" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #e5e7eb',
                          borderRadius: '0.5rem',
                        }} 
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#059669"
                        fillOpacity={1}
                        fill="url(#revenue)"
                        name="Revenue"
                      />
                      <Area
                        type="monotone"
                        dataKey="expenses"
                        stroke="#ef4444"
                        fillOpacity={1}
                        fill="url(#expenses)"
                        name="Expenses"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Top Selling Items</h3>
              <div className="h-[400px]">
                {isLoading ? (
                  <ChartSkeleton />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart className="animate-fade-in">
                      <Pie
                        data={topSellingItems}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {topSellingItems.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS[index % COLORS.length]} 
                            className="hover:opacity-80 transition-opacity"
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #e5e7eb',
                          borderRadius: '0.5rem',
                        }} 
                      />
                      <Legend 
                        verticalAlign="bottom" 
                        height={36}
                        formatter={(value) => <span className="text-sm">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>
          </>
        ) : (
          <Card className="col-span-2 p-6 flex items-center justify-center">
            <div className="text-center space-y-2">
              <LockIcon className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="text-lg font-medium">Financial data is restricted</p>
              <p className="text-sm text-muted-foreground">Contact an owner for access</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
