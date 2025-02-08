import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DateRange } from "react-day-picker";
import { Card } from "@/components/ui/card";
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
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
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

export default function Dashboard() {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [view, setView] = useState<string>("weekly");

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', dateRange, view],
    queryFn: () => fetchDashboardData(dateRange, view),
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data",
        variant: "destructive",
      });
    },
  });

  const handleRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
  };

  const handleViewChange = (newView: string) => {
    setView(newView);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
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
        {stats.map((stat) => (
          <Card key={stat.title} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </p>
              <div className="flex items-baseline justify-between">
                <h3 className="text-2xl font-semibold">
                  {isLoading ? "Loading..." : stat.value}
                </h3>
                <div
                  className={`flex items-center gap-1 text-sm ${
                    stat.changeType === "positive" ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {stat.changeType === "positive" ? (
                    <ArrowUpIcon className="h-4 w-4" />
                  ) : (
                    <ArrowDownIcon className="h-4 w-4" />
                  )}
                  {stat.change}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Revenue vs Expenses</h3>
          <div className="h-[300px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <p>Loading chart data...</p>
              </div>
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
              <div className="flex items-center justify-center h-full">
                <p>Loading chart data...</p>
              </div>
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
      </div>
    </div>
  );
}
