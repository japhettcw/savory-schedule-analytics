
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Clock } from "lucide-react";

type ExpirationTrackerProps = {
  items: Array<{
    name: string;
    expiryDate: string;
  }>;
};

export function ExpirationTracker({ items }: ExpirationTrackerProps) {
  const today = new Date();
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(today.getDate() + 7);

  const expiringItems = items.filter((item) => {
    const expiryDate = new Date(item.expiryDate);
    return expiryDate <= sevenDaysFromNow && expiryDate >= today;
  });

  if (expiringItems.length === 0) return null;

  return (
    <Alert className="mb-4">
      <Clock className="h-4 w-4" />
      <AlertTitle>Expiring Soon</AlertTitle>
      <AlertDescription>
        <p>The following items will expire within 7 days:</p>
        <ul className="mt-2 list-disc list-inside">
          {expiringItems.map((item) => (
            <li key={item.name}>
              {item.name} (Expires: {new Date(item.expiryDate).toLocaleDateString()})
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}
