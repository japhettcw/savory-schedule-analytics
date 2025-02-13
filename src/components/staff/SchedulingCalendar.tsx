
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Card } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface SchedulingCalendarProps {
  events: Array<{
    title: string;
    start: Date;
    end: Date;
    resource: any;
  }>;
  onSelectEvent: (event: any) => void;
}

export function SchedulingCalendar({ events, onSelectEvent }: SchedulingCalendarProps) {
  const isMobile = useIsMobile();

  return (
    <Card className="p-4 sm:p-6 overflow-hidden">
      <div className="h-[500px] sm:h-[600px]">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          defaultView={isMobile ? "day" : "week"}
          views={["month", "week", "day"]}
          tooltipAccessor={(event) => event.resource.notes}
          onSelectEvent={onSelectEvent}
          className="rounded-md touch-pan-y"
        />
      </div>
    </Card>
  );
}
