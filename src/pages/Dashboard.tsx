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
import { ArrowDownIcon, ArrowUpIcon, LockIcon } from "lucide-react";
import { DateRangePicker } from "@/components/dashboard/DateRangePicker";
import { DashboardAlerts } from "@/components/dashboard/DashboardAlerts";

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
  const userRole = "owner";

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

  const handleRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
  };

  const handleViewChange = (newView: string) => {
    setView(newView);
  };

  if (error) {
    return (
      <div className="p-6 bg-destructive/10 rounded-lg">
        <h2 className="text-lg font-semibold text-destructive">Error Loading Dashboard</h2>
        <p className="text-muted-foreground">Please try refreshing the page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight" tabIndex={0}>Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back to your restaurant overview
        </p>
      </div>

      <DateRangePicker
        onRangeChange={handleRangeChange}
        onViewChange={handleViewChange}
      />

      {data?.alerts && <DashboardAlerts alerts={data.alerts} />}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
              className="p-6 hover:shadow-lg transition-shadow"
              role="region"
              aria-label={`${stat.title} statistics`}
            >
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>
                <div className="flex items-baseline justify-between">
                  <h3 className="text-2xl font-semibold">
                    {stat.value}
                  </h3>
                  <div
                    className={`flex items-center gap-1 text-sm ${
                      stat.changeType === "positive" ? "text-green-500" : "text-red-500"
                    }`}
                    role="status"
                    aria-label={`${stat.change} ${stat.description}`}
                  >
                    {stat.changeType === "positive" ? (
                      <ArrowUpIcon className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <ArrowDownIcon className="h-4 w-4" aria-hidden="true" />
                    )}
                    {stat.change}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </div>
            </Card>
          ))
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {userRole === "owner" ? (
          <>
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Revenue vs Expenses</h3>
              <div className="h-[300px]">
                {isLoading ? (
                  <ChartSkeleton />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData}>
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
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#059669"
                        fillOpacity={1}
                        fill="url(#revenue)"
                      />
                      <Area
                        type="monotone"
                        dataKey="expenses"
                        stroke="#ef4444"
                        fillOpacity={1}
                        fill="url(#expenses)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Top Selling Items</h3>
              <div className="h-[300px]">
                {isLoading ? (
                  <ChartSkeleton />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={topSellingItems}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {topSellingItems.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
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
