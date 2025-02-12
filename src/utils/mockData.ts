
export const generateMockMetrics = (date: string) => ({
  id: crypto.randomUUID(),
  user_id: 'mock-user-id',
  date: date,
  total_revenue: 5000.00,
  customer_count: 100,
  total_orders: 50,
  total_expenses: 3000.00,
  net_profit: 2000.00,
  created_at: new Date().toISOString()
});
