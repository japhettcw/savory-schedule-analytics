
const initialWasteData: WasteLog[] = [
  {
    id: 1,
    itemName: "Tomato Soup",
    quantity: 2.5,
    unit: "kg",
    date: new Date().toISOString().split('T')[0], // Today
    reason: "expired",
    costImpact: 25.0,
    notes: "Found during weekly inventory check",
  },
  {
    id: 2,
    itemName: "Chicken Breast",
    quantity: 1.8,
    unit: "kg",
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
    reason: "over-prepared",
    costImpact: 18.0,
    notes: "Overestimated dinner service needs",
  },
  {
    id: 3,
    itemName: "Mixed Vegetables",
    quantity: 3.2,
    unit: "kg",
    date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0], // 2 days ago
    reason: "spoiled",
    costImpact: 12.5,
    notes: "Refrigeration issue",
  },
];
