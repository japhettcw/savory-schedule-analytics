
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Building2 } from "lucide-react";

type Supplier = {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  lastOrderDate: string;
};

// Mock data - replace with actual data when integrating with backend
const supplierData: Supplier[] = [
  {
    id: "1",
    name: "Fresh Produce Co",
    contact: "John Smith",
    email: "john@freshproduce.co",
    phone: "555-0123",
    lastOrderDate: "2024-03-15",
  },
  {
    id: "2",
    name: "Quality Meats Inc",
    contact: "Sarah Johnson",
    email: "sarah@qualitymeats.com",
    phone: "555-0124",
    lastOrderDate: "2024-03-10",
  },
];

export function SupplierManagement() {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Building2 className="h-5 w-5" />
        <h2 className="text-xl font-semibold">Supplier Management</h2>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Supplier Name</TableHead>
              <TableHead>Contact Person</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Last Order</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {supplierData.map((supplier) => (
              <TableRow key={supplier.id}>
                <TableCell className="font-medium">{supplier.name}</TableCell>
                <TableCell>{supplier.contact}</TableCell>
                <TableCell>{supplier.email}</TableCell>
                <TableCell>{supplier.phone}</TableCell>
                <TableCell>{supplier.lastOrderDate}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
