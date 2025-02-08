
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Bug } from "lucide-react";

type SupplierIssue = {
  supplierName: string;
  itemName: string;
  issueType: string;
  date: string;
};

interface SupplierQualityAlertProps {
  issues: SupplierIssue[];
}

export function SupplierQualityAlert({ issues }: SupplierQualityAlertProps) {
  if (issues.length === 0) return null;

  return (
    <Alert variant="destructive" className="mb-4">
      <Bug className="h-4 w-4" />
      <AlertTitle>Supplier Quality Issues</AlertTitle>
      <AlertDescription>
        <p>Recent quality issues with supplies:</p>
        <ul className="mt-2 list-disc list-inside">
          {issues.map((issue, index) => (
            <li key={index}>
              {issue.supplierName} - {issue.itemName}: {issue.issueType} (
              {new Date(issue.date).toLocaleDateString()})
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}
