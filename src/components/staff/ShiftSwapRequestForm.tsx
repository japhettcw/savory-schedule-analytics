
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Shuffle } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const swapRequestSchema = z.object({
  shiftToSwap: z.string(),
  desiredShift: z.string(),
  reason: z.string().min(10, "Please provide a detailed reason for the swap request"),
});

type SwapRequestFormValues = z.infer<typeof swapRequestSchema>;

// Mock data - replace with actual data from your backend
const availableShifts = [
  { id: "1", display: "Monday, March 25 - Morning Shift (8:00 AM - 4:00 PM)" },
  { id: "2", display: "Tuesday, March 26 - Evening Shift (4:00 PM - 12:00 AM)" },
  { id: "3", display: "Wednesday, March 27 - Night Shift (12:00 AM - 8:00 AM)" },
];

export function ShiftSwapRequestForm() {
  const { toast } = useToast();

  const form = useForm<SwapRequestFormValues>({
    resolver: zodResolver(swapRequestSchema),
  });

  const onSubmit = (data: SwapRequestFormValues) => {
    // Here you would typically save this to your backend
    console.log("Swap request submitted:", data);
    toast({
      title: "Request submitted",
      description: "Your shift swap request has been submitted for approval.",
    });
    form.reset();
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Shuffle className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Request Shift Swap</h2>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="shiftToSwap"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Shift</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your shift to swap" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableShifts.map((shift) => (
                      <SelectItem key={shift.id} value={shift.id}>
                        {shift.display}
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
            name="desiredShift"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Desired Shift</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select the shift you want" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableShifts.map((shift) => (
                      <SelectItem key={shift.id} value={shift.id}>
                        {shift.display}
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
            name="reason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reason for Swap</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Please explain why you need to swap this shift"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit">Submit Swap Request</Button>
        </form>
      </Form>
    </Card>
  );
}
