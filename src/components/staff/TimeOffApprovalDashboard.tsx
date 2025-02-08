
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { useState } from "react";

type TimeOffRequest = {
  id: number;
  employeeName: string;
  startDate: string;
  endDate: string;
  type: "vacation" | "sick" | "personal";
  reason: string;
  status: "pending" | "approved" | "rejected";
};

// Mock data for development
const mockRequests: TimeOffRequest[] = [
  {
    id: 1,
    employeeName: "John Doe",
    startDate: "2024-03-20",
    endDate: "2024-03-25",
    type: "vacation",
    reason: "Family vacation",
    status: "pending",
  },
  {
    id: 2,
    employeeName: "Jane Smith",
    startDate: "2024-03-22",
    endDate: "2024-03-23",
    type: "sick",
    reason: "Doctor's appointment",
    status: "approved",
  },
];

export function TimeOffApprovalDashboard() {
  const [requests, setRequests] = useState<TimeOffRequest[]>(mockRequests);
  const { toast } = useToast();

  const handleApprove = (id: number) => {
    setRequests(requests.map(request =>
      request.id === id ? { ...request, status: "approved" } : request
    ));
    toast({
      title: "Request approved",
      description: "The time off request has been approved.",
    });
  };

  const handleReject = (id: number) => {
    setRequests(requests.map(request =>
      request.id === id ? { ...request, status: "rejected" } : request
    ));
    toast({
      title: "Request rejected",
      description: "The time off request has been rejected.",
    });
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Time Off Requests</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {requests.filter(r => r.status === "pending").length} pending requests
          </span>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>{request.employeeName}</TableCell>
                <TableCell className="capitalize">{request.type}</TableCell>
                <TableCell>{request.startDate}</TableCell>
                <TableCell>{request.endDate}</TableCell>
                <TableCell>{request.reason}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm ${
                    request.status === "approved" 
                      ? "bg-green-100 text-green-700" 
                      : request.status === "rejected"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {request.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  {request.status === "pending" && (
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(request.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(request.id)}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
