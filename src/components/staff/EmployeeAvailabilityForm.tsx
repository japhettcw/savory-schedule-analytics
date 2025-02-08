
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Clock } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

const availabilitySchema = z.object({
  schedule: z.array(
    z.object({
      day: z.enum(daysOfWeek),
      startTime: z.string(),
      endTime: z.string(),
      isAvailable: z.boolean(),
    })
  ),
});

type AvailabilityFormValues = z.infer<typeof availabilitySchema>;

export function EmployeeAvailabilityForm() {
  const { toast } = useToast();

  const form = useForm<AvailabilityFormValues>({
    resolver: zodResolver(availabilitySchema),
    defaultValues: {
      schedule: daysOfWeek.map((day) => ({
        day,
        startTime: "09:00",
        endTime: "17:00",
        isAvailable: true,
      })),
    },
  });

  const onSubmit = (data: AvailabilityFormValues) => {
    // Here you would typically save this to your backend
    console.log("Availability submitted:", data);
    toast({
      title: "Availability updated",
      description: "Your availability has been successfully updated.",
    });
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Weekly Availability</h2>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {form.watch("schedule").map((day, index) => (
            <div key={day.day} className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="w-24">
                <span className="font-medium">{day.day}</span>
              </div>
              
              <FormField
                control={form.control}
                name={`schedule.${index}.startTime`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`schedule.${index}.endTime`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          ))}
          
          <Button type="submit">Save Availability</Button>
        </form>
      </Form>
    </Card>
  );
}
