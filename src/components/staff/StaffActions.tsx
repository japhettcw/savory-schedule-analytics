
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TimeOffRequestForm } from "@/components/staff/TimeOffRequestForm";
import { ShiftSwapRequestForm } from "@/components/staff/ShiftSwapRequestForm";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";

export function StaffActions() {
  const isMobile = useIsMobile();
  const [isFormsCollapsed, setIsFormsCollapsed] = useState(true);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {isMobile ? (
        <Collapsible
          open={!isFormsCollapsed}
          onOpenChange={setIsFormsCollapsed}
          className="space-y-4"
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="outline"
              className="w-full flex items-center justify-between"
            >
              <span>Staff Actions</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  !isFormsCollapsed ? "transform rotate-180" : ""
                }`}
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4">
            <TimeOffRequestForm />
            <ShiftSwapRequestForm />
          </CollapsibleContent>
        </Collapsible>
      ) : (
        <>
          <TimeOffRequestForm />
          <ShiftSwapRequestForm />
        </>
      )}
    </div>
  );
}
