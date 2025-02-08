
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, Clock } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const timeOffSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  reason: z.string().min(10, "Please provide a detailed reason"),
  type: z.enum(["vacation", "sick", "personal"]),
});

type TimeOffFormValues = z.infer<typeof timeOffSchema>;

export function TimeOffRequestForm() {
  const { toast } = useToast();

  const form = useForm<TimeOffFormValues>({
    resolver: zodResolver(timeOffSchema),
    defaultValues: {
      type: "vacation",
    },
  });

  const onSubmit = (data: TimeOffFormValues) => {
    // Here you would typically save this to your backend
    console.log("Time off request submitted:", data);
    toast({
      title: "Request submitted",
      description: "Your time off request has been submitted for approval.",
    });
    form.reset();
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Request Time Off</h2>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type of Leave</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="vacation">Vacation</option>
                    <option value="sick">Sick Leave</option>
                    <option value="personal">Personal Leave</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="reason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reason</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Please provide details about your time off request"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit">Submit Request</Button>
        </form>
      </Form>
    </Card>
  );
}
