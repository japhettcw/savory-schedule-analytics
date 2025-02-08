
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

type HighWasteItem = {
  name: string;
  wastePercentage: number;
  timeFrame: string;
};

interface HighWasteAlertProps {
  items: HighWasteItem[];
  threshold?: number;
}

export function HighWasteAlert({ items, threshold = 20 }: HighWasteAlertProps) {
  const highWasteItems = items.filter((item) => item.wastePercentage > threshold);

  if (highWasteItems.length === 0) return null;

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>High Waste Alert</AlertTitle>
      <AlertDescription>
        <p>The following items have unusually high waste levels:</p>
        <ul className="mt-2 list-disc list-inside">
          {highWasteItems.map((item) => (
            <li key={item.name}>
              {item.name} ({item.wastePercentage.toFixed(1)}% waste in the last{" "}
              {item.timeFrame})
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}
