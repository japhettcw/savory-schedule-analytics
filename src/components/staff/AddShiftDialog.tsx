
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "../ui/use-toast";

// Define available roles
const ROLES = [
  "Chef",
  "Sous Chef",
  "Line Cook",
  "Waiter",
  "Server",
  "Host",
  "Bartender",
  "Cashier",
  "Manager",
] as const;

// Mock employees data (replace with actual data when integrating with backend)
const EMPLOYEES = [
  { id: 1, name: "John Doe" },
  { id: 2, name: "Jane Smith" },
  { id: 3, name: "Mike Johnson" },
  { id: 4, name: "Sarah Wilson" },
  { id: 5, name: "Tom Brown" },
];

const formSchema = z.object({
  employeeName: z.string().min(2, "Employee name is required"),
  position: z.enum(ROLES, {
    required_error: "Please select a position",
  }),
  date: z.string().min(1, "Date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  notes: z.string().optional(),
});

type AddShiftDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (shift: {
    employeeName: string;
    position: string;
    start: Date;
    end: Date;
    notes?: string;
  }) => void;
  initialData?: {
    employeeName: string;
    position: string;
    start: Date;
    end: Date;
    notes?: string;
  };
};

export function AddShiftDialog({ 
  open, 
  onOpenChange, 
  onSubmit,
  initialData 
}: AddShiftDialogProps) {
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employeeName: initialData?.employeeName || "",
      position: (initialData?.position as typeof ROLES[number]) || undefined,
      date: initialData ? new Date(initialData.start).toISOString().split('T')[0] : "",
      startTime: initialData ? new Date(initialData.start).toTimeString().slice(0, 5) : "",
      endTime: initialData ? new Date(initialData.end).toTimeString().slice(0, 5) : "",
      notes: initialData?.notes || "",
    },
  });

  function handleSubmit(values: z.infer<typeof formSchema>) {
    const startDateTime = new Date(`${values.date}T${values.startTime}`);
    const endDateTime = new Date(`${values.date}T${values.endTime}`);

    if (endDateTime <= startDateTime) {
      toast({
        variant: "destructive",
        title: "Invalid time range",
        description: "End time must be after start time",
      });
      return;
    }

    onSubmit?.({
      employeeName: values.employeeName,
      position: values.position,
      start: startDateTime,
      end: endDateTime,
      notes: values.notes,
    });

    form.reset();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Shift" : "Add New Shift"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="employeeName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {EMPLOYEES.map((employee) => (
                        <SelectItem key={employee.id} value={employee.name}>
                          {employee.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Position</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ROLES.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add any additional notes" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {initialData ? "Update Shift" : "Add Shift"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
